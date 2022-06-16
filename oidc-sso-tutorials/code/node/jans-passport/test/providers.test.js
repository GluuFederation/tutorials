const chai = require('chai')
const rewire = require('rewire')
const providers = rewire('../server/providers.js')
const config = require('config')
const PassportSAMLStrategy = require('passport-saml').Strategy
const helper = require('./helper')
const fs = require('fs').promises
const path = require('path')

const assert = chai.assert
const passportConfigAuthorizedResponse = config.get('passportConfigAuthorizedResponse')

describe('providers.js', () => {
  describe('setupStrategy', () => {
    before(() => {
      process.env.ALLOW_CONFIG_MUTATIONS = 'true'
      helper.configureLogger()
      const passportFullConfig = config.get('passportConfigAuthorizedResponse')
      const iiconfigStub = passportFullConfig.idpInitiated
      providers.__set__('iiconfig', iiconfigStub)
    })

    const passportStrategies = providers.__get__('passportStrategies')
    const setupStrategy = providers.__get__('setupStrategy')
    const testProvider = {
      ...passportConfigAuthorizedResponse.providers[0],
      verifyCallbackArity: 0
    }

    it('passport strategies array should be empty first time', () => {
      assert.deepEqual(passportStrategies, [])
    })

    it('new strategy should be added in passport strategies', () => {
      setupStrategy(testProvider)

      assert.lengthOf(passportStrategies, 1)
      assert.isFunction(
        passportStrategies[0].Strategy,
        'Strategy is not a function!'
      )
    })

    it('added strategy should be a function', () => {
      setupStrategy(testProvider)
      assert.isFunction(
        passportStrategies[0].Strategy,
        'Strategy is not a function!'
      )
    })

    it('existing loaded strategy should be found and load again', () => {
      setupStrategy(testProvider)

      assert.lengthOf(passportStrategies, 1)
      assert.isFunction(
        passportStrategies[0].Strategy,
        'Strategy is not a function!'
      )
    })

    it('Passport SAML Provider with redis setup should initialize the passport-saml strategy', () => {
      const testProvider = passportConfigAuthorizedResponse.providers.find(
        provider => provider.id === 'saml-redis-test'
      )
      try {
        const oPassportSAMLStrategy = new PassportSAMLStrategy(
          testProvider.options, (profile, done) => { }
        )
        assert.exists(oPassportSAMLStrategy, 'Failed to initialize passport saml strategy')
      } catch (error) {
        assert.fail('Failed to intialize passport-saml strategy with redis setup')
      }
    })
  })

  describe('applyMapping', () => {
    const applyMappingRewire = providers.__get__('applyMapping')
    const fakeProfile = {
      sub: 'loganXMen',
      email: 'logan@gmail.com',
      name: 'Logan',
      given_name: 'Hugh Jackman'
    }

    it('should be a function', () => {
      assert.isFunction(applyMappingRewire)
    })

    it('should return mapped data as per mapping file config', () => {
      global.providers = passportConfigAuthorizedResponse.providers
      const mappedProfileResult = applyMappingRewire(fakeProfile, 'oidccedev6privatejwt')
      const fakeMappedProfile = {
        uid: fakeProfile.sub,
        mail: fakeProfile.email,
        cn: fakeProfile.given_name,
        displayName: fakeProfile.name,
        givenName: fakeProfile.given_name,
        sn: undefined
      }

      assert.deepStrictEqual(mappedProfileResult, fakeMappedProfile)
    })

    it('should log user profile data in log file', async () => {
      const passportLogFilePath = path.join(__dirname, '../server/utils/logs/passport.log')
      const data = await fs.readFile(passportLogFilePath, 'binary')
      assert(data.includes('Raw profile is'))
      assert(data.includes(fakeProfile.email))
      assert(data.includes(fakeProfile.name))
    })
  })
})
