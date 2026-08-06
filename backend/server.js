
require('dotenv').config();
const express = require("express");



const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const userRoutes = require("./src/routes/userRoutes");

// Connect to MongoDB
connectDB();
const app = express();
const port = 5000;


app.use('/uploads', express.static('uploads'));

// Middleware to parse JSON body
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/users", userRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Express server!");
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
