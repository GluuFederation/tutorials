# React JS Cedarling integration

This guide documents the implementation of UI element access protection in **React JS** Application using [Jans Cedarling WASM](https://github.com/JanssenProject/jans/blob/main/docs/cedarling/cedarling-overview.md). The integration provides granular control over UI component visibility based on user authorization policies.

## Install dependency

```sh
$ npm install @janssenproject/cedarling_wasm
```

For vitejs, you may need to configure your `vite.config.ts`:

```js
optimizeDeps: {
  exclude: ['@janssenproject/cedarling_wasm'],
}
```

## Setup Policy Store

We need a policy store (eg. `AgamaLabStore`) to store the policies. Below a simple policy for the use case. It is simple because the idea is just to handle UI Elements visibility depending on the authenticated user.

- Use [Agama Lab UI Tool](https://cloud.gluu.org/agama-lab) to create policy store.
- Create policy store `AgamaLabStore`.
- Go to `Policies > Add Policy > Text Editor`. Copy below policy and add in text editor.
- Click on `Save` to add policy.

```js
@id("AdminPerformAnyOperationOnResource")
permit(
  principal in Jans::Role::"admin",
  action,
  resource
);
```

- Add Trusted Issuer
- Copy and past below json into Token Metadata. Find properties details [here](https://github.com/JanssenProject/jans/blob/main/docs/cedarling/cedarling-properties.md).

```js
{
  "access_token": {
    "trusted": true,
    "entity_type_name": "Jans::Access_token",
    "user_id": "sub",
    "token_id": "jti",
    "workload_id": "client_id",
    "claim_mapping": {},
    "required_claims": [],
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

- Click on `Save` to save trusted issuer.

## Configure Cedarling Bootstrap

Create React App. You can use any framework. Create a configuration object with the following parameters:

```js
const cedarlingBootstrapProperties = {
  CEDARLING_APPLICATION_NAME: "AgamaLab",
  CEDARLING_POLICY_STORE_URI: "<your_policy_store_url>",
  CEDARLING_POLICY_STORE_ID: "<your_policy_store_id>",
  CEDARLING_USER_AUTHZ: "enabled",
  CEDARLING_WORKLOAD_AUTHZ: "disabled",
  CEDARLING_LOG_TYPE: "std_out",
  CEDARLING_LOG_LEVEL: "TRACE",
  CEDARLING_LOG_TTL: 120,
  CEDARLING_PRINCIPAL_BOOLEAN_OPERATION: {
    or: [
      { "===": [{ var: "Jans::Workload" }, "ALLOW"] },
      { "===": [{ var: "Jans::User" }, "ALLOW"] },
    ],
  },
};
```

`CEDARLING_POLICY_STORE_URI` is the URI of the store containing the policies. Copy it from Agama Lab.

## Create a CedarlingClient Class

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

## Initialize Cedarling

We are globally initializing cedarling object. You can add it in your app started files. Like in ViteJS case, you can add it in `App.tsx` and In Next JS case, you can add it in `src/layout.tsx`.

```js
useEffect(() => {
  cedarlingClient.initialize(cedarlingBootstrapProperties).catch(console.error);
}, []);
```

## Create a React hook

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

## Designing high order component that will make protecting UI components easy

## Protected Section

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
        resource: { type: "Jans::Application", id: resourceId, name: resourceId },
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

Use `ProtectedSection` to protect any elements. Your ID Token should have `role` claim. it can be one value like `role: admin` or array like `role: ["admin", "manager"]`, both are valid. Check [Cedarling entities document](https://github.com/JanssenProject/jans/blob/main/docs/cedarling/cedarling-entities.md#role-entity) for more details about role entity creation and usage.

```js
<ProtectedSection
  accessToken={accessToken}
  idToken={idToken}
  resourceId="App"
  actionId="Read"
>
  <h1>Welcome, permission granted!</h1>
</ProtectedSection>
```

## Protected Button

This `ProtectedButton` component is a React wrapper that controls the visibility of its child elements based on user authorization permissions. It checks if the user has the required permissions for a specific action and resource using Cedar authorization, only rendering its children if the user is authorized, otherwise showing nothing or a loading state.

```js
import { useCedarling } from "@/factories/useCedarling";
import React from "react";

function ProtectedButton({
  accessToken,
  idToken,
  actionId,
  resourceId,
  children,
  loadingFallback = <div>Loading...</div>,
}: any) {
  const { authorize, isLoading, error } = useCedarling();
  const [isAuthorized, setIsAuthorized] = React.useState(false);

  React.useEffect(() => {
    const checkAuthorization = async () => {
      const accessToken = await userAuthentication.getAccessToken();
      const idToken = await userAuthentication.getIdToken();
      const userInfo = await userAuthentication.getUserInfoToken();
      const request = {
        tokens: {
          access_token: accessToken,
          id_token: idToken,
        },
        action: `Jans::Action::"${actionId}"`,
        resource: {
          type: "Jans::Application",
          id: resourceId,
          name: resourceId,
        },
        context: {},
      };
      try {
        const result = await authorize(request);
        setIsAuthorized(result.decision);
      } catch (err) {
        setIsAuthorized(false);
      }
    };
    checkAuthorization();
  }, [authorize, actionId, resourceId]);
  if (isLoading) return <>{loadingFallback}</>;
  if (error) return <></>;
  if (!isAuthorized) return <></>;
  return <>{children}</>;
}

export default ProtectedButton;
```

Use `ProtectedButton` to protect any elements. Your ID Token should have `role` claim. it can be one value like `role: admin` or array like `role: ["admin", "manager"]`, both are valid.

```js
<ProtectedButton
  accessToken={accessToken}
  idToken={idToken}
  resourceId="App"
  actionId="Read"
>
  <Button type='submit' title='Save code'>
   Save
  </Button>
</ProtectedSection>
```
