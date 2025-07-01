// app/page.js
import Link from "next/link";

export default function Home() {
  return (
    <div className="container text-center mt-5">
      <h1>Welcome to Next JS App</h1>
      <Link href="/login" className="btn btn-success mt-3">
        Go to Login Page
      </Link>
    </div>
  );
}
