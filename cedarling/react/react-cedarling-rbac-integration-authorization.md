# From RBAC to TBAC: Modernizing Authz in React Browser Apps

![react-cedadrling-1](https://github.com/user-attachments/assets/dc17bb1e-0369-43e2-8e9e-e9f8724b4cd9)

This guide demonstrates how to build a React application using a new approach to security: Token Based Access Control where developers authorize capabilities by presenting a bundle of JWT tokens to a policy engine, in this case the [the Janssen Project Cedarling](https://docs.jans.io/head/cedarling/cedarling-overview/). The Cedar policy syntax is very expressive. Developer can even express policies based on a person's role or group membership. And so that's just what we're going to do here... use TBAC to implement RBAC. That may sound confusing, but carry on further for more details on why this makes sense!

We'll walk through setting up the integration with a practical example involving multiple roles and conditional policies. You'll learn how to:

- Define the authorization schema
- Configure access policies
- Evaluate authorization requests
- Implement the Cedarling's streamlined authorization in React with minimal code

# Sample Application: Task Management

For demo, we're going to use role-based access control (or "RBAC") to develop a sample application that performs Task Management. It's a very simple version of Trello! For example, we will also support federated authentication via a standard OpenID Connect Provider. After authentication, Cedarling plays a role in authorization, which will take roles from the ID Token to authorize a user. Below are the roles which perform will perform the following actions and access Task resources. If a user has enough permission, then allow the action; otherwise, deny. The application will feature:

1. Federated Authentication: Users will authenticate through a standard OpenID Connect Provider

2. Cedarling Authorization: After authentication, Cedarling will handle authorization by:
   - Extracting user roles from the ID Token
   - Evaluating permissions against Task resources
   - Allowing or denying actions based on the user's role

The system will enforce these access controls when users attempt to perform actions, only permitting operations when they have sufficient permissions.

- Principals: Users with roles like `Admin`, `Manager`, and `Member`.
- Actions: `Add`, `Update`, `Delete`, and `View`
- Resources: Task

Roles and Permissions:

1. Admin:

   - Can perform any operation

1. Manager:

   - Can perform `Add`, `Update`, `View`
   - Cannot perform `Delete`

1. Member

   - Can perform only `View`

# Prerequisite

1. **OpenID Connect Server**: Use any compliant provider like [Janssen](https://docs.jans.io), Google, Okta.

1. **React Application**: Use any framework like `Next.js` or `Vite.js` to create a Fresh React App.

# Setting Up Policies

We'll use the [Agama-Lab](https://cloud.gluu.org/agama-lab) Policy Designer to create and manage our authorization policies. [Check out the Agama Lab Documents for more information](https://gluu.org/agama/authorization-policy-designer/).

## Step 1: Create Policy Store

1. Sign-in to [Agama Lab](https://cloud.gluu.org/agama-lab) with your GitHub id.

1. Open the `Policy Designer` section.

1. Select the repository where you want to save your policies.

1. Create a new policy store named `JanssenReactCedarlingRBAC`.

## Step 2: Define Schema

1. Open the `Manage Policy Store` section by clicking the arrow link button on the store list.

1. Create an Entity called `Task`, which is our sample Resource.
   ![image](https://github.com/user-attachments/assets/f2401a63-b965-4134-af2d-7c79d83b4a39)

1. Once you add the Resource, you need to associate an action with it. Configure actions (`Add`, `Update`, `Delete`, `View`):

   - Set `Principal: User`
   - Set `Resources: Task`.

   ![image](https://github.com/user-attachments/assets/847a9de3-0bba-4823-9da2-d30559a4acbe)

## Step 3: Create Policies

1. Go to `Manage Policy Store > Policies > Add Policy > Text Editor`.

1. Copy policies one by one, add in text editor, and save.

   1. **Admin Policy** (full access):

      ```js
      @id("AdminPerformAnyOperationOnResource")
      permit(
        principal in Jans::Role::"admin",
        action,
        resource
      );
      ```

   2. **Manager Policy** (restricted access):

      ```js
      @id("ManagerCanAddUpdateViewTask")
      permit (
        principal in Jans::Role::"manager",
        action in [Jans::Action::"Add",
        Jans::Action::"Update",
        Jans::Action::"View"],
        resource is Jans::Task
      );
      ```

   3. **Member Policy** (view only):

      ```js
      @id("MemberCanOnlyViewTask")
      permit (
        principal in Jans::Role::"member",
        action in [Jans::Action::"View"],
        resource is Jans::Task
      );
      ```

# Setting up a React Application

## Step 1: Install the Cedarling WASM

```sh
npm install @janssenproject/cedarling_wasm
```

For **Vite.js**, update `vite.config.ts`:

```js
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@janssenproject/cedarling_wasm"],
  },
});
```

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
  private wasmModule: any = null;

  private constructor() {}

  static getInstance(): CedarlingClient {
    if (!CedarlingClient.instance) {
      CedarlingClient.instance = new CedarlingClient();
    }
    return CedarlingClient.instance;
  }

  async initialize(policyStoreConfig: any): Promise<void> {
    if (!this.initialized) {
      this.wasmModule = await initWasm();
      console.log("WASM initialized", this.wasmModule);
      this.cedarling = (await init(policyStoreConfig)) as unknown as Cedarling;
      this.initialized = true;
    }
  }

  async authorize(request: any): Promise<AuthorizeResult> {
    if (!this.cedarling || !this.initialized) {
      throw new Error("Cedarling not initialized");
    }
    try {
      const result = await this.cedarling.authorize(request);
      return result;
    } catch (error) {
      console.error("Error during authorization:", error);
      throw error;
    }
  }
}

export const cedarlingClient = CedarlingClient.getInstance();
```

## Step 4: Initialize Cedarling

We are globally initializing the Cedarling object. You can add it to your app's startup files. Like in the ViteJS case, you can add it in `App.tsx`, and in the Next JS case, you can add it in `src/layout.tsx`.

```js
useEffect(() => {
  cedarlingClient.initialize(cedarlingBootstrapProperties).catch(console.error);
}, []);
```

## Step 5: React Hook for Authorization

This Reack hook provides authorization functionality using the Cedarling client, with the ability to enforce authorization checks when enabled through environment variables. The hook manages loading and error states while processing authorization requests, and returns a boolean or AuthorizeResult indicating whether the authorization was successful.

```js
import { useCallback, useState } from "react";
import { cedarlingClient } from "./cedarlingUtils";
import { parseJwt } from "./parseJWT";
import { AuthorizeResult } from "@janssenproject/cedarling_wasm";

export function useCedarling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const authorize = useCallback(
    async (request: any): Promise<AuthorizeResult> => {
      setIsLoading(true);
      setError(null);
      try {
        // debug logs
        console.log("Enforcing Cedarling authorization");
        console.log("Request: ", request);
        console.log("Decoded idToken: ", parseJwt(request.tokens.id_token as string));
        console.log("Decoded accessToken: ",parseJwt(request.tokens.access_token as string));
        // userinfo token case
        // console.log('Decoded userInfo: ', parseJwt(request.tokens.userinfo_token as string))
        return await cedarlingClient.authorize(request);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Authorization failed");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );
  return { authorize, isLoading, error };
}
```

## Step 6: Protect Actions and Components

Use React Hooks to protect actions and components. Your ID Token should have a `role` claim. It can be one value like `role: admin` or an array like `role: ["admin", "manager"]`, both are valid. Check the [Cedarling entities document](https://docs.jans.io/head/cedarling/cedarling-entities/) for more details about role entity creation and usage.

Below is an example of Task React Page:

```js
import { useCedarling } from "@/factories/useCedarling";
import { AuthorizeResult } from "@janssenproject/cedarling_wasm";

export default function TasksPage() {
  const { authorize } = useCedarling();

  const cedarlingRequest = async (action: string) => {
    const idToken = "<your_id_token>";
    const accessToken = "<your_access_token>";

    const request = {
      tokens: {
        access_token: accessToken,
        id_token: idToken,
      },
      action: `Jans::Action::"${action}"`,
      resource: {
        type: "Jans::Task",
        id: "App",
        app_id: "App",
        name: "App",
        url: {
          host: "jans.test",
          path: "/",
          protocol: "http",
        },
      },
      context: {},
    };

    const result: AuthorizeResult = await authorize(request);
    return result;
  };

  const handleAdd = async () => {
    try {
      const result = await cedarlingRequest("Add");
      console.log(result);
      if (result.decision) {
        alert("Successfully added!");
      } else {
        alert("You are not allowed to add new Task!");
      }
    } catch (e) {
      alert("You are not allowed to add new Task!");
      console.log(e);
    }
  };
}

<button className="btn btn-primary mb-3" onClick={handleAdd}>
  <FaPlus className="me-2" />
  Add Task
</button>;
```

In the above example, there are 2 things:

- First, we make a function `cedarlingRequest` which accepts an action and helps us to make an authorization request to the Cedarling WASM with Access Token and ID Token. Your ID Token should have a Role claim, and if you don't have a role, then you need to change the policy, which will act like ABAC.

- Second, we have the `handleAdd` function, which helps us to request and check the authorization for the `Add` operation. In response, it returns a result where we get which policy is responsible for authorization, timestamp, and decision. Below is an example of the result. Use `result.decision` to authorize the request and show/hide elements.

```json
{
  "id": "0196118a-ce6e-74c8-9c25-5da154aa8b90",
  "request_id": "0196118a-ce6a-7653-b64c-e5fb9722c1d1",
  "timestamp": "2025-04-08T00:07:11.662Z",
  "log_kind": "Decision",
  "policystore_id": "87d2c8877a2455a16149c55d956565e1d18ac81ba10a",
  "policystore_version": "undefined",
  "principal": ["User"],
  "User": {},
  "diagnostics": {
    "reason": [
      {
        "id": "6b51f8244fe1fc3b273733f9d93def7f07080367fbc1",
        "description": "ManagerCanAddUpdateViewTask"
      }
    ],
    "errors": []
  },
  "action": "Jans::Action::\"Add\"",
  "resource": "Jans::Task::\"App\"",
  "decision": "ALLOW",
  "tokens": {
    "id_token": {
      "jti": "J4TB2NsgTZOBtPTYTzHtmg"
    },
    "access_token": {
      "jti": "hNhnQW18RA2AIOh5ihOfTQ"
    }
  },
  "decision_time_micro_sec": 3000,
  "pdp_id": "bbcf165b-1b7b-452a-af46-b9dbf3ae7cf0",
  "application_id": "AgamaLab"
}
```

Like we handled the `Add` action, you can handle other actions and show hide components.

## Step 7: Protecting UI Components

This `ProtectedSection` component is a React wrapper that controls access to UI components based on user authorization. It takes a resource ID and optional action ID, checks if the user has permission to access that resource using Cedar authorization, and either displays the protected content (children) if authorized or shows a fallback component (typically an error message) if access is denied.

```js
import { useCedarling } from "@/factories/useCedarling";
import React from "react";

export function ProtectedSection({
  accessToken,
  idToken,
  actionId,
  resourceId,
  children,
  fallback = (
    <div>
      <div>Access Denied</div>
      {`Please contact your administrator.`}
    </div>
  ),
  loadingFallback = <div>Loading...</div>,
}: ProtectedSectionProps) {
  const { authorize, isLoading, error } = useCedarling();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    const checkAuthorization = async () => {
      const request = {
        tokens: {
          access_token: accessToken,
          id_token: idToken,
        },
        action: `Jans::Action::"${actionId}"`,
        resource: { type: "Jans::Task", id: resourceId, name: resourceId },
        context: {},
      };
      try {
        const result = await authorize(request);
        setIsAuthorized(result.decision);
      } catch (err: any) {
        setIsAuthorized(false);
      }
    };
    checkAuthorization();
  }, [accessToken, idToken, authorize, actionId, resourceId]);

  if (isLoading) return <>{loadingFallback}</>;
  if (error) return <div>Error: {error?.message}</div>;
  if (!isAuthorized) return <>{fallback}</>;
  return <>{children}</>;
}
```

Use `ProtectedSection` to protect any elements. Your ID Token should have a `role` claim. It can be one value like `role: admin` or an array like `role: ["admin", "manager", "member"]`, both are valid. Check the [Cedarling entities document](https://docs.jans.io/head/cedarling/cedarling-entities/) for more details about role entity creation and usage.

```js
<ProtectedSection
  accessToken={accessToken}
  idToken={idToken}
  resourceId="App"
  actionId="Delete"
>
  <h1>Welcome, permission granted!</h1>
</ProtectedSection>
```

# Test Cases

## Admin Authorization

Let's log in as an admin user and check the authorization. As per the above authorization policies, admins can access any resource. As you can see in the video below, Sachin is an admin user, and he has the `admin` role in ID Token.

🟢 Admin can `Add` a task

🟢 Admin can `Update` a task

🟢 Admin can `Delete` a task

🟢 Admin can `view` a task

[admin-access.webm](https://github.com/user-attachments/assets/b8ee141c-a195-404a-806c-412988649ad8)

## Manager Authorization

Log in with a `manager` role user and check the authorization. As per our authorization policies, a manager cannot perform the `Delete` action.

🟢 Manager can `Add` a task

🟢 Manager can `Update` a task

🟢 Manager can `view` a task

🔴 Manager cannot `Delete` a task

[manager-access.webm](https://github.com/user-attachments/assets/5df3c209-980d-4ebd-910f-b24b8db29e55)

## Member Authorization

Log in with a `member` role user and check the authorization. As per our authorization policies, members can only `view` tasks.

🟢 Member can `view` a task

🔴 Member cannot `Add` a task

🔴 Member cannot `Update` a task

🔴 Member cannot `view` a task

[member-access.webm](https://github.com/user-attachments/assets/b305bb92-df36-4344-94ec-9a994fb226f5)

# Key Takeaways

- The **Janssen Cedarling** provides **fine-grained RBAC** for React apps.

- Easy to protect components and limit user access. Use **ProtectedSection** to restrict UI elements.

- Policy management is centralized via **Agama Lab**.

For a complete implementation, reference the:

- [Next JS Demo project](https://github.com/GluuFederation/tutorials/tree/master/cedarling/react/next-js-cedarling)
- [Policy Store](https://github.com/GluuFederation/tutorials/blob/master/cedarling/react/next-js-cedarling-policy-store/87d2c8877a2455a16149c55d956565e1d18ac81ba10a.json).
