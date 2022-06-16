module.exports = profile => {
  return {
    uid: profile.email,
    mail: profile.email,
    cn: profile.displayName,
    displayName: profile.displayName,
    givenName: profile.firstName,
    sn: profile.lastName
  }
}
