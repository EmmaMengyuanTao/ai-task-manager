import { redirect } from "next/navigation"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function TodoPage(props: PageProps) {
    const params = await props.params;
    redirect(`/projects/${params.id}/subtasks`)
} 