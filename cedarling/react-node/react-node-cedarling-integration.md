# Protect Backend Node JS and Frontend React with the Janssen Cedarling

# Cedar Fine-grained Authorization in Backend Node JS and Frontend React JS

![banner-node-react](https://github.com/user-attachments/assets/8a679aa3-750b-4176-acc9-d7a30fb159b4)

This guide demonstrates how to build a NodeJS and ReactJS application using a new approach to security: **Token-Based Access Control**, where developers authorize capabilities by presenting a bundle of JWT tokens to a policy engine, specifically the [Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). The Cedar policy syntax is very expressive. A developer can even express policies based on a person's role or group membership. And that's exactly what we're going to do here: use TBAC to implement RBAC and ABAC. That may not sound very clear, but please continue for more details on why this makes sense.

# Sample Application: Blogging Platform

For this demo, we will build a blogging platform similar to Medium.com, incorporating RBAC and ABAC fine-grained access control using the [Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). The backend will follow a Backend-for-Frontend [BFF](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-24) architecture in Node.js, ensuring that only the backend holds and manages tokens. This design makes it straightforward to integrate Token-Based Access Control (TBAC) while keeping the frontend token-free. To bridge this gap on the frontend, we will leverage the [unsigned-authorization](https://docs.jans.io/stable/cedarling/getting-started/javascript/#unsigned-authorization) feature as our solution.

- Principals: Users with roles like `Admin`, `Editor`, and `Author`.
- Actions: `Create`, `Edit`, `Delete`, and `View` articles and `Conversion`, `GenerateImage`, `GenerateVideo` using AITools
- Resources: `Article` and `AITools`

## Roles and Permissions:

1. Admin:

   - Can perform any operation

1. Author:

   - Can perform `Create`, `Edit`, `Delete`, and `View` articles

1. Editor:

   - Can perform only `Edit` and `View` article
   - Cannot perform `Create` and `Delete`

## Plans and Permissions:

1. Premium:
   Users with the `Premium` plan can access `AITools` for `Conversation`, `GenerateImage`, and `GenerateVideo`

1. Basic:
   Users with the `Basic` plan can access `AITools` but only for `Conversation`.

# Setting Up Cedar Policies

We'll use the [Agama-Lab](https://cloud.gluu.org/agama-lab) Policy Designer to create and manage our authorization policies. [Check out the Agama Lab Documents for more information](https://gluu.org/agama/authorization-policy-designer/).

## Step 1: Create Policy Store

1. Sign-in to [Agama Lab](https://cloud.gluu.org/agama-lab) with your GitHub id.

1. Open the `Policy Designer` section.

1. Select the repository where you want to save your policies.

1. Create a new policy store named `JansBlogPlatform`.

![create-policy-store](https://github.com/user-attachments/assets/a2b87823-782b-4ccc-9570-c79e587da1e4)

## Step 2: Define Schema

1. Open the `Manage Policy Store` section by clicking the arrow link button on the store list.

1. Add `plan` attribute in `User`. Click on edit icon in User entity and add `plan` attribute.
   ![add-plan](https://github.com/user-attachments/assets/73318ec2-504f-443b-92c8-e17d215be45a)

1. Create an Entity called `Artcile` and `AITools`, which is our sample Resources.
   ![add-artcle-entity](https://github.com/user-attachments/assets/7b8f5820-83ac-486c-adeb-f8588794e673)
   ![add-aitools-entity](https://github.com/user-attachments/assets/ef810e39-980a-4e37-a513-b21a4a07bea1)

1. Once you add the Resources, you need to associate an action with it.

   Configure actions (`Create`, `Edit`, `Delete`, `View`):

   - Set `Principal: User`
   - Set `Resources: Article`.

   ![add-actions](https://github.com/user-attachments/assets/4dea485b-0245-40bd-bc3b-c36a870f5bf2)

   Configure actions (`Conversation`, `GenerateImage`, `GenerateVideo`)

   - Set `Principal: User`
   - Set `Resource: AITools`

   ![add-actions-aitools](https://github.com/user-attachments/assets/e87367ba-19fa-4f5a-aa09-2b80bdfb7c6a)

## Step 3: Create Policies

1. Go to `Manage Policy Store > Policies > Add Policy > Text Editor`.

1. Copy policies one by one, add to the text editor, and save.

   ```js
   @id("AdminCanDoAnything")
   permit (
     principal in Jans::Role::"Admin",
     action,
     resource
   );
   ```

   ```js
   @id("AuthorCanCreateEditDeleteView")
   permit (
     principal in Jans::Role::"Author",
     action in [Jans::Action::"Create",
     Jans::Action::"Edit",
     Jans::Action::"Delete",
     Jans::Action::"View"],
     resource is Jans::Article
   );
   ```

   ```js
   @id("EditorCanEditViewArticleNotCreate")
   permit (
     principal in Jans::Role::"Editor",
     action in [Jans::Action::"Edit",
     Jans::Action::"View"],
     resource is Jans::Article
   );
   ```

   ```js
   @id("BasicPlanAccessAIConversationTool")
   permit (
     principal,
     action in [Jans::Action::"Conversation"],
     resource is Jans::AItools
   )
   when {
       principal has plan
   };
   ```

   ```js
   @id("PremiumPlanAccessAIGenerateImageVideoTool")
   permit (
     principal,
     action in [Jans::Action::"GenerateImage",
     Jans::Action::"GenerateVideo"],
     resource is Jans::AItools
   )
   when {
       principal has plan && principal.plan == "premium"
   };
   ```

## Step 4: Setup Trusted Issuer

A trusted issuer is required to configure the Cedarling. We can configure which token is used for user and workload authentication. `access_token` is for workload and `id_token` is for user authentication. The cedarling also validates the access token and ID token, so we need to add configuration for both tokens in the token metadata. [More details](https://docs.jans.io/v1.3.0/cedarling/cedarling-jwt/#summary-of-jwt-validation-mechanisms)

- Go to `Manage Policy Store > Trusted Issuer > Add Issuer`.

- Add name, description, and OpenID Configuration endpoint

- Add token metadata

  ```js
  {
    "access_token": {
      "trusted": true,
      "entity_type_name": "Jans::Access_token",
      "user_id": "sub",
      "token_id": "jti",
      "workload_id": "rp_id",
      "claim_mapping": {},
      "required_claims": [
        "jti",
        "iss",
        "aud",
        "sub",
        "exp",
        "nbf"
      ],
      "role_mapping": "role",
      "principal_mapping": [
        "Jans::Workload"
      ]
    },
    "id_token": {
      "trusted": true,
      "entity_type_name": "Jans::id_token",
      "user_id": "sub",
      "token_id": "jti",
      "role_mapping": "role",
      "claim_mapping": {},
      "principal_mapping": [
        "Jans::User"
      ]
    },
    "userinfo_token": {
      "trusted": true,
      "entity_type_name": "Jans::Userinfo_token",
      "user_id": "sub",
      "token_id": "jti",
      "role_mapping": "role",
      "claim_mapping": {},
      "principal_mapping": [
        "Jans::User"
      ]
    },
    "tx_token": {
      "trusted": true,
      "entity_type_name": "Jans::Access_token",
      "user_id": "sub",
      "token_id": "jti"
    }
  }
  ```

# Setting up a Node.js Application

## Step 1: Install the Cedarling WASM

```sh
npm install @janssenproject/cedarling_wasm@0.0.213-nodejs
```

You just need to add the suffix `-nodejs` in the current version to install Node JS Cedarling version. By default, it installs the web cedarling version.

## Step 2: Configure the Cedarling

Initialize with these properties:

```js
export const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: "JansBlogPlatform",
  CEDARLING_POLICY_STORE_URI:
    "https://raw.githubusercontent.com/kdhttps/pd-first/refs/heads/agama-lab-policy-designer/e3a8d6281e8538a0977bf544428c260004601bc289ff.json", // you policy store URI
  CEDARLING_USER_AUTHZ: "enabled",
  CEDARLING_LOG_TYPE: "std_out",
  CEDARLING_LOG_LEVEL: "TRACE",
  CEDARLING_LOG_TTL: 120,
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    "===": [{ var: "Jans::User" }, "ALLOW"],
  },
  CEDARLING_JWT_SIG_VALIDATION: "disabled",
  CEDARLING_JWT_STATUS_VALIDATION: "disabled",
  CEDARLING_JWT_SIGNATURE_ALGORITHMS_SUPPORTED: ["RS256"],
};
```

Checkout [Cedarling NodeJS Article](https://medium.com/janssen-project-feed/using-cedar-to-modernize-authz-in-a-node-js-backend-d204fb4dc55e) for Code integration details.

# Setting up a React JS Application

## Step 1: Install the Cedarling WASM

```sh
npm install @janssenproject/cedarling_wasm@0.0.213
```

## Step 2: Configure the Cedarling

Initialize with these properties:

```js
export const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: "JansBlogPlatform",
  CEDARLING_POLICY_STORE_URI:
    "https://raw.githubusercontent.com/kdhttps/pd-first/refs/heads/agama-lab-policy-designer/e3a8d6281e8538a0977bf544428c260004601bc289ff.json", // your policy store URI
  CEDARLING_POLICY_STORE_ID: "4c996315c8165b5f79a960bb62769c39a054ce7b8550",
  CEDARLING_USER_AUTHZ: "enabled",
  CEDARLING_WORKLOAD_AUTHZ: "disabled",
  CEDARLING_LOG_TYPE: "std_out",
  CEDARLING_LOG_LEVEL: "TRACE",
  CEDARLING_LOG_TTL: 120,
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    "===": [{ var: "Jans::User" }, "ALLOW"],
  },
};
```

Checkout [Cedarling React JS Article](https://medium.com/janssen-project-feed/using-cedar-to-modernize-authz-in-a-react-frontend-f30c637d879c) for code integration details.

# Test Cases

## Admin with All permissions

- 🟢 Admin can `Create` a Article
- 🟢 Admin can `Edit` a Article
- 🟢 Admin can `Delete` a Article
- 🟢 Admin can `View` a Article
- 🟢 Admin can `Conversation` with AITools
- 🟢 Admin can `GenerateImage` with AITools
- 🟢 Admin can `GenerateVideo` with AITools

[admin.webm](https://github.com/user-attachments/assets/0db55157-ff67-46c6-a37f-5ff83c28ad74)

## Author with Premium plan

- 🟢 Author can `Create` a Article
- 🟢 Author can `Edit` a Article
- 🟢 Author can `Delete` a Article
- 🟢 Author can `View` a Article
- 🟢 Author can `Conversation` with AITools
- 🟢 Author can `GenerateImage` with AITools
- 🟢 Author can `GenerateVideo` with AITools

[author_premium.webm](https://github.com/user-attachments/assets/740a8d3e-c73e-446e-8032-e3b00f92c8ae)

## Author with Basic plan

- 🟢 Author can `Create` a Article
- 🟢 Author can `Edit` a Article
- 🟢 Author can `Delete` a Article
- 🟢 Author can `View` a Article
- 🟢 Author can `Conversation` with AITools
- 🔴 Author cannot `GenerateImage` with AITools
- 🔴 Author cannot `GenerateVideo` with AITools

[author_basic.webm](https://github.com/user-attachments/assets/9394f3f7-686e-4a9f-9ad5-145bc3f33534)

## Editor with Basic plan

- 🔴 Author cannot `Create` a Article
- 🟢 Author can `Edit` a Article
- 🔴 Author cannot `Delete` a Article
- 🟢 Author can `View` a Article
- 🟢 Author can `Conversation` with AITools
- 🔴 Author cannot `GenerateImage` with AITools
- 🔴 Author cannot `GenerateVideo` with AITools

[editor_basic.webm](https://github.com/user-attachments/assets/b1be3d15-c31b-46f6-9c69-fcc89ea0147b)

For a complete implementation, reference the:

- [React Node Blog Project Code](https://github.com/GluuFederation/tutorials/tree/master/cedarling/react-node/blog-project-JCRN)
- [Policy Store](https://raw.githubusercontent.com/kdhttps/pd-first/refs/heads/agama-lab-policy-designer/e3a8d6281e8538a0977bf544428c260004601bc289ff.json).
