module.exports = profile => {
  return {
    uid: profile['urn:oid:0.9.2342.19200300.100.1.1'],
    // memberOf: profile["urn:1.3.6.1.4.1.48710.1.3.121"],
    mail: profile.email || profile['urn:oid:0.9.2342.19200300.100.1.3'] || profile['urn:oid:1.2.840.113549.1.9.1'],
    cn: profile['urn:oid:2.16.840.1.113730.3.1.241'],
    displayName: profile['urn:oid:2.16.840.1.113730.3.1.241'],
    givenName: profile['urn:oid:2.5.4.42'],
    sn: profile['urn:oid:2.5.4.4']
  }
}
