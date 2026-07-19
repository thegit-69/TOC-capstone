import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CandidateTable from './components/CandidateTable';

function App() {
  return (
    <div className="bg-background text-on-background font-body flex h-screen overflow-hidden antialiased selection:bg-primary-container selection:text-on-primary-container light">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-surface-bright">
        <Header />
        <CandidateTable />
      </div>
    </div>
  );
}

export default App;
