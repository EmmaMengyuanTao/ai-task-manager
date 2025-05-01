export * from "./auth";
export * from "./skills";
export * from "./projects";
export * from "./profiles";

import { relations } from 'drizzle-orm';
import { users, sessions, accounts, verifications } from './auth';
import { profiles } from './profiles';
import { skills, userSkills } from './skills';
import { projects, projectMembers, tasks } from './projects';
import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

// --- Define ALL relations --- 

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  userSkills: many(userSkills),
  projectMemberships: many(projectMembers), // User is a member of many projects
  createdProjects: many(projects, { relationName: 'projectCreator' }),
  assignedTasks: many(tasks),       // Tasks assigned to the user
  sessions: many(sessions),         // User's sessions
  accounts: many(accounts),         // User's linked accounts
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.creatorId], references: [users.id], relationName: 'projectCreator' }),
  members: many(projectMembers), // Project has many members
  tasks: many(tasks),            // Project contains many tasks
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignedUser: one(users, { fields: [tasks.assignedUserId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const generatedSubtasks = pgTable("generated_subtasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  subtasks: jsonb("subtasks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});