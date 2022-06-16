
const logger = require('./logging')
const misc = require('./misc')
const fs = require('fs')
const Promise = require('bluebird')

/**
 * Write given data to given file
 * @param {*} fileNameWithPath : Variable with full file location
 * @param {*} data : data
 * @returns undefined
 */
const writeDataToFile = (fileNameWithPath, data) => {
  const openF = misc.curry2AndFlip(Promise.promisify(fs.open))
  const writeF = misc.curry2AndFlip(Promise.promisify(fs.write))
  let fd
  const chain = misc.pipePromise(
    openF('w'),
    fdesc => {
      // Save file descriptor in a temp variable (will be needed afterwards)
      fd = fdesc
      return fd
    },
    writeF(data),
    written => {
      logger.log2('verbose', `${written} bytes were written`)
      return fs.closeSync(fd) // returns undefined
    }
  )

  logger.log2('info', `Creating file ${fileNameWithPath}`)
  return chain(fileNameWithPath)
}

/**
* Make Directory if not exists and return path
* @param path: directory path
* @returns directory path
*/
const makeDir = (path) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  return path
}

module.exports = {
  makeDir,
  writeDataToFile
}
