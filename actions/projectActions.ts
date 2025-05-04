"use server"

import { db } from "@/database/db"
import { projects, projectMembers, users } from "@/database/schema"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { headers } from 'next/headers'

// Create project
interface CreateProjectPayload {
    name: string
    description: string
    creatorId: string
    deadline?: Date | null
}

// Update project name
interface UpdateProjectNamePayload {
    projectId: number
    name: string
    userId: string
}

// Update project description
interface UpdateProjectDescriptionPayload {
    projectId: number
    description: string
    userId: string
}

export async function updateProjectName({ projectId, name, userId }: UpdateProjectNamePayload) {
    try {
        // Verify user has permission to update
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId)
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (project.creatorId !== userId) {
            return { success: false, error: "You don't have permission to update this project" }
        }

        // Update project name
        await db.update(projects)
            .set({ name })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating project name:", error)
        return { success: false, error: "Failed to update project name" }
    }
}

export async function updateProjectDescription({ projectId, description, userId }: UpdateProjectDescriptionPayload) {
    try {
        // Verify user has permission to update
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId)
        })

        if (!project) {
            return { success: false, error: "Project not found" }
        }

        if (project.creatorId !== userId) {
            return { success: false, error: "You don't have permission to update this project" }
        }

        // Update project description
        await db.update(projects)
            .set({ description })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Error updating project description:", error)
        return { success: false, error: "Failed to update project description" }
    }
}

export async function createProject(
    payload: CreateProjectPayload
): Promise<{ success: boolean; error?: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session.user.id !== payload.creatorId) {
        return { success: false, error: "Unauthorized operation" };
    }

    const { name, description, creatorId, deadline } = payload

    try {
        // Insert project
        const [newProject] = await db.insert(projects).values({
            name,
            description,
            creatorId,
            deadline: deadline ?? null,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning({ id: projects.id });

        // Creator automatically becomes a project member
        await db.insert(projectMembers).values({
            userId: creatorId,
            projectId: newProject.id,
            role: "creator",
            joinedAt: new Date()
        });

        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to create project:", error);
        return { success: false, error: "An error occurred during project creation" };
    }
}

// Invite user to project
interface InviteUserPayload {
    projectId: number
    email: string
    role?: string
}

export async function inviteUserToProject(
    payload: InviteUserPayload
): Promise<{ success: boolean; error?: string; message?: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return { success: false, error: "Unauthorized operation" };
    }

    const { projectId, email, role = "member" } = payload

    try {
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId),
            columns: { creatorId: true }
        });

        if (!project) {
            return { success: false, error: "Project does not exist" };
        }

        const isCreator = project.creatorId === session.user.id;
        const isAdmin = await db.query.projectMembers.findFirst({
            where: and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.userId, session.user.id),
                eq(projectMembers.role, "admin")
            )
        });

        if (!isCreator && !isAdmin) {
            return { success: false, error: "You don't have permission to invite members" };
        }

        // Find invited user
        const invitedUser = await db.query.users.findFirst({
            where: eq(users.email, email),
            columns: { id: true }
        });

        if (!invitedUser) {
            return { success: false, error: "User with this email does not exist" };
        }

        // Check if user is already in the project
        const existingMember = await db.query.projectMembers.findFirst({
            where: and(
                eq(projectMembers.projectId, projectId),
                eq(projectMembers.userId, invitedUser.id)
            )
        });

        if (existingMember) {
            return { success: false, error: "This user is already a project member" };
        }

        // Add user to project
        await db.insert(projectMembers).values({
            userId: invitedUser.id,
            projectId,
            role,
            joinedAt: new Date()
        });

        revalidatePath(`/projects/${projectId}`);
        return {
            success: true,
            message: "User has been successfully added to the project"
        };
    } catch (error) {
        console.error("Failed to invite user:", error);
        return { success: false, error: "An error occurred while inviting user" };
    }
}

// Delete project
interface DeleteProjectPayload {
    projectId: number
    userId: string
}

export async function deleteProject(
    payload: DeleteProjectPayload
): Promise<{ success: boolean; error?: string }> {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session || session.user.id !== payload.userId) {
        return { success: false, error: "Unauthorized operation" };
    }

    const { projectId, userId } = payload

    try {
        // Check if the user is the project creator
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId),
            columns: { creatorId: true }
        });

        if (!project) {
            return { success: false, error: "Project does not exist" };
        }

        if (project.creatorId !== userId) {
            return { success: false, error: "Only the project creator can delete the project" };
        }

        // Delete project
        await db.delete(projects)
            .where(eq(projects.id, projectId));

        revalidatePath("/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { success: false, error: "An error occurred while deleting the project" };
    }
}