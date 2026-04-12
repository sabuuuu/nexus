import 'dotenv/config'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })
const db = drizzle(client)

async function main() {
  console.log('Enabling Realtime for world_boss table...')
  
  // 1. Add table to supabase_realtime publication
  await db.execute(sql`
    ALTER PUBLICATION supabase_realtime ADD TABLE world_boss;
  `)

  // 2. Enable row level security (best practice)
  await db.execute(sql`
    ALTER TABLE world_boss ENABLE ROW LEVEL SECURITY;
  `)

  // 3. Allow public read access (everyone can see boss health)
  await db.execute(sql`
    CREATE POLICY "Allow public read access" ON world_boss FOR SELECT USING (true);
  `)

  console.log('Realtime enabled & Policies set!')
  process.exit(0)
}

main().catch(console.error)
