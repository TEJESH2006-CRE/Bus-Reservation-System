const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// Protected test route
router.get("/protected", protect, (req, res) => {
  res.json({
    message: "You are authorized!",
    user: req.user,
  });
});

// Admin-only test route
router.get(
  "/admin-only",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin! You have access.",
      user: req.user,
    });
  }
);

module.exports = router;