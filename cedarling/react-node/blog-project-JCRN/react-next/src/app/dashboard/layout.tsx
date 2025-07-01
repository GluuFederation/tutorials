"use client";
import { accountAtom } from "@/factories/atoms";
import { makeUserAuthentication } from "@/factories/makeUserAuthentication";
import { useAtom } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const auth = makeUserAuthentication();
  const [user] = useAtom(accountAtom);
  const router = useRouter();

  const logout = () => {
    auth.signoutRedirect();
  };

  useEffect(() => {
    if (!user.email) {
      router.push("/login");
    }
  }, [router, user.email]);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 bg-light vh-100 p-3">
          <h2 className="mb-4">Next JS</h2>
          <h4 className="mb-4">{user.email}</h4>
          <h6 className="mb-4">{user.roles && user.roles.map((r) => r)}</h6>
          <ul className="nav flex-column">
            <li className="nav-item">
              <Link href="/dashboard/tasks" className="nav-link">
                Tasks
              </Link>
            </li>
            <li className="nav-item">
              <button onClick={logout} className="nav-link">
                Logout
              </button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="col-md-10 p-4">{children}</div>
      </div>
    </div>
  );
}
