"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./signup.css";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      alert("Registration successful!");
      router.push("/login");
    }
  };

  return (
    <>
      

      <div className="container">
        <div className="card">
          <h2 className="title">💊 E-Pharmacy</h2>
          <p className="subtitle">Create your account</p>

          <form onSubmit={handleSignup} className="form">
            <input type="text" placeholder="Name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />

            <button type="submit" className="button">Create Account</button>
          </form>

          <p className="footer">
            Already have an account? <Link href="/login" className="link">Login</Link>
          </p>
        </div>
      </div>
    </>
  );
}