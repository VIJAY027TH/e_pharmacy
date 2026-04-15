import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const db = getDB();

  // check duplicate
  const existing = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  if (existing) {
    return Response.json({ error: "User already exists" });
  }

  // insert user
  db.prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
  ).run(name, email, password);

  return Response.json({ message: "User created" });
}