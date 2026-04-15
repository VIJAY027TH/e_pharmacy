"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./new.css";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");

  // 🔥 fetch orders (NOT stocks)
  const loadData = async () => {
    const res = await fetch("/api/orders/get");
    const data = await res.json();

    console.log("ORDERS DATA:", data); // debug

    setOrders(data);
  };

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      router.push("/login");
    }

    loadData();
  }, [router]);

  const types = [
    "Medicine",
    "Beauty Product",
    "Medical Equipment",
    "Healthy Snacks"
  ];

  // 🔥 filter by type
  const filtered = orders.filter(
    (item) => item.type?.trim() === selectedType
  );

  return (
    <div className="container">
      <h1 className="title">Orders</h1>

      {/* Type Buttons */}
      <div className="cardContainer">
        {types.map((type) => (
          <div
            key={type}
            className="card"
            onClick={() => {
              console.log("Selected:", type);
              setSelectedType(type);
            }}
          >
            <h3>{type}</h3>
          </div>
        ))}
      </div>

      {/* Data */}
      {selectedType && (
        <div className="dataBox">
          <h2>{selectedType}</h2>

          {filtered.length === 0 ? (
            <p>No orders found</p>
          ) : (
            <table style={{ marginTop: "10px", width: "600px" }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>User</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{item.quantity}</td>
                    <td>{item.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}