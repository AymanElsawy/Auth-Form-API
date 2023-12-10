import multer from "multer";
const FILE_TYPE_MAP = {
  // map file types
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/images"); // set destination
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-"); // remove spaces
    cb(null, fileName);  // set file name
  },
});

const upload = multer({ storage: storage }); // initialize multer

export default upload; // export the upload function
