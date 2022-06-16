module.exports = profile => {
  return {
    uid: profile.sub,
    mail: profile.email,
    cn: profile.given_name,
    displayName: profile.name,
    givenName: profile.given_name,
    sn: profile.name.family_name
  }
}
