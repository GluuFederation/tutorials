Note: This is just a ruff work not ready for production.

# Overview

The [Janssen](https://github.com/JanssenProject/jans) platform provides the facility to make a fully customizable authentication flow. In this tutorial, We will guide you on how to add Inbound identity support in Janssen.

## What is Inbound identity?

You can add social login options, authentication, and add users to your Janssen server.

![inbound-identity](https://user-images.githubusercontent.com/39133739/175252987-a4aef5f0-960f-4cdc-a9c2-ea8e12de1bef.png)

# Prerequisites

- A Jans-auth Server (installation instructions [here](https://github.com/JanssenProject/jans/tree/main/jans-linux-setup#readme))
- The [Passport Social authentication script](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/passport-social-jans-script.py)
- The [Jans Passport JS Project](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/jans-passport)

# Setup

## Setup Jans Passport JS Project

This projects generate auth request for your external social providers, get the user information and send it to Janssen server.

Take [Jans Passport JS Project from here](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/jans-passport). Use Node >= 16 to install deps and run project.

```sh
# install deps
npm install
```

```sh
# run project in background

npm i -g pm2
pm2 start 'npm start'
```

### Jans passport configurations

Use [config/production.js](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/config/production.js) for configurations.

| Property | Details |
|-----|---------|
| providersFile | JSON File path which contains all external social provider data. which will be use by jans-passport and jans-script. Check below section what exactly you need to add in this JSON file. |
| opServerURI | Your janssen server FQDN |
| keyPath | RSA Private key file path. It is used to generate/sign jwt which has authenticated user data. jans-passport sends this JWT to jans-server on `/postlogin.html` endpoint after successful user auth. |
| keyId | RSA Private key's keyId. |
| keyAlg | RSA algorithm which is used to generate/sign JWT. Recommended to use `RS512`. |
| saltFile | Just a text file with random text. After janssen server installation you will get salt file at `/etc/jans/conf/salt`. Use this same file, during verification janssen use same salt file. It is used to encrypt user data which is inside jwt. Check [server/routes.js:L175](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/server/routes.js#L175) for details and implementation. |
| postProfileEndpoint | e.g. https://[your.jans.server.com]/jans-auth/postlogin.htm, After getting userinfo jans-passport send user jwt to this endpoint for further auth flow. |
| 

### Exeternal Social Provider configurations

It is 

```js
// passport.json

[
  {
    "id": "google",
    "displayName": "google",
    "type": "oauth",
    "mapping": "google",
    "passportStrategyId": "passport-google-oauth2",
    "enabled": true,
    "callbackUrl": "https://gluu.mali.org/passport/auth/google/callback",
    "requestForEmail": false,
    "emailLinkingSafe": false,
    "options": {
      "clientID": "248309610635-ijule410k1b34805a91uo64vnp70okhs.apps.googleusercontent.com",
      "clientSecret": "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"
    }
  }
]
```