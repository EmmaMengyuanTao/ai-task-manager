export * from "./auth";
export * from "./skills";
export * from "./projects";
export * from "./profiles";

import { relations } from 'drizzle-orm';
import { users, sessions, accounts, verifications } from './auth';
import { profiles } from './profiles';
import { skills, userSkills } from './skills';
import { projects, projectMembers, tasks, taskMembers, taskSkills } from './projects';

// --- Define ALL relations --- 

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  userSkills: many(userSkills),
  projectMemberships: many(projectMembers), // User is a member of many projects
  createdProjects: many(projects, { relationName: 'projectCreator' }),
  assignedTasks: many(taskMembers),       // Tasks assigned to the user
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

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignedMembers: many(taskMembers),
  requiredSkills: many(taskSkills),
}));

export const taskMembersRelations = relations(taskMembers, ({ one }) => ({
  task: one(tasks, { fields: [taskMembers.taskId], references: [tasks.id] }),
  user: one(users, { fields: [taskMembers.userId], references: [users.id] }),
}));

export const taskSkillsRelations = relations(taskSkills, ({ one }) => ({
  task: one(tasks, { fields: [taskSkills.taskId], references: [tasks.id] }),
  skill: one(skills, { fields: [taskSkills.skillId], references: [skills.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));
