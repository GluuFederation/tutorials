module.exports = profile => {
  return {
    uid: profile.username || profile.id,
    mail: profile.emails[0].value,
    cn: profile.displayName,
    displayName: profile.displayName,
    givenName: profile.name.givenName,
    sn: profile.name.familyName
  }
}
