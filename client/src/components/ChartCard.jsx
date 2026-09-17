import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

export function PeakHoursChart({ data = [] }) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-700/60 h-80 flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="font-bold text-slate-100 text-sm">Peak Occupancy Hours</h3>
        <p className="text-xs text-slate-400">Live & historical vehicle traffic trends</p>
      </div>

      <div className="w-full h-60">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              itemStyle={{ color: '#60a5fa' }}
            />
            <Bar dataKey="vehicles" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueBreakdownChart({ data = [] }) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-700/60 h-80 flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="font-bold text-slate-100 text-sm">Revenue Share by Vehicle Type</h3>
        <p className="text-xs text-slate-400">Distribution across 4W, 2W, EV & Handicap</p>
      </div>

      <div className="w-full h-60 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={5}
              dataKey="amount"
              nameKey="type"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              formatter={(value) => `$${value}`}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
