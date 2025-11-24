const express = require("express");
const app = express();
const dotenv = require("dotenv");
const sequelize = require("./src/config/db");
dotenv.config();
const loadRoutes = require("./src/routes/index");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require("./src/models/user");
require("./src/models/associations");
require("./src/models/propertyType");

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

const PORT = process.env.PORT || 4446;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true, // Allow cookies to be sent with requests
    exposedHeaders: ["Content-Disposition", "Content-Length"],
  })
);

if (process.env.NODE_ENV !== "test") {
  sequelize
    .authenticate()
    .then(async () => {
      console.log("Database connection established successfully.");
      try {
        await sequelize.sync();
        console.log("Tables created successfully.");
      } catch (err) {
        console.error("Error syncing the models:", err);
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(
        "Unable to start the server due to database connection error:",
        err
      );
      process.exit(1);
    });
}

// Initialize routes
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

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// AWS S3 Presigned URL for Image Uploads
app.post("/upload-image", async (req, res) => {
  // const timeStamp = Math.floor(Date.now() / 1000);
  const folder = req.body.folder || "e-fit";
  const fileName = req.body.fileName;

  if (!fileName) {
    return res.status(400).json({ message: "fileName is required" });
  }

  const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${fileName}`;
  const key = `${folder}/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  try {
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    res.json({
      uploadUrl,
      filePath: key,
      publicUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (error) {
    console.error("Presigned URL Error:", error);
    return res.status(500).json({ message: "Error generating upload URL" });
  }
});

app.delete("/api/delete-image", async (req, res) => {
  const filePath = req.body.filePath;

  if (!filePath)
    return res.status(400).json({ message: "filePath is required" });

  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filePath,
  });

  try {
    const result = await s3.send(deleteCommand);
    res.json({ message: "File deleted successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete image" });
  }
});

module.exports = app;
