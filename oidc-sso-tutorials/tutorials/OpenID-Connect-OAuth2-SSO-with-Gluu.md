In this blog, I'll describe you that how you can integrated `OpenID Connect OAuth 2.0 Single Sign On` feature into your `NodeJS Application` using the `Gluu OpenID Connect Server/Provider`.

In this blog, I am securing `NodeJS Application` using `OpenID Connect Authorization Code security flow`. For quick integration and configuration I am using NPM package `passport` and `passport-openidconnect`. If you are using any other programing language or platform then you can definitely find the `OAuth library` for your platform, just search it on google, find it and try to implement it.

[Please check my previous blog to get more idea on OpenID Connect OAuth 2.0 concepts and flows](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/OpenID-Connect-OAuth-2.0-Overview-and-Security-Flows.md).

## OIDC Authorization Code Flow

It is a widely used flow for Web Application Security. Where you no need to expose `access_token` in the browser.

![OpenID Connect Authorization Code Flow](https://user-images.githubusercontent.com/39133739/93778662-c2d57980-fc43-11ea-9b6b-d6922136f095.png)

```
https://sequencediagram.org

title OIDC Authorization Code Flow

actor "++**User**++" as User #yellow
fontawesome5solid f2d0 "++**RP**++" as RP #purple
fontawesome5solid f5fd "++**Gluu OIDC Server**++" as OIDC #green

User->RP: login request or directly request for protected resources \nusing browser or mobile app
RP->OIDC: Redirect to **you_op_server.com/authorize** endpoint with \n **repsonse_type=code**, **redirect_uri**, **state** and some more as per requirements
note over OIDC#lightgreen: Auth Process Started \ne.g. Login page or 2FA
note over OIDC#lightgreen: User enter credentials
note over OIDC#lightgreen: OIDC Server Authenticate the user and \nif all is ok then redirect to RP with **code** and **state
OIDC->RP: Redirected to RP **your_rp.com/redirect_uri?code=[string]&state=[string]**
RP->OIDC: Request to **your_op_server.com/token** endpoint with **code**
OIDC->RP: Return **access_token**
RP->OIDC: Request to **your_op_server.com/userinfo** endpoint with **access_token** 
OIDC->RP: Return user details
RP->RP: Verify user and allow
RP->User: Allow login or allow to access protected endpoints(resources)
```

# Prerequisite

1. Node JS >= v12.x.x
1. NPM >= v6.x.x
1. Clone or download [node-gluu-sso](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/node-gluu-sso) for quick SP configuration. You can make your own also.
1. [Gluu CE with Shibboleth SAML IDP](https://gluu.org/docs/gluu-server) >= 4.x.x, during Gluu CE installation it will ask you `Install Shibboleth SAML IDP` and you need to install SAML IDP into your Gluu CE. [Check here for more details about Gluu Server](https://gluu.org/docs/gluu-server)

## Implementation and integration

### Stage 1 OP Server Configuration: Create a new OP Client into your OP Server

In `Gluu` case, You can use `oxTrust(Admin UI)` to create OP Client and get `Client ID` and `Client Secret`. We need this `client details` in `RP` application for next step.

Configure client as per details in screenshot:

![Gluu_create_client](https://user-images.githubusercontent.com/39133739/93860943-69218d80-fcdd-11ea-9426-72f073bc3ab2.png)

Create new client and you will get `client id` and `client secret`. We need this details in next step.

### Stage 2 RP Configuration: Generate Authorization URL and Request to OP Server

The `NodeJS` is acting here as a RP(Relying Party) and `Gluu` as a OP Server Provider.

- You can manually generate this URL and send redirect GET request to OP Server. [Check details here for manual integration](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/OpenID-Connect-OAuth-2.0-Overview-and-Security-Flows.md#stage-2-rp-configuration-generate-authorization-url-and-request-to-op-server). But we are using `passport` and `passport-openidconnect` so we just need to add configuration and all this things handle by passport library.

- Register the `passport-openidconnect` strategy.

    ```js
    const passport = require('passport')
    const PassportOIDCStrategy = require('passport-openidconnect')

    const oidcClientConfig = {
      issuer: 'https://your_op_server.com',
      authorizationURL: 'https://your_op_server.com/oxauth/restv1/authorize',
      tokenURL: 'https://your_op_server.com/oxauth/restv1/token',
      userInfoURL: 'https://your_op_server.com/oxauth/restv1/userinfo',
      clientID: '<op_client_id>',
      clientSecret: '<op_client_secret>',
      callbackURL: 'http://localhost:4200/auth/oidc/redirect',
      scope: 'openid email profile'
    }

    passport.use('oidc',
      new PassportOIDCStrategy(oidcClientConfig,
        // verify function, after getting access_token, execution control will be pass here.
        function oidcVerify (issuer, sub, profile, accessToken, refreshToken, done) {
          if (accessToken) {
            return done(null, { id: sub, name: profile.displayName })
          }

          return done({ message: 'Failed to get access_token' }, null)
        }
      )
    )
    ```

- Next we need to request to IDP using `passport`. For this create a one endpoint with below code.

    ```js
    router.get('/oidc', passport.authenticate('oidc', {}))
    ```

- Now you just need to hit `https://localhost:4200/oidc` endpoint into browser. request comes to `/oidc` endpoint and control goes to `passport` js. It will get configurations, build authorization URL and redirect you to OP Server.

- After OP user authentication, you will be redirect back to RP with `http://localhost:4200/auth/oidc/redirect` endpoint with `code` and `state` but you don't have this endpoint so you may get `404` in browser. Let's configure this redirect URI in next step.

### Stage 3 RP Configuration: Make a Code handler i.e. `redirect_uri` endpoint

Next step is to make a code handler that is `redirect_uri` endpoint at your RP side. 

```js
// redirect(callback) uri for oidc
router.get('/oidc/redirect', passport.authenticate('oidc'), (req, res) => {
  res.redirect('/profile')
})
```

This handler will get `code` and `state` from the URL and hit the `token endpoint`, get access token, hit the `userinfo endpoint`, get the `user details`, and pass your control to `verify` function which is in passport strategy configuration in `stage 2` and after this it will redirect your to `/profile` endpoint.

### Finished

You authentication process is finished here. You have `access_token` and `user details` now.

## SSO

Now use same configurations(except redirect url) with your other application and when you request for login, it will redirect you OP Server but OP Server will not prompt you for login page again, you will redirect back to your application and logged in because you already logged in and your session is on at OP Server side. 

So here you just need to login one time and you can easily use other applications this what we called `Single Sing On`.