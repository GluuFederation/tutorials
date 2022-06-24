module.exports = {
  // add your all passport provider in passport.json file
  providersFile: '/opt/gluu-server/etc/passport.json',

  // your janssen server FQDN
  opServerURI: 'https://your.jans.server.com',

  // check tutorial docs to generate RSA private key
  // it is used to generate/sign jwt which has authenticated user data 
  keyPath: '/etc/certs/your-passport-rp.pem',
  keyId: 'your-passport-rp-pem-kid',
  keyAlg: 'RS512',

  // after janssen server installation you will get salt file at /etc/jans/conf/salt
  // it is used to encrypt user data which is inside jwt
  // check server/routes.js:L175 for details and implementation
  saltFile: '/etc/jans/conf/salt',

  // janssen server post login full url
  postProfileEndpoint: 'https://your.jans.server.com/jans-auth/postlogin.htm',
  failureRedirectUrl: 'https://your.jans.server.com/jans-auth/postlogin.htm',
  
  // other configs
  port: 8090,
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
  rateLimitWindowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
  rateLimitMaxRequestAllow: 1000,
  cookieSameSite: 'none',
  cookieSecure: true,
  HTTP_PROXY: process.env.HTTP_PROXY,
  HTTPS_PROXY: process.env.HTTPS_PROXY,
  NO_PROXY: process.env.NO_PROXY
}
