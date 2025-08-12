import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Report = () => {
    // Dummy data for records
    const records = [
        { id: 1, date: '2023-01-15', surveyId: 'SURV001', blocksProcessed: 5, dataVolumeGB: 120 },
        { id: 2, date: '2023-02-20', surveyId: 'SURV002', blocksProcessed: 8, dataVolumeGB: 180 },
        { id: 3, date: '2023-03-10', surveyId: 'SURV003', blocksProcessed: 3, dataVolumeGB: 75 },
        { id: 4, date: '2023-04-05', surveyId: 'SURV004', blocksProcessed: 10, dataVolumeGB: 250 },
        { id: 5, date: '2023-05-12', surveyId: 'SURV005', blocksProcessed: 6, dataVolumeGB: 150 },
        { id: 6, date: '2023-06-18', surveyId: 'SURV006', blocksProcessed: 7, dataVolumeGB: 210 },
        { id: 7, date: '2023-07-25', surveyId: 'SURV007', blocksProcessed: 4, dataVolumeGB: 90 },
    ];

    // Dummy data for visualization (e.g., monthly data volume)
    const chartData = [
        { month: 'Jan', 'Data Volume (GB)': 120, 'Blocks Processed': 5 },
        { month: 'Feb', 'Data Volume (GB)': 180, 'Blocks Processed': 8 },
        { month: 'Mar', 'Data Volume (GB)': 75, 'Blocks Processed': 3 },
        { month: 'Apr', 'Data Volume (GB)': 250, 'Blocks Processed': 10 },
        { month: 'May', 'Data Volume (GB)': 150, 'Blocks Processed': 6 },
        { month: 'Jun', 'Data Volume (GB)': 210, 'Blocks Processed': 7 },
        { month: 'Jul', 'Data Volume (GB)': 90, 'Blocks Processed': 4 },
    ];

    return (
        <div className="report-container">
            <h2>Data Reports</h2>
            <p className="report-description">Comprehensive insights into your seismic data operations.</p>

            {/* Data Records Section */}
            <section className="report-section">
                <h3>Recent Data Records</h3>
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Survey ID</th>
                                <th>Blocks Processed</th>
                                <th>Data Volume (GB)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((record) => (
                                <tr key={record.id}>
                                    <td>{record.id}</td>
                                    <td>{record.date}</td>
                                    <td>{record.surveyId}</td>
                                    <td>{record.blocksProcessed}</td>
                                    <td>{record.dataVolumeGB}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Data Visualizations Section */}
            <section className="report-section">
                <h3>Data Volume Trends</h3>
                <div className="chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Data Volume (GB)" stroke="#007bff" activeDot={{ r: 8 }} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <h3 style={{ marginTop: '30px' }}>Blocks Processed per Month</h3>
                <div className="chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip contentStyle={{ borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} />
                            <Legend />
                            <Bar dataKey="Blocks Processed" fill="#28a745" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>
        </div>
    );
};

export default Report;
