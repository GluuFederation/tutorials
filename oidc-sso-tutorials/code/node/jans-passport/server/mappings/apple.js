module.exports = profile => {
  return {
    uid: profile.id,
    mail: profile.email,
    givenName: profile.name && profile.name.firstName,
    sn: profile.name && profile.name.lastName
  }
}
