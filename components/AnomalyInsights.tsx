
import React, { useState } from 'react';
import { analyzeTelemetry } from '../services/geminiService';
import type { Metrics, TelemetryError } from '../types';

interface AnomalyInsightsProps {
  metrics: Metrics;
  errors: TelemetryError[];
}

const AnomalyInsights: React.FC<AnomalyInsightsProps> = ({ metrics, errors }) => {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setInsights('');
    try {
      const result = await analyzeTelemetry(metrics, errors);
      setInsights(result);
    } catch (error) {
      setInsights('Failed to get insights. Please check the console.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 h-[226px] flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-slate-100">AI Anomaly Insights</h3>
      </div>
      <div className="flex-grow overflow-y-auto text-sm text-slate-300 pr-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          </div>
        ) : insights ? (
          <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: insights.replace(/\n/g, '<br />') }} />
        ) : (
          <p className="text-slate-400">Click "Analyze" to get AI-powered insights on the current telemetry data.</p>
        )}
      </div>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="mt-2 w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
      >
        {loading ? (
           <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Analyzing...
           </>
        ) : (
          'Analyze for Anomalies'
        )}
      </button>
    </div>
  );
};

export default AnomalyInsights;
