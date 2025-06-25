# Using Cedar to Modernize Authz in A Node.js Backend

![node-js-blog](https://github.com/user-attachments/assets/54f2309a-c08e-4a41-b995-c52e3f4581db)

This guide demonstrates how to build a Node.js application using a new approach to security: Token-Based Access Control, where developers authorize capabilities by presenting a bundle of JWT tokens to a policy engine, specifically the [Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). The Cedar policy syntax is very expressive. A developer can even express policies based on a person's role or group membership. And that's exactly what we're going to do here: use TBAC to implement RBAC and ABAC. That may not sound very clear, but please continue for more details on why this makes sense.

# Sample Application: Cloud Infrastructure

For demo, we're going to use role-based access control (or "RBAC") and attribute-based access control (or "ABAC") to develop a sample application that allows users to create, update, and delete virtual machines. It's a very simple version of Digital Ocean APIs! In sample application, we have a simple username and password login which is simulating OAuth tokens. In your real application, you can add federated authentication via a standard OpenID Connect Provider. After authentication, Cedarling plays a role in authorization, which will take roles from the ID Token to authorize a user. Below are the roles which perform will perform the following actions and access virtual machine resources. If a user has enough permission, then allow the action; otherwise, deny.

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

1. Copy policies one by one, add to the text editor, and save.

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

      Only the admin can delete resources.

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

      Developers can create Virtual Machines within limits. Below is an example of attribute-based access control(ABAC) where we are authorizing user access based on `id_token.limit`.

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
    }
  }
  ```

# Setting up a Node.js Application

## Step 1: Install the Cedarling WASM

```sh
npm install @janssenproject/cedarling_wasm@0.0.131-nodejs
```

You just need to add the suffix `-nodejs` in the current version to install Node.js Cedarling version. By default, it installs the web cedarling version.

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

This Node.js middleware provides authorization functionality using the Cedarling client, with the ability to enforce authorization checks. The middleware builds the request for cedarling with actions, resources, and tokens, and checks the cedarling authz results. This is just an example to protect the route. You can write your logic to protect resources as per your requirements with the help of the Cedarling client.

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


export const getAction = (req: Request): string => {
  if (req.method === 'GET') {
    return 'View';
  } else if (req.method === 'POST') {
    return 'Create';
  } else if (req.method === 'PUT') {
    return 'Update';
  } else if (req.method === 'DELETE') {
    return 'Delete';
  } else {
    return 'Invalid';
  }
};
```

In the above example, there are 2 things:

- First, we make a middleware `authenticate` which helps us to make an authorization request to the Cedarling WASM with Access Token and ID Token. Your ID Token should have a Role claim, and if you don't have a role, then you need to change the policy, which will act like ABAC.

- Second, the `getAction` function helps to get the correct action. There is a request object that checks the authorization for the action. In response, it returns a result where we get which policy is responsible for authorization, timestamp, and decision. Below is an example of the Create(or POST HTTP request) action result. Use `result.decision` to authorize the request and show/hide elements.

```json
{
  "id": "0197a15c-cee0-72da-905f-5800be68fc4b",
  "request_id": "0197a15c-ced6-7653-b17d-257d50de663e",
  "timestamp": "2025-06-24T15:25:03.520Z",
  "log_kind": "Decision",
  "policystore_id": "22942366f5ad4d8338514bc402d4b901b056051f2bed",
  "policystore_version": "undefined",
  "principal": ["User"],
  "User": {},
  "diagnostics": {
    "reason": [
      {
        "id": "feac81b973836478ae6478ac63b59d4f2f6691dcddae",
        "description": "LimitDeveloperCreateAccess"
      }
    ],
    "errors": []
  },
  "action": "Jans::Action::\"Create\"",
  "resource": "Jans::VirtualMachine::\"CloudInfrastructure\"",
  "decision": "ALLOW",
  "tokens": {
    "id_token": {
      "jti": "6dV4hO0kQ3OaPJerJHNwgg"
    },
    "access_token": {
      "jti": "6dV4hO0kQ3OaPJerJHNwgg"
    }
  },
  "decision_time_micro_sec": 7000,
  "pdp_id": "a446ecda-b6aa-4ad5-9d0e-b7c09b1fb30e",
  "application_id": "CloudInfrastructure"
}
```

# Test Cases

## Admin Authorization

Let's log in as an admin user and check the authorization. As per the above authorization policies, admins can access any resource. As you can see in the video below, Sachin is an admin user, and he has the `admin` role.

🟢 Admin can `Create` a VM

🟢 Admin can `Update` a VM

🟢 Admin can `Delete` a VM

🟢 Admin can `View` a VM

[node-admin-user.webm](https://github.com/user-attachments/assets/a4980f10-5395-4d3c-afa1-01530efcee30)

## Developer Authorization

Log in with a `developer` role user and check the authorization.

🟢 Developer with `limit`, can `Create` a VM. You can see the video below. Dhoni is a developer user, and he has a limit `limit: 1`.

[nodejs-dhoni-developer-user.webm](https://github.com/user-attachments/assets/c71e991b-bc51-41ac-b356-d8c43da13fff)

🔴 A developer with no limit cannot `Create` a VM. You can see the video below. Virat is a developer user with `limit: 0` means he cannot create a new virtual machine.

[nodejs-virat-developer-user.webm](https://github.com/user-attachments/assets/28a5b49e-2dd2-4877-b112-7aca1f96ebe4)

🟢 Developer can `Update` a VM

🔴 Developer cannot `Delete` a VM

🟢 Developer can `View` a VM

## Auditor Authorization

An auditor user can only view virtual machine resources.

🟢 Auditor can only `View` a VM

🔴 Auditor cannot `Create` a VM

🔴 Auditor cannot `Update` a VM

🔴 Auditor cannot `Delete` a VM

[nodejs-auditor-user.webm](https://github.com/user-attachments/assets/b9049e02-d8ac-4398-97f6-eed99aa96796)

For a complete implementation, reference the:

- [Node JS Demo project](https://github.com/GluuFederation/tutorials/tree/nodejs-blog/cedarling/nodejs/nodejs-cedarling)
- [Policy Store](https://raw.githubusercontent.com/kdhttps/pd-first/refs/heads/agama-lab-policy-designer/22942366f5ad4d8338514bc402d4b901b056051f2bed.json).
