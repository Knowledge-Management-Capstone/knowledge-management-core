import asyncHandler from 'express-async-handler'
import Team from '../models/teamModel.js'
import Message from '../models/messageModel.js'

/**
 * @desc Send Message
 * @route POST /api/chat/:id
 * @access Private/User
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { text, senderId } = req.body
  const { id } = req.params

  const message = await Message.create({ text, sender: senderId })
  await Team.findByIdAndUpdate(id, {
    $push: {
      message: message._id
    }
  })

  res.status(200).send({ message: 'message sent successfully' })
})

const getAllMessages = asyncHandler(async (req, res) => {
  const { id } = req.params

  const { messages } = await Team.findById(id).populate({
    path: 'message',
    // TODO: reduce nested populate by extract messages to MessageModel
    populate: {
      path: 'sender'
    }
  })

  res.status(200).json(messages)
})

export { sendMessage, getAllMessages }
