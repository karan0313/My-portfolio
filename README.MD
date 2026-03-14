# Karan Ganesan — Professional Portfolio

A full-stack portfolio website with a Node.js/Express backend that saves contact form messages to a **MySQL database**.

---

## 📁 Project Structure

```
karan_portfolio/
├── frontend/
│   ├── index.html          ← Main portfolio page
│   ├── style.css           ← All styles
│   ├── script.js           ← JS (typewriter, tabs, form submit to API)
│   └── IMG_20251127_074830.png  ← Your profile photo
│
└── backend/
    ├── server.js           ← Express + MySQL API server
    ├── schema.sql          ← Run once to create DB & table
    ├── package.json
    └── .env.example        ← Copy to .env and fill in your details
```

---

## 🚀 Setup Guide

### Step 1 — MySQL Database

Open MySQL Workbench or terminal and run:

```sql
source /path/to/backend/schema.sql
```

This creates the `karan_portfolio` database and `contact_messages` table.

---

### Step 2 — Backend (Node.js)

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=karan_portfolio
ADMIN_TOKEN=your_secret_admin_token
PORT=3000
```

Start the server:
```bash
# Production
npm start

# Development (auto-restart)
npm run dev
```

Server will run at: `http://localhost:3000`

---

### Step 3 — Frontend

Open `frontend/index.html` in a browser using **Live Server** (VS Code extension) or any static server.

The contact form will automatically POST to `http://localhost:3000/api/contact`.

---

## 🗄️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | Health check |
| POST   | `/api/contact` | Save contact message to MySQL |
| GET    | `/api/messages` | View all messages (requires admin token) |
| PATCH  | `/api/messages/:id/read` | Mark message as read |

### POST /api/contact

**Request body:**
```json
{
  "name":    "John Doe",
  "email":   "john@email.com",
  "phone":   "+91 9876543210",
  "subject": "Job Opportunity",
  "message": "Hello Karan, I'd like to discuss..."
}
```

**Success response:**
```json
{
  "success": true,
  "message": "Message received! Karan will get back to you shortly.",
  "id": 1
}
```

### GET /api/messages (Admin)

```bash
curl -H "x-admin-token: your_secret_token" http://localhost:3000/api/messages
```

---

## 🌐 Deployment

### Frontend
Upload the `frontend/` folder to any static host:
- **Netlify** (free, drag & drop)
- **Vercel** (free)
- **GitHub Pages** (free)

### Backend
Deploy to:
- **Railway** (free tier available)
- **Render** (free tier)
- **DigitalOcean** / **AWS EC2**
- Your own VPS with PM2 + Nginx

After deploying the backend, update `API_BASE` in `frontend/script.js`:
```js
const API_BASE = 'https://your-backend-url.com';
```

---

## 🛡️ Security Features

- **Helmet.js** — Sets secure HTTP headers
- **CORS** — Restricts which domains can call the API
- **Rate Limiting** — Max 10 contact submissions per 15 minutes per IP
- **Input Validation** — Server-side checks on all fields
- **Parameterized Queries** — Prevents SQL injection (using mysql2 prepared statements)
- **Admin Token** — Messages endpoint protected by secret header

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MySQL (via mysql2) |
| Security | Helmet, CORS, Rate Limiting |
| Fonts | Syne, Space Mono (Google Fonts) |
| Icons | Boxicons |

---

**Built by Karan Ganesan · 2026**