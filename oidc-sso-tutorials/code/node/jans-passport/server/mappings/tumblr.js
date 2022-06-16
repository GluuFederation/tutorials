module.exports = profile => {
  return {
    uid: profile.username,
    // It is not certain if these ones work. tumblr node does not explicitly populate this fields
    // passport-tumblr repo seems no longer maintained
    mail: profile._json.email,
    cn: profile._json.displayName,
    displayName: profile._json.displayName,
    givenName: profile._json.givenName,
    sn: profile._json.familyName
  }
}
