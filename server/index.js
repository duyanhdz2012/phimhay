import express from 'express'
import cors from 'cors'
import { db, initSchema } from './db.js'
import { authRouter } from './routes/auth.js'
import { adminRouter } from './routes/admin.js'

initSchema()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/admin', adminRouter)

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  res.status(500).json({ error: 'Lỗi máy chủ' })
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
