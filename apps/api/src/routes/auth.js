import express from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPool } from "../lib/db.js";
import { signToken } from "../lib/auth.js";

export const authRouter = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const result = await getPool().query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hash]
    );
    const user = result.rows[0];
    const token = signToken({ id: user.id, email: user.email });
    res.json({ user, token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    return next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const attemptsResult = await getPool().query(
      "SELECT email, attempts, locked_until FROM login_attempts WHERE email = $1",
      [email]
    );
    const attemptsRow = attemptsResult.rows[0];
    if (attemptsRow?.locked_until && new Date(attemptsRow.locked_until) > new Date()) {
      return res.status(429).json({ error: "Cuenta bloqueada temporalmente" });
    }
    const result = await getPool().query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user) {
      const attempts = (attemptsRow?.attempts || 0) + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 10 * 60 * 1000) : null;
      await getPool().query(
        "INSERT INTO login_attempts (email, attempts, locked_until) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET attempts = $2, locked_until = $3, updated_at = NOW()",
        [email, attempts, lockedUntil]
      );
      return res.status(401).json({ error: "Credenciales invalidas" });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const attempts = (attemptsRow?.attempts || 0) + 1;
      const lockedUntil = attempts >= 5 ? new Date(Date.now() + 10 * 60 * 1000) : null;
      await getPool().query(
        "INSERT INTO login_attempts (email, attempts, locked_until) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET attempts = $2, locked_until = $3, updated_at = NOW()",
        [email, attempts, lockedUntil]
      );
      return res.status(401).json({ error: "Credenciales invalidas" });
    }
    await getPool().query(
      "INSERT INTO login_attempts (email, attempts, locked_until) VALUES ($1, 0, NULL) ON CONFLICT (email) DO UPDATE SET attempts = 0, locked_until = NULL, updated_at = NOW()",
      [email]
    );
    const token = signToken({ id: user.id, email: user.email });
    return res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    return next(err);
  }
});
