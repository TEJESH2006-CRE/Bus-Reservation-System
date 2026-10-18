const Trip = require("../models/Trip");
const Route = require("../models/Route");

// Search buses with filters and sorting
const searchBuses = async (req, res) => {
  try {
    const {
      from,
      to,
      date,
      busType,
      seatType,
      maxPrice,
      sortBy,
    } = req.query;

    // Validate required fields
    if (!from || !to || !date) {
      return res.status(400).json({
        message: "from, to and date are required",
      });
    }

    // Find matching routes
    const routes = await Route.find({
      from: { $regex: `^${from}$`, $options: "i" },
      to: { $regex: `^${to}$`, $options: "i" },
      isActive: true,
    });

    if (routes.length === 0) {
      return res.status(200).json({
        message: "No buses found",
        count: 0,
        trips: [],
      });
    }

    const routeIds = routes.map((route) => route._id);

    // Create date range
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    // Build trip filter
    const tripFilter = {
      route: { $in: routeIds },
      journeyDate: {
        $gte: startDate,
        $lt: endDate,
      },
      status: "scheduled",
    };

    // Filter by maximum price
    if (maxPrice) {
      tripFilter.fare = { $lte: Number(maxPrice) };
    }

    // Find matching trips
    let trips = await Trip.find(tripFilter)
      .populate("bus")
      .populate("route");

    // Filter by bus type and seat type
    if (busType) {
      trips = trips.filter(
        (trip) => trip.bus && trip.bus.busType === busType
      );
    }

    if (seatType) {
      trips = trips.filter(
        (trip) => trip.bus && trip.bus.seatType === seatType
      );
    }

    // Sorting
    if (sortBy === "price_low") {
      trips.sort((a, b) => a.fare - b.fare);
    } else if (sortBy === "price_high") {
      trips.sort((a, b) => b.fare - a.fare);
    } else if (sortBy === "departure_early") {
      trips.sort((a, b) =>
        a.departureTime.localeCompare(b.departureTime)
      );
    } else if (sortBy === "departure_late") {
      trips.sort((a, b) =>
        b.departureTime.localeCompare(a.departureTime)
      );
    } else {
      // Default: earliest departure first
      trips.sort((a, b) =>
        a.departureTime.localeCompare(b.departureTime)
      );
    }

    res.status(200).json({
      message: "Buses fetched successfully",
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Search buses error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  searchBuses,
};