The Best Security for Single Page Applications(SPA) is OpenID Connect OAuth 2.0 `Authorization Code PKCE Flow`.

PKCE stands for **Proof Key for Code Exchange**.

There are many security flows available in OpenID Connect OAuth 2.0. As per your Application requirements and flow choose the flow.

There are three flow for **Single Page Application(SPA)**.

1. Implicit flow
2. Authorization Code Flow (without PKCE) - This is not really for SPA Applications
3. Authorization Code PKCE Flow

Your `Single Page Application(Angular, React, etc..)` is acting as an `RP(Relying Party)` here now.

## :x: Why not **implicit flow**?
Because it exposes `access_token` into the `browser URL` and you will not have **refresh_token** facility because the OP client is not able to call **/token** endpoint which requires client authentication.

Below is the implicit flow diagram which helps you to understand the whole flow.

![implicit flow](https://user-images.githubusercontent.com/39133739/93784833-0da6bf80-fc4b-11ea-912f-93ad9e74b164.png)

## :x: Why not **Authorization Code Flow (without PKCE)** for SPA?

Stop.

Don't use it. Without PKCE that means You need to store the client secret on your browser to request **/token** endpoint and get an access token. Store client secret at the browser is a big security risk.

This flow is generally used at the server-side technologies e.g. Node, Java. Where we can safely store `client id` and `client secret`. In this case, the **/token** endpoint is protected by [**Token Endpoint authentication methods**](http://webconcepts.info/concepts/oauth-token-endpoint-auth-method/). :heavy_check_mark: You don't need PKCE flow if you are managing authentication flow using the server-side technologies.

## :heavy_check_mark: Why to use **Authorization Code PKCE flow.**?

:heart: If you `have a SPA(Single Page Application)`, the best security flow for this is the **Authorization Code with PKCE flow.** Because It **does not expose access token** to the browser in URL and you **don't need client secret** at all.

PKCE stands for **Proof Key for Code Exchange**.

In this case, the **/token** endpoint is not protected by [**Token Endpoint authentication methods**](http://webconcepts.info/concepts/oauth-token-endpoint-auth-method/). `OP Server` use **code_challenge** and **code_verifier** to verify token request. So you don't need to add any  `authentication methods` for `token endpoint`. If you have any method then remove it using your OP Admin Panel.

### PKCE Flow and implementation

![Authorization Code PKCE Flow](https://user-images.githubusercontent.com/39133739/93978111-202f0f00-fd99-11ea-9bfd-ed8c5df7b44d.png)

1. First, you need to **code_verifier** and **code_challenge**. Below is the code of `Node.js` to generate **code_challenge**. **code_verifier** is just a random string.

    ```javascript
    var code_verifier="s4vqXQA0ePi98eS9Px4jcghBi7UQHRaQl6jMRwLkBj9Eh8g1yxnesereK4jUHdAT0HkLEWBPLZ8z35HX1Ditxf"

    const crypto = require('crypto')
    const base64url = require('base64url')

    var hash = crypto.createHash('sha256').update(code_verifier).digest();
    var code_challenge = base64url.encode(hash)
    console.log(code_challenge)
    ```

    This is a simple Node.js code. For SPA applications, there is the best library available that is [AppAuth JS](https://github.com/openid/AppAuth-JS). Check blog here on [AppAuth JS integration with Single Page application](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SPA-SSO-with-Gluu-CE-using-AppAuth-JS.md)

2. Authorization request to OP Server

    Use the above generated `code_challenge` and pass it into authorization request.

    ```
    HTTP Get redirect

    https://your_op_server.com/authorize
    ?redirect_uri=https://client.com/callback
    &client_id=[your_client_id]
    &response_type=code
    &state=[uuid]
    &scope=openid%20email%20profile
    &code_challenge=[code_challenge]
    &code_challenge_method=S256
    ```

3. OP Server authenticates the user and redirects back to `https://client.com/callback` with code in URL. You can check the above flow diagram.

4. Now request to **https://your_op_server.com/token** with **code** and **code_challenge**.

    ```sh
    HTTP POST https://your_op_server.com/token
    content-type: application/x-www-form-urlencoded
    accept: application/json

    Form Data:
    grant_type: authorization_code
    client_id: [your_client_id]
    redirect_uri: [your_callback_url]
    code: [code]
    code_verifier: [code_verifier]
    ```

    This request will return your JSON response with **access_token** 

5. Request to **https://your_op_server.com/usernifo** endpoint with **access_token** and get user info. 

I am not forcing you to use `PKCE flow` but it is better than the `implicit flow`.

I've integrated the Authorization Code PKCE flow with Single Page Application. Check blog here on [AppAuth JS integration with Single Page application](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SPA-SSO-with-Gluu-CE-using-AppAuth-JS.md)

Thank you :blush:!!!
