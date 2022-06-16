const { Given, When, Then, BeforeStep, AfterStep } = require('@cucumber/cucumber')
const chai = require('chai')
const { setupServer } = require('../../helper')

const assert = chai.assert
let requester

BeforeStep(async () => {
  requester = await setupServer()
})

AfterStep(async () => {
  await requester.close()
})

Given('passport server is up and running', async () => {
  const response = await requester.get('/passport/health-check')
  assert.equal(response.statusCode, 200,
    'response.statusCode is NOT 200')
})

When('my aggregator access metrics endpoint', async () => {
  const response = await requester.get('/passport/metrics')
  assert.isNotNull(response)
})

Then('should return me the metrics', async () => {
  const response = await requester.get('/passport/metrics')
  assert.propertyVal(response.headers, 'content-type', 'text/plain')
})

Given(
  'I access an {string} {int} times',
  async function (endpoint, numberOfTimes) {
    let counter = 0
    while (counter < numberOfTimes) {
      try {
        await requester.get(`${endpoint}`)
      } catch (err) {
        // empty block for errors status code (i.e. 404)
      }

      counter++
    }
  })

Then(
  '{string} count should be {int}',
  async function (endpointAlias, numberOfTimes) {
    const response = await requester.get('/passport/metrics')
    const body = response.text
    const pattern = new RegExp(
      `http_request_duration_seconds_count{status_code="\\d+",method="GET",path="${endpointAlias}.*`
    )
    const startIndex = body.search(pattern)
    const lineEndIndex = body.substring(startIndex).search('\n')
    const textLine = body.substr(startIndex, lineEndIndex)
    const lastSpaceIndex = textLine.lastIndexOf(' ')

    // after space is count number
    const countNumber = parseInt(textLine.substring(lastSpaceIndex + 1), 10)
    assert.equal(countNumber, numberOfTimes)
  })
