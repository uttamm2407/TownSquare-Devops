const User = require("../models/User");
const Complaint = require("../models/Complaint");
const bcrypt = require("bcrypt");

// @desc    Get all users (with search & pagination)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        if (role && role !== 'all') {
            query.role = role;
        }

        const users = await User.find(query)
            .select("-password")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a new user (Admin)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "member"
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update user details & status
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        if (req.body.isActive !== undefined) {
            user.isActive = req.body.isActive;
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            isActive: updatedUser.isActive
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.deleteOne();
        res.json({ message: "User removed" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get specific user's complaints
// @route   GET /api/users/:id/complaints
// @access  Private/Admin
const getUserComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ userId: req.params.id }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserComplaints
};
