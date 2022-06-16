
const chai = require('chai')
const rewire = require('rewire')
const cacheProviders = rewire('../server/cache-provider.js')
const testConfig = require('../config/test')
const redis = require('redis')
const fakeredis = require('fakeredis')

const assert = chai.assert

describe('cache provider test', () => {
  const retryStrategy = cacheProviders.__get__('retryStrategy')
  const testProvider = testConfig.passportConfigAuthorizedResponse.providers.find(provider => provider.id === 'saml-redis-test')
  testProvider.options.retry_strategy = retryStrategy

  it('redis is not live so we should get connection error response', () => {
    const client = redis.createClient(testProvider.options)

    client.on('ready', () => {
      assert.fail('redis connection should not work')
    })
    client.on('error', actualError => {
      const expectedError = new Error('Redis connection in broken state: retry aborted.')
      assert.equal(actualError.message, expectedError.message)
    })
  })

  it('redis is live so we should get connection', () => {
    const client = fakeredis.createClient(testProvider.options)

    client.on('error', actualError => {
      assert.fail('redis connection should work')
    })
  })

  it('getRedisProvider should return cache handlers', () => {
    const getRedisProvider = cacheProviders.__get__('getRedisProvider')
    const redisHandlers = getRedisProvider(testProvider.options, 100)
    assert.exists(redisHandlers.save, 'Failed to initialize redis provider save handler')
    assert.exists(redisHandlers.get, 'Failed to initialize redis provider get handler')
    assert.exists(redisHandlers.remove, 'Failed to initialize redis provider remove handler')
  })
})
