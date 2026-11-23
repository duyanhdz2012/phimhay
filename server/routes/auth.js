import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'phimhay-secret-key-change-in-production'
const SALT_ROUNDS = 10

export const authRouter = Router()

authRouter.post('/register', (req, res) => {
  try {
    const { email, username, password } = req.body
    if (!email?.trim() || !username?.trim() || !password) {
      return res.status(400).json({ error: 'Thiếu email, username hoặc mật khẩu' })
    }
    const password_hash = bcrypt.hashSync(password, SALT_ROUNDS)
    const stmt = db.prepare(
      "INSERT INTO users (email, username, password_hash, role) VALUES (?, ?, ?, 'normal')"
    )
    stmt.run(email.trim(), username.trim(), password_hash)
    const row = db.prepare('SELECT id, email, username, role, created_at FROM users WHERE id = last_insert_rowid()').get()
    const token = jwt.sign({ id: row.id, role: row.role }, JWT_SECRET)
    res.status(201).json({ user: row, token })
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email hoặc username đã tồn tại' })
    }
    res.status(500).json({ error: 'Lỗi đăng ký' })
  }
})

authRouter.post('/login', (req, res) => {
  try {
    const { email, password } = req.body
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Thiếu email hoặc mật khẩu' })
    }
    const row = db.prepare(
      'SELECT id, email, username, password_hash, role, created_at FROM users WHERE email = ?'
    ).get(email.trim())
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' })
    }
    const user = {
      id: row.id,
      email: row.email,
      username: row.username,
      role: row.role,
      created_at: row.created_at,
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET)
    res.json({ user, token })
  } catch (e) {
    res.status(500).json({ error: 'Lỗi đăng nhập' })
  }
})

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Chưa đăng nhập' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.id
    req.userRole = payload.role
    next()
  } catch {
    res.status(401).json({ error: 'Token không hợp lệ' })
  }
}

export function adminMiddleware(req, res, next) {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Chỉ admin mới truy cập được' })
  next()
}

authRouter.get('/me', authMiddleware, (req, res) => {
  const row = db.prepare(
    'SELECT id, email, username, role, created_at FROM users WHERE id = ?'
  ).get(req.userId)
  if (!row) return res.status(404).json({ error: 'Không tìm thấy user' })
  res.json({ user: row })
})
