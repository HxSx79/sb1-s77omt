import React from 'react';
import { ProductionData } from '../types';

interface ProductionTableProps {
  data: ProductionData[];
}

export const ProductionTable: React.FC<ProductionTableProps> = ({ data }) => {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-3">Part Number</th>
            <th className="px-4 py-3">Part Name</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Shift</th>
            <th className="px-4 py-3">Operator</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-medium text-gray-900">
                {row.partNumber}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {row.partName}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {row.quantity}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {row.date}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {row.shift}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {row.operator}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};