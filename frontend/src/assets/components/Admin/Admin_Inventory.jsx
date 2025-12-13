import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";
import "../../../css/modal.css";

// Admin Inventory now pulls from donations to show all approved items
export function Admin_Inventory() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", type: "" });

  // Modal state for viewing images
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Build image URL
  const buildImageUrl = (path) => {
    if (!path) return null;
    path = path.replace(/^public\//, "").replace(/^\/+/, "");
    return `http://localhost:8000/storage/${path}`;
  };

  // Fetch donations and use approved ones as inventory
  useEffect(() => {
    fetch("http://localhost:8000/api/donations")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          // Flatten donations to inventory items
          const approvedItems = [];
          data.donations.forEach((donation) => {
            if ((donation.donation_status || "").toLowerCase() === "approved") {
              donation.items?.forEach((item) => {
                approvedItems.push({
                  inventory_ID: donation.donation_ID,
                  item: item.item_name,
                  category: item.item_category,
                  size: item.item_size || "N/A",
                  image: item.item_image,
                  donor_ID: donation.donor?.user_ID,
                  donation_date: donation.donation_date,
                });
              });
            }
          });

          setInventory(approvedItems);
          setFilteredInventory(approvedItems);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Network error:", err);
        setLoading(false);
      });
  }, []);

  

  // Handle filter changes
  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    const filtered = inventory.filter(
      (item) =>
        (updated.category === "" || item.category === updated.category) &&
        (updated.type === "" || item.size === updated.type)
    );

    setFilteredInventory(filtered);
  };

  const handleReset = () => {
    setFilters({ category: "", type: "" });
    setFilteredInventory(inventory);
  };

  const openModal = (imgUrl) => {
    setModalImage(imgUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalImage(null);
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Inventory</h2>
        </div>
        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="filter-bar">
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
        >
          <option value="">All Categories</option>
          <option value="womens">Women's</option>
          <option value="mens">Men's</option>
          <option value="girls">Girls</option>
          <option value="boys">Boys</option>
        </select>

        <select name="type" value={filters.type} onChange={handleFilterChange}>
          <option value="">All Types</option>
          <option value="shirt">Shirt</option>
          <option value="trouser">Trouser</option>
          <option value="jacket">Jacket</option>
          <option value="shoe">Shoes</option>
          <option value="other">Other</option>
        </select>

        <button className="filter-button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Donor ID</th>
                <th>Item</th>
                <th>Category</th>
                <th>Size</th>
                <th>Image</th>
                <th>Date Donated</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const imgUrl = buildImageUrl(item.image);
                  return (
                    <tr key={`${item.inventory_ID}-${item.item}`}>
                      <td>{item.inventory_ID}</td>
                      <td>{item.donor_ID || "Unknown"}</td>
                      <td>{item.item}</td>
                      <td>{item.category}</td>
                      <td>{item.size}</td>
                      <td>
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.item}
                            style={{
                              width: "50px",
                              height: "auto",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onClick={() => openModal(imgUrl)}
                          />
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>
                        {item.donation_date
                          ? new Date(item.donation_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">No approved items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && modalImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={modalImage} alt="Full Preview" className="full-image" />
            <button className="close-modal-btn" onClick={closeModal}>
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin_Inventory;
