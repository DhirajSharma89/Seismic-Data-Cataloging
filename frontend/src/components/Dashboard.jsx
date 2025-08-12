import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Card = ({ title, desc, link }) => (
  <div className="card">
    <h3>{title}</h3>
    <p>{desc}</p>
    <Link to={link}>Go to {title.split(" ")[0]}</Link>
  </div>
);

const StatBox = ({ value, label }) => (
  <div className="stat-box">
    <h3>{value}</h3>
    <p>{label}</p>
  </div>
);

const Dashboard = () => {
  const [blockCount, setBlockCount] = useState(0);
  const [surveyCount, setSurveyCount] = useState(0);
  const [dataVolume, setDataVolume] = useState('0 TB');
  const [processedDataCount, setProcessedDataCount] = useState(0);
  const [interpretationCount, setInterpretationCount] = useState(0);
  const [acquisitionCount, setAcquisitionCount] = useState(0);

  const aboutMessages = [
    "Seismic Data Hub helps manage exploration blocks with ease.",
    "Analyze your seismic surveys using structured workflows.",
    "Upload and organize seismic media for interpretation.",
    "Monitor activity across blocks, surveys, and processing in real-time."
  ];
  const [aboutIndex, setAboutIndex] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:8000/blocks/count')
      .then(res => setBlockCount(res.data.count))
      .catch(() => setBlockCount(0));

    axios.get('http://localhost:8000/surveys/count')
      .then(res => setSurveyCount(res.data.count))
      .catch(() => setSurveyCount(0));

    axios.get('http://localhost:8000/processing-media/count')
      .then(res => {
        const mediaCount = res.data.count;
        const volume = (mediaCount * 0.5).toFixed(1);
        setDataVolume(`${volume} TB`);
      })
      .catch(() => setDataVolume('0 TB'));

      axios.get('http://localhost:8000/processing/count')
      .then(res => setProcessedDataCount(res.data.count))
      .catch(error => {
        console.error("Error fetching processed data count:", error);
        setProcessedDataCount(0);
      });

    // NEW: Fetch Interpretation Data Count (assuming an endpoint like /interpretation/count)
    axios.get('http://localhost:8000/interpretation/count')
      .then(res => setInterpretationCount(res.data.count))
      .catch(error => {
        console.error("Error fetching interpretation count:", error);
        setInterpretationCount(0);
      });

    // NEW: Fetch Acquisition Data Count (for 'Survey Info' in stats, assuming /acquisition/count)
    // This is distinct from 'surveyCount' which might be for survey definitions.
    // Adjust the endpoint if 'Survey Info' in stats should refer to something else.
    axios.get('http://localhost:8000/acquisition/count')
      .then(res => setAcquisitionCount(res.data.count))
      .catch(error => {
        console.error("Error fetching acquisition count:", error);
        setAcquisitionCount(0);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAboutIndex(prev => (prev + 1) % aboutMessages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-content">
      <h1>Welcome to Seismic Data Hub</h1>
      <p>Your central platform for managing seismic survey data.</p>

      <div className="card-grid">
        <Card title="Block Management" desc="Manage block info" link="/block" />
        <Card title="Survey Info" desc="Submit seismic surveys" link="/survey" />
        <Card title="Processing Data" desc="Upload processing info" link="/processing" />
        <Card title="Interpretation Data" desc="Record interpretation results" link="/interpretation" />
        <Card title="Data Reports" desc="View visualizations and records of data" link="/report" />
        
      </div>

      <h2 style={{ marginTop: '50px' }}>Seismic Stats</h2>
      <div className="stats-grid">
        <StatBox value={blockCount} label="Total Blocks" />
        <StatBox value={surveyCount} label="Active Surveys" />
        <StatBox value={dataVolume} label="Data Volume" />
        <StatBox value={acquisitionCount} label="Acquisition Records" /> {/* Renamed from 'Survey Info' for clarity */}
        <StatBox value={processedDataCount} label="Processed Data Records" />
        <StatBox value={interpretationCount} label="Interpretation Records" />
      </div>

      <div className="dashboard-footer">
        <div className="about-container">
          <p key={aboutIndex} className="about-message">
            {aboutMessages[aboutIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
