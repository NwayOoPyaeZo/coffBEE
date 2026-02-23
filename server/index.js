const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const http = require('http')
const { Server } = require('socket.io')
const pool = require('./db')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT'],
  },
})
const PORT = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())

function mapUserRow(userRow) {
  return {
    id: userRow.id,
    email: userRow.email,
    name: userRow.full_name,
    role: userRow.role,
    honey_points: userRow.honey_points,
  }
}

function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'coffbee-backend' })
})

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_database() AS database_name, NOW() AS server_time')
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, username } = req.body

  if (!email || !password || !username) {
    res.status(400).json({ error: 'email, password, and username are required' })
    return
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'member')
       RETURNING id, email, full_name, role, honey_points`,
      [email.trim().toLowerCase(), hashedPassword, username.trim()],
    )

    res.status(201).json({ user: mapUserRow(result.rows[0]) })
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'Email already exists' })
      return
    }

    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' })
    return
  }

  try {
    const result = await pool.query(
      `SELECT id, email, full_name, role, honey_points, password_hash
       FROM users
       WHERE LOWER(TRIM(full_name)) = LOWER(TRIM($1))
       LIMIT 1`,
      [username],
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const user = result.rows[0]

    if (!user.password_hash || !user.password_hash.startsWith('$2')) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      res.status(401).json({ error: 'Invalid password' })
      return
    }

    res.json({ user: mapUserRow(user) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, description, price, category, image_url, stock_level FROM products ORDER BY category ASC, name ASC',
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/profile/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'SELECT full_name, honey_points, role FROM users WHERE id = $1',
      [id],
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/orders/user/:userId', async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.order_date,
         o.total_amount,
         o.status,
         json_agg(
           json_build_object(
             'name', p.name,
             'quantity', oi.quantity
           )
           ORDER BY oi.id
         ) AS items
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.order_date DESC`,
      [userId],
    )

    res.json(result.rows)
  } catch (err) {
    console.error('Failed to fetch order history:', err)
    res.status(500).json({ error: 'Failed to fetch order history' })
  }
})

app.get('/api/orders/user/:userId/active', async (req, res) => {
  const { userId } = req.params

  try {
    const result = await pool.query(
      `SELECT
         id,
         status,
         total_amount,
         order_date
       FROM orders
       WHERE user_id = $1
         AND status IN ('pending', 'brewing')
       ORDER BY order_date DESC
       LIMIT 1`,
      [userId],
    )

    res.json(result.rows[0] || null)
  } catch (err) {
    console.error('Failed to fetch active order:', err)
    res.status(500).json({ error: 'Failed to fetch active order' })
  }
})

app.post('/api/orders', async (req, res) => {
  const { userId, items } = req.body

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Checkout cart is empty' })
    return
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const normalizedItems = []
    let computedTotal = 0

    for (const item of items) {
      const quantity = Number(item.quantity)
      const providedUnitPrice = Number(item.price)
      const hasValidProvidedPrice = Number.isFinite(providedUnitPrice) && providedUnitPrice > 0

      if (!item.id || !Number.isInteger(quantity) || quantity <= 0) {
        throw httpError(400, 'Invalid cart item payload')
      }

      const productResult = await client.query(
        `SELECT id, name, price, stock_level
         FROM products
         WHERE id = $1
         FOR UPDATE`,
        [item.id],
      )

      if (productResult.rows.length === 0) {
        throw httpError(404, 'One or more products no longer exist')
      }

      const product = productResult.rows[0]

      if (product.stock_level < quantity) {
        throw httpError(409, `Not enough stock for ${product.name}`)
      }

      const unitPrice = hasValidProvidedPrice ? providedUnitPrice : Number(product.price)
      const customizations = item.customizations && typeof item.customizations === 'object' ? item.customizations : {}

      normalizedItems.push({
        productId: product.id,
        quantity,
        unitPrice,
        customizations,
      })

      computedTotal += unitPrice * quantity
    }

    if (userId) {
      const userResult = await client.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [userId])

      if (userResult.rows.length === 0) {
        throw httpError(404, 'User not found for checkout')
      }
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [userId || null, computedTotal],
    )

    const orderId = orderResult.rows[0].id

    for (const item of normalizedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, customizations)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.productId, item.quantity, item.unitPrice, JSON.stringify(item.customizations || {})],
      )

      await client.query(
        `UPDATE products
         SET stock_level = stock_level - $1
         WHERE id = $2`,
        [item.quantity, item.productId],
      )
    }

    if (userId) {
      const pointsEarned = Math.floor(computedTotal / 10)

      await client.query(
        `UPDATE users
         SET honey_points = honey_points + $1
         WHERE id = $2`,
        [pointsEarned, userId],
      )
    }

    await client.query('COMMIT')

    res.json({
      success: true,
      orderId,
      totalAmount: Number(computedTotal.toFixed(2)),
      message: 'Checkout complete!',
    })
  } catch (err) {
    await client.query('ROLLBACK')

    if (err.status) {
      res.status(err.status).json({ error: err.message })
      return
    }

    console.error('Checkout transaction failed:', err)
    res.status(500).json({ error: 'Checkout failed. Please try again.' })
  } finally {
    client.release()
  }
})

app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         o.id,
         o.order_date,
         o.total_amount,
         o.status,
         u.full_name AS customer_name,
         json_agg(
           json_build_object(
             'name', p.name,
             'quantity', oi.quantity,
             'customizations', oi.customizations
           )
           ORDER BY oi.id
         ) AS items
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       GROUP BY o.id, u.full_name
       ORDER BY
         CASE o.status
           WHEN 'pending' THEN 1
           WHEN 'brewing' THEN 2
           WHEN 'completed' THEN 3
           ELSE 4
         END,
         o.order_date ASC`,
    )

    res.json(result.rows)
  } catch (err) {
    console.error('Failed to fetch admin orders:', err)
    res.status(500).json({ error: 'Failed to fetch admin orders' })
  }
})

app.put('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!['pending', 'brewing', 'completed'].includes(status)) {
    res.status(400).json({ error: 'Invalid status value' })
    return
  }

  try {
    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2`,
      [status, id],
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Order not found' })
      return
    }

    io.emit('orderStatusUpdate', { orderId: id, status })

    res.json({ success: true, status })
  } catch (err) {
    console.error('Failed to update order status:', err)
    res.status(500).json({ error: 'Failed to update status' })
  }
})

app.delete('/api/admin/orders/:id', async (req, res) => {
  const { id } = req.params
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(
      `DELETE FROM order_items
       WHERE order_id = $1`,
      [id],
    )

    const deletedOrderResult = await client.query(
      `DELETE FROM orders
       WHERE id = $1`,
      [id],
    )

    if (deletedOrderResult.rowCount === 0) {
      await client.query('ROLLBACK')
      io.emit('orderStatusUpdate', { orderId: id, status: 'cancelled' })
      res.json({ success: true, message: 'Order already removed.' })
      return
    }

    await client.query('COMMIT')

    io.emit('orderStatusUpdate', { orderId: id, status: 'cancelled' })

    res.json({ success: true, message: 'Order deleted successfully.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Delete Order Error:', err)
    res.status(500).json({ error: 'Failed to delete order' })
  } finally {
    client.release()
  }
})

app.put('/api/admin/products/:id', async (req, res) => {
  const { id } = req.params
  const { price, stock_level: stockLevel } = req.body

  const normalizedPrice = Number(price)
  const normalizedStockLevel = Number(stockLevel)

  if (Number.isNaN(normalizedPrice) || Number.isNaN(normalizedStockLevel)) {
    res.status(400).json({ error: 'price and stock_level must be numeric values' })
    return
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET price = $1,
           stock_level = $2
       WHERE id = $3`,
      [normalizedPrice, normalizedStockLevel, id],
    )

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Product not found' })
      return
    }

    res.json({ success: true, message: 'Product updated successfully' })
  } catch (err) {
    console.error('Failed to update product:', err)
    res.status(500).json({ error: 'Database error during product update' })
  }
})

app.get('/api/admin/customers', async (req, res) => {
  try {
    const result = await pool.query(
      `WITH UserFavorites AS (
         SELECT
           o.user_id,
           p.name AS favorite_item,
           ROW_NUMBER() OVER (
             PARTITION BY o.user_id
             ORDER BY SUM(oi.quantity) DESC, p.name ASC
           ) AS rank
         FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p ON oi.product_id = p.id
         WHERE o.status = 'completed'
           AND o.user_id IS NOT NULL
         GROUP BY o.user_id, p.name
       )
       SELECT
         u.id,
         u.full_name,
         u.email,
         u.role,
         u.honey_points,
         u.created_at,
         COUNT(DISTINCT o.id)::int AS total_orders,
         COALESCE(SUM(o.total_amount), 0) AS lifetime_value,
         uf.favorite_item
       FROM users u
       LEFT JOIN orders o
         ON u.id = o.user_id
        AND o.status = 'completed'
       LEFT JOIN UserFavorites uf
         ON u.id = uf.user_id
        AND uf.rank = 1
       GROUP BY u.id, u.full_name, u.email, u.role, u.honey_points, u.created_at, uf.favorite_item
       ORDER BY lifetime_value DESC, u.created_at DESC`,
    )

    res.json(result.rows)
  } catch (err) {
    console.error('CRM Fetch Error:', err)
    res.status(500).json({ error: 'Failed to fetch customer data' })
  }
})

app.delete('/api/admin/customers/:id', async (req, res) => {
  const { id } = req.params
  const actorUserId = req.headers['x-actor-user-id']

  if (typeof actorUserId === 'string' && actorUserId.trim() && actorUserId.trim() === id) {
    res.status(403).json({ error: 'You cannot delete your own admin account.' })
    return
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    await client.query(
      `UPDATE orders
       SET user_id = NULL
       WHERE user_id = $1`,
      [id],
    )

    const deleteResult = await client.query(
      `DELETE FROM users
       WHERE id = $1`,
      [id],
    )

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK')
      res.status(404).json({ error: 'User not found' })
      return
    }

    await client.query('COMMIT')
    res.json({ success: true, message: 'User deleted and orders anonymized.' })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Delete User Error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  } finally {
    client.release()
  }
})

app.get('/api/admin/revenue', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE status = $1',
      ['completed'],
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/admin/new-members-week', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM users
       WHERE created_at > NOW() - INTERVAL '7 days'
         AND role = 'member'`,
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/admin/best-seller', async (req, res) => {
  try {
    const tableCheck = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') AS exists",
    )

    if (!tableCheck.rows[0].exists) {
      const fallback = await pool.query(
        'SELECT COUNT(*)::int AS completed_orders FROM orders WHERE status = $1',
        ['completed'],
      )

      res.json({
        name: null,
        total_sold: 0,
        completed_orders: fallback.rows[0].completed_orders,
        note: 'order_items table missing. Run db:seed to enable product-level best-seller analytics.',
      })
      return
    }

    const result = await pool.query(
      `SELECT
         p.name,
         COALESCE(SUM(oi.quantity), 0) AS total_sold
       FROM products p
       JOIN order_items oi ON oi.product_id = p.id
       JOIN orders o ON o.id = oi.order_id
       WHERE o.status = $1
       GROUP BY p.name
       ORDER BY total_sold DESC
       LIMIT 1`,
      ['completed'],
    )

    if (result.rows.length === 0) {
      res.json({ name: null, total_sold: 0 })
      return
    }

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

server.listen(PORT, () => {
  console.log(`Coffbee Backend + WebSockets running on port ${PORT}`)
})
