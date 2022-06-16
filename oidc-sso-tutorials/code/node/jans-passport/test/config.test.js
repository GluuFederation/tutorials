
const chai = require('chai')
const assert = chai.assert

/**
 * Testing configs (env) on /config/*.js (uses node-config module)
 */

const defaultcfg = require('../config/default.js')
const productioncfg = require('../config/production.js')

describe('defaultcfg', function () {
  it('default.js should have passportFile not null or undefined', () => {
    assert.exists(
      defaultcfg.passportFile, 'passportFile is not null or undefined')
  })

  it('default.js should have saltFile not null or undefined', () => {
    assert.exists(
      defaultcfg.saltFile, 'saltFile is not null or undefined')
  })

  it('default.js should have cookieSameSite value lax', () => {
    assert.exists(defaultcfg.cookieSameSite, 'cookieSameSite does NOT exists')
    assert.equal(defaultcfg.cookieSameSite, 'lax', 'cookieSameSite value is NOT lax')
  })

  it('default.js should have cookieSecure value false', () => {
    assert.exists(
      defaultcfg.cookieSecure, 'cookieSecure does NOT exist'
    )
    assert.isFalse(defaultcfg.cookieSecure)
  })
})

describe('productioncfg', function () {
  it('production.js should have passportFile  not null or undefined', () => {
    assert.exists(
      productioncfg.passportFile, 'passportFile is not null or undefined')
  })
  it('production.js should have saltFile not null or undefined', () => {
    assert.exists(
      productioncfg.saltFile, 'saltFile is not null or undefined')
  })
  it('production.js shoud have cookieSameSite', () => {
    assert.exists(
      productioncfg.cookieSameSite, 'cookieSameSite does not exist'
    )
  })
  it('production.js should have cookieSameSite value none', () => {
    assert.equal(productioncfg.cookieSameSite, 'none', 'cookieSameSite value is NOT none')
  })
  it('production should have cookieSecure value true', () => {
    assert.exists(
      productioncfg.cookieSecure, 'cookieSecure does NOT exist'
    )
    assert.isTrue(productioncfg.cookieSecure)
  })
})
