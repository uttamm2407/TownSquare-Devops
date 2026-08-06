const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const { uploadComplaintMedia, getLocationName, getAllComplaints, getCommunityComplaints, getDetailComplaint, updateComplaintStatus } = require('../controllers/complaintControllers');

const upload = require('../middleware/uploadMiddleware');


router.post("/submit-complaint", upload.array('files', 10), uploadComplaintMedia); // allow up to 5 files
router.get("/location-name", getLocationName);
router.get("/all-complaints", protect, getAllComplaints);
router.get("/community-complaints", protect, getCommunityComplaints);
router.get("/complaint/:id", getDetailComplaint);
router.put("/complaint/:id/status", protect, updateComplaintStatus);

module.exports = router;