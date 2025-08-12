import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

import BlockForm from './components/BlockForm';
import SurveyForm from './components/SurveyForm'; // Corrected path to be consistent
import AcquisitionForm from './components/AcquisitionForm';
import AcquisitionMediaForm from './components/AcquisitionMediaForm';
import ProcessingForm from './components/ProcessingForm';
import ProcessingMediaForm from './components/ProcessingMediaForm';
import InterpretationForm from './components/InterpretationForm';
import InterpretationMediaForm from './components/InterpretationMediaForm';
import Report from './components/Report';

import LoginModal from './components/LoginModal';
import RequisitionForm from './components/RequisitionForm';
import RequisitionListPage from './components/RequisitionListPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userId, setUserId] = useState(null); // NEW: State for userId

  const handleLoginSuccess = (role, name, id) => { // Receive id from LoginModal
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setUserRole(role);
    setUserName(name);
    setUserId(id); // Set userId
    console.log(`User ${name} (ID: ${id}) logged in with role: ${role}`);
  };

  const handleLoginCancel = () => {
    console.log("Login cancelled.");
    setShowLoginModal(false);
  };

  return (
    <Router>
      {showLoginModal && !isLoggedIn && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onCancel={handleLoginCancel} />
      )}

      <div className={`background-animated ${showLoginModal ? 'blurred-background' : ''}`}>
        {isLoggedIn || !showLoginModal ? (
          <>
            {/* Pass userRole and userId to Sidebar */}
            <Sidebar userRole={userRole} userId={userId} />
            <div className="main-content">
              <Routes>
                {/* Pass userRole and userId to Dashboard */}
                <Route path="/" element={<Dashboard userRole={userRole} userId={userId} />} />
                <Route path="/block" element={<BlockForm />} />
                <Route path="/survey" element={<SurveyForm />} />
                <Route path="/acquisition" element={<AcquisitionForm />} />
                <Route path="/acquisition-media" element={<AcquisitionMediaForm />} />
                <Route path="/processing" element={<ProcessingForm />} />
                <Route path="/processing-media" element={<ProcessingMediaForm />} />
                <Route path="/interpretation" element={<InterpretationForm />} />
                <Route path="/interpretation-media" element={<InterpretationMediaForm />} />
                <Route path="/report" element={<Report />} />
                {/* Pass userRole and userId to RequisitionListPage */}
                <Route path="/requisition" element={<RequisitionListPage userRole={userRole} userId={userId} />} />
                {/* Route for creating a new requisition form (no ID) */}
                <Route path="/requisition-form" element={<RequisitionForm userId={userId} userRole={userRole} />} />
                {/* NEW: Route for viewing/approving an existing requisition form (with ID) */}
                <Route path="/requisition-form/:id" element={<RequisitionForm userId={userId} userRole={userRole} />} />
                <Route path="*" element={isLoggedIn ? <Navigate to="/" replace /> : <Navigate to="/" replace />} />
              </Routes>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center h-screen text-gray-600">
            Please log in to access the application.
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
