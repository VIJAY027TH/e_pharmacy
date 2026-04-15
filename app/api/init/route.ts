import { getDB } from "@/lib/db";

export function GET() {
  const db: any = getDB();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT
    )
  `);

  return Response.json({ message: "Table created" });
}