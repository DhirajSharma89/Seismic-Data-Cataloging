import React, { useState } from 'react';
import axios from 'axios'; // Import axios

const LoginModal = ({ onLoginSuccess, onCancel }) => {
    const [name, setName] = useState('');
    const [id, setId] = useState(''); // This will be cpf_no
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [userType, setUserType] = useState(''); // Stores the selected user type for signup

    const handleFormSubmit = async (e) => { // Made async to await axios calls
        e.preventDefault(); // Prevent default form submission
        setMessage(''); // Clear previous messages

        // Name is now always present, so it's required for both login and signup
        if (name.trim() === '' || id.trim() === '' || password.trim() === '') {
            setMessage('Please fill in all fields (Name, ID, Password).');
            return;
        }

        if (isSignUp && userType.trim() === '') {
            setMessage('Please select a User Type.');
            return;
        }

        try {
            if (isSignUp) {
                // Send signup data to backend
                const response = await axios.post('http://localhost:8000/users/signup', {
                    name,
                    cpf_no: id, // Send 'id' as 'cpf_no' to backend
                    password,
                    user_type: userType
                });
                setMessage(response.data.message);
                setIsSignUp(false); // Switch to login form after successful signup
                // Clear fields after successful signup
                setName('');
                setId('');
                setPassword('');
                setUserType('');
            } else {
                // Send login data to backend
                const response = await axios.post('http://localhost:8000/users/login', {
                    cpf_no: id, // Send 'id' as 'cpf_no' to backend
                    password
                });
                setMessage(response.data.message);
                // On successful login, call the success callback
                onLoginSuccess(response.data.user_type, response.data.name, response.data.id);
            }
        } catch (error) {
            console.error("Authentication error:", error.response ? error.response.data : error.message);
            setMessage(error.response && error.response.data && error.response.data.detail
                ? error.response.data.detail
                : "An unexpected error occurred. Please try again.");
        }
    };

    const handleQuery = (e) => {
        e.preventDefault(); // Prevent default form submission
        setMessage('Query functionality not implemented for this demo.');
        console.log('Query button clicked with:', { name, id, password, userType: isSignUp ? userType : 'N/A' });
    };

    return (
        <div className="modal-overlay">
            <div className="login-modal">
                <div className="modal-top-bar">
                    <div className="modal-top-left-buttons">
                        {!isSignUp ? (
                            <button onClick={() => { setIsSignUp(true); setMessage(''); setName(''); setId(''); setPassword(''); setUserType(''); }} className="modal-toggle-button">Sign Up</button>
                        ) : (
                            <button onClick={() => { setIsSignUp(false); setMessage(''); setName(''); setId(''); setPassword(''); setUserType(''); }} className="modal-toggle-button">Back to Login</button>
                        )}
                    </div>
                    <h2 className="modal-title">{isSignUp ? 'Seismic Hub Sign Up' : 'Seismic Hub Login'}</h2>
                    <div className="modal-top-right-buttons">
                        {/* The query button is now part of the form's action buttons */}
                    </div>
                </div>

                <p className="modal-description">
                    {isSignUp ? 'Create your account to access the application.' : 'Please enter your credentials to access the application.'}
                </p>

                <form onSubmit={handleFormSubmit}> {/* Form handles submission for both login and signup */}
                    {isSignUp && (
                        <div className="input-row">
                            <label htmlFor="userType">User Type:</label>
                            <select
                                id="userType"
                                value={userType}
                                onChange={(e) => setUserType(e.target.value)}
                                className="modal-input"
                                required={isSignUp} // Required only for signup
                            >
                                <option value="">Select User Type</option>
                                <option value="admin">Admin</option>
                                <option value="data_entry">Data Entry Operator</option>
                                <option value="read_only_l1">Read Only User Level 1</option>
                                <option value="read_only_l2">Read Only User Level 2</option>
                                <option value="read_only_l3">Read Only User Level 3 (GMS)</option>
                            </select>
                        </div>
                    )}

                    {/* Name input is now always visible */}
                    <div className="input-row">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="modal-input"
                            placeholder="Your Name"
                            required // Name is always required now
                        />
                    </div>
                    <div className="input-row">
                        <label htmlFor="id">ID (CPF No.):</label>
                        <input
                            type="text"
                            id="id"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        <button type="button" onClick={onCancel} className="modal-button secondary">Cancel</button>
                        <button type="button" onClick={handleQuery} className="modal-button tertiary">Query</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
