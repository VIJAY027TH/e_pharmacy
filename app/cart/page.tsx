"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./dashboard.css";

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(data);
  }, []);

  const removeItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const placeOrder = async () => {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const user = localStorage.getItem("user");

  for (let item of cart) {
    await fetch("/api/orders/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: item.name,
        type: item.type,
        quantity: item.orderQty,
        user: user,
      }),
    });
  }

  localStorage.removeItem("cart");

  alert("Order placed successfully 🚀");

  router.push("/orders"); // 👈 go to orders page
};

  return (
    <div className="container">
      <h1 className="title">Your Cart</h1>

      {cart.length === 0 ? (
        <p>No items in cart</p>
      ) : (
        <div className="cardContainer">
          {cart.map((item, index) => (
            <div key={index} className="card">
              <h3>{item.name}</h3>
              <p>Type: {item.type}</p>
                <p>Quantity: {item.orderQty}</p>

              <button onClick={() => removeItem(index)}>
                Remove ❌
              </button>
            </div>
          ))}
        </div>  
      )}

      <button className="placeOrderBtn" onClick={placeOrder}>
        Place Order 🚀
      </button>
      
      

    </div>
  );
}