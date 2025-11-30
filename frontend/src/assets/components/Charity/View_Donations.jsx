import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export default function View_Donations() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem("role");

  //get logged-in charity
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  const charityId =
    stored?.charity_ID ??
    stored?.charity?.charity_ID ??
    stored?.id ??
    null;

  const getReturnLink = () => {
    switch (role) {
      case "charity":
        return "/charity_dashboard";
      case "admin":
        return "/admin_dashboard";
      default:
        return "/";
    }
  };

  //build correct image URL
  const buildImageUrl = (path) => {
    if (!path) return null;
    path = path.replace(/^public\//, "");
    path = path.replace(/^\/+/, "");
    if (path.startsWith("http")) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  //fetch THIS charity's donations only
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
          setFilteredDonations(data.donations);
        } else {
          console.error("Error:", data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, [charityId]);

  //apply filters
  const handleFilter = () => {
    const filtered = donations.filter((d) => {
      const item = d.items?.[0];

      const matchesSearch =
        !search ||
        item?.item_name?.toLowerCase().includes(search.toLowerCase()) ||
        item?.item_category?.toLowerCase().includes(search.toLowerCase()) ||
        d?.donor?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter
        ? d.donation_status?.toLowerCase() === statusFilter.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    });

    setFilteredDonations(filtered);
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Donations to Your Charity</h2>
        </div>

        <div className="return-right">
          <ul>
          <li>
                <Link to="/charity_dashboard">Return</Link>
              </li>
          </ul>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by item, donor, or category..."
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
          Filter
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Donation ID</th>
              <th>Donor</th>
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
                const item = d.items?.[0];
                const imgUrl = buildImageUrl(item?.item_image);

                return (
                  <tr key={d.donation_ID}>
                    <td>{d.donation_ID}</td>
                    <td>{d.donor?.user?.name ?? "Unknown"}</td>
                    <td>{item?.item_category ?? "N/A"}</td>
                    <td>{item?.item_name ?? "N/A"}</td>
                    <td>
                    {item?.item_image ? (
                      (() => {
                        let path = item.item_image;

                        path = path.replace(/^public\//, "");

                        path = path.replace(/^\/+/, "");

                        const imageUrl = path.startsWith("http")
                          ? path
                          : `http://localhost:8000/storage/${path}`;

                        return (
                          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={imageUrl}
                              alt={item.item_name}
                              style={{ width: "50px", height: "auto", borderRadius: "4px" }}
                            />
                          </a>
                        );
                      })()
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
                <td colSpan="8">No donations found for your charity.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
