import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'

const PORT = process.env.PORT || 5000

dotenv.config()

const app = express()

// middlewares
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.json({
    message: 'Hi mom!'
  })
})

app.listen(PORT, console.log(`Server is running on port ${PORT}`))
