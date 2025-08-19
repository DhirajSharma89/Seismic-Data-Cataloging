import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InterpretationForm.css';

const API_BASE = "https://seismic-data-cataloging-3.onrender.com";

const InterpretationForm = () => {
  const [formData, setFormData] = useState({
    myindex: '',
    version: '',
    projTitle: '',
    sbasin: '',
    blockName: '',
    blockType: '',
    mygroup: '',
    objective: '',
    inputDataType: '',
    appSwUsed: '',
    interpretationYear: '',
    interpreter: '',
    mediaDetails: '',
    backupDetails: '',
    file: '',
    lkm: '',
    sqm: '',
    submittedOn: '',
    submittedBy: '',
    receivedOn: '',
    receivedBy: '',
    survey_id: '',
    multi_volume: '',
    multi_volume_details: '',
    TypeOfData: ''
  });

  const [surveyIds, setSurveyIds] = useState([]);
  const [loadingSurveyIds, setLoadingSurveyIds] = useState(true);
  const [surveyIdError, setSurveyIdError] = useState(null);

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSurveyIds = async () => {
      try {
        const response = await axios.get(`${API_BASE}/surveys/ids`);
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
      await axios.post(`${API_BASE}/interpretation`, formData);
      setMessage('Interpretation data submitted successfully!');
      setFormData({
        myindex: '',
        version: '',
        projTitle: '',
        sbasin: '',
        blockName: '',
        blockType: '',
        mygroup: '',
        objective: '',
        inputDataType: '',
        appSwUsed: '',
        interpretationYear: '',
        interpreter: '',
        mediaDetails: '',
        backupDetails: '',
        file: '',
        lkm: '',
        sqm: '',
        submittedOn: '',
        submittedBy: '',
        receivedOn: '',
        receivedBy: '',
        survey_id: '',
        multi_volume: '',
        multi_volume_details: '',
        TypeOfData: ''
      });
    } catch (error) {
      console.error("Error submitting interpretation data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting interpretation data: ' + (error.response?.data?.detail || error.message));
    }
  };

  const otherFormKeys = Object.keys(formData).filter(key => key !== 'survey_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="interpretation-form-container">
      <h2>Interpretation Data Entry</h2>
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
                  type={key.includes('On') || key.includes('Year') ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>
          <div className="form-column">
            {rightColumnFields.map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('On') || key.includes('Year') ? 'date' : 'text'}
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

export default InterpretationForm;
