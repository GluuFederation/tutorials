In this blog, I am going to describe to you about SAML SSO SP(Service Provider) Initiated flow, SAML configuration in Gluu CE(Shibboleth SAML IDP), and Configure your Node Application as a Service Provider(SP).

# Prerequisite

1. Node JS >= v12.x.x
1. NPM >= v6.x.x
1. Clone or download [node-passport](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/node-gluu-sso) for quick SP configuration. You can make your own also.
1. [Gluu CE with Shibboleth SAML IDP](https://gluu.org/docs/gluu-server) >= 4.x.x, during Gluu CE installation it will ask you `Install Shibboleth SAML IDP` and you need to install SAML IDP into your Gluu CE. [Check here for more details about Gluu Server](https://gluu.org/docs/gluu-server)

# Terminology

### 1. IDP

It stand for `Identity Provider`. It is just a SAML server that follows the `SAML Open Standard` and provides `authentication` and `authorization` facilities. 

For Example: Shibboleth SAML IDP which comes with Gluu CE. During the installation of Gluu CE, you will get prompt to install `Shibboleth SAML`, enter `Yes` and install it.

### 2. SP
        
Service Provider is the application or software which users are use to access facilities, features and you can say protected resources. 

For example: You have one `File Storage` application where you are storing your all data. Before accessing this data, it prompts or show a login page to you for security and authentication. So here your `File Storage` application use `Gluu Shibboleth SAML IDP` to authenticate you and secure your data. In this the `File Storage` application is SP and `Gluu Shibboleth` is `SAML IDP`.


# What is SSO?

You need to login once and you can use any application of Currently logged in organization.

For Example: You login to Google Gmail one application then you can use Google Drive, Google Keep Node, and other Google Applications.

# What is SAML?

SAML is Security Assertion Markup Language where it defines some open standard to exchanging authentication and authorization data between IDP(Identity Provider) and SP(Service Provider). It is like a framework where defines many flows and clearly defines how to request and respond for auth so that you can achieve authentication, authorization, and Single Sign-On(SSO) feature with Full Security features.

# SP Initiated Flow

There are many flows in SAML. Currently, we are trying the most common and used flow that is SP initiated flow. In which the SP first request for user authentication to the IDP

```
www.websequencediagrams.com

title SAML SSO SP Initiated Flow

user->SP: Click on the login button on page or request for protected data
SP->IDP: SAML authentication request
IDP->user: Prompt and show login page
note left of IDP: If the user already logged in then directly allow ie. SSO
user->IDP: enter credentials
IDP->IDP: authenticate the user
IDP->SP: send authentication response to SP i.e. SAML Assertion
SP->user: Verify user and allow access to use protected data
```

![saml-auth-flow](https://user-images.githubusercontent.com/39133739/93079962-9e5d2880-f6aa-11ea-9521-feee3d4b4151.png)

# Integration and Implementation

### Step 1 SP Configuration: Register [Passport-SAML](https://github.com/node-saml/passport-saml) strategy

We are here making our custom SP(Nodejs App) which requests IDP for user authentication. We are using `Passport-SAML` to make it easy. 

> For demo, I've created and using [node-passport](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/node-gluu-sso) as a Service Provider, Code is [here](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/node-gluu-sso).

* As per my code, Node SP is running on `http://localhost:4200`
* Gluu IDP is running on `https://gluu.mali.org`
* Callback URL as per my code is `http://localhost:4200/auth/saml/redirect`. IDP send back to SP with SAML assertion to this endpoint and it should be `HTTP POST` as per current configuration. In SAML language it is known as `ACS(Assertion Consumer Service) URL`.

I am using the Passport SAML client in my Node Application. It is a good library or client that provides many facilities to quickly configure the SAML SSO into your Node application. [More details](https://github.com/node-saml/passport-saml)

First thing we need to register the passport-saml strategy.

```javascript

const PassportSAMLStrategy = require('passport-saml').Strategy;

samlConfig: {
    entryPoint: 'https://gluu.mali.org/idp/profile/SAML2/POST/SSO',
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
    authnRequestBinding: 'HTTP-POST',
    issuer: 'passport_saml_rp',
    skipRequestCompression: true,
    callbackUrl: 'http://localhost:4200/auth/saml/redirect',
    cert: 'MIIDbTC...Z5X7Ykd/DrrGc=',
    requestIdExpirationPeriodMs: 3600000,
    decryptionPvk: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0MQHOuNNQ6c...LAOWSw==\n-----END RSA PRIVATE KEY-----\n'
  }

const oPassportOIDCStrategy = new PassportSAMLStrategy(strategyConfig.samlConfig,
  // verfiy
  (profile, done) => {
    console.log('--- SAML Response ---', profile)
    return done(null, { id: profile['urn:oid:0.9.2342.19200300.100.1.3'], name: profile['urn:oid:2.16.840.1.113730.3.1.241'] })
  }
)
passport.use(
  oPassportOIDCStrategy
)
```

### Step 2 SP Configuration: What is `cert` in passport `samlConfig`? How to get it?

It is the IDP's public signing certificate used to validate the signatures of the incoming SAML Responses.

As Per Gluu settings you can get this in `https://[your-idp-url]/idp/shibboleth`. In my case, I use `https://gluu.mali.org/idp/shibboleth`.

Copy the public cert from `<ds:X509Certificate>` tag inside of `<KeyDescriptor use="signing">` and past it into passport config key `cert`.

### Step 3 SP Configuration: What is `decryptionPvk` in passport `samlConfig`? How to get it?

It is a private key that will be used to attempt to decrypt any encrypted assertions that are received by our node application.

As Per gluu settings you can get this key in gluu chroot and the path is `/etc/certs/passport-sp.key`. Open this file copy content and past it into `decryptionPvk` in passport config.

### Step 4 SP Configuration: Generate a Service Provider(SP) metadata

In this step, we will generate the SP metadata and register it into Gluu IDP as a Trust Relationship.

I've created the Node CLI Program where you can easily pass some certs details and generate an SP metadata file.

The program is [here](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/node-gluu-sso/utils/generate-service-provider-metadata.js)

You need to set two certs in file.

1. `decryptionCert`: `/etc/certs/passport-sp.crt` in `Gluu CE` Case
2. `signingCert`: the cert from `https://<your.idp.com>/idp/shibboleth` endpoint in side `signing` > `ds:X509Certificate`. It is same which we pass in passport `cert` config above.

After settings values, run below command

```sh
$ node generate-service-provider-metadata.js
```

It will generate `local.xml` in the current directory. The next step is to register this XML into your Gluu IDP as SP Metadata so that In SMAL Request your IDP can verify your SP.

### Step 5 Gluu IDP Configuration: Create TR(Trust Relationship) in Gluu IDP

- Go to Gluu Admin UI - oxTrust identity
- Go to menu SAML > Add Trust Relationship
- Add whatever you want in `Display Name` and `Description`
- Select entity type `Single SP`
- Select Metadata local `File`
- Select your `local.xml` file
- Skip Logout URL for now
- Check the box of `Configure Relying Party:` then click on `Configure Relying Party` - the right side of the checkbox
- Now it will open one model popup
- Select `SAML2SSO` and Add
- Enter `assertionLifetime: 300000`
- Select `Sign Responses: Always`
- Select `Sign Assertions: Never`
- Select `Sign Request: Conditional`
- Select `Encrypt Assertions: Always`
- Select `Encrypt Name IDs: Always`
- Select `Default Authn Methods: urn:oasis:names:tc:SAML:2.0:ac:classes:Password`
- Checked true `includeAttributeStatement?`
- Checked true `Support Unspecified NameIdFormat?`
- Select `SAML:2.0:nameid-format:transient` and add
- Now `Release additional attributes` which is at the right side, select the attribute you want after authentication.
- Click on Save

### Step 6 Gluu IDP Configuration: Enable passport-saml script in Gluu IDP

Gluu has some custom authentication script by which you can control the authentication flow at IDP. for saml you need to enable the `passport_saml` script. Check [Gluu CE Docs here](https://gluu.org/docs/gluu-server/authn-guide/inbound-saml-passpor) for more details.

In `passport_saml` script there is one more option for SAML ACRs `Select SAML ACRS:` so select all acrs and `update` script.

### Step 7 SP Configuration: Authentication request in Node App

This is available in code [here](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/node-gluu-sso). Let's take a quick look again.

```js
router.get(`/auth/saml/`, passport.authenticate('saml', {}))

router.post(`/auth/saml/redirect`, bodyParser.urlencoded({ extended: false }), passport.authenticate('saml', {}))
```

There are two things
1. It will generate SAML request as per configuration in passport saml strategy and redirect you to IDP Page for authentication.

2. After user authentication at IDP side, IDP redirect back to this endpoint with an `HTTP Post` request and SAML Assertion

If all is ok then your control will be passed to passport verify section:

```js
const oPassportSAMLStrategy = new PassportSAMLStrategy(strategyConfig.samlConfig,
  // verfiy section
  (profile, done) => {
    console.log('--- SAML Response ---', profile)
    return done(null, { id: profile['urn:oid:0.9.2342.19200300.100.1.3'], name: profile['urn:oid:2.16.840.1.113730.3.1.241'] })
  }
)
```

And In profile, you will get your user information.

Thank you !!!
