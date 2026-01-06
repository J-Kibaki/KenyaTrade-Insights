import React, { useState } from 'react';
import Layout from './components/Layout';
import MarketDashboard from './components/MarketDashboard';
import ImportRecommendations from './components/ImportRecommendations';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'market' | 'import'>('market');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'market' ? (
        <MarketDashboard />
      ) : (
        <ImportRecommendations />
      )}
    </Layout>
  );
};

export default App;
