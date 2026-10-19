const Operator = require("../models/Operator");
const Bus = require("../models/Bus");
const Route = require("../models/route");
const Trip = require("../models/Trip");
const Seat = require("../models/Seat");
const Booking = require("../models/booking");
const Passenger = require("../models/Passenger");
const Payment = require("../models/payment");

// Create a new bus
const createBus = async (req, res) => {
  try {
    const {
      busNumber,
      busName,
      busType,
      seatType,
      totalSeats,
      amenities,
      boardingPoints,
      droppingPoints,
    } = req.body;

    if (!busNumber || !busName || !busType || !seatType || !totalSeats) {
      return res.status(400).json({
        message:
          "busNumber, busName, busType, seatType and totalSeats are required",
      });
    }

    const numericTotalSeats = Number(totalSeats);

    if (!Number.isInteger(numericTotalSeats) || numericTotalSeats <= 0) {
      return res.status(400).json({
        message: "totalSeats must be a positive whole number",
      });
    }

    const allowedBusTypes = ["AC", "Non-AC"];

    if (!allowedBusTypes.includes(busType)) {
      return res.status(400).json({
        message: "busType must be either AC or Non-AC",
      });
    }

    const allowedSeatTypes = [
      "Seater",
      "Sleeper",
      "Seater-Sleeper",
    ];

    if (!allowedSeatTypes.includes(seatType)) {
      return res.status(400).json({
        message:
          "seatType must be Seater, Sleeper or Seater-Sleeper",
      });
    }

    const cleanedBusNumber = busNumber.trim();

    if (
      cleanedBusNumber.length < 4 ||
      cleanedBusNumber.length > 20 ||
      !/^[A-Za-z0-9 -]+$/.test(cleanedBusNumber)
    ) {
      return res.status(400).json({
        message: "Invalid bus number",
      });
    }

    const cleanedBusName = busName.trim();

    if (cleanedBusName.length < 2 || cleanedBusName.length > 100) {
      return res.status(400).json({
        message: "Bus name must be between 2 and 100 characters",
      });
    }

    const normalizedBusNumber = cleanedBusNumber.toUpperCase();

    // Find operator using real MongoDB ObjectId
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const existingBus = await Bus.findOne({
      busNumber: normalizedBusNumber,
    });

    if (existingBus) {
      return res.status(400).json({
        message: "Bus number already exists",
      });
    }

    const bus = await Bus.create({
      operator: operator._id,
      busNumber: normalizedBusNumber,
      busName,
      busType,
      seatType,
      totalSeats: numericTotalSeats,
      amenities: amenities || [],
      boardingPoints: boardingPoints || [],
      droppingPoints: droppingPoints || [],
    });

    res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Create bus error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all buses belonging to the logged-in operator
const getMyBuses = async (req, res) => {
  try {
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const buses = await Bus.find({
      operator: operator._id,
    });

    res.status(200).json({
      message: "Buses fetched successfully",
      count: buses.length,
      buses,
    });
  } catch (error) {
    console.error("Get my buses error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Update a bus

const updateBus = async (req, res) => {
  try {
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const bus = await Bus.findOne({
      _id: req.params.id,
      operator: operator._id,
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found or you do not own this bus",
      });
    }

    const {
      busNumber,
      busName,
      busType,
      seatType,
      totalSeats,
      amenities,
      boardingPoints,
      droppingPoints,
    } = req.body;

    const allowedSeatTypes = [
      "Seater",
      "Sleeper",
      "Seater-Sleeper",
    ];

    const newSeatType = seatType ?? bus.seatType;
    const newTotalSeats =
      totalSeats === undefined
        ? bus.totalSeats
        : Number(totalSeats);

    if (!allowedSeatTypes.includes(newSeatType)) {
      return res.status(400).json({
        message:
          "seatType must be Seater, Sleeper or Seater-Sleeper",
      });
    }

    if (
      !Number.isInteger(newTotalSeats) ||
      newTotalSeats <= 0
    ) {
      return res.status(400).json({
        message: "totalSeats must be a positive whole number",
      });
    }

    const layoutChanged =
      newSeatType !== bus.seatType ||
      newTotalSeats !== bus.totalSeats;

   if (layoutChanged) {
  return res.status(400).json({
    message:
      "Seat layout changes are temporarily disabled while we protect existing bookings.",
  });
}

    if (busType !== undefined) {
      const allowedBusTypes = ["AC", "Non-AC"];

      if (!allowedBusTypes.includes(busType)) {
        return res.status(400).json({
          message: "busType must be either AC or Non-AC",
        });
      }

      bus.busType = busType;
    }

    if (seatType !== undefined) {
      bus.seatType = newSeatType;
    }

    if (totalSeats !== undefined) {
      bus.totalSeats = newTotalSeats;
    }

    if (busNumber !== undefined) {
      const cleanedBusNumber = String(busNumber).trim();

      if (
        cleanedBusNumber.length < 4 ||
        cleanedBusNumber.length > 20 ||
        !/^[A-Za-z0-9 -]+$/.test(cleanedBusNumber)
      ) {
        return res.status(400).json({
          message: "Invalid bus number",
        });
      }

      const normalizedBusNumber =
        cleanedBusNumber.toUpperCase();

      if (normalizedBusNumber !== bus.busNumber) {
        const existingBus = await Bus.findOne({
          busNumber: normalizedBusNumber,
          _id: { $ne: bus._id },
        });

        if (existingBus) {
          return res.status(400).json({
            message: "Bus number already exists",
          });
        }

        bus.busNumber = normalizedBusNumber;
      }
    }

    if (busName !== undefined) {
  if (typeof busName !== "string") {
    return res.status(400).json({
      message: "Bus name must be text",
    });
  }

  const cleanedBusName = busName.trim();

  if (cleanedBusName.length < 2 || cleanedBusName.length > 100) {
    return res.status(400).json({
      message: "Bus name must be between 2 and 100 characters",
    });
  }

  bus.busName = cleanedBusName;
}

    if (amenities !== undefined) {
  if (
    !Array.isArray(amenities) ||
    !amenities.every(
      (item) => typeof item === "string" && item.trim().length > 0
    )
  ) {
    return res.status(400).json({
      message: "Amenities must be an array of non-empty strings",
    });
  }

  bus.amenities = amenities.map((item) => item.trim());
}

    if (boardingPoints !== undefined) {
  if (
    !Array.isArray(boardingPoints) ||
    !boardingPoints.every(
      (point) => typeof point === "string" && point.trim().length > 0
    )
  ) {
    return res.status(400).json({
      message: "Boarding points must be an array of non-empty strings",
    });
  }

  bus.boardingPoints = boardingPoints.map((point) => point.trim());
}

    if (droppingPoints !== undefined) {
  if (
    !Array.isArray(droppingPoints) ||
    !droppingPoints.every(
      (point) => typeof point === "string" && point.trim().length > 0
    )
  ) {
    return res.status(400).json({
      message: "Dropping points must be an array of non-empty strings",
    });
  }

  bus.droppingPoints = droppingPoints.map((point) => point.trim());
}

    await bus.save();

    return res.status(200).json({
      message: "Bus updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Update bus error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update a trip
const updateTrip = async (req, res) => {
  try {
    const operator = await Operator.findOne({ user: req.user.id });

    if (!operator || !operator.isApproved) {
      return res.status(403).json({
        message: "Operator not approved"
      });
    }

    const { tripId } = req.params;
    const {
  journeyDate,
  departureTime,
  arrivalTime,
  fare,
  seaterFare,
  sleeperFare,
  status,
} = req.body;

    const trip = await Trip.findById(tripId).populate("bus");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    if (trip.status === "cancelled") {
  return res.status(400).json({
    message: "Cannot create seats for a cancelled trip",
  });
}

    if (!trip.bus || trip.bus.operator.toString() !== operator._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this trip"
      });
    }

    
const journeyDetailsChanged =
  journeyDate !== undefined ||
  departureTime !== undefined ||
  arrivalTime !== undefined;

if (journeyDetailsChanged) {
  const existingBookings = await Booking.findOne({
    trip: tripId,
    bookingStatus: "confirmed",
  });

  if (existingBookings) {
    return res.status(400).json({
      message:
        "Cannot change journey date or times because confirmed bookings exist.",
    });
  }
}


    if (journeyDate !== undefined) {
      const date = new Date(journeyDate);

      if (isNaN(date.getTime())) {
        return res.status(400).json({
          message: "Invalid journey date"
        });
      }

      trip.journeyDate = date;
    }

    if (departureTime !== undefined) {
      if (typeof departureTime !== "string" || !departureTime.trim()) {
        return res.status(400).json({
          message: "Invalid departure time"
        });
      }

      trip.departureTime = departureTime;
    }

    if (arrivalTime !== undefined) {
      if (typeof arrivalTime !== "string" || !arrivalTime.trim()) {
        return res.status(400).json({
          message: "Invalid arrival time"
        });
      }

      trip.arrivalTime = arrivalTime;
    }

    if (fare !== undefined) {
      if (!Number.isFinite(Number(fare)) || Number(fare) < 0) {
        return res.status(400).json({
          message: "Fare must be a valid non-negative number"
        });
      }

      trip.fare = Number(fare);
    }

    
if (seaterFare !== undefined) {
  if (seaterFare === "" || !Number.isFinite(Number(seaterFare)) || Number(seaterFare) < 0) {
    return res.status(400).json({
      message: "Seater fare must be a valid non-negative number",
    });
  }

  trip.seaterFare = Number(seaterFare);
}

if (sleeperFare !== undefined) {
  if (sleeperFare === "" || !Number.isFinite(Number(sleeperFare)) || Number(sleeperFare) < 0) {
    return res.status(400).json({
      message: "Sleeper fare must be a valid non-negative number",
    });
  }

  trip.sleeperFare = Number(sleeperFare);
}


    if (status !== undefined) {
      const allowedStatuses = [
        "scheduled",
        "started",
        "completed",
        "cancelled"
      ];
      if (trip.status === "cancelled" && status !== "cancelled") {
  return res.status(400).json({
    message: "A cancelled trip cannot be reactivated or changed to another status",
  });
}

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid trip status"
        });
      }
      if (status === "cancelled") {
  const existingBookings = await Booking.findOne({
    trip: tripId,
    bookingStatus: "confirmed"
  });

  if (existingBookings) {
    return res.status(400).json({
      message: "Cannot cancel trip with confirmed bookings"
    });
  }
}

      trip.status = status;
    }

    await trip.save();

    res.status(200).json({
      message: "Trip updated successfully",
      trip
    });
  } catch (error) {
    console.error("Update trip error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
// Delete a trip
const deleteTrip = async (req, res) => {
  try {
    const operator = await Operator.findOne({ user: req.user.id });

    if (!operator || !operator.isApproved) {
      return res.status(403).json({
        message: "Operator not approved"
      });
    }

    const { tripId } = req.params;

    const trip = await Trip.findById(tripId).populate("bus");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found"
      });
    }

    if (
      !trip.bus ||
      trip.bus.operator.toString() !== operator._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to delete this trip"
      });
    }

    // Prevent deletion if bookings exist
    const Booking = require("../models/booking");
    const existingBookings = await Booking.findOne({ trip: tripId });

    if (existingBookings) {
      return res.status(400).json({
        message: "Cannot delete a trip that has bookings"
      });
    }

    await Trip.findByIdAndDelete(tripId);

    res.status(200).json({
      message: "Trip deleted successfully"
    });
  } catch (error) {
    console.error("Delete trip error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// Delete a bus
const deleteBus = async (req, res) => {
  try {
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const bus = await Bus.findOne({
      _id: req.params.id,
      operator: operator._id,
    });

    if (!bus) {
      return res.status(404).json({
        message: "Bus not found or you do not own this bus",
      });
    }

    const existingTrips = await Trip.countDocuments({
      bus: bus._id,
    });

    if (existingTrips > 0) {
      return res.status(400).json({
        message: "Cannot delete a bus that has existing trips",
      });
    }

    await Bus.findByIdAndDelete(bus._id);

    res.status(200).json({
      message: "Bus deleted successfully",
    });
  } catch (error) {
    console.error("Delete bus error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Create a new route
const createRoute = async (req, res) => {
  try {
    const { from, to, distance, duration, stops } = req.body;

    if (!from || !to || !String(from).trim() || !String(to).trim()) {
      return res.status(400).json({
        message: "From and To are required",
      });
    }

    if (distance !== undefined) {
      const numericDistance = Number(distance);

      if (Number.isNaN(numericDistance) || numericDistance < 0) {
        return res.status(400).json({
          message: "Distance must be a valid number and cannot be negative",
        });
      }
    }

    if (duration !== undefined) {
      const cleanedDuration = String(duration).trim();

      if (cleanedDuration.length === 0 || cleanedDuration.length > 50) {
        return res.status(400).json({
          message: "Duration must be between 1 and 50 characters",
        });
      }
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return res.status(400).json({
        message: "From and To locations cannot be the same",
      });
    }

    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const existingRoute = await Route.findOne({
  from: {
    $regex: `^${escapeRegex(String(from).trim())}$`,
    $options: "i",
  },
  to: {
    $regex: `^${escapeRegex(String(to).trim())}$`,
    $options: "i",
  },
  isActive: true,
});

if (existingRoute) {
  return res.status(400).json({
    message: "This route already exists. Please enter a different From and To combination.",
  });
}

    const route = await Route.create({
      from: from.trim(),
      to: to.trim(),
      distance,
      duration,
      stops: stops || [],
    });

    res.status(201).json({
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    console.error("Create route error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};


 // Update an existing route
const updateRoute = async (req, res) => {
  try {
   const {
  from,
  to,
  distance,
  duration,
  stops,
  boardingPoints,
  droppingPoints,
} = req.body;

    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const route = await Route.findById(req.params.id);

if (!route || !route.isActive) {
  return res.status(404).json({
    message: "Route not found or inactive",
  });
}

const existingTrips = await Trip.exists({
  route: route._id,
  status: { $in: ["scheduled", "started"] },
});

if (existingTrips) {
  const changingRouteDetails =
    from !== undefined ||
    to !== undefined ||
    distance !== undefined ||
    duration !== undefined ||
    stops !== undefined;

  if (changingRouteDetails) {
    return res.status(400).json({
      message:
        "Cannot change route details because active trips use it. Boarding and dropping points can still be updated.",
    });
  }
}

    if (from !== undefined || to !== undefined) {
      const newFrom = String(from ?? route.from).trim();
      const newTo = String(to ?? route.to).trim();

      if (!newFrom || !newTo) {
        return res.status(400).json({
          message: "From and To are required",
        });
      }

      if (newFrom.toLowerCase() === newTo.toLowerCase()) {
        return res.status(400).json({
          message: "From and To locations cannot be the same",
        });
      }

      const duplicateRoute = await Route.findOne({
        _id: { $ne: route._id },
        from: { $regex: `^${newFrom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        to: { $regex: `^${newTo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        isActive: true,
      });

      if (duplicateRoute) {
        return res.status(400).json({
          message: "Route already exists",
        });
      }

      route.from = newFrom;
      route.to = newTo;
    }

    if (distance !== undefined) {
      const numericDistance = Number(distance);

      if (!Number.isFinite(numericDistance) || numericDistance < 0) {
        return res.status(400).json({
          message: "Distance must be a valid non-negative number",
        });
      }

      route.distance = numericDistance;
    }

    if (duration !== undefined) {
      const cleanedDuration = String(duration).trim();

      if (!cleanedDuration || cleanedDuration.length > 50) {
        return res.status(400).json({
          message: "Duration must be between 1 and 50 characters",
        });
      }

      route.duration = cleanedDuration;
    }

    
if (stops !== undefined) {
  if (!Array.isArray(stops)) {
    return res.status(400).json({
      message: "Stops must be an array",
    });
  }

  route.stops = stops;
}

if (boardingPoints !== undefined) {
  if (
    !Array.isArray(boardingPoints) ||
    boardingPoints.length > 2 ||
    boardingPoints.some(
      (point) => typeof point !== "string" || !point.trim()
    )
  ) {
    return res.status(400).json({
      message: "Provide up to 2 valid boarding points",
    });
  }

  route.boardingPoints = boardingPoints.map((point) => point.trim());
}

if (droppingPoints !== undefined) {
  if (
    !Array.isArray(droppingPoints) ||
    droppingPoints.length > 2 ||
    droppingPoints.some(
      (point) => typeof point !== "string" || !point.trim()
    )
  ) {
    return res.status(400).json({
      message: "Provide up to 2 valid dropping points",
    });
  }

  route.droppingPoints = droppingPoints.map((point) => point.trim());
}


    await route.save();

    return res.status(200).json({
      message: "Route updated successfully",
      route,
    });
  } catch (error) {
    console.error("Update route error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


// Get all active routes
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Routes fetched successfully",
      count: routes.length,
      routes,
    });
  } catch (error) {
    console.error("Get routes error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Create a new trip/schedule
const createTrip = async (req, res) => {
  try {
    const {
  bus,
  route,
  journeyDate,
  departureTime,
  arrivalTime,
  fare,
  seaterFare,
  sleeperFare,
} = req.body;

    if (
      !bus ||
      !route ||
      !journeyDate ||
      !departureTime ||
      !arrivalTime ||
      fare === undefined
    ) {
      return res.status(400).json({
        message:
          "bus, route, journeyDate, departureTime, arrivalTime and fare are required",
      });
    }

    const selectedJourneyDate = new Date(journeyDate);

    if (isNaN(selectedJourneyDate.getTime())) {
      return res.status(400).json({
        message: "Invalid journey date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedJourneyDate.setHours(0, 0, 0, 0);

    if (selectedJourneyDate < today) {
      return res.status(400).json({
        message: "Journey date cannot be in the past",
      });
    }

    
const numericSeaterFare = Number(seaterFare);
const numericSleeperFare = Number(sleeperFare);

if (
  seaterFare === "" ||
  seaterFare === undefined ||
  sleeperFare === "" ||
  sleeperFare === undefined ||
  !Number.isFinite(numericSeaterFare) ||
  !Number.isFinite(numericSleeperFare) ||
  numericSeaterFare < 0 ||
  numericSleeperFare < 0
) {
  return res.status(400).json({
    message: "Seater and Sleeper fares must be valid non-negative numbers",
  });
}

const numericFare = numericSeaterFare;


    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const selectedBus = await Bus.findOne({
      _id: bus,
      operator: operator._id,
    });
    const busCheck = await Bus.findById(bus);
console.log("Bus found:", busCheck);
console.log("Bus owner:", busCheck?.operator);
    console.log("Logged-in user ID:", req.user.id);
console.log("Operator profile ID:", operator?._id);
console.log("Bus ID from request:", bus);

    if (!selectedBus) {
      return res.status(404).json({
        message: "Bus not found or you do not own this bus",
      });
    }

    const selectedRoute = await Route.findOne({
      _id: route,
      isActive: true,
    });

    if (!selectedRoute) {
      return res.status(404).json({
        message: "Route not found or inactive",
      });
    }

    const existingTrip = await Trip.findOne({
      bus,
      route,
      journeyDate: new Date(journeyDate),
      departureTime,
    });

    if (existingTrip) {
      return res.status(400).json({
        message:
          "A trip with the same bus, route, date and departure time already exists",
      });
    }

    
const trip = await Trip.create({
  bus,
  route,
  journeyDate,
  departureTime,
  arrivalTime,
  fare: numericFare,
  seaterFare: numericSeaterFare,
  sleeperFare: numericSleeperFare,
});


    res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Create trip error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all trips belonging to the logged-in operator
const getMyTrips = async (req, res) => {
  try {
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const buses = await Bus.find({
      operator: operator._id,
    }).select("_id");

    const busIds = buses.map((bus) => bus._id);

    const trips = await Trip.find({
      bus: { $in: busIds },
    })
      .populate(
        "bus",
        "busNumber busName busType seatType totalSeats"
      )
      .populate(
        "route",
        "from to distance duration stops"
      )
      .sort({
        journeyDate: 1,
        departureTime: 1,
      });

    res.status(200).json({
      message: "Trips fetched successfully",
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get my trips error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Create seats for a trip
const createSeats = async (req, res) => {
  try {
    const { tripId } = req.params;

    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const trip = await Trip.findById(tripId).populate("bus");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (!trip.bus) {
      return res.status(404).json({
        message: "Bus not found for this trip",
      });
    }

    if (trip.bus.operator.toString() !== operator._id.toString()) {
      return res.status(403).json({
        message: "You do not own this trip",
      });
    }

    const existingSeats = await Seat.countDocuments({
      trip: trip._id,
    });

    if (existingSeats > 0) {
      return res.status(400).json({
        message: "Seats have already been created for this trip",
      });
    }

    

    const seatType = trip.bus.seatType;
const seats = [];

const half = Math.ceil(trip.bus.totalSeats / 2);

for (let i = 1; i <= trip.bus.totalSeats; i++) {
  let seatNumber;
  let individualSeatType;
  let position;

  if (seatType === "Seater") {
    seatNumber = `A${i}`;
    individualSeatType = "Seater";
    position = i % 4 === 1 || i % 4 === 0
      ? "Window"
      : "Aisle";
  } else if (seatType === "Sleeper") {
    seatNumber = `L${i}`;
    individualSeatType = "Sleeper";
    position = i % 2 === 1 ? "Lower" : "Upper";
  } else {
    if (i <= half) {
      seatNumber = `A${i}`;
      individualSeatType = "Seater";
      position = i % 4 === 1 || i % 4 === 0
        ? "Window"
        : "Aisle";
    } else {
      const sleeperNumber = i - half;
      seatNumber = `L${sleeperNumber}`;
      individualSeatType = "Sleeper";
      position = sleeperNumber % 2 === 1
        ? "Lower"
        : "Upper";
    }
  }

  seats.push({
    trip: trip._id,
    seatNumber,
    seatType: individualSeatType,
    position,
    status: "available",
    isLadiesOnly: false,
  });
}

    await Seat.insertMany(seats, { ordered: true });

    res.status(201).json({
      message: "Seats created successfully",
      count: seats.length,
      seats,
    });
  } catch (error) {
    console.error("Create seats error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all seats for a trip
const getTripSeats = async (req, res) => {
  try {
    const { tripId } = req.params;

    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    const trip = await Trip.findById(tripId).populate("bus");

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    if (!trip.bus) {
      return res.status(404).json({
        message: "Bus not found for this trip",
      });
    }

    if (trip.bus.operator.toString() !== operator._id.toString()) {
      return res.status(403).json({
        message: "You do not own this trip",
      });
    }

    const seats = await Seat.find({
      trip: tripId,
    }).sort({
      seatNumber: 1,
    });

    res.status(200).json({
      message: "Trip seats fetched successfully",
      count: seats.length,
      seats,
    });
  } catch (error) {
    console.error("Get trip seats error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
/// Get bookings for the logged-in operator's trips
const getMyBookings = async (req, res) => {
  try {
    // Find operator profile
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    // Only approved operators can view bookings
    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    // Find buses belonging to this operator
    const buses = await Bus.find({
      operator: operator._id,
    }).select("_id");

    const busIds = buses.map((bus) => bus._id);

    // Find trips belonging to this operator's buses
    const trips = await Trip.find({
      bus: { $in: busIds },
    }).select("_id");

    const tripIds = trips.map((trip) => trip._id);

    // Booking filter
    const filter = {
      trip: { $in: tripIds },
    };

    // Optional booking status filter
    if (req.query.status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "cancelled",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          message: "Invalid booking status",
        });
      }

      filter.bookingStatus = req.query.status;
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    // Total bookings matching the filter
    const totalBookings = await Booking.countDocuments(filter);

    // Fetch paginated bookings
    const bookings = await Booking.find(filter)
      .populate("user", "name email phone")
      .populate({
        path: "trip",
        populate: [
          {
            path: "bus",
            select:
              "busNumber busName busType seatType totalSeats",
          },
          {
            path: "route",
            select:
              "from to distance duration stops",
          },
        ],
      })
      .populate(
        "seats",
        "seatNumber seatType status isLadiesOnly"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Operator bookings fetched successfully",

      pagination: {
        page,
        limit,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        hasNextPage: page < Math.ceil(totalBookings / limit),
        hasPreviousPage: page > 1,
      },

      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get operator bookings error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Get revenue summary for the logged-in operator
const getRevenue = async (req, res) => {
  try {
    // Find operator profile
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    // Only approved operators can view revenue
    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    // Find buses belonging to this operator
    const buses = await Bus.find({
      operator: operator._id,
    }).select("_id");

    const busIds = buses.map((bus) => bus._id);

    // Find trips belonging to this operator
    const trips = await Trip.find({
      bus: { $in: busIds },
    }).select("_id");

    const tripIds = trips.map((trip) => trip._id);

    // Calculate booking statistics
    const totalBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
    });

    const confirmedBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
      bookingStatus: "confirmed",
    });

    const cancelledBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
      bookingStatus: "cancelled",
    });

    const paidBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
      paymentStatus: "paid",
    });

    const refundedBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
      paymentStatus: "refunded",
    });

    // Calculate actual revenue from paid bookings
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          trip: { $in: tripIds },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    res.status(200).json({
      message: "Operator revenue fetched successfully",
      revenue: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        paidBookings,
        refundedBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Get operator revenue error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Get revenue breakdown by trip
const getRevenueByTrip = async (req, res) => {
  try {
    // Find operator profile
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    // Only approved operators can view revenue
    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    // Find buses belonging to this operator
    const buses = await Bus.find({
      operator: operator._id,
    }).select("_id");

    const busIds = buses.map((bus) => bus._id);

    // Find trips belonging to this operator
    const trips = await Trip.find({
      bus: { $in: busIds },
    })
      .populate("bus", "busNumber busName")
      .populate("route", "from to")
      .sort({ journeyDate: -1 });

    const tripIds = trips.map((trip) => trip._id);

    // Get paid booking revenue grouped by trip
    const revenueData = await Booking.aggregate([
      {
        $match: {
          trip: { $in: tripIds },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: "$trip",
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Convert aggregation result into an easy lookup
    const revenueMap = {};

    revenueData.forEach((item) => {
      revenueMap[item._id.toString()] = {
        bookings: item.bookings,
        revenue: item.revenue,
      };
    });

    // Build response for every operator trip
    const result = trips.map((trip) => {
      const data = revenueMap[trip._id.toString()] || {
        bookings: 0,
        revenue: 0,
      };

      return {
        tripId: trip._id,
        journeyDate: trip.journeyDate,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        bus: trip.bus,
        route: trip.route,
        bookings: data.bookings,
        revenue: data.revenue,
      };
    });

    res.status(200).json({
      message: "Trip-wise revenue fetched successfully",
      count: result.length,
      trips: result,
    });
  } catch (error) {
    console.error("Get trip-wise revenue error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
}; 
// Get one booking for the logged-in operator
const getOperatorBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Find operator profile
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    // Only approved operators can view booking details
    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email phone")
      .populate({
        path: "trip",
        populate: [
          {
            path: "bus",
            select: "busNumber busName busType seatType totalSeats operator",
          },
          {
            path: "route",
            select: "from to distance duration stops",
          },
        ],
      })
      .populate(
        "seats",
        "seatNumber seatType status isLadiesOnly"
      );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Make sure this booking belongs to one of the operator's trips
    const trip = booking.trip;

    if (!trip || !trip.bus) {
      return res.status(404).json({
        message: "Trip or bus information not found",
      });
    }

    if (String(trip.bus.operator) !== String(operator._id)) {
      return res.status(403).json({
        message: "You do not have access to this booking",
      });
    }

    // Get passenger details
    const passengers = await Passenger.find({
      booking: booking._id,
    }).populate(
      "seat",
      "seatNumber seatType status isLadiesOnly"
    );

    // Get payment details
    const payment = await Payment.findOne({
      booking: booking._id,
    });

    res.status(200).json({
      message: "Operator booking details fetched successfully",
      booking,
      passengers,
      payment,
    });
  } catch (error) {
    console.error(
      "Get operator booking details error:",
      error.message
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};
// Get dashboard summary for the logged-in operator
const getDashboard = async (req, res) => {
  try {
    // Find operator profile
    const operator = await Operator.findOne({
      user: req.user.id,
    });

    if (!operator) {
      return res.status(404).json({
        message: "Operator profile not found",
      });
    }

    // Only approved operators can view dashboard
    if (!operator.isApproved) {
      return res.status(403).json({
        message: "Operator is not approved by admin",
      });
    }

    // Find operator's buses
    const buses = await Bus.find({
      operator: operator._id,
    }).select("_id");

    const busIds = buses.map((bus) => bus._id);

    // Find operator's trips
    const trips = await Trip.find({
      bus: { $in: busIds },
    }).select("_id");

    const tripIds = trips.map((trip) => trip._id);

    // Booking statistics
    const totalBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
    });

    const confirmedBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
      bookingStatus: "confirmed",
    });

    const cancelledBookings = await Booking.countDocuments({
      trip: { $in: tripIds },
      bookingStatus: "cancelled",
    });

    // Revenue
    const revenueResult = await Booking.aggregate([
      {
        $match: {
          trip: { $in: tripIds },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$totalAmount",
          },
        },
      },
    ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    // Upcoming trips
    const upcomingTrips = await Trip.find({
      bus: { $in: busIds },
      journeyDate: { $gte: new Date() },
      status: "scheduled",
    })
      .populate("bus", "busNumber busName")
      .populate("route", "from to")
      .sort({ journeyDate: 1 })
      .limit(5);

    res.status(200).json({
      message: "Operator dashboard fetched successfully",

      dashboard: {
        totalBuses: buses.length,
        totalTrips: trips.length,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        upcomingTrips,
      },
    });
  } catch (error) {
    console.error("Get operator dashboard error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const buildSeatsForBus = (tripId, seatType, totalSeats) => {
  const seats = [];
  const half = Math.ceil(totalSeats / 2);

  for (let i = 1; i <= totalSeats; i++) {
    let seatNumber;
    let individualSeatType;
    let position;

    if (seatType === "Seater") {
      seatNumber = `A${i}`;
      individualSeatType = "Seater";
      position = i % 4 === 1 || i % 4 === 0 ? "Window" : "Aisle";
    } else if (seatType === "Sleeper") {
      seatNumber = `L${i}`;
      individualSeatType = "Sleeper";
      position = i % 2 === 1 ? "Lower" : "Upper";
    } else {
      if (i <= half) {
        seatNumber = `A${i}`;
        individualSeatType = "Seater";
        position = i % 4 === 1 || i % 4 === 0 ? "Window" : "Aisle";
      } else {
        const sleeperNumber = i - half;
        seatNumber = `L${sleeperNumber}`;
        individualSeatType = "Sleeper";
        position = sleeperNumber % 2 === 1 ? "Lower" : "Upper";
      }
    }

    seats.push({
      trip: tripId,
      seatNumber,
      seatType: individualSeatType,
      position,
      status: "available",
      isLadiesOnly: false,
    });
  }

  return seats;
};

module.exports = {
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
};