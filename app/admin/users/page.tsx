"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../admin.css";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (role !== "admin") {
      router.push("/login");
    }

    fetch("/api/users/get")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, [router]);

  return (
    <div className="container">
      <h1 className="title">Registered Users</h1>

      <div className="dataBox">
        {users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <table style={{ width: "400px" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={index}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}