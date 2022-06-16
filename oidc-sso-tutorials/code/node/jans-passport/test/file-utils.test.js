
const chai = require('chai')
const fileUtils = require('../server/utils/file-utils')
const path = require('path')
const sinon = require('sinon')

const assert = chai.assert

describe('fileUtils.makeDir', () => {
  it('should be exists', () => {
    assert.exists(fileUtils.makeDir)
  })

  it('should be function', () => {
    assert.isFunction(fileUtils.makeDir)
  })

  it('jwksDir should be return correct path', () => {
    const expectedJWKSFolderPath = path.join(__dirname, '../server/jwks')
    assert.equal(fileUtils.makeDir(expectedJWKSFolderPath), expectedJWKSFolderPath)
  })
})

describe('fileUtils.writeDataToFile', () => {
  it('should be exists', () => {
    assert.exists(fileUtils.writeDataToFile)
  })

  it('should be function', () => {
    assert.isFunction(fileUtils.writeDataToFile)
  })

  it('should called correctly with valid arguments', async () => {
    const expectedJWKSFolderPath = path.join(__dirname, '../server/jwks')
    const fileName = path.join(fileUtils.makeDir(expectedJWKSFolderPath), 'test-provider-unit-test.json')
    const writeDataToFileSpy = sinon.spy(fileUtils, 'writeDataToFile')
    await fileUtils.writeDataToFile(fileName, JSON.stringify({ ktype: 'RS256' }))

    assert(writeDataToFileSpy.calledOnceWith(fileName, JSON.stringify({ ktype: 'RS256' })))
  })
})
