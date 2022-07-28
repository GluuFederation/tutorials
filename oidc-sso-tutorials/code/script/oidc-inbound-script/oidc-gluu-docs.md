# Inbound external oauth2 server authentication for Gluu Server

In this tutorials, we will see how you can integrate inbound external oauth2 server authentication in Gluu server. If you are looking for social login support then checkout [passport](https://gluu.org/docs/gluu-server/4.4/authn-guide/inbound-oauth-passport/) module for that.

We will use [interception authentication script](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/script/oidc-inbound-script/oidc-gluu-script.py) for whole flow. Currently It supports `Authorization Code Flow` and `client_secret_post` token endpoint auth method.  

# Prerequisites

- A Gluu Server (installation instructions [here](https://gluu.org/docs/gluu-server/4.4/installation-guide/install-ubuntu/))
- The [external oauth2 server authentication script](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/script/oidc-inbound-script/oidc-gluu-script.py)
- External OAuth2 Provider credentials: you can choose any external OP server who follows OAuth2 standards and authentication features.  
- RP application: This is your application that will be used by your users and where you want to add this auth feature.

# Configure Gluu server

1. [Download script from here.](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/script/oidc-inbound-script/oidc-gluu-script.py)

2. This script need accept one property `oidc_creds_file`. which is json file with your external oauth2 server details

```
// oidc_creds_file: /opt/oidc.json
{
  "op_server": "https://your.external.oauth2.server",
  "client_id": "xxxxxxxxxxxxxxxx-xxxxx-external-oauth2",
  "client_secret": "xxxxxxxxxxxxxx-xxxxx-external-oauth2",
  "authorization_uri": "https://your.external.oauth2.server/xx/xxxx",
  "token_uri": "https://your.external.oauth2.server/oauth/xx/xxx",
  "userinfo_uri": "https://your.external.oauth2.server/xxx/xxx",
  "redirect_uri": "https://your.gluu.server/oxauth/postlogin.htm",
  "scope": "openid profile email",
  "auto_redirect": false,
  "title": "Login with OAuth2"
}
```

| Property | Description |
|----------|-------------|
| op_server | Your external OAuth2 server FQDN |
| client_id | Client id of your external OAuth2 server |
| client_secret | Client secret of your external OAuth2 server |
| authorization_uri | Authorization endpoint of your external OAuth2 server |
| token_uri | Token endpoint of your external OAuth2 server |
| userinfo_uri | Userinfo endpoint of your external OAuth2 server |
| redirect_uri | Sample: `https://<your.gluu.server>/oxauth/postlogin.htm`, This is redirect URL where your OAuth2 server redirect back with `code`. Use this same URL to configure `redirect urls` at your external OAuth2 server.|
| scope | OAuth scopes |
| auto_redirect | If true, it will automatically redirect to external OAuth2 server otherwise you will get one button on Gluu login page. |
| title | This property is use to set text for button which shown on gluu login page |

3. Download [oidc-gluu-login.xhtml from here](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/script/oidc-inbound-script/oidc-gluu-login.xhtml) and place it here `/opt/gluu/jetty/oxauth/custom/pages/auth/oidc/oidc.xhtml`(inside chroot). Rename it to `oidc.xhtml`.

4. Follow [these instructions](https://gluu.org/docs/gluu-server/4.4/admin-guide/custom-script/) to add [script](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/code/script/oidc-inbound-script/oidc-gluu-script.py) in Gluu server. In name field you can add `oidc`. This name will be your acr value.

5. Restart oxauth server `service oxauth restart`

## Testing at RP application

RP(Relying party) is application which will be used by your users where you want to add authentication and protect resources. Once you intiate auth request from your RP Application make sure to add `acr_values=oidc` in request. acr_values is your script name as configured above.

You can use [`OIDC Authorization Code Flow`](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/OpenID-Connect-OAuth2-SSO-with-Gluu.md) to initiate auth request to Gluu server. For testing you can use [node-gluu-sso](https://github.com/GluuFederation/tutorials/tree/master/oidc-sso-tutorials/code/node/node-gluu-sso) as a RP application for quick testing.

