const fs = require('fs')
const path = require('path')
const pool = require('../db')

async function run() {
  const relativeSqlPath = process.argv[2]

  if (!relativeSqlPath) {
    console.error('Missing SQL file path argument. Example: node scripts/run-sql-file.js sql/seed.sql')
    process.exit(1)
  }

  const sqlPath = path.resolve(__dirname, '..', relativeSqlPath)
  const sql = fs.readFileSync(sqlPath, 'utf8')

  try {
    await pool.query(sql)
    console.log(`Executed SQL file: ${relativeSqlPath}`)
  } catch (err) {
    console.error('Failed to execute SQL file:', err.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()
