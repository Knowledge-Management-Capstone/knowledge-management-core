import { Schema, model } from 'mongoose'

const chatSchema = Schema(
  {
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team'
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Message'
      }
    ]
  },
  {
    timestamps: true
  }
)

const Chat = model('Chat', chatSchema)

export default Chat
