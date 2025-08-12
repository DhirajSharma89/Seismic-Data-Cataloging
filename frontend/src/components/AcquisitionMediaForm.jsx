// AcquisitionMediaForm.jsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import './AcquisitionMediaForm.css';

const AcquisitionMediaForm = () => {
  const [formData, setFormData] = useState({
    acq_serial_num: '',
    acquisition_id: '',
    acquisition_media_id: '',
    cart_number: '',
    line_name: '',
    org_cart_number: '',
    fsp: '',
    lsp: '',
    ff: '',
    lf: '',
    rack: '',
    box: '',
    shelf: '',
    date_cat: '',
    media_type: '',
    data_type: '',
    data_format: '',
    original_copy: '',
    archival_media_id: '',
    catalog_by: '',
    remarks: '',
    qc_done_yes_no: '',
    qc_done_by: '',
    status: '',
    dam_status: '',
    transcrp_tape_yn: '',
    transcrp_yr: '',
    transcribed_by_wc: '',
    copex_status: ''
  });

  const [acquisitionIds, setAcquisitionIds] = useState([]); // New state for acquisition IDs
  const [loadingAcquisitionIds, setLoadingAcquisitionIds] = useState(true); // Loading state
  const [acquisitionIdError, setAcquisitionIdError] = useState(null); // Error state

  const [message, setMessage] = useState('');

  // Fetch acquisition IDs when the component mounts
  useEffect(() => {
    const fetchAcquisitionIds = async () => {
      try {
        const response = await axios.get('http://localhost:8000/acquisition/ids');
        setAcquisitionIds(response.data.acquisition_ids);
        setLoadingAcquisitionIds(false);
      } catch (error) {
        console.error("Error fetching acquisition IDs:", error);
        setAcquisitionIdError("Failed to load Acquisition IDs. Please ensure the backend is running and acquisition data exists.");
        setLoadingAcquisitionIds(false);
      }
    };

    fetchAcquisitionIds();
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
      await axios.post('http://localhost:8000/acquisition-media', formData);
      setMessage('Acquisition Media data submitted successfully!');
      // Optionally clear form after successful submission
      setFormData({
        acq_serial_num: '',
        acquisition_id: '',
        acquisition_media_id: '',
        cart_number: '',
        line_name: '',
        org_cart_number: '',
        fsp: '',
        lsp: '',
        ff: '',
        lf: '',
        rack: '',
        box: '',
        shelf: '',
        date_cat: '',
        media_type: '',
        data_type: '',
        data_format: '',
        original_copy: '',
        archival_media_id: '',
        catalog_by: '',
        remarks: '',
        qc_done_yes_no: '',
        qc_done_by: '',
        status: '',
        dam_status: '',
        transcrp_tape_yn: '',
        transcrp_yr: '',
        transcribed_by_wc: '',
        copex_status: ''
      });
    } catch (error) {
      console.error("Error submitting acquisition media data:", error.response ? error.response.data : error.message);
      setMessage('Error submitting acquisition media data: ' + (error.response?.data?.detail || error.message));
    }
  };

  // Define fields for left and right columns
  // Filter out 'acquisition_id' as it's handled separately
  const otherFormKeys = Object.keys(formData).filter(key => key !== 'acquisition_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  const leftColumnFields = otherFormKeys.slice(0, midPoint);
  const rightColumnFields = otherFormKeys.slice(midPoint);

  return (
    <div className="acquisition-media-form-container">
      <h2>Acquisition Media Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns"> {/* Container for the two columns */}
          <div className="form-column"> {/* Left column */}
            {/* Render Acq Serial Num as a regular input */}
            <div className="form-group">
                <label>Acq Serial Num</label>
                <input
                    type="text"
                    name="acq_serial_num"
                    value={formData.acq_serial_num}
                    onChange={handleChange}
                    required
                />
            </div>
            {/* Render Acquisition ID as a dropdown in the first column */}
            <div className="form-group">
              <label>Acquisition ID</label>
              {loadingAcquisitionIds ? (
                <p>Loading Acquisition IDs...</p>
              ) : acquisitionIdError ? (
                <p className="error-message">{acquisitionIdError}</p>
              ) : (
                <select
                  name="acquisition_id"
                  value={formData.acquisition_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an Acquisition ID</option>
                  {acquisitionIds.map((id) => (
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
                  required={key !== 'file_content'} // you may want to handle file separately
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
                  required={key !== 'file_content'} // you may want to handle file separately
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

export default AcquisitionMediaForm;
