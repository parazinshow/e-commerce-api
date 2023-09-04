const User = require('../models/userModel')
const {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
} = require('../errors')
const { StatusCodes } = require('http-status-codes')
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password')
  res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password')

  if (!user) {
    throw new NotFoundError(`No user was found with ID: ${req.params.id}`)
  }

  checkPermissions(req.user, user._id)

  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user })
}

//updateUser with save()
const updateUser = async (req, res) => {
  const { email, name } = req.body

  if (!email || !name) {
    throw new BadRequestError('Please provide all values required!')
  }

  const user = await User.findOne({ _id: req.user.userId })

  user.name = name
  user.email = email

  await user.save()

  const tokenUser = createTokenUser(user)

  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
}

// const updateUser = async (req, res) => {
//   const { email, name } = req.body

//   if (!email || !name) {
//     throw new BadRequestError('Please provide all values required!')
//   }

//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { email, name },
//     { new: true, runValidators: true }
//   )

//   const tokenUser = createTokenUser(user)

//   attachCookiesToResponse({ res, user: tokenUser })

//   res.status(StatusCodes.OK).json({ user: tokenUser })
// }

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please insert your old and new password')
  }

  const user = await User.findOne({ _id: req.user.userId })

  const isPassCorrect = user.comparePassword(oldPassword)

  if (!isPassCorrect) {
    throw new UnauthenticatedError('Invalid credentials')
  }

  user.password = newPassword

  const newUserCredentials = await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated' })
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
