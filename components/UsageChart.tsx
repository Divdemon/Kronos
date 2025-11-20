
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { UsageDataPoint } from '../types';

interface UsageChartProps {
  data: UsageDataPoint[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
        <p className="label text-slate-300">{`Time : ${label}`}</p>
        <p className="intro text-cyan-400">{`Unlocks : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700 h-[484px]">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Unlocks Over Time</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{paddingTop: '30px'}}/>
          <Line type="monotone" dataKey="unlocks" stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 8, fill: '#22d3ee', stroke: '#083344' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
