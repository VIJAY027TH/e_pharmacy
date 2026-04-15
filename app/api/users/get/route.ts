import { getDB } from "@/lib/db";

export function GET() {
  const db = getDB();

  const users = db
    .prepare("SELECT name, email FROM users WHERE role = 'user'")
    .all();

  return Response.json(users);
}