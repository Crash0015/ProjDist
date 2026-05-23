import express from "express";
import cors from "cors";

import { authRouter } from "./routes/auth.js";
import { eventsRouter } from "./routes/events.js";
import { ordersRouter } from "./routes/orders.js";

export function buildApp({ webUrl }) {
  const app = express();

  app.use(cors({ origin: webUrl }));
  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/", (req, res) => {
    res.json({ message: "Ticketing API" });
  });

  app.use("/auth", authRouter);
  app.use("/events", eventsRouter);
  app.use("/orders", ordersRouter);

  app.use((err, req, res, next) => {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Server error" });
  });

  return app;
}
