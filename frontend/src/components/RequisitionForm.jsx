import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const RequisitionForm = ({ userId }) => { // Receive userId as prop
    const navigate = useNavigate();

    // State for form fields
    const [dateOfRequisition, setDateOfRequisition] = useState('');
    const [projectDistrict, setProjectDistrict] = useState('');
    const [sheet, setSheet] = useState('');
    const [remark, setRemark] = useState('');
    const [preparedBySignature, setPreparedBySignature] = useState('');
    const [preparedByDesignation, setPreparedByDesignation] = useState('');
    const [groupCoordinatorSignature, setGroupCoordinatorSignature] = useState('');
    const [groupCoordinatorDesignation, setGroupCoordinatorDesignation] = useState('');
    // formStatus is now managed by backend on creation, so no local state for it here for new forms

    // State for dynamic rows in "Type of data" section
    const [dataTypes, setDataTypes] = useState([
        { slNo: 1, typeOfData: '', slNoRequired: '', dataObserver: '', projectObjective: '', remarks: '' }
    ]);

    // State for dynamic rows in "SL No. of Data" section
    const [slNoData, setSlNoData] = useState([
        { slNo: 1, description: '', mobileNo: '', designation: '' }
    ]);

    // State for submission message
    const [submitMessage, setSubmitMessage] = useState({ text: '', type: '' }); // type can be 'success' or 'error'

    const handleDataTypeChange = (index, field, value) => {
        const newDataTypes = [...dataTypes];
        newDataTypes[index][field] = value;
        setDataTypes(newDataTypes);
    };

    const addDataTypeRow = () => {
        setDataTypes([...dataTypes, { slNo: dataTypes.length + 1, typeOfData: '', slNoRequired: '', dataObserver: '', projectObjective: '', remarks: '' }]);
    };

    const handleSlNoDataChange = (index, field, value) => {
        const newSlNoData = [...slNoData];
        newSlNoData[index][field] = value;
        setSlNoData(newSlNoData);
    };

    const addSlNoDataRow = () => {
        setSlNoData([...slNoData, { slNo: slNoData.length + 1, description: '', mobileNo: '', designation: '' }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage({ text: '', type: '' }); // Clear previous messages

        if (!userId) {
            setSubmitMessage({ text: 'User not logged in. Cannot submit form.', type: 'error' });
            return;
        }

        // Basic validation: ensure a subject exists for the list view
        const subject = `Requisition for ${projectDistrict || 'Unknown Project'} on ${dateOfRequisition || 'N/A'}`;

        const formData = {
            subject: subject, // Subject for the list view
            dateOfRequisition,
            projectDistrict,
            sheet,
            remark,
            dataTypes,
            slNoData,
            preparedBySignature,
            preparedByDesignation,
            groupCoordinatorSignature,
            groupCoordinatorDesignation,
        };

        try {
            const response = await axios.post('http://localhost:8000/requisitions', formData, {
                params: { requester_id: userId } // Pass requester_id as a query parameter
            });
            console.log('Form submitted successfully:', response.data);
            setSubmitMessage({ text: 'Requisition form submitted successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/requisition'); // Navigate back to the list page after a short delay
            }, 2000); // 2 seconds delay
        } catch (error) {
            console.error('Error submitting form:', error.response ? error.response.data : error.message);
            setSubmitMessage({ text: 'Failed to submit requisition form. Please check console for details.', type: 'error' });
            setTimeout(() => {
                setSubmitMessage({ text: '', type: '' }); // Clear error message after a delay
            }, 5000); // 5 seconds delay for error message
        }
    };

    return (
        <div className="requisition-container">
            <h2 className="requisition-title">डाटा रिक्वीजीशन प्रोफार्मा / Data Requisition Proforma</h2>
            <form onSubmit={handleSubmit} className="requisition-form">
                {/* Top Right Details Section */}
                <div className="form-section top-right-details">
                    <div className="form-group-inline">
                        <label>तिथि Date of Requisition:</label>
                        {/* Ensure value is always a string */}
                        <input type="date" value={dateOfRequisition || ''} onChange={(e) => setDateOfRequisition(e.target.value)} className="form-input-inline" />
                    </div>
                    <div className="form-group-inline">
                        <label>प्रोजेक्ट डिस्ट्रिक्ट Project District:</label>
                        {/* Ensure value is always a string */}
                        <input type="text" value={projectDistrict || ''} onChange={(e) => setProjectDistrict(e.target.value)} className="form-input-inline" />
                    </div>
                    <div className="form-group-inline">
                        <label>शीट Sheet:</label>
                        {/* Ensure value is always a string */}
                        <input type="text" value={sheet || ''} onChange={(e) => setSheet(e.target.value)} className="form-input-inline" />
                    </div>
                    <div className="form-group-inline">
                        <label>रिमार्क Remark:</label>
                        {/* Ensure value is always a string */}
                        <input type="text" value={remark || ''} onChange={(e) => setRemark(e.target.value)} className="form-input-inline" />
                    </div>
                </div>

                {/* Type of Data Table Section */}
                <div className="form-section data-type-table-section">
                    <h3>आवश्यक सूचना / Type of Data</h3>
                    <div className="table-wrapper">
                        <table className="requisition-table">
                            <thead>
                                <tr>
                                    <th className="small-col">SL No.</th>
                                    <th>Type of data</th>
                                    <th>SL No. as required e.g. Field Data / Pre-assigned gathers/3D gathers/Stacks</th>
                                    <th>Data/Observer/Mgr. & Geology Reports etc.</th>
                                    <th>Project Objective</th>
                                    <th>Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataTypes.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.slNo}</td>
                                        {/* Ensure values are always strings */}
                                        <td><input type="text" value={row.typeOfData || ''} onChange={(e) => handleDataTypeChange(index, 'typeOfData', e.target.value)} className="table-input" /></td>
                                        <td><input type="text" value={row.slNoRequired || ''} onChange={(e) => handleDataTypeChange(index, 'slNoRequired', e.target.value)} className="table-input" /></td>
                                        <td><input type="text" value={row.dataObserver || ''} onChange={(e) => handleDataTypeChange(index, 'dataObserver', e.target.value)} className="table-input" /></td>
                                        <td><input type="text" value={row.projectObjective || ''} onChange={(e) => handleDataTypeChange(index, 'projectObjective', e.target.value)} className="table-input" /></td>
                                        <td><input type="text" value={row.remarks || ''} onChange={(e) => handleDataTypeChange(index, 'remarks', e.target.value)} className="table-input" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" onClick={addDataTypeRow} className="add-row-button">Add Data Type Row</button>
                </div>

                {/* SL No. of Data Section */}
                <div className="form-section sl-no-data-section">
                    <h3>1 D स्लो न. / SL No. of Data</h3>
                    <div className="table-wrapper">
                        <table className="requisition-table">
                            <thead>
                                <tr>
                                    <th className="small-col">SL No.</th>
                                    <th>विवरण / Description</th>
                                    <th>मोबाईल न. / Mobile No.</th>
                                    <th>पदनाम / Designation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slNoData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.slNo}</td>
                                        {/* Ensure values are always strings */}
                                        <td><input type="text" value={row.description || ''} onChange={(e) => handleSlNoDataChange(index, 'description', e.target.value)} className="table-input" /></td>
                                        <td><input type="text" value={row.mobileNo || ''} onChange={(e) => handleSlNoDataChange(index, 'mobileNo', e.target.value)} className="table-input" /></td>
                                        <td><input type="text" value={row.designation || ''} onChange={(e) => handleSlNoDataChange(index, 'designation', e.target.value)} className="table-input" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" onClick={addSlNoDataRow} className="add-row-button">Add SL No. Data Row</button>
                </div>

                {/* Bottom Signatures Section */}
                <div className="form-section signatures-section-wrapper">
                    <div className="signature-column">
                        <div className="signature-group">
                            <label>हस्ताक्षर / Signature of user</label>
                            {/* Ensure value is always a string */}
                            <input type="text" value={preparedBySignature || ''} onChange={(e) => setPreparedBySignature(e.target.value)} className="form-input" />
                        </div>
                        <div className="signature-group">
                            <label>पदनाम / Designation</label>
                            {/* Ensure value is always a string */}
                            <input type="text" value={preparedByDesignation || ''} onChange={(e) => setPreparedByDesignation(e.target.value)} className="form-input" />
                        </div>
                    </div>
                    <div className="signature-column">
                        <div className="signature-group">
                            <label>समूह समन्वयक / Group Coordinator</label>
                            {/* Ensure value is always a string */}
                            <input type="text" value={groupCoordinatorSignature || ''} onChange={(e) => setGroupCoordinatorSignature(e.target.value)} className="form-input" />
                        </div>
                        <div className="signature-group">
                            <label>पदनाम / Designation</label>
                            {/* Ensure value is always a string */}
                            <input type="text" value={groupCoordinatorDesignation || ''} onChange={(e) => setGroupCoordinatorDesignation(e.target.value)} className="form-input" />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">Submit Requisition</button>
                </div>

                {/* Submission Message Display */}
                {submitMessage.text && (
                    <div className={`submission-message ${submitMessage.type}`}>
                        {submitMessage.text}
                    </div>
                )}
            </form>
        </div>
    );
};

export default RequisitionForm;
