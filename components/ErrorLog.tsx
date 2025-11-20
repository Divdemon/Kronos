
import React, { useState, useMemo } from 'react';
import type { TelemetryError } from '../types';

interface ErrorLogProps {
  errors: TelemetryError[];
  onTrace: (error: TelemetryError) => void;
}

const ErrorLog: React.FC<ErrorLogProps> = ({ errors, onTrace }) => {
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [errorCodeFilter, setErrorCodeFilter] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const filteredErrors = useMemo(() => {
    return errors.filter(error => {
      // Filter by Platform
      if (platformFilter !== 'All' && error.metadata.platform !== platformFilter) {
        return false;
      }

      // Filter by Error Code
      if (errorCodeFilter && !error.errorCode.toString().includes(errorCodeFilter)) {
        return false;
      }

      // Filter by Time Range
      if (startTime || endTime) {
        const baseDate = new Date().toDateString();
        const errorDate = new Date(`${baseDate} ${error.timestamp}`);
        
        if (isNaN(errorDate.getTime())) return true; 

        if (startTime) {
            const startDate = new Date(`${baseDate} ${startTime}`);
            if (!isNaN(startDate.getTime()) && errorDate < startDate) return false;
        }

        if (endTime) {
            const endDate = new Date(`${baseDate} ${endTime}`);
            if (!isNaN(endDate.getTime()) && errorDate > endDate) return false;
        }
      }

      return true;
    });
  }, [errors, platformFilter, errorCodeFilter, startTime, endTime]);

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col h-[500px]">
      <div className="flex flex-col space-y-4 mb-4 flex-shrink-0">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-100">Recent Errors</h3>
            <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">{filteredErrors.length} errors</span>
        </div>
        
        {/* Filters Toolbar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Platform Filter */}
            <div className="flex flex-col space-y-1">
                <label className="text-xs text-slate-400 ml-1">Platform</label>
                <select
                    value={platformFilter}
                    onChange={(e) => setPlatformFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2"
                >
                    <option value="All">All</option>
                    <option value="iOS">iOS</option>
                    <option value="Android">Android</option>
                    <option value="Web">Web</option>
                </select>
            </div>

            {/* Error Code Filter */}
             <div className="flex flex-col space-y-1">
                <label className="text-xs text-slate-400 ml-1">Code</label>
                <input
                    type="text"
                    placeholder="e.g. 401"
                    value={errorCodeFilter}
                    onChange={(e) => setErrorCodeFilter(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 placeholder-slate-500"
                />
            </div>

            {/* Start Time */}
             <div className="flex flex-col space-y-1">
                <label className="text-xs text-slate-400 ml-1">Start Time</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 placeholder-slate-500"
                />
            </div>

             {/* End Time */}
             <div className="flex flex-col space-y-1">
                <label className="text-xs text-slate-400 ml-1">End Time</label>
                <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-slate-200 text-xs rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2 placeholder-slate-500"
                />
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {filteredErrors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">No matching errors found</p>
            </div>
        ) : (
            filteredErrors.map(error => (
            <div key={error.id} className="group relative flex items-start space-x-3 text-sm bg-slate-900/30 p-3 rounded-lg hover:bg-slate-700/50 border border-transparent hover:border-slate-600 transition-all duration-200">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <p className="text-red-300 font-semibold truncate pr-2">
                            {error.type} 
                        </p>
                        <span className="text-xs text-slate-500 whitespace-nowrap font-mono">{error.timestamp}</span>
                    </div>
                    
                    <p className="text-slate-300 mt-1 text-xs leading-relaxed break-words">{error.message}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                         <span className="bg-slate-800/80 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">
                             {error.errorCode}
                         </span>
                        <span className="bg-slate-800/80 text-cyan-400 border border-slate-700/50 px-1.5 py-0.5 rounded">
                            {error.metadata.platform}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="truncate max-w-[100px]" title={error.metadata.userId}>
                            {error.metadata.userId}
                        </span>
                    </div>
                </div>
                 <button 
                    onClick={() => onTrace(error)}
                    className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 text-[10px] px-2 py-1 rounded border border-cyan-700/50 transition-all flex items-center gap-1"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                     TRACE SIGNAL
                 </button>
            </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ErrorLog;
