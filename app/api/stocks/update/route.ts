import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { id, name, type, quantity } = await req.json();

const db: any = getDB();

  // Prevent duplicate insert
  db.prepare(
    "INSERT INTO stocks (name, type, quantity) SELECT ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM stocks WHERE name = ? AND type = ?)"
  ).run(name, type, quantity, name, type);

  // Remove from orders
  db.prepare(
    "DELETE FROM orders WHERE id = ?"
  ).run(id);

  return Response.json({ message: "Moved to stock" });
}