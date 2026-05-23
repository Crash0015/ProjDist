import dotenv from "dotenv";

import { initDb } from "./lib/db.js";
import { runMigrations } from "./lib/migrate.js";
import { buildApp } from "./app.js";

dotenv.config();

const port = Number(process.env.PORT) || 4000;
const webUrl = process.env.WEB_URL || "http://localhost:5173";
const app = buildApp({ webUrl });

await initDb();
await runMigrations();

app.listen(port, () => {
  console.log(`api listening on ${port}`);
});
