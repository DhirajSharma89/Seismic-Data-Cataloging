// InterpretationMediaForm.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './InterpretationMediaForm.css';

const InterpretationMediaForm = () => {
  const [formData, setFormData] = useState({
    integ_media_id: '',
    survey_id: '', // This will be handled separately
    integ_id: '', // This will be handled separately
    BarCode: '',
    MediaType: '',
    ContentsOfMedia: '',
    DataFormat: '',
    Rack: '',
    Shelf: '',
    Box: '',
    Remarks: '',
    floor_location: '',
    status: '',
    dam_status: '',
    org_cart_number: '',
    archival_media_id: '',
    transcrp_tape_yn: '',
    transcrp_yr: '',
    transcribed_by_wc: '',
    date_cat: '',
    catalog_by: '',
    original_copy: ''
  });

  const [surveyIds, setSurveyIds] = useState([]); // State for Survey IDs
  const [loadingSurveyIds, setLoadingSurveyIds] = useState(true);
  const [surveyIdError, setSurveyIdError] = useState(null);

  const [interpretationIds, setInterpretationIds] = useState([]); // State for Interpretation IDs
  const [loadingInterpretationIds, setLoadingInterpretationIds] = useState(true);
  const [interpretationIdError, setInterpretationIdError] = useState(null);

  const [message, setMessage] = useState('');

  // Fetch Survey IDs when the component mounts
  useEffect(() => {
    const fetchSurveyIds = async () => {
      try {
        const response = await axios.get('https://seismic-data-cataloging-3.onrender.com/surveys/ids');
        setSurveyIds(response.data.survey_ids);
        setLoadingSurveyIds(false);
      } catch (error) {
        console.error("Error fetching Survey IDs:", error);
        setSurveyIdError("Failed to load Survey IDs. Please ensure the backend is running and survey data exists.");
        setLoadingSurveyIds(false);
      }
    };

    fetchSurveyIds();
  }, []);

  // Fetch Interpretation IDs when the component mounts
  useEffect(() => {
    const fetchInterpretationIds = async () => {
      try {
        const response = await axios.get('https://seismic-data-cataloging-3.onrender.com/interpretation/ids');
        setInterpretationIds(response.data.interpretation_ids);
        setLoadingInterpretationIds(false);
      } catch (error) {
        console.error("Error fetching Interpretation IDs:", error);
        setInterpretationIdError("Failed to load Interpretation IDs. Please ensure the backend is running and interpretation data exists.");
        setLoadingInterpretationIds(false);
      }
    };

    fetchInterpretationIds();
  }, []);


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
      await axios.post('https://seismic-data-cataloging-3.onrender.com/interpretation-media', formData);      setMessage('Interpretation media data submitted successfully!');
      // Optionally clear form after successful submission
      setFormData({
        integ_media_id: '',
        survey_id: '',
        integ_id: '',
        BarCode: '',
        MediaType: '',
        ContentsOfMedia: '',
        DataFormat: '',
        Rack: '',
        Shelf: '',
        Box: '',
        Remarks: '',
        floor_location: '',
        status: '',
        dam_status: '',
        org_cart_number: '',
        archival_media_id: '',
        transcrp_tape_yn: '',
        transcrp_yr: '',
        transcribed_by_wc: '',
        date_cat: '',
        catalog_by: '',
        original_copy: ''
      });
    } catch (error) {
      console.error("Error submitting interpretation media data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting interpretation media data: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Define fields for left and right columns
  // Filter out 'integ_media_id', 'survey_id', and 'integ_id' as they are handled explicitly
  const otherFormKeys = Object.keys(formData).filter(
    key => key !== 'integ_media_id' && key !== 'survey_id' && key !== 'integ_id'
  );
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="interpretation-media-form-container">
      <h2>Interpretation Media Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns"> {/* Container for the two columns */}
          <div className="form-column"> {/* Left column */}
            {/* Render Integ Media ID as a regular input */}
            <div className="form-group">
              <label>Integ Media ID</label>
              <input
                type="text"
                name="integ_media_id"
                value={formData.integ_media_id}
                onChange={handleChange}
                required
              />
            </div>

            {/* Render Survey ID as a dropdown */}
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

            {/* Render Integ ID as a dropdown */}
            <div className="form-group">
              <label>Integ ID</label>
              {loadingInterpretationIds ? (
                <p>Loading Interpretation IDs...</p>
              ) : interpretationIdError ? (
                <p className="error-message">{interpretationIdError}</p>
              ) : (
                <select
                  name="integ_id"
                  value={formData.integ_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an Interpretation ID</option>
                  {interpretationIds.map((id) => (
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
                  type={key.includes('date') || key.includes('year') ? 'date' : 'text'}
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
                  type={key.includes('date') || key.includes('year') ? 'date' : 'text'}
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

export default InterpretationMediaForm;
