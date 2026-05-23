import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import bcrypt from "bcryptjs";
import pg from "pg";

import { buildApp } from "../src/app.js";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackUrl = "postgres://ticket_user:ticket_pass@localhost:5432/ticketing";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackUrl;
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-secret";
}

const app = buildApp({ webUrl: "http://localhost:5173" });

function getPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL || fallbackUrl });
}

async function runSchema(pool) {
  const schemaPath = path.join(__dirname, "..", "src", "db", "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf-8");
  await pool.query(sql);
}

test.before(async () => {
  const pool = getPool();
  await runSchema(pool);
  await pool.end();
});

test("health endpoint", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.statusCode, 200);
});

test("lockout after 5 failed logins", async () => {
  const pool = getPool();
  await pool.query("DELETE FROM login_attempts");
  const email = `lock${Date.now()}@mail.com`;
  const hash = await bcrypt.hash("password123", 10);
  await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
    [email, hash]
  );

  for (let i = 0; i < 5; i += 1) {
    await request(app).post("/auth/login").send({ email, password: "wrongpw" });
  }

  const res = await request(app)
    .post("/auth/login")
    .send({ email, password: "wrongpw" });

  assert.equal(res.statusCode, 429);
  await pool.query("DELETE FROM users WHERE email = $1", [email]);
  await pool.end();
});

test("successful login resets attempts", async () => {
  const pool = getPool();
  await pool.query("DELETE FROM login_attempts");
  const email = `reset${Date.now()}@mail.com`;
  const hash = await bcrypt.hash("password123", 10);
  await pool.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2)",
    [email, hash]
  );

  await request(app).post("/auth/login").send({ email, password: "wrongpw" });
  await request(app)
    .post("/auth/login")
    .send({ email, password: "password123" });

  const res = await pool.query(
    "SELECT attempts, locked_until FROM login_attempts WHERE email = $1",
    [email]
  );
  assert.equal(res.rows[0].attempts, 0);
  assert.equal(res.rows[0].locked_until, null);
  await pool.query("DELETE FROM users WHERE email = $1", [email]);
  await pool.end();
});
