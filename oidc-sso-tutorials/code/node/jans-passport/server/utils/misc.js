const config = require('config')
const R = require('ramda')
const sha1 = require('sha1')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const fs = require('fs')

const randomSecret = () => {
  const buf = crypto.randomBytes(256)
  return buf.toString('hex')
}

const isObject = x => !R.isNil(x) && !Array.isArray(x) && typeof x === 'object'

const pipePromise_ = R.reduce((p, fn) => Promise.resolve(p).then(fn))

/**
 * Chains a sequence of calls and avoid callback hell
 * @sig (a -> Promise b, b -> Promise c, ...) -> (a -> Promise z)
 * @type {(function(): *)|(function(*): *)|(function(*, *): *)|(function(*, *, *): *)
 * |(function(*, *, *, *): *)|(function(*, *, *, *, *): *)|*}
 *
 */
const pipePromise = R.pipe(R.unapply(R.flatten), R.flip(pipePromise_))

const curry2AndFlip = R.pipe(R.curryN(2), R.flip)

const hash = obj => sha1(JSON.stringify(obj))

function pathsHaveData (list, obj) {
  let pred = R.pathSatisfies(R.anyPass([R.isNil, R.isEmpty]))
  pred = R.anyPass(R.map(pred, list))
  return !pred(obj)
}

const hasData = (list, obj) => pathsHaveData(R.map(x => [x], list), obj)

const privateKey = R.once(() =>
  fs.readFileSync(config.get('keyPath'), 'utf8')
    .replace(
      '-----BEGIN RSA PRIVATE KEY-----',
      '-----BEGIN PRIVATE KEY-----'
    )
    .replace(
      '-----END RSA PRIVATE KEY-----',
      '-----END PRIVATE KEY-----'
    )
)

const defaultRpOptions = R.once(() => ({
  algorithm: config.get('keyAlg'),
  header: {
    typ: 'JWT',
    alg: config.get('keyAlg'),
    kid: config.get('keyId')
  }
}))

const secretKey = R.once(() => {
  const salt = fs.readFileSync(config.get('saltFile'), 'utf8')
  return /=\s*(\S+)/.exec(salt)[1]
})

/**
 * Calls jwt.sign to generate RpJWT w/ privateKey and defaultOptions
 * @param payload : Object containing payload
 * @returns jwt.sign : Signed RP Jwt (expected)
 */
const getRpJWT = payload => jwt.sign(payload, privateKey(), defaultRpOptions())

const getJWT = (payload, expSec) => jwt.sign(
  payload, secretKey(), { expiresIn: expSec }
)

const verifyJWT = token => jwt.verify(token, secretKey())

function arrify (obj) {
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

  Object.keys(obj).forEach((key) => {
    if (!obj[key]) {
      obj[key] = []
    }

    switch (typeof obj[key]) {
      case 'string': obj[key] = [obj[key]]
        break

      case 'object':
        if (Array.isArray(obj[key])) {
          const arr = []
          obj[key].forEach((item) => {
            if (typeof item === 'string') {
              arr.push(item)
            } else if (typeof item === 'object') {
              const str = JSON.stringify(item)
              arr.push(str)
            }
          })
          obj[key] = arr
        } else {
          obj[key] = [JSON.stringify(obj[key])]
        }
        break

      case 'function':
        delete obj[key]
        break
    }
  })

  return obj
}

function encrypt (obj) {
  // Encryption compatible with Gluu EncryptionService
  const pt = JSON.stringify(obj)
  const encrypt = crypto.createCipheriv('des-ede3-ecb', secretKey(), '')
  let encrypted = encrypt.update(pt, 'utf8', 'base64')
  encrypted += encrypt.final('base64')
  return encrypted
}

module.exports = {
  isObject: isObject,
  hash: hash,
  pathsHaveData: pathsHaveData,
  hasData: hasData,
  pipePromise: pipePromise,
  curry2AndFlip: curry2AndFlip,
  arrify: arrify,
  getRpJWT: getRpJWT,
  getJWT: getJWT,
  verifyJWT: verifyJWT,
  encrypt: encrypt,
  randomSecret: randomSecret
}
