import React, { useEffect, useState } from 'react';
import { fetchMarketInsights } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, ExternalLink, RefreshCw } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const MarketDashboard: React.FC = () => {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMarketInsights();
      setData(result);
    } catch (e) {
      setError("Failed to load market data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-slate-500">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
        <p className="animate-pulse">Analyzing Kenyan Market Trends...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-500">
        <p className="mb-4">{error}</p>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Kenyan E-Commerce Overview</h2>
          <button 
            onClick={loadData} 
            disabled={loading}
            className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Section */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h3 className="text-lg font-semibold mb-4 text-slate-700 text-center">Top Categories by Market Share</h3>
            {data?.chartData && data.chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" unit="%" />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Market Share %" radius={[0, 4, 4, 0]}>
                      {data.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                No visualization data available from search results.
              </div>
            )}
          </div>

          {/* Text Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">Insights Summary</h3>
            <div className="prose prose-sm text-slate-600 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <p className="whitespace-pre-line">{data?.text}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grounding Sources */}
      {data?.sources && data.sources.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.sources.map((source, idx) => (
               source.web && (
                <a 
                  key={idx} 
                  href={source.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-blue-600 hover:underline truncate"
                >
                  <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                  {source.web.title}
                </a>
               )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketDashboard;
