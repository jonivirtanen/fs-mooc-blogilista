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

  test('Blog can be deleted', async () => {
    const newBlog = initialBlogs[0]
    delete newBlog._id

    const addedBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsBeforeDelete = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog.body.id}`)
      .expect(204)

    const blogsAfterDelete = await blogsInDb()

    expect(blogsAfterDelete).not.toContainEqual(addedBlog)
    expect(blogsAfterDelete.length).toEqual(blogsBeforeDelete.length - 1)
  })

  test('Blog can be modified', async () => {
    const allBlogs = await blogsInDb()

    const newBlog = { ...allBlogs[0] }
    newBlog.likes += 1

    const addedBlog = await api
      .put(`/api/blogs/${newBlog.id}`)
      .send(newBlog)
      .expect(202)
      .expect('Content-Type', /application\/json/)

    expect(addedBlog.body.likes).toBe(allBlogs[0].likes + 1)
  })
})

afterAll(() => {
  server.close()
})
