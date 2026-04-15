import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { type, name, quantity } = await req.json();

  const db = await getDB();

  // Step 1: Add to Pending (orders table)
  await db.run(
  "INSERT INTO orders (name, type, quantity, user, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  [name, type, quantity, "admin", "Pending", Date.now()]
);

  const insertedId = result.lastID;

  return Response.json({ message: "Stock will be added in 30 sec" });
}