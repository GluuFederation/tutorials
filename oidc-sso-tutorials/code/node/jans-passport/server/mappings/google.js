module.exports = profile => {
  return {
    uid: profile.username || profile.id,
    mail: profile.email,
    cn: profile.displayName,
    displayName: profile.displayName,
    givenName: profile.name.givenName,
    sn: profile.name.familyName
  }
}
