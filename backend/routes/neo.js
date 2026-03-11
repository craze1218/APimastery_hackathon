const express = require("express");
const axios = require("axios");
const router = express.Router();

const NASA_API_KEY = process.env.NASA_API_KEY || "DEMO_KEY";

router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${NASA_API_KEY}`;
    const { data } = await axios.get(url);

    const dateKeys = Object.keys(data.near_earth_objects || {});
    const allNeos = dateKeys.flatMap((d) => data.near_earth_objects[d] || []);

    const hazardous = allNeos.filter(
      (n) => n.is_potentially_hazardous_asteroid
    );
    const velocities = allNeos
      .map((n) =>
        parseFloat(
          n.close_approach_data?.[0]?.relative_velocity
            ?.kilometers_per_hour || "0"
        )
      )
      .filter((v) => v > 0);
    const avgVelocity =
      velocities.length > 0
        ? velocities.reduce((a, b) => a + b, 0) / velocities.length
        : 0;

    const sizeDistribution = allNeos.slice(0, 20).map((n) => ({
      id: n.id,
      name: n.name,
      maxDiameter:
        n.estimated_diameter?.meters?.estimated_diameter_max || null,
      hazardous: n.is_potentially_hazardous_asteroid,
    }));

    const velocityData = allNeos.slice(0, 20).map((n) => ({
      id: n.id,
      name: n.name,
      velocity:
        parseFloat(
          n.close_approach_data?.[0]?.relative_velocity
            ?.kilometers_per_hour || "0"
        ) || 0,
    }));

    const processedData = {
      count: allNeos.length,
      hazardousCount: hazardous.length,
      averageVelocity: Math.round(avgVelocity),
      sizeDistribution,
      velocityData,
      hazardousList: hazardous.slice(0, 10).map((n) => ({
        id: n.id,
        name: n.name,
        magnitude: n.absolute_magnitude_h,
      })),
    };

    res.json({ rawData: data, processedData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch NEO data" });
  }
});

module.exports = router;
