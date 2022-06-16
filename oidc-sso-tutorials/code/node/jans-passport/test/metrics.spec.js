
const chai = require('chai')
const chaiHttp = require('chai-http')

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
  it('Health check - GET /passport/health-check', (done) => {
    chai.request(gluuBasePath)
      .get('/passport/health-check')

      .end((_err, res) => {
        res.should.have.status(200)
        done()
      })
  })

  it('GET request should return status code 200', (done) => {
    chai.request(gluuBasePath)
      .get('/passport/metrics')
      .end(function (_err, res) {
        res.should.have.status(200)
        done()
      })
  })
})
