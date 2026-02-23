const pool = require('../db')

async function run() {
  const email = process.argv[2]
  const role = process.argv[3] || 'admin'

  if (!email) {
    console.error('Usage: node scripts/promote-user.js <email> [role]')
    process.exit(1)
  }

  if (!['guest', 'member', 'admin'].includes(role)) {
    console.error("Role must be one of: guest, member, admin")
    process.exit(1)
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET role = $2
       WHERE LOWER(email) = LOWER($1)
       RETURNING id, email, full_name, role`,
      [email.trim(), role],
    )

    if (result.rows.length === 0) {
      console.error('No user found with that email.')
      process.exitCode = 1
      return
    }

    console.log('Updated user role:', result.rows[0])
  } catch (err) {
    console.error('Failed to promote user:', err.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

run()
