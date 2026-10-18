
const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const {
  sendBookingEmail,
  upload,
} = require("../controllers/emailController");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("pdf"),
  sendBookingEmail
);

module.exports = router;
