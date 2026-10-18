const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllOperators,
  updateOperatorApproval,
  getAllBookings,
  getBookingById,
  cancelBookingByAdmin,
  getDashboardStats,
} = require("../controllers/adminController");

const router = express.Router();

// Get all users - Admin only
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

// Get one user - Admin only
router.get(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  getUserById
);

// Activate / deactivate user - Admin only
router.patch(
  "/users/:id/status",
  protect,
  authorizeRoles("admin"),
  updateUserStatus
);

// Get all operators - Admin only
router.get(
  "/operators",
  protect,
  authorizeRoles("admin"),
  getAllOperators
);

// Approve / reject operator - Admin only
router.patch(
  "/operators/:id/approval",
  protect,
  authorizeRoles("admin"),
  updateOperatorApproval
);
router.get(
  "/bookings",
  protect,
  authorizeRoles("admin"),
  getAllBookings
);
router.get(
  "/bookings/:id",
  protect,
  authorizeRoles("admin"),
  getBookingById
);
router.patch(
  "/bookings/:id/cancel",
  protect,
  authorizeRoles("admin"),
  cancelBookingByAdmin
);
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

module.exports = router;