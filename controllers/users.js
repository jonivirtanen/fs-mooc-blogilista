const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs')

  response.json(users.map(User.format))
})

usersRouter.get('/favicon.ico', async (request, response) => {
  response.status(204)
})

usersRouter.post('/', async (request, response) => {
  try {
    const { body } = request

    if (body.username === undefined) {
      return response.status(400).json({ error: 'username must be provided' })
    }

    const existingUsers = await User.find({ username: body.username })
    if (existingUsers.length !== 0) {
      return response.status(400).json({ error: 'username must be unique' })
    }

    if (body.password === undefined || body.password.length < 3) {
      return response.status(400).json({ error: 'password is too short' })
    }

    const passwordHash = await bcrypt.hash(body.password, 10)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
      isAdult: body.isAdult === undefined ? true : body.isAdult
    })

    const savedUser = await user.save()
    return response.json(savedUser)
  } catch (exception) {
    console.log(exception)
    return response.status(500).json({ error: 'something went wrong!' })
  }
})

module.exports = usersRouter
