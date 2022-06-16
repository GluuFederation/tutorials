const R = require('ramda')

function handleError (req, res, msg) {
  if (R.isNil(req)) {
    res.status(500).send(msg)
  } else {
    const failureUrl = R.defaultTo(global.basicConfig.failureRedirectUrl, req.failureUrl)
    res.redirect(`${failureUrl}?failure=${msg}`)
  }
}

module.exports = {
  handleError: handleError
}
