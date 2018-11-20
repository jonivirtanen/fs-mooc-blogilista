const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})

blogSchema.statics.format = function(blog, callback) {
  const fBlog = {
    ...blog._doc,
    id: blog._id
  }

  delete fBlog._id
  delete fBlog.__v
  return fBlog
}

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
