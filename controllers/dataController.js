import asyncHandler from 'express-async-handler'
import Document from '../models/documentModel.js'
import Folder from '../models/folderModel'
import Message from '../models/messageModel.js'
import Repository from '../models/repositoryModel.js'
import Team from '../models/teamModel.js'
import User from '../models/userModel.js'

const reset = asyncHandler(async (req, res) => {
  await Promise.all([
    Document.deleteMany({}),
    Folder.deleteMany({}),
    Message.deleteMany({}),
    Repository.deleteMany({}),
    Team.deleteMany({}),
    User.deleteMany({})
  ])

  res.status(204).json({ message: 'Successfully reset database' })
})

export { reset }
