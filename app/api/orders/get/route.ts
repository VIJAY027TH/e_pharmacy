import { getDB } from "@/lib/db";

export function GET() {
  const db: any = getDB();

  const orders = db
    .prepare("SELECT * FROM orders")
    .all();

  return Response.json(orders);
}