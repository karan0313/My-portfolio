require('dotenv').config();
const express  = require('express');
const mysql2   = require('mysql2/promise');
const cors     = require('cors');
const helmet   = require('helmet');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ───────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting — 10 contact submissions per 15 min per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// ── DATABASE POOL ────────────────────────────────────────
let pool;

async function initDB() {
  pool = mysql2.createPool({
    host:               process.env.DB_HOST     || 'localhost',
    port:               process.env.DB_PORT     || 3306,
    user:               process.env.DB_USER     || 'root',
    password:           process.env.DB_PASSWORD || '',
    database:           process.env.DB_NAME     || 'karan_portfolio',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
  });

  // Test connection
  const conn = await pool.getConnection();
  console.log('✅  MySQL connected successfully');

  // Auto-create table if not exists
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      name       VARCHAR(120)  NOT NULL,
      email      VARCHAR(180)  NOT NULL,
      phone      VARCHAR(20)   DEFAULT NULL,
      subject    VARCHAR(200)  NOT NULL,
      message    TEXT          NOT NULL,
      ip_address VARCHAR(45)   DEFAULT NULL,
      created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
      is_read    TINYINT(1)    DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  console.log('✅  Table "contact_messages" ready');
  conn.release();
}

// ── ROUTES ───────────────────────────────────────────────

/** Health check */
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Karan Portfolio API is running 🚀' });
});

/**
 * POST /api/contact
 * Saves a contact form message to MySQL
 */
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  // ── Validation ──
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, subject and message are required.'
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  // Length guards
  if (name.length > 120 || email.length > 180 || subject.length > 200 || message.length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'One or more fields exceed the maximum allowed length.'
    });
  }

  // ── Insert to DB ──
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const [result] = await pool.execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        subject.trim(),
        message.trim(),
        ip
      ]
    );

    console.log(`📩  New message #${result.insertId} from ${email}`);

    return res.status(201).json({
      success: true,
      message: 'Message received! Karan will get back to you shortly.',
      id: result.insertId
    });

  } catch (err) {
    console.error('DB Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error. Please try again or email directly.'
    });
  }
});

/**
 * GET /api/messages
 * Returns all contact messages (protect with a secret token in production)
 */
app.get('/api/messages', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, subject, LEFT(message, 80) AS preview, created_at, is_read FROM contact_messages ORDER BY created_at DESC'
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

/**
 * PATCH /api/messages/:id/read
 * Mark a message as read
 */
app.patch('/api/messages/:id/read', async (req, res) => {
  const token = req.headers['x-admin-token'];
  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const { id } = req.params;
  try {
    await pool.execute('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [id]);
    res.json({ success: true, message: `Message ${id} marked as read.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB error' });
  }
});

// ── 404 ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── START ─────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  Server running → http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌  Failed to connect to MySQL:', err.message);
    process.exit(1);
  });