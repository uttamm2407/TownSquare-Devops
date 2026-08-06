const express = require("express");
const {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserComplaints
} = require("../controllers/userControllers");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// All routes are protected and admin-only
router.use(protect);
router.use(adminOnly);

router.route("/")
    .get(getAllUsers)
    .post(createUser);

router.route("/:id")
    .put(updateUser)
    .delete(deleteUser);

router.get("/:id/complaints", getUserComplaints);

module.exports = router;
