import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/charity.css";

export default function Charity_Dashboard() {
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({ items: 0, co2: 0, people: 0 });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = localStorage.getItem("role");

  // -----------------------------------------
  // 🚨 AUTH CHECK — only charity role (11)
  // -----------------------------------------
  useEffect(() => {
    if (!user.user_ID || role !== "11") {
      window.location.href = "/login";
      return;
    }
  }, [user.user_ID, role]);

  // -----------------------------------------
  // 📌 FETCH DONATIONS + INVENTORY
  // -----------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get donations for this charity
        const donationRes = await fetch(
          `http://localhost:8000/api/charity/${user.charity_ID}/donations`
        );
        const donationJson = await donationRes.json();

        const donationList =
          donationJson.status === "success" ? donationJson.donations : [];

        // Get inventory for this charity
        const inventoryRes = await fetch(
          `http://localhost:8000/api/inventory?charity_ID=${user.charity_ID}`
        );
        const inventoryJson = await inventoryRes.json();

        const inventoryList = Array.isArray(inventoryJson)
          ? inventoryJson
          : inventoryJson.data || [];

        setDonations(donationList);
        setInventory(inventoryList);

        // ----------------------------
        // 🧮 CALCULATE STATISTICS
        // ----------------------------
        const totalItems = donationList.reduce((sum, d) => {
          const item = d.items?.[0];
          const qty = item?.quantity ? Number(item.quantity) : 1;
          return sum + qty;
        }, 0);

        setStats({
          items: totalItems,
          co2: (totalItems * 1.5).toFixed(1),
          people: totalItems * 2,
        });

        setLoading(false);
      } catch (err) {
        console.error("Could not fetch charity dashboard data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [user.charity_ID]);

  // -----------------------------------------
  // 📊 LOAD INVENTORY PIE CHART
  // -----------------------------------------
  useEffect(() => {
    if (inventory.length && window.Chart) {
      const labels = inventory.map((item) => item.item);
      const quantities = inventory.map((item) => item.quantity);

      new window.Chart("myChart", {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              backgroundColor: [
                "#5b7d62",
                "#76a79b",
                "#9fc3ab",
                "#2d484c",
                "#7e8568",
              ],
              data: quantities,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: "Current Inventory Overview",
          },
          responsive: true,
        },
      });
    }
  }, [inventory]);

  // -----------------------------------------
  // 🖼 Clean Image URL builder
  // -----------------------------------------
  const buildImageUrl = (path) => {
    if (!path) return null;
    path = path.replace(/^public\//, "").replace(/^\/+/, "");
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="charity-dashboard-container">
      <div className="dashboard">
        {/* ===========================
            ASIDE NAVIGATION
        ============================ */}
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
              <Link to="/charity_distribution_records">
                Distribution Records
              </Link>
            </li>

            <li>
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
              <button
                className="logout-btn"
                type="button"
                onClick={() => {
                  localStorage.removeItem("user");
                  localStorage.removeItem("role");
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </aside>

        {/* ===========================
            MAIN DASHBOARD CONTENT
        ============================ */}
        <main className="dashboard-main">
          <h2>Welcome, {user.user_name} Staff!</h2>

          {loading ? (
            <p>Loading dashboard...</p>
          ) : (
            <>
              {/* ---------- STAT CARDS ---------- */}
              <div className="stats-container">
                <div className="stat-card">
                  <i className="fa-solid fa-leaf"></i>
                  <p className="stat-number">{stats.co2} kg</p>
                  <p className="stat-text">CO₂ Saved Today</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-shirt"></i>
                  <p className="stat-number">{stats.items}</p>
                  <p className="stat-text">Items Donated Today</p>
                </div>

                <div className="stat-card">
                  <i className="fa-solid fa-people-group"></i>
                  <p className="stat-number">{stats.people}</p>
                  <p className="stat-text">People Helped Today</p>
                </div>
              </div>

              {/* ---------- INVENTORY CHART ---------- */}
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

      {/* ===========================
          RECENT DONATIONS TABLE
      ============================ */}
      <div className="donation-history">
        <h3>Recent Donations</h3>
        <table>
          <thead>
            <tr>
              <th>Donor ID</th>
              <th>Name</th>
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
                const donor = d.donor || {};
                const item = d.items?.[0] || {};
                const imgUrl = buildImageUrl(item.item_image);

                return (
                  <tr key={d.donation_ID}>
                    <td>{donor.donor_ID ?? "N/A"}</td>
                    <td>{d.donor?.user?.name ?? "Unknown"}</td>
                    <td>{donor.donor_email ?? "N/A"}</td>
                    <td>{item.item_category ?? "N/A"}</td>
                    <td>{item.item_name ?? "N/A"}</td>

                    <td>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.item_name}
                          style={{ width: "50px", borderRadius: "4px" }}
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
                <td colSpan="9">No donations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
