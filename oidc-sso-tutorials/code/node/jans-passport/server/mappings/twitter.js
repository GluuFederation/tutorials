module.exports = profile => {
  return {
    uid: profile.username || profile.id,
    mail: profile._json.email,
    cn: profile.displayName || profile.username,
    displayName: profile.displayName || profile.username,
    // Using username. Node code does not explicit populate first/last name
    givenName: profile.username,
    sn: profile.username
  }
}
