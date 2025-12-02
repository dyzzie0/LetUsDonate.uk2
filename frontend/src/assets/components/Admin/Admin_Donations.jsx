import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export function Admin_Donations() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const buildImageUrl = (path) => {
    if (!path) return null;
    path = path.replace(/^public\//, "").replace(/^\/+/, "");
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  }; // thiis isnt working atm

  // Fetch donations
  useEffect(() => {
    fetch("http://localhost:8000/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setDonations(data.donations);
          setFilteredDonations(data.donations);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, []);

  // Filtering (search by item name / category / donor ID)
  useEffect(() => {
    const filtered = donations.filter((d) => {
      const item = d.items?.[0] ?? {};

      const donorId = String(d?.donor?.user?.user_ID || "");
      const itemName = item?.item_name?.toLowerCase() || "";
      const itemCategory = item?.item_category?.toLowerCase() || "";

      const searchMatch =
        !search ||
        donorId.includes(search) ||
        itemName.includes(search.toLowerCase()) ||
        itemCategory.includes(search.toLowerCase());

      const statusMatch = statusFilter
        ? (d.donation_status || "").toLowerCase() === statusFilter.toLowerCase()
        : true;

      return searchMatch && statusMatch;
    });

    setFilteredDonations(filtered);
  }, [search, statusFilter, donations]);

  const handleFilter = () => {
    let results = donations;
    setFilteredDonations(results);
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Total Donations</h2>
        </div>

        <div className="return-right">
          <li>
            <Link to="/admin_dashboard">Return</Link>
          </li>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by item, category, or donor ID..."
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

        <button className="filter-button" onClick={handleFilter}>
          Reset
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Donor ID</th>
              <th>Category</th>
              <th>Item</th>
              <th>Image</th>
              <th>Quantity</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Loading...</td>
              </tr>
            ) : filteredDonations.length > 0 ? (
              filteredDonations.map((d) => {
                const item = d.items?.[0] ?? {};
                const donorId = d?.donor?.user_ID || "Unknown";
                const imgUrl = buildImageUrl(item?.item_image);

                return (
                  <tr key={d.donation_ID}>
                    <td>{d.donation_ID}</td>
                    <td>{donorId}</td>
                    <td>{item?.item_category ?? "N/A"}</td>
                    <td>{item?.item_name ?? "N/A"}</td>
                    <td>
                      {imgUrl ? (
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={imgUrl}
                            alt={item.item_name}
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
                    <td>{item?.quantity ?? 1}</td>
                    <td>{new Date(d.donation_date).toLocaleDateString()}</td>
                    <td>{d.donation_status}</td>
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
    </main>
  );
}

export default Admin_Donations;
