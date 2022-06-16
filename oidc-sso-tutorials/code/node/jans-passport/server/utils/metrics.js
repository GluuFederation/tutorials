// openmetrics middleware

const promBundle = require('express-prom-bundle')
const promClient = require('prom-client')

promClient.register.clear()

const metricsMiddleware = promBundle({
  metricsPath: '/passport/metrics',
  includeMethod: true,
  buckets: [0.03, 0.3, 1, 1.5, 3, 5, 10],
  includePath: true,
  normalizePath: [
    ['^/passport/auth/(?=saml).*/(.*)/callback',
      '/passport/auth/saml/#provider/callback'],

    ['^/passport/auth/(?=.*)(?!.*saml).*/callback',
      '/passport/auth/#provider/callback'],

    ['^/passport/auth/meta/idp/(.*)',
      '/passport/auth/meta/idp/#metadata'],
    [
      '^/passport/auth/(?=.*)(?!.*meta|saml/|/callback).*/' +
      '(?=.*)(?!.*callback).*',
      '/passport/auth/#provider/#token'
    ]
  ]
})

module.exports = metricsMiddleware
