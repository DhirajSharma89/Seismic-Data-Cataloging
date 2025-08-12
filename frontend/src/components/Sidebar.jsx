import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => (
  <div className="sidebar">
    <img src="/logo.png" alt="Seismic Hub Logo" className="logo" />
    <h1>Seismic Hub</h1>
    <nav>
      <Link to="/block">Block</Link>
      <Link to="/survey">Survey</Link>
      <Link to="/acquisition">Acquisition</Link>
      <Link to="/acquisition-media">Acq Media</Link>
      <Link to="/processing">Processing</Link>
      <Link to="/processing-media">Proc Media</Link>
      <Link to="/interpretation">Interpretation</Link>
      <Link to="/interpretation-media">Interp Media</Link>
      <Link to="/report">Report</Link> 
    </nav>
  </div>
);

export default Sidebar;
