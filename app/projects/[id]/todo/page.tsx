import { redirect } from "next/navigation"

interface PageProps {
    params: {
        id: string
    }
}

export default function TodoPage({ params }: PageProps) {
    redirect(`/projects/${params.id}/subtasks`)
} 