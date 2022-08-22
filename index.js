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

import Chat from './models/chatModel.js'
import Message from './models/messageModel.js'

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

// TODO: Move this code somewhere
io.on('connection', socket => {
  console.log('Connected to socket.io')

  socket.on('join_room', roomId => {
    socket.join(roomId)
    console.log('User joins', roomId)
    socket.emit('joined_room')
  })

  socket.on('send_message', async (roomId, { text, sender }) => {
    const message = await Message.create({ text, sender })
    await Chat.findByIdAndUpdate(roomId, {
      $push: {
        message: message._id
      }
    })

    socket.broadcast.to(roomId).emit('receive_message', message)
  })

  socket.on('disconnect', () => {
    console.log('disconected')
  })
})
