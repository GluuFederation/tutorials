module.exports = {
  oidcClientConfig: {
    issuer: 'https://gluu.mali.org',
    authorizationURL: 'https://gluu.mali.org/oxauth/restv1/authorize',
    tokenURL: 'https://gluu.mali.org/oxauth/restv1/token',
    userInfoURL: 'https://gluu.mali.org/oxauth/restv1/userinfo',
    clientID: '13d55391-c08f-467c-85db-6a4a4f3b7c8f',
    clientSecret: 'DepscM0wERDZp9lLSBaSIfDfBbp0SGOkS8VU17H6',
    callbackURL: 'http://localhost:4200/auth/oidc/redirect',
    scope: 'openid email profile'
  },
  samlConfig: {
    entryPoint: 'https://gluu.mali.org/idp/profile/SAML2/POST/SSO',
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    authnRequestBinding: 'HTTP-POST',
    issuer: 'passport_saml_rp',
    skipRequestCompression: true,
    callbackUrl: 'http://localhost:4200/auth/saml/redirect',
    cert: 'MIIDZzCCAk8CFBEpsZWJPn11KnqUTQCbTVRo/e24MA0GCSqGSIb3DQEBCwUAMHAx CzAJBgNVBAYTAklOMQswCQYDVQQIDAJHSjEOMAwGA1UEBwwFU3VyYXQxDTALBgNV BAoMBEdsdXUxFjAUBgNVBAMMDWdsdXUubWFsaS5vcmcxHTAbBgkqhkiG9w0BCQEW DmtpcmFuQGdsdXUub3JnMB4XDTIwMDkxNTEzMjgyN1oXDTIxMDkxNTEzMjgyN1ow cDELMAkGA1UEBhMCSU4xCzAJBgNVBAgMAkdKMQ4wDAYDVQQHDAVTdXJhdDENMAsG A1UECgwER2x1dTEWMBQGA1UEAwwNZ2x1dS5tYWxpLm9yZzEdMBsGCSqGSIb3DQEJ ARYOa2lyYW5AZ2x1dS5vcmcwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIB AQDGTkW9GGgd0U+2UEtzREb7oLj/O3XwavQClNTzY9VOyN0E8wmHl9BVfRWG0NoH zyoRDg7qikg8Z8OjIkuO70lmnW6A5C5441nw6FtBs7aRYProjMHEo7Tqihq+FtPW Pk2zEaRhuYsWqS27zuqz/rkoASkFDlvi4zr+T9MDf3i8Fo1l6+ZJqDzOBt4y98vG X6PjDRnpNMmcGBW72Jccl2QNeKH4XYVjVMQ/d/vXZL4aLmdNX81qkZUXyi881hwg XOJ9dSTCIPUqUUSqmlKWyltsqa35NbtqJwD10nRsxYCO09BleK2A3MBl9IzFwDY/ vw0Rb3ziGnMQ55OpQsPsXKTdAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAL/PtrPT Dlvs0zOUW7jmyO0snHmVXJYsmEd7HkWf40t9YEtVm8KmdzkoBwzj3pTjDmSS3i56 QDxWRBFytDclLaugWSC15CTSCiywuuToIQSyzQwU7RxFDBKZSeP7KqaOsdgN0WL9 NXi1DZQ93VKwfPq7uW5evRqQvMQz/38B/PUvai0gBbGF3B3N8REaWpbu+vNFsICO 0WX5kp1Cwp7YoWU1K/+03XKoFWzfzwWebgNlbhmHTWfJ1yXAxPkp3aEURxZOB90g cJi5f1HAzbAyaz6QJp5ta4iYZRnGITW82xtf0qC1oxH8e6sfrwLyIfPHxlCAaq6k pt5YQWUfMZKxlW0=',
    // validateInResponseTo: true,
    requestIdExpirationPeriodMs: 3600000,
    // /etc/certs/passport-sp.key
    decryptionPvk: `-----BEGIN RSA PRIVATE KEY-----
    MIIEogIBAAKCAQEAs232wBVXdLiUAq+7Cj56Hof3N/jzC6pu/SCmu6eeOQ7p4mYI
    lK159SpcT26+enS3psnS5ygwQOyuY524JO7sTaFDjmfCyr56e/xWoYIw3QKQUhkn
    S5ydQcyWwGaDd2Olq284mC+/iGM3xSV4RZ+ObkXFWNybmlPTudy64yLxaYD7Loqo
    vSQ64xwUtjQlPgAPgSKHlw93Vv9u/cNRSkMnuLVRH1svsHNUasFUqvJr3KGljzfq
    XPc/kUYQ4oRFQFbkp9ZbYsG9vVypz7Vpact6bexyaZbD1tnp09P3q1TCFr0HDH19
    vG0/5PpvsVmht+dkMFw6l013YaM59rNZeEwvRQIDAQABAoIBAGsjxUxLMg6bTJ4S
    CrCCP+9NJtyARbh4i4+QWJ8C5qKReiza2lLVB1bSdY5kxU5ftW3dY5bt02phKXyI
    J/W9yNJN8gXthU4E0SSJt7z2/XBq4Hx1UpZ+rRQmMvot/GBk2v70CaouEMNC44FP
    73I7ZRQJi16VVEChv3JjECEis15YSv7X8AlWqxRE7fBbRJFO2FlEZbRfFUoZMInT
    HKON6wfNSL6jDFRgPfR/d2nzuuyeklc18fli0FCIjhXJk+dE5BV+wgRRFZ+TQYM2
    FVj4XegCPHaNn4p7RFr1LYH4c6F6bz/AGkvKyjXXyyKs3NuPa5BIErFBpp9ExQ9e
    Vsj5UcECgYEA3s5CDgq/URa2w1694VjLK5jfg00ZM84s0jA4SIzPXa9ZZGmyGQv5
    Hhf6X5+Sn8Vv4hk0wsPBqxa79LIoeBm9luepQIqWrVU6z04tCb1l1VLa3awmSNoi
    Fk6NvHuVq9YaX2qqhfl8X5VPVxntYWyxWc70PhiHt5WWScWUywKp7RUCgYEAzila
    RJXeC4CM14ZpPAWUSPHNJ0hQmFj+FclniQvif6oshplqFavpY0e+tWWGlZaw0Yin
    kYBbwNlxMDljc2RPFbK1Kg23+zNT4nUvN/AvWvwZUR5tbL65BkOJ9j3YIasaRfZB
    uFbowFSt6L+QNTjpcR8OHzJ/24PirRXTCyaMpXECgYAfwM1xKt7xM4eAeHQfNYRf
    Bj50e/xnga6ple2viUHUXDUlNlsHbslmHIy2LAu9cWnskyMNztA/DdJjoTBbTW/T
    ndhlNlsbANaMzNtmU/O7Xz+J8ArUvyG0hCV3AzXlc3H2v0DmLxQmmyTfiPZnuBHe
    drwgTWaqJ0tv4BTAifSlsQKBgG0514ty43uwle4yVlrokdG72nevhpPQwn2EgYhI
    da4x2PlPGrd0p2hkQJQWwCFM/01kW3NpUDNygNeN8DTYtlXGotku/4TlgtH+SBAY
    /t3zpu4lctAklB7Pda6ywWnFH1xlxhgGY7ZSpvkjVSH9jyDR1UeOF9OTomsVnwTP
    XcDhAoGANm/g2qqu+8/NqsLi1HWm3RVARfKC3+s/Evvc5KpIRxj+rD+h1y2JbLl/
    yjWGyjeroP+DB/fHe0wQywNAkFBOr6iYhogu826yEEjWC9PHE+sO1F2r0jr4fF1D
    X9qnUpXdnnLBTyCdAfTNbMuZGfrmrNO025wlKRaTRAHg1NvAuNQ=
    -----END RSA PRIVATE KEY-----`
  }
}
