// ProcessingForm.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './ProcessingForm.css';

const ProcessingForm = () => {
  const [formData, setFormData] = useState({
    survey_id: '',
    processing_id: '',
    version: '',
    data_processed_by: '',
    processing_year: '',
    processing_centre_name: '',
    received_from: '',
    date_of_receiving: '',
    processing_software: '',
    bin_size: '',
    sampling_interval: '',
    fold: '',
    record_length: '',
    multi_volume: '',
    multi_volume_details: '',
    reprocessing_done: '',
    proc_issued: '',
    proc_issue_date: '',
    proc_issue_details: '',
    processing_type: '',
    file_name: '',
    file_size: '',
    file_type: '',
    file_content: '',
    remarks: ''
  });

  const [surveyIds, setSurveyIds] = useState([]); // New state for survey IDs
  const [loadingSurveyIds, setLoadingSurveyIds] = useState(true); // Loading state for survey IDs
  const [surveyIdError, setSurveyIdError] = useState(null); // Error state for survey IDs

  const [message, setMessage] = useState('');

  // Fetch survey IDs when the component mounts
  useEffect(() => {
    const fetchSurveyIds = async () => {
      try {
        const response = await axios.get('https://seismic-data-cataloging-3.onrender.com/surveys/ids');
        setSurveyIds(response.data.survey_ids);
        setLoadingSurveyIds(false);
      } catch (error) {
        console.error("Error fetching survey IDs:", error);
        setSurveyIdError("Failed to load Survey IDs. Please ensure the backend is running and survey data exists.");
        setLoadingSurveyIds(false);
      }
    };

    fetchSurveyIds();
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
      await axios.post('https://seismic-data-cataloging-3.onrender.com/processing', formData);      setMessage('Processing data submitted successfully!');
      // Optionally clear form after successful submission
      setFormData({
        survey_id: '',
        processing_id: '',
        version: '',
        data_processed_by: '',
        processing_year: '',
        processing_centre_name: '',
        received_from: '',
        date_of_receiving: '',
        processing_software: '',
        bin_size: '',
        sampling_interval: '',
        fold: '',
        record_length: '',
        multi_volume: '',
        multi_volume_details: '',
        reprocessing_done: '',
        proc_issued: '',
        proc_issue_date: '',
        proc_issue_details: '',
        processing_type: '',
        file_name: '',
        file_size: '',
        file_type: '',
        file_content: '',
        remarks: ''
      });
    } catch (error) {
      console.error("Error submitting processing data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting processing data: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Define fields for left and right columns
  // Filter out 'survey_id' as it's handled separately
  const otherFormKeys = Object.keys(formData).filter(key => key !== 'survey_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="processing-form-container">
      <h2>Processing Data Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns"> {/* Container for the two columns */}
          <div className="form-column"> {/* Left column */}
            {/* Render Survey ID as a dropdown in the first column */}
            <div className="form-group">
              <label>Survey ID</label>
              {loadingSurveyIds ? (
                <p>Loading Survey IDs...</p>
              ) : surveyIdError ? (
                <p className="error-message">{surveyIdError}</p>
              ) : (
                <select
                  name="survey_id"
                  value={formData.survey_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Survey ID</option>
                  {surveyIds.map((id) => (
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
                  type={key.includes('date') ? 'date' : key === 'file_content' ? 'file' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required={key !== 'file_content'}
                />
              </div>
            ))}
          </div>
          <div className="form-column"> {/* Right column */}
            {rightColumnFields.map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : key === 'file_content' ? 'file' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required={key !== 'file_content'}
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

export default ProcessingForm;
