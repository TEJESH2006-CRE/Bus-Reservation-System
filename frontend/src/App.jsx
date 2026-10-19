
import { useState } from 'react'
import { jsPDF } from "jspdf";
import BookingCopilot from "./BookingCopilot";
import OperatorDashboard from "./OperatorDashboard";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminOperators from "./AdminOperators";
import AdminBookings from "./AdminBookings";
import ResetPassword from "./ResetPassword";

function SteeringWheelIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="h-9 w-9 fill-none stroke-current">
      <circle cx="20" cy="20" r="16" strokeWidth="3.5" />
      <circle cx="20" cy="20" r="4" strokeWidth="3" />
      <path d="M5 15h30M20 24v11M8 15l9 8m15-8-9 8" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function App() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
  })
  const [message, setMessage] = useState('')
  const [buses, setBuses] = useState([])
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [showPassengerForm, setShowPassengerForm] = useState(false)
  const [passengerName, setPassengerName] = useState('')
  const [passengers, setPassengers] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [showBookingHistory, setShowBookingHistory] = useState(false);
  const [bookingTab, setBookingTab] = useState("upcoming");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [passengerAge, setPassengerAge] = useState('')
  const [passengerGender, setPassengerGender] = useState('')
  const [passengerPhone, setPassengerPhone] = useState("");
  const [passengerEmail, setPassengerEmail] = useState("");
  const [availableSeats, setAvailableSeats] = useState([])
  const [loadingSeats, setLoadingSeats] = useState(false)
  const [pendingBooking, setPendingBooking] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
  const [currentPage, setCurrentPage] = useState('search');

  const resetPasswordMatch = window.location.pathname.match(
    /^\/reset-password\/([^/]+)$/
  );

  if (resetPasswordMatch) {
    return <ResetPassword />;
  }

  const fetchBookingHistory = async ({ silent = false } = {}) => {
  try {
    setHistoryLoading(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/bookings/my",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load bookings");
    }

    setBookingHistory(data.bookings || []);
    setShowBookingHistory(true);
    return true;
  } catch (error) {
    if (!silent) alert(error.message);
    return false;
  } finally {
    setHistoryLoading(false);
  }
};


const cancelBooking = async (bookingId) => {
  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this booking?"
  );

  if (!confirmCancel) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/bookings/${bookingId}/cancel`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Cancellation failed");
    }

    // Send cancellation email after successful cancellation.
    try {
      const currentUser =
        user || JSON.parse(localStorage.getItem("user") || "{}");

      if (!currentUser.email) {
        throw new Error("Customer email address is unavailable");
      }

      const emailResponse = await fetch(
        "http://localhost:5000/api/email",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: (() => {
            const formData = new FormData();

            formData.append("to", currentUser.email);
            formData.append(
              "subject",
              `BusGo Booking Cancellation - ${bookingId}`
            );
            formData.append(
              "message",
              `Hello ${currentUser.name || "Customer"},\n\nYour BusGo booking has been cancelled successfully.\n\nBooking ID: ${bookingId}\nPNR: ${
                data.booking?.pnr || data.pnr || "Please check your booking history"
              }\nRefund amount: ${
                data.refundAmount != null
                  ? `Rs. ${data.refundAmount}`
                  : "Please check your cancellation details"
              }\n\nPlease note that any refund is subject to the applicable cancellation policy and payment processing.\n\nThank you,\nBusGo Team`
            );

            return formData;
          })(),
        }
      );

      const emailData = await emailResponse.json();

      if (!emailResponse.ok) {
        throw new Error(emailData.message || "Cancellation email failed");
      }

      alert("Booking cancelled successfully! Cancellation email sent.");
    } catch (emailError) {
      console.error("Cancellation email error:", emailError);
      alert(
        "Booking cancelled successfully, but the cancellation email could not be sent."
      );
    }

    await fetchBookingHistory();
  } catch (error) {
    alert(error.message || "Cancellation failed");
  }
};


const deleteCompletedBooking = async (bookingId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to permanently delete this completed-trip booking?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/bookings/my/${bookingId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to delete booking");
    }

    alert(data.message);

    setBookingHistory((prev) =>
      prev.filter((booking) => booking._id !== bookingId)
    );
  } catch (error) {
    alert(error.message || "Something went wrong");
  }
};


const downloadTicketPDF = (
  ticket = confirmedTicket,
  trip = selectedTrip,
  ticketFrom = from,
  ticketTo = to,
  ticketDate = date
) => {
  if (!ticket || !trip) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const navy = [15, 23, 42];
  const blue = [37, 99, 235];
  const muted = [100, 116, 139];
  const margin = 16;
  const dateLabel = ticketDate
    ? new Date(ticketDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

  doc.setFillColor(...navy);
  doc.rect(0, 0, pageWidth, 44, "F");
  doc.setFillColor(...blue);
  doc.rect(0, 44, pageWidth, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("BUSGO", margin, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("YOUR JOURNEY, WELL PLANNED", margin, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("E-TICKET", pageWidth - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("BOOKING CONFIRMED", pageWidth - margin, 28, { align: "right" });

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, 55, pageWidth - margin * 2, 21, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("BOOKING REFERENCE / PNR", margin + 6, 63);
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text(String(ticket.pnr || "Not available"), margin + 6, 71);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(`Issued ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin - 6, 68, { align: "right" });

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 84, pageWidth - margin * 2, 48, 3, 3, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text("FROM", margin + 7, 94);
  doc.text("TO", pageWidth - margin - 7, 94, { align: "right" });
  doc.setFontSize(15);
  doc.setTextColor(...navy);
  doc.text(String(ticketFrom || "-"), margin + 7, 104, { maxWidth: 62 });
  doc.text(String(ticketTo || "-"), pageWidth - margin - 7, 104, { align: "right", maxWidth: 62 });
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 75, 105, pageWidth - margin - 75, 105);
  doc.setFillColor(...blue);
  doc.circle(pageWidth / 2, 105, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(String(trip.departureTime || "-"), margin + 7, 114);
  doc.text(String(trip.arrivalTime || "-"), pageWidth - margin - 7, 114, { align: "right" });
  doc.setFontSize(8);
  doc.setTextColor(...muted);
  doc.text(dateLabel, pageWidth / 2, 125, { align: "center" });

  const infoY = 140;
  const infoW = (pageWidth - margin * 2 - 6) / 3;
  const info = [
    ["BUS", trip.bus?.busName || "Bus"],
    ["BUS TYPE", trip.bus?.busType || trip.bus?.seatType || "-"],
    ["BUS NUMBER", trip.bus?.busNumber || "-"],
  ];
  info.forEach(([label, value], index) => {
    const x = margin + index * (infoW + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, infoY, infoW, 24, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(label, x + 4, infoY + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(String(value), x + 4, infoY + 17, { maxWidth: infoW - 8 });
  });

  const ticketAmenities = Array.isArray(trip.bus?.amenities)
    ? trip.bus.amenities.filter(Boolean)
    : [];
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(margin, 168, pageWidth - margin * 2, 17, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...blue);
  doc.text("ONBOARD AMENITIES", margin + 5, 175);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(ticketAmenities.length ? ticketAmenities.join("  ·  ") : "Amenities not listed", margin + 5, 181, {
    maxWidth: pageWidth - margin * 2 - 10,
  });

  let y = 190;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...navy);
  doc.text("Passenger details", margin, y);
  y += 6;

  ticket.passengers.forEach((passenger, index) => {
    if (y + 20 > 270) {
      doc.addPage();
      doc.setFillColor(...navy);
      doc.rect(0, 0, pageWidth, 20, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("PASSENGER DETAILS · CONTINUED", margin, 13);
      y = 30;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 2, 2, "FD");
    doc.setFillColor(...blue);
    doc.roundedRect(margin + 4, y + 4, 17, 10, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`SEAT ${passenger.seatNumber || "-"}`, margin + 12.5, y + 10.5, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(...navy);
    doc.text(String(passenger.name || `Passenger ${index + 1}`), margin + 26, y + 8, { maxWidth: 92 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`${passenger.age || "-"} yrs  ·  ${passenger.gender || "-"}  ·  ${passenger.phone || "-"}`, margin + 26, y + 14, { maxWidth: pageWidth - margin * 2 - 57 });
    y += 20;
  });

  if (y + 25 > 282) {
    doc.addPage();
    y = 30;
  }
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y + 2, pageWidth - margin * 2, 23, 3, 3, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text("TOTAL PAID", margin + 7, y + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(`INR ${ticket.fare}`, pageWidth - margin - 7, y + 17, { align: "right" });

  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text("Thank you for travelling with BusGo", margin, pageHeight - 8);
    doc.text(`${page} / ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  const fileId = ticket.pnr || ticket.bookingId;
  doc.save(`Bus-Ticket-${fileId}.pdf`);
};

const downloadBookingPDF = (booking = selectedBooking) => {
  if (!booking) return;

  const trip = booking.trip || {};
  const passengerRecords = Array.isArray(booking.passengers)
    ? booking.passengers
    : [];
  const passengers = passengerRecords.length
    ? passengerRecords.map((passenger) => ({
        seatNumber:
          passenger.seat?.seatNumber ||
          booking.seats?.find(
            (seat) => String(seat._id) === String(passenger.seat?._id || passenger.seat)
          )?.seatNumber ||
          "-",
        name: passenger.name || "Passenger",
        age: passenger.age,
        gender: passenger.gender,
        phone: passenger.phone,
      }))
    : (booking.seats || []).map((seat, index) => ({
        seatNumber: seat.seatNumber || "-",
        name: `Passenger ${index + 1}`,
        age: "-",
        gender: "-",
        phone: "-",
      }));

  const ticket = {
    bookingId: booking._id,
    pnr: booking.pnr,
    fare: booking.totalAmount,
    passengers,
  };

  downloadTicketPDF(
    ticket,
    trip,
    trip.route?.from,
    trip.route?.to,
    trip.journeyDate
  );
};
const emailBookingTicket = async (booking) => {
  if (!booking) return;

  try {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, pageWidth, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("BUS RESERVATION", pageWidth / 2, 13, {
      align: "center",
    });

    doc.setFontSize(9);
    doc.text("E-TICKET / BOOKING CONFIRMATION", pageWidth / 2, 23, {
      align: "center",
    });

    doc.setTextColor(22, 101, 52);
    doc.setFontSize(12);
    doc.text("BOOKING DETAILS", 20, 45);

    const addDetail = (label, value, x, y) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(label, x, y);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(String(value ?? "-"), x, y + 8);
    };

    addDetail("PNR", booking.pnr, 25, 60);
    addDetail("FROM", booking.trip?.route?.from, 25, 85);
    addDetail("TO", booking.trip?.route?.to, 115, 85);

    addDetail(
      "JOURNEY DATE",
      booking.trip?.journeyDate
        ? new Date(booking.trip.journeyDate).toLocaleDateString()
        : "-",
      25,
      110
    );

    addDetail("DEPARTURE", booking.trip?.departureTime, 115, 110);
    addDetail("ARRIVAL", booking.trip?.arrivalTime, 25, 135);

    addDetail(
      "SEATS",
      booking.seats?.map((seat) => seat.seatNumber).join(", "),
      115,
      135
    );

    doc.setFillColor(22, 101, 52);
    doc.roundedRect(20, 165, 170, 20, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TOTAL FARE", 28, 178);
    doc.text(`Rs. ${booking.totalAmount}`, 180, 178, {
      align: "right",
    });

    const pdfBlob = doc.output("blob");
    const formData = new FormData();

    formData.append(
      "pdf",
      pdfBlob,
      `Bus-Ticket-${booking.pnr || booking._id}.pdf`
    );
    formData.append(
  "to",
  user?.email || JSON.parse(localStorage.getItem("user") || "{}").email || ""
);
    formData.append("subject", `Your Bus E-Ticket - ${booking.pnr}`);
    formData.append(
      "message",
      `Your bus booking is confirmed.\nPNR: ${booking.pnr}\nTotal fare: Rs. ${booking.totalAmount}`
    );

    const response = await fetch(
      "http://localhost:5000/api/email",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Email sending failed");
    }

    alert("E-ticket email sent successfully!");
  } catch (error) {
    console.error("E-ticket email error:", error);
    alert(error.message || "Failed to send e-ticket email");
  }
};


  const [token, setToken] = useState(
  localStorage.getItem('token') || ''
)
const [user, setUser] = useState(
  JSON.parse(localStorage.getItem('user') || 'null')
)
const [authMode, setAuthMode] = useState('')
const [authEmail, setAuthEmail] = useState('')
const [authPassword, setAuthPassword] = useState('')
const [authName, setAuthName] = useState('')
const [authPhone, setAuthPhone] = useState('')

async function handleAuth() {
  try {
    const endpoint =
      authMode === 'register' ? 'register' : 'login'

    const payload =
      authMode === 'register'
        ? {
            name: authName,
            email: authEmail,
            phone: authPhone,
            password: authPassword,
          }
        : {
            email: authEmail,
            password: authPassword,
          }

    const response = await fetch(
      `http://localhost:5000/api/auth/${endpoint}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()
    console.log('Registration response:', data)

    if (!response.ok) {
      setMessage(data.message || 'Authentication failed.')
      return
    }

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    setToken(data.token)
setUser(data.user)

if (data.user.role === 'operator') {
  setCurrentPage('operator')
} else if (data.user.role === 'admin') {
  setCurrentPage('admin')
} else {
  setCurrentPage('search')
}

setAuthMode('')
    setAuthEmail('')
    setAuthPassword('')
    setAuthName('')
    setAuthPhone('')
    setMessage(data.message)
  } catch (error) {
    setMessage('Cannot connect to the server.')
  }
}

async function fetchSeats(tripId) {
  try {
    setLoadingSeats(true)
    setMessage('Loading seats...')

    const response = await fetch(
      `http://localhost:5000/api/seats/trip/${tripId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message || 'Failed to load seats.')
      return
    }

    setAvailableSeats(data.seats || [])
    console.log("Loaded seats:", data.seats)
    console.log(
  "Seat labels:",
  data.seats?.map((seat) => ({
    seatNumber: seat.seatNumber,
    seatType: seat.seatType,
    position: seat.position,
  }))
)
    setSelectedSeats([])
    setMessage('Seats loaded successfully.')
  } catch (error) {
    setMessage('Cannot connect to the server.')
  } finally {
    setLoadingSeats(false)
  }
}

async function lockSeat(seatId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/seats/${seatId}/lock`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.message || 'Could not lock seat.')
      return false
    }

    return true
  } catch (error) {
    setMessage('Cannot connect to the server.')
    return false
  }
}

async function toggleSeat(seat) {
  const isSelected = selectedSeats.includes(seat._id);

  if (isSelected) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/seats/${seat._id}/release`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.message || "Could not release seat.");
        return;
      }

      setSelectedSeats((prev) => prev.filter((id) => id !== seat._id));
      setAvailableSeats((prev) => prev.map((item) =>
        item._id === seat._id ? { ...item, status: "available" } : item
      ));
      return;
    } catch (error) {
      setMessage("Cannot connect to the server.");
      return;
    }
  }

  if (selectedSeats.length >= 6) {
    alert("You can select a maximum of 6 seats.");
    return;
  }

  const success = await lockSeat(seat._id);
  if (success) {
    setSelectedSeats((prev) => [...prev, seat._id]);
    setAvailableSeats((prev) => prev.map((item) =>
      item._id === seat._id ? { ...item, status: "locked" } : item
    ));
  }
}

function renderBerthSeat(seat, index, deck) {
  const isSelected = selectedSeats.includes(seat._id);
  const isUnavailable = seat.status !== "available" && !isSelected;
  const fare = selectedTrip.sleeperFare ?? selectedTrip.fare;
  const isLadiesSeat = Boolean(seat.isLadiesOnly);

  return (
    <div
      key={seat._id}
      style={{ gridColumn: [1, 3, 4][index % 3], gridRow: Math.floor(index / 3) + 1 }}
      className="flex min-w-0 flex-col items-center"
    >
      <button
        type="button"
        disabled={isUnavailable}
        onClick={() => toggleSeat(seat)}
        aria-pressed={isSelected}
        aria-label={`${seat.seatNumber}, ${deck} berth, ${isUnavailable ? "sold" : `₹${fare}`}`}
        className={`relative flex h-28 w-full max-w-[72px] flex-col items-center justify-between overflow-hidden rounded-xl border bg-white px-2 py-2 transition ${
          isUnavailable
            ? "border-slate-200 bg-slate-200 text-slate-400"
            : isSelected
            ? isLadiesSeat
              ? "border-pink-500 text-pink-500 shadow-sm"
              : "border-blue-600 text-blue-600 shadow-sm"
            : "border-emerald-600 text-slate-700 hover:bg-emerald-50"
        }`}
      >
        <span className="text-[11px] font-semibold">{seat.seatNumber}</span>
        {isUnavailable ? (
          <span className="text-3xl font-light leading-none text-slate-400">×</span>
        ) : isSelected ? (
          <span className="text-2xl font-medium leading-none">{isLadiesSeat ? "♀" : "✓"}</span>
        ) : (
          <span className="h-2 w-full rounded-full bg-emerald-100" />
        )}
      </button>
      <span className={`mt-1 text-xs ${isUnavailable ? "text-slate-400" : "text-slate-600"}`}>
        {isUnavailable ? "Sold" : `₹${fare}`}
      </span>
    </div>
  );
}


async function handleBooking() {
  if (!selectedTrip || selectedSeats.length === 0) {
    alert("Please select at least one seat.");
    return;
  }

  if (
    passengers.length !== selectedSeats.length ||
    passengers.some(
      (p) =>
        !p.name.trim() ||
        !p.age ||
        Number(p.age) <= 0 ||
        !p.gender ||
        !p.phone.trim()
    )
  ) {
    alert("Please fill in all passenger details.");
    return;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Step 1: Create booking
    const bookingResponse = await fetch(
      "http://localhost:5000/api/bookings",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          tripId: selectedTrip._id,
          seatIds: selectedSeats,
        }),
      }
    );

    const bookingData = await bookingResponse.json();

    if (!bookingResponse.ok) {
      throw new Error(bookingData.message || "Booking failed");
    }

    const bookingId = bookingData.booking._id;

    // Step 2: Open payment screen
    setPendingBooking({
      bookingId,
      seatIds: selectedSeats,
    });

    setShowPayment(true);
    setCurrentPage("payment");
  } catch (error) {
    console.error("Booking error:", error);
    alert(error.message);
  }
}

async function handleDemoPayment() {
  if (!pendingBooking) {
    alert("No pending booking found.");
    return;
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Step 1: Process demo payment
    const paymentResponse = await fetch(
      "http://localhost:5000/api/payments",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          bookingId: pendingBooking.bookingId,
        }),
      }
    );

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      throw new Error(paymentData.message || "Payment failed");
    }

    // Step 2: Save each passenger
    for (const passenger of passengers) {
      const passengerResponse = await fetch(
        "http://localhost:5000/api/passengers",
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            bookingId: pendingBooking.bookingId,
            seatId: passenger.seatId,
            name: passenger.name.trim(),
            age: Number(passenger.age),
            gender: passenger.gender,
            phone: passenger.phone.trim(),
          }),
        }
      );

      const passengerData = await passengerResponse.json();

      if (!passengerResponse.ok) {
        throw new Error(
          passengerData.message || "Could not save passenger details"
        );
      }
    }

    // Step 3: Prepare ticket details
    const ticketDetails = {
      bookingId: pendingBooking.bookingId,
      passengers: passengers.map((passenger) => ({
        seatNumber:
          availableSeats.find(
            (seat) => seat._id === passenger.seatId
          )?.seatNumber || passenger.seatId,
        name: passenger.name,
        age: passenger.age,
        gender: passenger.gender,
        phone: passenger.phone,
        email: passenger.email,
      })),
      fare: Number(selectedTrip?.fare) * passengers.length,
      pnr: paymentData.booking?.pnr,
    };
    setConfirmedTicket(ticketDetails);

    
try {
  const emailDoc = new jsPDF();
  const pageWidth = emailDoc.internal.pageSize.getWidth();

  emailDoc.setFillColor(22, 101, 52);
  emailDoc.rect(0, 0, pageWidth, 30, "F");

  emailDoc.setTextColor(255, 255, 255);
  emailDoc.setFont("helvetica", "bold");
  emailDoc.setFontSize(18);
  emailDoc.text("BUS RESERVATION", pageWidth / 2, 13, {
    align: "center",
  });

  emailDoc.setFontSize(9);
  emailDoc.text("E-TICKET / BOOKING CONFIRMATION", pageWidth / 2, 23, {
    align: "center",
  });

  emailDoc.setTextColor(22, 101, 52);
  emailDoc.setFontSize(12);
  emailDoc.text("BOOKING DETAILS", 20, 45);

  const addEmailDetail = (label, value, x, y) => {
    emailDoc.setFont("helvetica", "normal");
    emailDoc.setFontSize(9);
    emailDoc.setTextColor(100, 100, 100);
    emailDoc.text(label, x, y);

    emailDoc.setFont("helvetica", "bold");
    emailDoc.setFontSize(11);
    emailDoc.setTextColor(40, 40, 40);
    emailDoc.text(String(value ?? "-"), x, y + 8);
  };

  addEmailDetail("PNR", paymentData.booking?.pnr, 25, 60);
  addEmailDetail("FROM", selectedTrip?.route?.from || from, 25, 85);
  addEmailDetail("TO", selectedTrip?.route?.to || to, 115, 85);
  addEmailDetail("DEPARTURE", selectedTrip?.departureTime, 25, 110);
  addEmailDetail("ARRIVAL", selectedTrip?.arrivalTime, 115, 110);
  addEmailDetail("JOURNEY DATE", date, 25, 135);
  addEmailDetail("TOTAL FARE", Number(selectedTrip?.fare) * passengers.length, 115, 135);

  let passengerY = 165;

  passengers.forEach((passenger, index) => {
    if (passengerY > 255) {
      emailDoc.addPage();
      passengerY = 25;
    }

    const seatNumber =
      availableSeats.find((seat) => seat._id === passenger.seatId)?.seatNumber ||
      passenger.seatId;

    addEmailDetail(`PASSENGER ${index + 1}`, passenger.name, 25, passengerY);
    addEmailDetail("SEAT", seatNumber, 115, passengerY);
    passengerY += 25;
  });

  emailDoc.setFontSize(8);
  emailDoc.setTextColor(100, 100, 100);
  emailDoc.text(
    "Thank you for booking with us!",
    pageWidth / 2,
    285,
    { align: "center" }
  );

  const pdfBlob = emailDoc.output("blob");
  const formData = new FormData();

  formData.append(
    "pdf",
    pdfBlob,
    `Bus-Ticket-${paymentData.booking?.pnr || pendingBooking.bookingId}.pdf`
  );
  formData.append("to", user?.email || "");
  formData.append(
    "subject",
    `Your Bus E-Ticket - ${paymentData.booking?.pnr || ""}`
  );
  formData.append(
    "message",
    `Your payment was successful and your booking is confirmed.\nPNR: ${paymentData.booking?.pnr || "Not available"}`
  );

  const emailResponse = await fetch("http://localhost:5000/api/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const emailData = await emailResponse.json();

  if (!emailResponse.ok) {
    throw new Error(emailData.message || "Ticket email failed");
  }

  alert("Payment successful! Your e-ticket has been emailed.");
} catch (emailError) {
  console.error("Ticket email error:", emailError);
  alert(
    "Payment succeeded, but the ticket email could not be sent. Please contact support."
  );
}


    downloadTicketPDF(ticketDetails);
    setShowPayment(false);
    setPendingBooking(null);
    setShowTicket(true);
    setCurrentPage("confirmation");
    setSelectedSeats([]);
    setShowPassengerForm(false);
    setPassengers([]);
    setPassengerName("");
    setPassengerAge("");
    setPassengerGender("");
    setPassengerPhone("");
    setPassengerEmail("");
  } catch (error) {
    console.error("Payment error:", error);
    alert(error.message);
  }
}
  
async function handleSearch() {
  if (!from.trim() || !to.trim() || !date) {
    setMessage('Please enter From, To, and Journey Date.')
    return
  }

  if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
    setMessage('From and To locations must be different.')
    return
  }

  try {
    setMessage('Searching buses...')

    const params = new URLSearchParams({
      from: from.trim(),
      to: to.trim(),
      date: date,
    })

    const response = await fetch(
      `http://localhost:5000/api/search?${params.toString()}`
    )

    const data = await response.json()
    setBuses(data.trips || [])

    if (!response.ok) {
      setMessage(data.message || 'Something went wrong.')
      return
    }

    if (data.count === 0) {
      setMessage('No buses found for this journey.')
      return
    }

    setMessage(`Success! Found ${data.count} buses.`)
    setCurrentPage("search")
    console.log('Bus search results:', data.trips)
  } catch (error) {
    setMessage('Cannot connect to the server.')
  }
}

const focusCopilotElement = (elementId) => {
  window.setTimeout(() => {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof element.focus === "function") element.focus({ preventScroll: true });
    element.classList.add("busgo-copilot-focus");
    window.setTimeout(() => element.classList.remove("busgo-copilot-focus"), 1800);
  }, 100);
};

const navigateFromCopilot = async (target) => {
  if (target === "login" || !token) {
    setAuthMode("login");
    return "login";
  }

  if (target === "search") {
    setAuthMode("");
    setCurrentPage("search");
    focusCopilotElement("busgo-search-from");
    return "opened";
  }

  if (target === "results") {
    setCurrentPage("search");
    focusCopilotElement("busgo-first-view-seats");
    return "choose-bus";
  }

  if (target === "seats") {
    if (currentPage === "payment" || currentPage === "confirmation") return "locked";
    if (currentPage === "seats" && selectedTrip) {
      focusCopilotElement("busgo-seat-layout");
      return "seat-map";
    }
    if (currentPage === "passenger" && selectedTrip) {
      setCurrentPage("seats");
      focusCopilotElement("busgo-seat-layout");
      return "seat-map";
    }
    setCurrentPage("search");
    if (buses.length > 0) {
      focusCopilotElement("busgo-first-view-seats");
      return "choose-bus";
    }
    focusCopilotElement("busgo-search-from");
    return "search-first";
  }

  if (target === "passenger") {
    if (currentPage !== "passenger") return "unavailable";
    focusCopilotElement("busgo-passenger-details");
    return "passenger";
  }

  if (target === "pay") {
    if (currentPage === "payment" && showPayment && pendingBooking) {
      focusCopilotElement("busgo-pay-now");
      return "payment";
    }
    if (currentPage === "passenger") {
      focusCopilotElement("busgo-confirm-booking");
      return "passenger";
    }
    return "not-ready";
  }

  if (target === "confirmation") {
    if (currentPage === "confirmation" && confirmedTicket) {
      focusCopilotElement("busgo-download-confirmed-ticket");
      return "confirmation";
    }
    return "unavailable";
  }

  return "unavailable";
};

const openBookingsFromCopilot = async () => {
  if (!token || (user?.role && user.role !== "customer")) return false;
  const loaded = await fetchBookingHistory({ silent: true });
  if (!loaded) return false;
  setCurrentPage("bookings");
  focusCopilotElement("busgo-bookings");
  return true;
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between bg-blue-700 px-8 py-4 text-white">
        <h1 className="text-2xl font-bold">BusGo</h1>

        <div className="flex items-center gap-6">
          {user?.role === "operator" && (
  <button
    onClick={() => setCurrentPage("operator")}
    className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
  >
    Operator Dashboard
  </button>
)}

{user?.role === "admin" && (
  <button
    onClick={() => setCurrentPage("admin")}
    className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
  >
    Admin Dashboard
  </button>
)}
        <button
  onClick={() => {
    if (user?.role === "operator") {
      setCurrentPage("operator");
    } else if (user?.role === "admin") {
      setCurrentPage("admin");
    } else {
      setCurrentPage("search");
    }

    setShowBookingHistory(false);
  }}
  className="hover:text-yellow-300"
>
  Home
</button>
         <button
  onClick={async () => {
  await fetchBookingHistory();
  setCurrentPage("bookings");
}}
>
  {historyLoading ? "Loading..." : "My Bookings"}
</button>
          {user ? (
  <div className="flex items-center gap-3">
    <span>Hi, {user.name}</span>
    <button
      onClick={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken('')
        setUser(null)
        setCurrentPage('search')
        setShowBookingHistory(false)
        setAuthMode('register')
        setMessage('Logged out successfully.')
      }}
      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700"
    >
      Logout
    </button>
  </div>
) : (
  <>
    <button
      onClick={() => setAuthMode('login')}
      className="hover:text-yellow-300"
    >
      Login
    </button>
    <button
      onClick={() => setAuthMode('register')}
      className="rounded-lg bg-white px-4 py-2 font-semibold text-blue-700"
    >
      Register
    </button>
  </>
)}
        </div>
      </nav>
      {currentPage === "operator" && <OperatorDashboard />}
      {currentPage === "admin" && (
  <AdminDashboard setCurrentPage={setCurrentPage} />
)}
      {currentPage === "admin-users" && (
  <AdminUsers setCurrentPage={setCurrentPage} />
)}
{currentPage === "admin-operators" && (
  <AdminOperators setCurrentPage={setCurrentPage} />
)}
{currentPage === "admin-bookings" && (
  <AdminBookings setCurrentPage={setCurrentPage} />
)}
      {authMode && (
  <div className="mx-auto mt-6 max-w-md rounded-xl bg-white p-6 shadow-lg">
    <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
      {authMode === 'login' ? 'Login to BusGo' : 'Create Your Account'}
    </h2>

    <div className="space-y-4">
      {authMode === 'register' && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={authName}
            onChange={(e) => setAuthName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={authPhone}
            onChange={(e) => setAuthPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3"
          />
        </>
      )}

      
<input
  type="email"
  placeholder="Email Address"
  value={authEmail}
  onChange={(e) => setAuthEmail(e.target.value)}
  autoComplete="off"
  name="login-email"
  className="w-full rounded-lg border border-gray-300 p-3"
/>

      <input
        type="password"
        placeholder="Password"
        value={authPassword}
        onChange={(e) => setAuthPassword(e.target.value)}
        autoComplete="new-password"
        className="w-full rounded-lg border border-gray-300 p-3"
      />

      
      {authMode === 'login' && (
        <div className="text-right">
          <button
            type="button"
            
onClick={async () => {
  if (!authEmail.trim()) {
    alert('Please enter your email address first.');
    return;
  }

  try {
    const response = await fetch(
      'http://localhost:5000/api/auth/forgot-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authEmail.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Unable to process request.');
      return;
    }

    alert(data.message);
  } catch (error) {
    alert('Unable to connect to the server. Please try again.');
  }
}}

            className="text-sm text-blue-700 hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      )}


      <button
        onClick={handleAuth}
        className="w-full rounded-lg bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800"
      >
        {authMode === 'login' ? 'Login' : 'Register'}
      </button>

      <button
        onClick={() =>
          setAuthMode(authMode === 'login' ? 'register' : 'login')
        }
        className="w-full text-blue-700 hover:underline"
      >
        {authMode === 'login'
          ? 'Create a new account'
          : 'Already have an account? Login'}
      </button>

     <button onClick={() => {
  setAuthMode('')
  setAuthEmail('')
  setAuthPassword('')
  setAuthName('')
  setAuthPhone('')
}}>
  Close
</button>
    </div>
  </div>
)}
{/* My Bookings Section */}
{currentPage === "bookings" && showBookingHistory && (
  <section id="busgo-bookings" className="mx-auto mb-8 max-w-5xl rounded-xl bg-white p-6 shadow-md">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-800">
        My Bookings
      </h2>

      <button
        onClick={() => {
          setShowBookingHistory(false);
          setCurrentPage("search");
        }}
        className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
      >
        Close
      </button>
    </div>
    <div className="mt-6 mb-4 flex gap-3">
  <button
    onClick={() => setBookingTab("upcoming")}
    className={`rounded-lg px-5 py-2 font-semibold ${
      bookingTab === "upcoming"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Upcoming
  </button>

  <button
    onClick={() => setBookingTab("completed")}
    className={`rounded-lg px-5 py-2 font-semibold ${
      bookingTab === "completed"
        ? "bg-blue-600 text-white"
        : "bg-gray-200 text-gray-700"
    }`}
  >
    Completed
  </button>
</div>

    {bookingHistory.length === 0 ? (
      <p className="mt-4 text-gray-600">No bookings found.</p>
    ) : (
      <div className="mt-4 space-y-4">
        {bookingHistory
  .filter((booking) => {
    if (booking.bookingStatus === "cancelled") return false;

    const journeyDate = new Date(booking.trip?.journeyDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingTab === "upcoming") {
      return journeyDate >= today;
    }

    return journeyDate < today;
  })
  .map((booking) => (
          <div
            key={booking._id}
            className="rounded-lg border border-gray-200 p-4"
          >{console.log("Booking trip:", booking.trip)}
          <p className="mb-2 text-lg font-bold text-blue-700">
  {booking.trip?.route?.from || "Unknown"} →{" "}
  {booking.trip?.route?.to || "Unknown"}
</p>
            <p><strong>PNR:</strong> {booking.pnr || "Not available"}</p>
            <p>
              <strong>Journey Date:</strong>{" "}
              {booking.trip?.journeyDate
                ? new Date(booking.trip.journeyDate).toLocaleDateString()
                : "Not available"}
            </p>
            <p>
              <strong>Departure:</strong>{" "}
              {booking.trip?.departureTime || "Not available"}
            </p>
            <p>
              <strong>Seats:</strong>{" "}
              {booking.seats?.map((seat) => seat.seatNumber).join(", ") || "Not available"}
            </p>
            <p><strong>Total:</strong> ₹{booking.totalAmount}</p>
            <button
  onClick={() => downloadBookingPDF(booking)}
  className="mt-4 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
>
  Download Ticket as PDF
</button>
            <p><strong>Status:</strong> {booking.bookingStatus}</p>
            <p><strong>Payment:</strong> {booking.paymentStatus}</p>
            {booking.bookingStatus === "confirmed" && (
  <button
    onClick={() => cancelBooking(booking._id)}
    className="mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
  >
    Cancel Booking
  </button>
)}

            <button
  onClick={() => {
    setSelectedBooking(booking);
    setShowTicket(true);
  }}
  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
>
  View Ticket
</button>

{booking.trip?.status === "completed" && (
  <button
    onClick={() => deleteCompletedBooking(booking._id)}
    className="mt-3 ml-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
  >
    Delete Booking
  </button>
)}

          </div>
        ))}
      </div>
    )}
  </section>
)}

{showTicket && selectedBooking && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          E-Ticket
        </h2>
        <button
          onClick={() => setShowTicket(false)}
          className="rounded bg-gray-200 px-3 py-1 hover:bg-gray-300"
        >
          Close
        </button>
      </div>

      <div className="space-y-3">
        <p className="text-lg font-bold text-blue-700">
          {selectedBooking.trip?.route?.from || "Unknown"} →{" "}
          {selectedBooking.trip?.route?.to || "Unknown"}
        </p>

        <p><strong>PNR:</strong> {selectedBooking.pnr || "Not available"}</p>
        <p>
          <strong>Journey Date:</strong>{" "}
          {selectedBooking.trip?.journeyDate
            ? new Date(selectedBooking.trip.journeyDate).toLocaleDateString()
            : "Not available"}
        </p>
        <p>
          <strong>Departure:</strong>{" "}
          {selectedBooking.trip?.departureTime || "Not available"}
        </p>
        <p>
          <strong>Arrival:</strong>{" "}
          {selectedBooking.trip?.arrivalTime || "Not available"}
        </p>
        <p>
          <strong>Seats:</strong>{" "}
          {selectedBooking.seats?.map((seat) => seat.seatNumber).join(", ") || "Not available"}
        </p>
        <p><strong>Total Amount:</strong> ₹{selectedBooking.totalAmount}</p>
        <p><strong>Booking Status:</strong> {selectedBooking.bookingStatus}</p>
        <p><strong>Payment Status:</strong> {selectedBooking.paymentStatus}</p>
      </div>
    </div>
  </div>
)}

{!authMode && token && ["search", "seats", "passenger", "payment", "confirmation"].includes(currentPage) && (
  <>
    {/* Bus Search Section */}
    <main className="px-6 py-16">
      {currentPage === "search" && <>
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-800">
            Book Your Bus Tickets
          </h2>

          <p className="mb-8 text-center text-gray-500">
            Find and book your bus journey with ease.
          </p>

          <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_1.2fr_auto]">
            <input
              id="busgo-search-from"
              type="text"
              placeholder="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600"
            />

            <button
              type="button"
              aria-label="Swap From and To"
              title="Swap From and To"
              onClick={() => { setFrom(to); setTo(from); }}
              className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xl text-blue-700 shadow-sm transition hover:bg-blue-100 md:mx-0"
            >
              ⇄
            </button>

            <input
              id="busgo-search-to"
              type="text"
              placeholder="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600"
            />

            <div className="space-y-2">
              <input
                id="busgo-search-date"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-600"
              />
              <div className="flex gap-2">
                {[0, 1].map((offset) => {
                  const day = new Date();
                  day.setDate(day.getDate() + offset);
                  const value = new Date(day.getTime() - day.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
                  return (
                    <button key={offset} type="button" onClick={() => setDate(value)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${date === value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                      {offset === 0 ? "Today" : "Tomorrow"}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="busgo-search-submit"
              onClick={handleSearch}
              className="rounded-lg bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800"
            >
              Search Buses
            </button>
          </div>

          {message && (
            <p className="mt-5 text-center font-medium text-blue-700">
              {message}
            </p>
          
          )}
        </div>

        {/* Bus Results */}
        <section className="mx-auto mt-8 max-w-5xl space-y-4">
          {buses.map((bus, index) => (
            <div
              key={bus._id}
              className="rounded-xl bg-white p-6 shadow-md"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {bus.bus?.busName || 'Bus'}
                  </h3>
                  <p className="mt-1 text-gray-500">
                    {bus.bus?.busType || 'Bus type not available'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Departure</p>
                  <p className="font-semibold text-gray-800">
                    {bus.departureTime}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Arrival</p>
                  <p className="font-semibold text-gray-800">
                    {bus.arrivalTime || 'Not available'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Fare</p>
                  <p className="text-xl font-bold text-blue-700">
                    ₹{bus.fare}
                  </p>
                </div>
                <div className="flex items-center">
  <button
   id={index === 0 ? "busgo-first-view-seats" : undefined}
   onClick={() => {
  if (!token) {
    setMessage('Please login first to book tickets.')
    setAuthMode('login')
    return
  }
  setSelectedTrip(bus)
  setCurrentPage("seats")
  fetchSeats(bus._id)
}}
    className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
  >
    View Seats
  </button>
</div>
              </div>
            </div>
          ))}
                </section>
      </>}

        {/* Selected Bus Section */}
        {selectedTrip && (currentPage === "seats" || currentPage === "passenger") && (
          <section className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
            {currentPage === "seats" && <>
            <div className="mb-7 flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Choose your seats</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">Select seats for your trip</h2>
                <p className="mt-1 text-slate-500">{selectedTrip.bus?.busName || "Bus"} <span className="mx-1">·</span> {selectedTrip.bus?.busType || selectedTrip.bus?.seatType || "Bus service"}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm font-medium">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-800"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Available</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-blue-800"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" />Selected</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" />Unavailable</span>
              </div>
            </div>
            <div className="mt-6">
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-lg font-bold text-slate-900">Choose a seat</h3>
    <span className="text-sm text-slate-500">Up to 6 seats per booking</span>
  </div>

  
  <div id="busgo-seat-layout" tabIndex={-1} className="rounded-3xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
  {selectedTrip?.bus?.seatType === "Seater" && <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-sm">
    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Front of bus</span>
    <span className="flex items-center gap-2 text-sm font-semibold"><SteeringWheelIcon /> Driver</span>
  </div>}
{selectedTrip?.bus?.seatType === "Seater-Sleeper" ? (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
    
{["Seater", "Lower", "Upper"].map((section) => (
  <div
    key={section}
    className={`${section === "Seater" ? "md:col-span-2" : ""} rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm`}
  >
    <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {section === "Seater" ? "Seater cabin" : `${section} deck`}
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          {section === "Seater" ? "2 + 2 seating with a center aisle" : "Sleeper berths"}
        </p>
      </div>
      {section === "Lower" ? <span aria-label="Driver position" title="Driver position" className="text-slate-400"><SteeringWheelIcon /></span> : (
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {availableSeats.filter((seat) => section === "Seater" ? seat.seatType === "Seater" : seat.seatType === "Sleeper" && seat.position === section).length} {section === "Seater" ? "seats" : "berths"}
        </span>
      )}
    </div>

    <div className="rounded-[22px] border border-slate-300 bg-white p-3 sm:p-4">
    <div
  className={
    section === "Seater"
      ? "grid grid-cols-5 gap-3"
      : "grid grid-cols-4 gap-3"
  }
>
  {/*
    Window seats on the left,
    Aisle seats on the right
  */}
     {availableSeats
  .filter((seat) =>
  section === "Seater"
    ? seat.seatType === "Seater"
    : seat.seatType === "Sleeper" && seat.position === section
)
  
  .map((seat, index) => {
          const isSelected = selectedSeats.includes(seat._id);
          if (section !== "Seater") {
            return renderBerthSeat(seat, index, section);
          }

          return (
            <button
              key={seat._id}
             style={(() => {
  if (section !== "Seater") {
    return {
      gridColumn: [1, 3, 4][index % 3],
      gridRow: Math.floor(index / 3) + 1,
    };
  }

      const totalSeaterSeats = Math.min(
  availableSeats.filter((item) => item.seatType === "Seater").length,
  availableSeats.length
);
const lastRowSeats = totalSeaterSeats % 4 || 4;
const regularSeats = totalSeaterSeats - lastRowSeats;
        if (index < regularSeats) {
          return {
            gridColumn: [1, 2, 4, 5][index % 4],
            gridRow: Math.floor(index / 4) + 1,
          };
        }

        return {
          gridColumn: index - regularSeats + 1,
          gridRow: Math.floor(regularSeats / 4) + 1,
        };
      })()}
              disabled={seat.status !== "available" && !isSelected}
              onClick={async () => {
                if (isSelected) {
                  const response = await fetch(
                    `http://localhost:5000/api/seats/${seat._id}/release`,
                    {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  if (response.ok) {
                    setSelectedSeats((prev) =>
                      prev.filter((id) => id !== seat._id)
                    );
                    setAvailableSeats((prev) =>
                      prev.map((item) =>
                        item._id === seat._id
                          ? { ...item, status: "available" }
                          : item
                      )
                    );
                  } else {
                    const data = await response.json();
                    setMessage(data.message || "Could not release seat.");
                  }
                  return;
                }

                if (selectedSeats.length >= 6) {
                  alert("You can select a maximum of 6 seats.");
                  return;
                }

                const success = await lockSeat(seat._id);

                if (success) {
                  setSelectedSeats((prev) => [...prev, seat._id]);
                  setAvailableSeats((prev) =>
                    prev.map((item) =>
                      item._id === seat._id
                        ? { ...item, status: "locked" }
                        : item
                    )
                  );
                }
              }}
      className={`flex ${section === "Seater" ? "min-h-20" : "min-h-28"} w-full flex-col items-center justify-center rounded-xl border-2 p-3 font-bold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : seat.status === "available"
                  ? "border-emerald-400 bg-white text-slate-800 hover:border-emerald-600 hover:bg-emerald-50"
                  : "border-slate-300 bg-slate-200 text-slate-500"
              }`}
            >
             
<span className="block">{seat.seatNumber}</span>
<span className="mt-1 block text-xs font-medium opacity-75">
  {section === "Seater" ? seat.position : `${section} berth`}
</span>
<span className="mt-2 block text-xs font-semibold opacity-80">₹{seat.seatType === "Sleeper" ? (selectedTrip.sleeperFare ?? selectedTrip.fare) : (selectedTrip.seaterFare ?? selectedTrip.fare)}</span>


            </button>
          );
        })}
    </div>
    </div>

    {availableSeats.filter((seat) =>
      section === "Seater"
        ? seat.seatType === "Seater"
        : seat.seatType === "Sleeper" && seat.position === section
    ).length === 0 && (
      <p className="text-center text-sm text-gray-500">
        No {section.toLowerCase()} seats found.
      </p>
    )}
  </div>
))}

  </div>
) : selectedTrip?.bus?.seatType === "Sleeper" ? (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    {["Lower", "Upper"].map((deck) => {
      const deckSeats = availableSeats
        .filter((seat) => seat.seatType === "Sleeper" && seat.position === deck)
        .sort((a, b) => Number(a.seatNumber.replace(/\D/g, "")) - Number(b.seatNumber.replace(/\D/g, "")));

      return (
        <section key={deck} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{deck} deck</h3>
              <p className="mt-1 text-xs text-slate-500">Sleeper berths</p>
            </div>
            <div className="flex items-center gap-3">
              {deck === "Lower" && <span aria-label="Driver position" title="Driver position" className="text-slate-400"><SteeringWheelIcon /></span>}
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{deckSeats.length} berths</span>
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-300 bg-white p-3 sm:p-4">
            <div className="grid grid-cols-4 gap-3 sm:gap-4">
              {deckSeats.map((seat, index) => renderBerthSeat(seat, index, deck))}
            </div>
          </div>
          {deckSeats.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No {deck.toLowerCase()} berths found.</p>}
        </section>
      );
    })}
  </div>
) : (
  <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
    <div><h3 className="text-base font-bold text-slate-900">Seater cabin</h3><p className="mt-1 text-xs text-slate-500">2 + 2 layout with center aisle</p></div>
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{availableSeats.filter((seat) => seat.seatType === "Seater").length} seats</span>
  </div>
  <div className="mx-auto grid w-full max-w-3xl grid-cols-5 gap-3 sm:gap-4">
    {availableSeats
      .filter((seat) => seat.seatType === "Seater")
      .map((seat, index) => {
      const isSelected = selectedSeats.includes(seat._id);

      return (
        <button
          key={seat._id}
          style={(() => {
  const totalSeats = availableSeats.filter(
    (item) => item.seatType === "Seater"
  ).length;

  const lastRowSeats = totalSeats % 4 || 4;
  const regularSeats = totalSeats - lastRowSeats;

  if (index < regularSeats) {
    return {
      gridColumn: [1, 2, 4, 5][index % 4],
      gridRow: Math.floor(index / 4) + 1,
    };
  }

  return {
    gridColumn: index - regularSeats + 1,
    gridRow: Math.floor(regularSeats / 4) + 1,
  };
})()}
          disabled={seat.status !== "available" && !isSelected}
          onClick={async () => {
            if (isSelected) {
              const response = await fetch(
                `http://localhost:5000/api/seats/${seat._id}/release`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                setSelectedSeats((prev) =>
                  prev.filter((id) => id !== seat._id)
                );
                setAvailableSeats((prev) =>
                  prev.map((item) =>
                    item._id === seat._id
                      ? { ...item, status: "available" }
                      : item
                  )
                );
              } else {
                const data = await response.json();
                setMessage(data.message || "Could not release seat.");
              }
              return;
            }

            if (selectedSeats.length >= 6) {
              alert("You can select a maximum of 6 seats.");
              return;
            }

            const success = await lockSeat(seat._id);

            if (success) {
              setSelectedSeats((prev) => [...prev, seat._id]);
              setAvailableSeats((prev) =>
                prev.map((item) =>
                  item._id === seat._id
                    ? { ...item, status: "locked" }
                    : item
                )
              );
            }
          }}
       className={`flex min-h-20 w-full min-w-0 flex-col items-center justify-center rounded-t-2xl rounded-b-lg border-2 px-1 py-3 font-semibold shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
  isSelected
    ? "border-blue-600 bg-blue-600 text-white"
    : seat.status === "available"
    ? "border-emerald-400 bg-white text-slate-800 hover:border-emerald-600 hover:bg-emerald-50"
    : "border-slate-300 bg-slate-200 text-slate-500"
}`}
        >
          <span className="block">{seat.seatNumber}</span>
<span className="mt-1 block w-full whitespace-nowrap text-center text-xs font-semibold">
  {seat.position}
</span>
<span className="mt-2 text-xs font-semibold opacity-80">₹{selectedTrip.seaterFare ?? selectedTrip.fare}</span>
        </button>
      );
    })}
  </div>
  </section>
)}
  </div>

  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <h3 className="text-lg font-bold text-slate-900">
    Booking Summary
  </h3>

  <p className="mt-2 text-gray-600">
   Selected Seats: {selectedSeats.length > 0
  ? availableSeats
      .filter((seat) => selectedSeats.includes(seat._id))
      .map((seat) => seat.seatNumber)
      .join(", ")
  : "None"}
  </p>

  <p className="mt-2 text-gray-600">
    Total Seats: {selectedSeats.length}
  </p>

  
<p className="mt-2 text-xl font-bold text-blue-700">
  Total Price: ₹{
    availableSeats
      .filter((seat) => selectedSeats.includes(seat._id))
      .reduce((total, seat) => {
        if (seat.seatType === "Seater") {
          return total + (selectedTrip.seaterFare ?? selectedTrip.fare);
        }

        if (seat.seatType === "Sleeper") {
          return total + (selectedTrip.sleeperFare ?? selectedTrip.fare);
        }

        return total;
      }, 0)
  }
</p>

</div>

{selectedSeats.length > 0 && (
  <>
    <button
      onClick={() => {
        setPassengers(
          selectedSeats.map((seatId) => ({
            seatId,
            name: "",
            age: "",
            gender: "",
            phone: "",
            email: "",
          }))
        );
        setShowPassengerForm(true);
        setCurrentPage("passenger");
      }}
      className="mt-4 w-full rounded-lg bg-blue-700 p-3 font-semibold text-white hover:bg-blue-800"
    >
      Continue to Booking
    </button>

  </>
)}

  <div className="mt-4 flex gap-4 text-sm">
    <p className="text-green-700">🟩 Available</p>
    <p className="text-red-700">🟥 Booked</p>
  </div>
</div>

            </>}

           {showPassengerForm && currentPage === "passenger" && (
  <div id="busgo-passenger-details" tabIndex={-1} className="mt-6 rounded-xl border border-gray-200 p-5">
    <h3 className="mb-4 text-xl font-bold text-gray-800">
      Passenger Details
    </h3>

    <div className="space-y-4">
    
{passengers.map((passenger, index) => (
  <div
    key={passenger.seatId}
    className="mb-5 rounded-lg border border-gray-300 p-4"
  >
    <h4 className="mb-3 font-bold text-blue-700">
      Passenger {index + 1} — Seat {
        availableSeats.find(
          (seat) => seat._id === passenger.seatId
        )?.seatNumber || index + 1
      }
    </h4>

    <input
      type="text"
      placeholder="Passenger Name"
      value={passenger.name}
      onChange={(e) =>
        setPassengers((prev) =>
          prev.map((p, i) =>
            i === index ? { ...p, name: e.target.value } : p
          )
        )
      }
      className="mb-3 w-full rounded-lg border p-3"
    />

    <input
      type="number"
      placeholder="Age"
      value={passenger.age}
      onChange={(e) =>
        setPassengers((prev) =>
          prev.map((p, i) =>
            i === index ? { ...p, age: e.target.value } : p
          )
        )
      }
      className="mb-3 w-full rounded-lg border p-3"
    />

    <select
      value={passenger.gender}
      onChange={(e) =>
        setPassengers((prev) =>
          prev.map((p, i) =>
            i === index ? { ...p, gender: e.target.value } : p
          )
        )
      }
      className="mb-3 w-full rounded-lg border p-3"
    >
      <option value="">Select Gender</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>

    <input
      type="tel"
      placeholder="Phone Number"
      value={passenger.phone}
      onChange={(e) =>
        setPassengers((prev) =>
          prev.map((p, i) =>
            i === index ? { ...p, phone: e.target.value } : p
          )
        )
      }
      className="mb-3 w-full rounded-lg border p-3"
    />

    <input
      type="email"
      placeholder="Email Address"
      value={passenger.email}
      onChange={(e) =>
        setPassengers((prev) =>
          prev.map((p, i) =>
            i === index ? { ...p, email: e.target.value } : p
          )
        )
      }
      className="w-full rounded-lg border p-3"
    />
  </div>

  ))}
        </div>

        <button
          id="busgo-confirm-booking"
          onClick={handleBooking}
          className="mt-5 w-full rounded-lg bg-green-600 p-3 font-semibold text-white hover:bg-green-700"
        >
          Confirm Booking & Pay
        </button>
  </div>
)}

<button
  onClick={() => {
    setSelectedTrip(null)
    setSelectedSeats([])
    setShowPassengerForm(false)
    setPassengerName('')
    setPassengerAge('')
    setPassengerGender('')
    setPassengerPhone('')
    setPassengerEmail('')
    setCurrentPage("search")
  }}
  className="mt-4 rounded-lg bg-gray-200 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
>
  Close
</button>
               </section>
    )}

    {currentPage === "payment" && showPayment && pendingBooking && (
      <section className="mx-auto mt-8 max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Payment
        </h2>

        <p className="mb-5 text-lg text-gray-700">
          Total Amount: ₹{selectedTrip?.fare}
        </p>

        <h3 className="mb-3 font-semibold text-gray-700">
          Choose Payment Method
        </h3>

        <div className="space-y-3">
          <label className="flex items-center gap-3 rounded-lg border p-3">
            <input type="radio" name="paymentMethod" value="UPI" defaultChecked />
            <span>UPI</span>
          </label>

          <label className="flex items-center gap-3 rounded-lg border p-3">
            <input type="radio" name="paymentMethod" value="Card" />
            <span>Credit / Debit Card</span>
          </label>

          <label className="flex items-center gap-3 rounded-lg border p-3">
            <input type="radio" name="paymentMethod" value="Cash" />
            <span>Cash (Demo)</span>
          </label>
        </div>

        <button
          id="busgo-pay-now"
          onClick={handleDemoPayment}
          className="mt-6 w-full rounded-lg bg-green-600 p-3 font-semibold text-white hover:bg-green-700"
        >
          Pay Now
        </button>

        <button
          onClick={() => {
            setShowPayment(false);
            setPendingBooking(null);
            setCurrentPage("passenger");
          }}
          className="mt-3 w-full rounded-lg bg-gray-200 p-3 font-semibold text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
      </section>
        )}

    
{currentPage === "confirmation" && showTicket && confirmedTicket && (
  <section className="mx-auto mt-8 max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
    <div className="bg-green-700 p-5 text-center text-white">
      <h2 className="text-2xl font-bold">Booking Confirmed</h2>
      <p className="mt-1 text-sm">Your bus ticket is ready!</p>
    </div>

    
<div className="border-b border-dashed border-gray-300 p-5">
  <h3 className="mb-3 text-lg font-bold text-gray-800">
    Passenger Details
  </h3>

  {confirmedTicket.passengers.map((passenger, index) => (
    <div
      key={index}
      className="mb-4 rounded-lg border border-gray-200 p-3"
    >
      <p className="mb-2 font-bold text-blue-700">
        Passenger {index + 1}
      </p>

      <p className="text-sm text-gray-500">Name</p>
      <p className="mb-2 font-semibold text-gray-800">
        {passenger.name}
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Age</p>
          <p className="font-semibold text-gray-800">
            {passenger.age}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Gender</p>
          <p className="font-semibold text-gray-800">
            {passenger.gender}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Phone</p>
          <p className="font-semibold text-gray-800">
            {passenger.phone}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Seat</p>
          <p className="font-semibold text-gray-800">
            {passenger.seatNumber}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

    <div className="grid grid-cols-2 gap-4 p-5 text-sm">
  <div>
    <p className="text-gray-500">PNR</p>
    <p className="font-bold text-gray-800">
      {confirmedTicket.pnr || "Not available"}
    </p>
  </div>

  <div>
    <p className="text-gray-500">Booking ID</p>
    <p className="break-all font-bold text-gray-800">
      {confirmedTicket.bookingId}
    </p>
  </div>
</div>

    <div className="mx-5 flex items-center justify-between rounded-xl bg-green-50 p-4">
      <span className="font-semibold text-green-800">Total Fare</span>
      <span className="text-xl font-bold text-green-800">
        ₹{confirmedTicket.fare}
      </span>
    </div>

    <div className="p-5">
      
<button
  id="busgo-download-confirmed-ticket"
  onClick={downloadTicketPDF}
  className="mb-3 w-full rounded-lg bg-green-600 p-3 font-semibold text-white hover:bg-green-700"
>
  Download Ticket as PDF
</button>
      <button
        onClick={() => { setShowTicket(false); setCurrentPage("search"); }}
        className="w-full rounded-lg bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700"
      >
        Close Ticket
      </button>
    </div>
  </section>
)}
        
        ,</main>
      </>
    )}
    <BookingCopilot
      currentPage={currentPage}
      isAuthenticated={Boolean(token)}
      userRole={user?.role}
      busCount={buses.length}
      confirmedTicket={confirmedTicket}
      onNavigate={navigateFromCopilot}
      onOpenBookings={openBookingsFromCopilot}
      onDownloadConfirmedTicket={() => downloadTicketPDF()}
    />
    </div>
  )
}

export default App
