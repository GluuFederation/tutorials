const passport = require('passport')
const R = require('ramda')
const spMetadata = require('./sp-meta')
const misc = require('./utils/misc')
const logger = require('./utils/logging')
const extraPassportParams = require('./extra-passport-params')
const cacheProvider = require('./cache-provider')
const { getClient } = require('./utils/openid-client-helper')
const config = require('config')

let prevConfigHash = 0

// These are the (node) strategies loaded so far: [{id: "...", Strategy: ...}, ... ]
const passportStrategies = []

function applyMapping (profile, provider) {
  let mappedProfile
  try {
    const mapping = global.providers.find(
      providerObj => providerObj.id === provider).mapping

    const additionalParams = profile.extras

    delete profile.extras
    logger.log2('debug', `Raw profile is ${JSON.stringify(profile)}`)
    logger.log2('info', `Applying mapping '${mapping}' to profile`)

    mappedProfile = require('./mappings/' + mapping)(profile, additionalParams)
    logger.log2('debug', `Resulting profile data is\n${JSON.stringify(mappedProfile, null, 4)}`)
  } catch (err) {
    logger.log2('error', `An error occurred: ${err}`)
  }
  return mappedProfile
}

function getVerifyFunction (provider) {
  const arity = provider.verifyCallbackArity

  const uncurried = (...args) => {
    // profile and callback are the last 2 params in all passport verify functions

    const profile = args[arity - 2]
    const extras = args.slice(0, arity - 2)

    const cb = args[arity - 1]
    profile.providerKey = provider.id
    profile.extras = extras

    return cb(null, profile)
  }

  // guarantee the function has the arity required
  return R.curryN(arity, uncurried)
}

async function setupStrategy (provider) {
  logger.log2('info', `Setting up strategy for provider ${provider.displayName}`)
  logger.log2('debug', `Provider data is\n${JSON.stringify(provider, null, 4)}`)

  const id = provider.id
  const strategyModule = provider.passportStrategyId

  let Strategy = passportStrategies.find(strategy => strategy.id === id)

  // if strategyModule is not found, load it
  if (Strategy) {
    Strategy = Strategy.Strategy
  } else {
    logger.log2('info', `Loading node strategy module ${strategyModule}`)
    Strategy = require(strategyModule)

    if (provider.type === 'oauth' && Strategy.OAuth2Strategy) {
      Strategy = Strategy.OAuth2Strategy
    } else {
      Strategy = Strategy.Strategy
    }

    logger.log2('verbose', 'Adding to list of known strategies')
    passportStrategies.push({ id, Strategy })
  }

  const providerOptions = provider.options
  const isSaml = strategyModule === 'passport-saml'
  const verify = getVerifyFunction(provider)

  // Create strategy
  if (isSaml) {
    // Turn off inResponseTo validation if the IDP is configured for IDP-initiated:
    // "an IDP would never do both IDP initiated and SP initiated..."
    if (global.iiconfig.authorizationParams.find(
      authorizationParam => authorizationParam.provider === id)) {
      providerOptions.validateInResponseTo = false
    }

    // Instantiate custom cache provider if required
    if (providerOptions.validateInResponseTo) {
      const f = R.anyPass([R.isNil, R.isEmpty])
      const exp = providerOptions.requestIdExpirationPeriodMs / 1000

      if (!f(providerOptions.redisCacheOptions)) {
        providerOptions.cacheProvider = cacheProvider.get(
          'redis', providerOptions.redisCacheOptions, exp
        )
      } else if (!f(providerOptions.memcachedCacheOptions)) {
        providerOptions.cacheProvider = cacheProvider.get(
          'memcached', providerOptions.memcachedCacheOptions, exp
        )
      }
    }

    const samlStrategy = new Strategy(providerOptions, verify)
    passport.use(id, samlStrategy)
    spMetadata.generate(provider, samlStrategy)
  } else if (strategyModule === 'openid-client') {
    try {
      const client = await getClient(provider)
      const oidcStrategyOptions = { client }

      oidcStrategyOptions.usePKCE = providerOptions.usePKCE || false
      oidcStrategyOptions.params = providerOptions.params ? providerOptions.params : {}

      passport.use(id, new Strategy(oidcStrategyOptions, verify))
    } catch (error) {
      logger.log2('error', error.message)
    }
  } else {
    passport.use(id, new Strategy(providerOptions, verify))
  }
}

function parseProp (value) {
  try {
    if (typeof value === 'string') {
      value = JSON.parse(value)
    }
  } catch (err) {
    // not an error. For datatypes other than string,
    // the original parameter value is returned

  }
  return value
}

/**
* @TODO refactor ramda to native
*/
function fixDataTypes (providers) {
  for (const provider of providers) {
    // The subproperties of provider's options potentially come from the server as strings, they should
    // be converted to other types if possible
    let value = provider.options

    if (misc.isObject(value)) {
      R.forEach((key) => {
        value[key] = parseProp(value[key])
      }, R.keys(value))
    } else {
      logger.log2(
        'warn', `Object expected for property options, found ${JSON.stringify(value)}`
      )
      value = {}
    }
    provider.options = value

    // Tries to convert passportAuthnParams to a dictionary, otherwise {} is left
    value = parseProp(provider.passportAuthnParams)
    if (!misc.isObject(value)) {
      // log message only if passportAuthnParams is not absent
      if (!R.isNil(value)) {
        logger.log2(
          'warn', `Parsable object expected for property passportAuthnParams, found ${JSON.stringify(value)}`
        )
      }
      value = {}
    }
    provider.passportAuthnParams = value
  }
}

function mergeProperty (strategyId, obj, property) {
  const extraParams = extraPassportParams.get(strategyId, property)
  return R.mergeLeft(obj[property], extraParams)
}

function fillMissingData (providers) {
  const paramsToFill = ['passportAuthnParams', 'options']

  // eslint-disable-next-line no-return-assign
  R.forEach(provider => R.forEach(prop => provider[prop] = mergeProperty(
    provider.passportStrategyId, provider, prop), paramsToFill), providers)

  for (const provider of providers) {
    const options = provider.options
    const strategyId = provider.passportStrategyId
    const isSaml = strategyId === 'passport-saml'
    const callbackUrl = R.defaultTo(options.callbackUrl, options.callbackURL)
    const prefix = config.get('opServerURI') + '/passport/auth'

    if (isSaml) {
      // Different casing in saml
      options.callbackUrl = R.defaultTo(`${prefix}/saml/${provider.id}/callback`, callbackUrl)
    } else if (strategyId === 'openid-client') {
      options.redirect_uris = [R.defaultTo(`${prefix}/${provider.id}/callback`, callbackUrl)]
    } else {
      options.callbackURL = R.defaultTo(`${prefix}/${provider.id}/callback`, callbackUrl)
      // Some passport strategies expect consumer* instead of client*
      options.consumerKey = options.clientID
      options.consumerSecret = options.clientSecret
      // Allow state validation in passport-oauth2 based strategies
      options.state = true
    }

    // Strategies with "special" treatments
    if (strategyId.indexOf('passport-apple') >= 0 && options.key) {
      // Smells like apple...
      try {
        // @TODO: we have to make the UI fields multiline so they can paste the contents and avoid this
        options.key = require('fs').readFileSync(options.key, 'utf8')
      } catch (e) {
        logger.log2('warn', `There was a problem reading file ${options.key}. Ensure the file exists and is readable`)
        logger.log2('error', e.stack)
        options.key = ''
      }
    }

    // Fills verifyCallbackArity (number expected)
    const value = extraPassportParams.get(strategyId, 'verifyCallbackArity')
    let toadd
    if (options.passReqToCallback) {
      toadd = 1
    } else {
      toadd = 0
    }

    // In most passport strategies the verify callback has arity 4 except for saml
    if (typeof value === 'number') {
      provider.verifyCallbackArity = value
    } else {
      let arity
      if (isSaml) {
        arity = 2
      } else {
        arity = 4
      }
      provider.verifyCallbackArity = toadd + arity
    }
  }
}

/**
 * Setup providers and sets global `providers`
 * @param providers : Object containing providers (fetched from config endpoint)
 * @TODO refactor function name to setupProviders
 */
function setup (providers) {
  providers = R.defaultTo([], providers)
  const hashConfig = misc.hash(providers)
  if (hashConfig !== prevConfigHash) {
    // Only makes recomputations if config data changed
    logger.log2('info', 'Reconfiguring providers')

    prevConfigHash = hashConfig
    // Unuse all strategies before reconfiguring
    R.forEach(s => passport.unuse(s), R.map(R.prop('id'), passportStrategies))

    // "Fix" incoming data
    fixDataTypes(providers)
    fillMissingData(providers)

    R.forEach(setupStrategy, providers)
    // Needed for routes.js
    global.providers = providers
  }
}

module.exports = {
  setup: setup,
  applyMapping: applyMapping
}
