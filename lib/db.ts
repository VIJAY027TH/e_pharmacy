import Database from "better-sqlite3";
import bcrypt from "bcrypt";

let db: any = null;

export async function getDB() {
  if (db) return db;

  db = new Database("./database.sqlite");

  //  Auto create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password TEXT,
  role TEXT DEFAULT 'user'
)
  `);

  await db.exec(`
  CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    name TEXT,
    quantity INTEGER
  )
`);


await db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
   name TEXT NOT NULL,
    type TEXT,
    quantity INTEGER,
    user TEXT,
    status TEXT DEFAULT 'Pending',
    created_at INTEGER
  )
`);

  // Auto create admin if not exists
 const admin = await db.get(
  "SELECT * FROM users WHERE email = ?",
  ["admin@gmail.com"]
);

if (!admin) {
  await db.run(
    "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    ["admin@gmail.com", "admin123", "admin"]
  );
}

  return db;
}