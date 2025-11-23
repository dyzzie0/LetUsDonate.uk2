import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../../css/records.css';

export function View_Donations() {
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Fetch all donations from backend
  useEffect(() => {
    fetch('http://localhost:8000/get_donations.php')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') {
          setDonations(data.donations);
          setFilteredDonations(data.donations);
        } else {
          console.error('Error fetching donations:', data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Network error:', err);
        setLoading(false);
      });
  }, []);

  // Handle search + filter
  const handleFilter = () => {
    const filtered = donations.filter((d) => {
      const matchesSearch =
        d.item_type?.toLowerCase().includes(search.toLowerCase()) ||
        d.donor_name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter
        ? d.donation_status?.toLowerCase() === statusFilter.toLowerCase()
        : true;
      return matchesSearch && matchesStatus;
    });
    setFilteredDonations(filtered);
  };

  return (
    <div>
      <main>
        <div className="records-container">
          <div className="header-left">
            <h2>View Donations</h2>
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
          <input
            type="text"
            placeholder="Search by Type or Donor..."
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
          <button className="filter-button" onClick={handleFilter}>
            Filter
          </button>
        </div>

        <div className="table-container">
          <div className="table">
            <table className="table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donor Name</th>
                  <th>Item</th>
                  <th>Image</th>
                  <th>Quantity</th>
                  <th>Date Donated</th>
                  <th>Charity Selected</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8">Loading...</td>
                  </tr>
                ) : filteredDonations.length > 0 ? (
                  filteredDonations.map((d) => (
                    <tr key={d.donation_ID}>
                      <td>{d.donation_ID}</td>
                      <td>{d.donor_name}</td>
                      <td>{d.item_name}</td>
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

                      <td>{d.quantity}</td>
                      <td>{d.donation_date}</td>
                      <td>{d.charity_name}</td>
                      <td>{d.donation_status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">No donations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default View_Donations;
