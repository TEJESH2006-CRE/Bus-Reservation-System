const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const {
  lockSeat,
  releaseSeat,
  getSeatsByTrip,
  releaseExpiredLocks,
} = require("../controllers/seatController");

const router = express.Router();

router.use(async (req, res, next) => {
  try {
    await releaseExpiredLocks();
    next();
  } catch (error) {
    next(error);
  }
});

// Get all seats for a trip
router.get(
  "/trip/:tripId",
  protect,
  getSeatsByTrip
);

// Lock a seat for 10 minutes
router.post(
  "/:seatId/lock",
  protect,
  lockSeat
);

// Release a seat lock
router.post(
  "/:seatId/release",
  protect,
  releaseSeat
);


module.exports = router;