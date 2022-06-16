const saltFile = './test/testdata/salt'
const timerInterval = 5000

/**
 * basicConfig
 * @type {{keyAlg: string, failureRedirectUrl: string, consoleLogOnly: boolean, clientId: string, logLevel: string, keyPath: string, configurationEndpoint: string, keyId: string}}
 */
const passportConfig = {
  configurationEndpoint:
        'https://chris.gluuthree.org/identity/restv1/passport/config',
  failureRedirectUrl:
        'https://chris.gluuthree.org/oxauth/auth/passport/passportlogin.htm',
  logLevel: 'debug',
  consoleLogOnly: false,
  clientId: '1502.d49baf9f-b19b-40de-a990-33d08e7f9e77',
  keyPath: './test/testdata/passport-rp.pem',
  keyId: '36658e03-34ea-4745-ad43-959916c96def_sig_rs512',
  keyAlg: 'RS512'
}

/**
 * Full configuration response, you can ADD PROVIDERS as required by your tests
 * @type {{idpInitiated: {openidclient: {acrValues: string, clientId: string, authorizationEndpoint: string}, authorizationParams: [{provider: string, scope: string, response_type: string, extraParams: {}, redirect_uri: string}]}, conf: {serverURI: string, postProfileEndpoint: string, logging: {consoleLogOnly: boolean, level: string, activeMQConf: {password: string, port: number, host: string, enabled: boolean, username: string}}, spTLSCert: string, serverWebPort: number, spTLSKey: string}, providers: [{mapping: string, passportStrategyId: string, displayName: string, requestForEmail: boolean, emailLinkingSafe: boolean, options: {skipRequestCompression: string, authnRequestBinding: string, identifierFormat: string, cert: string, entryPoint: string, issuer: string}, callbackUrl: string, id: string, type: string, enabled: boolean}, {mapping: string, passportStrategyId: string, displayName: string, requestForEmail: boolean, emailLinkingSafe: boolean, options: {skipRequestCompression: string, authnRequestBinding: string, identifierFormat: string, cert: string, entryPoint: string, issuer: string}, callbackUrl: string, id: string, type: string, enabled: boolean}, {mapping: string, passportStrategyId: string, displayName: string, requestForEmail: boolean, emailLinkingSafe: boolean, options: {skipRequestCompression: string, authnRequestBinding: string, identifierFormat: string, cert: string, entryPoint: string, issuer: string}, callbackUrl: string, id: string, type: string, enabled: boolean}, {mapping: string, passportStrategyId: string, displayName: string, requestForEmail: boolean, emailLinkingSafe: boolean, options: {skipRequestCompression: string, authnRequestBinding: string, validateInResponseTo: string, identifierFormat: string, cert: string, entryPoint: string, issuer: string}, callbackUrl: string, id: string, type: string, enabled: boolean}, {mapping: string, passportStrategyId: string, displayName: string, requestForEmail: boolean, emailLinkingSafe: boolean, options: {userInfoURL: string, clientID: string, tokenURL: string, authorizationURL: string, scope: string, clientSecret: string, issuer: string}, callbackUrl: string, id: string, type: string, enabled: boolean}]}}
 */
const passportConfigAuthorizedResponse = {
  conf: {
    serverURI: 'https://chris.gluuthree.org',
    serverWebPort: 8090,
    postProfileEndpoint: 'https://chris.gluuthree.org/oxauth/postlogin.htm',
    spTLSCert: './test/testdata/passport-sp.crt',
    spTLSKey: './test/testdata/passport-sp.key',
    logging: {
      level: 'debug',
      consoleLogOnly: false,
      activeMQConf: {
        enabled: false,
        host: '',
        username: '',
        password: '',
        port: 0
      }
    }
  },
  idpInitiated: {
    openidclient: {
      authorizationEndpoint:
        'https://chris.gluuthree.org/oxauth/restv1/authorize',
      clientId: '1503.f1917f6f-b155-42e0-9bd1-99d56f5c3b50',
      acrValues: 'passport_saml'
    },
    authorizationParams: [{
      provider: 'saml-yidpinitiated',
      extraParams: {},
      redirect_uri:
        'https://chris.gluuthree.org/oxauth/auth/' +
        'passport/sample-redirector.htm',
      response_type: 'code',
      scope: 'openid'
    }]
  },
  providers: [{
    id: 'saml-only-1',
    displayName: 'saml only 1',
    type: 'saml',
    mapping: 'saml_ldap_profile',
    passportStrategyId: 'passport-saml',
    enabled: true,
    callbackUrl:
      'https://chris.gluuthree.org/passport/auth/saml' +
      '/saml-only-1/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      skipRequestCompression: 'True',
      authnRequestBinding: 'HTTP-POST',
      identifierFormat:
        'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      cert: 'MIIDlzCCAn8CFBgf85Th/k9LW/WX1Tm2K8L46XFKMA0GCSqGSIb3DQEBCwUAMIGHMQswCQYDVQQGEwJCUjELMAkGA1UECAwCU1AxEjAQBgNVBAcMCVNhbyBQYXVsbzEZMBcGA1UECgwQQ2hyaXMgVGVzdGluZyBuQzEaMBgGA1UEAwwRY2hyaXMuZ2x1dXR3by5vcmcxIDAeBgkqhkiG9w0BCQEWEWNocmlzQHRlc3RpbmcuY29tMB4XDTIwMDYyMzE0NDU1M1oXDTIxMDYyMzE0NDU1M1owgYcxCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDESMBAGA1UEBwwJU2FvIFBhdWxvMRkwFwYDVQQKDBBDaHJpcyBUZXN0aW5nIG5DMRowGAYDVQQDDBFjaHJpcy5nbHV1dHdvLm9yZzEgMB4GCSqGSIb3DQEJARYRY2hyaXNAdGVzdGluZy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIaxbLrWDti7ZLAU4YVxNR6bkjt/HDfczBNF5ULlqttTbP65HgOMAl9eI8Sg+vPN2y7lk7ogQW4bJ3gcBfiBjanU8jrVMntXB8VwhZ8YYThkg1NBb9KPf9sW6FsOz+LDKNxJQeXu7jbKtb7KZvAQiFWCLil6VuKgvmjcDSnRARkSSacqVs7vM/OH9t+zRdeLA2LFEfUIW1GoOi66Tmt6hnVIhIm9I6vJOE+ym0HnyqPUQy6ZEWGbVbJ4Fn9JJmoZ3jJ1v9ZxfKJt2ZCz2HydOWJHXyg2fZwCBVdoJcydtVWQFNVJMEvQUCZNofyiJsCu+rQ033NWyhtrjlYL2fEqRnAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABDbtviA7rVkg/8wPRYPgi07jCoR9x7ZnJjMB4xHFgwIKRF7FKapUBOvqzSmYbNm3JotAdq6o9gPD3rEjQh4Sy2fptA64fquY6Fo5paVTL5AECdumv67+ziB5mtYE0iabY+QHcLHpy6kqJvFpaeUeBNypvx6SaZ3BM/9Q5VwEmmuuf+VAnY/7Q/BHVUhUBeNs9G1LOtqLTr56QyOO4ET1NKihAeE8A/R05O7fELlB2HJ4LxhMLfzwQwQIzAg5fxYrZLtjGu524SSL7Xb6BuLIitwZVAYBcXS2Up37NGHdQu9c2uHFQoxk+ZNKO1ZRUl7IE/8c6DjMTRXRpZqqRaUBco=',
      entryPoint: 'https://chris.gluutwo.org/idp/profile/SAML2/POST/SSO',
      issuer: 'urn:test:one'
    }
  }, {
    id: 'saml-emailreq',
    displayName: 'saml-emailreq',
    type: 'saml',
    mapping: 'saml_ldap_profile',
    passportStrategyId: 'passport-saml',
    enabled: true,
    callbackUrl: 'https://chris.gluuthree.org/passport/auth/saml/saml-emailreq/callback',
    requestForEmail: true,
    emailLinkingSafe: false,
    options: {
      skipRequestCompression: 'True',
      authnRequestBinding: 'HTTP-POST',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      cert: 'MIIDlzCCAn8CFBgf85Th/k9LW/WX1Tm2K8L46XFKMA0GCSqGSIb3DQEBCwUAMIGHMQswCQYDVQQGEwJCUjELMAkGA1UECAwCU1AxEjAQBgNVBAcMCVNhbyBQYXVsbzEZMBcGA1UECgwQQ2hyaXMgVGVzdGluZyBuQzEaMBgGA1UEAwwRY2hyaXMuZ2x1dXR3by5vcmcxIDAeBgkqhkiG9w0BCQEWEWNocmlzQHRlc3RpbmcuY29tMB4XDTIwMDYyMzE0NDU1M1oXDTIxMDYyMzE0NDU1M1owgYcxCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDESMBAGA1UEBwwJU2FvIFBhdWxvMRkwFwYDVQQKDBBDaHJpcyBUZXN0aW5nIG5DMRowGAYDVQQDDBFjaHJpcy5nbHV1dHdvLm9yZzEgMB4GCSqGSIb3DQEJARYRY2hyaXNAdGVzdGluZy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIaxbLrWDti7ZLAU4YVxNR6bkjt/HDfczBNF5ULlqttTbP65HgOMAl9eI8Sg+vPN2y7lk7ogQW4bJ3gcBfiBjanU8jrVMntXB8VwhZ8YYThkg1NBb9KPf9sW6FsOz+LDKNxJQeXu7jbKtb7KZvAQiFWCLil6VuKgvmjcDSnRARkSSacqVs7vM/OH9t+zRdeLA2LFEfUIW1GoOi66Tmt6hnVIhIm9I6vJOE+ym0HnyqPUQy6ZEWGbVbJ4Fn9JJmoZ3jJ1v9ZxfKJt2ZCz2HydOWJHXyg2fZwCBVdoJcydtVWQFNVJMEvQUCZNofyiJsCu+rQ033NWyhtrjlYL2fEqRnAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABDbtviA7rVkg/8wPRYPgi07jCoR9x7ZnJjMB4xHFgwIKRF7FKapUBOvqzSmYbNm3JotAdq6o9gPD3rEjQh4Sy2fptA64fquY6Fo5paVTL5AECdumv67+ziB5mtYE0iabY+QHcLHpy6kqJvFpaeUeBNypvx6SaZ3BM/9Q5VwEmmuuf+VAnY/7Q/BHVUhUBeNs9G1LOtqLTr56QyOO4ET1NKihAeE8A/R05O7fELlB2HJ4LxhMLfzwQwQIzAg5fxYrZLtjGu524SSL7Xb6BuLIitwZVAYBcXS2Up37NGHdQu9c2uHFQoxk+ZNKO1ZRUl7IE/8c6DjMTRXRpZqqRaUBco=',
      entryPoint: 'https://chris.gluutwo.org/idp/profile/SAML2/POST/SSO',
      issuer: 'urn:test:threemailreq'
    }
  }, {
    id: 'saml-emaillink',
    displayName: 'saml-emaillink',
    type: 'saml',
    mapping: 'saml_ldap_profile',
    passportStrategyId: 'passport-saml',
    enabled: true,
    callbackUrl: 'https://chris.gluuthree.org/passport/auth/saml/saml-emaillink/callback',
    requestForEmail: false,
    emailLinkingSafe: true,
    options: {
      skipRequestCompression: 'True',
      authnRequestBinding: 'HTTP-POST',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      cert: 'MIIDlzCCAn8CFBgf85Th/k9LW/WX1Tm2K8L46XFKMA0GCSqGSIb3DQEBCwUAMIGHMQswCQYDVQQGEwJCUjELMAkGA1UECAwCU1AxEjAQBgNVBAcMCVNhbyBQYXVsbzEZMBcGA1UECgwQQ2hyaXMgVGVzdGluZyBuQzEaMBgGA1UEAwwRY2hyaXMuZ2x1dXR3by5vcmcxIDAeBgkqhkiG9w0BCQEWEWNocmlzQHRlc3RpbmcuY29tMB4XDTIwMDYyMzE0NDU1M1oXDTIxMDYyMzE0NDU1M1owgYcxCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDESMBAGA1UEBwwJU2FvIFBhdWxvMRkwFwYDVQQKDBBDaHJpcyBUZXN0aW5nIG5DMRowGAYDVQQDDBFjaHJpcy5nbHV1dHdvLm9yZzEgMB4GCSqGSIb3DQEJARYRY2hyaXNAdGVzdGluZy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIaxbLrWDti7ZLAU4YVxNR6bkjt/HDfczBNF5ULlqttTbP65HgOMAl9eI8Sg+vPN2y7lk7ogQW4bJ3gcBfiBjanU8jrVMntXB8VwhZ8YYThkg1NBb9KPf9sW6FsOz+LDKNxJQeXu7jbKtb7KZvAQiFWCLil6VuKgvmjcDSnRARkSSacqVs7vM/OH9t+zRdeLA2LFEfUIW1GoOi66Tmt6hnVIhIm9I6vJOE+ym0HnyqPUQy6ZEWGbVbJ4Fn9JJmoZ3jJ1v9ZxfKJt2ZCz2HydOWJHXyg2fZwCBVdoJcydtVWQFNVJMEvQUCZNofyiJsCu+rQ033NWyhtrjlYL2fEqRnAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABDbtviA7rVkg/8wPRYPgi07jCoR9x7ZnJjMB4xHFgwIKRF7FKapUBOvqzSmYbNm3JotAdq6o9gPD3rEjQh4Sy2fptA64fquY6Fo5paVTL5AECdumv67+ziB5mtYE0iabY+QHcLHpy6kqJvFpaeUeBNypvx6SaZ3BM/9Q5VwEmmuuf+VAnY/7Q/BHVUhUBeNs9G1LOtqLTr56QyOO4ET1NKihAeE8A/R05O7fELlB2HJ4LxhMLfzwQwQIzAg5fxYrZLtjGu524SSL7Xb6BuLIitwZVAYBcXS2Up37NGHdQu9c2uHFQoxk+ZNKO1ZRUl7IE/8c6DjMTRXRpZqqRaUBco=',
      entryPoint: 'https://chris.gluutwo.org/idp/profile/SAML2/POST/SSO',
      issuer: 'https://chris.gluuthree.org/'
    }
  }, {
    id: 'saml-yidpinitiated',
    displayName: 'saml-yidpinitiated',
    type: 'saml',
    mapping: 'saml_ldap_profile',
    passportStrategyId: 'passport-saml',
    enabled: true,
    callbackUrl: 'https://chris.gluuthree.org/passport/auth/saml/saml-yidpinitiated/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      skipRequestCompression: 'true',
      authnRequestBinding: 'HTTP-POST',
      validateInResponseTo: 'false',
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      cert: 'MIIDlzCCAn8CFBgf85Th/k9LW/WX1Tm2K8L46XFKMA0GCSqGSIb3DQEBCwUAMIGHMQswCQYDVQQGEwJCUjELMAkGA1UECAwCU1AxEjAQBgNVBAcMCVNhbyBQYXVsbzEZMBcGA1UECgwQQ2hyaXMgVGVzdGluZyBuQzEaMBgGA1UEAwwRY2hyaXMuZ2x1dXR3by5vcmcxIDAeBgkqhkiG9w0BCQEWEWNocmlzQHRlc3RpbmcuY29tMB4XDTIwMDYyMzE0NDU1M1oXDTIxMDYyMzE0NDU1M1owgYcxCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDESMBAGA1UEBwwJU2FvIFBhdWxvMRkwFwYDVQQKDBBDaHJpcyBUZXN0aW5nIG5DMRowGAYDVQQDDBFjaHJpcy5nbHV1dHdvLm9yZzEgMB4GCSqGSIb3DQEJARYRY2hyaXNAdGVzdGluZy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIaxbLrWDti7ZLAU4YVxNR6bkjt/HDfczBNF5ULlqttTbP65HgOMAl9eI8Sg+vPN2y7lk7ogQW4bJ3gcBfiBjanU8jrVMntXB8VwhZ8YYThkg1NBb9KPf9sW6FsOz+LDKNxJQeXu7jbKtb7KZvAQiFWCLil6VuKgvmjcDSnRARkSSacqVs7vM/OH9t+zRdeLA2LFEfUIW1GoOi66Tmt6hnVIhIm9I6vJOE+ym0HnyqPUQy6ZEWGbVbJ4Fn9JJmoZ3jJ1v9ZxfKJt2ZCz2HydOWJHXyg2fZwCBVdoJcydtVWQFNVJMEvQUCZNofyiJsCu+rQ033NWyhtrjlYL2fEqRnAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABDbtviA7rVkg/8wPRYPgi07jCoR9x7ZnJjMB4xHFgwIKRF7FKapUBOvqzSmYbNm3JotAdq6o9gPD3rEjQh4Sy2fptA64fquY6Fo5paVTL5AECdumv67+ziB5mtYE0iabY+QHcLHpy6kqJvFpaeUeBNypvx6SaZ3BM/9Q5VwEmmuuf+VAnY/7Q/BHVUhUBeNs9G1LOtqLTr56QyOO4ET1NKihAeE8A/R05O7fELlB2HJ4LxhMLfzwQwQIzAg5fxYrZLtjGu524SSL7Xb6BuLIitwZVAYBcXS2Up37NGHdQu9c2uHFQoxk+ZNKO1ZRUl7IE/8c6DjMTRXRpZqqRaUBco=',
      entryPoint: 'https://chris.gluutwo.org/idp/profile/SAML2/POST/SSO',
      issuer: 'chris.testingenv.org'
    }
  }, {
    id: 'apple',
    displayName: 'apple',
    type: 'oauth',
    mapping: 'apple',
    passportStrategyId: '@nicokaiser/passport-apple',
    enabled: true,
    callbackUrl: 'https://chris.gluuthree.org/passport/auth/apple/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      clientID: 'org.xxx',
      scope: '["name", "email"]',
      teamID: 'xxxxxxxx',
      keyID: 'xxxxxxx',
      // eslint-disable-next-line node/no-path-concat
      key: `${__dirname}/../test/testdata/apple-auth.p8`
    }
  }, {
    id: 'saml-redis-test',
    displayName: 'saml redis',
    type: 'saml',
    mapping: 'saml_ldap_profile',
    passportStrategyId: 'passport-saml',
    enabled: true,
    callbackUrl:
      'https://chris.gluuthree.org/passport/auth/saml' +
      '/saml-redis-test/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      skipRequestCompression: 'True',
      authnRequestBinding: 'HTTP-POST',
      identifierFormat:
        'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
      cert: 'MIIDlzCCAn8CFBgf85Th/k9LW/WX1Tm2K8L46XFKMA0GCSqGSIb3DQEBCwUAMIGHMQswCQYDVQQGEwJCUjELMAkGA1UECAwCU1AxEjAQBgNVBAcMCVNhbyBQYXVsbzEZMBcGA1UECgwQQ2hyaXMgVGVzdGluZyBuQzEaMBgGA1UEAwwRY2hyaXMuZ2x1dXR3by5vcmcxIDAeBgkqhkiG9w0BCQEWEWNocmlzQHRlc3RpbmcuY29tMB4XDTIwMDYyMzE0NDU1M1oXDTIxMDYyMzE0NDU1M1owgYcxCzAJBgNVBAYTAkJSMQswCQYDVQQIDAJTUDESMBAGA1UEBwwJU2FvIFBhdWxvMRkwFwYDVQQKDBBDaHJpcyBUZXN0aW5nIG5DMRowGAYDVQQDDBFjaHJpcy5nbHV1dHdvLm9yZzEgMB4GCSqGSIb3DQEJARYRY2hyaXNAdGVzdGluZy5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDIaxbLrWDti7ZLAU4YVxNR6bkjt/HDfczBNF5ULlqttTbP65HgOMAl9eI8Sg+vPN2y7lk7ogQW4bJ3gcBfiBjanU8jrVMntXB8VwhZ8YYThkg1NBb9KPf9sW6FsOz+LDKNxJQeXu7jbKtb7KZvAQiFWCLil6VuKgvmjcDSnRARkSSacqVs7vM/OH9t+zRdeLA2LFEfUIW1GoOi66Tmt6hnVIhIm9I6vJOE+ym0HnyqPUQy6ZEWGbVbJ4Fn9JJmoZ3jJ1v9ZxfKJt2ZCz2HydOWJHXyg2fZwCBVdoJcydtVWQFNVJMEvQUCZNofyiJsCu+rQ033NWyhtrjlYL2fEqRnAgMBAAEwDQYJKoZIhvcNAQELBQADggEBABDbtviA7rVkg/8wPRYPgi07jCoR9x7ZnJjMB4xHFgwIKRF7FKapUBOvqzSmYbNm3JotAdq6o9gPD3rEjQh4Sy2fptA64fquY6Fo5paVTL5AECdumv67+ziB5mtYE0iabY+QHcLHpy6kqJvFpaeUeBNypvx6SaZ3BM/9Q5VwEmmuuf+VAnY/7Q/BHVUhUBeNs9G1LOtqLTr56QyOO4ET1NKihAeE8A/R05O7fELlB2HJ4LxhMLfzwQwQIzAg5fxYrZLtjGu524SSL7Xb6BuLIitwZVAYBcXS2Up37NGHdQu9c2uHFQoxk+ZNKO1ZRUl7IE/8c6DjMTRXRpZqqRaUBco=',
      entryPoint: 'https://chris.gluutwo.org/idp/profile/SAML2/POST/SSO',
      issuer: 'urn:test:one',
      redisCacheOptions: '{"host":"127.0.0.1", "port":6379}'
    }
  }, {
    id: 'oidccedev6',
    displayName: 'openid-client-ce-dev6-passport',
    type: 'openid-client',
    mapping: 'openid-client',
    passportStrategyId: 'openid-client',
    enabled: true,
    callbackUrl: 'https://gluu.test.ce6.local.org/passport/auth/oidccedev6/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      client_id: 'b4e0f241-a8c1-4c75-8fc8-4ae7163e9695',
      client_secret: 'nmGIw7bAIKjrACXODzjPJyfYDaECAWSYzE1Temqz',
      redirect_uris: '["https://gluu.test.ce6.local.org/passport/auth/oidccedev6/callback"]',
      scope: '["openid", "email", "profile"]',
      issuer: 'https://gluu.test.ce6.local.org',
      token_endpoint_auth_method: 'client_secret_post'
    }
  }, {
    id: 'oidccedev6privatejwt',
    displayName: 'openid-client-ce-dev6-passport',
    type: 'openid-client',
    mapping: 'openid-client',
    passportStrategyId: 'openid-client',
    enabled: true,
    callbackUrl: 'https://gluu.test.ce6.local.org/passport/auth/oidccedev6privatejwt/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      client_id: 'b4e0f241-a8c1-4c75-8fc8-4ae7163e9695',
      client_secret: 'nmGIw7bAIKjrACXODzjPJyfYDaECAWSYzE1Temqz',
      scope: '["openid", "email", "profile"]',
      issuer: 'https://gluu.test.ce6.local.org',
      token_endpoint_auth_method: 'private_key_jwt'
    }
  }, {
    id: 'oidccedev6_pkce',
    displayName: 'openid-client-ce-dev6-pkce-flow',
    type: 'openid-client',
    mapping: 'openid-client',
    passportStrategyId: 'openid-client',
    enabled: true,
    callbackUrl: 'https://gluu.test.ce6.local.org/passport/auth/oidccedev6_pkce/callback',
    requestForEmail: false,
    emailLinkingSafe: false,
    options: {
      client_id: 'b4e0f241-a8c1-4c75-8fc8-4ae7163e9795',
      client_secret: 'nmGIw7bAIKjrACXODzjPJyfYDaECAWSzzE1Temqz',
      scope: '["openid", "email", "profile"]',
      issuer: 'https://gluu.test.ce6.local.org',
      token_endpoint_auth_method: 'client_secret_post',
      usePKCE: 'true',
      params: '{"preselectedExternalProvider": "tEmp", "acr_values": "duo"}'
    }
  }]
}

const root = process.cwd()
const passportFile = `${root}/test/testdata/passport-config.json`
const rateLimitWindowMs = 24 * 60 * 60 * 1000
const rateLimitMaxRequestAllow = 100
const cookieSameSite = 'none'
const cookieSecure = true

const HTTP_PROXY = 'http://localhost:3128'
const HTTPS_PROXY = 'http://localhost:3129'
const NO_PROXY = 'localhost,127.0.0.1'

module.exports = {
  saltFile,
  passportConfig,
  rateLimitWindowMs,
  rateLimitMaxRequestAllow,
  timerInterval,
  passportFile,
  passportConfigAuthorizedResponse,
  cookieSameSite,
  cookieSecure,
  HTTP_PROXY,
  NO_PROXY,
  HTTPS_PROXY
}
