const chai = require('chai')
const config = require('config')
const chaiHttp = require('chai-http')
const InitMock = require('./testdata/init-mock')
const chaiFiles = require('chai-files')

const passportConfig = config.get('passportConfig')

const expect = chai.expect
chai.use(chaiFiles)
chai.use(chaiHttp)
const file = chaiFiles.file

const contexto = {}

// @todo: implement context variables to use in stage testing

describe('app.init() - Initialization', () => {
  const passportConfigURL = new URL(passportConfig.configurationEndpoint)
  const gluuHostName = passportConfigURL.hostname
  const gluuUrl = passportConfigURL.origin // https://<hostname>
  const configurationEndpointPath = passportConfigURL.pathname
  const ticket = '016f84e8-f9b9-11e0-bd6f-0021cc6004de'
  const initMock = new InitMock()

  describe('First call to passport config endpoint', () => {
    // before
    initMock.passportConfigEndpoint()
    let response
    chai.request(gluuUrl)
      .get(configurationEndpointPath)
      .end(function (_err, res) {
        response = res
      })

    it('first request to config endpoint should return 401', () => {
      expect(response.status).to.be.equal(401)
    })

    it('first request to config endpoint should return proper header',
      () => {
        const expectedHeader = {
          server: 'Apache/2.4.29 (Ubuntu)',
          'x-xss-protection': '1; mode=block',
          'x-content-type-options': 'nosniff',
          'strict-transport-security':
            'max-age=31536000; includeSubDomains',
          'www-authenticate': 'UMA realm="Authentication Required", ' +
            `host_id=${gluuHostName}, ` +
            `as_uri=${gluuUrl}/.well-known/uma2-configuration, ` +
            `ticket=${ticket}`,
          'content-length': '0',
          connection: 'close'
        }
        expect(response.headers).to.be.deep.equal(expectedHeader)
      })
  })
  describe('GET uma configuration endpoint', () => {
    initMock.umaConfigurationEndpoint()
    let response
    chai.request(gluuUrl)
      .get('/.well-known/uma2-configuration')
      .end(function (_err, res) {
        response = res
      })

    it('endpoint should return status 200', () => {
      expect(response.status).to.be.equal(200)
    })

    it('content-type should be application/json', () => {
      expect(response.headers)
        .to.have.property('content-type', 'application/json')
    })

    it('response body should have token_endpoint key', () => {
      expect(response.body).to.have.property('token_endpoint')
    })

    it('issuer key should be gluu hostname', () => {
      expect(response.body).to.have
        .property('issuer', gluuUrl)
    })
  })

  describe('POST to UMA token endpoint', () => {
    // before
    initMock.umaTokenEndpoint()
    let response
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
      ticket: ticket
    }

    chai.request(gluuUrl)
      .post('/oxauth/restv1/token')
      .set('host', gluuHostName)
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('accept', 'application/json')
      .set('Connection', 'close')
      .send(umaTokenRequestBody)
      .end(function (_err, res) {
        response = res
        expect(res.status).to.equal(200)
      })

    it('response status code expected to be 200', () => {
      expect(response.status).to.be.equal(200)
    })

    it('response header content-type should be application/json', () => {
      expect(response.headers)
        .to.have.property('content-type', 'application/json')
    })

    it('response body should contain access_token key', () => {
      expect(response.body).to.have.property('access_token')
      contexto.accessToken = response.body.access_token
    })

    it('response body should contain token_type Bearer', () => {
      expect(response.body).to.have
        .property('token_type', 'Bearer')
      contexto.tokenType = response.body.token_type
    })

    it('response body should contain pct key', () => {
      expect(response.body).to.have.property('pct')
      contexto.pct = response.body.pct
    })
  })
  describe('Second call to passport config endpoint', () => {
    let response
    // before
    initMock.passportConfigEndpoint()

    const accessToken = '4f31fd1c-852a-4226-b81c-5910aee14246' +
        '_7673.FFB2.0429.E289.BE8F.91B6.5255.82BF'
    const pct = 'd0a71780-877f-4edb-b002-592f61d9df72_F978.5DC2.' +
        '97F8.BA28.3B17.C447.C3FA.153D'

    // Authorized (second UMA request already w/ token and pct)
    const passportConfigAuthorizedRequestHeaders = {
      authorization: `Bearer ${accessToken}`,
      pct: pct,
      host: gluuHostName,
      Connection: 'close'
    }

    // request
    chai.request(gluuUrl)
      .get(configurationEndpointPath)
      .set(passportConfigAuthorizedRequestHeaders)
      .end(function (_err, res) {
        response = res
      })

    it('response status code expected to be 200', () => {
      expect(response.status).to.be.equal(200)
    })

    it('response should have conf, idpInitiated and providers keys', () => {
      expect(response.body).to.have.all.keys(
        'conf', 'idpInitiated', 'providers'
      )
    })

    it('response.conf should have expected keys', () => {
      expect(response.body.conf).to.have.all.keys(
        'logging',
        'postProfileEndpoint',
        'serverURI',
        'serverWebPort',
        'spTLSCert',
        'spTLSKey'
      )
    })

    it('server uri should be same from basic configuration file', () => {
      expect(response.body.conf.serverURI).to.be.equal(gluuUrl)
    })

    it('expect spTLSCert file to exist', () => {
      expect(file(response.body.conf.spTLSCert)).to.exist
    })

    it('expect spTLSKey file to exist', () => {
      expect(file(response.body.conf.spTLSKey)).to.exist
    })
  })
})
