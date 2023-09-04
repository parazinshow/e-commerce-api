const User = require('../models/userModel')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const register = async (req, res) => {
  const { email, password, name } = req.body

  const emailAlreadyExists = await User.findOne({ email })

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists')
  }

  const isFirstAccount = (await User.countDocuments({})) === 0

  const role = isFirstAccount ? 'admin' : 'user'

  if (!email || !password || !name) {
    throw new BadRequestError('Please provide your credentials')
  }

  try {
    const user = await User.create({ email, password, name, role })
    const tokenUser = createTokenUser(user)

    attachCookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.CREATED).json({ user: tokenUser })
  } catch (error) {
    console.log(error)
  }
}
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new CustomError.BadRequestError(
      'Please please provide email and password'
    )
  }

  const user = await User.findOne({ email })

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials')
  }

  const userCredentials = createTokenUser(user)

  attachCookiesToResponse({ res, user: userCredentials })

  res.status(StatusCodes.OK).json({ user: userCredentials })
}
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' })
}

module.exports = {
  register,
  login,
  logout,
}
