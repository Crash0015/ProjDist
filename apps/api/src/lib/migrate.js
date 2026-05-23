import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSql(fileName) {
  const filePath = path.join(__dirname, "..", "db", fileName);
  const sql = await fs.readFile(filePath, "utf-8");
  await getPool().query(sql);
}

export async function runMigrations() {
  await runSql("schema.sql");
  if (process.env.AUTO_SEED === "true") {
    await runSql("seed.sql");
  }
}
