"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./yuta.css";

export default function StockPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<any[]>([]);

  const loadData = async () => {
    const res = await fetch("/api/stocks/get");
    const data = await res.json();
    setStocks(data);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      router.push("/login");
    }

    loadData();
  }, [router]);

  return (
    <div className="container">
      <h1 className="title">Medicine Availability</h1>

      <table style={{ width: "600px", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {stocks.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}