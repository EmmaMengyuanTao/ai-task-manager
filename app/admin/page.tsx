import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserToggleSwitch } from "@/components/UserToggleSwitch"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"
import { users } from "@/database/schema"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (session?.user?.role != "admin") {
        return (
            <main className="py-8 px-4">
                <p>Access Denied. Only admins can access this page</p>
            </main>
        )
    }

    const usersList = await db.query.users.findMany({
        where: eq(users.role, "user"),
        orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
    
    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="py-2 px-4 text-left">Name</th>
                                <th className="py-2 px-4 text-left">Email</th>
                                <th className="py-2 px-4 text-left">Role</th>
                                <th className="py-2 px-4 text-left">Created At</th>
                                <th className="py-2 px-4 text-left">Active</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-2 px-4 text-center">No users found</td>
                                </tr>
                            )}
                            {usersList.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="py-2 px-4">{user.name}</td>
                                    <td className="py-2 px-4">{user.email}</td>
                                    <td className="py-2 px-4">{user.role}</td>
                                    <td className="py-2 px-4">
                                        {user.createdAt
                                            ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </td>
                                    <td className="py-2 px-4">
                                        <UserToggleSwitch
                                            userId={user.id}
                                            isActive={!user.banned}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
