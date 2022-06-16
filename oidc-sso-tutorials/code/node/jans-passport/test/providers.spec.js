const chai = require('chai')
const assert = chai.assert
const got = require('got')

const assertResponse = (response) => {
  assert.equal(response.statusCode, 302)
  assert.match(response.headers.location, /state/)
  assert.match(response.headers.location, /response_type/)
  assert.match(response.headers.location, /client_id/)
  assert.match(response.headers.location, /redirect_uri/)
  assert.match(response.headers.location, /scope/)
}

describe('provider.js', () => {
  describe('testing provider with openid-client strategy', () => {
    it('should redirect with common params', async () => {
      const tokenResponse = await got(
        'http://127.0.0.1:8090/passport/token',
        { responseType: 'json' }
      )
      const token = tokenResponse.body.token_
      const oidcProviderId = 'oidccedev6'
      const response = await got(
          `http://127.0.0.1:8090/passport/auth/${oidcProviderId}/${token}`,
          { throwHttpErrors: false, followRedirect: false }
      )
      assertResponse(response)
    })

    it('provider with private_jwt token auth method should redirect with common params', async () => {
      const tokenResponse = await got(
        'http://127.0.0.1:8090/passport/token',
        { responseType: 'json' }
      )
      const token = tokenResponse.body.token_
      const oidcProviderId = 'oidccedev6privatejwt'
      const response = await got(
          `http://127.0.0.1:8090/passport/auth/${oidcProviderId}/${token}`,
          { throwHttpErrors: false, followRedirect: false }
      )
      assertResponse(response)
    })

    it('for pkce flow should redirect with code challenge and custom params', async () => {
      const tokenResponse = await got(
        'http://127.0.0.1:8090/passport/token',
        { responseType: 'json' }
      )
      const token = tokenResponse.body.token_
      const oidcProviderId = 'oidccedev6_pkce'
      const response = await got(
          `http://127.0.0.1:8090/passport/auth/${oidcProviderId}/${token}`,
          { throwHttpErrors: false, followRedirect: false }
      )
      assertResponse(response)
      assert.match(response.headers.location, /code_challenge/)
      assert.match(response.headers.location, /code_challenge_method/)
      assert.match(response.headers.location, /preselectedExternalProvider=tEmp/)
      assert.match(response.headers.location, /acr_values=duo/)
    })
  })
})
