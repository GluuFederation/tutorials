
const chai = require('chai')
const sinon = require('sinon')
const got = require('got')
const config = require('config')
// const { globalErrorHandler } = require('../server/utils/error-handler.js')

const assert = chai.assert
const passportConfig = config.get('passportConfig')

async function generateStrategyError () {
  const response = await got(
    'http://127.0.0.1:8090/passport/error',
    { throwHttpErrors: false, followRedirect: false }
  )
  const headers = response.headers
  assert.equal(headers.location, `${passportConfig.failureRedirectUrl}?failure=An%20error%20occurred`)
}

describe('error-handler.js test', () => {
  it('should call globalErrorHandler with correct error message', async () => {
    // const globalErrorHandlerSpy = sinon.spy(globalErrorHandler)
    await generateStrategyError()
    // TODO: spy and assert globalErrorHandlerSpy
    // sinon.assert.calledOnce(globalErrorHandlerSpy)
    sinon.restore()
  })
})
