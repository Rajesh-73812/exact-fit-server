const dotenv = require("dotenv");
dotenv.config(); // MUST BE FIRST

const express = require("express");
const app = express();
const sequelize = require("./src/config/db");
const loadRoutes = require("./src/routes/index");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./src/helper/cron");
require("./src/models/associations");
require("./src/models/propertySubscription");
require("./src/models/notification");

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "http://localhost",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://exact-fit-admin.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

const PORT = process.env.PORT || 4446;

// 🔹 DB connection
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connection established successfully");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err.message);
  });

// 🔹 Load routes BEFORE listen
(async () => {
  try {
    await loadRoutes(app);

    app.get("/", (req, res) => {
      res.send("Server is Running..............");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to initialize routes:", err.message);
    process.exit(1);
  }
})();
