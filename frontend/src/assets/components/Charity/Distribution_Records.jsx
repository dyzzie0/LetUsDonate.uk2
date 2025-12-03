import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export default function Charity_Distribution_Records() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const charityId = user?.charity_ID;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load items for this charity
  useEffect(() => {
    if (!charityId) return;

    fetch(`http://localhost:8000/api/inventory?charity_ID=${charityId}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.inventory || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [charityId]);

  // SEND / DISTRIBUTE ITEM
  const handleDistribute = async (inventoryId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/inventory/${inventoryId}/distribute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (data.status === "success") {
        // Remove from table after sending
        setItems((prev) => prev.filter((i) => i.inventory_ID !== inventoryId));
      }
    } catch (err) {
      console.error("Error distributing item:", err);
    }
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Distribution Records</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/charity_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Size / Type</th>
              <th>Quantity</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5">No items ready for distribution.</td>
              </tr>
            ) : (
              items.map((i) => (
                <tr key={i.inventory_ID}>
                  <td>{i.item}</td>
                  <td>{i.category}</td>
                  <td>{i.size || "N/A"}</td>
                  <td>{i.quantity}</td>
                  <td>
                    <button
                      className="donation-button"
                      onClick={() => handleDistribute(i.inventory_ID)}
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
