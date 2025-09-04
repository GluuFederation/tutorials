// app/page.js
import Link from "next/link";

export default function Home() {
  return (
    <div className="container text-center mt-5">
      <h1>Medium</h1>
      <h6>Write your article!!!</h6>
      <Link href="/login" className="btn btn-success mt-3">
        Go to Login Page
      </Link>
    </div>
  );
}
