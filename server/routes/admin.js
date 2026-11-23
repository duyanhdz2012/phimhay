import { Router } from 'express'
import { db } from '../db.js'
import { authMiddleware, adminMiddleware } from './auth.js'

export const adminRouter = Router()

adminRouter.use(authMiddleware)
adminRouter.use(adminMiddleware)

adminRouter.get('/users', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT id, email, username, role, created_at FROM users ORDER BY id ASC'
    ).all()
    res.json({ users: rows })
  } catch (e) {
    res.status(500).json({ error: 'Lỗi tải danh sách tài khoản' })
  }
})

adminRouter.patch('/users/:id', (req, res) => {
  try {
    const id = Number(req.params.id)
    const { role } = req.body
    if (!id || !['vip', 'normal', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'ID hoặc role không hợp lệ' })
    }
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?')
    const result = stmt.run(role, id)
    if (result.changes === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    const row = db.prepare('SELECT id, email, username, role, created_at FROM users WHERE id = ?').get(id)
    res.json({ user: row })
  } catch (e) {
    res.status(500).json({ error: 'Lỗi cập nhật tài khoản' })
  }
})

adminRouter.delete('/users/:id', (req, res) => {
  try {
    const id = Number(req.params.id)
    if (id === req.userId) return res.status(400).json({ error: 'Không thể xóa chính mình' })
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    if (result.changes === 0) return res.status(404).json({ error: 'Không tìm thấy tài khoản' })
    res.status(204).send()
  } catch (e) {
    res.status(500).json({ error: 'Lỗi xóa tài khoản' })
  }
})
