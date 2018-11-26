const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})

  response.json(blogs.map(Blog.format))
})

blogsRouter.get('/favicon.ico', (request, response) => {
  response.status(204)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body)

    if (!blog.likes) {
      blog.likes = 0
    }

    if (blog.title === undefined || blog.url === undefined) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    const savedBlog = await blog.save()
    return response.status(201).json(Blog.format(savedBlog))
  } catch (expection) {
    console.log(expection)
    return response.status(500).json({ error: 'server error' })
  }
})

module.exports = blogsRouter
