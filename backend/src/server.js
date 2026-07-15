require('dotenv').config()

const mongoUri = process.env.MONGO_URI?.trim()
if (!mongoUri) {
  console.error(
    '[backend] Missing MONGO_URI. Create a .env file in the backend folder (see .env.example) and set your MongoDB connection string.'
  )
  process.exit(1)
}

const PORT = Number(process.env.PORT) || 3000

const http = require('http')
const app = require('./app')
const connectDB = require('./config/db')
// Worker xử lý TranslationJob (OCR + dịch) chạy song song với server
const { startWorker } = require('./services/queue/translationWorker')

const server = http.createServer(app)

connectDB()
startWorker()

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})