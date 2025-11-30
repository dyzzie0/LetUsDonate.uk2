import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export default function Approve_Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionMessage, setActionMessage] = useState(null);

  // Get logged-in charity from localStorage
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const charityId =
    stored?.charity_ID ??
    stored?.charity?.charity_ID ??
    stored?.id ??
    null;

  // Load donations for this charity
  useEffect(() => {
    if (!charityId) {
      setLoading(false);
      return;
    }

    fetch(`http://localhost:8000/api/charity/${charityId}/donations`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setDonations(data.donations);
        } else {
          console.error("Error loading donations:", data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, [charityId]);

  // Helper: normalise image URL (same logic as user dashboard)
  const buildImageUrl = (item) => {
    if (!item?.item_image) return null;

    let path = item.item_image;

    // strip "public/" just in case
    path = path.replace(/^public\//, "");
    // strip leading slashes
    path = path.replace(/^\/+/, "");

    if (path.startsWith("http")) return path;

    return `http://localhost:8000/storage/${path}`;
  };

  const handleUpdateStatus = async (donationId, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/donations/${donationId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        // update local list
        setDonations((prev) =>
          prev.map((d) =>
            d.donation_ID === donationId
              ? { ...d, donation_status: newStatus }
              : d
          )
        );
        setActionMessage(`Donation #${donationId} set to ${newStatus}.`);
      } else {
        setActionMessage(data.message || "Unable to update status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      setActionMessage("Network error updating status.");
    }

    setTimeout(() => setActionMessage(null), 4000);
  };

  // Filtering
  const filteredDonations = donations.filter((d) => {
    const item = d.items?.[0];

    const matchesSearch =
      !search ||
      item?.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      item?.item_category?.toLowerCase().includes(search.toLowerCase()) ||
      item?.item_description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter
      ? d.donation_status?.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <main>
        <div className="records-container">
          <div className="header-left">
            <h2>Approve Donations</h2>
          </div>

          <div className="return-right">
            <ul>
              <li>
                <Link to="/charity_dashboard">Return</Link>
              </li>
              <li>
                <Link to="/charity_distribution_records">
                  Distribution Records
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by item, category, or description..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Declined">Declined</option>
          </select>
        </div>

        {actionMessage && (
          <div className="form-message success" style={{ margin: "0 2rem" }}>
            {actionMessage}
          </div>
        )}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Condition</th>
                <th>Quantity</th>
                <th>Image</th>
                <th>Date Donated</th>
                <th>Status</th>
                <th>Pickup Address</th>
                <th>Approve / Decline</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10">Loading donations...</td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan="10">No donations found.</td>
                </tr>
              ) : (
                filteredDonations.map((d) => {
                  const item = d.items?.[0];
                  const imgUrl = buildImageUrl(item);

                  return (
                    <tr key={d.donation_ID}>
                      <td>{d.donation_ID}</td>
                      <td>{item?.item_category ?? "N/A"}</td>
                      <td>{item?.item_description ?? "N/A"}</td>
                      <td>{item?.item_condition ?? "N/A"}</td>
                      <td>{item?.quantity ?? "1"}</td>

                      <td>
                        {imgUrl ? (
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={imgUrl}
                              alt={item?.item_name || "Donation item"}
                              style={{
                                width: "50px",
                                height: "auto",
                                borderRadius: "4px",
                              }}
                            />
                          </a>
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

                      <td>
                        <button
                          className="donation-button"
                          onClick={() =>
                            handleUpdateStatus(d.donation_ID, "Approved")
                          }
                          disabled={d.donation_status === "Approved"}
                        >
                          Approve
                        </button>
                        <button
                          className="donation-button"
                          onClick={() =>
                            handleUpdateStatus(d.donation_ID, "Declined")
                          }
                          disabled={d.donation_status === "Declined"}
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
