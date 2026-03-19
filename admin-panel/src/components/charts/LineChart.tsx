import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/Card';

interface LineChartProps {
  title: string;
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
}

export function LineChart({ title, data, xKey, yKey, color = '#3b82f6' }: LineChartProps) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </Card>
  );
}
