/* eslint-disable no-undef */

const supertest = require('supertest')
const { app, server } = require('../index')
const Blog = require('../models/blog')
const User = require('../models/user')
const { blogsInDb, initialBlogs, usersInDb } = require('./test_helper')

const api = supertest(app)

describe('blog API tests', () => {
  beforeAll(async () => {
    await Blog.remove({})

    const blogObjects = initialBlogs.map(b => new Blog(b))
    await Promise.all(blogObjects.map(b => b.save()))
  })

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
      .expect(200)
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
      .expect(200)
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
      .expect(200)
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

  describe('User API tests', async () => {
    beforeAll(async () => {
      await User.remove({})
      const user = new User({ username: 'MaMa', name: 'Masa Mainio', password: 'salainenSana' })
      const savedUser = await user.save()
      console.log('savedUser', savedUser)
    })

    test('GET users returns MaMa account when tests are initialized', async () => {
      const response = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })

    test('POST users inserts account to db and returns correct status', async () => {
      const usersBefore = await usersInDb()

      const addedUser = await api
        .post('/api/users')
        .send({
          username: 'Mallikas',
          name: 'Matti Mallikas',
          password: 'salattuSana',
          isAdult: true
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      usersAfter = await usersInDb()

      expect(usersAfter.length).toBe(usersBefore.length + 1)
      const UID = usersAfter.map(u => u.id)
      expect(UID).toContain(addedUser.body._id)
    })

    test('POST user with too short or undefined password returns error valid error code and message', async () => {
      const invalidUser = {
        username: 'Tekija',
        name: 'Teppo Tekija'
      }

      let response = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toEqual({ error: 'password is too short' })

      invalidUser.password = 'as'

      response = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toEqual({ error: 'password is too short' })
    })

    test('POST user with duplicate or undefined username returns valid error code and message', async () => {
      const invalidUser = {
        name: 'Masa Mainio',
        password: 'salasana'
      }

      let response = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toEqual({ error: 'username must be provided' })

      invalidUser.username = 'MaMa'

      response = await api
        .post('/api/users')
        .send(invalidUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
      
      expect(response.body).toEqual({ error: 'username must be unique' })
    })
  })

  afterAll(() => {
    server.close()
  })
})
