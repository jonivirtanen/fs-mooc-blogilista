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
    return response.json(Blog.format(savedBlog))
  } catch (expection) {
    console.log(expection)
    return response.status(500).json({ error: 'server error' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findOneAndRemove(request.params.id)

    response.status(204).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'no such id' })
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
