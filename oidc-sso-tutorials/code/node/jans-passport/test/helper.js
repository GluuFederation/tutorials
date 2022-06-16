// Use this file to avoid repeating yourself (DRY!), helper functions.

const InitMock = require('./testdata/init-mock')
const logger = require('../server/utils/logging')
const config = require('config')
const basicConfig = config.get('passportConfig')
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

/**
 * Mocks external endpoints for app initalization
 */
const mockedAppInit = function () {
  const initMock = new InitMock()
  initMock.passportConfigEndpoint()
  initMock.umaConfigurationEndpoint()
  initMock.umaTokenEndpoint()
}

/**
 * Configures logger to be used in unit tests when needed
 */
const configureLogger = () => {
  logger.configure(
    {
      level: basicConfig.logLevel,
      consoleLogOnly: basicConfig.consoleLogOnly
    })
}

/**
 * Setup and start server for cucumber test
 */
const setupServer = async function () {
  const app = require('../server/app')
  await app.on('appStarted', () => {
    console.log('app started...')
  })
  await app.rateLimiter.resetKey('::ffff:127.0.0.1')
  return chai.request(app).keepOpen()
}

module.exports = {
  mockedAppInit,
  configureLogger,
  setupServer
}
