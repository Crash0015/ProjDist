import express from "express";
import { getPool } from "../lib/db.js";

export const eventsRouter = express.Router();

eventsRouter.get("/", async (req, res, next) => {
  try {
    const result = await getPool().query(
      "SELECT id, title, city, date, price, available FROM events ORDER BY date ASC"
    );
    res.json({ events: result.rows });
  } catch (err) {
    next(err);
  }
});
