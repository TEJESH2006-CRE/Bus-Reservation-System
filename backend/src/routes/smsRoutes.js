const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { sendBookingSMS } = require("../controllers/smsController");

const router = express.Router();

router.post("/", protect, sendBookingSMS);

module.exports = router;