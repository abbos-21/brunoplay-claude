import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';

interface BarChartProps {
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
}

export function BarChart({ title, data, xKey, yKey, color = '#3b82f6' }: BarChartProps) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  );
}
