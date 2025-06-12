import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import CustomLegend from "./CustomLegend";

const CustomPieChart = ({
  data,
  label,
  totalAmount,
  colors,
  showTextAnchor,
}) => {
  // Ensure totalAmount is handled correctly whether it includes $ or not
  const displayAmount = totalAmount.toString().startsWith('$') 
    ? totalAmount 
    : `$${totalAmount}`;

  console.log("CustomPieChart props:", { label, totalAmount, displayAmount, showTextAnchor });
  
  return (
    <ResponsiveContainer width="100%" height={380}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={(props) => <CustomTooltip {...props} />}/>
        <Legend content={(props) => <CustomLegend {...props} />}/>
        
        {/* Force text to always show, regardless of showTextAnchor */}
        <text 
          x="50%" 
          y="50%" 
          dy={-15} 
          textAnchor="middle"
          fill="#666" 
          fontSize="14px"
        >
          {label}
        </text>

        <text 
          x="50%" 
          y="50%" 
          dy={15}
          textAnchor="middle" 
          fill="#333" 
          fontSize="24px"
          fontWeight="600"
        >
          {displayAmount}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CustomPieChart;