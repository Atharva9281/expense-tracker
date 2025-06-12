// import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
  } from "recharts";
  
  const CustomLineChart = ({ data }) => {
    const CustomTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
            <p className="text-xs font-semibold text-purple-800 mb-1">
              {payload[0]?.payload?.month}
            </p>
            <p className="text-sm text-gray-600">
              Amount: <span className="text-sm font-medium text-gray-900">
                ${payload[0]?.value}
              </span>
            </p>
            {payload[0]?.payload?.categories && (
              <p className="text-xs text-gray-500 mt-1">
                Categories: {payload[0].payload.categories}
              </p>
            )}
          </div>
        );
      }
      return null;
    };
  
    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded">
          <p className="text-gray-500">No expense data to display</p>
        </div>
      );
    }
  
    return (
      <div className="bg-white">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#875cf5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#875cf5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="none" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#555' }} 
              stroke="none"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#555' }}
              stroke="none"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#875cf5"
              fillOpacity={1}
              fill="url(#expenseGradient)"
              strokeWidth={3}
              dot={{ r: 3, fill: "#ab8df8" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  export default CustomLineChart;