# Protect Backend Node JS and Frontend React with the Janssen Cedarling
# Cedar Fine-grained Authorization in Backend Node JS and Frontend React JS 

![banner-node-react](https://github.com/user-attachments/assets/8a679aa3-750b-4176-acc9-d7a30fb159b4)

This guide demonstrates how to build a NodeJS and ReactJS application using a new approach to security: **Token-Based Access Control**, where developers authorize capabilities by presenting a bundle of JWT tokens to a policy engine, specifically the [Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). The Cedar policy syntax is very expressive. A developer can even express policies based on a person's role or group membership. And that's exactly what we're going to do here: use TBAC to implement RBAC and ABAC. That may not sound very clear, but please continue for more details on why this makes sense.

# Sample Application : Blogging Platform

For demo, We are going to develop Blogging platform like **medium.com**. Where we will add RBAC and ABAC fine grained control using the [Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). We are going to use the [BFF](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps-24) application structure to build the backend in NodeJS that means only backend is having the tokens where we can easily integrate TBAC but for frontend there are no tokens. but don't worry we have solution for this. We will use the [unsigned-authorization](https://docs.jans.io/stable/cedarling/getting-started/javascript/#unsigned-authorization) feature.

- Principals: Users with roles like `Admin`, `Editor`, and `Author`.
- Actions: `Create`, `Edit`, `Delete`, and `View` articles and `Conversion`, `GenerateImage`, `GenerateVideo` using AITools
- Resources: `Article` and `AITools`

## Roles and Permissions:

1. Admin:

   - Can perform any operation

1. Author:

   - Can perform `Create`, `Edit`, `Delete`, and `View` article

1. Editor:

   - Can perform only `Edit` and `View` article
   - Cannot perform `Create` and `Delete`

## Plans and Permissions:

1. Premium:
   User with `Premium` plan can access `AITools` for `Conversation`, `GenerateImage` and `GenerateVideo`

1. Basic:
   User with `Basic` plan can access `AITools` but only for `Conversation`.

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
       principal.plan == "basic"
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
       principal.plan == "premium"
   };
   ```


# Test Cases

## Author with Premium plan

[author-with-premium-plan](https://github.com/user-attachments/assets/f9f30eb5-3e10-4f73-8dd8-31cc1f53fc52)