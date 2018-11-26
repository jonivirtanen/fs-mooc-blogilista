/* eslint-disable no-undef */

const listHelper = require('../utils/list_helper')
const blogs = require('./bloglist')

test('dummy is called', () => {
  const dummyblogs = []

  const result = listHelper.dummy(dummyblogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('First entry on the list equals to likes of that entry', () => {
    const arrayWithOneEntry = [blogs[0]]
    const result = listHelper.totalLikes(arrayWithOneEntry)
    expect(result).toBe(7)
  })

  test('When likes of an entry equal to zero sum equals to that', () => {
    const arrayWithZeroLikes = [blogs[4]]
    const result = listHelper.totalLikes(arrayWithZeroLikes)
    expect(result).toBe(0)
  })

  test('When all the entries are summed up equals to that', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(36)
  })
})

describe('favorite blog', () => {
  test('When all blogs are provided favorite blog is the one with most likes', () => {
    const result = listHelper.favoriteBlog(blogs)
    expect(result).toEqual(blogs[2])
  })

  test('Subset of blogs is provided, favorite blog is returned', () => {
    const subset = [blogs[0], blogs[1], blogs[5]]
    const result = listHelper.favoriteBlog(subset)
    expect(result).toEqual(blogs[0])
  })
})
