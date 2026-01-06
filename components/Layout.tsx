import React from 'react';
import { ShoppingBag, TrendingUp, Ship } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'market' | 'import';
  onTabChange: (tab: 'market' | 'import') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <header className="sticky top-0 z-40 bg-emerald-950/90 backdrop-blur-md border-b border-emerald-800/50 text-white shadow-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <ShoppingBag className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">KenyaTrade Insights</h1>
                <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">AI-Powered Analytics</p>
              </div>
            </div>
            
            <nav className="flex items-center bg-emerald-900/40 p-1.5 rounded-full border border-emerald-800/50 backdrop-blur-sm">
              <button
                onClick={() => onTabChange('market')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'market'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Market Data</span>
              </button>
              <button
                onClick={() => onTabChange('import')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'import'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                }`}
              >
                <Ship className="h-4 w-4" />
                <span className="hidden sm:inline">Import Ideas</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p className="flex items-center justify-center gap-2">
            &copy; {new Date().getFullYear()} KenyaTrade Insights. 
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>Data provided by Google Search Grounding.</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;