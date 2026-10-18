
const cron = require("node-cron");
const Trip = require("./models/Trip");

const updateCompletedTrips = async () => {
  try {
    const now = new Date();

    const trips = await Trip.find({
      status: { $in: ["scheduled", "started"] },
    });

    let updatedCount = 0;

    for (const trip of trips) {
      if (!trip.journeyDate || !trip.arrivalTime) continue;

      const [hours, minutes] = trip.arrivalTime
        .split(":")
        .map(Number);

      if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        continue;
      }

      // Journey dates are stored as UTC midnight.
      // Combine the date and arrival time using IST (UTC+05:30).
      const journeyDate = new Date(trip.journeyDate);
      const year = journeyDate.getUTCFullYear();
      const month = journeyDate.getUTCMonth();
      const day = journeyDate.getUTCDate();

      const arrivalDate = new Date(
        Date.UTC(year, month, day, hours - 5, minutes - 30)
      );

      if (arrivalDate <= now) {
        trip.status = "completed";
        await trip.save();
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} completed trip(s).`);
    }
  } catch (error) {
    console.error("Trip scheduler error:", error.message);
  }
};

const startTripScheduler = () => {
  updateCompletedTrips();

  cron.schedule("*/5 * * * *", updateCompletedTrips);
};

module.exports = startTripScheduler;
