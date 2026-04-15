"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../dashboard/dashboard.css";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(storedUser);

    // 🔥 fetch orders
    fetch("/api/orders/get")
      .then((res) => res.json())
      .then((data) => {
        // show only current user orders
        const myOrders = data.filter(
          (item: any) => item.user === storedUser
        );
        setOrders(myOrders);
      });
  }, [router]);

  return (
    <div className="container">
      <h1 className="title">My Orders</h1>

      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        <div className="cardContainer">
          {orders.map((item) => (
            <div key={item.id} className="card">
              <h3>{item.name}</h3>
              <p>Type: {item.type}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}