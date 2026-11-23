import bcrypt from 'bcryptjs'
import { db, initSchema } from './db.js'

initSchema()

const existing = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get()
if (existing) {
  console.log('Đã có tài khoản admin.')
  db.close()
  process.exit(0)
}

const email = 'admin@phimhay.local'
const username = 'admin'
const password = 'admin123'
const password_hash = bcrypt.hashSync(password, 10)

db.prepare(
  "INSERT INTO users (email, username, password_hash, role) VALUES (?, ?, ?, 'admin')"
).run(email, username, password_hash)

console.log('Đã tạo tài khoản admin:')
console.log('  Email:', email)
console.log('  Mật khẩu:', password)
console.log('  (Đổi mật khẩu sau khi đăng nhập.)')
db.close()
