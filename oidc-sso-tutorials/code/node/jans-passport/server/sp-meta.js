const path = require('path')
const R = require('ramda')
const misc = require('./utils/misc')
const logger = require('./utils/logging')
const fileUtils = require('./utils/file-utils')

const writeMeta_ = R.curry(fileUtils.writeDataToFile)

function generate (provider, samlStrategy) {
  const opts = provider.options
  const idpMetaPath = path.join(__dirname, 'idp-metadata')
  const fileName = path.join(fileUtils.makeDir(idpMetaPath), provider.id + '.xml')
  const chain = misc.pipePromise(
    dcert => samlStrategy.generateServiceProviderMetadata(dcert, opts.signingCert),
    writeMeta_(fileName)
  )

  logger.log2('info', `Generating XML metadata for ${provider.displayName}`)
  chain(opts.decryptionCert).catch(err => logger.log2('error', `An error occurred: ${err}`))
}

module.exports = {
  generate: generate
}
