const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  createBus,
  getMyBuses,
  updateBus,
  updateTrip,
  deleteTrip,
  deleteBus,
  createRoute,
  updateRoute,
  getRoutes,
  createTrip,
  getMyTrips,
  createSeats,
  getTripSeats,
  getMyBookings,
  getRevenue,
  getRevenueByTrip,
  getOperatorBookingById,
  getDashboard,
} = require("../controllers/operatorController");

const router = express.Router();

// Create bus - Operator only
router.post(
  "/buses",
  protect,
  authorizeRoles("operator"),
  createBus
);

// Get my buses - Operator only
router.get(
  "/buses",
  protect,
  authorizeRoles("operator"),
  getMyBuses
);

// Update bus - Operator only
router.patch(
  "/buses/:id",
  protect,
  authorizeRoles("operator"),
  updateBus
);

// Delete bus - Operator only
router.delete(
  "/buses/:id",
  protect,
  authorizeRoles("operator"),
  deleteBus
);

// Create route - Operator only
router.post(
  "/routes",
  protect,
  authorizeRoles("operator"),
  createRoute
);

router.patch(
  "/routes/:id",
  protect,
  authorizeRoles("operator"),
  updateRoute
);
// Get all active routes - Operator only
router.get(
  "/routes",
  protect,
  authorizeRoles("operator"),
  getRoutes
);
router.delete(
  "/trips/:tripId",
  protect,
  authorizeRoles("operator"),
  deleteTrip
);

// Create trip/schedule - Operator only
router.post(
  "/trips",
  protect,
  authorizeRoles("operator"),
  createTrip
);

// Get my trips/schedules - Operator only
router.get(
  "/trips",
  protect,
  authorizeRoles("operator"),
  getMyTrips
);

router.put("/trips/:tripId", protect, authorizeRoles("operator"), updateTrip);
router.get(
  "/bookings",
  protect,
  authorizeRoles("operator"),
  getMyBookings
);

// Create seats for a trip - Operator only
router.post(
  "/trips/:tripId/seats",
  protect,
  authorizeRoles("operator"),
  createSeats
);

// Get seats for a trip - Operator only
router.get(
  "/trips/:tripId/seats",
  protect,
  authorizeRoles("operator"),
  getTripSeats
);
router.get(
  "/revenue",
  protect,
  authorizeRoles("operator"),
  getRevenue
);
router.get(
  "/revenue/by-trip",
  protect,
  authorizeRoles("operator"),
  getRevenueByTrip
);
router.get(
  "/bookings/:bookingId",
  protect,
  authorizeRoles("operator"),
  getOperatorBookingById
);
router.get(
  "/dashboard",
  protect,
  authorizeRoles("operator"),
  getDashboard
);


module.exports = router;