import React, { useState } from 'react';
import axios from 'axios';

// Use environment variable for backend API base URL
import API_BASE_URL from "../config";

const LoginModal = ({ onLoginSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    id: '',
    password: '',
    userType: '',
  });

  const [message, setMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Reset form fields
  const resetForm = () => {
    setFormData({ name: '', id: '', password: '', userType: '' });
    setMessage('');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const { name, id, password, userType } = formData;

    // Basic validations
    if (!name.trim() || !id.trim() || !password.trim()) {
      setMessage('Please fill in all required fields.');
      return;
    }
    if (isSignUp && !userType.trim()) {
      setMessage('Please select a User Type.');
      return;
    }

    try {
      if (isSignUp) {
        // Signup request
        const response = await axios.post(`${API_BASE_URL}/users/signup`, {
          name,
          cpf_no: id,
          password,
          user_type: userType,
        });

        setMessage(response.data.message || 'Signup successful!');
        setIsSignUp(false); // Switch to login
        resetForm();
      } else {
        // Login request
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
          cpf_no: id,
          password,
        });

        setMessage(response.data.message || 'Login successful!');
        onLoginSuccess?.(
          response.data.user_type,
          response.data.name,
          response.data.id
        );
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setMessage(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          'An unexpected error occurred. Please try again.'
      );
    }
  };

  const handleQuery = () => {
    setMessage('Query functionality not implemented yet.');
    console.log('Query clicked:', formData);
  };

  return (
    <div className="modal-overlay">
      <div className="login-modal">
        <div className="modal-top-bar">
          <div className="modal-top-left-buttons">
            {!isSignUp ? (
              <button
                onClick={() => {
                  setIsSignUp(true);
                  resetForm();
                }}
                className="modal-toggle-button"
              >
                Sign Up
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsSignUp(false);
                  resetForm();
                }}
                className="modal-toggle-button"
              >
                Back to Login
              </button>
            )}
          </div>
          <h2 className="modal-title">
            {isSignUp ? 'Seismic Hub Sign Up' : 'Seismic Hub Login'}
          </h2>
        </div>

        <p className="modal-description">
          {isSignUp
            ? 'Create your account to access the application.'
            : 'Please enter your credentials to access the application.'}
        </p>

        <form onSubmit={handleFormSubmit}>
          {isSignUp && (
            <div className="input-row">
              <label htmlFor="userType">User Type:</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="modal-input"
                required
              >
                <option value="">Select User Type</option>
                <option value="admin">Admin</option>
                <option value="data_entry">Data Entry Operator</option>
                <option value="read_only_l1">Read Only User Level 1</option>
                <option value="read_only_l2">Read Only User Level 2</option>
                <option value="read_only_l3">
                  Read Only User Level 3 (GMS)
                </option>
              </select>
            </div>
          )}

          <div className="input-row">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="modal-input"
              placeholder="Your Name"
              required
            />
          </div>

          <div className="input-row">
            <label htmlFor="id">ID (CPF No.):</label>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="modal-input"
              placeholder="Your ID / CPF No."
              required
            />
          </div>

          <div className="input-row">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="modal-input"
              placeholder="Your Password"
              required
            />
          </div>

          {message && <p className="modal-message">{message}</p>}

          <div className="modal-buttons-bottom">
            <button type="submit" className="modal-button primary">
              {isSignUp ? 'Sign Up' : 'Login'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="modal-button secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleQuery}
              className="modal-button tertiary"
            >
              Query
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
