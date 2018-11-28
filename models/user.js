const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  password: String,
  isAdult: Boolean,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }]
})

userSchema.statics.format = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    isAdult: user.isAdult,
    blogs: user.blogs
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
