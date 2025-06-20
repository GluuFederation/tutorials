# Modernizing Authz in Node JS Backend API Apps

![node-js-blog](https://github.com/user-attachments/assets/54f2309a-c08e-4a41-b995-c52e3f4581db)

This guide demonstrates how to build a Node JS application using a new approach to security: Token Based Access Control where developers authorize capabilities by presenting a bundle of JWT tokens to a policy engine, in this case the [the Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). The Cedar policy syntax is very expressive. Developer can even express policies based on a person's role or group membership. And so that's just what we're going to do here... use TBAC to implement RBAC and ABAC. That may sound confusing, but carry on further for more details on why this makes sense!

# Sample Application: Cloud Infrastrcutre

For demo, we're going to use role-based access control (or "RBAC") and attribute-based access control (or "ABAC") to develop a sample application that allows users to create, update, and delete virtual machine. It's a very simple version of Digital Ocean APIs! For example, There is simple username password login simulating OAuth tokens. In your real application, you can add federated authentication via a standard OpenID Connect Provider. After authentication, Cedarling plays a role in authorization, which will take roles from the ID Token to authorize a user. Below are the roles which perform will perform the following actions and access Task resources. If a user has enough permission, then allow the action; otherwise, deny.

- Principals: Users with roles like `admin`, `developer`, and `auditor`.
- Actions: `Create`, `Update`, `Delete`, and `View` virtual machines
- Resources: Virtual Machine

Roles and Permissions:

1. Admin:

   - Can perform any operation

1. Developer:

   - Can perform `Create` but should be limit > 0
   - Can perform `Update`, `View`
   - Cannot perform `Delete`

1. Auditor

   - Can perform only `View`

# Setting Up Cedar Policies

We'll use the [Agama-Lab](https://cloud.gluu.org/agama-lab) Policy Designer to create and manage our authorization policies. [Check out the Agama Lab Documents for more information](https://gluu.org/agama/authorization-policy-designer/).

## Step 1: Create Policy Store

1. Sign-in to [Agama Lab](https://cloud.gluu.org/agama-lab) with your GitHub id.

1. Open the `Policy Designer` section.

1. Select the repository where you want to save your policies.

1. Create a new policy store named `JansNodeJSCedarling`.

## Step 2: Define Schema

1. Open the `Manage Policy Store` section by clicking the arrow link button on the store list.

1. Create an Entity called `VirtualMachine`, which is our sample Resource.
   ![add-virtualmachine-entity](https://github.com/user-attachments/assets/f8724e09-c1ef-431e-93ab-3f0e665dc4f5)

1. Once you add the Resource, you need to associate an action with it. Configure actions (`Create`, `Update`, `Delete`, `View`):

   - Set `Principal: User`
   - Set `Resources: VirtualMachine`.

   ![add-actions](https://github.com/user-attachments/assets/39b29093-3f90-4fe1-bbfd-75b989eec9ed)

## Step 3: Create Policies

1. Go to `Manage Policy Store > Policies > Add Policy > Text Editor`.

1. Copy policies one by one, add in text editor, and save.

   1. **Admin Policies** (full access):
      Admin can perform any action

      ```js
      @id("AdminCanDoAnything")
      permit (
        principal in Jans::Role::"admin",
        action,
        resource
      );
      ```

      Only admin can delete resources.

      ```js
      @id("OnlyAdminCanDelete")
      forbid (
          principal,
          action == Jans::Action::"Delete",
          resource
      )
      unless {
         principal in Jans::Role::"admin"
      };
      ```

   2. **Developer Policies**:

      Developers can create Virtual Machines within limit. Below is the example of attribute-based access control(ABAC) where we are authorizing user access based on `id_token.limit`.

      ```js
      @id("LimitDeveloperCreateAccess")
      permit (
        principal in Jans::Role::"developer",
        action in [Jans::Action::"Create"],
        resource is Jans::VirtualMachine
      )
      when {
        principal has id_token.limit &&
        principal.id_token.limit > 0
      };
      ```

      Developers can update and view VMs

      ```js
      @id("DeveloperCanUpdateView")
      permit (
        principal in Jans::Role::"developer",
        action in [Jans::Action::"Update",
        Jans::Action::"View"],
        resource is Jans::VirtualMachine
      );
      ```

   3. **Auditor Policy**

      ```js
      @id("AuditorCanViewOnly")
      permit (
        principal in Jans::Role::"auditor",
        action == Jans::Action::"View",
        resource
      );
      ```

## Step 4: Setup Trusted Issuer

A trusted issuer is required to configure the cedarling. Where we can configure which token is using for user and workload authentication. `access_token` is for workload and `id_token` is for user authentication. The cedarling also validate the access token and id token so we need add configure for both tokens in token metadata. [Mode details](https://docs.jans.io/v1.3.0/cedarling/cedarling-jwt/#summary-of-jwt-validation-mechanisms)

- Go to `Manage Policy Store > Trusted Issuer > Add Issuer`.

- Add name, description and OpenID Configuration endpoint

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
    }
  }
  ```

# Setting up a Node JS Application

## Step 1: Install the Cedarling WASM

```sh
npm install @janssenproject/cedarling_wasm@0.0.131-nodejs
```

You just need to add suffix `-nodejs` in current version to install nodejs cedarling version. By default it install web cedarling version.

## Step 2: Configure the Cedarling

Initialize with these properties:

```js
export const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: "TaskManager",
  CEDARLING_POLICY_STORE_URI: "<your_policy_store_URI>",
  CEDARLING_USER_AUTHZ: "enabled",
  CEDARLING_LOG_TYPE: "std_out",
  CEDARLING_LOG_LEVEL: "INFO",
  CEDARLING_LOG_TTL: 120,
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    "===": [{ var: "Jans::User" }, "ALLOW"],
  },
};
```

- `CEDARLING_POLICY_STORE_URI`: URL of your policy store (from Agama-Lab). In the policy store list, use the link button to copy the policy store URI.

## Step 3: Create Authorization Client

This class implements a singleton pattern for managing Cedar authorization using WebAssembly (WASM), providing a centralized way to initialize the Cedar policy engine and perform authorization checks. It wraps the `@janssenproject/cedarling_wasm` module to handle policy evaluation through a single, reusable instance that can be accessed throughout the application.

```ts
class CedarlingClient {
  private static instance: CedarlingClient;
  private cedarling: Cedarling | null = null;
  private initialized = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  private constructor() {}

  static getInstance(): CedarlingClient {
    if (!CedarlingClient.instance) {
      logger.info("WASM initialing. Creating new instance");
      CedarlingClient.instance = new CedarlingClient();
    }
    return CedarlingClient.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async initialize(policyStoreConfig: any): Promise<void> {
    if (!this.initialized) {
      this.cedarling = (await init(policyStoreConfig)) as unknown as Cedarling;
      logger.info("WASM initialized", this.cedarling);
      this.initialized = true;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authorize(request: any): Promise<AuthorizeResult> {
    if (!this.cedarling || !this.initialized) {
      const errorMessage = "Cedarling not initialized";
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    try {
      const result = await this.cedarling.authorize(request);
      return result;
    } catch (error) {
      logger.error("Error during authorization:", error);
      throw error;
    }
  }
}

export const cedarlingClient = CedarlingClient.getInstance();
```

## Step 4: Initialize Cedarling

We are globally initializing the Cedarling object. You can add it to your app's startup files. Like in the [sample](https://github.com/GluuFederation/tutorials/tree/master/cedarling/nodejs/nodejs-cedarling) application, you can add it in `app.ts`.

```js
app.listen(PORT, () => {
  cedarlingClient.initialize(cedarlingBootstrapProperties).catch(console.error);
  logger.info(`Server running on http://localhost:${PORT}`);
  swaggerDocs(app, Number(PORT));
});
```

## Step 5: Middleware for Authorization

```js
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];

    .
    .
    .

    // Cedarling authorization
    const request = {
      tokens: {
        access_token: token,
        id_token: token,
      },
      action: `Jans::Action::"${getAction(req)}"`,
      resource: {
        type: "Jans::VirtualMachine",
        id: "CloudInfrastructure",
        app_id: "CloudInfrastructure",
        name: "CloudInfrastructure",
        url: {
          host: "jans.test",
          path: "/",
          protocol: "http",
        },
      },
      context: {},
    };

    logger.info(`Request: ${JSON.stringify(request)}`);

    const result = await cedarlingClient.authorize(request);
    logger.info(`Authentication result: ${result.decision}`);

    if (!result.decision) {
      throw new HttpException(403, "Permission denied!");
    }

    next();
  } catch (error) {
    logger.error(`Authentication failed: ${error}`);
    next(error);
  }
};
```
