const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')

const app = express()
app.set("trust proxy", 1);
const passport = require("./controllers/passport");

app.use(passport.initialize());
app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: ['http://localhost:5173', 'https://datn-khaki-xi.vercel.app', 'https://datn-z8rb.vercel.app'],
  credentials: true
}))

app.use('/api/auth', authRoutes)
app.use("/api/translate", require("./routes/translateRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/series", require("./routes/seriesRoutes"));
app.use("/api/chapters", require("./routes/chapterRoutes"));
app.use("/api/glossary", require("./routes/glossaryRoutes"));

const testRoutes = require("./routes/test");

app.use("/api", testRoutes);
app.get('/', (req, res) => {
  res.send('Backend is running')
})

const multer = require('multer')

// Lỗi từ multer / Cloudinary (upload_stream) — trả JSON để frontend hiển thị đúng
app.use((err, req, res, next) => {
  if (!err) return next()

  if (!req.path.startsWith('/api')) {
    return res.status(500).send('Server error')
  }

  console.error('[api error]', req.method, req.path, err.message || err)

  if (err instanceof multer.MulterError) {
    const msg =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File quá lớn (tối đa 10MB)'
        : err.message
    return res.status(400).json({ message: msg })
  }

  if (err.http_code) {
    const code = Number(err.http_code)
    const status = code >= 400 && code < 600 ? code : 400
    return res.status(status).json({
      message: err.message || 'Lỗi dịch vụ lưu ảnh (Cloudinary)',
    })
  }

  return res.status(500).json({
    message: err.message || 'Upload thất bại',
  })
})

module.exports = app
