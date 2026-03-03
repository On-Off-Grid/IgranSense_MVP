import { LineChart, Line, ResponsiveContainer } from 'recharts';

const TYPE_COLORS = {
  soil_moisture: '#3b82f6', // blue
  temperature: '#f59e0b',  // amber
  humidity: '#06b6d4',     // cyan
};

/**
 * SensorSparkline – tiny inline chart (50×20px logical) for sensor cards.
 *
 * @param {{ data: number[], type: string }} props
 */
export default function SensorSparkline({ data, type }) {
  if (!data || data.length < 2) return null;

  const chartData = data.map((v, i) => ({ i, v }));
  const color = TYPE_COLORS[type] || '#94a3b8';

  return (
    <div data-testid="sensor-sparkline" className="w-full h-[20px]">
      <ResponsiveContainer width="100%" height={20}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
