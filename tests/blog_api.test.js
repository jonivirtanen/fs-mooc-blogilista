/* eslint-disable no-undef */

const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const { blogsInDb, initialBlogs } = require('./test_helper')

const api = supertest(app)

beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = initialBlogs.map(b => new Blog(b))
  await Promise.all(blogObjects.map(b => b.save()))
})

describe('blog API tests', () => {
  test('blogs are returned as json', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('inserting a valid blog', async () => {
    const newBlog = {
      title: 'Automekaanikon Päiväkirja',
      author: 'Masa Mainio',
      url: 'www.blogspot.com',
      likes: 100
    }

    const blogsBefore = await blogsInDb()

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    newBlog.id = response.body.id
    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length + 1)

    expect(blogsAfter).toContainEqual(newBlog)
  })

  test('insert blog missing \'likes\', \'likes\' set to 0', async () => {
    const newBlog = {
      title: 'Lentokoneiden toiminta',
      author: 'Masa Mainio',
      url: 'www.blogspot.com',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
  })

  test('can not insert blog that has no title or url', async () => {
    const newBlog = {
      author: 'Masa Mainio',
      likes: 10,
    }

    const blogsBefore = await blogsInDb()

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await blogsInDb()

    expect(response.length).toBe(blogsBefore.length)
  })
})

afterAll(() => {
  server.close()
})
