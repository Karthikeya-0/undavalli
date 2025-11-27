// app.js
// Node backend with bulk import (calls Python ML), strict validation, and delete
const express = require("express");
const path = require("path");
const mongoose = require("mongoose")
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== CONFIG =====
const MONGO_URI = "mongodb+srv://admin:admin@cluster0.yvpcugo.mongodb.net/fraudDB?retryWrites=true&w=majority&appName=Cluster0";
const PYTHON_PREDICT_URL = "http://127.0.0.1:5000/predict"; // python ML server
const BATCH_SIZE = 100; // number of docs per insertMany batch
// ===================

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const urlSchema = new mongoose.Schema({
  link: { type: String, required: true, unique: true },
  isFraud: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const URLModel = mongoose.model("Url", urlSchema);

// Normalize: accept example.com or https://example.com -> normalize to https://example.com/
function normalizeAndValidate(link) {
  if (!link || typeof link !== "string") return null;
  let input = link.trim();

  // lower-case hostname portion but keep path/query
  // if no scheme, prepend https:// so URL parser works
  if (!/^https?:\/\//i.test(input)) input = "https://" + input;

  try {
    const u = new URL(input);

    // reject localhost and numeric IPs
    if (u.hostname === "localhost") return null;
    if (/^[0-9.]+$/.test(u.hostname)) return null;

    // require at least one dot and TLD of 2+ letters
    if (!/^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(u.hostname)) return null;

    // canonical href (keep path/query/hash)
    return u.href;
  } catch {
    return null;
  }
}

// Call Python ML service to predict isFraud for a single link
async function predictWithML(link) {
  try {
    const resp = await axios.post(PYTHON_PREDICT_URL, { link }, { timeout: 5000 });
    if (resp?.data && typeof resp.data.isFraud === "boolean") return resp.data.isFraud;
    // fallback to false if ML doesn't return proper data
    return false;
  } catch (err) {
    // If Python server down — fallback to simple keyword heuristic (safe fallback)
    console.warn("ML predict error:", err.message || err);
    const lower = link.toLowerCase();
    const badWords = ["win", "free", "prize", "bonus", "click", "cash", "lottery", "offer", "secure-login"];
    return badWords.some(w => lower.includes(w));
  }
}

/* ---------- ROUTES ---------- */

// Add single URL (admin)
app.post("/add", async (req, res) => {
  try {
    const { link } = req.body;
    const valid = normalizeAndValidate(link);
    if (!valid) return res.status(400).json({ success: false, error: "Invalid link. Use example.com or https://example.com" });

    // check existing
    const existing = await URLModel.findOne({ link: valid });
    if (existing) return res.json({ success: true, message: "Already exists", data: existing });

    // get ML prediction
    const isFraud = await predictWithML(valid);

    const doc = new URLModel({ link: valid, isFraud });
    await doc.save();
    return res.json({ success: true, message: "Inserted", data: doc });
  } catch (err) {
    // race duplicate handling
    if (err && err.code === 11000) {
      const existing = await URLModel.findOne({ link: req.body.link });
      return res.json({ success: true, message: "Already exists", data: existing });
    }
    console.error("Add error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// Check (does NOT insert)
app.post("/check", async (req, res) => {
  try {
    const { link } = req.body;
    const valid = normalizeAndValidate(link);
    if (!valid) return res.status(400).json({ success: false, error: "Invalid link format." });

    const existing = await URLModel.findOne({ link: valid });
    if (!existing) return res.json({ success: true, found: false });
    return res.json({ success: true, found: true, data: existing });
  } catch (err) {
    console.error("Check error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// Bulk add (accepts array or newline/comma separated string sent as JSON)
app.post("/bulk-add", async (req, res) => {
  try {
    let { links } = req.body;
    if (!links) return res.status(400).json({ success: false, error: "links required" });

    // normalize input to array
    if (typeof links === "string") {
      links = links.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(links)) return res.status(400).json({ success: false, error: "links must be array or newline/comma separated string" });

    // normalize & validate, dedupe input
    const canonicalSet = new Set();
    const invalid = [];
    for (const l of links) {
      const c = normalizeAndValidate(l);
      if (!c) invalid.push(l);
      else canonicalSet.add(c);
    }

    const allCanonicals = Array.from(canonicalSet);
    if (!allCanonicals.length) {
      return res.json({ success: true, insertedCount: 0, invalid, message: "No valid links to insert" });
    }

    // remove ones already in DB to avoid duplicates
    const existingDocs = await URLModel.find({ link: { $in: allCanonicals } }).select("link").lean();
    const existingSet = new Set(existingDocs.map(d => d.link));
    const toInsert = allCanonicals.filter(c => !existingSet.has(c));

    // if none to insert
    if (!toInsert.length) {
      return res.json({ success: true, insertedCount: 0, invalid, skippedExisting: allCanonicals.length - toInsert.length });
    }

    // For performance: process in batches. For each batch, call ML in parallel for items in batch, build docs, insertMany ordered:false
    let insertedTotal = 0;
    for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
      const batch = toInsert.slice(i, i + BATCH_SIZE);

      // predict ML for batch in parallel (but not too many concurrency)
      const preds = await Promise.all(batch.map(link => predictWithML(link)));

      const docs = batch.map((link, idx) => ({ link, isFraud: !!preds[idx] }));

      // insert batch
      try {
        const ins = await URLModel.insertMany(docs, { ordered: false });
        insertedTotal += Array.isArray(ins) ? ins.length : (ins.insertedCount || 0);
      } catch (e) {
        // if some inserted and some duplicates, handle gracefully
        if (e && e.insertedDocs) insertedTotal += e.insertedDocs.length;
        else console.warn("Bulk insert batch error:", e.message || e);
      }
    }

    return res.json({
      success: true,
      insertedCount: insertedTotal,
      invalid,
      skippedExisting: allCanonicals.length - toInsert.length
    });
  } catch (err) {
    console.error("Bulk-add error:", err);
    return res.status(500).json({ success: false, error: "Bulk insert failed", details: err.message });
  }
});

// Delete (admin) by id
app.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await URLModel.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, error: "Not found" });
    return res.json({ success: true, message: "Deleted", data: doc });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

// list (with limit)
app.get("/urls", async (req, res) => {
  try {
    const limit = Math.min(500, parseInt(req.query.limit) || 200);
    const docs = await URLModel.find().sort({ createdAt: -1 }).limit(limit);
    return res.json(docs);
  } catch (err) {
    console.error("List error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

const PORT = 3210;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
