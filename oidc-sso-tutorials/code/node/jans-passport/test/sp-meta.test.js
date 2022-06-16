const chai = require('chai')
const rewire = require('rewire')
const PassportSAMLStrategy = require('passport-saml').Strategy
const rewireSPMeta = rewire('../server/sp-meta')
const config = require('config')

const assert = chai.assert
const passportConfigAuthorizedResponse = config.get('passportConfigAuthorizedResponse')

describe('Test SP Meta Helper', () => {
  describe('writeMeta_ test', () => {
    const writeMeta_ = rewireSPMeta.__get__('writeMeta_')

    it('should exist', () => {
      assert.exists(writeMeta_)
    })

    it('should be function', () => {
      assert.isFunction(writeMeta_, 'writeMeta_ is not a function')
    })
  })

  describe('generate meta test', () => {
    const generate = rewireSPMeta.__get__('generate')
    const testSAMLProvider = passportConfigAuthorizedResponse.providers.find(p => p.id === 'saml-only-1')
    const metaFile = `../server/idp-metadata/${testSAMLProvider.id}.xmll`

    it('should exist', () => {
      assert.exists(generate)
    })

    it('should be function', () => {
      assert.isFunction(generate, 'generateJWKS is not a function')
    })

    it('should generate metafile for provider in idp-metadata folder', async () => {
      const oPassportSAMLStrategy = new PassportSAMLStrategy(testSAMLProvider.options, () => { /* */ })

      await generate(testSAMLProvider, oPassportSAMLStrategy)
      assert.exists(metaFile, `${metaFile} file not found`)
    })
  })
})
