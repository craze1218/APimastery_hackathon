const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const neoRouter = require("./routes/neo");
const issRouter = require("./routes/iss");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/neo", neoRouter);
app.use("/api/iss", issRouter);

app.get("/", (_req, res) => {
  res.json({ message: "Space Data Explorer API" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
