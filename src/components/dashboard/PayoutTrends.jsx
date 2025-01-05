import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const PayoutTrends = ({ data = [], payoutRates = { news: 0, blog: 0 } }) => {
  const chartColors = {
    articles: '#3f51b5',
    payout: '#4caf50'
  };

  const trendData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const dailyStats = data.reduce((acc, article) => {
      if (!article || !article.publishedAt) return acc;

      const date = new Date(article.publishedAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, articles: 0, payout: 0 };
      }
      acc[date].articles += 1;
      acc[date].payout += article.type === 'blog' ? payoutRates.blog : payoutRates.news;
      return acc;
    }, {});

    return Object.values(dailyStats).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );
  }, [data, payoutRates]);

  const totalArticles = useMemo(() => {
    return trendData.reduce((sum, day) => sum + day.articles, 0);
  }, [trendData]);

  const totalPayout = useMemo(() => {
    return trendData.reduce((sum, day) => sum + day.payout, 0);
  }, [trendData]);

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Payout Trends</h2>
        </div>
        <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Payout Trends</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Total Articles: {totalArticles}
          </p>
          <p className="text-sm text-gray-600">
            Total Payout: ${totalPayout.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis yAxisId="left" className="text-xs" />
            <YAxis yAxisId="right" orientation="right" className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '0.375rem'
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="articles"
              stroke={chartColors.articles}
              name="Articles"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="payout"
              stroke={chartColors.payout}
              name="Payout ($)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PayoutTrends;