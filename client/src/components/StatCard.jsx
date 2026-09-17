import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
    purple: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400'
  };

  return (
    <div className={`p-5 rounded-2xl border bg-gradient-to-br ${colorMap[color] || colorMap.blue} glass-card glass-card-hover`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-black text-slate-100">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 mt-2 font-medium">{subtitle}</p>
      )}
    </div>
  );
}
