const express = require("express");


const {
  registerUser,
  registerOperator,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);
router.post("/register-operator", registerOperator);

// Login
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Test login route
router.post("/login-test", loginUser);

router.get("/profile", protect, getProfile);

router.patch("/profile", protect, updateProfile);

// Test auth route
router.get("/test", (req, res) => {
  res.json({
    message: "Auth routes are working",
  });
});

module.exports = router;