## SPA SSO with Gluu CE using AppAuth JS

Now we can easily integrate the Single Sign On(SSO) feature into any Single Page Application(SPA) using [AppAuth JS](https://github.com/openid/AppAuth-JS). The [AppAuth JS](https://github.com/openid/AppAuth-JS) is the best library to integrate `OpenID Connect Authorization Code PKCE Flow` at your any single page application technology.

Before starting this, please check [OpenID Connect OAuth 2.0 Overview and Security Flows](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/OpenID-Connect-OAuth-2.0-Overview-and-Security-Flows.md) and [The Best Security for Single Page Applications(SPA) - OpenID Connect OAuth 2.0 Authorization Code PKCE Flow](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/Why-OpenID-Connect-OAuth-2.0-Authorization-Code-PKCE-Flow-for-SPA.md) for overview and details.

In this blog, I'll describe how to achieve SSO with the Gluu Server.

## Prerequisites

1. Node JS >= 12.x.x
1. @angular/cli >= 10.1.2
1. [Gluu CE](https://gluu.org/docs/gluu-server) >= 4.x.x, I am using Gluu Server as a OpenID Connect Provider. [Check here for more details about Gluu Server](https://gluu.org/docs/gluu-server)
1. Clone or download RP(Angular App) Client from here [appauth-angular-gluu](https://github.com/kdhttps/appauth-angular-gluu). Currently I am using Angular as a Single Page Application technology. By following these below steps you can easily integrate it with your any single page application technology.

Let's integrated and implement Step by Step

## Authorization Code PKCE Flow

![Authorization Code PKCE Flow](https://user-images.githubusercontent.com/39133739/93978111-202f0f00-fd99-11ea-9bfd-ed8c5df7b44d.png)

```
https://sequencediagram.org

title OIDC Authorization Code PKCE Flow

actor "++**User**++" as User #yellow
fontawesome5solid f2d0 "++**RP**++" as RP #purple
fontawesome5solid f5fd "++**Gluu OIDC Server**++" as OIDC #green

User->RP: login request or directly request \nfor protected resources \nusing browser or mobile app
RP->OIDC: Redirect to **you_op_server.com/authorize** endpoint with \n**repsonse_type=code**, **redirect_uri**, **state**, \n**code_challenge** and **code_challenge_method**
note over OIDC#lightgreen: Auth Process Started \ne.g. Login page or 2FA
note over OIDC#lightgreen: User enter credentials
note over OIDC#lightgreen: OIDC Server Authenticate the user and \nif all is ok then redirect to RP with **code** and **state
OIDC->RP: Redirected to RP \n**your_rp.com/redirect_uri?code=[string]&state=[string]**
RP->OIDC: Request to \n**your_op_server.com/token** endpoint with \n**code** and **code_verifier**
OIDC->RP: Return **access_token**
RP->OIDC: Request to \n**your_op_server.com/userinfo** endpoint with **access_token** 
OIDC->RP: Return user details
RP->RP: Verify user and allow
RP->User: Allow login or \nallow to access protected endpoints(resources)
```

## Implementation and integration

### Stage 1 OP Server Configuration: Create a new OP Client into your OP Server

In the `Gluu` case, You can use `oxTrust(Admin UI)` to create OP Client and get `Client ID` and `Client Secret`. We need this `client details` in the `RP` application for the next step.

Configure client as per details in the screenshot:

![Gluu_create_client](https://user-images.githubusercontent.com/39133739/93894073-f54aa980-fd0b-11ea-84d1-fb8a7c51e5aa.png)

Create a new client and you will get `client id` and `client secret`. We need these details in next step.

### Stage 2 RP Configuration: Imtegrate AppAuth JS into Angular Application

Our angular app is RP(Relying Party) here. There are 3 main steps

:star: Authorization Request to OP Server

:star: OP Server authentication and redirect back

:star: Code Handler and get `access_token`

Let's take a look step by step

#### :star: Authorization Request to OP Server

The first task is to make the authorization requests to the OpenID Connect server.

Below all code in one file. Please check my (https://github.com/kdhttps/appauth-angular-gluu) repo for the whole code.

1.  First step is to initialize the `RedirectRequestHandler`. This object is responsible to handle the redirect task. It needs 4 Parameters.

    ```
    A. Define Storage
    B. URL Parameter Parser to get query params
    C. Current location or URL
    D. Crypto Method - to generate code_verifier and code_challenge
    ```

    ```js
    import {
    RedirectRequestHandler,
    LocalStorageBackend, DefaultCrypto
    } from '@openid/appauth';
    import { NoHashQueryStringUtils } from './noHashQueryStringUtils';

    const authorizationHandler = 
        new RedirectRequestHandler(
           new LocalStorageBackend(), 
           new NoHashQueryStringUtils(), 
           window.location, 
           new DefaultCrypto()
    );
    ```

2. Second step is to configure the query param parser

    It is for URL parsing. Default it assume that you have `#` in the URL. If you worked on `OLD Angular.js` then it uses `#` for client-side routing.

    If you want to change this method then you can easily overwrite the method like the below code: 

    ```js
    import {BasicQueryStringUtils, LocationLike, StringMap} from '@openid/appauth';

    export class NoHashQueryStringUtils extends BasicQueryStringUtils {
      parse(input: LocationLike, useHash?: boolean): StringMap {
        return super.parse(input, false /* never use hash */);
      }
    }
    ```

3. Third Step is AppAuth needs your OP Server configuration information that is provided by endpoint `https://your_op_server.com/.well-known/openid-configuration`.

    Below AppAuthJS code help you hit, get info, and stored info in `local storage`. This information is internally used by AppAuthJS.

    You just need to pass two parameters.

    ```
    A. Your OP Server URL: for example: https://your_op_server.com
    B. FetchRequester: It is Javascript Fetch API to make an HTTP Request to OP configuration endpoint. If you miss this parameter, It will use JQuery and we don't want to use JQuery in Angular/React Applications.
    ```

    ```js
    import {
    AuthorizationServiceConfiguration,
    FetchRequestor,
    } from '@openid/appauth';

    AuthorizationServiceConfiguration.fetchFromIssuer(environment.OPServer, new FetchRequestor())
                .then((response) => {
                    console.log(response)
                    // You need to add auth request code here
                })
                .catch(error => {
                    setError(error);
                });
    ```

4. Make an auth request. Below is a combined code with the configuration info step. Pass extra parameters using `extra` property.

    ```js
     AuthorizationServiceConfiguration.fetchFromIssuer(environment.OPServer, new FetchRequestor())
            .then((response) => {
                const authRequest = new AuthorizationRequest({
                    client_id: 'your_client_id',
                    redirect_uri: 'your_redirect_login_url',
                    scope: 'openid email profile',
                    response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
                    // extras: environment.extra
                });

    // Please check next point 5 for this.
    authorizationHandler.performAuthorizationRequest(response, authRequest);
    
                })
                .catch(error => {
                    setError(error);
                });
    
    ```

5. Redirect to OP for Auth

    It needs two parameters first configuration information and second is auth Request.

    Use the below code for this. Once this code executes, it will redirect you to OP Server.

    ```js
    authorizationHandler.performAuthorizationRequest(
        response, 
        authRequest
    );
    ```

#### :star: OP Server authentication and redirect back

OP Server will authenticate the user and redirect back to your side with code in the URL. Let's assume you configure redirect login URL is https://client.com/callback. Please check my `appauth-angular-gluu` repo for `Flow GIF` and code. You will get an idea.

#### :star: Code Handler and get `access_token`

Let's assume URL in the browser is like now `http://localhosr:4200/callback?code=[code_send_by_op_server]`

we are now on the `/callback` angular page. so you need to handle the next operations on this route.

Note: You can combine these steps into one file. Currently, for an easy explanation, I am doing it in different files.

1. The first step you need to configure the `AuthorizationNotifier` which will trigger when you want to process code(the code from URL).

    ```js
    import {
    AuthorizationServiceConfiguration,
    RedirectRequestHandler,
    AuthorizationNotifier,
    FetchRequestor, LocalStorageBackend, DefaultCrypto
    } from '@openid/appauth';

    import {NoHashQueryStringUtils} from './noHashQueryStringUtils';

    const authorizationHandler = new RedirectRequestHandler(new LocalStorageBackend(), new  NoHashQueryStringUtils(), window.location, new DefaultCrypto());

    const notifier = new AuthorizationNotifier();
            authorizationHandler.setAuthorizationNotifier(notifier);

    notifier.setAuthorizationListener((request, response, error) => {
        // response object returns code which is in URL i.e. response.code
        // request object returns code_verifier i.e request.internal.code_verifier
        // you will need to add here token request process
    }
    ```

2. Above notifier only trigger when you want it using below code:

    ```js
    authorizationHandler.completeAuthorizationRequestIfPossible()
    ```

    Once this code executes, it will trigger the notifier and in the response object, you will get code from the URL.

3. Request for `access_token`

    The below code is inside the notifier.

    ```
    A. First, you need to create a token request object
    B. Again get configuration information
    C. Hit `/token` endpoint and get token
    ```

    ```js
    this.tokenHandler = new BaseTokenRequestHandler(new FetchRequestor());

    this.notifier.setAuthorizationListener((request, response, error) => {
      console.log('Authorization request complete ', request, response, error);
      if (response) {
        this.request = request;
        this.response = response;
        this.code = response.code;
        console.log(`Authorization Code  ${response.code}`);

        let extras = null;
        if (this.request && this.request.internal) {
          extras = {};
          extras.code_verifier = this.request.internal.code_verifier;
        }
        
        // A. First, you need to create a token request object
        const tokenRequest = new TokenRequest({
          client_id: environment.clientId,
          redirect_uri: environment.redirectURL,
          grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
          code: this.code,
          refresh_token: undefined,
          extras
        });

        // B. Again get configuration information
        AuthorizationServiceConfiguration.fetchFromIssuer(environment.OPServer, new FetchRequestor())
          .then((oResponse: any) => {
            this.configuration = oResponse;
            
            // C. Hit `/token` endpoint and get token
            return this.tokenHandler.performTokenRequest(this.configuration, tokenRequest);
          })
          .then((oResponse) => {
            localStorage.setItem('access_token', oResponse.accessToken);
            
            // do operation now as per your need
            this.router.navigate(['/profile']);
          })
          .catch(oError => {
            this.error = oError;
          });
      }
    });
    ```

    Now, you have `access_token`, you can store it in localStorage and use it in the whole application.

#### :star: Get user info using `access_token` 

You don't need AppAuthJS for this task. You just need to hit the `/userinfo` endpoint of your OP Server and it will return you the user information.

let's assume we are now on the `/profile` page or component.

```js
this.accessToken = localStorage.getItem('access_token') || null;
if (!this.accessToken) {
    return;
}

this.http.get(environment.OPServer + environment.userInfoEndpoint, { 
    headers: {authorization: 'Bearer ' + this.accessToken}
})
.subscribe((response) => {
    this.userInfo = response;
});
```

Done.

## is SSO done here?

Yes, you just integrated the SSO feature into your Single Page Application. This is just one application. Now make a copy of [appauth-angular-gluu] code, run it on other port and add one more `redirect_uri` into your OP Client in your OP Server. 

Run your second application and request for login. You will be redirected to OP Server but it will not prompt from the login page because your session is still on OP Server-side because you already logged in in the first application. This is what `Single Sign-On`. You need to login only once. 

In the case session expire, OP server will show you the login page for authentication, and then after you can easily use other applications without any login page.

## What is Next?

You are using Single Page Application which means you are 101% calling REST API(backend) for data and other features. 

Now you need to secure your REST API application using `access_token` where you can `introspect the token` and validate the user. You can also use this `access_token` at your Backend side to get `userinfo` and authorize the user.

To secure your backend application with `OAuth 2.0 Access Token`. Check my next blog `Secure your REST API application using Gluu Gateway and its OAuth plugins`.

---------------------------------------------------

You can integrate AppAuthJS in any client-side technology using the above steps.

Hope this will help !!!