import React, { useEffect, useState } from "react";

function AdminOperators({ setCurrentPage }) {
    const [operators, setOperators] = useState([]);

    useEffect(() => {
  fetchOperators();
}, []);

const fetchOperators = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://localhost:5000/api/admin/operators",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to fetch operators");
      return;
    }

    setOperators(data.operators || []);
  } catch (error) {
    alert("Cannot connect to the server.");
  }
};

const updateOperatorApproval = async (operatorId, isApproved) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:5000/api/admin/operators/${operatorId}/approval`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isApproved }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update operator approval");
      return;
    }

    setOperators((currentOperators) =>
      currentOperators.map((operator) =>
        operator._id === operatorId ? data.operator : operator
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
          Operators
        </h1>

        <p className="mb-8 text-gray-600">
          Manage bus operators and approvals.
        </p>

        <div className="rounded-xl bg-white p-6 shadow-md">
  <h2 className="mb-4 text-xl font-bold text-gray-800">
    All Operators
  </h2>

  {operators.length === 0 ? (
    <p className="text-gray-500">No operators found.</p>
  ) : (
    <div className="space-y-3">
      {operators.map((operator) => (
        <div
          key={operator._id}
          className="rounded-lg border p-4"
        >
          <p className="font-semibold text-gray-800">
            {operator.user?.name}
          </p>

          <p className="text-gray-600">
            Email: {operator.user?.email}
          </p>

          <p className="text-gray-600">
            Phone: {operator.user?.phone}
          </p>

          <p className="text-gray-600">
            Approval:{" "}
            {operator.isApproved ? "Approved" : "Not Approved"}
          </p>
          <button
  onClick={() =>
    updateOperatorApproval(
      operator._id,
      !operator.isApproved
    )
  }
  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
>
  {operator.isApproved ? "Reject" : "Approve"}
</button>
        </div>
      ))}
    </div>
  )}
</div>

      </div>
    </div>
  );
}

export default AdminOperators;