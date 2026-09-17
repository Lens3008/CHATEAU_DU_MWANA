import { createClient } from '../supabase/server'
import { db } from '../prisma'

// UserRole enum matching the contract definition
export const UserRole = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  SECRETARY: 'SECRETARY',
  LOGISTICIAN: 'LOGISTICIAN',
  CLIENT: 'CLIENT',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Find user in our database (Prisma 8 ORM)
  let dbUser = await db.orm.public.User.first({ id: user.id })

  // Lazy-sync: create user if not found
  if (!dbUser) {
    try {
      dbUser = await db.orm.public.User.create({
        id: user.id,
        email: user.email!,
        role: UserRole.CLIENT,
        isActive: true,
        // @ts-ignore
        createdAt: Temporal.Now.instant(),
        // @ts-ignore
        updatedAt: Temporal.Now.instant(),
      })
    } catch (e: any) {
      // If two concurrent requests try to create the user, one will fail due to unique constraints.
      // We safely catch it and try to fetch the user again.
      dbUser = await db.orm.public.User.first({ id: user.id })
      if (!dbUser) {
        throw e
      }
    }
  }

  // If user is deactivated, prevent access
  if (!dbUser.isActive) {
    return null
  }

  return dbUser
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth()
  if (!roles.includes(user.role as UserRole)) {
    throw new Error('Forbidden')
  }
  return user
}
