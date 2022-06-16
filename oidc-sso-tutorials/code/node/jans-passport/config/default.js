module.exports = {
  passportFile: '/opt/gluu-server/etc/gluu/conf/passport-config.json',
  saltFile: '/opt/gluu-server/etc/gluu/conf/salt',
  timerInterval: 60000,

  // 24 hrs in milliseconds, Timeframe in miliseconds for which requests are checked/remembered
  rateLimitWindowMs: 24 * 60 * 60 * 1000,

  // Max number of connections during windowMs milliseconds before sending a 429 response.
  rateLimitMaxRequestAllow: 1000,

  cookieSameSite: 'lax',
  cookieSecure: false
}
