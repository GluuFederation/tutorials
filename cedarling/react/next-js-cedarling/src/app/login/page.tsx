// app/login/page.js
"use client";

import { makeUserAuthentication } from "@/factories/makeUserAuthentication";
import { parseJwt } from "@/factories/parseJWT";
import { useRouter } from "next/navigation";
import { User } from "oidc-client-ts";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAtom } from "jotai";
import { accountAtom } from "@/factories/atoms";

export default function LoginPage() {
  const auth = makeUserAuthentication();
  const loginPrompt = useRef<undefined | string>(undefined);
  const router = useRouter();
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const [account, setAccount] = useAtom(accountAtom);

  const login = async () => {
    try {
      return auth.signinRedirect(loginPrompt.current);
    } catch (e) {
      console.error(e);
    }
  };

  async function checkCodeAndGetToken() {
    try {
      // validate code
      await auth.verifyCodeAndGetAccessToken();

      const user = (await auth.getUser()) as User;
      const decoded_id_token = parseJwt(user.id_token as string);
      console.log(decoded_id_token);
      setAccount({
        ...account,
        isAuthenticate: true,
        email: decoded_id_token.email,
        name: decoded_id_token.name,
        roles: decoded_id_token.role,
        userId: decoded_id_token.sub,
      });
      return router.push("/dashboard");
    } catch (e) {
      console.error("Failed to authenticate!", e);
    }
  }

  useEffect(() => {
    if (error) {
      return () => undefined;
    }
    const code = searchParams?.get("code");
    const errorDescription = searchParams?.get("error_description");
    if (code) {
      checkCodeAndGetToken();
    } else if (errorDescription) {
      setError(errorDescription);
      loginPrompt.current = "login";
    }
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Login</h2>
        <button type="button" onClick={login} className="btn btn-success w-100">
          Login With Jans
        </button>
      </div>
    </div>
  );
}
