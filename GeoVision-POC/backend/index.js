const express = require('express')
const cors = require('cors')
const multer = require('multer')

const app = express()
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
})
const PORT = process.env.PORT ?? 3001
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000'

app.use(cors())
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/health`, {
      signal: AbortSignal.timeout(10_000),
    })
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (err) {
    console.error('Model health check failed:', err)
    return res.status(503).json({ status: 'unavailable' })
  }
})

app.get('/api/model-info', async (_req, res) => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/model-info`, {
      signal: AbortSignal.timeout(10_000),
    })
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (err) {
    console.error('Model info request failed:', err)
    return res.status(503).json({ error: 'Analysis service unavailable' })
  }
})

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' })
  }
  if (!req.file.mimetype.startsWith('image/')) {
    return res.status(400).json({ error: 'Uploaded file must be an image' })
  }

  try {
    const form = new FormData()
    form.append(
      'image',
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname,
    )

    const response = await fetch(`${PYTHON_SERVICE_URL}/predict`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(120_000),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Python service error:', data)
      return res.status(response.status).json({
        error: data.detail ?? 'Analysis failed',
      })
    }
    return res.json(data)
  } catch (err) {
    console.error('Failed to reach Python service:', err)
    return res.status(503).json({ error: 'Analysis service unavailable' })
  }
})

app.use((err, _req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Image exceeds 10 MB' })
  }
  return next(err)
})

app.listen(PORT, () => {
  console.log(`GeoVision backend listening on port ${PORT}`)
})
