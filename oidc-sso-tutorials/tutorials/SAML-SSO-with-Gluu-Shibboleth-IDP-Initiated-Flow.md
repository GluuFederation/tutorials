In this blog, I am going to describe to you about SAML SSO IDP Initiated flow with Gluu Shibboleth IDP.

# Before Start

Before start, try to implement [SAML SSO with Gluu Shibboleth: SP Initiated Flow](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SAML-SSO-with-Gluu-Shibboleth-SP-Initiated-Flow.md), this is a simple and general use flow which you will get it easily and help you to understand the SAML concepts and terms. One more reason to do this is you need the same configuration for IDP Initiated Flow. No extra configuration for IDP Initiated flow.

> Note: If you are trying Gluu Inbound SAML IDP-initiated flow then there is one configuration you need, details are [here](https://gluu.org/docs/gluu-server/4.2/authn-guide/inbound-saml-passport/#configuring-the-flow).

# Prerequisite

- Check my blog on [SAML SSO with Gluu Shibboleth: SP Initiated Flow](https://github.com/GluuFederation/tutorials/blob/master/oidc-sso-tutorials/tutorials/SAML-SSO-with-Gluu-Shibboleth-SP-Initiated-Flow.md)

# IDP Initiated flow

```
www.websequencediagrams.com

title SAML SSO IDP-Initiated Flow

User->IDP: Request to IDP
note over User,IDP
Request to IDP Unsolicited endpoint with required query param 
providerId(SP entityId) and optional target(relay state)
e.g. https://idp.com/idp/profile/SAML2/Unsolicited/SSO?providerId=https://saml_rp.com
end note
IDP->IDP: authenticate the user
IDP->SP: send SAML assertion response to SP ACS URL
SP->SP: SP validated the SAML assertion and get userinfo
note over SP
Now you have authenticated user,
if target(relay state) is there in request then redirect user there
otherwise you have already control, redirect as you want
end note
SP->User: allow user to use the resources
```

![SAML SSO IDP-Initiated Flow](https://user-images.githubusercontent.com/39133739/93565286-bda8ce00-f9a8-11ea-93d3-6292d4713dc7.png)

# Implementation

## Step 1: Request to IDP

Before implementation, you need some strong reason to do this because for me it is still sound weird that flow starts from IDP. I didn't face any real-time problem yet for this flow.

For now let's assume, on your open website, there is on link or button to access some resources or features. This link or button has a request like below. Shibboleth SAML IDP provide this below endpoint to start IDP Initiated flow

```
HTTP GET

https://[your_gluu_shibboleth_host]/idp/profile/SAML2/Unsolicited/SSO?providerId=passport_saml_rp
```

You can pass some more query parameters in request:

1. `providerId` is the `entityId`. It is recommended. You can find it in the SP metadata file that we generated in SP-initiated flow. IDP gets to know on from parameter which SP it need to send SAML assertion after user authentication.
1. `shire`(optional) is `ACS URL`. if you skip it then IDP will get it from SP metadata.
1. `target`(optional) is `relay state`, after the flow, SP redirect the user to this endpoint.
1. `time`(optional) is the timestamp to help with stale request detection

That's it. You just need to build this IDP request URL for implementation, the next flow will continue as per your configuration. Let's get more details about the next flow.

## IDP sends SAML Assertion response to SP

After user authentication, IDP sends HTTP Post SAML Assertion response to SP at ACS URL. Here SP get user info from SAML assertion, redirect and allow user to access resources.

As per `node-passport` code, after assertion, your control will be in the passport `verify` section.

```js
const oPassportSAMLStrategy = new PassportSAMLStrategy(strategyConfig.samlConfig,
  // verfiy section
  (profile, done) => {
    console.log('--- SAML Response ---', profile)
    return done(null, { id: profile['urn:oid:0.9.2342.19200300.100.1.3'], name: profile['urn:oid:2.16.840.1.113730.3.1.241'] })
  }
)
```

Now you have control, process requests as you want.

Thank you !!!