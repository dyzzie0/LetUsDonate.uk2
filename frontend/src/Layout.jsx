import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';

// Headers & Footer
import Header from './assets/components/Header.jsx';
import Header_Alt from './assets/components/Header_Alt.jsx';
import Footer from './assets/components/Footer.jsx';

// Initial pages
import Home from './assets/components/Home.jsx';
import Sign_up from './assets/components/Sign_up.jsx';
import Login from './assets/components/Login.jsx';
import FAQ from './assets/components/FAQ.jsx';
import Our_Partners from './assets/components/Our_Partners.jsx';

// Admin
import Admin_Dashboard from './assets/components/Admin/Admin_Dashboard.jsx';
import Add_Charity from './assets/components/Admin/Add_Charity.jsx';
import Data_Reports from './assets/components/Admin/Data_Reports.jsx';
import View_Users from './assets/components/Admin/View_Users.jsx';

// Charity
import Charity_Dashboard from './assets/components/Charity/Charity_Dashboard.jsx';
import Approve_Donations from './assets/components/Charity/Approve_Donations.jsx';
import Distribution_Records from './assets/components/Charity/Distribution_Records.jsx';
import View_Donations from './assets/components/Charity/View_Donations.jsx';
import View_Inventory from './assets/components/Charity/View_Inventory.jsx';

// User
import User_Dashboard from './assets/components/User/User_Dashboard.jsx';
import My_Donations from './assets/components/User/My_Donations.jsx';
import My_Impact from './assets/components/User/My_Impact.jsx';
import My_Profile from './assets/components/User/My_Profile.jsx';

// Footer content pages
import Terms_Conditions from './assets/components/Footer_Content/Terms_Conditions.jsx';
import Privacy_Policy from './assets/components/Footer_Content/Privacy_Policy.jsx';
import Cookie_Policy from './assets/components/Footer_Content/Cookie_Policy.jsx';
import Accessibility from './assets/components/Footer_Content/Accessibility.jsx';

// Not found page
import NotFound from './404.jsx';

export default function Layout() {
  const location = useLocation();
  const path = location.pathname.toLowerCase();

  // Paths without a header/footer
  const noHeaderFooterPaths = ['/login', '/sign_up'];

  // Paths that use the alternative header
  const altHeaderPaths = [
    '/user_dashboard',
    '/my_donations',
    '/my_impact',
    '/charity_dashboard',
    '/view_inventory',
    '/view_donations',
    '/distribution_records',
    '/approve_donations',
    '/admin_dashboard',
    '/view_users',
    '/data_reports',
    '/my_profile'
  ];

  const hideHeaderFooter = noHeaderFooterPaths.includes(path);
  const useAltHeader = altHeaderPaths.includes(path);

  useEffect(() => {
    console.log('Current path:', path);
  }, [path]);

  return (
    <>
      {/* Header */}   
      {!hideHeaderFooter && (useAltHeader ? <Header_Alt /> : <Header />)}

      <Routes>
        {/* Initial pages */}
        <Route path="/" element={<Home />} />
        <Route path="/sign_up" element={<Sign_up />} />
        <Route path="/login" element={<Login />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/our_partners" element={<Our_Partners />} />

        {/* Admin */}
        <Route path="/admin_dashboard" element={<Admin_Dashboard />} />
        <Route path="/add_charity" element={<Add_Charity />} />
        <Route path="/data_reports" element={<Data_Reports />} />
        <Route path="/view_users" element={<View_Users />} />

        {/* Charity */}
        <Route path="/charity_dashboard" element={<Charity_Dashboard />} />
        <Route path="/view_inventory" element={<View_Inventory />} />
        <Route path="/view_donations" element={<View_Donations />} />
        <Route path="/distribution_records" element={<Distribution_Records />} />
        <Route path="/approve_donations" element={<Approve_Donations />} />

        {/* User */}
        <Route path="/user_dashboard" element={<User_Dashboard />} />
        <Route path="/my_donations" element={<My_Donations />} />
        <Route path="/my_impact" element={<My_Impact />} />
        <Route path="/my_profile" element={<My_Profile />} />

        {/* Footer items */}
        <Route path="/terms_conditions" element={<Terms_Conditions />} />
        <Route path="/privacy_policy" element={<Privacy_Policy />} />
        <Route path="/cookie_policy" element={<Cookie_Policy />} />
        <Route path="/accessibility" element={<Accessibility />} />

        {/* Catch if not found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Footer */}
      {!hideHeaderFooter && <Footer />}
    </>
  );
}
