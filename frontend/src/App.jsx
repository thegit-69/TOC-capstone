import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CandidateTable from './components/CandidateTable';
import UploadView from './components/UploadView';

function App() {
  return (
    <Router>
      <div className="bg-background text-on-background font-body flex h-screen overflow-hidden antialiased selection:bg-primary-container selection:text-on-primary-container light">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-surface-bright">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<CandidateTable />} />
            <Route path="/upload" element={<UploadView />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
