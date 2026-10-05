require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((o) => o.trim());

const ORDER_MODES = ["BUY", "SELL"];

const app = express();

app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json({ limit: "10kb" }));

// Wraps async route handlers so rejected promises reach the error middleware
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Returns a list of validation errors for an order payload (empty if valid)
const validateOrder = ({ name, qty, price, mode }) => {
  const errors = [];

  if (typeof name !== "string" || !/^[A-Z0-9&\-]{1,20}$/.test(name.trim())) {
    errors.push("name must be a valid instrument symbol");
  }
  if (!Number.isInteger(qty) || qty <= 0) {
    errors.push("qty must be a positive integer");
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    errors.push("price must be a positive number");
  }
  if (!ORDER_MODES.includes(mode)) {
    errors.push(`mode must be one of ${ORDER_MODES.join(", ")}`);
  }

  return errors;
};

app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res
    .status(dbConnected ? 200 : 503)
    .json({ status: dbConnected ? "ok" : "db_unavailable" });
});

app.get(
  "/allHoldings",
  asyncHandler(async (req, res) => {
    const allHoldings = await HoldingsModel.find({}).lean();
    res.json(allHoldings);
  }),
);

app.get(
  "/allPositions",
  asyncHandler(async (req, res) => {
    const allPositions = await PositionsModel.find({}).lean();
    res.json(allPositions);
  }),
);

app.get(
  "/allOrders",
  asyncHandler(async (req, res) => {
    const allOrders = await OrdersModel.find({}).sort({ createdAt: -1 }).lean();
    res.json(allOrders);
  }),
);

app.post(
  "/newOrder",
  asyncHandler(async (req, res) => {
    const payload = {
      name:
        typeof req.body.name === "string"
          ? req.body.name.trim().toUpperCase()
          : req.body.name,
      qty: Number(req.body.qty),
      price: Number(req.body.price),
      mode:
        typeof req.body.mode === "string"
          ? req.body.mode.toUpperCase()
          : req.body.mode,
    };

    const errors = validateOrder(payload);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Invalid order", details: errors });
    }

    const order = await OrdersModel.create(payload);
    res.status(201).json({ message: "Order placed", order });
  }),
);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Central error handler
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON body" });
  }
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({
        error: "Invalid data",
        details: Object.values(err.errors).map((e) => e.message),
      });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const start = async () => {
  if (!MONGO_URL) {
    console.error(
      "MONGO_URL is not set. Copy .env.example to .env and fill it in.",
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

if (require.main === module) {
  start();
}

module.exports = { app, validateOrder };
