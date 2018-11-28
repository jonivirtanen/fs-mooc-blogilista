const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  password: String,
  isAdult: Boolean
})

userSchema.statics.format = (user, callback) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    isAdult: user.isAdult
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User
