// Mocks for values used in app.init() flow
const config = require('config')
const nock = require('nock')

/**
 * Mocks for app.init() flow.
 */
class InitMock {
  constructor () {
    this._passportConfigAuthorizedResponse = config.get('passportConfigAuthorizedResponse')
    this._passportConfig = config.get('passportConfig')
    this._passportConfigURL = new URL(
      this._passportConfig.configurationEndpoint
    )
    this._gluuHostName = this._passportConfigURL.hostname
    this._gluuUrl = this._passportConfigURL.origin // https://<hostname>
    this._configurationEndpointPath = this._passportConfigURL.pathname
    this._ticket = '016f84e8-f9b9-11e0-bd6f-0021cc6004de'
    this._accessToken = '4f31fd1c-852a-4226-b81c-5910aee14246' +
      '_7673.FFB2.0429.E289.BE8F.91B6.5255.82BF'
    this._pct = 'd0a71780-877f-4edb-b002-592f61d9df72_F978.5DC2.' +
      '97F8.BA28.3B17.C447.C3FA.153D'
    this._oxauthErrorHandlerPath = '/oxauth/auth/passport/passportlogin.htm'
  }

  get gluuUrl () {
    return this._gluuUrl
  }

  // @todo: generate getters if needed

  errorHandlerEndpoint () {
    /**
     * Dummy response
     */
    nock(this._gluuUrl, {
      reqheaders: { host: this._gluuHostName }
    })
      .get(uri => uri.includes(`${this._oxauthErrorHandlerPath}?failure=`))
      .reply(404, 'dummy response')
      .persist()
  }

  /**
   * Mock first UMA request, expected to return 401.
   * And headers w/ ticket and UMA config endpoint
   */
  passportConfigEndpoint () {
    /**
     * Response for oxauth's passport configuration endpoint.
     * Endpoint comes from passport-config.json
     * GET /identity/restv1/passport/config
     * No params sent, no headers. First UMA request.
     * @type {{ server: string, 'content-length': string,
     * 'x-xss-protection': string, 'x-content-type-options': string,
     * 'www-authenticate': string, connection: string,
     * 'strict-transport-security': string}}
     */
    const passportConfigUnauthorizedResponseHeader = {
      server: 'Apache/2.4.29 (Ubuntu)',
      'x-xss-protection': '1; mode=block',
      'x-content-type-options': 'nosniff',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'www-authenticate': 'UMA realm="Authentication Required", ' +
        `host_id=${this._gluuHostName}, ` +
        `as_uri=${this._gluuUrl}/.well-known/uma2-configuration, ` +
        `ticket=${this._ticket}`,
      'content-length': '0',
      connection: 'close'
    }

    nock(this._gluuUrl, {
      reqheaders: { host: this._gluuHostName }
    })

      .get(this._configurationEndpointPath, '')
      .reply(
        401, '', passportConfigUnauthorizedResponseHeader
      )

    // Authorized (second UMA request already w/ token and this._pct)
    const passportConfigAuthorizedRequestHeaders = {
      authorization: `Bearer ${this._accessToken}`,
      pct: this._pct,
      host: this._gluuHostName,
      Connection: 'close'
    }

    /**
     * mocking /config endpoint with authorized params
     */
    nock(this._gluuUrl)
      .persist()
      .get(this._configurationEndpointPath, '', {
        reqheaders: passportConfigAuthorizedRequestHeaders
      })
      .reply(
        200, this._passportConfigAuthorizedResponse
      )
  }

  /**
   * UMA configuration endpoint mock
   * GET /.well-known/uma2-configuration
   */
  umaConfigurationEndpoint () {
    /**
     * Uma configuration endpoint path
     * @type {string}
     */
    const umaCfgEndpointPath = '/.well-known/uma2-configuration'

    /**
     * Response body for oxauth's UMA configuration endpoint
     * GET /.well-known/uma2-configuration
     * @type {
     * {response_types_supported: [string, string, string],
     * introspection_endpoint: string, scope_endpoint: string,
     * grant_types_supported: [string, string, string, string],
     * ui_locales_supported: string[], claims_interaction_endpoint: string,
     * issuer: string, authorization_endpoint: string,
     * service_documentation: string,
     * token_endpoint_auth_signing_alg_values_supported: string[],
     * op_tos_uri: string, permission_endpoint: string,
     * code_challenge_methods_supported: null, jwks_uri: string,
     * op_policy_uri: string, registration_endpoint: string,
     * token_endpoint_auth_methods_supported: string[],
     * uma_profiles_supported: [], resource_registration_endpoint: string,
     * token_endpoint: string}}
     */
    const umaCfgEndpointResponse = {
      issuer: `${this._gluuUrl}`,
      authorization_endpoint:
        `${this._gluuUrl}/oxauth/restv1/authorize`,
      token_endpoint: `${this._gluuUrl}/oxauth/restv1/token`,
      jwks_uri: `${this._gluuUrl}/oxauth/restv1/jwks`,
      registration_endpoint: `${this._gluuUrl}/oxauth/restv1/register`,
      response_types_supported: ['code', 'id_token', 'token'],
      grant_types_supported: [
        'authorization_code', 'implicit', 'client_credentials',
        'urn:ietf:params:oauth:grant-type:uma-ticket'],
      token_endpoint_auth_methods_supported: [
        'client_secret_basic', 'client_secret_post',
        'client_secret_jwt', 'private_key_jwt', 'tls_client_auth',
        'self_signed_tls_client_auth'
      ],
      token_endpoint_auth_signing_alg_values_supported: [
        'HS256', 'HS384', 'HS512', 'RS256', 'RS384',
        'RS512', 'ES256', 'ES384', 'ES512'
      ],
      service_documentation: 'http://gluu.org/docs',
      ui_locales_supported: [
        'en', 'bg', 'de', 'es', 'fr', 'it', 'ru', 'tr'
      ],
      op_policy_uri:
        'http://ox.gluu.org/doku.php?id=oxauth:policy',
      op_tos_uri:
        'http://ox.gluu.org/doku.php?id=oxauth:tos',
      introspection_endpoint:
        `${this._gluuUrl}/oxauth/restv1/rpt/status`,
      code_challenge_methods_supported: null,
      claims_interaction_endpoint:
        `${this._gluuUrl}/oxauth/restv1/uma/gather_claims`,
      uma_profiles_supported: [],
      permission_endpoint:
        `${this._gluuUrl}/oxauth/restv1/host/rsrc_pr`,
      resource_registration_endpoint:
        `${this._gluuUrl}/oxauth/restv1/host/rsrc/resource_set`,
      scope_endpoint: `${this._gluuUrl}/oxauth/restv1/uma/scopes`
    }

    /**
     * Mocking uma-configuration endpoint response
     */
    nock(this._gluuUrl)
      .persist()
      .get(umaCfgEndpointPath)
      .reply(200, umaCfgEndpointResponse)
  }

  /**
   * Mocking UMA token endpoint
   */
  umaTokenEndpoint () {
    // request
    // eslint-disable-next-line no-unused-vars
    const umaTokenRequestHeader = {
      host: this._gluuHostName,
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
      'content-length': 1043
      // 'Connection': 'close'
    }

    const umaTokenRequestBody = {
      grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
      client_assertion_type:
        'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion:
        'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCIsImtpZCI6ImNlZjdlZDRk' +
        'LTAwODgtNDMxMC04NzhmLTM2ZjlkOGMyMGNmN19zaWdfcnM1MTIifQ.' +
        'eyJpc3MiOiIxNTAyLmI4NTdiNDE1LTdjMjMtNGQ5OC1iYjE4LWI4ZDE' +
        '5ZTcwYmU3NCIsInN1YiI6IjE1MDIuYjg1N2I0MTUtN2MyMy00ZDk4LW' +
        'JiMTgtYjhkMTllNzBiZTc0IiwiYXVkIjoiaHR0cHM6Ly90MS50ZWNob' +
        'm8yNHg3LmNvbS9veGF1dGgvcmVzdHYxL3Rva2VuIiwianRpIjoiZDRi' +
        'ODExMjktY2EwNC00NTcwLThhYmUtNzg4ODA4MTVmMzlmIiwiZXhwIjo' +
        'xNTk4OTk3MDgzLjAzMSwiaWF0IjoxNTk4OTk3MDUzMDMxfQ.ROOLuuS' +
        '9wIKLM_iDNzWCCtdOYg6HvIL7s2zxT1mSpBmKWJbBREh2hIyJuIVCFp' +
        'drJPbPuo9uO_eyukWPMoF9BWNGo2WOXMvd_FUpDi3kqwHVDBxIXKwQ-' +
        'O87JqIzcxE5ZqOAKAXVuGBefGqzDuAS0DgzeFFOp6E7bGaKfBOgpYCHSb' +
        'dPuF_7wU1ydTj0ZYIWKtfjQ5UoBRh0TC0rEssWb3qEF00qk86HZjqLDhb' +
        'JWhgkK5mj2akDuAUrhH3ixoYaFohLzFe86-WXJRbzwBaHpAI-eSr4lo3Wj' +
        '3Trqv2tG02VC_SUZVTILc0By5pbkHYs5Vh4wH1Awq1yrIE8WlJoA',
      client_id: '1502.b857b415-7c23-4d98-bb18-b8d19e70be74',
      ticket: this._ticket
    }

    // response
    const umaTokenResponseHeader = {
      'x-content-type-options': 'nosniff',
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'content-type': 'application/json',
      connection: 'close'
    }

    const umaTokenResponseBody = {
      access_token: this._accessToken,
      token_type: 'Bearer',
      pct: this._pct,
      upgraded: false
    }

    // mocking endpoint response if conditions match
    nock(this._gluuUrl, {
      // reqheaders: umaTokenRequestHeader
    })
      .persist()
      .post('/oxauth/restv1/token', umaTokenRequestBody)
      .reply(200, umaTokenResponseBody, umaTokenResponseHeader)
  }

  failureUrlResponse () {
    nock(this._gluuUrl)
      .persist()
      .get('/oxauth/auth/passport/passportlogin.htm')
      .query(true)
      .reply(405)
  }

  /**
   * Mocking discovery endpoint
   */
  discoveryURL (url = this._gluuUrl) {
    const discoveryEndpoint = '/.well-known/openid-configuration'

    const discoveryEndpointResponse = {
      request_parameter_supported: true,
      token_revocation_endpoint: `${url}/oxauth/restv1/revoke`,
      introspection_endpoint: `${url}/oxauth/restv1/introspection`,
      claims_parameter_supported: false,
      issuer: `${url}`,
      userinfo_encryption_enc_values_supported: ['RSA1_5', 'RSA-OAEP', 'A128KW', 'A256KW'],
      id_token_encryption_enc_values_supported: ['A128CBC+HS256', 'A256CBC+HS512', 'A128GCM', 'A256GCM'],
      authorization_endpoint: `${url}/oxauth/restv1/authorize`,
      service_documentation: 'http://gluu.org/docs',
      id_generation_endpoint: `${url}/oxauth/restv1/id`,
      claims_supported: ['street_address', 'country', 'zoneinfo', 'birthdate', 'role', 'gender', 'formatted', 'user_name', 'phone_mobile_number', 'preferred_username', 'locale', 'inum', 'updated_at', 'nickname', 'email', 'website', 'email_verified', 'profile', 'locality', 'phone_number_verified', 'given_name', 'middle_name', 'picture', 'name', 'phone_number', 'postal_code', 'region', 'family_name'],
      scope_to_claims_mapping: [{
        profile: ['name', 'family_name', 'given_name', 'middle_name', 'nickname', 'preferred_username', 'profile', 'picture', 'website', 'gender', 'birthdate', 'zoneinfo', 'locale', 'updated_at']
      }, {
        openid: []
      }, {
        permission: ['role']
      }, {
        super_gluu_ro_session: []
      }, {
        phone: ['phone_number_verified', 'phone_number']
      }, {
        revoke_session: []
      }, {
        address: ['formatted', 'postal_code', 'street_address', 'locality', 'country', 'region']
      }, {
        clientinfo: ['name', 'inum']
      }, {
        mobile_phone: ['phone_mobile_number']
      }, {
        email: ['email_verified', 'email']
      }, {
        user_name: ['user_name']
      }, {
        'oxtrust-api-write': []
      }, {
        oxd: []
      }, {
        uma_protection: []
      }, {
        'oxtrust-api-read': []
      }, {
        offline_access: []
      }],
      op_policy_uri: 'http://ox.gluu.org/doku.php?id=oxauth:policy',
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post', 'client_secret_jwt', 'private_key_jwt'],
      tls_client_certificate_bound_access_tokens: true,
      response_modes_supported: ['fragment', 'form_post', 'query'],
      backchannel_logout_session_supported: true,
      token_endpoint: `${url}/oxauth/restv1/token`,
      response_types_supported: ['code id_token', 'code', 'id_token token', 'id_token', 'code token', 'token', 'code id_token token'],
      request_uri_parameter_supported: true,
      backchannel_user_code_parameter_supported: false,
      grant_types_supported: ['authorization_code', 'password', 'urn:ietf:params:oauth:grant-type:uma-ticket', 'refresh_token', 'implicit', 'urn:ietf:params:oauth:grant-type:device_code', 'client_credentials'],
      ui_locales_supported: ['en', 'bg', 'de', 'es', 'fr', 'it', 'ru', 'tr'],
      userinfo_endpoint: `${url}/oxauth/restv1/userinfo`,
      op_tos_uri: 'http://ox.gluu.org/doku.php?id=oxauth:tos',
      auth_level_mapping: {
        '-1': ['simple_password_auth'],
        60: ['passport_saml'],
        40: ['otp', 'passport_social']
      },
      require_request_uri_registration: false,
      id_token_encryption_alg_values_supported: ['RSA1_5', 'RSA-OAEP', 'A128KW', 'A256KW'],
      frontchannel_logout_session_supported: true,
      claims_locales_supported: ['en'],
      clientinfo_endpoint: `${url}/oxauth/restv1/clientinfo`,
      request_object_signing_alg_values_supported: ['none', 'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'],
      request_object_encryption_alg_values_supported: ['RSA1_5', 'RSA-OAEP', 'A128KW', 'A256KW'],
      session_revocation_endpoint: `${url}/oxauth/restv1/revoke_session`,
      check_session_iframe: `${url}/oxauth/opiframe.htm`,
      scopes_supported: ['address', `${url}/oxauth/restv1/uma/scopes/scim_access`, 'openid', 'clientinfo', 'user_name', 'profile', 'uma_protection', 'permission', `${url}/oxauth/restv1/uma/scopes/passport_access`, 'revoke_session', 'oxtrust-api-write', 'oxtrust-api-read', 'phone', 'mobile_phone', 'offline_access', 'oxd', 'super_gluu_ro_session', 'email'],
      backchannel_logout_supported: true,
      acr_values_supported: ['simple_password_auth', 'passport_saml', 'urn:oasis:names:tc:SAML:2.0:ac:classes:Password', 'urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocol', 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport', 'otp', 'passport_social'],
      request_object_encryption_enc_values_supported: ['A128CBC+HS256', 'A256CBC+HS512', 'A128GCM', 'A256GCM'],
      device_authorization_endpoint: `${url}/oxauth/restv1/device_authorization`,
      display_values_supported: ['page', 'popup'],
      userinfo_signing_alg_values_supported: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'],
      claim_types_supported: ['normal'],
      userinfo_encryption_alg_values_supported: ['RSA1_5', 'RSA-OAEP', 'A128KW', 'A256KW'],
      end_session_endpoint: `${url}/oxauth/restv1/end_session`,
      revocation_endpoint: `${url}/oxauth/restv1/revoke`,
      backchannel_authentication_endpoint: `${url}/oxauth/restv1/bc-authorize`,
      token_endpoint_auth_signing_alg_values_supported: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'],
      frontchannel_logout_supported: true,
      jwks_uri: `${url}/oxauth/restv1/jwks`,
      subject_types_supported: ['public', 'pairwise'],
      id_token_signing_alg_values_supported: ['none', 'HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512'],
      registration_endpoint: `${url}/oxauth/restv1/register`,
      id_token_token_binding_cnf_values_supported: ['tbh']
    }

    nock(url)
      .persist()
      .get(discoveryEndpoint)
      .reply(200, discoveryEndpointResponse)
  }
}

module.exports = InitMock
