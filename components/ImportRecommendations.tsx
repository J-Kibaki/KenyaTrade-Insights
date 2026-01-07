import React, { useState, useEffect } from 'react';
import { fetchImportRecommendations, fetchLogisticsDetails } from '../services/geminiService';
import { AnalysisResult, RecommendationItem, LogisticsDetails } from '../types';
import { Loader2, Search, TrendingUp, DollarSign, Package, AlertCircle, MapPin, BookOpen, Ship, Plane, Calculator, X, ArrowRight, BarChart3, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, TooltipProps } from 'recharts';

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

  // Prepare chart data if estimates exist
  const freightChartData = activeLogistics && (activeLogistics.airFreightEstimate || 0) > 0 && (activeLogistics.seaFreightEstimate || 0) > 0 
    ? [
        { name: 'Air (50kg)', cost: activeLogistics.airFreightEstimate || 0 },
        { name: 'Sea (0.5 CBM)', cost: activeLogistics.seaFreightEstimate || 0 },
      ]
    : [];
    
  // Custom tooltip for the freight chart
  const FreightTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-2 rounded text-xs shadow-lg">
          <p className="font-semibold">{label}</p>
          <p>Est: ${payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-emerald-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Ship className="h-48 w-48 text-emerald-400" />
        </div>
        
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
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Analyze"}
            </button>
          </form>
        </div>
      </div>

      {loading && !data && (
        <div className="text-center py-20">
            <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-500">Scanning global markets & logistics data...</p>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                 <Package className="h-5 w-5 text-emerald-600" />
                 Recommended Products
               </h3>
               {currentSearchTerm && <span className="text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-600">Filter: {currentSearchTerm}</span>}
            </div>
            
            <div className="space-y-4">
              {data.recommendations?.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">{item.category}</span>
                        {item.demandLevel === 'High' && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> High Demand
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 mb-2">{item.productName}</h4>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.reasoning}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-3 py-1 rounded-lg">
                          <DollarSign className="h-4 w-4" />
                          Margin: {item.estimatedMargin}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewLogistics(item)}
                      disabled={loadingLogisticsId === item.id}
                      className="shrink-0 p-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-600 hover:border-emerald-200 transition-all group-hover:shadow-sm"
                    >
                      {loadingLogisticsId === item.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowRight className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Panel */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Strategic Overview
                </h3>
                <div className="prose prose-sm prose-slate max-w-none prose-p:text-slate-600">
                    <div className="whitespace-pre-line">{data.text}</div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Logistics Slide-over */}
      {activeLogisticsId && activeItem && (
        <>
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 transition-opacity" onClick={closeLogistics} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col animate-in slide-in-from-right">
             <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{activeItem.productName}</h3>
                  <p className="text-sm text-slate-500 mt-1">Import Logistics Breakdown</p>
                </div>
                <button onClick={closeLogistics} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
             </div>
             
             <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {activeLogistics ? (
                  <>
                     {/* Comparison Chart */}
                     {freightChartData.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                           <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-emerald-600" />
                                Est. Shipping Cost (USD)
                              </h4>
                              <div className="group relative">
                                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                                <div className="absolute right-0 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 top-full mt-1">
                                  Comparison based on ~50kg vs ~0.5 CBM.
                                </div>
                              </div>
                           </div>
                           
                           {/* Fixed height container for Recharts */}
                           <div className="h-48 w-full"> 
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  layout="vertical" 
                                  data={freightChartData} 
                                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                                  barSize={24}
                                >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                  <XAxis type="number" hide />
                                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12, fill: '#64748b'}} interval={0} />
                                  <Tooltip content={<FreightTooltip />} cursor={{fill: '#f1f5f9'}} />
                                  <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                                    {freightChartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#059669'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                           </div>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                           <div className="flex items-center gap-2 text-blue-700 mb-2 font-semibold text-sm">
                              <Plane className="h-4 w-4" /> Air Freight
                           </div>
                           <p className="text-slate-700 font-medium">{activeLogistics.airFreightCost}</p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                           <div className="flex items-center gap-2 text-emerald-700 mb-2 font-semibold text-sm">
                              <Ship className="h-4 w-4" /> Sea Freight
                           </div>
                           <p className="text-slate-700 font-medium">{activeLogistics.seaFreightCost}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <AlertCircle className="h-4 w-4 text-slate-400" />
                          Customs & Taxes
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-slate-600 text-sm">Import Duty</span>
                              <span className="font-mono font-medium text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">{activeLogistics.customsDuty}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-600 text-sm">VAT</span>
                              <span className="font-mono font-medium text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">{activeLogistics.vat}</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <Calculator className="h-4 w-4 text-slate-400" />
                          Landed Cost Estimate
                        </h4>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 leading-relaxed">
                           {activeLogistics.estimatedLandedCostText}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                          <Package className="h-4 w-4 text-slate-400" />
                          Recommended Forwarders
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {activeLogistics.topForwarders.map((agent, i) => (
                              <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm">
                                {agent}
                              </span>
                           ))}
                        </div>
                     </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                     <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                     <p>Loading logistics data...</p>
                  </div>
                )}
             </div>
             
             <div className="p-4 border-t border-slate-200 bg-slate-50 text-xs text-center text-slate-400">
                AI estimates are for reference only. Verify with actual agents.
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImportRecommendations;