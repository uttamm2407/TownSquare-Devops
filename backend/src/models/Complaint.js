const mongoose = require("mongoose");;

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  category: String,
  urgency: String,
  description: String,
  latitude: Number,
  longitude: Number,
  locationName: String,
  status: { type: String, enum: ["submitted", "in-progress", "resolved", "closed", "under review"], default: "submitted" },
  createdAt: { type: Date, default: Date.now },
  files: [
    {
      filename: String,
      path: String,
      mimetype: String,
    },
  ],
});

module.exports = mongoose.model("Complaint", complaintSchema);
