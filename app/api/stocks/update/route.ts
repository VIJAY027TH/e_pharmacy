import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { id, name, type, quantity } = await req.json();

  const db = await getDB();

  // Prevent duplicate insert
  await db.run(
    "INSERT INTO stocks (name, type, quantity) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE name = ? AND type = ?)",
    [name, type, quantity, name, type]
  );

  // Remove from orders
  await db.run(
    "DELETE FROM orders WHERE id = ?",
    [id]
  );

  return Response.json({ message: "Moved to stock" });
}