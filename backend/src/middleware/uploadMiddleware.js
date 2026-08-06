const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const ALLOWED_MIME_TYPES = [
  // images
  'image/jpeg',
  'image/jpg',
  'image/png',
  // videos
  'video/mp4',
  'video/quicktime',      // .mov
  'video/x-matroska',     // .mkv
  'video/x-msvideo',      // .avi
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only jpeg, jpg, png, mp4, mov, mkv, avi files are allowed'),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file (adjust for videos)
  },
});

module.exports = upload;
