// actions/profileActions.ts
"use server"

import { db } from "@/database/db"
import { profiles, skills as skillsTable, userSkills, users } from "@/database/schema"
import { eq, and, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache" // To refresh data on the profile page
import { auth } from "@/lib/auth"
import crypto from 'crypto'; // Ensure crypto is imported
import { headers } from 'next/headers'; // Import headers

interface UpdateProfilePayload {
    userId: string
    name: string | null
    skills: string[] // Array of skill names from the form
    description: string | null
}

export async function updateProfileAndSkills(
    payload: UpdateProfilePayload
): Promise<{ success: boolean; error?: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session.user.id !== payload.userId) {
        console.warn("[Action Warn] Unauthorized attempt to update profile."); // Added log
        return { success: false, error: "Unauthorized." };
    }

    const { userId, name, skills: formSkills, description } = payload
    console.log(`[Action] Starting update for userId: ${userId}, name: ${name}, skills: ${formSkills.join(', ')}, description: ${description}`); // Enhanced log

    try {
        let profileId: string;
        console.log(`[Action] Looking for existing profile for userId: ${userId}`);
        const existingProfile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
            columns: { id: true }
        });

        if (existingProfile) {
            profileId = existingProfile.id;
            console.log(`[Action] Found existing profileId: ${profileId}. Updating name to: ${name ?? 'null'}`); // Enhanced log
            await db.update(profiles)
                .set({
                    name: name ?? null,
                    description: payload.description ?? null,
                    updatedAt: new Date()
                })
                .where(eq(profiles.id, profileId));
            console.log(`[Action] Profile name updated for profileId: ${profileId}`);
        } else {
            const newProfileId = crypto.randomUUID();
            profileId = newProfileId;
            console.log(`[Action] No existing profile. Attempting to create new profile with id: ${newProfileId} for userId: ${userId}, name: ${name ?? 'null'}`); // Enhanced log
            await db.insert(profiles).values({
                id: newProfileId,
                userId: userId,
                name: name ?? null,
                description: description ?? null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            // Check if insert really worked (optional, might require fetching back)
            // const checkInsert = await db.query.profiles.findFirst({ where: eq(profiles.id, newProfileId), columns: { id: true } });
            // console.log(`[Action] Verification fetch after insert for ${newProfileId}: ${checkInsert ? 'Found' : 'NOT FOUND'}`);
            console.log(`[Action] Assumed successful insert for new profile with id: ${newProfileId}`); // Modified log slightly
        }

        console.log(`[Action] Proceeding to handle skills for userId: ${userId} and profileId: ${profileId}`); // Added profileId here
        // --- Handle Skills (Add detailed logs here too if needed) ---
        // Get current user skills from DB (skill IDs and names)
        const currentUserSkills = await db.query.userSkills.findMany({
            where: eq(userSkills.userId, userId),
            with: {
                skill: { columns: { id: true, name: true } },
            },
        })
        const currentSkillNames = currentUserSkills.map(us => us.skill.name)
        const currentSkillIds = currentUserSkills.map(us => us.skill.id)

        // Determine skills to add and remove based on names
        const skillsToAddNames = formSkills.filter(name => !currentSkillNames.includes(name))
        const skillsToRemoveNames = currentSkillNames.filter(name => !formSkills.includes(name))

        // --- 2a. Remove Skills ---
        if (skillsToRemoveNames.length > 0) {
            console.log(`[Action] Removing skills: ${skillsToRemoveNames.join(', ')}`);
            const skillsToRemoveIds = currentUserSkills
                .filter(us => skillsToRemoveNames.includes(us.skill.name))
                .map(us => us.skill.id)

            if (skillsToRemoveIds.length > 0) {
                await db.delete(userSkills).where(and(
                    eq(userSkills.userId, userId),
                    inArray(userSkills.skillId, skillsToRemoveIds)
                ))
            }
        }

        // --- 2b. Add Skills ---
        if (skillsToAddNames.length > 0) {
            console.log(`[Action] Adding skills: ${skillsToAddNames.join(', ')}`);
            // Find existing skill IDs for the names to add
            const existingSkills = await db.select({ id: skillsTable.id, name: skillsTable.name })
                .from(skillsTable)
                .where(inArray(skillsTable.name, skillsToAddNames));

            const existingSkillIdsMap = new Map(existingSkills.map(s => [s.name, s.id]));
            const skillsToAddIds: number[] = [];
            const newSkillsToCreate: { name: string }[] = [];

            // Separate existing skills from brand new ones
            for (const name of skillsToAddNames) {
                const existingId = existingSkillIdsMap.get(name);
                if (existingId) {
                    skillsToAddIds.push(existingId);
                } else {
                    // Only add if not already marked for creation to avoid duplicates if user enters same new skill twice
                    if (!newSkillsToCreate.some(s => s.name === name)) {
                        newSkillsToCreate.push({ name });
                    }
                }
            }

            // Create brand new skills in the skills table if any
            if (newSkillsToCreate.length > 0) {
                console.log(`[Action] Creating new skill entries in 'skills' table: ${newSkillsToCreate.map(s => s.name).join(', ')}`);
                const createdSkills = await db.insert(skillsTable)
                    .values(newSkillsToCreate)
                    .returning({ id: skillsTable.id });
                skillsToAddIds.push(...createdSkills.map(s => s.id));
            }

            // Add entries to the userSkills junction table
            if (skillsToAddIds.length > 0) {
                const alreadyLinkedSkillIds = currentUserSkills
                    .filter(us => skillsToAddIds.includes(us.skill.id))
                    .map(us => us.skill.id);
                const finalSkillIdsToAdd = skillsToAddIds.filter(id => !alreadyLinkedSkillIds.includes(id));

                if (finalSkillIdsToAdd.length > 0) {
                    console.log(`[Action] Inserting into 'userSkills' for skill IDs: ${finalSkillIdsToAdd.join(', ')}`);
                    await db.insert(userSkills).values(
                        finalSkillIdsToAdd.map(skillId => ({
                            userId: userId,
                            skillId: skillId,
                            level: 0, // Default level, adjust if needed
                            updatedAt: new Date()
                        }))
                    );
                }
            }
        }

        console.log(`[Action] Skill handling complete for userId: ${userId}.`); // Added userId

        console.log(`[Action] Revalidating path /profile`);
        revalidatePath("/profile");
        console.log(`[Action] Update process finished successfully for userId: ${userId}.`);
        return { success: true };

    } catch (error) {
        console.error(`[Action Error] Error during profile/skill update for userId: ${payload.userId}:`, error); // Enhanced log
        return { success: false, error: "Database operation failed during profile update." };
    }
}