import React, { useEffect, useState } from "react";

function AdminDashboard({ setCurrentPage }) {
    
const [stats, setStats] = useState({
  totalUsers: 0,
  totalOperators: 0,
  totalTrips: 0,
  totalBookings: 0,
  confirmedBookings: 0,
  cancelledBookings: 0,
  totalRevenue: 0,
});
useEffect(() => {
  fetchDashboardStats();
}, []);

const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/admin/dashboard",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to fetch dashboard statistics");
      return;
    }

    setStats(data.statistics);
  } catch (error) {
    alert("Cannot connect to the server.");
  }
};

const dashboardCards = [
  { title: "Users", value: stats.totalUsers, description: "Manage registered customers.", icon: "♙", tone: "blue", page: "admin-users" },
  { title: "Operators", value: stats.totalOperators, description: "Manage bus operators and approvals.", icon: "▣", tone: "green", page: "admin-operators" },
  { title: "Bookings", value: stats.totalBookings, description: "View and manage all bookings.", icon: "▤", tone: "purple", page: "admin-bookings" },
  { title: "Total Trips", value: stats.totalTrips, description: "Total scheduled trips.", icon: "⌁", tone: "blue" },
  { title: "Confirmed Bookings", value: stats.confirmedBookings, description: "Currently confirmed bookings.", icon: "✓", tone: "green" },
  { title: "Cancelled Bookings", value: stats.cancelledBookings, description: "Total cancelled bookings.", icon: "×", tone: "red" },
  { title: "Total Revenue", value: `₹${stats.totalRevenue}`, description: "Revenue from confirmed bookings.", icon: "₹", tone: "amber" },
];

  return (
    <main className="admin-dashboard min-h-screen bg-slate-100 px-5 py-10 sm:px-8">
      <div className="mx-auto max-w-[1440px]">
        <header className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Administration</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Admin Dashboard</h1>
          <p className="mt-2 text-base text-slate-600">Manage users, operators, bookings and system activities.</p>
        </header>

        <section aria-label="Dashboard overview" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardCards.map((card) => {
            const Card = card.page ? "button" : "article";
            return (
              <Card
                key={card.title}
                type={card.page ? "button" : undefined}
                onClick={card.page ? () => setCurrentPage(card.page) : undefined}
                className={`admin-dashboard-card admin-card-${card.tone} ${card.page ? "admin-dashboard-card-action" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold leading-6 text-slate-800">{card.title}</h2>
                    <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">{card.value}</p>
                  </div>
                  <span className="admin-dashboard-icon" aria-hidden="true">{card.icon}</span>
                </div>
                <p className="mt-4 text-sm leading-5 text-slate-500">{card.description}</p>
                {card.page && <span className="admin-card-link">Open section <span aria-hidden="true">→</span></span>}
              </Card>
            );
          })}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
