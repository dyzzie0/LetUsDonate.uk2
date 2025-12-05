import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

// This component allows admin to view and filter inventory items
export function Admin_Inventory() {
  const role = localStorage.getItem("role");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    category: "",
    type: "",
  });

  const handleFilter = () => {
    let results = inventory;
    setFilteredInventory(results);
  };

  //load inventory from Laravel
  useEffect(() => {
    let url = "http://localhost:8000/api/inventory";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const items = data.inventory || [];
        setInventory(items);
        setFilteredInventory(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [role, user.charity_ID]);

  //filtering logic
  const handleFilterChange = (e) => {
    const updated = { ...filters, [e.target.name]: e.target.value };
    setFilters(updated);

    const filtered = inventory.filter(
      (item) =>
        (updated.category === "" || item.category === updated.category) &&
        (updated.type === "" || item.size === updated.type),
    );

    setFilteredInventory(filtered);
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

        <button className="filter-button" onClick={handleFilter}>
          Reset
        </button>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        {loading ? (
          <p>Loading inventory...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Type</th>
                <th>Category</th>
                <th>Size</th>
              </tr>
            </thead>

            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.inventory_ID}>
                    <td>{item.inventory_ID}</td>
                    <td>{item.item}</td>
                    <td>{item.category}</td>
                    <td>{item.size || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

export default Admin_Inventory;
