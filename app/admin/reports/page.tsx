"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function ReportsPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<any[]>([]);

useEffect(() => {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    router.push("/login");
  }

  fetch("/api/orders/get")
    .then(res => res.json())
    .then(async (data) => {
      const now = Date.now();

      const pending = [];

      for (let item of data) {
        const diff = now - item.created_at;

        // If 30 sec passed → move to stocks
        if (
          diff >= 3000 &&
          item.user === "admin" &&
          item.status === "Pending"
           ) {
          await fetch("/api/stocks/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });
        } else if (item.user === "admin" && item.status === "Pending") {
          pending.push(item);
        }
      }

      setStocks(pending);
    });
}, [router]);

  const types = [
    "Medicine",
    "Beauty Product",
    "Medical Equipment",
    "Healthy Snacks"
  ];

  return (
    <div className="container">
      <h1 className="title">Reports</h1>

      {types.map((type) => {
        const items = stocks.filter((item) => item.type === type);

        if (items.length === 0) return null;

        <p style={{ marginTop: "10px", color: "#aaa" }}>
  ⏱ Stock will arrive in 30 sec
</p>

        return (
          <div key={type} className="dataBox">
            <h2>{type}</h2>

            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {item.name} ({item.quantity})
                </li>
              ))}
            </ul>

            <p style={{ marginTop: "10px", color: "#aaa" }}>
  ⏱ Stock will arrive in 30 sec
</p>
          </div>
        );
      })}
    </div>
  );
}