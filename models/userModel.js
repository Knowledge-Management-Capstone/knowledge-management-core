import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    userId: { type: String, required: true },
    faculty: { type: String, required: true },
    major: { type: String, required: true },
    accountType: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
)

userSchema.methods.matchPassword = async enteredPassword =>
  await bcrypt.compare(enteredPassword, this.password)

userSchema.pre('save', async next => {
  if (!this.isModified(password)) next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

export default User
