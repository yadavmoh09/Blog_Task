const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require("path");

// Mongo URI
const mongoURI =
  "mongodb+srv://moh09yadav:I25d90fw6k5Psbne@cluster0.p9wgagt.mongodb.net/CompanyDB?retryWrites=true&w=majority&appName=Cluster0";

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

module.exports = upload;
