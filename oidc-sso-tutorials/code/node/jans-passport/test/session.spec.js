
const chai = require('chai')
const chaiHttp = require('chai-http')
const config = require('config')

chai.use(chaiHttp)

// it is indirectly used at here res.should.have.status
// eslint-disable-next-line no-unused-vars
const should = chai.Should()

/**
 * Integration test using localhost (not mocked)
 */
describe('/passport/metrics - metrics endpoint (integration)', () => {
  const gluuBasePath = 'http://127.0.0.1:8090'

  // server should be up and running, integration test
  // health check used to inspect req.session.cookie
  it('Health check - GET /passport/health-check', (done) => {
    const sameSiteConfig = config.get('cookieSameSite')
    const secureConfig = config.get('cookieSecure')
    chai.request(gluuBasePath)
      .get('/passport/health-check')
      .set('Cookie', 'SameSite=None')
      .end((_err, res) => {
        res.body.sessionCookie.should.include(
          {
            sameSite: sameSiteConfig,
            secure: secureConfig
          }
        )
        done()
      })
  })
})
