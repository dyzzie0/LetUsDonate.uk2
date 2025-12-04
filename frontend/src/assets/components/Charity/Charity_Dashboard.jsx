import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Chart } from "chart.js/auto";
import "../../../css/charity.css";

function getChartTextColor() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "#ffffff"
    : "#000000";
}

export default function Charity_Dashboard() {
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ items: 0, co2: 0, people: 0 });
  const [loading, setLoading] = useState(true);

  const chartRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");

  // Only allow charity role
  useEffect(() => {
    if (!user.user_ID || role !== "11") {
      window.location.href = "/login";
    }
  }, [user.user_ID, role]);

  // Fetch donations + inventory
  useEffect(() => {
    const fetchData = async () => {
      try {
        const donationRes = await fetch(
          `http://localhost:8000/api/charity/${user.charity_ID}/donations`,
        );
        const donationJson = await donationRes.json();

        const donationList =
          donationJson.status === "success" ? donationJson.donations : [];

        const inventoryRes = await fetch(
          `http://localhost:8000/api/inventory?charity_ID=${user.charity_ID}`,
        );
        const inventoryJson = await inventoryRes.json();

        const inventoryList = inventoryJson.inventory || [];

        setDonations(donationList);
        setInventory(inventoryList);

        //calculate stats for just this charity
        const totalItems = donationList.reduce((sum, d) => {
          if (!d.items) return sum;

          const count = d.items.reduce((acc, item) => {
            const qty = Number(item.quantity) || 1;
            return acc + qty;
          }, 0);

          return sum + count;
        }, 0);

        setStats({
          items: totalItems,
          co2: (totalItems * 1.5).toFixed(1),
          people: totalItems * 1,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user.charity_ID]);

  // pie chart for inventory categories
  useEffect(() => {
    if (!inventory.length) return;

    //group inventory by category
    const categoryMap = {};

    inventory.forEach((item) => {
      const category = item.category || "Unknown";
      const qty = Number(item.quantity) || 0;

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }
      categoryMap[category] += qty;
    });

    const labels = Object.keys(categoryMap); //mens/womens/girls/boys
    const quantities = Object.values(categoryMap);

    if (chartRef.current) chartRef.current.destroy();

    const ctx = document.getElementById("myChart");
    chartRef.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            data: quantities,
            backgroundColor: [
              "#5b7d62",
              "#76a79b",
              "#9fc3ab",
              "#2d484c",
              "#7e8568",
            ],
          },
        ],
      },
      options: {
        color: getChartTextColor(),
        responsive: true,
        plugins: { legend: { position: "right" } },
      },
    });
  }, [inventory]);

  // Image URL formatter
  const buildImageUrl = (path) => {
    if (!path) return null;
    return `http://localhost:8000/storage/${path.replace("public/", "")}`;
  };

  return (
    <div className="charity-dashboard-container">
      <div className="dashboard">
        <aside className="links">
          <ul>
            <li>
              <i className="fa-solid fa-shirt"></i>
              <Link to="/View_Inventory">Inventory</Link>
            </li>
            <li>
              <i className="fa-solid fa-warehouse"></i>
              <Link to="/view_donations">Donations</Link>
            </li>
            <li>
              <i className="fa-solid fa-hand-holding-heart"></i>
              <Link to="/approve_donations">Approve Donations</Link>
            </li>
            <li>
              <i className="fa-solid fa-truck"></i>
              <Link to="/distribution_records">
                Distribution Records
              </Link>
            </li>
            <li>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <button
                type="button"
                className="logout-btn"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </aside>

        <main className="dashboard-main">
          <h2>Welcome, {user.user_name} Staff!</h2>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              <div className="stats-container">
                <div className="stat-card">
                  <i className="fa-solid fa-leaf"></i>
                  <p className="stat-number">{stats.co2} kg</p>
                  <p className="stat-text">CO₂ Saved</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-shirt"></i>
                  <p className="stat-number">{stats.items}</p>
                  <p className="stat-text">Items Donated</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-people-group"></i>
                  <p className="stat-number">{stats.people}</p>
                  <p className="stat-text">People Helped</p>
                </div>
              </div>

              <div className="inventory-chart">
                <h3>Inventory Overview</h3>
                <canvas
                  id="myChart"
                  style={{ width: "100%", maxWidth: "700px" }}
                ></canvas>
              </div>
            </>
          )}
        </main>
      </div>

      <div className="donation-history">
        <h3>Recent Donations</h3>
        <table>
          <thead>
            <tr>
              <th>Donor</th>
              <th>Email</th>
              <th>Category</th>
              <th>Item</th>
              <th>Image</th>
              <th>Date</th>
              <th>Status</th>
              <th>Pickup</th>
            </tr>
          </thead>

          <tbody>
            {donations.length ? (
              donations.slice(0, 5).map((d) => {
                const item = d.items?.[0] || {};
                const imgUrl = buildImageUrl(item.item_image);

                //display recent 5 donations
                return (
                  <tr key={d.donation_ID}>
                    <td>{d.donor?.user?.user_name || "Unknown"}</td>
                    <td>{d.donor?.user?.user_email || "N/A"}</td>
                    <td>{item.item_category || "N/A"}</td>
                    <td>{item.item_name || "N/A"}</td>
                    <td>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "4px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>
                      {d.donation_date
                        ? new Date(d.donation_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>{d.donation_status}</td>
                    <td>{d.pickup_address || "N/A"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8">No donations found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
