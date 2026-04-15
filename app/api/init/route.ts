import { getDB } from "@/lib/db";

export async function GET() {
  const db = await getDB();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  return Response.json({ message: "Table created" });
}