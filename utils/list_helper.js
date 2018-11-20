const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = (sum, item) => {
    return sum + item.likes
  }

  return blogs.reduce(sum, 0)
}

module.exports = {
  dummy,
  totalLikes
}
