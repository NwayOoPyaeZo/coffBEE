require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
})

async function run() {
  const result = await pool.query(
    "select table_name, column_name, data_type from information_schema.columns where table_schema='public' and table_name in ('products','orders','order_items','users') order by table_name, ordinal_position",
  )
  console.log(JSON.stringify(result.rows, null, 2))
  await pool.end()
}

run().catch(async (err) => {
  console.error(err.message)
  await pool.end()
  process.exit(1)
})
