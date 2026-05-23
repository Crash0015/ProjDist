import express from "express";
import { z } from "zod";
import { getPool } from "../lib/db.js";
import { requireAuth } from "../middleware/auth.js";

export const ordersRouter = express.Router();

const createOrderSchema = z.object({
  eventId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(5)
});

ordersRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { eventId, quantity } = createOrderSchema.parse(req.body);
    const pool = getPool();
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const eventResult = await client.query(
        "SELECT id, price, available FROM events WHERE id = $1 FOR UPDATE",
        [eventId]
      );
      const event = eventResult.rows[0];
      if (!event) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Event not found" });
      }
      if (event.available < quantity) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: "Not enough tickets" });
      }
      const total = Number(event.price) * quantity;
      const orderResult = await client.query(
        "INSERT INTO orders (user_id, event_id, quantity, total) VALUES ($1, $2, $3, $4) RETURNING id",
        [req.user.id, event.id, quantity, total]
      );
      await client.query(
        "UPDATE events SET available = available - $1 WHERE id = $2",
        [quantity, event.id]
      );
      await client.query(
        "INSERT INTO payments (order_id, status, provider) VALUES ($1, $2, $3)",
        [orderResult.rows[0].id, "paid", "demo"]
      );
      await client.query("COMMIT");
      return res.json({ orderId: orderResult.rows[0].id, total });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    return next(err);
  }
});

ordersRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await getPool().query(
      "SELECT id, event_id, quantity, total, created_at FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ orders: result.rows });
  } catch (err) {
    next(err);
  }
});
