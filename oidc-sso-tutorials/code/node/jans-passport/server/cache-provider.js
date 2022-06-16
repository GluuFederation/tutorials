const redis = require('redis')
const Memcached = require('memcached')
const Promise = require('bluebird')
const logger = require('./utils/logging')
const OPERATION_NO_CONN = 'Attempt to operate on cache provider but connection has not been established'

const promisify = (context, methodName) => Promise.promisify(context[methodName], { context: context })

const retryStrategy = (options) => {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    return new Error('The redis server refused the connection')
  }
  if (options.total_retry_time > 1000 * 60 * 60) {
    // 1 min, End reconnecting after a specific timeout and flush all commands
    return new Error('Redis connection retry time exhausted')
  }
  if (options.attempt > 10) {
    // End reconnecting with built in error
    return undefined
  }
  // reconnect after milliseconds
  return Math.min(options.attempt * 100, 3000)
}

function getRedisProvider (options, exp) {
  logger.log2('info', 'Configuring redis cache provider for inResponseTo validation')
  options.retry_strategy = retryStrategy

  let ready = false
  const client = redis.createClient(options)
  const getAsync = promisify(client, 'get')
  const setAsync = promisify(client, 'set')
  const delAsync = promisify(client, 'del')

  client.on('ready', () => {
    ready = true
    const host = options.host
    const port = options.port
    const msg = host && port ? `${host}:${port}` : ''
    logger.log2('info', `Redis client has connected to server ${msg}`)
  })
  client.on('error', err => logger.log2('error', err))
  client.on('end', _ => {
    ready = false
  })

  return {
    save: function (key, value, cb) {
      if (ready) {
        setAsync(key, value, 'EX', exp)
          .then(_ => cb(null, value))
          .catch(err => cb(err, null))
      } else {
        logger.log2('warn', OPERATION_NO_CONN)
      }
    },
    get: function (key, cb) {
      if (ready) {
        getAsync(key)
          .then(value => cb(null, value))
          .catch(err => cb(err, null))
      } else {
        logger.log2('warn', OPERATION_NO_CONN)
      }
    },
    remove: function (key, cb) {
      if (ready) {
        delAsync(key)
          .then(res => cb(null, res === 0 ? null : key))
          .catch(err => cb(err, null))
      } else {
        logger.log2('warn', OPERATION_NO_CONN)
      }
    }
  }
}

function getMemcachedProvider (options, exp) {
  logger.log2('info', 'Configuring memcached provider for inResponseTo validation')
  const memcached = new Memcached(options.server_locations, options.options)
  const getAsync = promisify(memcached, 'get')
  const setAsync = promisify(memcached, 'set')
  const delAsync = promisify(memcached, 'del')

  return {
    save: function (key, value, cb) {
      setAsync(key, value, exp)
        .then(_ => cb(null, value))
        .catch(err => cb(err, null))
    },
    get: function (key, cb) {
      getAsync(key)
        .then(value => cb(null, value))
        .catch(err => cb(err, null))
    },
    remove: function (key, cb) {
      delAsync(key)
        .then(_ => cb(null, key))
        .catch(err => cb(err, null))
    }
  }
}

function get (type, options, expiration) {
  if (type === 'redis') {
    return getRedisProvider(options, expiration)
  } else if (type === 'memcached') {
    return getMemcachedProvider(options, expiration)
  } else {
    logger.log2('warn', `Unknown cache provider ${type}`)
    return null
  }
}

module.exports = {
  get: get
}
