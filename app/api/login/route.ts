import { getDB } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const db = getDB();

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND password = ?")
    .get(email, password);

  if (!user) {
    return Response.json({ error: "Invalid credentials" });
  }

  return Response.json({
    email: user.email,
    role: user.role,
  });
}