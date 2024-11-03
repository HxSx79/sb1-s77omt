import React, { useCallback, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface LineGraphProps {
  title: string;
  data: Array<{ time: string; value: number | null }>;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number | null }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium text-gray-900">{`Time: ${label}`}</p>
        <p className="text-sm text-gray-600">
          {`Parts/Hour: ${value !== null ? value : 'No Data'}`}
        </p>
      </div>
    );
  }
  return null;
};

const ShiftLabels: React.FC = () => (
  <div className="flex justify-between px-12 -mt-2 text-sm text-gray-500">
    <div className="flex-1 text-center mr-4">Shift 1</div>
    <div className="w-24 text-center">Shift Change</div>
    <div className="flex-1 text-center ml-4">Shift 2</div>
  </div>
);

export const LineGraph: React.FC<LineGraphProps> = ({ title, data, color }) => {
  const timeRange = useCallback(() => {
    const times: string[] = [];
    for (let hour = 6; hour <= 23; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30:00`);
    }
    return times;
  }, []);

  const completeData = useMemo(() => 
    timeRange().map(time => {
      const [hours, minutes] = time.split(':');
      const timeValue = new Date(`1970-01-01T${time}`).getTime();
      
      const existingPoint = data.find(d => {
        const [dHours, dMinutes] = d.time.split(':');
        const dTime = new Date(`1970-01-01T${d.time}`).getTime();
        const timeDiff = Math.abs(timeValue - dTime);
        return timeDiff <= 15 * 60 * 1000;
      });

      return {
        time: `${hours}:${minutes}`,
        value: existingPoint ? existingPoint.value : null
      };
    }), 
    [timeRange, data]
  );

  const maxValue = Math.max(...data.filter(d => d.value !== null).map(d => d.value!), 150);
  const yAxisMax = Math.ceil(maxValue / 50) * 50;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <div className="flex-1 min-h-0">
        <div className="h-full" style={{ margin: '0 -20px' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={800}>
            <LineChart 
              data={completeData}
              margin={{ top: 20, right: 45, left: 45, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={45}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickMargin={10}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={[0, yAxisMax]}
                tickCount={6}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                stroke="#9ca3af"
                label={{ 
                  value: 'Parts/Hour', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: '#4b5563', fontSize: 12 },
                  offset: 0
                }}
              />
              <Tooltip content={CustomTooltip} />
              <Legend 
                verticalAlign="top"
                height={20}
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
              <ReferenceLine
                x="14:00"
                stroke="#9ca3af"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color}
                name="Parts/Hour"
                strokeWidth={2}
                dot={false}
                activeDot={false}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <ShiftLabels />
    </div>
  );
};