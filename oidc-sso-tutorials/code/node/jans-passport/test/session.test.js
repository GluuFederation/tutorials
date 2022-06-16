const chai = require('chai')
const assert = chai.assert
const rewire = require('rewire')
const sessionRewire = rewire('../server/utils/session')

describe('rate-limiter.js test', () => {
  const expressSessionConfig = sessionRewire.__get__('expressSessionConfig')
  const session = sessionRewire.__get__('session')

  it('expressSessionConfig should exist', () => {
    assert.exists(expressSessionConfig)
  })

  it('expressSessionConfig should be object', () => {
    assert.isObject(expressSessionConfig)
  })

  it('expressSessionConfig should have cookie.sameSite and cookie.secure', () => {
    const cookie = expressSessionConfig.cookie
    assert.exists(cookie.sameSite)
    assert.exists(cookie.secure)
  })

  it('session should exist', () => {
    assert.exists(session)
  })

  it('session should be function', () => {
    assert.isFunction(session)
  })
})
