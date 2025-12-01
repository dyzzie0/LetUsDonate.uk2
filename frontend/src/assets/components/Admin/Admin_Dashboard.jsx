import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Chart } from "chart.js/auto";
import "../../../css/admin.css";

export function Admin_Dashboard() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for charts
  const donationChartRef = useRef(null);
  const userChartRef = useRef(null);
  const sustainabilityChartRef = useRef(null);
  const charityChartRef = useRef(null);

  // Fetch donations from API
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setDonations(data.donations);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, []);

  // Helper: filter donations by time
  const filterByTime = (days) => {
    const now = new Date();
    return donations.filter((d) => {
      const date = new Date(d.donation_date);
      return (now - date) / (1000 * 60 * 60 * 24) <= days;
    });
  };

  useEffect(() => {
    if (loading || donations.length === 0) return;

    const labels = ["1D", "1W", "1M", "3M", "6M", "Total"];

    const countByStatus = (days, status) => {
      const filtered = days === "Total" ? donations : filterByTime(days);
      return filtered.filter((d) => d.donation_status === status).length;
    };

    const dayMap = {
      "1D": 1,
      "1W": 7,
      "1M": 30,
      "3M": 90,
      "6M": 180,
      Total: "Total",
    };

    // Prepare datasets
    const approvedCounts = labels.map((l) =>
      countByStatus(dayMap[l], "Approved"),
    );
    const pendingCounts = labels.map((l) =>
      countByStatus(dayMap[l], "Pending"),
    );
    const declinedCounts = labels.map((l) =>
      countByStatus(dayMap[l], "Declined"),
    );

    // Destroy previous chart js incase it exists
    if (donationChartRef.current) donationChartRef.current.destroy();

    const donationCtx = document.getElementById("donationTrends");
    donationChartRef.current = new Chart(donationCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Approved",
            data: approvedCounts,
            borderColor: "#22C55E", // green
            backgroundColor: "rgba(34, 197, 94, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Pending",
            data: pendingCounts,
            borderColor: "#3B82F6", // blue
            backgroundColor: "rgba(160, 179, 229, 0.15)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
          {
            label: "Declined",
            data: declinedCounts,
            borderColor: "#8B5CF6", // purple
            backgroundColor: "rgba(139, 92, 246, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" }, title: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    // User trends
    const userCounts = labels.map((label) => {
      let filtered = [];
      switch (label) {
        case "1D":
          filtered = filterByTime(1);
          break;
        case "1W":
          filtered = filterByTime(7);
          break;
        case "1M":
          filtered = filterByTime(30);
          break;
        case "3M":
          filtered = filterByTime(90);
          break;
        case "6M":
          filtered = filterByTime(180);
          break;
        case "Total":
          filtered = donations;
          break;
      }
      const uniqueUsers = new Set(filtered.map((d) => d.donor_ID));
      return uniqueUsers.size;
    });

    if (userChartRef.current) userChartRef.current.destroy();
    const userCtx = document.getElementById("userTrends");
    userChartRef.current = new Chart(userCtx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Active Donors",
            data: userCounts,
            borderColor: "#3B62F6", // blue
            backgroundColor: "rgba(59, 130, 246, 0.2)",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true }, title: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    const sustainabilityCtx = document.getElementById(
      "sustainabilityImpactChart",
    );

    if (sustainabilityChartRef.current)
      sustainabilityChartRef.current.destroy();

    sustainabilityChartRef.current = new Chart(sustainabilityCtx, {
      type: "bar",
      data: {
        labels: ["Sustainability Impact"],
        datasets: [
          {
            label: "Items Reused",
            data: [donations.length],
            backgroundColor: "#8B5CF6", // purple
          },
          {
            label: "CO₂ Reduced (kg)",
            data: [donations.length * 1.5],
            backgroundColor: "#22C55E", // green
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: "top" },
          title: { display: true, text: "Sustainability Impact" },
        },
        scales: { y: { beginAtZero: true } },
      },
    });

    //Charity Performance
    const charities = {};
    donations.forEach((d) => {
      const name = d.charity?.charity_name || "Unknown";
      charities[name] = (charities[name] || 0) + 1;
    });

    if (charityChartRef.current) charityChartRef.current.destroy();
    const charityCtx = document.getElementById("charityPerformance");
    charityChartRef.current = new Chart(charityCtx, {
      type: "pie",
      data: {
        labels: Object.keys(charities),
        datasets: [
          {
            data: Object.values(charities),
            backgroundColor: [
              "#60A5FA", // light blue
              "#22D3EE", // cyan
              "#34D399", // green
              "#A78BFA", // purple
              "#FBBF24", // orange
              "#F87171", // red/pink
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "right" } },
      },
    });
  }, [donations, loading]);

  // Statistics
  const totalDonations = donations.length;
  const totalItems = donations.reduce(
    (sum, d) => sum + (d.items?.length || 0),
    0,
  );
  const totalCO2Saved = (totalItems * 1.5).toFixed(1);
  const activeCharities = new Set(donations.map((d) => d.charity?.charity_name))
    .size;

  return (
    <div className="admin-dashboard">
      <div className="admin-links">
        <h2>Welcome Admin!</h2>
        <li>
          <i className="fa-solid fa-users"></i>
          <Link to="/view_users">View Users</Link>
        </li>
        <li>
          <i className="fa-solid fa-database"></i>
          <Link to="/admin_inventory">View Inventory</Link>
        </li>
        <li>
          <i className="fa-solid fa-hand-holding-heart"></i>
          <Link to="/admin_donations">Donations</Link>
        </li>
        <li>
          <i className="fa-solid fa-chart-line"></i>
          <Link to="/data_reports">Data Reports</Link>
        </li>
        <li>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <button
            className="admin-button"
            onClick={() => {
              localStorage.removeItem("admin");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </li>
      </div>

      <div className="admin-overview">
        <div className="Stats">
          <div>
            <h4>Total Items Donated</h4>
            <p>{totalDonations}</p>
          </div>
          <div>
            <h4>Total Items Accepted</h4>
            <p>{totalItems}</p>
          </div>
          <div>
            <h4>Total CO₂ Saved</h4>
            <p>{totalCO2Saved} kg</p>
          </div>
          <div>
            <h4>Active Charities</h4>
            <p>{activeCharities}</p>
          </div>
        </div>
      </div>

      <div className="data-reports">
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <>
            <div className="chart-card">
              <h3>Donation Trends</h3>
              <canvas id="donationTrends"></canvas>
            </div>
            <div className="chart-card">
              <h3>Monthly User Trends</h3>
              <canvas id="userTrends"></canvas>
            </div>
            <div className="chart-card">
              <h3>Sustainability Impact</h3>
              <canvas id="sustainabilityImpactChart"></canvas>
            </div>
            <div className="chart-card">
              <h3>Charity Performance Comparison</h3>
              <canvas id="charityPerformance"></canvas>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Admin_Dashboard;
