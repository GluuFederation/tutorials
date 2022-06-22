module.exports = {
  providersFile: '/opt/gluu-server/etc/passport.json',
  logging: {
    level: 'info',
    consoleLogOnly: false,
    activeMQConf: {
      enabled: false,
      host: '',
      username: '',
      password: '',
      port: 0
    }
  },
  port: 8090,
  serverURI: 'https://your.jans.server.com',
  saltFile: '/etc/gluu/conf/salt',
  keyPath: '/etc/certs/passport-rp.pem',
  keyId: 'your-passport-rp-pem-kid',
  keyAlg: 'RS512',
  postProfileEndpoint: 'https://your.jans.server.com/jans-auth/postlogin.htm',
  failureRedirectUrl: 'https://your.jans.server.com/jans-auth/postlogin.htm',
  timerInterval: 60000,
  rateLimitWindowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  rateLimitMaxRequestAllow: 1000,
  cookieSameSite: 'none',
  cookieSecure: true,
  HTTP_PROXY: process.env.HTTP_PROXY,
  HTTPS_PROXY: process.env.HTTPS_PROXY,
  NO_PROXY: process.env.NO_PROXY
}
