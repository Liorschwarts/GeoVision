const express = require('express')
const cors = require('cors')
const multer = require('multer')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const PORT = process.env.PORT ?? 3001
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000'

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' })
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
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('Python service error:', detail)
      return res.status(502).json({ error: 'Analysis failed' })
    }

    const data = await response.json()
    return res.json({ results: data.results })
  } catch (err) {
    console.error('Failed to reach Python service:', err)
    return res.status(503).json({ error: 'Analysis service unavailable' })
  }
})

app.listen(PORT)
