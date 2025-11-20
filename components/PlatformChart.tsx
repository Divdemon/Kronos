
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PlatformData } from '../types';

interface PlatformChartProps {
  data: PlatformData[];
}

const COLORS = ['#22d3ee', '#6366f1', '#a855f7'];

const PlatformChart: React.FC<PlatformChartProps> = ({ data }) => {
  return (
    <div className="bg-slate-800 p-4 sm:p-6 rounded-xl border border-slate-700 h-[226px]">
      <h3 className="text-lg font-semibold text-slate-100 mb-2">Platform Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: '#334155',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlatformChart;
