import express from 'express'
import http from 'http'
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

dotenv.config()

const PORT = process.env.PORT || 5000

connectDB()

const app = express()
const server = http.createServer(app)

// socket
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5000',
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
  console.log(socket.id)

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.id)
  })
})

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

app.use('/api/users', userRoute)
app.use('/api/admin', adminRoute)
app.use('/api/team', teamRoute)
app.use('/api/folder', folderRoute)
app.use('/api/document', documentRoute)

app.use(notFound)
app.use(errorHandler)

server.listen(
  PORT,
  console.log(`Server is running on port ${PORT}`.yellow.bold)
)
