const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    minlength: 3,
    maxlength: 50,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  email: {
    type: String,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email',
    },
    required: [true, 'Please provide a email'],
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
})

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.comparePassword = async function (pass) {
  const isMatch = await bcrypt.compare(pass, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
