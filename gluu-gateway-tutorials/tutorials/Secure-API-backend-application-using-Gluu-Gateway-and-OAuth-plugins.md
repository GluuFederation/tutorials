## Secure REST API application using Gluu Gateway and OAuth plugins

You can now secure any API or web application with **zero lines of code** using a free open source proxy called [Gluu Gateway](https://gateway.gluu.org/). As application developers, we want to focus on core functionality — not security. Putting a proxy in front of web applications or API’s to enforce security is a well-trodden path to securing content. There are many excellent proxies out there that can help you do this. Gluu Gateway has some unique features —it is the only proxy to support the [User Managed Access protocol](https://kantarainitiative.org/confluence/display/uma/Home), which is handy if you need to interact with a user post-authentication (e.g., for consent). It can handle both simple and complex requirements for authorization, making it an interesting option to help you secure your web content.


## What is Gluu Gateway?

Gluu Gateway (GG) is an authentication and authorization solution for APIs and websites.

GG bundles the open-source [Kong Community Edition 2.x Gateway](https://konghq.com/community/) for its core functionality and adds a GUI and custom plugins to enable access management policy enforcement using OAuth, UMA, OpenID Connect, and [Open Policy Agent](https://www.openpolicyagent.org/) (“OPA”). In addition, GG supports the broader ecosystem of [Kong plugins](https://docs.konghq.com/hub/) to enable API rate limiting, logging, and many other capabilities.

In this blog, I am focusing on securing a backchannel API application. To accomplish this, I will use the **gluu-oauth-auth** plugin to authenticate the request using an access token.

You can read more about the [OpenID Connect OAuth 2.0 Overview and Security Flows](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/OpenID-Connect-OAuth-2.0-Overview-and-Security-Flows.md) for a more detailed description of the terms. If you’re an Angular guru, you may also want to check out the [Single Page Application SSO With Gluu CE using AppAuth JS](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SPA-SSO-with-Gluu-CE-using-AppAuth-JS.md).


## Flow

The gluu-oauth-auth plugin performs two important functions:

1. **Introspect the token:** verify the token is active , and cache the token key until expiration, to speed up subsequent validation of this token value.

1. **Correlate** the **OAuth Client** from the **access_token** with a “consumer” in Kong. This is important because many policies (such as rate limiting), or based on the consumer id. There is no need to authenticate the client — authentication already happened at the OAuth Authorization Server (“AS”) token endpoint prior to obtaining an access token. The client_id claim in the access_token verifies the identity of the client that obtained the token.

For example, an app may obtain an access token using basic authentication at the token endpoint of an AS by presenting its **client_id/client_secret** in the authorization header. After this, the app can use the access token to call endpoints on the Gluu Gateway. This is covered in the howto about writing a [Single Page Application SSO With Gluu CE using the AppAuth JS](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SPA-SSO-with-Gluu-CE-using-AppAuth-JS.md).

In Gluu Gateway, you map the OAuth client_id to a Kong Consumer ID. This can be accomplished via Kong’s configuration API. Or you can do it in the admin GUI, which may make it easier, because OAuth is the only mechanism you can use to define clients. Kong of course supports other mechanisms to authenticate consumers. But we don’t want Kong to do this — we want our OAuth Authorization Server to handle client authentication.

The sequence diagram below may help you understand the flow for an Angular application. Note, [“PKCE”](https://tools.ietf.org/html/rfc7636) is used in cases where we can’t safely store a client secret in the client. For example, in a browser application, there is nothing we can do to stop a user from looking at the code.

![OIDC Authorization Code PKCE Flow and Gluu Gateway API Security](https://user-images.githubusercontent.com/39133739/94115067-d876b900-fe66-11ea-9a6e-134fac407d7c.png)

```
https://sequencediagram.org

bottomparticipants

title OIDC Authorization Code PKCE Flow and Gluu Gateway API Security

actor "++**User**++" as User #yellow
fontawesome5solid f2d0 "++**Angular App**++" as RP #purple
fontawesome5solid f5fd "++**Gluu OIDC Server**++" as OIDC #green
fontawesome5solid f085 "++**Gluu Gateway**++" as GG #lightgreen
fontawesome5solid f022 "++**Backend API App**++" as UpstreamApp #tomato

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
RP->User: Allow login


User->RP: Request for proteced resources/data/features
RP->GG: Request to protected endpoints for data\n**access_token** in **Authorization** header.
GG->OIDC: **Introspect** the **access_token** 
note over GG#lightgreen: check **access_token**
note over GG#lightgreen: Verify the **Consumer OP Client**
note over GG#lightgreen: If all ok then **cache** the token data

GG<->UpstreamApp: Request and take a response
GG->RP: response data
RP->User: Show data
```

- The request hits Gluu Gateway first — it is the Internet facing endpoint.

- You need to send the access token in the Authorization header — just like you would do for any OAuth protected API.

- The GG OAuth plugin introspects the token (or validates the signature if it’s a JWT). If the token is not active, GG returns 401 — Unauthorized.

- Next, it verifies the OP Consumer client

- If all ok then GG request to your backend API, get a response, and return to RP Client

Voila! OAuth access management without a single line of code! All you need to do it to install Gluu Gateway, map your OAuth client to a Kong consumer, and register the upstream API. Following is a more detailed description of how to do this.

## Prerequisites

### Gluu Server 
This is our OAuth Authorization Server. The Client software, or Relying Party (“RP”) will get an access token from the Gluu Server /token endpoint — requesting the required scopes. So the first step is to install a Gluu Server, if you don’t already have one. There are a number of ways to do this — you can use one of the Linux packages (Ubuntu, Centos, Red Hat or Debian), you can use Docker, or you can even use Kubernetes. Probably the simplest way is to use the Linux packages, which install all the components of the Gluu Server in a simple file system container (in /opt/gluu-server). This is normally a three step process: install the package, start the gluu server, run setup. But for detailed instructions, see the Installation Guide for the current version in the official [Gluu Server documentation](https://gluu.org/docs).

### Gluu Gateway(GG)
In OAuth jargon, GG is our Resource Server (“RS”). For example, it publishes the endpoints that the Client will call, presenting the access token. Gluu Gateway also has a number of distributions. See the docs for [Gluu Gateway](https://gluu.org/docs/gg/4.2) to pick the distribution that makes the most sense for you. Note: you probably want to install GG on a different VM then your Gluu Server. If you do install GG on the same VM, I would suggest setting up a different virtual ethernet interface and making sure that the GG processes bind to this IP. This is a little out of scope of this howto article… so the easiest things is to probably just use a different VM!

After installation of GG you will get the following components:

- [Kong Community Edition 2.x](https://konghq.com)

    Kong Provides the core API gateway functionality. This is the software which handles the request, applies the security plugins, and enforces the security policy per the plugin configuration

    It provides two endpoints. One is `Admin Endpoint` and `Proxy Endpoint`.

    `Admin Endpoint` is used to configure upstream apps, services, routes, consumers, and plugins.

    `Proxy Endpoint` is your final endpoint which accept request from clients. In our case, the angular application calling this endpoint for protected resources.

- [GG UI](https://gluu.org/docs/gg/4.2/admin-guide/getting-started/)

    It is Admin GG UI Panel. Where you can configure your backend API, routes, consumer, and plugins.

- [Gluu Plugins](https://gluu.org/docs/gg/4.2/admin-guide/enable-plugins/)

    Gluu Gateway provides many plugins. [Check here for list](https://gluu.org/docs/gg/4.2/admin-guide/enable-plugins/). We are only using the `gluu-oauth-auth` plugin for request authentication.  

- [OXD](https://gluu.org/docs/oxd/)

    OXD exposes simple, static APIs web application developers can use to implement user authentication and authorization against an OAuth 2.0 authorization server like Gluu.

### Backend API(Protected Resources)
Also known as `Protected resources`, `Upstream App`, `target` or `backend API`. For this post, I am using a demo Node.js application available [here](https://github.com/GluuFederation/tutorials/tree/master/other-utility-projects/code/node/gg-upstream-app-node). This is the backend application which is called by the frontend software client.

### Angular Client
I am using Angular Client to access protected resources. This is your Frontend application which requests to Gluu Gateway. Check blog [Single Page Application SSO With Gluu CE using AppAuth JS](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SPA-SSO-with-Gluu-CE-using-AppAuth-JS.md) for detail configuration and implementation. You can use your application, overall you need an application that will request to GG protected API.

### Consumer OP Client
This is the same client that you are using in the Angular App. I am calling this as a `Consumer OP Client`. We need to register this clients `client_id` into Gluu Gateway so it will only allow this client to access protected resources.

## Configuration

There are mainly 4 steps

1. Configure your Backend API Application into Gluu Gateway Service
2. Configure Kong Gateway Routes
3. Add OAuth Security
4. Configure `Consumer OP Client`

### 1. Configure your Backend API Application into Gluu Gateway Service

We need to first register the Backend API Application which we want to secure using Gluu Gateway. `Service` is the Kong entity. After authentication GG uses this configuration to request and get a response from the Backend API Application.

My API Backend is running on `http://localhost:3000` so I am configuring service as per that. You need to set configuration as per your application.

Follow these step to `add a Service` using `GG UI`:

- Click `SERVICES` on the left panel
- Click on the `+ ADD NEW SERVICE` button
- Fill in the following boxes:
    
    **Name:** `test-app`, you can give any name here.
    
    **URL:** `http://localhost:3000`

![service-configuration](https://gluu.org/docs/gg/4.2/img/angular-demo-1.png)

### 2. Configure Kong Gateway Routes

The `Routes` is specially used by the GG Kong to recognize and accept the request. It is a child entity that we need to add it into the `Service` object.

Follow these step to `add a Route` using `GG UI`:

- Click `SERVICES` on the left panel
- Click on the `test-app` service, which we created on the above step
- Click `Routes`
- Click the `+ ADD ROUTE` button

- Fill in the following boxes:

    **Name:** `test-api`, you can give any name here.
    
    **Hosts:** `<your-server-host>`, Tip: Press Enter to accept value. 
    This is the host of your gluu gateway proxy. This is the host that will be requested by the angular app. I have install GG on my server `gluu.local.org`. The rest of the tutorial will use `gluu.local.org` as an example, replace it with your host. Check the [Gluu Gateway docs](https://gluu.org/docs/gg/4.2/admin-guide/services-routes-config/) for more routing capabilities.

![route-configuration](https://gluu.org/docs/gg/4.2/img/angular-demo-2.png)

### 3. Add OAuth Security

There are plugins available in GG which provides the security. Overall we just need to configure plugins here. For currently purpose we just need one plugin i.e. `gluu-oauth-auth`. Let's add this plugin.

- Click `ROUTES` on the left panel
- Click on the `route id/name` with `gluu.local.org` as the host
- Click on `Plugins`
- Click on the `+ ADD PLUGIN` button
- You will see `Gluu OAuth Auth and PEP` title and `+` icon
- Now you will see below the form
    
    - Set `Disable` to `OAUTH PEP Scope expression configuration`, we don't need this for now
    - Set blank to `OXD Id`, `Client Id`, and `Client Secret`. GG UI will create one separate client for plugin usage.
    - Leave `Headers` as it is or configure as per your requirements. 
    - Click on the `ADD Plugin` button to add plugin

![oauth-plugin](https://user-images.githubusercontent.com/39133739/94132921-9a38c400-fe7d-11ea-8062-13fcda38871a.png)

You may face cors problem when you call GG from your angular application for that you need to add `cors` plugin which is by default comes with Kong CE addition. [Check here for `cors` plugin configuration](https://gluu.org/docs/gg/4.2/tutorials/angular-oauth-role-security/#cors-plugin).

### 4. Configure `Consumer OP Client`

Follow these steps to configure the consumer using GG UI:

- Click `CONSUMERS` on the left panel in GG UI

- Click on the `+ CREATE CONSUMER` button and add `client_id` in the `Gluu Client Id` field. This is the same client that you are using in the Angular App. We need to register this clients `client_id` into Gluu Gateway Consumer so it will only allow this client to access protected resources.

![oauth-demo7.png](https://gluu.org/docs/gg/4.2/img/angular-demo-13.png)

Configuration is finished here. Now you need to call the protected API using GG Kong Proxy Endpoint.

## Request to Proxy

GG Kong expose the proxy endpoint on the port `:443` so you just need to call api in your angular app and pass `access_token` in authorization header.

As per my configuration, I am calling proxy endpoint like `https://gluu.local.org:443/posts` with `access_token` in authorization header.

Below code is the angular code to call GG Proxy Endpoint:

```js
this.http.get('https://gluu.local.org:443/posts', 
    {headers: {authorization: 'Bearer ' + this.accessToken}}
)
      .subscribe((response) => {
        this.images = response;
      }, (error) => {
        console.log(error);
      });
```

If all is ok then you will get response from the GG.

## Conclusion
At a high level, implementing a piece of infrastructure like an API gateway makes sense when you have a lot of APIs. If you have just a few endpoints, it may be overkill. But there are advantages to this approach:

1. Policy enforcement is not in code — it’s in the HTTP routing infrastructure. That means you can change the required scopes without touching your code.
1. Your backend APIs are not Internet facing
1. You can implement other security, like limiting transaction volume (i.e. how many calls per hour, day etc can a client make).
1. Developers don’t need to know anything about OAuth — they can just code the functionality they need, and focus on fine grain authorization.

So this approach may not be for everyone. But GG is a great tool to have in your back pocket when the right use case presents itself.

Thank you!