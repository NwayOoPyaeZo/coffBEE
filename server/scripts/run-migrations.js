const fs = require('fs')
const path = require('path')
const pool = require('../db')

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

function getMigrationFiles() {
  const migrationsDir = path.resolve(__dirname, '..', 'migrations')

  if (!fs.existsSync(migrationsDir)) {
    return []
  }

  return fs
    .readdirSync(migrationsDir)
    .filter((filename) => filename.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b))
    .map((filename) => ({
      filename,
      filepath: path.join(migrationsDir, filename),
    }))
}

async function getAppliedMigrations() {
  const result = await pool.query('SELECT filename FROM schema_migrations')
  return new Set(result.rows.map((row) => row.filename))
}

async function applyMigration(filename, sql) {
  await pool.query('BEGIN')

  try {
    await pool.query(sql)
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename])
    await pool.query('COMMIT')
    console.log(`Applied migration: ${filename}`)
  } catch (error) {
    await pool.query('ROLLBACK')
    throw error
  }
}

async function run() {
  try {
    await ensureMigrationsTable()

    const migrations = getMigrationFiles()
    const appliedMigrations = await getAppliedMigrations()

    let appliedCount = 0

    for (const migration of migrations) {
      if (appliedMigrations.has(migration.filename)) {
        continue
      }

      const sql = fs.readFileSync(migration.filepath, 'utf8')
      await applyMigration(migration.filename, sql)
      appliedCount += 1
    }

    if (appliedCount === 0) {
      console.log('No new migrations to apply.')
    } else {
      console.log(`Migration run complete. Applied ${appliedCount} migration(s).`)
    }
  } catch (error) {
    console.error('Migration run failed:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()
