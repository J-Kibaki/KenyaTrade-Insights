import React from 'react';
import { ShoppingBag, TrendingUp, Ship } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'market' | 'import';
  onTabChange: (tab: 'market' | 'import') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-8 w-8 text-emerald-400" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">KenyaTrade Insights</h1>
                <p className="text-xs text-emerald-300">Powered by Google Gemini & Search</p>
              </div>
            </div>
            
            <nav className="flex space-x-4">
              <button
                onClick={() => onTabChange('market')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'market'
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Market Data</span>
                </div>
              </button>
              <button
                onClick={() => onTabChange('import')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'import'
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Ship className="h-4 w-4" />
                  <span className="hidden sm:inline">Import Ideas</span>
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} KenyaTrade Insights. Data provided by Google Search Grounding.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
