const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const url = "http://api.open-notify.org/iss-now.json";
    const { data } = await axios.get(url);

    const latitude = parseFloat(data?.iss_position?.latitude || "0");
    const longitude = parseFloat(data?.iss_position?.longitude || "0");
    const timestamp = data?.timestamp
      ? new Date(data.timestamp * 1000).toISOString()
      : null;

    const processedData = {
      latitude,
      longitude,
      timestamp,
    };

    res.json({ rawData: data, processedData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch ISS data" });
  }
});

module.exports = router;
