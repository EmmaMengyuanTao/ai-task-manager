"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react"

export default function TaskListSection({ grouped }: { grouped: any }) {
  return (
    <>
      {Object.values(grouped).length === 0 && <div className="text-muted-foreground">No tasks assigned to you.</div>}
      {Object.values(grouped).map((group: any) => (
        <div key={group.projectName} className="mb-8">
          <div className="mb-1 text-lg font-semibold text-muted-foreground">{group.projectName}</div>
          <div className="border-b mb-3" />
          <ul className="space-y-2">
            {group.tasks.map((task: any) => (
              <TaskListItem key={task.taskId} task={task} />
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

function TaskListItem({ task }: { task: any }) {
  const [open, setOpen] = useState(false)
  const handleOpenChange = (v: boolean) => setOpen(v)
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <li
          className="flex items-center gap-2 p-3 rounded-md border bg-white select-none"
        >
          <span className="w-6 h-6 flex items-center justify-center rounded-sm border-2 border-muted bg-muted/30 mr-2" />
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