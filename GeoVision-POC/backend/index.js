const express = require('express')
const cors = require('cors')
const multer = require('multer')

const app = express()
const upload = multer({ storage: multer.memoryStorage() })
const PORT = process.env.PORT ?? 3001
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL ?? 'http://localhost:8000'

const mockResults = () => [
  { city: 'Tokyo',      country: 'Japan',        score: Math.floor(88 + Math.random() * 10), lat: 35.6762,  lng: 139.6503 },
  { city: 'Paris',      country: 'France',        score: Math.floor(78 + Math.random() * 10), lat: 48.8566,  lng: 2.3522   },
  { city: 'Barcelona',  country: 'Spain',         score: Math.floor(68 + Math.random() * 10), lat: 41.3851,  lng: 2.1734   },
  { city: 'Cape Town',  country: 'South Africa',  score: Math.floor(58 + Math.random() * 10), lat: -33.9249, lng: 18.4241  },
  { city: 'Sydney',     country: 'Australia',     score: Math.floor(48 + Math.random() * 10), lat: -33.8688, lng: 151.2093 },
]

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.post('/api/analyze', upload.single('image'), (_req, res) => {
  setTimeout(() => res.json({ results: mockResults() }), 800)
})

app.listen(PORT)
