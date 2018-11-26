const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const sum = (tempsum, item) => {
    return tempsum + item.likes
  }

  return blogs.reduce(sum, 0)
}

const favoriteBlog = (blogs) => {
  let mostLikedBlog = blogs[0]

  blogs.forEach((element) => {
    if (element.likes > mostLikedBlog.likes) {
      mostLikedBlog = element
    }
  })

  return mostLikedBlog
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}
