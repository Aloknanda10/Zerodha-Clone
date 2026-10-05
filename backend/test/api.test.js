const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { app, validateOrder } = require("../index");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

test("validateOrder accepts a valid order", () => {
  assert.deepStrictEqual(
    validateOrder({ name: "INFY", qty: 2, price: 1555.45, mode: "BUY" }),
    [],
  );
});

test("validateOrder rejects bad fields", () => {
  const errors = validateOrder({ name: "", qty: -1, price: 0, mode: "HOLD" });
  assert.strictEqual(errors.length, 4);
});

test("validateOrder rejects fractional quantity", () => {
  assert.strictEqual(
    validateOrder({ name: "TCS", qty: 1.5, price: 10, mode: "SELL" }).length,
    1,
  );
});

test("POST /newOrder returns 400 for invalid payload", async () => {
  const res = await fetch(`${baseUrl}/newOrder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "INFY", qty: 0, price: "abc", mode: "BUY" }),
  });
  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, "Invalid order");
  assert.strictEqual(body.details.length, 2);
});

test("POST /newOrder returns 400 for malformed JSON", async () => {
  const res = await fetch(`${baseUrl}/newOrder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad json",
  });
  assert.strictEqual(res.status, 400);
});

test("unknown routes return 404 JSON", async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`);
  assert.strictEqual(res.status, 404);
  assert.deepStrictEqual(await res.json(), { error: "Route not found" });
});

test("GET /health reports 503 when DB is not connected", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.strictEqual(res.status, 503);
});
