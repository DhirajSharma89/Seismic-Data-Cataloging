import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config";  // ✅ import config
import './BlockForm.css';

const BlockForm = () => {
  const [formData, setFormData] = useState({
    block_id: '',
    block_name: '',
    basin_name: '',
    block_type: '',
    environment: '',
    off_type: '',
    block_status: '',
    area: '',
    effective_date: '',
    block_duration: '',
    relinquish_date: '',
    admin_basin: '',
    operator: '',
    current_phase: '',
    original_area: '',
    current_phase_area: '',
    file_name: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/blocks`, formData);
      setMessage('Block data submitted successfully!');
      setFormData({
        block_id: '',
        block_name: '',
        basin_name: '',
        block_type: '',
        environment: '',
        off_type: '',
        block_status: '',
        area: '',
        effective_date: '',
        block_duration: '',
        relinquish_date: '',
        admin_basin: '',
        operator: '',
        current_phase: '',
        original_area: '',
        current_phase_area: '',
        file_name: ''
      });
    } catch (err) {
      console.error("Error submitting block data:", err);
      setMessage('Error submitting block data');
    }
  };

  const allFormKeys = Object.keys(formData);
  const midPoint = Math.ceil(allFormKeys.length / 2);

  return (
    <div className="block-form-container">
      <h2>Block Data Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns">
          <div className="form-column">
            {allFormKeys.slice(0, midPoint).map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>
          <div className="form-column">
            {allFormKeys.slice(midPoint).map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
      {message && <p className="form-message">{message}</p>}
    </div>
  );
};

export default BlockForm;
