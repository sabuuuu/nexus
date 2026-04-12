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
  console.log('Creating world_boss table via raw SQL...')
  
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS world_boss (
      id TEXT PRIMARY KEY,
      level INTEGER NOT NULL DEFAULT 1,
      current_stability BIGINT NOT NULL DEFAULT 1000000,
      max_stability BIGINT NOT NULL DEFAULT 1000000,
      last_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `)

  console.log('Initializing NODE-0...')
  
  await db.execute(sql`
    INSERT INTO world_boss (id, level, current_stability, max_stability)
    VALUES ('current_boss', 1, 1000000, 1000000)
    ON CONFLICT (id) DO NOTHING;
  `)

  console.log('Table ready!')
  process.exit(0)
}

main().catch(console.error)
