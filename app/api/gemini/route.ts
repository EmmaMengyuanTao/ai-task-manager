import OpenAI from "openai";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { projects, projectMembers, users, profiles, userSkills, skills, generatedSubtasks } from "@/database/schema";
import { getAllSkills } from "@/lib/skills";
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await request.json();

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        // Get project information
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId),
            with: {
                members: {
                    with: {
                        user: {
                            with: {
                                profile: true,
                                userSkills: {
                                    with: {
                                        skill: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Format member data
        const membersData = project.members.map(member => ({
            name: member.user.name,
            description: member.user.profile?.description || "",
            skills: member.user.userSkills.map(us => us.skill.name)
        }));

        // Get predefined skills
        const predefinedSkills = getAllSkills();

        // Prepare prompt for OpenAI
        const prompt = `
        You are a project management assistant. Your task is to analyze the project and team information, then break it down into subtasks with appropriate assignments.

        Project Description: ${project.description || "No description provided"}
        
        Team Members:
        ${membersData.map(member => `
        - ${member.name}
          Description: ${member.description}
          Skills: ${member.skills.join(", ")}
        `).join("\n")}
        
        Available Skills: ${predefinedSkills.join(", ")}
        
        Please analyze this information and provide a JSON response with the following structure:
        {
            "subtasks": [
                {
                    "title": "subtask title",
                    "description": "subtask description",
                    "requiredSkills": ["skill1", "skill2"],
                    "assignedMembers": ["member1", "member2"],
                    "reasoning": "brief explanation"
                }
            ]
        }

        Important:
        1. Your response must be valid JSON
        2. Do not include any text outside the JSON structure
        3. Ensure all strings are properly quoted
        4. Do not include markdown formatting
        5. The response should be parseable by JSON.parse()
        `;

        console.log("Sending prompt to OpenAI:", prompt);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.2,
            top_p: 0.8,
        });

        const text = completion.choices[0].message.content || "";

        console.log("Received response from OpenAI:", text);

        // Clean the response text to ensure it's valid JSON
        const cleanedText = text.trim()
            .replace(/^```json\s*/, '')  // Remove ```json if present
            .replace(/```\s*$/, '')      // Remove trailing ```
            .trim();

        // Parse the response and return
        try {
            const parsedResponse = JSON.parse(cleanedText);

            // Save the generated subtasks to the database
            const insertedRows = await db.insert(generatedSubtasks)
                .values({
                    projectId: projectId,
                    subtasks: JSON.stringify(parsedResponse.subtasks)
                })
                .returning({ id: generatedSubtasks.id });

            const insertedId = insertedRows[0]?.id;

            return NextResponse.json({
                id: insertedId,
                subtasks: parsedResponse.subtasks
            });
        } catch (error) {
            console.error("Error parsing OpenAI response:", error);
            console.error("Raw response:", cleanedText);
            return NextResponse.json({
                error: "Failed to parse AI response",
                details: error instanceof Error ? error.message : "Unknown error",
                rawResponse: cleanedText
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Error in OpenAI API route:", error);
        return NextResponse.json({
            error: "Internal server error",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}