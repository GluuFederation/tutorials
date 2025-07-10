import { useCedarling } from "@/factories/useCedarling";
import React from "react";

interface ProtectedSectionProps {
  accessToken: string;
  idToken: string;
  actionId?: string;
  resourceId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

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
      } catch (err) {
        console.error("ProtectedSection error:", err);
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
