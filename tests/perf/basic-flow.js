import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    ramp: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "60s", target: 200 },
        { duration: "30s", target: 0 }
      ]
    }
  }
};

const baseUrl = __ENV.API_URL || "http://localhost:4000";

function register() {
  const email = `k6_${__VU}_${Date.now()}@mail.com`;
  const payload = JSON.stringify({ email, password: "password123" });
  const params = { headers: { "Content-Type": "application/json" } };
  const res = http.post(`${baseUrl}/auth/register`, payload, params);
  check(res, { "register ok": (r) => r.status === 200 });
  return res.json("token");
}

export default function () {
  const token = register();
  const events = http.get(`${baseUrl}/events`);
  check(events, { "events ok": (r) => r.status === 200 });
  const list = events.json("events");
  const eventId = list?.[0]?.id;

  const payload = JSON.stringify({ eventId, quantity: 1 });
  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };
  const order = http.post(`${baseUrl}/orders`, payload, params);
  check(order, { "order ok": (r) => r.status === 200 });
  sleep(1);
}
