"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./leoo.css";

export default function ProductsPage() {
  const router = useRouter();

  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [qtyMap, setQtyMap] = useState<any>({});

  const fetchData = async () => {
    const res = await fetch("/api/stocks/get");
    const data = await res.json();
    setStocks(data);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // auto refresh
    return () => clearInterval(interval);
  }, []);

  const types = ["Medicine", "Beauty Product", "Medical Equipment", "Healthy Snacks"];

  const filtered = stocks.filter(item => item.type === selectedType);

  const handleQtyChange = (id: number, value: number) => {
    setQtyMap({ ...qtyMap, [id]: value });
  };

  const addToCart = (item: any) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart ✅");
  };

  return (
    <div className="container">
      <h1 className="title">Browse Products</h1>

      {/* TYPES */}
      <div className="cardContainer">
        {types.map(type => (
          <div key={type} className="card" onClick={() => setSelectedType(type)}>
            <h3>{type}</h3>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      {selectedType && (
        <div style={{ marginTop: "30px" }}>
          <h2>{selectedType}</h2>

          {filtered.length === 0 ? (
            <p>No items found</p>
          ) : (
            <div className="cardContainer">
              {filtered.map(item => {
                const isOutOfStock = item.quantity <= 0;

                return (
                  <div key={item.id} className="card">
                    <h3>{item.name}</h3>

                    {isOutOfStock
                      ? <p style={{ color: "red", fontWeight: "bold" }}>Out of Stock 🔴</p>
                      : <p>Stock: {item.quantity}</p>}

                    <input
                      type="number"
                      min="1"
                      max={item.quantity}
                      placeholder="Qty"
                      disabled={isOutOfStock}
                      value={qtyMap[item.id] || ""}
                      onChange={e => handleQtyChange(item.id, Number(e.target.value))}
                    />

                    <button disabled={isOutOfStock} 
                      onClick={() => addToCart({ ...item, orderQty: qtyMap[item.id] || 1 })}
                    >
                      {isOutOfStock ? "Unavailable ❌" : "Add to Cart"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}