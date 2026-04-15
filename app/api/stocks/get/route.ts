import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();

    const stocks = await db.all("SELECT * FROM stocks");

    return Response.json(stocks);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "DB error" }, { status: 500 });
  }
}