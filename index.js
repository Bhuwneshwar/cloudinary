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
  cloud_name: "",
  api_key: "",
  api_secret: "",
  secure :false, 
});
// Define a route for file upload
app.post("/upload", fileUpload.single("file"), function (req, res, next) {
  // Create a function that returns a promise for uploading the file
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
      // Create an upload stream with the desired options
      let uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "test", // Optional, specify a folder name for your file
          public_id: "sample", // Optional, specify a public id for your file
          resource_type: "auto", // Optional, specify the resource type (image, video, raw, auto)
        },
        // Handle the upload result or error in a callback function
        (error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        }
      );
      // Pipe the file buffer to the upload stream
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });
  };

  // Call the upload function with the request
  async function upload(req) {
    try {
      // Wait for the upload to complete and get the result
      let result = await streamUpload(req);
      // Log the result to the console
      console.log(result);
      // Send a success response to the client
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      // Log the error to the console
      console.error(err);
      // Send an error response to the client
      res.status(500).json({ message: "File upload failed" });
    }
  }

  // Invoke the upload function
  upload(req);
});

// Start the server on port 3000
app.listen(3000, () => console.log("Server running on port 3000"));
