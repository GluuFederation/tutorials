const router = require('express').Router()
const passport = require('passport')
const bodyParser = require('body-parser')

// auth login
router.get('/login', (req, res) => {
  res.render('login', { user: req.user })
})

// auth login
router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/auth/login')
})

// auth with oidc
router.get('/oidc', passport.authenticate('oidc-acr-passport-social', {}))

// redirect(callback) uri for oidc
router.get('/oidc/redirect', passport.authenticate('oidc-acr-passport-social'), (req, res) => {
  res.redirect('/profile')
})

// auth with saml
router.get('/saml', passport.authenticate('saml', {}))

// redirect(callback)SAML ACS uri assertion require HTTP Post handler
router.post('/saml/redirect',
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  function (req, res) {
    res.redirect('/profile')
  }
)

// auth with gluu passport saml
router.get('/inbound_saml', passport.authenticate('oidc-acr-passport-saml', {}))

module.exports = router
