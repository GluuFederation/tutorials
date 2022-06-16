module.exports = profile => {
  return {
    uid: profile.username || profile.id,
    mail: profile._json.email,
    cn: profile.displayName,
    displayName: profile.displayName,
    givenName: profile.first_name,
    sn: profile.last_name
  }
}
