import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import '../../../css/records.css';
import Papa from 'papaparse';

export function Data_Reports() {
  const generateReportDonations = () => {
    const donationData = [{ Period: '1D', Donations: 1 }];
    const csv = Papa.unparse(donationData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'donation_report.csv');
  };

  const generateReportUsers = () => {
    const userData = [{ Period: '1D', New_Users: 2 }];
    const csv = Papa.unparse(userData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users_report.csv');
  };

  const generateReportSustainability = () => {
    const sustainabilityData = [{ Period: '1D', CO2_Reduced_kg: 0.5 }];
    const csv = Papa.unparse(sustainabilityData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'sustainability_report.csv');
  };

  const generateReportCharities = () => {
    const charityData = [{ Charity: 'Charity A', Donations_Received: 50 }];
    const csv = Papa.unparse(charityData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'charity_report.csv');
  };

  const generateAllReports = () => {
    generateReportDonations();
    generateReportUsers();
    generateReportSustainability();
    generateReportCharities();
  };

  return (
    <main>
      <div className="records-container">
        <div className="header-left">
          <h2>Generate Reports</h2>
        </div>

        <div className="return-right">
          <ul>
            <li>
              <Link to="/admin_dashboard">Return</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Report Type</th>
              <th>Description</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Donations Report</td>
              <td>Shows number of donations per day.</td>
              <td>
                <button
                  onClick={generateReportDonations}
                  className="donation-button"
                >
                  Download
                </button>
              </td>
            </tr>

            <tr>
              <td>User Report</td>
              <td>Lists new registered users for the period.</td>
              <td>
                <button
                  onClick={generateReportUsers}
                  className="donation-button"
                >
                  Download
                </button>
              </td>
            </tr>

            <tr>
              <td>Sustainability Report</td>
              <td>Displays total CO₂ reduced through donations.</td>
              <td>
                <button
                  onClick={generateReportSustainability}
                  className="donation-button"
                >
                  Download
                </button>
              </td>
            </tr>

            <tr>
              <td>Charity Report</td>
              <td>Shows each charity’s total donations received.</td>
              <td>
                <button
                  onClick={generateReportCharities}
                  className="donation-button"
                >
                  Download
                </button>
              </td>
            </tr>

            <tr>
              <td>
                <strong>All Reports</strong>
              </td>
              <td>Generate and download all reports at once.</td>
              <td>
                <button
                  onClick={generateAllReports}
                  className="donation-button"
                >
                  Download All
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Data_Reports;
