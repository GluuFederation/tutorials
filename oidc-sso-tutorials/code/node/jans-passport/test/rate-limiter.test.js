
const chai = require('chai')
const assert = chai.assert
const rewire = require('rewire')
const rateLimiterRewire = rewire('../server/utils/rate-limiter')
const config = require('config')
const rateLimit = require('express-rate-limit')

describe('rate-limiter.js test', () => {
  const windowMs = rateLimiterRewire.__get__('windowMs')
  const max = rateLimiterRewire.__get__('max')
  const rateLimiter = rateLimiterRewire.__get__('rateLimiter')

  it('windowMs should exist', () => {
    assert.exists(windowMs)
  })

  it('windowMs should be number', () => {
    assert.isNumber(windowMs)
  })

  it('windowMs should be equals to config value', () => {
    assert.equal(windowMs, config.get('rateLimitWindowMs'))
  })

  it('max should exist', () => {
    assert.exists(max)
  })

  it('max should be number', () => {
    assert.isNumber(max)
  })

  it('max should be equals to config value', () => {
    assert.equal(max, config.get('rateLimitMaxRequestAllow'))
  })

  it('rateLimiter should exist', () => {
    assert.exists(rateLimiter)
  })

  it('rateLimiter should be function', () => {
    assert.isFunction(rateLimiter)
  })

  it('rateLimiter should be equals to express-rate-limit module', () => {
    assert.isFunction(rateLimiter, rateLimit())
  })
})
