
# ☕️ CoffBEE

**Full-stack coffee ordering app**

---

## 🚀 Quick Start

Clone and install dependencies:

```bash
npm install
npm --prefix server install
```

Set up the database:

```bash
npm --prefix server run db:migrate
npm --prefix server run db:seed
```

Start backend and frontend (in separate terminals):

```bash
npm --prefix server start
npm run dev
```

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS, Lucide icons, Socket.io client
- **Backend:** Express, PostgreSQL (`pg`), Socket.io, bcrypt, dotenv

---

## 📁 Project Structure

- `src/` — Frontend app
- `server/` — Backend API, scripts, SQL, migrations
- `server/migrations/` — Schema evolution scripts
- `server/sql/` — Seed/reset SQL scripts

---

## ⚙️ Environment Setup

Create `server/.env` with:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `CLIENT_ORIGIN` (optional, defaults to `http://localhost:5173`)

---

## 🗄️ Database Workflow

SQL files are the source of truth.

**Common commands:**

- Migrate schema: `npm --prefix server run db:migrate`
- Seed data: `npm --prefix server run db:seed`
- Reset DB: `npm --prefix server run db:reset`
- Promote user: `npm --prefix server run user:promote -- your_email@example.com admin`

**Recommended order (fresh setup):**

1. `npm --prefix server run db:migrate`
2. `npm --prefix server run db:seed`
3. `npm --prefix server start`
4. In another terminal: `npm run dev`

---

## 🏃 Running the App

- Backend: `npm --prefix server start`
- Frontend (Vite): `npm run dev`
- Build frontend: `npm run build`

**Health checks:**

- API: `GET http://localhost:5000/api/health`
- DB: `GET http://localhost:5000/api/db-test`

---

## ✨ Core Features

- Guest/member authentication
- Cart & checkout
- Loyalty points updates
- Persistent active-order banner
- Tracking modal (pending/brewing/completed)
- Realtime status push via Socket.io (`orderStatusUpdate`)

---

## 🛡️ Admin Portal

- Sidebar modules:
  - Overview & CMS
  - Live Orders
  - Customers (placeholder)
  - Settings (placeholder)
- Overview & CMS:
  - Revenue/orders/low-stock KPIs
  - Inline inventory edit (`price`, `stock_level`)
  - Save directly to PostgreSQL (`PUT /api/admin/products/:id`)
- Live Orders:
  - Kanban board (`pending`, `brewing`, `completed`)
  - One-click order advancement
  - Emits realtime status updates

---

## 📡 API Highlights

- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/user/:userId`
- `GET /api/orders/user/:userId/active`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/:id/status`
- `PUT /api/admin/products/:id`

---

## 🧰 Troubleshooting

**Database not working?**
1. Check `server/.env` DB values
2. Run migrations: `npm --prefix server run db:migrate`
3. Seed data: `npm --prefix server run db:seed`
4. Start backend: `npm --prefix server start`
5. Test: `http://localhost:5000/api/db-test`

**Other tips:**
- If frontend seems stale after reset, reseed and refresh browser.
- If socket updates don’t appear, confirm backend is running and `CLIENT_ORIGIN` matches frontend URL.

---

## 🔒 Security Note

- Never commit default admin credentials.
- Keep PGAdmin edits temporary; commit durable schema changes as migration files.
