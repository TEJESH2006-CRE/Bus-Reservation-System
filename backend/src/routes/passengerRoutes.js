const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { addPassenger } = require("../controllers/passengerController");

const router = express.Router();

// Add passenger details
router.post(
  "/",
  protect,
  addPassenger
);

module.exports = router;