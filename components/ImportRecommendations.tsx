import React, { useState, useEffect } from 'react';
import { fetchImportRecommendations, fetchLogisticsDetails } from '../services/geminiService';
import { AnalysisResult, RecommendationItem, LogisticsDetails } from '../types';
import { Loader2, Search, TrendingUp, DollarSign, Package, AlertCircle, MapPin, BookOpen, Ship, Plane, Calculator, X, ArrowRight } from 'lucide-react';

const ImportRecommendations: React.FC = () => {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  // Track the specific query used for the current results to display in headers
  const [currentSearchTerm, setCurrentSearchTerm] = useState(''); 

  // Logistics State
  const [logisticsData, setLogisticsData] = useState<Record<string, LogisticsDetails>>({});
  const [activeLogisticsId, setActiveLogisticsId] = useState<string | null>(null);
  const [loadingLogisticsId, setLoadingLogisticsId] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setCurrentSearchTerm(query);
    setActiveLogisticsId(null); // Close any open logistics modals
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

  const handleViewLogistics = async (item: RecommendationItem) => {
    if (logisticsData[item.id]) {
        setActiveLogisticsId(item.id);
        return;
    }

    setLoadingLogisticsId(item.id);
    try {
        const details = await fetchLogisticsDetails(item.productName, item.category, country);
        setLogisticsData(prev => ({...prev, [item.id]: details}));
        setActiveLogisticsId(item.id);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingLogisticsId(null);
    }
  };

  const closeLogistics = () => setActiveLogisticsId(null);

  // Initial load
  useEffect(() => {
    if (!hasSearched) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll when slide-over is open
  useEffect(() => {
    if (activeLogisticsId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeLogisticsId]);

  const activeItem = data?.recommendations?.find(r => r.id === activeLogisticsId);
  const activeLogistics = activeLogisticsId ? logisticsData[activeLogisticsId] : null;

  return (
    <div className="space-y-6 relative">
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
                  <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-slate-200 flex flex-col h-full group relative">
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
                      <button 
                        onClick={() => handleViewLogistics(item)}
                        disabled={loadingLogisticsId === item.id}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1 disabled:opacity-50"
                      >
                        {loadingLogisticsId === item.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Ship className="h-3 w-3" />
                        )}
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

      {/* Logistics Slide-over */}
      {activeLogisticsId && activeItem && activeLogistics && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Background overlay */}
            <div 
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
                onClick={closeLogistics}
            ></div>
            
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
              {/* Panel */}
              <div className="pointer-events-auto w-screen max-w-lg transform transition-transform sm:duration-500">
                <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                  {/* Header */}
                  <div className="bg-emerald-900 px-6 py-6 text-white sm:px-8 sticky top-0 z-20">
                    <div className="flex items-center justify-between">
                         <h2 className="text-xl font-bold leading-6 flex items-center gap-2">
                            <Ship className="h-6 w-6 text-emerald-400" />
                            Logistics Breakdown
                         </h2>
                         <button 
                            type="button" 
                            className="rounded-full p-1 text-emerald-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={closeLogistics}
                         >
                            <span className="sr-only">Close panel</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                         </button>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm text-emerald-100">
                             Comprehensive shipping analysis for <span className="font-semibold text-white border-b border-emerald-400/30 pb-0.5">{activeItem.productName}</span> to {country}.
                        </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="relative flex-1 px-6 py-8 sm:px-8 space-y-8 bg-slate-50">
                    
                    {/* Rates Grid */}
                    <div className="space-y-6">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Calculator className="h-5 w-5 text-emerald-600" />
                                Customs & Duties
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                    <span className="text-slate-600 text-sm">Import Duty</span>
                                    <span className="font-bold text-slate-900">{activeLogistics.customsDuty}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                    <span className="text-slate-600 text-sm">VAT</span>
                                    <span className="font-bold text-slate-900">{activeLogistics.vat}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Plane className="h-5 w-5 text-emerald-600" />
                                Freight Estimates
                            </h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                    <span className="text-slate-600 text-sm">Air Freight</span>
                                    <span className="font-bold text-slate-900">{activeLogistics.airFreightCost}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                    <span className="text-slate-600 text-sm">Sea Freight</span>
                                    <span className="font-bold text-slate-900">{activeLogistics.seaFreightCost}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cost Calculation */}
                    <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                        <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Landed Cost Estimate
                        </h4>
                        <div className="text-sm text-emerald-800 whitespace-pre-line leading-relaxed">
                            {activeLogistics.estimatedLandedCostText}
                        </div>
                    </div>

                    {/* Forwarders */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5 text-emerald-600" />
                            Recommended Forwarders
                        </h4>
                        <ul className="grid grid-cols-1 gap-3">
                            {activeLogistics.topForwarders.map((agent, idx) => (
                                <li key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors shadow-sm group cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                            {idx + 1}
                                        </div>
                                        <span className="font-medium text-slate-700">{agent}</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </li>
                            ))}
                            {activeLogistics.topForwarders.length === 0 && (
                                <li className="text-sm text-slate-500 italic p-4 bg-white rounded-xl border border-slate-200">No specific forwarders found for this route.</li>
                            )}
                        </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportRecommendations;