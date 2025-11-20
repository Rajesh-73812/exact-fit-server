const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const path = require("path");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  maxAttempts: 5,
});

/**
 * Upload file(s) to AWS S3
 * @param {Express.Multer.File|Array<Express.Multer.File>} file - Single or multiple files
 * @param {string} folderName - Folder in S3 bucket
 * @returns {Promise<string|string[]>} - Uploaded file URL(s)
 */
const uploadToS3 = async (file, folderName = "uploads") => {
  if (!file || (Array.isArray(file) && file.length === 0)) {
    throw new Error("No file provided for upload.");
  }

  const files = Array.isArray(file) ? file : [file];

  const uploadPromises = files.map(async (f) => {
    const fileName = `${folderName}/${Date.now()}-${path.basename(f.originalname)}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: f.buffer,
      ContentType: f.mimetype,
    };

    try {
      await s3.send(new PutObjectCommand(params));
      return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    } catch (error) {
      console.error(`❌ Upload failed for ${f.originalname}:`, error);
      throw new Error(`Failed to upload file ${f.originalname} to S3.`);
    }
  });

  const uploaded = await Promise.all(uploadPromises);
  return uploaded;
};

/**
 * Delete a file from AWS S3
 * @param {string} imageUrl - Full S3 file URL
 * @returns {Promise<void>}
 */
// const deleteFromS3 = async (imageUrl) => {
//   if (!imageUrl) return;

//   try {
//     const url = new URL(imageUrl);
//     const Key = decodeURIComponent(url.pathname.slice(1)); // Remove leading slash

//     const params = {
//       Bucket: process.env.S3_BUCKET_NAME,
//       Key,
//     };

//     await s3.send(new DeleteObjectCommand(params));
//     console.log(`✅ Deleted file from S3: ${Key}`);
//   } catch (error) {
//     console.error(`❌ Error deleting from S3 [${imageUrl}]:`, error.message);
//     throw new Error("Failed to delete image from S3");
//   }
// };

const deleteFromS3 = async (imageUrls) => {
  console.log("Image URLs:", imageUrls);

  if (!imageUrls) return;
  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  console.log(urls, "urlssssssssssss");

  try {
    for (const imageUrl of urls) {
      // If imageUrl is an array (multiple image URLs), we take the first element
      const urlToDelete = Array.isArray(imageUrl) ? imageUrl[0] : imageUrl;
      console.log(urlToDelete, "urlToDeleteurlToDeleteurlToDelete");

      const parsedUrl = new URL(urlToDelete);
      console.log(parsedUrl, "parsedUrlparsedUrlparsedUrlparsedUrl");

      const Key = decodeURIComponent(parsedUrl.pathname.slice(1)); // Remove the leading slash and decode URL
      console.log(Key, "keyyyyyyyyyyyyyyyy");

      const params = {
        Bucket: process.env.S3_BUCKET_NAME, // Ensure you have the correct bucket name in your environment variables
        Key,
      };
      console.log(params, "parmsssssssssssssssssssss");

      // Send delete command to S3
      await s3.send(new DeleteObjectCommand(params));
      console.log(`✅ Deleted file from S3: ${Key}`);
    }
  } catch (error) {
    console.error(`❌ Error deleting from S3 [${imageUrls}]:`, error.message);
    throw new Error("Failed to delete image from S3");
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
