In this blog, I'll give you an overview of OpenID Connect and its security flows.

## What and Why OpenID Connect OAuth 2.0 security?

It is the security framework. It has many flows as per application requirements, that defines how to request and respond for authentication and authorization.

There are many reasons why to choose it,

1. `Security` :closed_lock_with_key: 

    The user identity and data security is a crucial part of every application. Your application should need to be 100% sure that the one who is using the application is the correct user. The only username/password security to identify users and for application security is a bad idea :-1:.

2. `SSO(Single Sign-On)` :100: 

    Just guess you have many applications/products and you are prompting the login page to user to access every individual application. This is bad. The solution is SSO. The OpenID Connect OAuth 2.0 is by default provide this great feature. In SSO, the user just needs to log in once, and then the user will be able to access Your any applications.

3. Share User info with other application :dart: 

    This is also one of the best features of OpenID Connect OAuth 2.0. 

    **For example:** You have one **multiple player game application** and you are prompting registration form, force users to enter details, and login users to play games. isn't it a bad idea? **The solution is OpenID Connect OAuth 2.0.**
    
    You must have seen in so many applications that log in with **Twitter, Gmail, Facebook,** etc.... So Once a user clicks on a button it redirects us to specific social media(OP - OpenID Connect Server). Users login to social media, redirect back to the current application and the current application allows us to log in. **So How can social media platform allows the other application to authenticate and authorized user so This is OpenID Connect OAuth 2.0 security.**

4. Many other features :bookmark_tabs: 

   It provides an awesome feature to control user authentication using **OAuth Tokens**. For example: Allow users to use applications for specific time limits using **access token expiration, revoke tokens**, and get a new token using the **refresh token** to continue user session.  

# [Gluu](https://gluu.org) :1st_place_medal: 

Now think if you are building these above features on your own then this is also not a good idea. Use OpenID Connect Provider. In the market, one of the best OpenID Connect providers is [Gluu](HTTP://gluu.org) who has passed OpenID Connect Certification many times, customization(UI + Security), and the best thing about it is Open Source :heart:.

## Terminology :books: 

### 1.OpenID Connect Server/Provider

It is the server that follows the OpenID Connect standard and provides all the OpenID Connect features. **For Example:**: In your multiplayer game application, you are using **Google** for user login and authentication then **Google** is your OpenID Connect Server. 

Abbreviations for OpenID Connect Server/Provider:

- OP Server: OpenID Connect Provider Server
- OIDC Server: OpenID Connect Server
- OIDC Provider: OpenID Connect Provider

All are the same :sunglasses:.

### 2.RP (Relying Party)

It is your application that uses OIDC Server for user authentication **For Example:** In your multiplayer game application, you are using **Google** for user login and authentication then **Google** is your OpenID Connect Server and **multiplayer game application** is RP(Relying Party). In OpenID Connect it called as **RP**. You can also call it **SP(Service Provider)** and **OP Client**.

# Flow

There are many flows in OpenID Connect.

## 1. Implicit Flow

Don't use it because it exposes `access_token` into the browser URL and you will not have a `refresh_token` facility because the OP client is not able to call the `/token` endpoint which requires client authentication.

Below is the implicit flow diagram which helps you to understand the whole flow.

![implicit flow](https://user-images.githubusercontent.com/39133739/93784833-0da6bf80-fc4b-11ea-912f-93ad9e74b164.png)

```
https://sequencediagram.org/

title Implicit Flow

actor "++**User**++" as User #yellow
fontawesome5solid f2d0 "++**RP**++" as RP #purple
fontawesome5solid f5fd "++**Gluu OIDC Server**++" as OIDC #green

User->RP: login request or directly request for protected resources \nusing browser or mobile app
RP->OIDC: Redirect to **you_op_server.com/authorize** endpoint with \n **repsonse_type=token** and **redirect_uri**
note over OIDC#lightgreen: Auth Process Started \ne.g. Login page or 2FA
note over OIDC#lightgreen: User enter credentials
note over OIDC#lightgreen: OIDC Server Authenticate the user and \nif all is ok then redirect to RP with **access_token**
OIDC-#red>RP: Redirected to RP **your_rp.com/redirect_uri?access_token=[string]**. \nNote here **access_token** is in URL.
RP->OIDC: Request to **your_op_server.com/userinfo** endpoint with **access_token** 
OIDC->RP: Return user details
RP->RP: Verify user and allow
RP->User: Allow login or allow to access protected endpoints(resources)
```

## 2. Authorization Code Flow

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

Use it for your web application security. Let's see the implementation.

### Stage 1 Create a new OP Client into your OP Server

In `Gluu` case, You can use `oxTrust(Admin UI)` to create OP Client and get `Client ID` and `Client Secret`. We need this client details in `RP` application for next step. [Check here for more details](https://github.com/kdhttps/node-passport/wiki/OpenID-Connect-OAuth2-SSO-with-Gluu#stage-1-op-server-configuration-create-a-new-op-client-into-your-op-server).

### Stage 2 RP Configuration: Generate Authorization URL and Request to OP Server

- First you need generate `Authorization` request to OP Server to `authorization_endpoint`. 

- You can get the `authorization_endpoint` from `OP Discovery URL`. Hit `https://your_op_server.com/.well-known/openid-configuration` URL into your bowser. If your OP supports OpenID Connect concepts then you will definitely get response from this endpoint. In `gluu` case it is like `https://your_op_server.com/oxauth/restv1/authorize`.

- search `authorization_endpoint` in discovery response. 

- Now we need to build authorization request. as we are implementing the authorization code flow we need to pass below query parameters.

```url
https://your_op_server.com/oxauth/restv1/authorize
?response_type=code
&client_id=<your_op_server_client_id>
&redirect_uri=<your_rp_redirect_handler_url>
&scope=openid openid email profile
&state=<random_string>
```

- Use browser and hit this request or if you have RP application then add request facility there.

- After request, we will redirected to OP Server. OP Server will authenticate the User and redirect back to RP endpoint that is `redirect_uri=<your_rp_redirect_handler_url>` with `code` and `state`.

### State 3 RP Configuration: Get `access_token` and `userinfo`

- Get `state` parameter value from URL and check it with your authorization request `state` of `Stage 2`.

- Get `code` parameter value from URL and request to `token_endpoint` of OP Server which also you get from discovery URL. You may need to pass `Authorization` header as per `authentication method for token endpoint` configuration of your OP Server. Let's assume we have `client_secret_post` method. [More details](https://tools.ietf.org/html/rfc6749#section-2.3.1). so your request will be like below example:

```sh
curl --location --request POST 'https://your_op_server.com/oxauth/restv1/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'redirect_uri=http://localhost:4200/auth/gluu/redirect' \
--data-urlencode 'client_id=<your_op_client_id>' \
--data-urlencode 'client_secret=<your_op_client_secret>' \
--data-urlencode 'code=<code>'
```

You will get `access_token`, `refresh_token` and `id_token` in response. 

- Next is to use this `access_token` and request to `userinfo_endpoint`

```sh
curl -k -X GET \
  https://your_op_server.com/oxauth/restv1/userinfo \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <access_token>' \
```

- Now you have authenticated user. Flow completed.

If you are having Single Page Application i.e. angular, react, ect.. then you need to use the `Authorization Code PKCE Flow`. [Check here for more details](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/Why-OpenID-Connect-OAuth-2.0-Authorization-Code-PKCE-Flow-for-SPA.md).