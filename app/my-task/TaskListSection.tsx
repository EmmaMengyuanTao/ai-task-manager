"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"
import { toast } from "sonner"

export default function TaskListSection({ grouped }: { grouped: any }) {

  const [localGrouped, setLocalGrouped] = useState(grouped)

  // Toggle task status
  const handleToggle = async (projectId: number, task: any) => {
    let newStatus: "todo" | "inprogress" | "done"
    if (!task.status || task.status === "inprogress") {
      newStatus = "todo"
    } else if (task.status === "todo") {
      newStatus = "done"
    } else {
      newStatus = "inprogress"
    }
    // Update local tasks
    setLocalGrouped((prev: any) => {
      const newTasks = prev[projectId].tasks.map((t: any) =>
        t.taskId === task.taskId ? { ...t, status: newStatus } : t
      )

      newTasks.sort((a: any, b: any) => {
        const order = { todo: 0, inprogress: 1, done: 2 }
        return order[(a.status || "todo") as "todo" | "inprogress" | "done"] - order[(b.status || "todo") as "todo" | "inprogress" | "done"]
      })
      return {
        ...prev,
        [projectId]: { ...prev[projectId], tasks: newTasks }
      }
    })
    // Update backend
    try {
      const res = await fetch(`/api/tasks/${task.taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error("Failed to update task status")
    } catch (e) {
      toast.error("Failed to update task status")
    }
  }

  return (
    <>
      {Object.values(localGrouped).length === 0 && <div className="text-muted-foreground">No tasks assigned to you.</div>}
      {Object.values(localGrouped).map((group: any) => {
        // Render first sorted: done last
        const sortedTasks = [...group.tasks].sort((a: any, b: any) => {
          const order = { todo: 0, inprogress: 0, done: 1 }
          return order[((a.status || "todo").toLowerCase() as "todo" | "inprogress" | "done")] - order[((b.status || "todo").toLowerCase() as "todo" | "inprogress" | "done")]
        })
        return (
          <div key={group.projectName} className="mb-8">
            <div className="mb-1 text-lg font-semibold text-muted-foreground">{group.projectName}</div>
            <div className="border-b mb-3" />
            <ul className="space-y-2">
              {sortedTasks.map((task: any) => (
                <TaskListItem key={task.taskId} task={task} onToggle={() => handleToggle(task.projectId, task)} />
              ))}
            </ul>
          </div>
        )
      })}
    </>
  )
}

function TaskListItem({ task, onToggle }: { task: any, onToggle: () => void }) {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (v: boolean) => setOpen(v)
  const status = typeof task.status === 'string' ? task.status.trim().toLowerCase() : 'todo';
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <li
          className={`flex items-center gap-2 p-3 rounded-md border select-none transition-colors duration-150 ${status === "done" ? "bg-green-50 border-green-200" : "bg-white border-muted"}`}
        >
          <span
            className={`w-6 h-6 flex items-center justify-center rounded-sm border-2 mr-2 cursor-pointer transition-colors duration-150 ${status === "done" ? "bg-green-200 border-green-400" : "bg-white border-muted"}`}
            onClick={e => { e.stopPropagation(); onToggle(); }}
          >
            {status === "done" && (
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
          </span>
          <span className="flex-1 font-medium text-foreground text-base">{task.title}</span>
          {task.dueDate ? (
            <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}, {new Date(task.dueDate).getFullYear()}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground ml-2 whitespace-nowrap">No due date</span>
          )}
        </li>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
          {task.description || "No description."}
        </div>
        {task.dueDate && (
          <div className="mt-4 flex items-center gap-2 text-blue-600 text-xs">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Due: {new Date(task.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 