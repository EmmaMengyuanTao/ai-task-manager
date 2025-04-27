import { pgTable, serial,pgEnum, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { relations } from "drizzle-orm";

export const taskStatusEnum = pgEnum("task_status", ["todo", "inprogress", "done"]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: text("creator_id").notNull().references(() => users.id, { onDelete: "set null" }),
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const projectMembers = pgTable("project_members", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  role: text("role").default("member"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});


export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  assignedUserId: text("assigned_user_id").references(() => users.id, { onDelete: "set null" }),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").notNull().default("todo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.creatorId], references: [users.id] }),
  members: many(projectMembers),
  tasks: many(tasks),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, { fields: [projectMembers.projectId], references: [projects.id] }),
  user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  assignedUser: one(users, { fields: [tasks.assignedUserId], references: [users.id] }),
}));
