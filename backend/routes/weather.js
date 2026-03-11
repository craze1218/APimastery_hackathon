const express = require("express");
const axios = require("axios");
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

router.get("/", async (req, res) => {
  const emptyProcessed = {
    totalEvents: 0,
    todayCount: 0,
    severityCount: {},
    timeline: [],
    recentEvents: [],
  };

  try {
    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const endDate = req.query.endDate || new Date().toISOString().slice(0, 10);
    const url = `https://api.nasa.gov/DONKI/solar_flares?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`;
    const response = await axios.get(url, { timeout: 15000, validateStatus: () => true });

    const data = response.data;
    const status = response.status;

    if (status !== 200) {
      const rawData = typeof data === "object" ? data : { error: data || "Non-200 response" };
      return res.json({ rawData, processedData: emptyProcessed });
    }

    const flares = Array.isArray(data) ? data : [];
    const today = new Date().toISOString().slice(0, 10);

    const todayFlares = flares.filter((f) =>
      (f.beginTime || "").startsWith(today)
    );

    const severityCount = flares.reduce((acc, f) => {
      const cls = (f.classType && f.classType[0]) ? f.classType[0] : "U";
      acc[cls] = (acc[cls] || 0) + 1;
      return acc;
    }, {});

    const processedData = {
      totalEvents: flares.length,
      todayCount: todayFlares.length,
      severityCount,
      timeline: flares.map((f) => ({
        id: f.flrID || "",
        classType: f.classType || "",
        beginTime: f.beginTime || "",
        peakTime: f.peakTime || "",
        sourceLocation: f.sourceLocation || "",
      })),
      recentEvents: flares.slice(0, 10).map((f) => ({
        id: f.flrID || "",
        classType: f.classType || "",
        beginTime: f.beginTime || "",
        peakTime: f.peakTime || "",
        sourceLocation: f.sourceLocation || "",
        activeRegionNum: f.activeRegionNum,
      })),
    };

    res.json({ rawData: data, processedData });
  } catch (err) {
    console.error("Space weather error:", err.message);
    const rawData = { error: err.message || "Failed to fetch space weather", code: err.code };
    res.json({ rawData, processedData: emptyProcessed });
  }
});

module.exports = router;
