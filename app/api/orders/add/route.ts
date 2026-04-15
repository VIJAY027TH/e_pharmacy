import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const db = getDB();
  const body = await req.json();

  const { name, type, quantity, user } = body;

  // 1. SAVE ORDER
  db.prepare(
    "INSERT INTO orders (name, type, quantity, user, status, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(name, type, quantity, user, "Pending", Date.now());

  // 2. GET CURRENT STOCK
  const stock = db
    .prepare("SELECT * FROM stocks WHERE name = ? AND type = ?")
    .get(name, type);

  if (stock) {
    const newQty = Math.max(0, stock.quantity - quantity);

    // 3. UPDATE STOCK
    db.prepare(
      "UPDATE stocks SET quantity = ? WHERE id = ?"
    ).run(newQty, stock.id);
  }

  return NextResponse.json({
    message: "Order placed & stock updated",
  });
}