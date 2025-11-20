
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, change }) => {
  const isPositive = change >= 0;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg transition-transform duration-300 hover:scale-105 hover:border-cyan-500">
      <div className="flex justify-between items-start">
        <div className="flex flex-col space-y-1">
          <h2 className="text-sm font-medium text-slate-400">{title}</h2>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
        </div>
        <div className="text-cyan-400 bg-cyan-500/10 p-2 rounded-lg">
            {icon}
        </div>
      </div>
       <div className={`mt-4 flex items-center space-x-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
        )}
        <span>{change.toFixed(2)}% vs last period</span>
      </div>
    </div>
  );
};

export default MetricCard;
