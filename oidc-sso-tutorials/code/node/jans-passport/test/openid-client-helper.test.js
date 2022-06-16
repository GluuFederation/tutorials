const chai = require('chai')
const { Strategy } = require('openid-client')
const rewire = require('rewire')
const rewiredOpenIDClientHelper = rewire('../server/utils/openid-client-helper')
const InitMock = require('./testdata/init-mock')
const config = require('config')
const nock = require('nock')
const sinon = require('sinon')
const jose = require('jose')
const { v4: uuidv4 } = require('uuid')
const fileUtils = require('../server/utils/file-utils')

const assert = chai.assert
const passportConfigAuthorizedResponse = config.get('passportConfigAuthorizedResponse')

describe('Test OpenID Client Helper', () => {
  const testProvider = passportConfigAuthorizedResponse.providers.find(p => p.id === 'oidccedev6privatejwt')

  describe('generateJWKS test', () => {
    const generateJWKS = rewiredOpenIDClientHelper.__get__('generateJWKS')
    const callGenerateJWKS = async () => {
      try {
        await generateJWKS({ id: uuidv4() })
      } catch (e) {}
    }

    it('should exist', () => {
      assert.exists(generateJWKS)
    })

    it('should be function', () => {
      assert.isFunction(generateJWKS, 'generateJWKS is not a function')
    })

    it('should call fileUtils.makeDir once', async () => {
      const makeDirSpy = sinon.spy(fileUtils, 'makeDir')
      await callGenerateJWKS()
      assert.isTrue(makeDirSpy.calledOnce)
      sinon.restore()
    })

    it('should call generateKeyPair once', async () => {
      const generateKeyPairSpy = sinon.spy()
      sinon.stub(jose, 'generateKeyPair').value(generateKeyPairSpy)
      await callGenerateJWKS()
      assert.isTrue(generateKeyPairSpy.calledOnce)
      sinon.restore()
    })

    it('should call exportJWK twice', async () => {
      const exportJWKSpy = sinon.spy()
      sinon.stub(jose, 'exportJWK').value(exportJWKSpy)
      await callGenerateJWKS()
      assert.isTrue(exportJWKSpy.calledTwice)
      sinon.restore()
    })

    it('should call calculateJwkThumbprint once', async () => {
      const calculateJwkThumbprintSpy = sinon.spy()
      sinon.stub(jose, 'calculateJwkThumbprint').value(calculateJwkThumbprintSpy)
      await callGenerateJWKS()
      assert.isTrue(calculateJwkThumbprintSpy.calledOnce)
      sinon.restore()
    })

    it('should call fileUtils.writeDataToFile once', async () => {
      const writeDataToFileSpy = sinon.spy(fileUtils, 'writeDataToFile')
      await callGenerateJWKS()
      assert.isTrue(writeDataToFileSpy.calledOnce)
      sinon.restore()
    })
  })

  describe('getIssuer test', () => {
    const getIssuer = rewiredOpenIDClientHelper.__get__('getIssuer')

    it('should exist', () => {
      assert.exists(getIssuer)
    })

    it('should be function', () => {
      assert.isFunction(getIssuer, 'getIssuer is not a function')
    })

    it('should return the Issuer object when no discovery endpoint available', async () => {
      const issuer = await getIssuer(testProvider)
      assert.exists(issuer, 'failed to setup issuer object')
    })

    it('should return the Issuer object when discovery endpoint available', async () => {
      const initMock = new InitMock()
      initMock.discoveryURL(testProvider.options.issuer)

      const issuer = await getIssuer(testProvider)
      assert.exists(issuer, 'failed to setup issuer object')
      nock.cleanAll()
    })
  })

  describe('getClient test', () => {
    const getClient = rewiredOpenIDClientHelper.__get__('getClient')

    it('should exist', () => {
      assert.exists(getClient)
    })

    it('should be function', () => {
      assert.isFunction(getClient, 'getClient is not a function')
    })

    it('should return the client object to initialize openid-client strategy when no discovery endpoint available', async () => {
      const client = await getClient(testProvider)
      assert.exists(client, 'failed to make client for openid-client strategy')
      const strategy = new Strategy({ client }, () => {})
      assert.exists(strategy, 'Failed to create strategy')
    })

    it('should return the client object to initialize openid-client strategy when discovery endpoint available', async () => {
      const initMock = new InitMock()
      initMock.discoveryURL(testProvider.options.issuer)

      const client = await getClient(testProvider)
      assert.exists(client, 'failed to make client for openid-client strategy')
      const strategy = new Strategy({ client }, () => {})
      assert.exists(strategy, 'Failed to create strategy')
      nock.cleanAll()
    })

    it('we have now already client initialize so we should get client from state', async () => {
      const client = await getClient(testProvider)
      assert.exists(client, 'failed to get client for openid-client strategy')
      const strategy = new Strategy({ client }, () => {})
      assert.exists(strategy, 'Failed to create strategy')
    })
  })
})
