import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/database/db'
import { profiles } from '@/database/schema/profiles'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, session.user.id),
    columns: { name: true, avatarId: true }
  })
  return new Response(JSON.stringify(profile), { status: 200 })
} 