import React, { useState } from 'react';
import { fetchImportRecommendations } from '../services/geminiService';
import { AnalysisResult } from '../types';
import { Loader2, Search, TrendingUp, DollarSign, Package, AlertCircle, MapPin, BookOpen } from 'lucide-react';

const ImportRecommendations: React.FC = () => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // Track the specific query used for the current results to display in headers
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); 

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setCurrentSearchTerm(query);
    try {
      // If query is empty, it fetches general top items for the specified country
      const result = await fetchImportRecommendations(query || undefined, country);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  React.useEffect(() => {
    if (!hasSearched) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4">Find Profitable Imports</h2>
          <p className="text-emerald-100 mb-6">
            Discover high-demand products to import from China to {country}. 
            {query ? " Deep-dive analysis mode active." : " AI analyzes current market gaps, shipping feasibility, and profit margins."}
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., Solar accessories, Baby products..."
                className="w-full px-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 pl-11"
              />
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>
            
            <div className="relative md:w-1/3">
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Target Country"
                className="w-full px-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 pl-11"
              />
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze'}
            </button>
          </form>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-emerald-800 opacity-20 transform skew-x-12 translate-x-12"></div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-3" />
          <p className="animate-pulse font-medium">
            {query 
              ? `Performing deep-dive market analysis for "${query}" in ${country}...` 
              : `Scanning Chinese markets & ${country} demand trends...`}
          </p>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-8">
          {/* Strategy Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
              {currentSearchTerm ? (
                <>
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  Deep Dive Analysis: {currentSearchTerm}
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Strategic Overview for {country}
                </>
              )}
            </h3>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">
              {data.text}
            </p>
          </div>

          {/* Recommendations Grid */}
          {data.recommendations && data.recommendations.length > 0 ? (
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-4 px-1">
                {currentSearchTerm ? "Recommended Products & SKUs" : "Top 6 High-Margin Opportunities"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.recommendations.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200 flex flex-col h-full group">
                    <div className="p-5 flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-block px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                          {item.category}
                        </span>
                        {item.demandLevel === 'High' && (
                          <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                            <TrendingUp className="h-3 w-3 mr-1" /> High Demand
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">
                        {item.productName}
                      </h3>
                      
                      <div className="flex items-center text-slate-600 mb-4 text-sm bg-slate-50 p-2 rounded-lg">
                        <DollarSign className="h-4 w-4 mr-1 text-emerald-600" />
                        <span className="font-medium">Est. Margin:</span>
                        <span className="ml-1 text-emerald-700 font-bold">{item.estimatedMargin}</span>
                      </div>
                      
                      <p className="text-slate-500 text-sm leading-relaxed mb-4">
                        {item.reasoning}
                      </p>
                    </div>
                    
                    <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between rounded-b-xl">
                      <div className="flex items-center text-xs text-slate-500">
                        <Package className="h-3 w-3 mr-1" />
                        <span>Source: China</span>
                      </div>
                      <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">
                        View Logistics
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800">No structured product data found</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  The analysis provided text insights but couldn't generate specific product cards. Please read the Strategic Overview above for details.
                </p>
              </div>
            </div>
          )}

          {/* Sources Footer */}
          {data.sources && data.sources.length > 0 && (
            <div className="text-xs text-slate-400 mt-8 border-t border-slate-200 pt-4">
              <p className="mb-2 font-semibold">Data Sources:</p>
              <ul className="space-y-1">
                {data.sources.slice(0, 3).map((s, i) => (
                  s.web && <li key={i} className="truncate">{s.web.title} - <a href={s.web.uri} className="hover:underline" target="_blank" rel="noreferrer">{s.web.uri}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportRecommendations;
