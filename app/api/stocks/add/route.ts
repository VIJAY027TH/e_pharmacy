import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { type, name, quantity } = await req.json();

  const db = getDB();

  // Insert stock directly
  db.prepare(
    "INSERT INTO stocks (type, name, quantity) VALUES (?, ?, ?)"
  ).run(type, name, quantity);

  return Response.json({ message: "Stock added successfully" });
}