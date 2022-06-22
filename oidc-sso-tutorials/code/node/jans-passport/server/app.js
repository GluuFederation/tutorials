const config = require('config')
const logger = require('./utils/logging')
const providers = require('./providers')
const AppFactory = require('./app-factory')

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const appFactoryInstance = new AppFactory()
const app = appFactoryInstance.createApp()

const loggingConfig = config.get('logging')
const providersFile = config.get('providersFile')
const port = config.get('port')

function init () {
  logger.configure(loggingConfig)
  // configure passport providers
  const providersConfig = require(providersFile)
  try {
    providers.setup(providersConfig)
  } catch (e) {
    console.log(e)
  }
  app.listen(port, () => {
    logger.log2('info', `Server listening on localhost:${port}`)
    console.log(`Server listening on localhost:${port}`)
  })
}

init()
