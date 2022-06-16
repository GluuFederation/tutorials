const InitMock = require('./testdata/init-mock')
const initMock = new InitMock()
const config = require('config')

const passportConfigAuthorizedResponse = config.get('passportConfigAuthorizedResponse')
const oidcProvider = passportConfigAuthorizedResponse.providers.find(p => p.id === 'oidccedev6')

/**
 * Wait for server to start (event appStarted) to start tests
 */
before((done) => {
  initMock.discoveryURL(oidcProvider.options.issuer)

  const server = require('../server/app')
  server.on('appStarted', function () {
    // remember you need --timeout on mocha CLI to be around 20000
    console.log('app started event listened...')
    done()
  })
})
