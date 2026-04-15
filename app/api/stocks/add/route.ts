import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { type, name, quantity } = await req.json();

  const db = await getDB();

  // Step 1: Add to Pending (orders table)
  const result = await db.run(
  "INSERT INTO stocks (type, name, quantity) VALUES (?, ?, ?)",
  [type, name, quantity]
);

const insertedId = result.lastID;

  return Response.json({ message: "Stock will be added in 30 sec" });
}