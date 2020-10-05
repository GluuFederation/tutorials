const express = require('express')
const cookie = require('cookie-session')
const passport = require('passport')
const authRoute = require('./routes/auth-routes')
const profileRoute = require('./routes/profile-route')

require('./config/passport-setup')

const app = express()

// set session
app.set('trust proxy', 1) // trust first proxy
app.use(cookie({
  maxAge: 24 * 60 * 60 * 1000,
  keys: ['qwertyzxcvbnm']
}))

// initialize passport
app.use(passport.initialize())
app.use(passport.session())

// set up view engine
app.set('view engine', 'ejs')

// register auth route
app.use('/auth', authRoute)

// register profile route
app.use('/profile', profileRoute)

// Create route
app.get('/', (req, res) => {
  res.render('home', { user: req.user })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(err.stack)
  if (err) {
    res.status(500).send({ Error: err.stack })
  }
})

// views assets
app.use(express.static(`${__dirname}/views/assets`))

// For self-signed certificate.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

// Start listening server
app.listen(4200, () => {
  // eslint-disable-next-line no-console
  console.log('-----------------------\nServer started successfully!, Open this URL http://localhost:4200\n-----------------------')
})

module.exports = app
