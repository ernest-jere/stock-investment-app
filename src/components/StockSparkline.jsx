// src/components/StockSparkline.jsx
import React from 'react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

export default function StockSparkline({ data, isPositive }) {
  // If API data is still loading, show a neutral placeholder line
  const chartData = data && data.length > 0 
    ? data.map((price, index) => ({ id: index, price })) 
    : [{ price: 10 }, { price: 10 }];

  // Compute local trend color boundaries mapped straight to your Figma configurations
  const strokeColor = isPositive 
    ? 'var(--color-semantic-stock-up)' 
    : 'var(--color-semantic-stock-down)';

  return (
    <div className="w-20 h-10">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor} 
            strokeWidth={parseFloat('var(--color-semantic-chart-stroke-width)', 10) || 2} 
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
