import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const NewsAnalytics = ({ data }) => {
  const analytics = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        authorData: [],
        sourceData: []
      };
    }

    const authorStats = {};
    const sourceStats = {};

    data.forEach(article => {
      if (!article) return;

      // Author statistics
      const author = article.author || 'Unknown';
      authorStats[author] = (authorStats[author] || 0) + 1;

      // Source statistics
      const source = article.source?.name || 'Unknown';
      sourceStats[source] = (sourceStats[source] || 0) + 1;
    });

    // Convert to array format for charts
    const authorData = Object.entries(authorStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const sourceData = Object.entries(sourceStats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return { authorData, sourceData };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No data available for analysis
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Author Distribution */}
      <div className="w-full min-h-[300px]">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Top Authors
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart data={analytics.authorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={70}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source Distribution */}
      <div className="w-full min-h-[300px]">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Source Distribution
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={analytics.sourceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {analytics.sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NewsAnalytics;