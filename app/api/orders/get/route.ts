import { getDB } from "@/lib/db";

export async function GET() {
  const db = await getDB();

  const orders = await db.all("SELECT * FROM orders");

  return Response.json(orders);
}