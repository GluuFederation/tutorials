
const chai = require('chai')
const misc = require('../server/utils/misc')
const rewire = require('rewire')
const rewiredMisc = rewire('../server/utils/misc.js')
const sinon = require('sinon')

const assert = chai.assert

describe('misc.randomSecret', () => {
  it('should exist', () => {
    assert.exists(misc.randomSecret)
  })

  it('should be function', () => {
    assert.isFunction(misc.randomSecret)
  })

  it('should call crypto once', () => {
    const crypto = rewiredMisc.__get__('crypto')
    const randomBytesSpy = sinon.spy(crypto, 'randomBytes')
    const randomSecret = rewiredMisc.__get__('randomSecret')

    randomSecret()

    sinon.assert.calledOnce(randomBytesSpy)
  })
})

describe('misc.arrify', () => {
  /* This functions aims at transforming every key value
   of an object in the following way:

  "" --> []
  "hi" --> ["hi"]
  ["hi", "there"] --> ["hi", "there"]
  [{"attr":"hi"}, {"attr":"there"}] --> ['{"attr":"hi"}', '{"attr":"there"}']
  {"attr":"hi"} --> ['{"attr":"hi"}']
  [] --> []
  null --> []
  undefined --> []
  Object members which are functions are dropped
  */

  it('arrify should transform { "mail" : ""} in { mail : [] } ', () => {
    assert.deepEqual(
      misc.arrify({ mail: '' }),
      { mail: [] }
    )
  })

  it('arrify should transform { "username" : "johndoe" }' +
  ' in { "username" : ["johndoe"] }', () => {
    assert.deepEqual(
      misc.arrify({ username: 'johndoe' }),
      { username: ['johndoe'] }
    )
  })

  it('arrify should transform ' +
  '{ "mail" : [ "business@mail.com" , "personal@mail.com"] }' +
  ' in { "mail" : [ "business@mail.com" , "personal@mail.com"] }', () => {
    assert.deepEqual(
      misc.arrify({
        mail:
      ['business@mail.com', 'personal@mail.com']
      }),
      { mail: ['business@mail.com', 'personal@mail.com'] }
    )
  })

  it(' { "job" : [{"company":"gluu"}, {"role":"devops"}] } ' +
  'in { "job" : ["{"company":"gluu"}", "{"role":"devops"}"] }', () => {
    assert.deepEqual(
      misc.arrify(
        { job: [{ company: 'gluu' }, { role: 'devops' }] }
      ),
      { job: ['{"company":"gluu"}', '{"role":"devops"}'] }
    )
  })

  it(' { "mail" : { "gmail" : "johndoe@gmail.com" } } ' +
  'in { "mail" : ["{"gmail" : "johndoe@gmail.com"}"] }', () => {
    assert.deepEqual(
      misc.arrify({ mail: { gmail: 'johndoe@gmail.com' } }),
      { mail: ['{"gmail":"johndoe@gmail.com"}'] }
    )
  })

  it(' { profiles : [] } --> { profiles : [] }', () => {
    assert.deepEqual(
      misc.arrify({ profiles: [] }),
      { profiles: [] }
    )
  })

  it(' { profiles : undefined } --> { profiles : [] }', () => {
    assert.deepEqual(
      misc.arrify({ profiles: undefined }),
      { profiles: [] }
    )
  })

  it(' { profiles : null } --> { profiles : [] }', () => {
    assert.deepEqual(
      misc.arrify({ profiles: null }),
      { profiles: [] }
    )
  })

  // Object members which are functions are dropped
  it(' { key: function() { return 0; }, key2: "hi" } --> { key2: ["hi"] }',
    () => {
      assert.deepEqual(
        misc.arrify({ key: function () { return 0 }, key2: 'hi' }),
        { key2: ['hi'] }
      )
    })
})
