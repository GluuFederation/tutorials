module.exports = profile => {
  return {
    uid: profile.user_name || profile.sub,
    mail: profile.email,
    cn: profile.name,
    displayName: profile.name,
    givenName: profile.given_name,
    sn: profile.family_name
  }
}
