const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

blogSchema.statics.format = (blog, callback) => {
  return {
    id: blog.id,
    title: blog.title,
    author: blog.author,
    url: blog.url,
    likes: blog.likes
  }
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
