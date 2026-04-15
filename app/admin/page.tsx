"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function AdminPage() {
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    type: "",
    name: "",
    quantity: ""
  });

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    router.push("/login");
  };

const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  if (name === "type") {
    setForm({ ...form, type: value, name: "" });
  } else {
    setForm({ ...form, [name]: value });
  }
};

const handleSave = async () => {
  if (!form.type || !form.name || !form.quantity) {
    alert("Fill all fields");
    return;
  }

  await fetch("/api/stocks/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  setShowModal(false);

  router.push("/admin/reports");
};


  const medicineData: any = {
  "Medicine": ["Dolo 650 (₹5)", "Paracetamol (₹4)", "Aspirin(₹7)", "Amoxicillin (₹10)"],
  "Beauty Product": ["Face Wash (₹50/100gm)", "Shampoo (₹80/100gm)", "Body Lotion (₹150/100gm)", "Sunscreen(₹60/100gm)"],
  "Medical Equipment": ["Thermometer (₹500)", "BP Monitor (₹390)", "Glucometer (₹450)", "Oximeter (₹650)"],
  "Healthy Snacks": ["Protein Bar (₹40/100gm)", "Oats (₹80/100gm)", "Dry Fruits(₹120/100gm)", "Energy Drink (₹50/100ml)"]
};

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h1 className="title">Admin Dashboard</h1>
        <button className="logoutBtn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Cards */}
      <div className="cardContainer">
        
        <div
          className="card"
          onClick={() => setShowModal(true)}
        >
          <h3>💊 Manage Medicines</h3>
          <p>Add & Edit Medicines</p>
        </div>

        <div
          className="card"
          onClick={() => router.push("/admin/orders")}
        >
          <h3>📦 Manage Orders</h3>
          <p>View User Orders</p>
        </div>

        <div
        className="card"
        onClick={() => router.push("/admin/users")}
        >
        

        <h3>👤 Manage Users</h3>
        <p>View User Details</p>
        </div>

        <div
        className="card"
        onClick={() => router.push("/admin/reports")}
        >
        <h3>📊 Reports</h3>
        <p>Order Delivery</p>
        </div>
        <div
        className="card"
        onClick={() => router.push("/admin/stock")}
        >
        <h3>💊 Medicine Availability</h3>
        <p>View And Manage Stock</p>
        </div>
        </div>

      {/* Modal */}
      {showModal && (
        <div className="modalOverlay">
          <div className="modalBox">
            <h3>Stock Details</h3>

            <select name="type" value={form.type} onChange={handleChange}>
              <option value="">Select Type</option>
              <option value="Medicine">Medicine</option>
              <option value="Beauty Product">Beauty Product</option>
              <option value="Medical Equipment">Medical Equipment</option>
              <option value="Healthy Snacks">Healthy Snacks</option>
            </select>

            <select name="name" value={form.name} onChange={handleChange}>
  <option value="">Select Item</option>

  {form.type &&
    medicineData[form.type]?.map((item: string, index: number) => (
      <option key={index} value={item}>
        {item}
      </option>
    ))}
</select>

            <input
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
            />

            <div style={{ marginTop: "10px" }}>
              <button onClick={handleSave}>Order</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>

            <button
  className="payBtn"
  onClick={() => alert("💳 Payment Gateway Coming Soon...")}
>
  Proceed to Payment 💳
</button>
          </div>
        </div>
      )}
    </div>
  );
}