const logger = (request, response, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next()
  }

  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  return next()
}

const tokenExtractor = (req, res, next) => {
  const getTokenFrom = (request) => {
    const auth = request.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      return auth.substring(7)
    }
    return null
  }
  req.token = getTokenFrom(req)
  next()
}

const error = (request, response) => {
  response.status(404).end()
}

module.exports = {
  logger,
  error,
  tokenExtractor
}
