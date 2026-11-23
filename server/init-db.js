import { db, initSchema } from './db.js'

initSchema()
console.log('Database initialized. Table: users (id, email, username, password_hash, role, created_at)')
db.close()
