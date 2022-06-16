const { Given, When, Then, AfterStep, BeforeStep } = require('@cucumber/cucumber')
const chai = require('chai')
const config = require('config')
const { setupServer } = require('../../helper')

const assert = chai.assert
let requester
require('events').defaultMaxListeners = 100

BeforeStep(async () => {
  requester = await setupServer()
})

AfterStep(async () => {
  await requester.close()
})

Given('configured rate limit is 100 requests in 86400000 ms', async () => {
  // check if config file has 100 and 86400000
  assert.equal(config.get('rateLimitMaxRequestAllow'), 100)
  assert.equal(config.get('rateLimitWindowMs'), 86400000)
})

When('{string} is requested {int} times in less then 86400000 ms by the same client', async (endpoint, requestsCount) => {
  for (let i = 1; i <= requestsCount; i++) {
    this.lastResponse = await requester.get(`/passport${endpoint}`)
  }
})

Then('last request response should have status code {int}', async (responseStatusCode) => {
  assert.equal(this.lastResponse.statusCode, responseStatusCode,
    `response.statusCode is NOT ${responseStatusCode}`)
})
