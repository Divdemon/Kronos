
import React from 'react';

interface HeaderProps {
  connectionStatus?: 'connected' | 'disconnected' | 'connecting';
}

const Header: React.FC<HeaderProps> = ({ connectionStatus = 'disconnected' }) => {
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <span className="text-green-400 font-semibold animate-pulse">● Live (Stream)</span>;
      case 'connecting':
        return <span className="text-cyan-400 font-semibold animate-pulse">● Connecting...</span>;
      default:
        return <span className="text-amber-400 font-semibold">● Live (Simulation)</span>;
    }
  };

  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-cyan-500/20 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a6 6 0 00-12 0v2" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Digital Key Telemetry</h1>
      </div>
      <div className="text-sm text-slate-400 flex items-center gap-2">
        Status: {getStatusBadge()}
      </div>
    </header>
  );
};

export default Header;
