"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    localStorage.setItem("user", data.email);
    localStorage.setItem("role", data.role);

    if (data.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="card">

          <h2 className="title">💊 E-Pharmacy</h2>
          <p style={{ color: "#aaa", marginBottom: "15px" }}>
            Secure Login
          </p>

          <form onSubmit={handleLogin} className="form">
            <input
              type="email"
              placeholder="Email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="button">
              Sign In
            </button>
          </form>

          <p className="footer">
            Don’t have an account?{" "}
            <a href="/signup" className="link">
              Sign up
            </a>
          </p>

        </div>
      </div>
    </div>
  );
}