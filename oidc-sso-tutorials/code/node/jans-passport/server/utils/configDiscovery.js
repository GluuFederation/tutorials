const misc = require('./misc')
const logger = require('./logging')
const uma = require('./uma')

/**
 * Validates and parses data fetched from config endpoint
 * @param data : Object containing configuration data fetched from endpoint
 * @returns {*}: Object containing validated data
 */
function validate (data) {
  // Perform a shallow validation on configuration data gathered
  const paths = [['conf', 'logging', 'level'], ['conf', 'serverWebPort']]

  if (misc.pathsHaveData(paths, data) && Array.isArray(data.providers)) {
    logger.log2('info', 'Configuration data has been parsed')
    return data
  } else {
    throw new Error('Received data not in the expected format')
  }
}

/**
 * Retrieves the full configuration from passport configuration endpoint
 * @param cfgEndpoint : configuration endpoint got from basic config file
 * @returns {*}
 */
function retrieve (cfgEndpoint) {
  const options = {
    uri: cfgEndpoint,
    throwHttpErrors: false
  }
  const chain = misc.pipePromise(
    uma.request,
    validate
  )
  return chain(options)
}

module.exports = {
  retrieve: retrieve
}
