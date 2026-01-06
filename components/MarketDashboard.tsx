import React, { useEffect, useState } from 'react';
import { fetchMarketInsights } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';
import { ExternalLink, RefreshCw, TrendingUp, PieChart, Info, Globe, FileText } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
          {payload[0].value}% Market Share
        </p>
      </div>
    );
  }
  return null;
};

// Skeleton Loader Component
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-48 bg-slate-100 rounded-lg"></div>
      </div>
      <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 bg-white rounded-2xl h-[400px] border border-slate-200 p-6">
        <div className="flex justify-between mb-8">
            <div className="h-6 w-40 bg-slate-200 rounded"></div>
        </div>
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4 items-center">
                    <div className="w-24 h-4 bg-slate-100 rounded"></div>
                    <div className="flex-1 h-8 bg-slate-100 rounded-r-lg"></div>
                </div>
            ))}
        </div>
      </div>
      <div className="lg:col-span-5 bg-white rounded-2xl h-[400px] border border-slate-200 p-6">
        <div className="h-6 w-40 bg-slate-200 rounded mb-6"></div>
        <div className="space-y-3">
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-4/6 bg-slate-100 rounded"></div>
            <div className="h-4 w-full bg-slate-100 rounded"></div>
            <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

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
      setError("Failed to load market data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full">
            <Info className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Unable to load data</h3>
        <p className="text-slate-500 max-w-md">{error}</p>
        <button 
          onClick={loadData}
          className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm hover:shadow"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Market Overview</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Real-time analysis of Kenyan e-commerce trends
          </p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-emerald-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart Section */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PieChart className="h-32 w-32 text-emerald-600" />
            </div>

            <div className="relative z-10 mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    Market Share Distribution
                </h3>
                <p className="text-sm text-slate-500 ml-11 mt-1">Top performing categories by sales volume</p>
            </div>

            <div className="flex-grow min-h-[300px] w-full relative z-10">
                {data?.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }} barSize={36}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={120} 
                            tick={{fontSize: 12, fill: '#64748b', fontWeight: 500}} 
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                        <Bar 
                            dataKey="value" 
                            radius={[0, 8, 8, 0]} 
                            background={{ fill: '#f8fafc', radius: [0, 8, 8, 0] }}
                            animationDuration={1500}
                        >
                            {data.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        No visualization data available.
                    </div>
                )}
            </div>
        </div>

        {/* Executive Summary Section */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-8 -mt-8 z-0"></div>
            
            <div className="relative z-10 mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <FileText className="h-5 w-5" />
                    </div>
                    Executive Summary
                </h3>
                <p className="text-sm text-slate-500 ml-11 mt-1">AI-synthesized market intelligence</p>
            </div>

            <div className="flex-grow relative z-10 overflow-y-auto custom-scrollbar pr-2 max-h-[500px]">
                <div className="prose prose-sm prose-slate max-w-none 
                    prose-headings:text-slate-800 prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-6
                    prose-p:text-slate-600 prose-p:leading-relaxed prose-p:mb-4
                    prose-li:text-slate-600 prose-li:marker:text-emerald-500
                    prose-strong:text-slate-800 prose-strong:font-semibold
                ">
                    <div className="whitespace-pre-line">{data?.text}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Sources Section */}
      {data?.sources && data.sources.length > 0 && (
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Info className="h-3 w-3" />
            Verified Sources
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.sources.map((source, idx) => (
               source.web && (
                <a 
                  key={idx} 
                  href={source.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:shadow transition-all duration-200 max-w-[200px] truncate"
                  title={source.web.title}
                >
                  <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0 opacity-50" />
                  <span className="truncate">{source.web.title}</span>
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