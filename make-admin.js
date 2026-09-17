import { Temporal } from '@js-temporal/polyfill'
globalThis.Temporal = Temporal
import postgres from '@prisma/orm-postgres/runtime'
import fs from 'fs'

const contractJson = JSON.parse(fs.readFileSync('./prisma/schema.json', 'utf8'))
const db = postgres({
  contractJson,
  url: process.env['DATABASE_URL'],
})

async function main() {
  const users = await db.orm.public.User.all()
  if (users.length > 0) {
    // try direct sql
    await db.sql`UPDATE "public"."User" SET "role" = 'ADMIN' WHERE "id" = ${users[0].id}`
    console.log(`Updated user ${users[0].email} to ADMIN. Please verify.`)
  } else {
    console.log('No users found in DB. Please register one first.')
  }
}

main().catch(console.error)
