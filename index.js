import express from 'express'
import { Server } from 'socket.io'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import colors from 'colors'

import connectDB from './config/db.js'
import { notFound, errorHandler } from './middlewares/errorMiddleware.js'

import userRoute from './routes/userRoute.js'
import adminRoute from './routes/adminRoute.js'
import teamRoute from './routes/teamRoute.js'
import folderRoute from './routes/folderRoute.js'
import documentRoute from './routes/documentRoute.js'
import chatRoute from './routes/chatRoute.js'

dotenv.config()

const PORT = process.env.PORT || 5000

connectDB()

const app = express()

// middlewares
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// routes
app.get('/', (req, res) => {
  res.json({
    message: 'Hi mom!'
  })
})

app.use('/api/user', userRoute)
app.use('/api/admin', adminRoute)
app.use('/api/team', teamRoute)
app.use('/api/folder', folderRoute)
app.use('/api/document', documentRoute)
app.use('/api/chat', chatRoute)

app.use(notFound)
app.use(errorHandler)

const server = app.listen(
  PORT,
  console.log(`Server is running on port ${PORT}`.yellow.bold)
)

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:8000'
  }
})

io.on('connection', socket => {
  console.log('Connected to socket.io')

  socket.emit('chat', {
    text: 'hi',
    sender: {
      _id: 123,
      fullName: 'Dian Rahmaji'
    }
  })

  socket.on('disconnect', () => {
    console.log('disconected')
  })
})
