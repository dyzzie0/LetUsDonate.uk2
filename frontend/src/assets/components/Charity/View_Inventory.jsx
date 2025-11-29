import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';

export function View_Inventory() {
  const role = localStorage.getItem('role');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: '',
    type: '',
    condition: '',
  });

  const getReturnLink = () => {
    switch (role) {
      case '11':
        return '/charity_dashboard';
      case '12':
        return '/admin_dashboard';
      default:
        return '/';
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        let url = 'http://localhost:8000/api/inventory';
        
        // If charity staff, filter by their charity_ID
        if (role === '11' && user.charity_ID) {
          url += `?charity_ID=${user.charity_ID}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        // Handle both array and object responses
        const items = Array.isArray(data) ? data : data.data || [];
        setInventory(items);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError('Failed to load inventory');
        setLoading(false);
      }
    };

    fetchInventory();
  }, [role, user.user_ID]);

  const filteredInventory = inventory.filter((item) => {
    return (
      (filters.category === '' || item.category === filters.category) &&
      (filters.type === '' || item.item === filters.type) &&
      (filters.condition === '' || item.condition === filters.condition)
    );
  });

  const categoryCounts = filteredInventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.quantity || 1);
    return acc;
  }, {});

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  return (
    <div>
      <main>
        <div className="records-container">
          <div className="header-left">
            <h2>Inventory</h2>
            <div className="category-counts">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div key={category} className="category-count">
                  <strong>{category}:</strong> {count}
                </div>
              ))}
            </div>
          </div>

          <div className="return-right">
            <ul>
              <li>
                <a href={getReturnLink()}>Return</a>
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
            <option value="Women's">Women's</option>
            <option value="Men's">Men's</option>
            <option value="Girl's">Girl's</option>
            <option value="Boy's">Boy's</option>
          </select>

          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
          >
            <option value="">All Types</option>
            <option value="Shirt">Shirt</option>
            <option value="Trouser">Trouser</option>
            <option value="Jacket">Jacket</option>
            <option value="Shoes">Shoes</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="condition"
            value={filters.condition}
            onChange={handleFilterChange}
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Used - Good">Used - Good</option>
            <option value="Used - Fair">Used - Fair</option>
          </select>
        </div>

        {/* Table */}
        <div className="table-container">
          {loading ? (
            <p>Loading inventory...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Size</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.inventory_ID}>
                      <td>{item.inventory_ID}</td>
                      <td>{item.item_name}</td>
                      <td>{item.category}</td>
                      <td>{item.item}</td>
                      <td>{item.quantity}</td>
                      <td>{item.size || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No items match the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default View_Inventory;
