// server/routes/payment.js
// Install deps:  npm install razorpay   (crypto is built-in to Node)

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

// ── These model paths assume your file layout:
//    server/
//      models/Cart.js
//      models/Product.js
//      routes/payment.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// ── Razorpay instance — reads RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET from .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /create-order
// Body: { amount (₹ — NOT paise), currency, userId }
// Returns Razorpay order object: { id, amount (paise), currency, ... }
//
// NOTE: This route is mounted WITHOUT a prefix in index.js:
//       app.use(paymentRoutes)   →  POST /create-order
// ─────────────────────────────────────────────────────────────────────────────
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", userId } = req.body;
    if (!amount || !userId) {
      return res.status(400).json({ error: "amount and userId are required" });
    }

    // Razorpay receipt must be ≤ 40 chars.
    // Use last 8 chars of userId + last 8 digits of timestamp → always ≤ 40.
    const shortId = userId.slice(-8);
    const shortTs = String(Date.now()).slice(-8);
    const receipt = `r_${shortId}_${shortTs}`;   // e.g. "r_bF182_12345678" (18 chars)

    const options = {
      amount: Math.round(amount * 100),          // ₹ → paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /verify-payment
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId }
//
// Verification logic:
//   expected = HMAC-SHA256(order_id + "|" + payment_id, key_secret)
//   if expected === razorpay_signature  →  payment is genuine
// ─────────────────────────────────────────────────────────────────────────────
router.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Signature mismatch — payment not verified" });
    }

    // ✅ Payment is genuine
    // Optional: persist order in your DB here
    // e.g.  await Order.create({ userId, razorpay_order_id, razorpay_payment_id });

    res.json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// POST /clear-cart
// Body: { userId }
// Called after successful payment to empty the user's cart
// ─────────────────────────────────────────────────────────────────────────────
router.post("/clear-cart", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("clear-cart error:", err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;