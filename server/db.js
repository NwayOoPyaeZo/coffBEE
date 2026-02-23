const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

function readEnvString(name) {
  const rawValue = process.env[name]

  if (typeof rawValue !== 'string') {
    return undefined
  }

  const trimmed = rawValue.trim()

  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1)
  }

  return trimmed
}

const pool = new Pool({
  user: readEnvString('DB_USER'),
  host: readEnvString('DB_HOST'),
  database: readEnvString('DB_NAME'),
  password: readEnvString('DB_PASSWORD'),
  port: Number(process.env.DB_PORT) || 5432,
})

module.exports = pool
