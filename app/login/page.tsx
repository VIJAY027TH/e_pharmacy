"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", //  IMPORTANT
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    //  store session
    localStorage.setItem("user", data.email);
    localStorage.setItem("role", data.role);

    //  redirect
    if (data.role === "admin") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="container">
      <div className="card">
    
        <h2 className="title">💊 E-Pharmacy</h2>
      <p style={{ color: "#aaa", marginBottom: "15px" }}>Secure Login</p>

        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="button">
            Sign In
          </button>
        </form>

       {/*  <p style={{ fontSize: "12px" }}>
          Admin: admin@gmail.com / admin123
        </p> */}

        <p className="footer">
          Don’t have an account?{" "}
          <a href="/signup" className="link">
  Sign up
</a>
        </p>
      </div>
    </div>
  );
}