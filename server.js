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

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
// AWS S3 Presigned URL for Image Uploads
app.post("/upload-image", async (req, res) => {
  const timeStamp = Math.floor(Date.now() / 1000);
  const folder = req.body.folder || "e-fit";
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;

  console.log(
    timeStamp,
    folder,
    fileName,
    fileType,
    "before uploading........."
  );
  // recived filetype and filename
  if (!fileName || !fileType) {
    return res
      .status(400)
      .json({ message: "fileName and fileType are required" });
  }

  // define key path for s3 bucket
  const key = `${folder}/${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType, // ContentType is mandatory to match with the file"s MIME type
  });

  try {
    // Generate the presigned URL with a 5-minute expiration time
    const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 300 means 5 second (60 * 5)
    // Return the presigned URL and additional data to the client
    res.json({
      upuploadUrl: url,
      bucket: process.env.S3_BUCKET_NAME,
      filePath: key,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating upload URL" });
  }
});

// for delete
app.delete("/api/delete-image", async (req, res) => {
  console.log(req.body, "ttttttttttttttttttttttttt");
  const filePath = req.body.filePath; // Full path of the file in S3 (e.g., "uploads/myimage.jpg")

  console.log(filePath, "kkkkkkkkkkkkkkkkkkkkkkkkkkkk");
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
