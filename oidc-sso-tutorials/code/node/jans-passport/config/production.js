module.exports = {
  providersFile: '/opt/gluu-server/etc/passport.json',
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
  },
  port: 8090,
  serverURI: 'https://gluu.mali.org',
  opServerURI: 'https://gluu.mali.org',
  saltFile: '/etc/gluu/conf/salt',
  keyPath: '/etc/certs/passport-rp.pem',
  keyId: '0ca7dda7-7da6-47f5-8932-beffd9d5eac6_sig_rs512',
  keyAlg: 'RS512',
  postProfileEndpoint: 'https://gluu.mali.org/oxauth/postlogin.htm',
  timerInterval: 60000,
  rateLimitWindowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  rateLimitMaxRequestAllow: 1000,
  cookieSameSite: 'none',
  cookieSecure: true,
  HTTP_PROXY: process.env.HTTP_PROXY,
  HTTPS_PROXY: process.env.HTTPS_PROXY,
  NO_PROXY: process.env.NO_PROXY
}
