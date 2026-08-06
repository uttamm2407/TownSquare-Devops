const upload = require("../middleware/uploadMiddleware"); // your multer file
const Complaint = require("../models/Complaint"); // your schema

const uploadComplaintMedia = async (req, res) => {
  try {
    const {
      userId,
      title,
      category,
      urgency,
      description,
      latitude,
      longitude,
      locationName,
    } = req.body;

    // TODO: get real userId from auth
    // const userId = null; // or some dummy for now if schema allows null

    const filesMeta = (req.files || []).map((f) => ({
      filename: f.originalname,
      path: f.path, // store this in schema instead of GridFS id
      mimetype: f.mimetype,
    }));

    console.log(
      userId,
      category,
      urgency,
      description,
      latitude,
      longitude,
      locationName,
      filesMeta
    );

    const complaint = new Complaint({
      userId,
      title,
      category,
      urgency,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      locationName,
      files: filesMeta,
    });

    await complaint.save();

    res
      .status(201)
      .json(
        { success: true, message: "Complaint submitted successfully" },
        complaint
      );
  } catch (err) {
    console.error("Error saving complaint:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}; // allow up to 5 files

const axios = require("axios");

const getLocationName = async (req, res) => {
  const { lat, lon } = req.query;

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat,
          lon,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "TownSquare-App",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Nominatim error:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
};

const getAllComplaints = async (req, res) => {
  const userId = req.user._id;

  try {
    const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("Nominatim error:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
};

const colors = {
  high: "red",
  medium: "orange",
  low: "green",
};

const getCommunityComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).sort({ createdAt: -1 }).populate("userId", "name email");
    // console.log(complaints)
    const userId = req.user ? req.user._id : null;
    // console.log(userId)
    const filteredComplaints = complaints
      .filter((complaint) => {
        // If userId is missing, keep the complaint (or filter out depending on requirements, but safe access is key)
        // The original logic was: complaint.userId._id.toString() !== userId?.toString()
        // If complaint.userId is null, we should probably treat it as "not the current user" so we keep it.
        if (!complaint.userId) return true;
        return complaint.userId._id.toString() !== userId?.toString();
      })
      .map((c) => ({
        id: c._id,
        title: c.title,
        category: c.category,
        priority: c.urgency,
        reporter: c.userId ? c.userId.name : "Anonymous",
        email: c.userId ? c.userId.email : "N/A",
        createdAt: c.createdAt, // Send the actual timestamp
        timeAgo: Math.floor(
          (Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
        description: c.description,
        status: c.status,
        statusColor: colors[c.status.toLowerCase()] || "green",
        locationName: c?.locationName,
        latitude: c.latitude,
        longitude: c.longitude,
      }));
    res.json(filteredComplaints);
  } catch (err) {
    console.error("Nominatim error:", err);
    res.status(500).json({ error: "Failed to fetch Data" });
  }
};

const getDetailComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const detailedData = await Complaint.findOne({ _id: id }).populate("userId", "name email")
    res.send(detailedData)
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Data, Server Error" })
  }
}



const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    await complaint.save();

    res.json({ message: "Status updated", complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = {
  uploadComplaintMedia,
  getLocationName,
  getAllComplaints,
  getCommunityComplaints,
  getDetailComplaint,
  updateComplaintStatus,
};
