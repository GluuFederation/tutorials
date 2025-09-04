// app/login/page.js
"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { accountAtom } from "@/factories/atoms";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [account, setAccount] = useAtom(accountAtom);

  const login = async () => {
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`;
      return;
    } catch (e) {
      console.error(e);
    }
  };

  const checkUser = async () => {
    try {
      // const redirectUrl: any = getRedirectUrl();
      const response: any = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/user/me`
      );

      console.log("User created:", response.data);
      const decoded_id_token = response.data;

      setAccount({
        ...account,
        isAuthenticate: true,
        email: decoded_id_token.email,
        name: decoded_id_token.name,
        roles: decoded_id_token.role,
        userId: decoded_id_token.id,
        plan: decoded_id_token.plan,
      });

      return router.push("/dashboard");
    } catch (err) {
      console.error("Backend token exchange failed:", err);
      login();
    }
  };

  useEffect(() => {
    if (!error) {
      checkUser();
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
