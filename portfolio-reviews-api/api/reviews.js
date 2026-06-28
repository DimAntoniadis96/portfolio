import { randomUUID } from "crypto";
import mongoose from "mongoose";

/* --- database connection (cached across warm serverless invocations) --- */

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// Vercel reuses warm function instances; cache the connection on `global`
// so we don't exhaust the Atlas connection pool by reconnecting per request.
let cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGO_URI) throw new Error("Missing MONGO_URI env var");
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/* --- schema --- */

const reviewSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // client-generated UUID is the primary key
    alias: { type: String, required: true, trim: true, maxlength: 24 },
    authorId: { type: String, required: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 180 },
    replyTo: { type: String, default: null },
  },
  { timestamps: true, _id: false }, // timestamps adds createdAt / updatedAt
);

const Review =
  mongoose.models.PortfolioReview ||
  mongoose.model("PortfolioReview", reviewSchema, "portfolio_reviews");

/* --- CORS (allowlist from env var + localhost dev ports) --- */

const ENV_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Hard-coded allowlist (primary). Env var can add custom domains later.
const PROD_ORIGINS = [
  "https://portfolio-sigma-seven-8hho4d2jsf.vercel.app",
];

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
];

const ALLOWED_ORIGINS = [...new Set([...PROD_ORIGINS, ...ENV_ORIGINS, ...DEV_ORIGINS])];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

/* --- helpers --- */

function sanitizeString(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function getRoutePath(req) {
  const url = new URL(req.url, "https://example.com");
  return url.searchParams.get("path") || "";
}

function shapeReview(review) {
  return {
    id: review._id,
    alias: review.alias,
    authorId: review.authorId,
    body: review.body,
    replyTo: review.replyTo ?? null,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

/* --- Discord webhook notification --- */

async function notifyDiscord(review) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return; // not configured — silently skip
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        username: "Portfolio Reviews",
        embeds: [
          {
            title: "New review ✍️",
            description: review.body.slice(0, 1000),
            color: 0x5f9ea0,
            author: { name: `@${review.alias}` },
            footer: { text: "portfolio-sigma-seven-8hho4d2jsf.vercel.app" },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error("Discord webhook failed:", err);
  } finally {
    clearTimeout(timer);
  }
}

/* --- route handlers --- */

async function getReviews(res) {
  const reviews = await Review.find({}).sort({ createdAt: 1 }).limit(150).lean();
  return res.status(200).json({ reviews: reviews.map(shapeReview) });
}

async function createReview(req, res) {
  const alias = sanitizeString(req.body?.alias, 24);
  const authorId = sanitizeString(req.body?.authorId, 120);
  const body = sanitizeString(req.body?.body, 180);
  const replyTo = sanitizeString(req.body?.replyTo, 120) || null;
  const id = sanitizeString(req.body?.id, 120) || randomUUID();

  if (!alias || !authorId || !body) {
    return res.status(400).json({ error: "alias, authorId, and body are required" });
  }

  const review = await Review.create({ _id: id, alias, authorId, body, replyTo });
  // Await so the notification actually fires before the serverless fn freezes;
  // notifyDiscord swallows its own errors so it never blocks the response.
  await notifyDiscord(review);
  return res.status(201).json({ review: shapeReview(review) });
}

async function updateAlias(req, res) {
  const alias = sanitizeString(req.body?.alias, 24);
  const authorId = sanitizeString(req.body?.authorId, 120);

  if (!alias || !authorId) {
    return res.status(400).json({ error: "alias and authorId are required" });
  }

  await Review.updateMany({ authorId }, { $set: { alias } });
  return res.status(200).json({ ok: true });
}

/* --- entry point --- */

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();
    const path = getRoutePath(req);

    if (req.method === "GET" && !path) return getReviews(res);
    if (req.method === "POST" && !path) return createReview(req, res);
    if (req.method === "PATCH" && path === "alias") return updateAlias(req, res);

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Reviews API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
