// src/components/PortfolioHistoryChart.jsx
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PortfolioHistoryChart({ historyData, currency }) {
  // Fallback structural mock trajectory timeline if history is fresh
  const chartData = historyData && historyData.length > 1
    ? historyData
    : [
        { date: '05 Nov', value: 8500 },
        { date: '06 Nov', value: 9200 },
        { date: '07 Nov', value: 8900 },
        { date: '08 Nov', value: 9400 },
        { date: '09 Nov', value: historyData[0]?.value || 10500 }
      ];

  const strokeColor = 'var(--color-semantic-stock-up)';

  return (
    <div className="w-full h-32 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            stroke="var(--color-semantic-text-body)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="var(--color-semantic-text-body)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `${currency} ${v}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--color-semantic-surface-primary)', 
              borderColor: 'var(--color-semantic-surface-primary)',
              borderRadius: '8px',
              color: 'var(--color-semantic-text-display)',
              fontSize: '12px'
            }} 
            formatter={(value) => [`${currency} ${parseFloat(value).toFixed(2)}`, 'Net Worth']}
          />
          <defs>
            <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2} 
            fillOpacity={1} 
            fill="url(#netWorthGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
