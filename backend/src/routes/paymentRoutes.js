const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { makePayment } = require("../controllers/paymentController");

const router = express.Router();

// Make mock payment
router.post(
  "/",
  protect,
  makePayment
);

module.exports = router;