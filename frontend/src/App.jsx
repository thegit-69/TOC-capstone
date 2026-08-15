import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CandidateTable from './components/CandidateTable';
import UploadView from './components/UploadView';
import JobsView from './components/JobsView';
import ScoringMetricsView from './components/ScoringMetricsView';
import LoginView from './components/LoginView';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('auth') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<LoginView onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="bg-background text-on-background font-body flex h-screen overflow-hidden antialiased selection:bg-primary-container selection:text-on-primary-container light">
        <Sidebar onLogout={handleLogout} />
        <div className="flex-1 flex flex-col min-w-0 bg-surface-bright">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<CandidateTable />} />
            <Route path="/upload" element={<UploadView />} />
            <Route path="/jobs" element={<JobsView />} />
            <Route path="/scoring" element={<ScoringMetricsView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
