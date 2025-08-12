import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const RequisitionListPage = ({ userRole, userId }) => {
    const [requisitions, setRequisitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRequisition, setSelectedRequisition] = useState(null); // For modal view
    const [showModal, setShowModal] = useState(false);
    const [comments, setComments] = useState(''); // Unified comments state for L2/L3
    const [message, setMessage] = useState(''); // For approval/decline messages
    const navigate = useNavigate(); // Initialize navigate

    const fetchRequisitions = async () => {
        try {
            setLoading(true);
            // Pass userRole and userId as query parameters to the backend
            const response = await axios.get('http://localhost:8000/requisitions', {
                params: { user_role: userRole, user_id: userId }
            });
            setRequisitions(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching requisitions:", err);
            setError("Failed to load requisitions. Please ensure the backend is running and you are logged in.");
            setRequisitions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch requisitions only if userRole and userId are available (i.e., user is logged in)
        if (userRole && userId) {
            fetchRequisitions();
            // Set up polling to refresh requisitions every 10 seconds
            const intervalId = setInterval(fetchRequisitions, 10000);
            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [userRole, userId]); // Re-run effect if userRole or userId changes

    const handleViewDetails = (requisition) => {
        setSelectedRequisition(requisition);
        // Pre-fill comments based on current approval level
        if (requisition.current_approval_status === 'Pending_L2_Approval') {
            setComments(requisition.l2_comments || '');
        } else if (requisition.current_approval_status === 'L2_Approved') {
            setComments(requisition.l3_comments || '');
        } else {
            setComments('');
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedRequisition(null);
        setComments(''); // Clear comments when closing modal
        setMessage(''); // Clear message when closing modal
    };

    const handleApprovalAction = async (requisitionId, level, action) => {
        setMessage(''); // Clear previous messages
        try {
            let endpoint = '';
            let payload = {
                approver_id: userId, // Use the logged-in userId as the approver
                comments: comments
            };

            if (level === 2) {
                endpoint = `http://localhost:8000/requisitions/${requisitionId}/${action}_l2`; // approve_l2 or decline_l2
            } else if (level === 3) {
                endpoint = `http://localhost:8000/requisitions/${requisitionId}/${action}_l3`; // approve_l3 or decline_l3
            } else {
                setMessage('Invalid approval level specified.');
                return;
            }

            // Pass user_role and user_id as query parameters for authorization on backend
            const response = await axios.patch(endpoint, payload, {
                params: { user_role: userRole, user_id: userId }
            });
            setMessage(response.data.message || `Requisition ${requisitionId} ${action}d by L${level}.`);
            fetchRequisitions(); // Refresh list to reflect status change
            // Keep modal open to show the message, or close after a delay
            // setTimeout(() => closeModal(), 2000); // Close after 2 seconds
        } catch (err) {
            console.error(`Error ${action}ing L${level} approval:`, err.response ? err.response.data : err.message);
            setMessage(`Error ${action}ing L${level} approval: ` + (err.response?.data?.detail || err.message));
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Draft': return 'status-draft';
            case 'Pending_L2_Approval': return 'status-pending-l2-approval';
            case 'L2_Approved': return 'status-l2-approved';
            case 'L2_Declined': return 'status-l2-declined';
            case 'L3_Approved': return 'status-l3-approved';
            case 'L3_Declined': return 'status-l3-declined';
            default: return '';
        }
    };

    // Determine if the current user can approve/decline L2 or L3
    // 'admin' role can approve/decline at any level
    const canApproveL2 = userRole === 'read_only_l2' || userRole === 'admin';
    const canApproveL3 = userRole === 'read_only_l3' || userRole === 'admin';

    // No need for client-side filtering here, as the backend's get_all_requisitions
    // already filters based on user_role and user_id.
    // We just display what the backend sends.
    const displayedRequisitions = requisitions;

    return (
        <div className="requisition-list-container">
            <div className="list-header">
                <h2 className="list-title">Requisition Forms</h2>
                {/* Only allow data_entry or admin to create new requisitions */}
                {(userRole === 'data_entry' || userRole === 'admin') && (
                    <button onClick={() => navigate('/requisition-form')} className="create-new-button">
                        Create New Requisition
                    </button>
                )}
            </div>

            {loading && <p className="notification">Loading requisitions...</p>}
            {error && <p className="notification error">{error}</p>}

            {!loading && !error && displayedRequisitions.length === 0 && (
                <p className="notification">No requisitions found for your role.</p>
            )}

            <div className="requisition-list">
                {displayedRequisitions.map((req) => (
                    <div key={req.id} className="list-item" onClick={() => handleViewDetails(req)}>
                        <div className="item-details">
                            <span className="item-subject">{req.subject}</span>
                            <span className="item-id">ID: {req.id} | Requester: {req.requester_user_id || 'N/A'}</span>
                        </div>
                        <div className="item-meta">
                            <span className="item-date">{req.dateOfRequisition}</span>
                            <span className={`item-status ${getStatusClass(req.current_approval_status)}`}>
                                {req.current_approval_status.replace(/_/g, ' ')}
                            </span>
                            {/* Show L2 approval buttons if user can approve L2 and status is Pending_L2_Approval */}
                            {canApproveL2 && (req.current_approval_status === 'Pending_L2_Approval') && (
                                <div className="approval-actions">
                                    <button
                                        className="approve-button"
                                        onClick={(e) => { e.stopPropagation(); handleApprovalAction(req.id, 2, 'approve'); }}
                                    >
                                        Approve L2
                                    </button>
                                    <button
                                        className="decline-button"
                                        onClick={(e) => { e.stopPropagation(); handleApprovalAction(req.id, 2, 'decline'); }}
                                    >
                                        Decline L2
                                    </button>
                                </div>
                            )}
                            {/* Show L3 approval buttons if user can approve L3 and status is L2_Approved */}
                            {canApproveL3 && (req.current_approval_status === 'L2_Approved') && (
                                <div className="approval-actions">
                                    <button
                                        className="approve-button"
                                        onClick={(e) => { e.stopPropagation(); handleApprovalAction(req.id, 3, 'approve'); }}
                                    >
                                        Approve L3
                                    </button>
                                    <button
                                        className="decline-button"
                                        onClick={(e) => { e.stopPropagation(); handleApprovalAction(req.id, 3, 'decline'); }}
                                    >
                                        Decline L3
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Requisition Details Modal */}
            {showModal && selectedRequisition && (
                <div className="modal-overlay">
                    <div className="requisition-detail-modal">
                        <h3>Requisition Details (ID: {selectedRequisition.id})</h3>
                        <p><strong>Subject:</strong> {selectedRequisition.subject}</p>
                        <p><strong>Date of Requisition:</strong> {selectedRequisition.dateOfRequisition || 'N/A'}</p>
                        <p><strong>Project District:</strong> {selectedRequisition.projectDistrict || 'N/A'}</p>
                        <p><strong>Sheet:</strong> {selectedRequisition.sheet || 'N/A'}</p>
                        <p><strong>Remark:</strong> {selectedRequisition.remark || 'N/A'}</p>
                        <p><strong>Requester User ID:</strong> {selectedRequisition.requester_user_id || 'N/A'}</p>
                        <p><strong>Current Status:</strong> <span className={`item-status ${getStatusClass(selectedRequisition.current_approval_status)}`}>
                                {selectedRequisition.current_approval_status.replace(/_/g, ' ')}
                            </span></p>

                        <h4>Type of Data:</h4>
                        {selectedRequisition.dataTypes && selectedRequisition.dataTypes.length > 0 ? (
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>SL No.</th>
                                            <th>Type of data</th>
                                            <th>SL No. as required</th>
                                            <th>Data/Observer/Mgr. & Geology Reports etc.</th>
                                            <th>Project Objective</th>
                                            <th>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRequisition.dataTypes.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.slNo}</td>
                                                <td>{item.typeOfData}</td>
                                                <td>{item.slNoRequired}</td>
                                                <td>{item.dataObserver}</td>
                                                <td>{item.projectObjective}</td>
                                                <td>{item.remarks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p>No data types specified.</p>}

                        <h4>SL No. of Data:</h4>
                        {selectedRequisition.slNoData && selectedRequisition.slNoData.length > 0 ? (
                            <div className="table-responsive">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>SL No.</th>
                                            <th>Description</th>
                                            <th>Mobile No.</th>
                                            <th>Designation</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedRequisition.slNoData.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.slNo}</td>
                                                <td>{item.description}</td>
                                                <td>{item.mobileNo}</td>
                                                <td>{item.designation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : <p>No SL No. data specified.</p>}

                        <p><strong>Prepared By:</strong> {selectedRequisition.preparedBySignature || 'N/A'} ({selectedRequisition.preparedByDesignation || 'N/A'})</p>
                        <p><strong>Group Coordinator:</strong> {selectedRequisition.groupCoordinatorSignature || 'N/A'} ({selectedRequisition.groupCoordinatorDesignation || 'N/A'})</p>

                        {/* L2 Approval Info & Action Section */}
                        {(selectedRequisition.l2_approver_id || selectedRequisition.current_approval_status === 'Pending_L2_Approval' || canApproveL2) && (
                            <div className="l2-approval-section">
                                <h4>L2 Approval</h4>
                                {selectedRequisition.l2_approver_id && (
                                    <div className="l2-approval-info">
                                        <p><strong>L2 Approver:</strong> {selectedRequisition.l2_approver_id}</p>
                                        <p><strong>L2 Approval Date:</strong> {selectedRequisition.l2_approval_date || 'N/A'}</p>
                                        <p><strong>L2 Comments:</strong> {selectedRequisition.l2_comments || 'N/A'}</p>
                                    </div>
                                )}
                                {canApproveL2 && selectedRequisition.current_approval_status === 'Pending_L2_Approval' && (
                                    <div className="form-group">
                                        <label>Comments for L2:</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                        ></textarea>
                                        <div className="modal-actions">
                                            <button onClick={(e) => { e.stopPropagation(); handleApprovalAction(selectedRequisition.id, 2, 'approve'); }} className="approve-button">Approve L2</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleApprovalAction(selectedRequisition.id, 2, 'decline'); }} className="decline-button">Decline L2</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* L3 Approval Info & Action Section */}
                        {(selectedRequisition.l3_approver_id || selectedRequisition.current_approval_status === 'L2_Approved' || canApproveL3) && (
                            <div className="l3-approval-section">
                                <h4>L3 Approval (GMS)</h4>
                                {selectedRequisition.l3_approver_id && (
                                    <div className="l3-approval-info">
                                        <p><strong>L3 Approver:</strong> {selectedRequisition.l3_approver_id}</p>
                                        <p><strong>L3 Approval Date:</strong> {selectedRequisition.l3_approval_date || 'N/A'}</p>
                                        <p><strong>L3 Comments:</strong> {selectedRequisition.l3_comments || 'N/A'}</p>
                                    </div>
                                )}
                                {canApproveL3 && selectedRequisition.current_approval_status === 'L2_Approved' && (
                                    <div className="form-group">
                                        <label>Comments for L3:</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={comments}
                                            onChange={(e) => setComments(e.target.value)}
                                        ></textarea>
                                        <div className="modal-actions">
                                            <button onClick={(e) => { e.stopPropagation(); handleApprovalAction(selectedRequisition.id, 3, 'approve'); }} className="approve-button">Approve L3</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleApprovalAction(selectedRequisition.id, 3, 'decline'); }} className="decline-button">Decline L3</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                        {message && <p className={`notification ${message.includes('Error') ? 'error' : 'success'}`}>{message}</p>}

                        <div className="modal-buttons-bottom">
                            <button onClick={closeModal} className="modal-button secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequisitionListPage;
