
import React, { useEffect, useState } from "react";

function AdminUsers({ setCurrentPage }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, role, isActive, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search.trim()) params.set("search", search.trim());
      if (role) params.set("role", role);
      if (isActive !== "") params.set("isActive", isActive);

      const response = await fetch(
        `http://localhost:5000/api/admin/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch users");
        return;
      }

      setUsers(data.users || []);
      setTotalUsers(data.totalUsers || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      alert("Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    const action = isActive ? "activate" : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} this user?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update user status");
        return;
      }

      // Refetch so status filters and pagination stay accurate.
      await fetchUsers();
    } catch (error) {
      alert("Cannot connect to the server.");
    }
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
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
          Users
        </h1>

        <p className="mb-8 text-gray-600">
          Manage registered customers, operators and admins.
        </p>

        <div className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-bold text-gray-800">
            All Users ({totalUsers})
          </h2>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Search name, email or phone..."
              value={search}
              onChange={(e) =>
                handleFilterChange(setSearch, e.target.value)
              }
              className="rounded-lg border border-gray-300 p-3"
            />

            <select
              value={role}
              onChange={(e) =>
                handleFilterChange(setRole, e.target.value)
              }
              className="rounded-lg border border-gray-300 p-3"
            >
              <option value="">All Roles</option>
              <option value="customer">Customer</option>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </select>

            <select
              value={isActive}
              onChange={(e) =>
                handleFilterChange(setIsActive, e.target.value)
              }
              className="rounded-lg border border-gray-300 p-3"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {loading ? (
            <p className="py-8 text-center text-gray-500">
              Loading users...
            </p>
          ) : users.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No users found.
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-gray-800">
                        {user.name}
                      </p>

                      <p className="break-all text-gray-600">
                        Email: {user.email}
                      </p>

                      <p className="text-gray-600">
                        Phone: {user.phone}
                      </p>

                      <p className="text-gray-600">
                        Role: {user.role}
                      </p>

                      <p className="text-gray-600">
                        Status:{" "}
                        <span
                          className={
                            user.isActive
                              ? "font-semibold text-green-700"
                              : "font-semibold text-red-700"
                          }
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          updateUserStatus(user._id, !user.isActive)
                        }
                        className={`rounded-lg px-4 py-2 font-semibold text-white ${
                          user.isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} · {totalUsers} users
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1 || loading}
                className="rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages || loading}
                className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
