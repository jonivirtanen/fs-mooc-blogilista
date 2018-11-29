const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs.map(Blog.format))
})

blogsRouter.get('/favicon.ico', (request, response) => {
  response.status(204)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = new Blog(request.body)

    if (!blog.likes) {
      blog.likes = 0
    }

    if (blog.title === undefined || blog.url === undefined) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    const user = await User.findById(decodedToken.id)
    blog.user = user._id

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    return response.json(Blog.format(savedBlog))
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      console.log(exception)
      response.status(500).json({ error: 'server error' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const blogToBeRemoved = await Blog.findById(request.params.id)
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    if (blogToBeRemoved.user.toString() === decodedToken.id) {
      await blogToBeRemoved.remove()
      response.status(204).end()
    }
  } catch (exception) {
    if (exception.name === 'JsonWebTokenError') {
      response.status(401).json({ error: exception.message })
    } else {
      response.status(400).send({ error: 'no such id' })
    }
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const newBlog = await Blog
    .findById(request.params.id)

  newBlog.likes = request.body.likes

  const updatedBlog = await Blog
    .findByIdAndUpdate(request.params.id, newBlog, { new: true })

  response.status(202).json(Blog.format(updatedBlog))
})

module.exports = blogsRouter
