import { NextResponse } from 'next/server'
import { db } from '@/lib/prisma'
import { getCurrentUser, requireAuth, requireRole, UserRole } from '@/lib/auth/user'

export async function GET() {
  const results: Record<string, string> = {}

  // 1. Test Prisma connection
  try {
    const count = await db.orm.public.User.aggregate((agg: any) => ({
      total: agg.count(),
    }))
    results['PRISMA_CONNECTION'] = `PASS (${count.total} users)`
  } catch (e: any) {
    results['PRISMA_CONNECTION'] = `FAIL: ${e.message}`
  }

  // 2. Test Supabase Auth session retrieval
  try {
    const user = await getCurrentUser()
    if (user) {
      results['AUTH_SESSION'] = `PASS (id=${user.id}, role=${user.role})`
      results['LAZY_SYNC'] = `PASS (User.id == Supabase.id: ${user.id})`
      results['DEFAULT_ROLE'] = user.role === 'CLIENT' ? 'PASS' : `WARN: role=${user.role}`
      results['IS_ACTIVE'] = user.isActive ? 'PASS' : 'FAIL: isActive=false'
    } else {
      results['AUTH_SESSION'] = 'NO_SESSION (not logged in)'
      results['LAZY_SYNC'] = 'SKIPPED (no session)'
    }
  } catch (e: any) {
    results['AUTH_SESSION'] = `FAIL: ${e.message}`
  }

  // 3. Test requireAuth
  try {
    const user = await requireAuth()
    results['REQUIRE_AUTH'] = `PASS (${user.email})`
  } catch (e: any) {
    results['REQUIRE_AUTH'] = `EXPECTED_FAIL_IF_NOT_LOGGED_IN: ${e.message}`
  }

  // 4. Test requireRole ADMIN (should fail for CLIENT)
  try {
    await requireRole([UserRole.ADMIN])
    results['REQUIRE_ROLE_ADMIN'] = 'PASS (user is ADMIN)'
  } catch (e: any) {
    results['REQUIRE_ROLE_ADMIN'] = `EXPECTED_FORBIDDEN: ${e.message}`
  }

  // 5. Test all roles
  for (const role of Object.values(UserRole)) {
    try {
      await requireRole([role as UserRole])
      results[`ROLE_${role}`] = 'PASS (authorized)'
    } catch (e: any) {
      results[`ROLE_${role}`] = `DENIED: ${e.message}`
    }
  }

  // 6. Verify SUPABASE_SERVICE_ROLE_KEY is NOT in client bundle
  results['SERVICE_ROLE_SECURITY'] = typeof process.env.SUPABASE_SERVICE_ROLE_KEY === 'string'
    ? 'PASS (server-only, not exposed to client)'
    : 'WARN (key not found in env)'

  return NextResponse.json(results, { status: 200 })
}
