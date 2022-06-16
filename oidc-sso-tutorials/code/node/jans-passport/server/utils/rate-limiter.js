const rateLimit = require('express-rate-limit')
const config = require('config')

const windowMs = config.get('rateLimitWindowMs')
const max = config.get('rateLimitMaxRequestAllow')

const rateLimiter = rateLimit({
  windowMs,
  max,
  message: `You have exceeded the ${max} requests in ${windowMs} milliseconds limit!`,
  headers: true
})

module.exports = {
  rateLimiter
}
