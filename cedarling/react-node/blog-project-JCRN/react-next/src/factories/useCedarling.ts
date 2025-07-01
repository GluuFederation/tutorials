import { useCallback, useState } from "react";
import { cedarlingClient } from "./cedarlingUtils";
import { parseJwt } from "./parseJWT";
import { AuthorizeResult } from "@janssenproject/cedarling_wasm";

export function useCedarling() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const authorize = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (request: any): Promise<AuthorizeResult> => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Enforcing Cedarling authorization");
        console.log("Request: ", request);
        console.log(
          "Decoded idToken: ",
          parseJwt(request.tokens.id_token as string)
        );
        console.log(
          "Decoded accessToken: ",
          parseJwt(request.tokens.access_token as string)
        );
        return await cedarlingClient.authorize(request);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Authorization failed");
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
