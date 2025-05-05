import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { tasks, taskMembers, projects } from "@/database/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import TaskListSection from "./TaskListSection"

export default async function MyTaskPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return <div className="p-8">Please sign in</div>

  const rows = await db
    .select({
      taskId: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      projectId: tasks.projectId,
      projectName: projects.name,
      status: tasks.status,
    })
    .from(taskMembers)
    .innerJoin(tasks, eq(taskMembers.taskId, tasks.id))
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(taskMembers.userId, session.user.id))

  const grouped = rows.reduce((acc, row) => {
    if (!acc[row.projectId]) acc[row.projectId] = { projectName: row.projectName, tasks: [] }
    acc[row.projectId].tasks.push(row)
    return acc
  }, {} as Record<number, { projectName: string, tasks: typeof rows }>)

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <TaskListSection grouped={grouped} />
    </main>
  )
}
