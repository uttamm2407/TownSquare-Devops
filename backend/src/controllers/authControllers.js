const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Complaint = require("../models/Complaint");

const generateToken = (userId) => {
  // return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc Register a new user
// @route POST /api/auth/register
// @access public

const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } =
      req.body;
    // console.log(User.getIndexes())
    console.log(name, email, password, profileImageUrl, adminInviteToken);
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    let role = "member";
    if (
      adminInviteToken &&
      adminInviteToken == process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Create new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });
    console.log("working");

    //Return user data with JWT
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Login an existing user
// @route POST /api/auth/login
// @access public

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid email address" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const userId = user._id;

    const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });

    let stats = {
      submitted: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      underReview: 0,
    };

    for (let c of complaints) {
      switch (c.status) {
        case "submitted":
          stats.submitted++;
          break;
        case "in-progress":
          stats.inProgress++;
          break;
        case "resolved":
          stats.resolved++;
          break;
        case "closed":
          stats.closed++;
          break;
        case "under review":
          stats.underReview++;
          break;
      }
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      stats
    };

    res.json({
      user: safeUser,
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private (Requires JWT)

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const userId = user._id;

    const complaints = await Complaint.find({ userId }).sort({ createdAt: -1 });

    let stats = {
      submitted: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      underReview: 0,
    };

    for (let c of complaints) {
      switch (c.status) {
        case "submitted":
          stats.submitted++;
          break;
        case "in-progress":
          stats.inProgress++;
          break;
        case "resolved":
          stats.resolved++;
          break;
        case "closed":
          stats.closed++;
          break;
        case "under review":
          stats.underReview++;
          break;
      }
    }

    res.json({
      ...user.toObject(),
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Update an existing user
// @route PUT /api/auth/profile
// @access Private (Requires JWT)

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Update Profile Request Body:", req.body); // Debug
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.profileImageUrl = req.body.profileImageUrl || user.profileImageUrl;
    console.log("User object before save:", user); // Debug

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updateduser = await user.save();

    const complaints = await Complaint.find({ userId: updateduser._id }).sort({ createdAt: -1 });

    let stats = {
      submitted: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      underReview: 0,
    };

    for (let c of complaints) {
      switch (c.status) {
        case "submitted":
          stats.submitted++;
          break;
        case "in-progress":
          stats.inProgress++;
          break;
        case "resolved":
          stats.resolved++;
          break;
        case "closed":
          stats.closed++;
          break;
        case "under review":
          stats.underReview++;
          break;
      }
    }

    res.json({
      _id: updateduser._id,
      name: updateduser.name,
      email: updateduser.email,
      role: updateduser.role,
      profileImageUrl: updateduser.profileImageUrl,
      token: generateToken(updateduser._id),
      stats,
      debugReceived: req.body.profileImageUrl, // ECHO BACK WHAT WAS RECEIVED
      debugSaved: updateduser.profileImageUrl  // ECHO BACK WHAT WAS SAVED
    });
  } catch (error) {
    res.status(500).json({ message: "Serer error", error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
