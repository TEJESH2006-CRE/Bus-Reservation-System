const express = require("express");

const { searchBuses } = require("../controllers/searchController");

const router = express.Router();

// Search buses
router.get("/", searchBuses);

module.exports = router;