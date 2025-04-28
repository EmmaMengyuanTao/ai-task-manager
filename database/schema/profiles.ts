import { pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { users } from "./auth"

export const profiles = pgTable("profiles", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    name: text("name"),
    email: text("email"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
})