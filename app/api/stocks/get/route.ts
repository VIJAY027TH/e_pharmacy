import { getDB } from "@/lib/db";

export function GET() {
  try {
   const db: any = getDB();

    const stocks = db
      .prepare("SELECT * FROM stocks")
      .all();

    return Response.json(stocks);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "DB error" }, { status: 500 });
  }
}