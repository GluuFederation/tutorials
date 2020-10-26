# OpenID Connect Multistep Authentication with Gluu Gateway

You can now secure any API or web application with **zero lines of code** using a free open source proxy called [Gluu Gateway](https://gateway.gluu.org/). As application developers, we want to focus on core functionality — not security. Putting a proxy in front of web applications or API’s to enforce security is a well-trodden path to securing content. There are many excellent proxies out there that can help you do this. Gluu Gateway has some unique features —it is the only proxy to support the [User Managed Access protocol](https://kantarainitiative.org/confluence/display/uma/Home), which is handy if you need to interact with a user post-authentication (e.g., for consent). It can handle both simple and complex requirements for authorization, making it an interesting option to help you secure your web content.

## What is Gluu Gateway?

Gluu Gateway (GG) is an authentication and authorization solution for APIs and websites.

GG bundles the open-source [Kong Community Edition 2.x Gateway](https://konghq.com/community/) for its core functionality and adds a GUI and custom plugins to enable access management policy enforcement using OAuth, UMA, OpenID Connect, and [Open Policy Agent](https://www.openpolicyagent.org/) (“OPA”). In addition, GG supports the broader ecosystem of [Kong plugins](https://docs.konghq.com/hub/) to enable API rate limiting, logging, and many other capabilities.

In this blog, I am focusing on securing a Web application. To accomplish this, I will use the **gluu-openid-conenct** plugin to authenticate the request using an **OpenID Connect Authorization Code Flow**. Also for the page `/payments`, I am adding `OTP` auth as a one more authentication step. There are some more user authentications available in Gluu Server. Check [Gluu Server docs here](https://gluu.org/docs/gluu-server/4.2/authn-guide/intro/) for more details.

You can read more about the [OpenID Connect OAuth 2.0 Overview and Security Flows](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/OpenID-Connect-OAuth-2.0-Overview-and-Security-Flows.md) for a more detailed description of the terms. If you’re an Angular guru, you may also want to check out the [Single Page Application SSO With Gluu CE using AppAuth JS](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SPA-SSO-with-Gluu-CE-using-AppAuth-JS.md). If you are having API application then check [Secure API(backend) application using **Gluu Gateway** and **OAuth plugins**](https://github.com/GluuFederation/tutorials/blob/master/gluu-gateway-tutorials/tutorials/Secure-API-backend-application-using-Gluu-Gateway-and-OAuth-plugins.md)

## Flow

Flow is pretty simple because you don't want to write single line of code. You just need to configure the plugin, add multistep auth and done. 

User first authenticate with Gluu OpenID Connect server. When user do a payments i.e. try to access `/payments` page, it will again prompt user to enter `OTP` and if all ok then allow access.

![OpenID Connect Multistep Authentication with Gluu Gateway](https://user-images.githubusercontent.com/39133739/96872121-d36e4f00-1490-11eb-8fde-0a6039f26100.png)

```
https://sequencediagram.org

bottomparticipants

title OpenID Connect Multistep Authentication with Gluu Gateway

actor "++**User**++" as User #yellow
fontawesome5solid f085 "++**Gluu Gateway**++" as GG #lightgreen
fontawesome5solid f5fd "++**Gluu OIDC Server**++" as OIDC #green
fontawesome5solid f022 "++**Backend Web App**++" as UpstreamApp #tomato

User->GG: login request or directly request \nfor protected resources \nusing browser or mobile app


User->GG: login request or directly request \nfor protected resources \nusing browser or mobile app
GG->OIDC: Redirect to **you_op_server.com/authorize** endpoint

note over OIDC#lightgreen: Auth Process Started \ne.g. Login page
note over OIDC#lightgreen: User enter credentials
note over OIDC#lightgreen: OIDC Server Authenticate the user and \nif all is ok then redirect to GG(RP) with **code** and **state


GG->OIDC: Redirected to GG \n**your_rp.com/redirect_uri?code=[string]&state=[string]**
GG->OIDC: Request to \n**your_op_server.com/token** endpoint
GG->OIDC: Request to \n**your_op_server.com/userinfo** endpoint with **access_token** 
OIDC->GG: Return user details
GG->GG: verify authenticate the user

GG<->UpstreamApp: Request and take a response
GG->User: Allow login or access to resources
User->GG: Request for **/payments** 
GG->GG: 
 
note over GG#lightgreen: GG checks user is already authenticated\nIf yes then intiate step up auth e.g. OTP
GG->OIDC: Request again but now for OTP auth
OIDC->OIDC: Validate and verify OTP and allow
OIDC->GG: Redirected to GG with new **code** and **state**
GG->GG: 
note over GG#lightgreen: GG gets new token and save user state \ni.e. User passed OTP auth so once \nuser again request for payments \nGG will not start again OTP auth process

GG<->UpstreamApp: Request and take a response
GG->User: Allow to do payments

```

- The request hits Gluu Gateway first — it is the Internet facing endpoint/page.

- As per the configuration, GG will behave and proceed the OpenID Connect Code Authentication Flow.

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

### Backend Web App(Protected Resources)
Also known as `Protected resources`, `Upstream App`, `target` or `backend Web App`. For this post, I am using a demo Node.js application available [here](https://github.com/GluuFederation/tutorials/tree/master/other-utility-projects/code/node/gg-upstream-web-app-node). This is the backend application which is called by the frontend software client.

## Configuration

### Gluu Server enable OTP Auth

First, add OTP stepped-up authentication by enabling the OTP ACR in the OP Server. Configure the following settings inside your Gluu Server:

1. In `oxTrust`, navigate to `Configuration` > `Person Authentication Scripts`

1. Enable the `otp` script

    ![gluu-otp-auth](https://gluu.org/docs/gg/4.2/img/oidc-demo9.png)

1. Now just confirm that it is enabled successfully by checking your OP discovery endpoint `<your_op_server>/.well-known/openid-configuration`, it should show otp in the `acr_values_supported` property.

### Gluu Gateway configuration

we are going to register and protect the whole upstream service (the website) using gluu-openid-connect plugin and for `/payments` path with the `OTP` ACR. As a result, a request for `/payments` will ask for an additional OTP authentication step to access the resource.

There are 3 Steps to configure GG:

1. Configure Service
2. Configure Route
3. Configure `gluu-openid-connect` plugin

#### 1. Configure Service

You need to first register your Web Application into GG as a Service.

Follow these steps to add a Service using GG UI:

- Click `SERVICES` on left panel
- Click on `+ ADD NEW SERVICE` button
- Fill in the following boxes:
    - Name: oidc-steppedup-demo
    - URL: **http://localhost:4400**, register as per your web application configuration. My web app is runnig on 4400 port.

![add-oidc-service](https://gluu.org/docs/gg/4.2/img/oidc-demo1.png)

#### 2. Configure Route

Follow these steps to add a route:

- Click on the `oidc-steppedup-demo` service

- Click `Routes`

- Click the `+ ADD ROUTE` button

- Fill in the following boxes:
    - Name: oidc-steppedup-demo
    - Hosts: <your-server-host>, Tip: Press Enter to accept value. This tutorial uses a server with an updated `/etc/hosts` file. This is the host that will be requested in the browser after configuration. If using live servers, register the domain host instead. The rest of the tutorial will use `dev1.gluu.org` as an example, replace it with your host. Check the Kong docs for more routing capabilities.

![add-oidc-route](https://user-images.githubusercontent.com/39133739/97156070-3109e080-179c-11eb-81e5-1f6a17a6005a.png)

#### 3.Configure Plugin

Follow these steps to add a route:

- Click `ROUTES` on the left panel
- Click on the route id/name with `dev1.gluu.org` as the host
- Click on Plugins
- Click on `+ ADD PLUGIN` button
- You will see `Gluu OIDC & UMA PEP` title and `+` icon in pop-up.
- Click on the `+` icon and it will show the below form. Add the ACR expression as in the below screenshots.
    - OTP stepped-up auth for path `/payments/??`
    - `simple_password_auth` authentication for all other paths. Check [here](https://gluu.org/docs/gg/4.2/plugin/gluu-openid-connect-uma-pep/#dynamic-url-base-acrs-stepped-up-authentication) for more details about ACR expressions.

![gg-oidc-plugin](https://user-images.githubusercontent.com/39133739/97168447-7f27df80-17ae-11eb-9714-d6f39a86021b.jpg)

Woop!! Configuration is done here. Not even single line of code. Next, request the Kong proxy at `https://<your_host>` in the browser. In this example, the host is https://dev1.gluu.org.

## Authentication

1. Once you send a request to the Kong proxy, the plugin will redirect the request to the OP side. The OP will request for the `username` and `password`, because we added the `simple_password_auth` ACR for any path /??.

    ![auth-step1](https://gluu.org/docs/gg/4.2/img/oidc-demo10.png)

    After successful authentication, the OP will display all requested permissions. Click `Allow`.

    ![auth-step2](https://gluu.org/docs/gg/4.2/img/oidc-demo11.png)

1. After clicking allow, you will get back to the Kong proxy and the plugin will serve the default home page of the upstream service.

    ![auth-step3](https://gluu.org/docs/gg/4.2/img/oidc-demo12.png)

    Click on `Flights`. It is also in the `/??` path, so the user already has permission to access this resource.

    ![auth-step4](https://gluu.org/docs/gg/4.2/img/oidc-demo13.png)

1. Now click `Payments`, on which we added the `OTP` stepped-up authentication. The plugin will redirect again to the OP. As per the OTP script, it will ask for the username and password.

    ![auth-step5](https://gluu.org/docs/gg/4.2/img/oidc-demo10.png)

    After successful authentication, the OP Server asks you to enroll in a device. Scan the displayed QR Code in an authenticator application, then click on Finish. Check the [Gluu CE docs](https://gluu.org/docs/ce/authn-guide/otp/#recommended-otp-apps) for supported OTP applications.

    ![auth-step6](https://gluu.org/docs/gg/4.2/img/oidc-demo15.png)

    After successful enrollment, it will prompt to enter the OTP. Enter the OTP from the authenticator application and click on Login.

    ![auth-step7](https://gluu.org/docs/gg/4.2/img/oidc-demo14.png)

1. After OTP authentication, the OP server will redirect back to the Kong proxy and serve the Payments page.

    ![auth-step8](https://gluu.org/docs/gg/4.2/img/oidc-demo16.png)

## Conclusion
At a high level, implementing a piece of infrastructure like an API or Web gateway makes sense when you have a lot of APIs. If you have just a few endpoints, it may be overkill. But there are advantages to this approach:

1. Policy enforcement is not in code — it’s in the HTTP routing infrastructure. That means you can change the required scopes without touching your code.
1. Your backend web app is not Internet-facing
1. You can implement other security, like limiting transaction volume (i.e. how many calls per hour, day etc can a client make).
1. Developers don’t need to know anything about OpenID Connect OAuth — they can just code the functionality they need, and focus on fine grain authorization.

So this approach may not be for everyone. But GG is a great tool to have in your back pocket when the right use case presents itself.

Thank you!