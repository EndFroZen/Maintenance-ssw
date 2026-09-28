import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";

mkdirSync("data", { recursive: true });
const db = new DatabaseSync("data/scores.db");
db.exec(`CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);

const top = () =>
  db
    .prepare(
      "SELECT name, MAX(score) AS score FROM scores GROUP BY name ORDER BY score DESC LIMIT 10",
    )
    .all();

export function GET() {
  return Response.json(top());
}

// ponytail: trusts the client-reported score; add server-side move replay if cheating matters
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 30) : "";
  const score = body?.score;
  if (!name || !Number.isInteger(score) || score < 0 || score > 1_000_000) {
    return Response.json({ error: "invalid name or score" }, { status: 400 });
  }
  db.prepare("INSERT INTO scores (name, score) VALUES (?, ?)").run(name, score);
  return Response.json(top());
}
