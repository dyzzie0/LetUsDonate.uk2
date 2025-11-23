import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';

export function View_Inventory() {
  const role = localStorage.getItem('role');

  const getReturnLink = () => {
    switch (role) {
      case 'charity':
        return '/Charity_dashboard';
      case 'admin':
        return '/Admin_dashboard';
      default:
        return '/';
    }
  };

  const [filters, setFilters] = useState({
    category: '',
    type: '',
    condition: '',
  });

  const [inventory] = useState([
    {
      id: 1,
      name: 'Shirt',
      category: "Men's",
      type: 'Shirt',
      condition: 'Like New',
      quantity: 1,
      image: 'https://via.placeholder.com/50',
    },
    {
      id: 2,
      name: 'Trousers',
      category: "Women's",
      type: 'Trouser',
      condition: 'Used - Good',
      quantity: 2,
      image: 'https://via.placeholder.com/50',
    },
  ]);

  const filteredInventory = inventory.filter((item) => {
    return (
      (filters.category === '' || item.category === filters.category) &&
      (filters.type === '' || item.type === filters.type) &&
      (filters.condition === '' || item.condition === filters.condition)
    );
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const categoryCounts = filteredInventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

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
          <table className="table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Item Name</th>
                <th>Category</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Condition</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>{item.type}</td>
                    <td>{item.quantity}</td>
                    <td>{item.condition}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No items match the selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default View_Inventory;
