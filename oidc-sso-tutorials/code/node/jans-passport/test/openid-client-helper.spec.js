const chai = require('chai')
const rewire = require('rewire')
const rewiredOpenIDClientHelper = rewire('../server/utils/openid-client-helper')
const config = require('config')

const assert = chai.assert
const passportConfigAuthorizedResponse = config.get('passportConfigAuthorizedResponse')

describe('Integration Test OpenID Client Helper', () => {
  const testProvider = passportConfigAuthorizedResponse.providers.find(p => p.id === 'oidccedev6privatejwt')
  let kid = null
  const jwksFilePath = `../server/jwks/${testProvider.id}.json`
  let jwks

  describe('generateJWKS test', () => {
    const generateJWKS = rewiredOpenIDClientHelper.__get__('generateJWKS')

    it('should generate jwks for provider in jwks folder', async () => {
      await generateJWKS(testProvider)
      assert.exists(jwksFilePath, `${jwksFilePath} file not found`)
    })

    it('jwks should have keys', () => {
      jwks = require(jwksFilePath)
      assert.isArray(jwks.keys, 'keys not found in jwks')
    })

    it('jwks should have kid', () => {
      kid = jwks.keys[0].kid
      assert.exists(kid, 'kid not found in jwks')
    })

    it('jwks should have n', () => {
      const n = jwks.keys[0].n
      assert.exists(n, 'n not found in jwks')
    })

    it('jwks should have kty', () => {
      const kty = jwks.keys[0].kty
      assert.exists(kty, 'kty not found in jwks')
    })

    it('make sure generateJWKS not regenerating jwks again and rewrite existing jwks data', async () => {
      await generateJWKS(testProvider)
      jwks = require(jwksFilePath)
      assert.equal(kid, jwks.keys[0].kid, `${kid} is not matching with ${jwks.keys[0].kid}`)
    })
  })
})
