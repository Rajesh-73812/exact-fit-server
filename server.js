const express = require("express");
const app = express();
const dotenv = require("dotenv");
const sequelize = require("./src/config/db");
dotenv.config();
const loadRoutes = require("./src/routes/index");
const bodyParser = require("body-parser");
const cors = require("cors");

require("./src/models/user");
require("./src/models/associations");
require("./src/models/banner");

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
    credentials: true, // Allow cookies to be sent with requests
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  })
);

// Ensure the models are synced with the database
if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(async () => {
      console.log("Database connection established successfully.");

      // Sync the models to the database
      try {
        await sequelize.sync(); // Sync the models to create the tables
        console.log("Tables created successfully.");
      } catch (err) {
        console.error("Error syncing the models:", err);
        process.exit(1);
      }

      // Start the server after successful DB connection and sync
      app.listen(process.env.PORT, () => {
        console.log(`Server listening at port: ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      console.error(
        "Unable to start the server due to database connection error:",
        err
      );
      process.exit(1);
    });
}

// if (process.env.NODE_ENV !== "test") {
//   async function checkTables() {
//     const [results] = await sequelize.query("SHOW TABLES");
//     console.log("All tables in the database:");
//     results.forEach((row) => console.log(Object.values(row)[0]));
//   }

//   checkTables();
// }

(async () => {
  try {
    await loadRoutes(app);
  } catch (err) {
    console.error("❌ Failed to initialize routes:", err.message);
    process.exit(1);
  }
})();

app.get("/", (req, res) => {
  res.send("Server is Running..............");
});

module.exports = app;
