import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Video } from '@/types';
import { formatNumber } from '@/lib/utils';

interface PerformanceChartProps {
  videos: Video[];
  className?: string;
}

export default function PerformanceChart({ videos, className }: PerformanceChartProps) {
  const chartData = videos
    .sort((a, b) => new Date(a.uploadTime).getTime() - new Date(b.uploadTime).getTime())
    .map((video, index) => ({
      index: index + 1,
      views: video.views,
      viewsPerHour: video.viewsPerHour,
      outlierFactor: video.outlierFactor,
      title: video.title.substring(0, 30) + '...',
    }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="index" 
            stroke="#666"
            fontSize={12}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={formatNumber}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number, name: string) => [
              name === 'views' ? formatNumber(value) : value.toFixed(1),
              name === 'views' ? 'Views' : name === 'viewsPerHour' ? 'Views/Hour' : 'Outlier Factor'
            ]}
            labelFormatter={(index: number) => `Video ${index}`}
          />
          <Line
            type="monotone"
            dataKey="views"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="outlierFactor"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}