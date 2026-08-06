const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require("../controllers/authControllers");
const { protect } = require("../middleware/authMiddleware"); // Ensure you have this middleware
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log("Uploaded Image URL generated:", imageUrl);
    res.status(200).json({ imageUrl })
});

module.exports = router;