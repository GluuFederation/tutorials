In previous blogs, we secure and authenticate the user using the Gluu Gateway **gluu-oauth-auth** plugin, check more details [here](https://github.com/GluuFederation/tutorials/blob/master/gluu-gateway-tutorials/tutorials/Secure-API-backend-application-using-Gluu-Gateway-and-OAuth-plugins.md). Now in this blog we are going to add some more security i.e. **User Authorization** using Gluu Gateway **gluu-oauth-pep** plugin.

In this blog, I am securing the endpoint `/blogs` API. The user with the `admin` role can view and edit the blog and the user with the `visitor` role can only view the blog. 

## Flow

1. The request hits Gluu Gateway first — it is the Internet-facing endpoint.

2. You need to send the access token in the Authorization header — just like you would do for any OAuth protected API.

3. The GG OAuth plugin introspects the token (or validates the signature if it’s a JWT). If the token is not active, GG returns 401 — Unauthorized.

4. Before proxying the request to the upstream API endpoint, GG checks to make sure the access token has the required scopes.

5. If the required scopes are present, GG proxies the request, gets a response, which is returned to the Client. If the required scopes are not present, GG returns 403–Forbidden.

We already completed the first 3 steps in [gluu-oauth-auth](https://github.com/GluuFederation/tutorials/blob/master/gluu-gateway-tutorials/tutorials/Secure-API-backend-application-using-Gluu-Gateway-and-OAuth-plugins.md) blog. Now we are covering the last two steps.

## Configuration

There are mainly 4 steps

1. Configure your Backend API Application into Gluu Gateway Service
1. Configure Kong Gateway Routes
1. Add OAuth Security
1. Configure `Consumer OP Client`
1. Add OAuth PEP Security

First 4 steps we already completed in [gluu-oauth-auth](https://github.com/GluuFederation/tutorials/blob/master/gluu-gateway-tutorials/tutorials/Secure-API-backend-application-using-Gluu-Gateway-and-OAuth-plugins.md) blog.

### Add OAuth PEP Security

Let's add `gluu-oauth-pep` plugin.

- Click `ROUTES` on the left panel
- Click `OAuth` button on the `route id/name` with `gluu.local.org` as the host(As per previous configuration)
- Now configure the plugin and secure endpoints as you want. Currently, I am only securing `/blogs` endpoint where `admin` and `visitor` can view blogs i.e. GET HTTP request and only `admin` have rights to edit/update/delete blogs i.e. GET, POST, PUT

![oauth-pep](https://user-images.githubusercontent.com/39133739/96604132-62089200-1312-11eb-97da-e9b7b535fd27.png)

### Gluu Server configuration 

#### Update user and add roles

1. Open Gluu CE oxTrust(Admin GUI).

1. Navigate to `Configuration` > `Users` > `Add Person`

1. Click on the `User Permission` option in the `gluuPerson` tab on the left side. Fill in the role and all other details or if you have already users then add roles and update it. You can see in the below screenshot.

![gg-gluu-user-role](https://user-images.githubusercontent.com/39133739/96604147-6634af80-1312-11eb-94f2-874caebd0c11.png)

#### Update OP client and release `Permission` scope

1. Open Gluu CE oxTrust(Admin GUI).

1. Navigate to `OpenID Connect` > `Clients` > `<Your OP Client>`

1. Click on the `Add Scope` button and add `permission` scope and update the client

![client-perm](https://user-images.githubusercontent.com/39133739/96713927-09430300-13bf-11eb-9aae-31a9277f6ab0.png)

#### Update and enable Introspection script

Here is now Gluu Server is doing some magic. It has a great feature where you can add custom logic to modify the response of the token introspection. During introspection of the token, this below script adds user roles in introspection response, and this scope checks by the `gluu-oauth-pep` plugin. If token has enough scope then allow otherwise deny. Below is the configuration:

1. Open Gluu CE oxTrust(Admin GUI)

1. Navigate to `Configuration` > `Other Custom Scripts` > `Introspection`

1. We have a demo script. Copy the introspection script from [here](https://raw.githubusercontent.com/GluuFederation/gluu-gateway-setup/version_4.2.0/gg-demo/introspection_script.py) and replace it in the Script field and enable the introspection_sample script. You can add a new script or update the existing.

![intro-script](https://user-images.githubusercontent.com/39133739/96714737-37751280-13c0-11eb-86a6-95edbadeeab6.png)

Configuration is finished here. Now you need to call the protected API using GG Kong Proxy Endpoint.

## Request to Proxy

GG Kong exposes the proxy endpoint on the port `:443` so you just need to call API in your angular app and pass `access_token` in the authorization header.

As per my configuration, I am calling proxy endpoint like `https://gluu.local.org:443/blogs` with `access_token` in the authorization header. All users can see blogs but only `admin` has permission to modify/delete blogs.

Below code is the angular code to call GG Proxy Endpoint:

```js
// GET request: allow every user
this.http.get('https://gluu.local.org:443/blogs', 
    {headers: {authorization: 'Bearer ' + this.accessToken}}
)
      .subscribe((response) => {
        this.images = response;
      }, (error) => {
        console.log(error);
      });

// DELETE request: allow only admin
this.http.delete('https://gluu.local.org:443/blogs/1', 
    {headers: {authorization: 'Bearer ' + this.accessToken}}
)
      .subscribe((response) => {
        this.images = response;
      }, (error) => {
        console.log(error);
      });
```

If all is ok then you will get a response from the GG.

## Conclusion
At a high level, implementing a piece of infrastructure like an API gateway makes sense when you have a lot of APIs. If you have just a few endpoints, it may be overkill. But there are advantages to this approach:

1. Policy enforcement is not in code — it’s in the HTTP routing infrastructure. That means you can change the required scopes without touching your code.
1. Your backend APIs are not Internet-facing
1. You can implement other security, like limiting transaction volume (i.e. how many calls per hour, day etc can a client make).
1. Developers don’t need to know anything about OAuth — they can just code the functionality they need, and focus on fine grain authorization.

So this approach may not be for everyone. But GG is a great tool to have in your back pocket when the right use case presents itself.

Thank you!