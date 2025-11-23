import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';

export function My_Donations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!user.id) return;

    fetch(`http://localhost:8000/get_donations.php?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') setDonations(data.donations);
        else console.error('Error fetching donations:', data.message);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Network error:', err);
        setLoading(false);
      });
  }, [user.id]);

  // Filter donations //

  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      d.item_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.item_category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter
      ? d.donation_status?.toLowerCase() === statusFilter.toLowerCase()
      : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Donation History</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
             <Link to ="/User_Dashboard" className ="return-link">
             Return
             </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by item or category..."
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
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="filter-button" onClick={() => {}}>
          Filter
        </button>
      </div>

      <div className="table-container">
        <div className="table">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Name</th>
                <th>Description</th>
                <th>Condition</th>
                <th>Image</th>
                <th>Date Donated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">Loading donations...</td>
                </tr>
              ) : filteredDonations.length > 0 ? (
                filteredDonations.map((d) => (
                  <tr key={d.donation_ID}>
                    <td>{d.item_category}</td>
                    <td>{d.item_name}</td>
                    <td>{d.item_description || 'N/A'}</td>
                    <td>{d.item_condition}</td>
                    <td>
                      {d.item_image ? (
                        <a
                          href={`http://localhost:8000/${d.item_image}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={`http://localhost:8000/${d.item_image}`}
                            alt={d.item_name}
                            style={{
                              width: '50px',
                              height: 'auto',
                              borderRadius: '4px',
                            }}
                          />
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td>{d.donation_date}</td>
                    <td>{d.donation_status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No donations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default My_Donations;
