import Database from "better-sqlite3";

let db: any = null;

export function getDB() {
  if (db) return db;

  db = new Database("./database.sqlite");

  // CREATE TABLES
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'user'
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      name TEXT,
      quantity INTEGER
    )
  `);

  db.exec(`
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

  // CHECK ADMIN
  const admin = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get("admin@gmail.com");

  if (!admin) {
    db.prepare(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)"
    ).run("admin@gmail.com", "admin123", "admin");
  }

  return db;
}