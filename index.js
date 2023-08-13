// Require the libraries
const express = require("express");
const path = require("path");

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Create an express app
const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/page.html"));
});

// Configure multer to store the file in memory
const fileUpload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: false,
});

// Define a route for file upload
app.post("/upload", fileUpload.single("file"), async (req, res) => {
  // Create a function that returns a promise for uploading the file
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      let uploadStream = cloudinary.uploader.upload_stream(
        // {
        //           folder: "test",
        //           public_id: "sample",
        //           resource_type: "auto",
        //         },
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });
  };

  const upload = async (req) => {
    try {
      let result = await streamUpload(req);
      console.log(result);
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "File upload failed" });
    }
  };

  upload(req);
});
const port = process.env.PORT || 5005;
// Start the server on port 3000
app.listen(port, () =>
  console.log("Server running on port http://localhost:" + port)
);
