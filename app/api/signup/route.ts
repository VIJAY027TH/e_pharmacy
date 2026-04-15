import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const db = await getDB();

  // check duplicate
  const existing = await db.get(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existing) {
    return Response.json({ error: "User already exists" });
  }

  // insert user
  await db.run(
  "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
  [name, email, password]
);

  return Response.json({ message: "User created" });
}