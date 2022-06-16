
const chai = require('chai')
const rewire = require('rewire')
const idpInitiated = rewire('../server/idp-initiated.js')
const assert = chai.assert
const base64url = require('base64url')
const jwt = require('jsonwebtoken')
const config = require('config')
const helper = require('./helper')

/* This is how passportFile looks like
{
  "configurationEndpoint":
  "https://chris.gluuthree.org/identity/restv1/passport/config",

  "failureRedirectUrl":
  "https://chris.gluuthree.org/oxauth/auth/passport/passportlogin.htm",

  "logLevel": "debug",

  "consoleLogOnly": false,

  "clientId": "1502.d49baf9f-b19b-40de-a990-33d08e7f9e77",

  "keyPath": "/etc/certs/passport-rp.pem",

  "keyId": "36658e03-34ea-4745-ad43-959916c96def_sig_rs512",

  "keyAlg": "RS512"
}
*/

describe('idp-initiated.createAuthzRequest', () => {
  const validProvider = 'saml-yidpinitiated'

  const validUser = {
    cn: 'tester3',
    displayName: 'tester3',
    givenName: 'Testerfirst',
    mail: 'tester3@test.com',
    sn: 'Testerlast2',
    uid: 'tester3'
  }

  const validExtraParams = {}

  const validIIConfig = {
    authorizationParams: [{
      provider: 'saml-yidpinitiated',
      redirect_uri: 'https://chris.gluuthree.org' +
      '/oxauth/auth/passport/sample-redirector.htm',
      response_type: 'code',
      scope: 'openid',
      extraParams: validExtraParams
    }],
    openidclient: {
      acrValues: 'passport_saml',
      authorizationEndpoint: 'https://chris.gluuthree.org/' +
      'oxauth/restv1/authorize',
      clientId: '1503.f1917f6f-b155-42e0-9bd1-99d56f5c3b50'
    }

  }

  // "importing" not exported function
  const createAuthzRequest = idpInitiated.__get__('createAuthzRequest')

  before(() => {
    // set stubs
    helper.configureLogger()
    idpInitiated.__set__('basicConfig', config.get('passportConfig'))
    idpInitiated.__set__('config', config.get('passportConfigAuthorizedResponse'))
  })

  afterEach(() => {
    // nock.enableNetConnect()
  })
  it('createAuthzRequest should exist', () => {
    assert.exists(
      createAuthzRequest,
      'createAuthzRequest is null nor undefined')
  })

  it('createAuthzRequest should be a function', () => {
    assert.isFunction(
      createAuthzRequest,
      'createAuthzRequest is not a function'
    )
  })

  it('workaround: req.state should not have dots', () => {
    assert.notInclude(
      createAuthzRequest(
        validUser, validIIConfig, validProvider
      ).state, '.')
  })

  it('workaround: decoded req.state should have all jwt keys', () => {
    const b64urlState = createAuthzRequest(
      validUser, validIIConfig, validProvider).state

    const jwtString = base64url.decode(b64urlState)

    const decodedJWT = jwt.decode(jwtString)

    assert.hasAllKeys(
      decodedJWT,
      ['sub', 'aud', 'jti', 'exp', 'iat', 'data'],
      'decoded req.state has all keys:' +
      'iss, sub, aud, jti , exp, iat, data'
    )
  })

  it('workaround: req.state should not have underscores', () => {
    assert.notInclude(
      createAuthzRequest(
        validUser, validIIConfig, validProvider
      ).state, '_')
  })
})
