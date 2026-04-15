"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(storedUser);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="container">

      {/* 🔥 Logout moved OUTSIDE header */}
      <button className="logoutBtn" onClick={handleLogout}>
        Logout
      </button>

      {/* Header */}
      <div className="header">
        <h1 className="title">Dashboard</h1>
      </div>

      {/* Welcome */}
      <h2 className="welcome">Welcome, {user}</h2>

      {/* Cards */}
      <div className="cardContainer">
        <div className="card" onClick={() => router.push("/products")}>
          <h3>💊 Medicines</h3>
          <p>Browse and buy medicines</p>
        </div>

        <div className="card" onClick={() => router.push("/cart")}>
          <h3>🧺 Cart</h3>
          <p>View your selected items</p>
        </div>

        <div className="card" onClick={() => router.push("/orders")}>
          <h3>📦 Orders</h3>
          <p>Track your orders</p>
        </div>

        
      </div>
    </div>
  );
}