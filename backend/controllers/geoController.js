const NOMINATIM = "https://nominatim.openstreetmap.org";

const fetchOpts = {
  headers: {
    "User-Agent": "MedShopHackathon/1.0 (educational; contact via app admin)",
    Accept: "application/json",
    "Accept-Language": "en",
  },
};

exports.reverse = async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({ message: "Invalid lat" });
  }
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
    return res.status(400).json({ message: "Invalid lon" });
  }

  try {
    const url = `${NOMINATIM}/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json`;
    const r = await fetch(url, fetchOpts);
    if (!r.ok) {
      return res.status(502).json({ message: "Geocoding service unavailable" });
    }
    const data = await r.json();
    const displayName = typeof data.display_name === "string" ? data.display_name : "";
    res.json({ displayName });
  } catch (err) {
    console.error("geo reverse error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.search = async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (q.length < 2) {
    return res.status(400).json({ message: "Enter at least 2 characters" });
  }
  if (q.length > 200) {
    return res.status(400).json({ message: "Query too long" });
  }

  try {
    const url = `${NOMINATIM}/search?q=${encodeURIComponent(q)}&format=json&limit=6`;
    const r = await fetch(url, fetchOpts);
    if (!r.ok) {
      return res.status(502).json({ message: "Search unavailable" });
    }
    const data = await r.json();
    const results = Array.isArray(data)
      ? data.map((row) => ({
          displayName: row.display_name || "",
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon),
        })).filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon))
      : [];
    res.json({ results });
  } catch (err) {
    console.error("geo search error", err);
    res.status(500).json({ message: "Server error" });
  }
};
