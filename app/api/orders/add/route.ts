import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const db = await getDB();
  const body = await req.json();

  const { name, type, quantity, user } = body;

  // 1. SAVE ORDER with status + time 🔥
  await db.run(
    "INSERT INTO orders (name, type, quantity, user, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    [name, type, quantity, user, "Pending", Date.now()]
  );

  // 2. GET CURRENT STOCK
  const stock = await db.get(
    "SELECT * FROM stocks WHERE name = ? AND type = ?",
    [name, type]
  );

  if (stock) {
    const newQty = Math.max(0, stock.quantity - quantity);

    // 3. UPDATE STOCK (reduce immediately)
    await db.run(
      "UPDATE stocks SET quantity = ? WHERE id = ?",
      [newQty, stock.id]
    );
  }

  return NextResponse.json({
    message: "Order placed & stock updated",
  });
}