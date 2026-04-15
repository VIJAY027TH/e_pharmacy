import { getDB } from "@/lib/db";

export async function GET() {
  const db = await getDB();

  const users = await db.all("SELECT name, email FROM users WHERE role = 'user'");

  return Response.json(users);
}