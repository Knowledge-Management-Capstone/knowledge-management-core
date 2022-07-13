import mongoose from 'mongoose'

const messageSchema = mongoose.Schema(
  {
    text: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

const Message = mongoose.model('Message', messageSchema)

export default Message
