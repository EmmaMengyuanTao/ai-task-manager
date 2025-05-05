import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ProjectWithProgress } from "@/app/dashboard/page" // Import the interface
import { cn } from "@/lib/utils"
import { CalendarClock, CheckCircle, ListTodo, Users } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatars"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProjectProgressCardProps {
    project: ProjectWithProgress
}

export function ProjectProgressCard({ project }: ProjectProgressCardProps) {
    const progressPercentage = project.totalTasks > 0 ? (project.completedTasks / project.totalTasks) * 100 : 0

    let deadlineText = "No deadline set"
    let deadlineColor = "text-muted-foreground"

    if (project.daysLeft !== null && project.daysLeft !== undefined) {
        if (project.daysLeft < 0) {
            deadlineText = `${Math.abs(project.daysLeft)} days overdue`
            deadlineColor = "text-red-600 dark:text-red-500 font-medium"
        } else if (project.daysLeft === 0) {
            deadlineText = "Due today"
            deadlineColor = "text-orange-600 dark:text-orange-500 font-medium"
        } else if (project.daysLeft === 1) {
            deadlineText = "Due tomorrow"
            deadlineColor = "text-yellow-600 dark:text-yellow-500"
        } else {
            deadlineText = `${project.daysLeft} days left`
            deadlineColor = "text-green-600 dark:text-green-500"
        }
    }

    const members = project.members || [];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Recent Project</span>
                </CardTitle>
                <CardDescription>Overview of your latest project engagement.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold hover:underline">
                        <Link href={`/projects/${project.id}`}>
                            {project.name}
                        </Link>
                    </h3>
                    {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                         <span className="text-muted-foreground flex items-center gap-1.5">
                            <ListTodo className="h-4 w-4" /> Progress
                        </span>
                        <span>{project.completedTasks} / {project.totalTasks} tasks</span>
                    </div>
                    <Progress value={progressPercentage} aria-label={`${Math.round(progressPercentage)}% completed`} />
                </div>

                <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    <span className={cn(deadlineColor)}>{deadlineText}</span>
                </div>
                
                {/* Team Members - Now in its own row */}
                <div className="flex items-center">
                    <div className="text-sm text-muted-foreground mr-2 flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>Team:</span>
                    </div>
                    
                    {members.length > 0 ? (
                        <div className="flex -space-x-2 overflow-hidden">
                            <TooltipProvider>
                                {members.slice(0, 3).map((member) => {
                                    const displayName = member.userName || member.userEmail?.split('@')[0] || 'Member';
                                    const avatarUrl = member.userImage ? getAvatarUrl(member.userImage) : null;
                                    
                                    return (
                                        <Tooltip key={member.userId}>
                                            <TooltipTrigger asChild>
                                                <Avatar 
                                                    className="w-7 h-7 border-2 border-background hover:translate-y-[-3px] transition-transform"
                                                >
                                                    <AvatarImage src={avatarUrl || ""} alt={displayName} />
                                                    <AvatarFallback className="text-xs bg-primary/10">
                                                        {displayName[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{displayName}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                })}
                                {members.length > 3 && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar 
                                                className="w-7 h-7 border-2 border-background"
                                            >
                                                <AvatarFallback className="bg-primary/10 text-xs">
                                                    +{members.length - 3}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{members.length - 3} more member(s)</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </TooltipProvider>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">No team members yet</span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 