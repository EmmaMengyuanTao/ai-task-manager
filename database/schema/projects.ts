import { pgTable, serial,pgEnum, text, timestamp, jsonb, integer, primaryKey } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { skills } from "./skills";

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
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").notNull().default("todo"),
  note: text("note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taskMembers = pgTable("task_members", {
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.taskId, t.userId] })
}));

export const taskSkills = pgTable("task_skills", {
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  requiredLevel: integer("required_level").notNull().default(1),
}, (t) => ({
  pk: primaryKey({ columns: [t.taskId, t.skillId] })
}));

export const generatedSubtasks = pgTable("generated_subtasks", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  subtasks: jsonb("subtasks").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
});