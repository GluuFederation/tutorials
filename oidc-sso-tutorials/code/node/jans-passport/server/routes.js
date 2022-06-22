const router = require('express').Router()
const passport = require('passport')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const idpInitiated = require('./idp-initiated')
const providersModule = require('./providers')
const webutil = require('./utils/web-utils')
const misc = require('./utils/misc')
const logger = require('./utils/logging')
const path = require('path')
const { handleStrategyError } = require('./utils/error-handler')
const config = require('config')

router.get('/health-check', function (req, res) {
  return res.send({ message: 'Cool!!!', sessionCookie: req.session.cookie })
})

router.get('/error', function (req, res) {
  handleStrategyError(req, res)
})

router.post('/auth/saml/:provider/callback',
  validateProvider,
  authenticateRequestCallback,
  idpInitiated.process,
  callbackResponse)

router.get('/auth/:provider/callback',
  validateProvider,
  authenticateRequestCallback,
  callbackResponse)

router.post('/auth/:provider/callback',
  validateProvider,
  require('express').urlencoded({ extended: false }),
  authenticateRequestCallback,
  callbackResponse)

router.get('/auth/:provider/:token',
  validateProvider,
  validateToken,
  authenticateRequest)

router.get('/casa/:provider/:token',
  (req, res, next) => {
    req.failureUrl = '/casa/rest/pl/account-linking/idp-linking'
    next()
  },
  validateProvider,
  validateToken,
  authenticateRequestCasa)

// Token generation
router.get('/token',
  // eslint-disable-next-line no-unused-vars
  function (req, res, next) {
    logger.log2('verbose', 'Issuing token')
    const t = misc.getJWT({ jwt: uuidv4() }, 120) // 2 min expiration
    res.status(200).send({ token_: t })
  }
)

/*
* Metadata
* @todo: receive IDP id as an int and validate
* @todo: workaround: validate idp string "id" on oxauth/db/file
*/
router.get('/auth/meta/idp/:idp',
  function (req, res) {
    // normalizes
    const idp = path.basename(req.params.idp)
    const metaFileName = `${idp}.xml`
    const safeFileFullPath = path.join(__dirname, 'idp-metadata', metaFileName)

    logger.log2('verbose', `Metadata request for IDP ${idp}`)

    // handle ENOENT
    fs.readFile(safeFileFullPath,
      (err, data) => {
        if (err) {
          if (!fs.existsSync(safeFileFullPath)) {
            const EnoentError = `Requested metadata for ${metaFileName} not found`
            logger.log2('error', EnoentError)
            res.status(404).send('Requested metadata not found')
          } else {
            res.status(500).send(`An error occurred: ${err}`)
            logger.log2('error', err)
          }
        } else {
          res.status(200).set('Content-Type', 'text/xml').send(String(data))
        }
      })
  })

// Supporting functions

function validateProvider (req, res, next) {
  const provider = req.params.provider // provider is non empty here
  const providerConfData = global.providers.find(cfg => cfg.id === provider)

  if (providerConfData) {
    // Attach some info for later use
    req.passportAuthenticateParams = providerConfData.passportAuthnParams
    next()
  } else {
    webutil.handleError(
      req, res, 'The selected provider is not recognized as external identity provider')
  }
}

function authenticateRequest (req, res, next) {
  logger.log2('verbose', `Authenticating request against ${req.params.provider}`)
  passport.authenticate(req.params.provider, req.passportAuthenticateParams)(req, res, next)
}

function authenticateRequestCasa (req, res, next) {
  const provider = req.params.provider

  res.cookie('casa-' + provider, 'marker cookie', {
    httpOnly: true,
    maxAge: 120000, // 2min expiration
    secure: true
  })

  logger.log2('verbose', `Proceeding with linking procedure for provider ${provider}`)
  authenticateRequest(req, res, next)
}

function authenticateRequestCallback (req, res, next) {
  logger.log2('verbose', `Authenticating request against ${req.params.provider}`)
  passport.authenticate(
    req.params.provider, { failureRedirect: '/passport/error', failureFlash: true }
  )(req, res, next)
}

function validateToken (req, res, next) {
  const t = req.params.token
  try {
    logger.log2('verbose', 'Validating token')
    misc.verifyJWT(t)
    next()
  } catch (err) {
    const msg = 'Token did not pass validation.'
    logger.log2('error', `${msg} token: ${t}, error: ${err}`)
    webutil.handleError(req, res, msg)
  }
}

function callbackResponse (req, res) {
  let postUrl
  let user = req.user
  const provider = user.providerKey

  if (req.cookies['casa-' + provider]) {
    postUrl = '/casa/rest/pl/account-linking/idp-linking/' + provider
  } else {
    postUrl = config.get('postProfileEndpoint')
  }

  user = providersModule.applyMapping(user, provider)
  if (!user) {
    webutil.handleError(req, res, 'User profile is empty')
    return
  }

  const sub = user.uid
  logger.log2('info', `post url: ${postUrl}`)
  logger.log2('info', `User ${sub} authenticated with provider ${provider}`)

  // Apply transformation to user object and restore original provider value
  user = misc.arrify(user)
  user.provider = provider

  const now = new Date().getTime()
  const jwt = misc.getRpJWT({
    iss: postUrl,
    sub: sub,
    aud: config.get('opServerURI'),
    jti: uuidv4(),
    exp: now / 1000 + 30,
    iat: now,
    data: misc.encrypt(user)
  })

  logger.log2('debug', `Sending user data ${jwt} to: ${postUrl}`)

  res.set('content-type', 'text/html;charset=UTF-8')
  return res.status(200).send(`
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
      <body onload="document.forms[0].submit()">
        <noscript>
          <p>
            <b>Note:</b> your browser does not support JavaScript, please press the Continue
            button to proceed.
          </p>
        </noscript>

        <form action="${postUrl}" method="post">
          <div>
            <input type="hidden" name="user" value="${jwt}"/>
            <noscript>
              <input type="submit" value="Continue"/>
            </noscript>
          </div>
        </form>
      </body>
    </html>`
  )
}

module.exports = router
