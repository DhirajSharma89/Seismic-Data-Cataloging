// InterpretationForm.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './InterpretationForm.css';

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
    survey_id: '', // This will be handled separately at the top of the left column
    multi_volume: '',
    multi_volume_details: '',
    TypeOfData: ''
  });

  const [surveyIds, setSurveyIds] = useState([]); // New state for survey IDs
  const [loadingSurveyIds, setLoadingSurveyIds] = useState(true); // Loading state for survey IDs
  const [surveyIdError, setSurveyIdError] = useState(null); // Error state for survey IDs

  const [message, setMessage] = useState('');

  // Fetch survey IDs when the component mounts
  useEffect(() => {
    const fetchSurveyIds = async () => {
      try {
        const response = await axios.get('http://localhost:8000/surveys/ids');
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
      await axios.post('http://localhost:8000/interpretation', formData);
      setMessage('Interpretation data submitted successfully!');
      // Optionally clear form after successful submission
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

  // Define fields for left and right columns
  // Filter out 'survey_id' as it's handled separately
  const otherFormKeys = Object.keys(formData).filter(key => key !== 'survey_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="interpretation-form-container">
      <h2>Interpretation Data Entry</h2>
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
                  type={key.includes('On') || key.includes('Year') ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
          </div>
          <div className="form-column"> {/* Right column */}
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
