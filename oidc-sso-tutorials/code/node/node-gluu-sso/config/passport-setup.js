const passport = require('passport')
const PassportOIDCStrategy = require('passport-openidconnect')
const PassportSAMLStrategy = require('passport-saml').Strategy
const strategyConfig = require('./client-creds')

passport.serializeUser((user, done) => done(null, user))

passport.deserializeUser((user, done) => done(null, user))

passport.use('oidc-acr-passport-social',
  new PassportOIDCStrategy({ ...strategyConfig.oidcClientConfig, acr_values: 'passport_social' },
    // verify
    oidcVerify
  )
)

passport.use('oidc-acr-passport-saml',
  new PassportOIDCStrategy({ ...strategyConfig.oidcClientConfig, acr_values: 'passport_saml' },
    // verify
    oidcVerify
  )
)

function oidcVerify (issuer, sub, profile, accessToken, refreshToken, done) {
  if (accessToken) {
    return done(null, { id: sub, name: profile.displayName })
  }

  return done({ message: 'Failed to get access_token' }, null)
}

const oPassportSAMLStrategy = new PassportSAMLStrategy(strategyConfig.samlConfig,
  // verfiy
  (profile, done) => {
    console.log('--- SAML Response ---', profile)
    return done(null, { id: profile['urn:oid:0.9.2342.19200300.100.1.3'], name: profile['urn:oid:2.16.840.1.113730.3.1.241'] })
  }
)

passport.use(
  oPassportSAMLStrategy
)

module.exports = {
  oPassportSAMLStrategy
}
