import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';

export function Distribution_Records() {
  return (
    <div>
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
                <th>Record ID</th>
                <th>Category ID</th>
                <th>Quantity</th>
                <th>Charity Allocated</th>
                <th>Date Distributed</th>
                <th>Status</th>
                <th>Send Donation</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>3</td>
                <td>2</td>
                <td>Charity A</td>
                <td>2024-05-01</td>
                <td className="status-in-transit">In-Transit</td>
                <td>
                  <button className="donation-button">Send Donation</button>
                  <button className="donation-button">Cancel Donation</button>
                </td>
                <td>Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Distribution_Records;
