import mongoose from 'mongoose'

const folderSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  {
    timestamps: true
  }
)

const Folder = mongoose.model('Folder', folderSchema)

export default Folder
