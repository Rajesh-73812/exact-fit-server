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
require("./src/helper/cron");
// require("./src/models/user");
require("./src/models/associations");
// require("./src/models/propertyType");
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

// const PORT = process.env.PORT || 4446;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

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

// replace the old app.listen block with this:
app.listen(process.env.PORT, async () => {
  console.log(`Server running on port ${process.env.PORT}`);

  try {
    await loadRoutes(app);
    console.log("All routes loaded successfully!");
  } catch (err) {
    console.error("Failed to load routes:", err);
    process.exit(1);
  }
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/upload-image", async (req, res) => {
  const { fileName, fileType, folder = "uploads" } = req.body;
  console.log(req.body, "from upload image");
  if (!fileName || !fileType) {
    return res
      .status(400)
      .json({ success: false, message: "fileName and fileType required" });
  }

  const key = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${fileName}`;
  console.log(key, "from upload image  key   ");
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      ACL: "public-read",
    });

    console.log(command, "from command");
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    console.log(uploadUrl, "from uploadurlllllllll");
    res.json({
      success: true,
      uploadUrl,
      filePath: key,
      publicUrl: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (err) {
    console.error("Presigned error:", err);
    res.status(500).json({ success: false, message: "Failed to generate URL" });
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
