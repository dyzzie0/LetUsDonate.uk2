import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../../css/records.css";

export default function Charity_Distribution_Records() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const charityId = user?.charity_ID;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState(null); // toast message

  // Show toast for 3 seconds
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load items
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

  // Distribute item
  const handleDistribute = async (inventoryId) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/inventory/${inventoryId}/distribute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await res.json();

      if (res.ok && data.status === "success") {
        showToast("Item has been successfully distributed!");

        // Change button to "Distributed" and fade out row
        setItems((prev) =>
          prev.map((i) =>
            i.inventory_ID === inventoryId
              ? { ...i, distributed: true }
              : i
          )
        );

        // Remove row after fade animation
        setTimeout(() => {
          setItems((prev) =>
            prev.filter((i) => i.inventory_ID !== inventoryId)
          );
        }, 600); // match CSS fade-out duration
      }
    } catch (err) {
      showToast("Network error occurred", "error");
    }
  };

  return (
    <main>
      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.msg}
        </div>
      )}

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
                <tr
                  key={i.inventory_ID}
                  className={i.distributed ? "fade-out" : ""}
                >
                  <td>{i.item}</td>
                  <td>{i.category}</td>
                  <td>{i.size || "N/A"}</td>
                  <td>{i.quantity}</td>
                  <td>
                    {i.distributed ? (
                      <button className="distributed-button" disabled>
                        Distributed ✓
                      </button>
                    ) : (
                      <button
                        className="donation-button"
                        onClick={() => handleDistribute(i.inventory_ID)}
                      >
                        Send
                      </button>
                    )}
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
