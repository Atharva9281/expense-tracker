import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";

const CustomBarChart = ({ data }) => {
    
    // Function to alternate colors
    const getBarColor = (index) => {
        return index % 2 === 0 ? "#875cf5" : "#cfbefb";
    };

    // Custom label component to show source/category name on top of bars
    const CustomLabel = (props) => {
        const { x, y, width, value, payload } = props;
        
        // Safety check - make sure payload exists
        if (!payload) return null;
        
        const labelText = payload.source || payload.category || '';
        
        // Don't render if no label text
        if (!labelText) return null;
        
        return (
            <text 
                x={x + width / 2} 
                y={y - 5} 
                fill="#666" 
                textAnchor="middle" 
                fontSize="11"
                fontWeight="500"
            >
                {labelText}
            </text>
        );
    };
    
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            
            return (
                <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
                    <p className="text-xs font-semibold text-purple-800 mb-1">
                        {item.source || item.category || item.month || item.period || item.label}
                    </p>
                    <p className="text-sm text-gray-600">
                        Amount: <span className="text-sm font-medium text-gray-900">
                            ${item.amount}
                        </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {item.date || item.month}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Handle empty data
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded">
                <p className="text-gray-500">No data to display</p>
            </div>
        );
    }
      
    return (
        <div className="bg-white mt-6">
            <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data} margin={{ top: 30, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid stroke="none" />
                    <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: "#555" }} 
                        stroke='none'
                        angle={data.length > 8 ? -45 : 0}
                        textAnchor={data.length > 8 ? 'end' : 'middle'}
                        height={data.length > 8 ? 80 : 60}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                        dataKey="amount" 
                        fill="#FF8042"
                        radius={[10, 10, 0, 0]}
                        activeDot={{ r: 8, fill: "yellow" }} 
                        activeStyle={{ fill: "green" }}
                    >
                        {data.map((entry, index) => (
                            <Cell key={index} fill={getBarColor(index)} />
                        ))}
                        <LabelList content={<CustomLabel />} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
  
export default CustomBarChart;