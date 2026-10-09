const express = require("express");
const cors = require("cors");
const axios = require("axios");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

function normalizeShow(input) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) return { error: "Show title is required." };
  return {
    title,
    tvmazeId: input.tvmazeId == null || input.tvmazeId === "" ? null : Number(input.tvmazeId),
    genres: Array.isArray(input.genres) ? input.genres.filter((g) => typeof g === "string") : [],
    status: typeof input.status === "string" ? input.status : "Unknown",
    premiered: typeof input.premiered === "string" ? input.premiered : "",
    rating: input.rating == null || input.rating === "" ? null : Number(input.rating),
    network: typeof input.network === "string" ? input.network : "Unknown",
    image: typeof input.image === "string" ? input.image : null,
    url: typeof input.url === "string" ? input.url : null,
    summary: typeof input.summary === "string" ? input.summary : ""
  };
}

// READ: get every show in the user's personal library
app.get("/api/shows", (req, res) => {
  try { res.json(db.read()); }
  catch (error) { console.error(error); res.status(500).json({ error: "Could not read the show library." }); }
});

// CREATE: save a show from TVmaze or a manually entered show
app.post("/api/shows", (req, res) => {
  try {
    const normalized = normalizeShow(req.body || {});
    if (normalized.error) return res.status(400).json({ error: normalized.error });
    const shows = db.read();
    if (normalized.tvmazeId && shows.some((show) => Number(show.tvmazeId) === normalized.tvmazeId)) {
      return res.status(409).json({ error: "That TVmaze show is already in your library." });
    }
    const show = { id: Date.now(), ...normalized, addedAt: new Date().toISOString() };
    shows.push(show);
    db.write(shows);
    res.status(201).json(show);
  } catch (error) { console.error(error); res.status(500).json({ error: "Could not save the show." }); }
});

// UPDATE: edit a saved show
app.put("/api/shows/:id", (req, res) => {
  try {
    const shows = db.read();
    const index = shows.findIndex((show) => String(show.id) === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Show not found." });
    const normalized = normalizeShow({ ...shows[index], ...(req.body || {}) });
    if (normalized.error) return res.status(400).json({ error: normalized.error });
    if (normalized.tvmazeId && shows.some((show, i) => i !== index && Number(show.tvmazeId) === normalized.tvmazeId)) {
      return res.status(409).json({ error: "That TVmaze show is already in your library." });
    }
    shows[index] = { ...shows[index], ...normalized, id: shows[index].id, addedAt: shows[index].addedAt };
    db.write(shows);
    res.json(shows[index]);
  } catch (error) { console.error(error); res.status(500).json({ error: "Could not update the show." }); }
});

// DELETE: remove a saved show
app.delete("/api/shows/:id", (req, res) => {
  try {
    const shows = db.read();
    const remaining = shows.filter((show) => String(show.id) !== req.params.id);
    if (remaining.length === shows.length) return res.status(404).json({ error: "Show not found." });
    db.write(remaining);
    res.json({ message: "Show removed from your library." });
  } catch (error) { console.error(error); res.status(500).json({ error: "Could not delete the show." }); }
});

// TVmaze integration: search shows by name
app.get("/api/lookup", async (req, res) => {
  const title = typeof req.query.title === "string" ? req.query.title.trim() : "";
  if (!title) return res.status(400).json({ error: "Enter a TV show title to search." });
  try {
    const response = await axios.get("https://api.tvmaze.com/search/shows", {
      params: { q: title }, timeout: 10000,
      headers: { "User-Agent": "TVShowLibrary/2.0 (student project)" }
    });
    const results = response.data.map(({ show }) => ({
      tvmazeId: show.id,
      title: show.name || "Untitled show",
      genres: Array.isArray(show.genres) ? show.genres : [],
      status: show.status || "Unknown",
      premiered: show.premiered || "",
      rating: show.rating?.average ?? null,
      network: show.network?.name || show.webChannel?.name || "Unknown",
      image: show.image?.medium || show.image?.original || null,
      url: show.url || "https://www.tvmaze.com/",
      summary: show.summary || "No summary is available."
    }));
    res.json(results);
  } catch (error) {
    console.error("TVmaze API error:", error.response?.status || error.message);
    const status = error.response?.status === 429 ? 503 : 502;
    res.status(status).json({ error: "TVmaze could not be reached right now. Please try again shortly." });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok", service: "tv-show-library" }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`TV Show Library running at http://localhost:${PORT}`));
}
module.exports = app;
