import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';

export function Approve_Donations() {
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
                <Link to="/charity_distribution_records">Distribution Records</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by Charity..."
            className="search-input"
          />
          <select className="status-filter">
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
          <button className="filter-button">Filter</button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Donation ID</th>
                <th>Category ID</th>
                <th>Description</th>
                <th>Condition</th>
                <th>Quantity</th>
                <th>Image</th>
                <th>Date Donated</th>
                <th>Status</th>
                <th>Pick Up Adress</th>
                <th>Pick Up Time</th>
                <th>Approve/Decline Donation</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>2</td>
                <td>Clothes in good condition</td>
                <td>Good</td>
                <td>3</td>
                <td>
                  <img src="https://via.placeholder.com/50" alt="Donation" />
                </td>
                <td>John Doe</td>
                <td>2024-05-10</td>
                <td className="status-pending">Pending</td>
                <td>123 Main St, Cityville</td>
                <td>2024-05-15 10:00 AM</td>
                <td>
                  <button className="donation-button">Approve</button>
                  <button className="donation-button">Decline</button>
                </td>
                <td>Awaiting Action</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Approve_Donations;
