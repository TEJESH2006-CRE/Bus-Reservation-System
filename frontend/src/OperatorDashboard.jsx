import { useEffect, useState } from "react";

function OperatorDashboard() {
  console.log("OPERATOR DASHBOARD COMPONENT LOADED");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in as an operator.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/operator/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load dashboard");
        }

        setDashboard(data);
       console.log("Operator Dashboard API:", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
fetchBuses();
fetchTrips();
fetchRoutes();
fetchOperatorBookings();
  }, []);
 const [buses, setBuses] = useState([]);
const [trips, setTrips] = useState([]);
const [bookings, setBookings] = useState([]);
const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
const [bookingSearch, setBookingSearch] = useState("");
const [loadingBookings, setLoadingBookings] = useState(false);
const [routes, setRoutes] = useState([]);
const [operatorPage, setOperatorPage] = useState("dashboard");

const [newTrip, setNewTrip] = useState({
  bus: "",
  route: "",
  journeyDate: "",
  departureTime: "",
  arrivalTime: "",
  fare: "",
  seaterFare: "",
  sleeperFare: "",
});
const [newBus, setNewBus] = useState({
  busNumber: "",
  busName: "",
  busType: "",
  seatType: "",
  totalSeats: "",
});

const [editingBus, setEditingBus] = useState(null);
const [editingRoute, setEditingRoute] = useState(null);
const [editingTrip, setEditingTrip] = useState(null);


  const fetchBuses = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/operator/buses",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load buses");
    }

    setBuses(data.buses || []);
  } catch (err) {
    console.error("Fetch buses error:", err.message);
  }
};

const fetchTrips = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/operator/trips",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load trips");
    }

    setTrips(data.trips || []);
  } catch (err) {
    console.error("Fetch trips error:", err.message);
  }
};

const fetchRoutes = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/operator/routes",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load routes");
    }

    setRoutes(data.routes || []);
  } catch (err) {
    console.error("Fetch routes error:", err.message);
  }
};

const fetchOperatorBookings = async () => {
  console.log("Fetching operator bookings...");
  try {
    setLoadingBookings(true);

    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/operator/bookings",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    console.log("Operator Bookings API:", response.status, data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch bookings");
    }

    setBookings(data.bookings || []);
  } catch (error) {
    alert(error.message);
  } finally {
    setLoadingBookings(false);
  }
};



  if (loading) {
    return <p className="p-6">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="p-6 text-red-600">{error}</p>;
  }

  return (
    <div className="operator-dashboard min-h-screen bg-gray-100 p-6">
      {operatorPage !== "dashboard" ? (
        <header className="operator-page-header mb-5 flex items-center gap-4">
          <button onClick={() => { setOperatorPage("dashboard"); setEditingRoute(null); setEditingBus(null); setEditingTrip(null); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700">← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-slate-900">{{ routes: "My Routes", buses: "My Buses", trips: "My Trips", bookings: "My Bookings", "add-bus": "Add New Bus", "add-trip": "Add New Trip" }[operatorPage]}</h1>
        </header>
      ) : (
        <header className="operator-page-header mb-6">
          <h1 className="text-4xl font-bold text-slate-900">Operator Dashboard</h1>
          <p className="mt-2 text-lg text-slate-500">Manage your buses, trips, routes and bookings.</p>
        </header>
      )}
      
{operatorPage === "add-trip" && (
  <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold text-gray-800">
      Create New Trip
    </h2>

    <div className="space-y-4">

      {/* Bus */}
      <select
        value={newTrip.bus}
        onChange={(e) =>
          setNewTrip({
            ...newTrip,
            bus: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      >
        <option value="">Select Bus</option>

        {buses.map((bus) => (
          <option key={bus._id} value={bus._id}>
            {bus.busNumber} - {bus.busName}
          </option>
        ))}
      </select>

      {/* Route */}
      <select
        value={newTrip.route}
        onChange={(e) =>
          setNewTrip({
            ...newTrip,
            route: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      >
        <option value="">Select Route</option>

        {routes.map((route) => (
          <option key={route._id} value={route._id}>
            {route.from} → {route.to}
          </option>
        ))}
      </select>

      {/* Journey Date */}
      <input
        type="date"
        value={newTrip.journeyDate}
        onChange={(e) =>
          setNewTrip({
            ...newTrip,
            journeyDate: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      {/* Departure Time */}
      <input
        type="time"
        value={newTrip.departureTime}
        onChange={(e) =>
          setNewTrip({
            ...newTrip,
            departureTime: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      {/* Arrival Time */}
      <input
        type="time"
        value={newTrip.arrivalTime}
        onChange={(e) =>
          setNewTrip({
            ...newTrip,
            arrivalTime: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      
{/* Seater Fare */}
<input
  type="number"
  placeholder="Seater Fare (₹)"
  value={newTrip.seaterFare}
  onChange={(e) =>
    setNewTrip({
      ...newTrip,
      seaterFare: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
/>

{/* Sleeper Fare */}
<input
  type="number"
  placeholder="Sleeper Fare (₹)"
  value={newTrip.sleeperFare}
  onChange={(e) =>
    setNewTrip({
      ...newTrip,
      sleeperFare: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
/>


     <button
  onClick={async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/operator/trips",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTrip),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create trip");
      }

      alert("Trip created successfully");

      setTrips([...trips, data.trip]);

      setNewTrip({
  bus: "",
  route: "",
  journeyDate: "",
  departureTime: "",
  arrivalTime: "",
  fare: "",
  seaterFare: "",
  sleeperFare: "",
});

      setOperatorPage("dashboard");
    } catch (err) {
      alert(err.message);
    }
  }}
  className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white"
>
  Create Trip
</button>
<button
  type="button"
  onClick={() => {
    setNewTrip({
      bus: "",
      route: "",
      journeyDate: "",
      departureTime: "",
      arrivalTime: "",
      fare: "",
      seaterFare: "",
      sleeperFare: "",
    });
    setOperatorPage("dashboard");
  }}
  className="ml-3 rounded-lg bg-gray-500 px-5 py-2 font-semibold text-white hover:bg-gray-600"
>
  Cancel
</button>

    </div>
  </div>
)}

{operatorPage === "add-bus" && (
  <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold text-gray-800">
      Add New Bus
    </h2>

    <div className="space-y-4">
      <input
  type="text"
  placeholder="Bus Number"
  value={newBus.busNumber}
  onChange={(e) =>
    setNewBus({
      ...newBus,
      busNumber: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
/>

      <input
  type="text"
  placeholder="Bus Name"
  value={newBus.busName}
  onChange={(e) =>
    setNewBus({
      ...newBus,
      busName: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
/>

      <select
  value={newBus.busType}
  onChange={(e) =>
    setNewBus({
      ...newBus,
      busType: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
>
  <option value="">Select Bus Type</option>
  <option value="AC">AC</option>
  <option value="Non-AC">Non-AC</option>
</select>

      <select
  value={newBus.seatType}
  onChange={(e) =>
    setNewBus({
      ...newBus,
      seatType: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
>
  <option value="">Select Seat Type</option>
  <option value="Seater">Seater</option>
  <option value="Sleeper">Sleeper</option>
  <option value="Seater-Sleeper">Seater-Sleeper</option>
</select>

      <input
  type="number"
  placeholder="Total Seats"
  value={newBus.totalSeats}
  onChange={(e) =>
    setNewBus({
      ...newBus,
      totalSeats: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
/>

      <button
  onClick={async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/operator/buses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            busNumber: newBus.busNumber,
            busName: newBus.busName,
            busType: newBus.busType,
            seatType: newBus.seatType,
            totalSeats: newBus.totalSeats,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create bus");
        return;
      }

      alert("Bus created successfully");

      setBuses((currentBuses) => [
        ...currentBuses,
        data.bus,
      ]);

      setNewBus({
        busNumber: "",
        busName: "",
        busType: "",
        seatType: "",
        totalSeats: "",
      });

      setOperatorPage("dashboard");
    } catch (error) {
      alert("Cannot connect to the server.");
    }
  }}
  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
>
  Create Bus
</button>

      <button
        onClick={() => { setNewBus({ busNumber: "", busName: "", busType: "", seatType: "", totalSeats: "" }); setOperatorPage("dashboard"); }}
        className="ml-3 rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white"
      >
        Cancel
      </button>
    </div>
  </div>
)}
       
      {operatorPage === "dashboard" && <div className="operator-overview">
      <div className="operator-dashboard-content mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

  <div className="operator-stat-card flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
    <span className="operator-stat-icon bg-blue-50 text-blue-600" aria-hidden="true">▣</span><div>
    <h2 className="text-base font-normal text-gray-500">
      Total Buses
    </h2>
    <p className="mt-2 text-3xl font-bold text-gray-900">
      {dashboard?.dashboard?.totalBuses ?? 0}
    </p><p className="mt-1 text-slate-500">Registered buses</p></div>
  </div>

  <div className="operator-stat-card flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
    <span className="operator-stat-icon bg-green-50 text-green-600" aria-hidden="true">⌘</span><div>
    <h2 className="text-base font-normal text-gray-500">
      Total Trips
    </h2>
    <p className="mt-2 text-3xl font-bold text-gray-900">
      {dashboard?.dashboard?.totalTrips ?? 0}
    </p><p className="mt-1 text-slate-500">Scheduled trips</p></div>
  </div>

  <div className="operator-stat-card flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
    <span className="operator-stat-icon bg-purple-50 text-purple-600" aria-hidden="true">▤</span><div>
    <h2 className="text-base font-normal text-gray-500">
      Total Bookings
    </h2>
    <p className="mt-2 text-3xl font-bold text-gray-900">
      {dashboard?.dashboard?.totalBookings ?? 0}
    </p><p className="mt-1 text-slate-500">Passenger bookings</p></div>
  </div>

  <div className="operator-stat-card flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm">
    <span className="operator-stat-icon bg-amber-50 text-amber-500" aria-hidden="true">₹</span><div>
    <h2 className="text-base font-normal text-gray-500">
      Total Revenue
    </h2>
    <p className="mt-2 text-3xl font-bold text-gray-900">
      ₹{dashboard?.dashboard?.totalRevenue ?? 0}
    </p><p className="mt-1 text-slate-500">Total earnings</p></div>
  </div>
  </div>

  <section className="mb-5 flex flex-wrap items-center justify-between gap-5 rounded-xl bg-white p-5 shadow-sm">
    <div><h2 className="text-2xl font-bold text-slate-900">Quick Actions</h2><p className="mt-1 text-slate-500">Add buses and trips to manage your fleet.</p></div>
    <div className="flex flex-wrap gap-3">
      <button onClick={() => setOperatorPage("add-bus")} className="rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-blue-700">▣ &nbsp; + Add New Bus</button>
      <button onClick={() => setOperatorPage("add-trip")} className="rounded-xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-700">▦ &nbsp; + Add New Trip</button>
    </div>
  </section>

  <section className="mb-5 rounded-xl bg-white p-5 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-900">Management Sections</h2>
    <p className="mt-1 text-slate-500">Click on a section to manage your data.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { id: "routes", title: "My Routes", description: "View and manage your bus routes", icon: "⌘", tone: "blue" },
        { id: "buses", title: "My Buses", description: "Manage your buses and bus details", icon: "▣", tone: "green" },
        { id: "trips", title: "My Trips", description: "Manage trip schedules and status", icon: "▦", tone: "purple" },
        { id: "bookings", title: "My Bookings", description: "Search and view passenger bookings", icon: "▤", tone: "amber" },
      ].map((section) => (
        <button key={section.id} onClick={() => setOperatorPage(section.id)} className="operator-management-card flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span className={`operator-management-icon operator-management-icon-${section.tone}`} aria-hidden="true">{section.icon}</span>
          <span className="min-w-0 flex-1"><strong className="block text-lg text-slate-900">{section.title}</strong><span className="mt-1 block text-slate-500">{section.description}</span></span>
          <span className="text-2xl text-slate-700" aria-hidden="true">›</span>
        </button>
      ))}
    </div>
  </section>

      </div>}
  

    {operatorPage === "buses" && editingBus && (
  <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold text-gray-800">
      Edit Bus
    </h2>

    <div className="space-y-4">
      <input
        type="text"
        value={editingBus.busName}
        onChange={(e) =>
          setEditingBus({
            ...editingBus,
            busName: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
        placeholder="Bus Name"
      />

      <input
        type="text"
        value={editingBus.busNumber}
        onChange={(e) =>
          setEditingBus({
            ...editingBus,
            busNumber: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
        placeholder="Bus Number"
      />
      <select
  value={editingBus.busType || "Non-AC"}
  onChange={(e) =>
    setEditingBus({
      ...editingBus,
      busType: e.target.value,
    })
  }
  className="mb-3 w-full rounded-lg border p-3"
>
  <option value="AC">AC</option>
  <option value="Non-AC">Non-AC</option>
</select>
      <input
  type="number"
  min="1"
  value={editingBus.totalSeats}
  onChange={(e) =>
    setEditingBus({
      ...editingBus,
      totalSeats: e.target.value,
    })
  }
  className="w-full rounded-lg border p-3"
  placeholder="Total Seats"
/>

      <button
        onClick={async () => {
          try {
            const token = localStorage.getItem("token");

            const response = await fetch(
              `http://localhost:5000/api/operator/buses/${editingBus._id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
               body: JSON.stringify({
  busName: editingBus.busName,
  busNumber: editingBus.busNumber,
  busType: editingBus.busType,
  totalSeats: Number(editingBus.totalSeats),
}),
              }
            );

            const data = await response.json();

            if (!response.ok) {
              alert(data.message || "Failed to update bus");
              return;
            }

            alert("Bus updated successfully");

            setBuses((currentBuses) =>
              currentBuses.map((bus) =>
                bus._id === editingBus._id ? data.bus : bus
              )
            );

            setEditingBus(null);
          } catch (error) {
            alert("Cannot connect to the server.");
          }
        }}
        className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
      >
        Save Changes
      </button>

      <button
        onClick={() => setEditingBus(null)}
        className="ml-3 rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white"
      >
        Cancel
      </button>
    </div>
  </div>
)}

{operatorPage === "routes" && editingRoute && (
  <div className="mb-8 rounded-xl bg-white p-6 shadow-md">
    <h2 className="mb-4 text-2xl font-bold text-gray-800">
      Edit Route
    </h2>

    <div className="space-y-4">
      <input
        type="text"
        placeholder="From"
        value={editingRoute.from}
        onChange={(e) =>
          setEditingRoute({
            ...editingRoute,
            from: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      <input
        type="text"
        placeholder="To"
        value={editingRoute.to}
        onChange={(e) =>
          setEditingRoute({
            ...editingRoute,
            to: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      <input
        type="number"
        min="0"
        placeholder="Distance"
        value={editingRoute.distance ?? ""}
        onChange={(e) =>
          setEditingRoute({
            ...editingRoute,
            distance: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      <input
        type="text"
        placeholder="Duration"
        value={editingRoute.duration ?? ""}
        onChange={(e) =>
          setEditingRoute({
            ...editingRoute,
            duration: e.target.value,
          })
        }
        className="w-full rounded-lg border p-3"
      />

      <button
  onClick={async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/operator/routes/${editingRoute._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            from: editingRoute.from,
            to: editingRoute.to,
            distance:
              editingRoute.distance === "" ||
              editingRoute.distance == null
                ? undefined
                : Number(editingRoute.distance),
            duration: editingRoute.duration,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update route");
        return;
      }

      alert("Route updated successfully");

      setRoutes((currentRoutes) =>
        currentRoutes.map((route) =>
          route._id === editingRoute._id ? data.route : route
        )
      );

      setEditingRoute(null);
    } catch (error) {
      alert("Cannot connect to the server.");
    }
  }}
  className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white"
>
  Save Route
</button>

      <button
        onClick={() => setEditingRoute(null)}
        className="ml-3 rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white"
      >
        Cancel
      </button>
    </div>
  </div>
)}


{operatorPage === "routes" && (
  <div className="operator-routes-panel mt-1 rounded-xl bg-white p-5 shadow-sm">
  <h2 className="mb-4 text-2xl font-bold text-gray-800">My Routes</h2>
  {routes.length === 0 ? (
    <p className="text-gray-500">No routes found.</p>
  ) : (
    <div className="space-y-4">
      {routes.map((route) => (
        <div key={route._id} className="rounded-lg border p-4">
          <h3 className="text-lg font-bold text-gray-800">
            {route.from} → {route.to}
          </h3>

          <p className="text-gray-600">
            Distance: {route.distance ?? "Not specified"}
          </p>

          <p className="text-gray-600">
            Duration: {route.duration || "Not specified"}
          </p>

          <button
            onClick={() => setEditingRoute({ ...route })}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            Edit Route
          </button>
        </div>
      ))}
    </div>
  )}
</div>
)}


  {operatorPage === "buses" && <div className="operator-buses-panel mt-1 rounded-xl bg-white p-5 shadow-sm">
  <div className="mb-4 flex items-start justify-between"><div><span className="text-blue-600">▣</span><h2 className="mt-2 text-xl font-bold text-gray-800">
    My Buses
  </h2><p className="mt-2 text-gray-500">Bus details and management</p></div><button onClick={() => setOperatorPage("add-bus")} className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white">Add Bus</button></div>

  {buses.length === 0 ? (
    <p className="text-gray-500">
      No buses found.
    </p>
  ) : (
    <div className="space-y-4">
      {buses.map((bus) => (
        <div
          key={bus._id}
          className="rounded-lg border p-4"
        >
          <h3 className="text-lg font-bold text-gray-800">
            {bus.busName}
          </h3>

          <p className="text-gray-600">
            Bus Number: {bus.busNumber}
          </p>

          <p className="text-gray-600">
            Type: {bus.busType}
          </p>

          <p className="text-gray-600">
            Total Seats: {bus.totalSeats}
          </p>
          <button
  onClick={() => setEditingBus(bus)}
  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
>
  Edit Bus
</button>
<button
  onClick={async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this bus?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/operator/buses/${bus._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete bus");
        return;
      }

      alert("Bus deleted successfully");

      setBuses((currentBuses) =>
        currentBuses.filter((currentBus) => currentBus._id !== bus._id)
      );
    } catch (error) {
      alert("Cannot connect to the server.");
    }
  }}
  className="ml-3 mt-3 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
>
  Delete Bus
</button>
        </div>
      ))}
    </div>
  )}
</div>}


{operatorPage === "trips" && editingTrip && (
  <div className="mb-6 rounded-xl border p-5 shadow-sm">
    <h3 className="mb-4 text-xl font-bold">
      Edit Trip Details
    </h3>

    <label className="mb-1 block font-medium">
      Journey Date
    </label>
    <input
      type="date"
      value={editingTrip.journeyDate || ""}
      onChange={(e) =>
        setEditingTrip({
          ...editingTrip,
          journeyDate: e.target.value,
        })
      }
      className="mb-3 w-full rounded-lg border p-2"
    />

    <label className="mb-1 block font-medium">
      Departure Time
    </label>
    <input
      type="time"
      value={editingTrip.departureTime || ""}
      onChange={(e) =>
        setEditingTrip({
          ...editingTrip,
          departureTime: e.target.value,
        })
      }
      className="mb-3 w-full rounded-lg border p-2"
    />

    <label className="mb-1 block font-medium">
      Arrival Time
    </label>
    <input
      type="time"
      value={editingTrip.arrivalTime || ""}
      onChange={(e) =>
        setEditingTrip({
          ...editingTrip,
          arrivalTime: e.target.value,
        })
      }
      className="mb-4 w-full rounded-lg border p-2"
    />

    
<label className="mb-1 block font-medium">
  Trip Status
</label>

<select
  value={editingTrip.status || "scheduled"}
  onChange={(e) =>
    setEditingTrip({
      ...editingTrip,
      status: e.target.value,
    })
  }
  className="mb-4 w-full rounded-lg border p-2"
>
  <option value="scheduled">Scheduled</option>
  <option value="started">Started</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
</select>


<div className="flex gap-2">
  <button
    onClick={async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/operator/trips/${editingTrip._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
           body: JSON.stringify({
  journeyDate: editingTrip.journeyDate,
  departureTime: editingTrip.departureTime,
  arrivalTime: editingTrip.arrivalTime,
  status: editingTrip.status,
}),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to update trip");
        }

        setTrips((previousTrips) =>
          previousTrips.map((trip) =>
            trip._id === editingTrip._id ? data.trip : trip
          )
        );

        setEditingTrip(null);
        alert("Trip details updated successfully!");
      } catch (error) {
        alert(error.message);
      }
    }}
    className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
  >
    Save Trip
  </button>

  <button
    onClick={() => setEditingTrip(null)}
    className="rounded-lg border px-4 py-2"
  >
    Cancel
  </button>
</div>

  </div>
)}


{/* My Bookings */}
{operatorPage === "bookings" && <div className="operator-bookings-panel rounded-xl bg-white p-4 shadow-sm">
  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
    <h2 className="text-xl font-bold text-gray-800">Manage Bus Bookings</h2><span className="rounded-full bg-gray-100 px-3 py-1 text-sm">{bookings.length} bookings</span>

   
<input
  type="text"
  value={bookingSearch}
  onChange={(e) => setBookingSearch(e.target.value)}
  placeholder="Search by passenger name or booking ID"
  className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3"
/>

    
<select
  value={bookingStatusFilter}
  onChange={(e) => setBookingStatusFilter(e.target.value)}
  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white p-3"
>
  <option value="all">All Bookings</option>
  <option value="confirmed">Confirmed</option>
  <option value="pending">Pending</option>
  <option value="cancelled">Cancelled</option>
</select>


    <button
      onClick={fetchOperatorBookings}
      className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
    >
      Refresh Bookings
    </button>
  </div>

  
{loadingBookings ? (
  <p>Loading bookings...</p>
) : bookings.filter(
    (booking) =>
      bookingStatusFilter === "all" ||
      booking.bookingStatus === bookingStatusFilter
  ).length === 0 ? (
  <div className="rounded-lg bg-slate-50 px-4 py-6 text-center text-gray-500"><div className="mb-2 text-2xl text-slate-400">🎟</div><p className="font-semibold text-slate-700">{bookings.length === 0 ? "No bookings yet" : `No ${bookingStatusFilter} bookings found`}</p><p className="mt-2">Customer bookings will appear here.</p></div>
) : (

    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="p-2">Booking ID</th>
            <th className="p-2">Passenger</th>
            <th className="p-2">Bus</th>
            <th className="p-2">Route</th>
            <th className="p-2">Seats</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          
{bookings
  .filter((booking) => {
    const matchesStatus =
      bookingStatusFilter === "all" ||
      booking.bookingStatus === bookingStatusFilter;

    const search = bookingSearch.trim().toLowerCase();

    const matchesSearch =
      (booking.user?.name || "").toLowerCase().includes(search) ||
      booking._id.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  })
  .map((booking) => (

            <tr key={booking._id} className="border-b">
              <td className="p-2">
                {booking._id.slice(-6).toUpperCase()}
              </td>

              <td className="p-2">
                {booking.user?.name || "N/A"}
              </td>

              <td className="p-2">
                {booking.trip?.bus?.busName || "N/A"}
              </td>

              <td className="p-2">
                {booking.trip?.route
                  ? `${booking.trip.route.from} → ${booking.trip.route.to}`
                  : "N/A"}
              </td>

              <td className="p-2">
                {booking.seats?.map((seat) => seat.seatNumber).join(", ") || "N/A"}
              </td>

              <td className="p-2">
                {booking.bookingStatus || "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>}



{operatorPage === "trips" && <div className="operator-trips-panel mt-1 rounded-xl bg-white p-5 shadow-sm">
  <div className="mb-4 flex items-start justify-between"><div><span className="text-blue-600">◷</span><p className="mt-2 text-gray-500">Manage trip schedules and status</p></div><button onClick={() => setOperatorPage("add-trip")} className="rounded-lg bg-blue-600 px-3 py-2 font-semibold text-white">Add Trip</button></div>

  {trips.length === 0 ? (
    <p className="text-gray-500">
      No trips found.
    </p>
  ) : (
    <div className="space-y-4">
      {trips.map((trip) => (
        <div
          key={trip._id}
          className="rounded-lg border p-4"
        >
          <h3 className="text-lg font-bold text-gray-800">
            {trip.bus?.busName}
          </h3>

          <p className="text-gray-600">
            Bus Number: {trip.bus?.busNumber}
          </p>

          <p className="text-gray-600">
            Route: {trip.route?.from} → {trip.route?.to}
          </p>

          <p className="text-gray-600">
            Journey Date:{" "}
            {new Date(trip.journeyDate).toLocaleDateString()}
          </p>
          
<p className="flex items-center gap-2">
  Trip Status:
  <span
    className={`rounded-full px-3 py-1 text-sm font-semibold ${
      (trip.status || "scheduled") === "scheduled"
        ? "bg-blue-100 text-blue-800"
        : trip.status === "started"
        ? "bg-green-100 text-green-800"
        : trip.status === "completed"
        ? "bg-gray-200 text-gray-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {trip.status || "scheduled"}
  </span>
</p>


          <p className="text-gray-600">
            Departure: {trip.departureTime}
          </p>

          <p className="text-gray-600">
            Arrival: {trip.arrivalTime}
          </p>

         
{(trip.bus?.seatType === "Seater" ||
  trip.bus?.seatType === "Seater-Sleeper") && (
  <p className="text-gray-600">
    Seater Fare: ₹{trip.seaterFare ?? trip.fare}
  </p>
)}

{(trip.bus?.seatType === "Sleeper" ||
  trip.bus?.seatType === "Seater-Sleeper") && (
  <p className="text-gray-600">
    Sleeper Fare: ₹{trip.sleeperFare ?? trip.fare}
  </p>
)}

          <button
  onClick={async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/operator/trips/${trip._id}/seats`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create seats");
        return;
      }

      alert(`${data.count} seats created successfully`);
    } catch (error) {
      alert("Cannot connect to the server.");
    }
  }}
  className="mt-3 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white"
>
  Create Seats
</button>

<button
  onClick={async () => {
    const seaterFare = prompt(
      "Enter Seater Fare (₹):",
      String(trip.seaterFare ?? trip.fare)
    );

    if (seaterFare === null) return;

    const sleeperFare = prompt(
      "Enter Sleeper Fare (₹):",
      String(trip.sleeperFare ?? trip.fare)
    );

    if (sleeperFare === null) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/operator/trips/${trip._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            seaterFare,
            sleeperFare,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update fares");
      }

      setTrips((previousTrips) =>
        previousTrips.map((item) =>
          item._id === trip._id ? data.trip : item
        )
      );

      alert("Trip fares updated successfully!");
    } catch (error) {
      alert(error.message);
    }
  }}
  className="mt-3 ml-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
>
  Edit Fares
</button>


<button
  onClick={() => {
    setEditingTrip({
      ...trip,
      journeyDate: trip.journeyDate
        ? new Date(trip.journeyDate).toISOString().split("T")[0]
        : "",
      departureTime: trip.departureTime || "",
      arrivalTime: trip.arrivalTime || "",
    });
  }}
  className="mt-3 ml-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
>
  Edit Trip
</button>


<button
  onClick={async () => {
    const confirmed = window.confirm(
      `Delete the trip departing at ${trip.departureTime} on ${new Date(trip.journeyDate).toLocaleDateString()}?`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/operator/trips/${trip._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete trip");
      }

      setTrips((previousTrips) =>
        previousTrips.filter((item) => item._id !== trip._id)
      );

      alert("Trip deleted successfully!");
    } catch (error) {
      alert(error.message);
    }
  }}
  className="mt-3 ml-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white"
>
  Delete Trip
</button>


        </div>
      ))}
    </div>
  )}
</div>}

    </div>
    
  );
}

export default OperatorDashboard;
