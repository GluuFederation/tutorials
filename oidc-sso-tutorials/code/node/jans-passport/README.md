Note: This is just a ruff work not ready for production.

# Overview

The [Janssen](https://github.com/JanssenProject/jans) platform provides the facility to make a fully customizable authentication flow. In this tutorial, We will guide you on how to add Inbound identity support in Janssen.

## What is Inbound identity?

You can add social login options, authentication, and add users to your Janssen server.

![inbound-identity-simple-flow](https://user-images.githubusercontent.com/39133739/175252987-a4aef5f0-960f-4cdc-a9c2-ea8e12de1bef.png)

[Balsamiq Mockup file is here](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/files/jans.bmpr)

# Prerequisites

- A Jans-auth Server (installation instructions [here](https://github.com/JanssenProject/jans/tree/main/jans-linux-setup#readme))
- The [Passport Social authentication script](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/passport-social-jans-script.py)
- The [Jans Passport JS Project](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/jans-passport)
- External Social Provider credentials: we are going to integrate google as a external provider so create credentials from [google developer portal](https://console.developers.google.com/apis/credentials)
- RP application: This is your application which will be used by your users and where you want to add this auth feature. 

## Sample Authentication Flow diagram

![inbound-identity-app-flow](https://user-images.githubusercontent.com/39133739/175962105-724ef375-aa5b-4a2b-8fce-79a9351d0a8b.png)

[sequencediagram.org file is here](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/files/inbound-identity-sequence.txt)

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

```sh
# list app to find id
pm2 list

# stop project
pm2 stop <id>

# restart project
pm2 restart <id>
```

### Jans passport configurations

Use [config/production.js](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/config/production.js) for configurations.

| Property | Details |
|-----|---------|
| providersFile | JSON File path which contains all external social provider data. which will be use by jans-passport and jans-script. Check below section what exactly you need to add in this JSON file. |
| opServerURI | Your janssen server FQDN |
| keyPath | RSA Private key file path. Check [instructions here](#generate-keystore) to create JKS Keystore. It is used to generate/sign jwt which has authenticated user data. jans-passport sends this JWT to jans-server on `/postlogin.html` endpoint after successful user auth. |
| keyId | RSA Private key's keyId(KID). |
| keyAlg | RSA algorithm which is used to generate/sign JWT. Recommended to use `RS512`. |
| saltFile | Just a text file with random text. After janssen server installation you will get salt file at `/etc/jans/conf/salt`. Use this same file, during verification janssen use same salt file. It is used to encrypt user data which is inside jwt. Check [server/routes.js:L175](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/server/routes.js#L175) for details and implementation. |
| postProfileEndpoint | e.g. https://[your.jans.server.com]/jans-auth/postlogin.htm, After getting userinfo jans-passport send user jwt to this endpoint for further auth flow. |
| failureRedirectUrl | just in case anything fails at jans-passport side then redirect to failureRedirectUrl with error message. Keep it same as postProfileEndpoint. |

check [config/production.js](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/config/production.js) for other application configurations.

### Exeternal Social Provider configurations

It is array of json object. Each object will be your provider. We are using [PassportJS](https://www.passportjs.org/). Below is the sample for google as a external social provider.

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
    "callbackUrl": "https://your.jans.server.com/passport/auth/google/callback",
    "requestForEmail": false,
    "emailLinkingSafe": false,
    "options": {
      "clientID": "xxxxxxxxxxxxxxxxxxxxxxxx",
      "clientSecret": "xxxxxxxxxxxxxxxx"
    }
  }
]
```

| Property | Description |
|----------|-------------|
| id | Unique string for your provider |
| displayName | This name will be shown on auth page |
| type | Use `oauth` for all social logins |
| mapping | this is mapping file name. you can find social mapping file name [here](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/jans-passport/server/mappings) |
| passportStrategyId | this is exactly your passport strategy name. List is [here](#strategies-and-configurations) |
| enabled | If true, show provider otherwise not on auth login page |
| callbackUrl | `https://<your_jans_server_fqdn>/passport/auth/<your_provider_id>/callback` replace with your id and jans-fqdn. Same URL you need to configure on your external provider side in client. |
| requestForEmail | It is not required to be `true`. If you set to true then it will prompt user to enter email. |
| emailLinkingSafe | It is not required to be `true`. If you want to link to existing users then set it to true |
| options | For social provider you just need to set two property inside `options` i.e. `clientID` and `clientSecret` |

### Strategies and configurations

Below strategies are already available in jans-passport.

| Provider | Strategy Id | Mapping |
|----------|-------------|---------|
| Apple | @nicokaiser/passport-apple | apple |
| Google | passport-google-oauth2 | google |
| Facebook | passport-facebook | facebook |
| GitHub | passport-github | github |
| Twitter | passport-twitter | tritter |
| LinkedIn | @sokratis/passport-linkedin-oauth2 | linkedin |
| Tumblr | passport-tumblr | tumblr |
| Dropbox | passport-dropbox-oauth2 | dropbox |
| Windows Live | passport-windowslive | windowslive |

## Apache proxy setup

For seamless flow, we used apache proxy pass to configure jans-passport with jans-server. Add below configuration in jans apache and restart apache.

```
<Location /passport>
    ProxyPass http://localhost:8090/passport retry=5 connectiontimeout=60 timeout=60
    Order deny,allow
    Allow from all
</Location>
```

Now you will get idea why we have jans-fqdn in passport provider callback url config.


## Add passport-social script

Download the script from [here](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/node/jans-passport/passport-social-jans-script.py) and add it to jans using jans-cli. After jans installation you will get jans-cli. 
Follow the [instructions here](https://github.com/JanssenProject/jans-cli/blob/main/docs/cli/cli-custom-scripts.md#update-an-existing-custom-script) to add custom script in jans.

The custom script has the following properties:

| Property | Description |
|----------|-------------|
| key_store_file | keystore file path. Use this instructions to create keystore. |
| key_store_password | keystore file secret password |
| providers_json_file | provider json file which you are also using for jans-passport config. |

## Generate keystore

jans-passport sends private key sign user data jwt to jans server, for that we need to generate keystore. keystore is safe and passport protected private key container. Use below commands:

```
# generate keystore with keystore

keytool -genkey -keyalg RSA -keysize 2048 -v -keystore <keystore-file-name>.jks -alias <kid-unique-string>

Example:
keytool -genkey -keyalg RSA -keysize 2048 -v -keystore keystore.jks -alias kid-2s3d5-f5-6f5-f4dd4
```

This command will prompt to enter password. Whichever password you have entered, this same password you need to configure `key_store_password` at jans custom script configuration.

`<kid-unique-string>` is your kid which you need it for jans-passport  `keyId` config. `keystore.jks` need it to configure `key_store_file` property at jans custom script configuration.

```
# JKS to PKCS#12

keytool -importkeystore -srckeystore keystore.jks \
   -destkeystore keystore.p12 \
   -srcstoretype jks \
   -deststoretype pkcs12
```

```
# PKCS#12 to PEM

openssl pkcs12 -nodes -in keystore.p12 -out keystore.pem
```

You can see many things in `keystore.pem`. but we need only private key part so make a new file and add private key part there like in below example:

```
// private.pem

-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCSETIkMkVKOwwO
XkYVPaBdz+lhsXpMjMJR4dTdFzn01hvcEDUf57wLmgvBXnfWDXEyEFrsvQGePZw7
foYAdnCtSqZW+dLsh6SUxL5iK0uakiY4SBX401fpbhdCeSC1pK8K+qE3jgc/o60d
oRAHLz/RCwaa8BszTwyxlLMh7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxPQEK0b5mPeV84fZJlfbRv01PIrwGRZJtcWC9Ke5
xSBoh0uvpZ37z2CJC7HZSz+bYz0ZhYiX372gl7BUxbLYdCz2Z9l0DDhwCO68wCzC
nualRv0U2Y5EYkekj180KnAR
-----END PRIVATE KEY-----
```

we need this file for jans-passport `keyPath` config.