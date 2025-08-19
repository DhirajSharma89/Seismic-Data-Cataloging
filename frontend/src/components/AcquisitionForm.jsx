import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AcquisitionForm.css';
import API_BASE_URL from "../config";   // <-- import config

const AcquisitionForm = () => {
  const [formData, setFormData] = useState({
    survey_id: '',
    acquisition_id: '',
    data_acq_by: '',
    record_length: '',
    samp_rate: '',
    no_of_channel: '',
    type_of_shooting: '',
    source_type: '',
    shot_interval: '',
    shot_line_interval: '',
    group_interval: '',
    data_received_from: '',
    date_of_received: '',
    receival_interval: '',
    receiver_line_interval: '',
    floor_location: '',
    acq_bin_size: '',
    acq_issued: '',
    acq_issue_date: '',
    acq_issue_details: '',
    file_name: '',
    file_size: '',
    file_type: '',
    file_content: '',
    remarks: '',
    copex_status: ''
  });

  const [surveyIds, setSurveyIds] = useState([]);
  const [loadingSurveyIds, setLoadingSurveyIds] = useState(true);
  const [surveyIdError, setSurveyIdError] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch survey IDs
  useEffect(() => {
    const fetchSurveyIds = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/surveys/ids`);
        setSurveyIds(response.data.survey_ids);
        setLoadingSurveyIds(false);
      } catch (error) {
        console.error("Error fetching survey IDs:", error);
        setSurveyIdError("Failed to load Survey IDs. Please ensure the backend is running and survey data exists.");
        setLoadingSurveyIds(false);
      }
    };

    fetchSurveyIds();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/acquisition`, formData);
      setMessage('Acquisition data submitted successfully!');
      setFormData({
        survey_id: '',
        acquisition_id: '',
        data_acq_by: '',
        record_length: '',
        samp_rate: '',
        no_of_channel: '',
        type_of_shooting: '',
        source_type: '',
        shot_interval: '',
        shot_line_interval: '',
        group_interval: '',
        data_received_from: '',
        date_of_received: '',
        receival_interval: '',
        receiver_line_interval: '',
        floor_location: '',
        acq_bin_size: '',
        acq_issued: '',
        acq_issue_date: '',
        acq_issue_details: '',
        file_name: '',
        file_size: '',
        file_type: '',
        file_content: '',
        remarks: '',
        copex_status: ''
      });
    } catch (error) {
      console.error("Error submitting acquisition data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting acquisition data: ' + (error.response?.data?.detail || error.message));
    }
  };

  const otherFormKeys = Object.keys(formData).filter(key => key !== 'survey_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);
  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="acquisition-form-container">
      <h2>Acquisition Data Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns">
          <div className="form-column">
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
                  className="form-input"
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
            {leftColumnFields.map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : key === 'file_content' ? 'file' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required={key !== 'file_content'}
                  className="form-input"
                />
              </div>
            ))}
          </div>
          <div className="form-column">
            {rightColumnFields.map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : key === 'file_content' ? 'file' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required={key !== 'file_content'}
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

export default AcquisitionForm;
