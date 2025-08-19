// SurveyForm.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './SurveyForm.css';

const SurveyForm = () => {
  const [formData, setFormData] = useState({
    block_id: '',
    survey_id: '',
    survey_lib_no: '',
    survey_name: '',
    survey_environ: '',
    survey_area: '',
    survey_area_km: '',
    sig_no: '',
    company: '',
    type_of_data: '',
    year_of_acquisition: '',
    survey_type: '',
    multi_block: '',
    multi_block_details: '',
    remarks: ''
  });

  const [blockIds, setBlockIds] = useState([]); // New state for block IDs
  const [loadingBlockIds, setLoadingBlockIds] = useState(true); // Loading state for block IDs
  const [blockIdError, setBlockIdError] = useState(null); // Error state for block IDs

  const [message, setMessage] = useState('');

  // Fetch block IDs when the component mounts
  useEffect(() => {
    const fetchBlockIds = async () => {
      try {
        const response = await axios.get('https://seismic-data-cataloging-3.onrender.com/blocks/ids');
        setBlockIds(response.data.block_ids);
        setLoadingBlockIds(false);
      } catch (error) {
        console.error("Error fetching block IDs:", error);
        setBlockIdError("Failed to load Block IDs. Please ensure the backend is running and block data exists.");
        setLoadingBlockIds(false);
      }
    };

    fetchBlockIds();
  }, []); // Empty dependency array means this runs once on mount

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    try {
      await axios.post('https://seismic-data-cataloging-3.onrender.com/surveys', formData);      setMessage('Survey data submitted successfully!');
      // Optionally clear form after successful submission
      setFormData({
        block_id: '',
        survey_id: '',
        survey_lib_no: '',
        survey_name: '',
        survey_environ: '',
        survey_area: '',
        survey_area_km: '',
        sig_no: '',
        company: '',
        type_of_data: '',
        year_of_acquisition: '',
        survey_type: '',
        multi_block: '',
        multi_block_details: '',
        remarks: ''
      });
    } catch (error) {
      console.error("Error submitting survey data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting survey data: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Define fields for left and right columns
  // Filter out 'block_id' as it's handled separately
  const otherFormKeys = Object.keys(formData).filter(key => key !== 'block_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="survey-form-container">
      <h2>Survey Data Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns"> {/* Container for the two columns */}
          <div className="form-column"> {/* Left column */}
            {/* Render Block ID as a dropdown in the first column */}
            <div className="form-group">
              <label>Block ID</label>
              {loadingBlockIds ? (
                <p>Loading Block IDs...</p>
              ) : blockIdError ? (
                <p className="error-message">{blockIdError}</p>
              ) : (
                <select
                  name="block_id"
                  value={formData.block_id}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  <option value="">Select a Block ID</option>
                  {blockIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))}
                </select>
              )}
            </div>
            {/* Render remaining left column fields */}
            {leftColumnFields.map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') || key.includes('year') ? 'text' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            ))}
          </div>
          <div className="form-column"> {/* Right column */}
            {rightColumnFields.map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') || key.includes('year') ? 'text' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                  className="form-input"
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

export default SurveyForm;
