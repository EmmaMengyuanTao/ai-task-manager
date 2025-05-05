import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentTask } from "@/app/dashboard/page"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ListChecks, AlertCircle, Calendar } from "lucide-react"
import { format } from "date-fns"

interface RecentTasksListProps {
    tasks: RecentTask[]
}

function getStatusBadgeVariant(status: RecentTask['status']): "default" | "secondary" | "outline" | "destructive" {
    switch (status) {
        case 'done': return 'default'
        case 'inprogress': return 'secondary'
        case 'todo': return 'outline'
        default: return 'outline'
    }
}

function formatDueDate(dueDate: Date | string | null): string {
    if (!dueDate) return "No due date set";
    
    try {
        const date = new Date(dueDate);
        return `Due: ${format(date, 'MMM d, yyyy')}`;
    } catch (error) {
        return "Invalid date";
    }
}

export function RecentTasksList({ tasks }: RecentTasksListProps) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                     <ListChecks className="h-5 w-5"/>
                     My Recent Tasks
                 </CardTitle>
                <CardDescription>Tasks recently assigned to you.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4 overflow-y-auto">
                {tasks.length > 0 ? (
                    <ul className="space-y-3">
                        {tasks.map((task) => (
                            <li key={task.id} className="flex items-center justify-between space-x-3 p-2 hover:bg-muted/50 rounded-md transition-colors">
                                <div className="flex-1 space-y-1 overflow-hidden">
                                     <Link href={`/projects/${task.projectId}/tasks/${task.id}`} className="hover:underline">
                                        <p className="text-sm font-medium leading-none truncate" title={task.title}>
                                            {task.title}
                                        </p>
                                    </Link>
                                    <p className="text-xs text-muted-foreground truncate" title={task.projectName ?? ''}>
                                        In: {task.projectName} • <span className={task.dueDate ? "text-blue-500 font-medium" : ""}>
                                            {formatDueDate(task.dueDate)}
                                        </span>
                                    </p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(task.status)} className="capitalize text-xs">
                                    {task.status}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-center">
                         <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                         <p className="text-sm text-muted-foreground">No recent tasks assigned to you.</p>
                     </div>
                )}
            </CardContent>
        </Card>
    )
} 