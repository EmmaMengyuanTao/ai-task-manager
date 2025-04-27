import { pgTable, serial, text, integer, timestamp, primaryKey} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { relations } from "drizzle-orm";

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userSkills = pgTable("user_skills", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
}, (t) => ([
  { pk: primaryKey({ columns: [t.userId, t.skillId] }) }
]));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, { fields: [userSkills.userId], references: [users.id] }),
  skill: one(skills, { fields: [userSkills.skillId], references: [skills.id] }),
}));