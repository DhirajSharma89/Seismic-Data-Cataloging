// ProcessingMediaForm.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './ProcessingMediaForm.css';

const ProcessingMediaForm = () => {
  const [formData, setFormData] = useState({
    pro_serial_num: '',
    processing_id: '',
    processing_media_id: '',
    pre_post_identifier: '',
    cart_number: '',
    org_cart_number: '',
    line_name: '',
    file_seq_no: '',
    fcdp: '',
    lcdp: '',
    fsp: '',
    lsp: '',
    first_inline: '',
    last_inline: '',
    first_xline: '',
    last_xline: '',
    floor_location: '',
    box: '',
    rack: '',
    shelf: '',
    date_cat: '',
    data_type: '',
    data_format: '',
    catalog_by: '',
    media_type: '',
    original_copy: '',
    archival_media_id: '',
    remarks: '',
    qc_done_yes_no: '',
    qc_done_by: '',
    status: '',
    dam_status: '',
    transcrp_tape_yn: '',
    transcrp_yr: '',
    transcribed_by_wc: ''
  });

  const [processingIds, setProcessingIds] = useState([]); // New state for processing IDs
  const [loadingProcessingIds, setLoadingProcessingIds] = useState(true); // Loading state
  const [processingIdError, setProcessingIdError] = useState(null); // Error state

  const [message, setMessage] = useState('');

  // Fetch processing IDs when the component mounts
  useEffect(() => {
    const fetchProcessingIds = async () => {
      try {
        const response = await axios.get('http://localhost:8000/processing/ids');
        setProcessingIds(response.data.processing_ids);
        setLoadingProcessingIds(false);
      } catch (error) {
        console.error("Error fetching processing IDs:", error);
        setProcessingIdError("Failed to load Processing IDs. Please ensure the backend is running and processing data exists.");
        setLoadingProcessingIds(false);
      }
    };

    fetchProcessingIds();
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
      await axios.post('http://localhost:8000/processing-media', formData);
      setMessage('Processing media data submitted successfully!');
      // Optionally clear form after successful submission
      setFormData({
        pro_serial_num: '',
        processing_id: '',
        processing_media_id: '',
        pre_post_identifier: '',
        cart_number: '',
        org_cart_number: '',
        line_name: '',
        file_seq_no: '',
        fcdp: '',
        lcdp: '',
        fsp: '',
        lsp: '',
        first_inline: '',
        last_inline: '',
        first_xline: '',
        last_xline: '',
        floor_location: '',
        box: '',
        rack: '',
        shelf: '',
        date_cat: '',
        data_type: '',
        data_format: '',
        catalog_by: '',
        media_type: '',
        original_copy: '',
        archival_media_id: '',
        remarks: '',
        qc_done_yes_no: '',
        qc_done_by: '',
        status: '',
        dam_status: '',
        transcrp_tape_yn: '',
        transcrp_yr: '',
        transcribed_by_wc: ''
      });
    } catch (error) {
      console.error("Error submitting processing media data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting processing media data: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Define fields for left and right columns
  // Filter out 'pro_serial_num' and 'processing_id' as they are handled explicitly
  const otherFormKeys = Object.keys(formData).filter(key => key !== 'pro_serial_num' && key !== 'processing_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="processing-media-form-container">
      <h2>Processing Media Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns"> {/* Container for the two columns */}
          <div className="form-column"> {/* Left column */}
            {/* Render Pro Serial Num as a regular input */}
            <div className="form-group">
                <label>Pro Serial Num</label>
                <input
                    type="text"
                    name="pro_serial_num"
                    value={formData.pro_serial_num}
                    onChange={handleChange}
                    required
                />
            </div>
            {/* Render Processing ID as a dropdown */}
            <div className="form-group">
              <label>Processing ID</label>
              {loadingProcessingIds ? (
                <p>Loading Processing IDs...</p>
              ) : processingIdError ? (
                <p className="error-message">{processingIdError}</p>
              ) : (
                <select
                  name="processing_id"
                  value={formData.processing_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Processing ID</option>
                  {processingIds.map((id) => (
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
                  type={key.includes('date') ? 'date' : 'text'}
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

export default ProcessingMediaForm;
