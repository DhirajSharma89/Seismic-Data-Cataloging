import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from "../config";  // ✅ import config
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

  const [acquisitionIds, setAcquisitionIds] = useState([]);
  const [loadingAcquisitionIds, setLoadingAcquisitionIds] = useState(true);
  const [acquisitionIdError, setAcquisitionIdError] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch acquisition IDs
  useEffect(() => {
    const fetchAcquisitionIds = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/acquisition/ids`);
        setAcquisitionIds(response.data.acquisition_ids);
      } catch (error) {
        console.error("Error fetching acquisition IDs:", error);
        setAcquisitionIdError("Failed to load Acquisition IDs.");
      } finally {
        setLoadingAcquisitionIds(false);
      }
    };

    fetchAcquisitionIds();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await axios.post(`${API_BASE_URL}/acquisition-media`, formData);
      setMessage('Acquisition Media data submitted successfully!');
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
      console.error("Error submitting acquisition media data:", error);
      setMessage('Error submitting acquisition media data');
    }
  };

  const otherFormKeys = Object.keys(formData).filter(key => key !== 'acquisition_id');
  const midPoint = Math.ceil(otherFormKeys.length / 2);

  return (
    <div className="acquisition-media-form-container">
      <h2>Acquisition Media Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-columns">
          <div className="form-column">
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

            {otherFormKeys.slice(0, midPoint).map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                />
              </div>
            ))}
          </div>

          <div className="form-column">
            {otherFormKeys.slice(midPoint).map((key) => (
              <div key={key} className="form-group">
                <label>{key.replace(/_/g, ' ')}</label>
                <input
                  type={key.includes('date') ? 'date' : 'text'}
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
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
