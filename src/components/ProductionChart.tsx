import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData } from '../types';

interface ProductionChartProps {
  data: ChartData[];
}

export const ProductionChart: React.FC<ProductionChartProps> = ({ data }) => {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Production Overview</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="quantity" fill="#3B82F6" name="Quantity Produced" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};