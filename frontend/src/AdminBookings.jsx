import React, { useEffect, useState } from "react";

function AdminBookings({ setCurrentPage }) {
    const [bookings, setBookings] = useState([]);
    useEffect(() => {
  fetchBookings();
}, []);

const fetchBookings = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/admin/bookings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to fetch bookings");
      return;
    }

    setBookings(data.bookings || []);
  } catch (error) {
    alert("Cannot connect to the server.");
  }
};

const cancelBooking = async (bookingId) => {
  try {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/admin/bookings/${bookingId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to cancel booking");
      return;
    }

    alert(
      `Booking cancelled. Refund amount: ₹${data.refundAmount}`
    );

    setBookings((currentBookings) =>
      currentBookings.map((booking) =>
        booking._id === bookingId ? data.booking : booking
      )
    );
  } catch (error) {
    alert("Cannot connect to the server.");
  }
};
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        <button
          onClick={() => setCurrentPage("admin")}
          className="mb-6 rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white"
        >
          ← Back to Admin Dashboard
        </button>

        <h1 className="mb-2 text-3xl font-bold text-gray-800">
          Bookings
        </h1>

        <p className="mb-8 text-gray-600">
          View and manage all bookings.
        </p>

        <div className="rounded-xl bg-white p-6 shadow-md">
  <h2 className="mb-4 text-xl font-bold text-gray-800">
    All Bookings
  </h2>

  {bookings.length === 0 ? (
    <p className="text-gray-500">No bookings found.</p>
  ) : (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="rounded-lg border p-4"
        >
          <p className="font-semibold text-gray-800">
            PNR: {booking.pnr}
          </p>

          <p className="text-gray-600">
            Customer: {booking.user?.name}
          </p>

          <p className="text-gray-600">
            Email: {booking.user?.email}
          </p>

          <p className="text-gray-600">
            Journey Date:{" "}
            {booking.trip?.journeyDate
              ? new Date(booking.trip.journeyDate).toLocaleDateString()
              : "N/A"}
          </p>

          <p className="text-gray-600">
            Fare: ₹{booking.totalAmount}
          </p>

          <p className="text-gray-600">
            Status: {booking.bookingStatus}
          </p>
          {booking.bookingStatus === "confirmed" && (
  <button
    onClick={() => cancelBooking(booking._id)}
    className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
  >
    Cancel Booking
  </button>
)}
        </div>
      ))}
    </div>
  )}
</div>

      </div>
    </div>
  );
}

export default AdminBookings;