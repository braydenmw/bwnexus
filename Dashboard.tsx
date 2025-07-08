
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchDashboardCategory } from '../services/nexusService';
import type { DashboardIntelligence, DashboardIntelligenceItem, SymbiosisContext } from '../types';
import { Card } from './common/Card';
import { ExternalLinkIcon, SymbiosisIcon, AnalyzeIcon } from './Icons';
import { DASHBOARD_CATEGORIES } from '../constants';
import { Loader } from './common/Loader';
import { RegionSelector } from './RegionSelector';


interface DashboardProps {
    onAnalyze: (item: DashboardIntelligenceItem) => void;
    onStartSymbiosis: (context: SymbiosisContext) => void;
    currentRegion: string;
    onRegionChange: (region: string) => void;
}

interface CategoryState {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: DashboardIntelligence['items'];
    error?: string;
    fromCache?: boolean;
    cacheTimestamp?: string;
}

type DashboardState = Record<string, CategoryState>;

const IntelligenceCard: React.FC<{ item: DashboardIntelligenceItem; onAnalyze: DashboardProps['onAnalyze']; onStartSymbiosis: DashboardProps['onStartSymbiosis']; }> = ({ item, onAnalyze, onStartSymbiosis }) => {
    const handleSymbiosisClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onStartSymbiosis({ topic: `Implication for: ${item.company}`, originalContent: item.implication });
    };

    return (
        <Card className="flex flex-col h-full group bg-slate-900/50 border border-slate-700 hover:border-purple-500/50 transition-colors duration-300">
            <div className="p-5 flex-grow flex flex-col">
              <h3 className="text-lg font-bold text-gray-100 mb-3 group-hover:text-cyan-400 transition-colors">{item.company}</h3>
              <p className="text-sm text-gray-400 mb-4 flex-grow">{item.details}</p>
              <div className="relative mt-auto pt-4 border-t border-white/10">
                  <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider mb-1">Strategic Implication</p>
                  <p className="text-sm text-gray-300 pr-8">{item.implication}</p>
                  <button onClick={handleSymbiosisClick} className="absolute top-2 right-0 p-1 text-purple-400 hover:text-cyan-300 opacity-50 group-hover:opacity-100 transition-opacity" title="Start Symbiosis Chat"><SymbiosisIcon className="w-5 h-5"/></button>
              </div>
            </div>
            <div className="bg-slate-900/70 p-3 mt-auto border-t border-white/10 flex justify-between items-center">
                 <span className="text-xs text-gray-500 truncate pr-2">Source: {item.source}</span>
                 <div className="flex items-center gap-3 flex-shrink-0">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-300 transition-colors">Source <ExternalLinkIcon className="w-4 h-4" /></a>
                    <button onClick={() => onAnalyze(item)} className="inline-flex items-center gap-2 text-xs font-semibold text-gray-200 bg-white/10 px-2 py-1 rounded-md hover:bg-purple-500/50 transition-colors">Analyze <AnalyzeIcon className="w-4 h-4"/></button>
                </div>
            </div>
        </Card>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onAnalyze, onStartSymbiosis, currentRegion, onRegionChange }) => {
  const [dashboardState, setDashboardState] = useState<DashboardState>(
    DASHBOARD_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { status: 'idle', data: [] } }), {} as DashboardState)
  );
  const [isFetchingAll, setIsFetchingAll] = useState(false);

  const loadCategory = useCallback(async (category: string, region: string) => {
    // Prevent double-fetching if already loading
    if(dashboardState[category]?.status === 'loading') return;

    setDashboardState(prev => ({ ...prev, [category]: { ...prev[category], status: 'loading' }}));
    try {
        const result = await fetchDashboardCategory(category, region);
        if (result && Array.isArray(result.items)) {
            setDashboardState(prev => ({ ...prev, [category]: { 
                status: 'success', 
                data: result.items, 
                error: undefined,
                fromCache: result.fromCache,
                cacheTimestamp: result.cacheTimestamp
            }}));
        } else {
             throw new Error("Invalid data format received.");
        }
    } catch (e) {
        const error = e instanceof Error ? e.message : 'An unknown error occurred';
        setDashboardState(prev => ({ ...prev, [category]: { ...prev[category], status: 'error', data: [], error }}));
        console.error(`Failed to load category: ${category} for region: ${region}`, e);
    }
  }, [dashboardState]);

  // Effect to handle region changes and initial load
  useEffect(() => {
    let isCancelled = false;
    
    // Function to fetch all categories with a delay between them
    const fetchAllWithDelay = async () => {
        setIsFetchingAll(true);
        // Reset state for new region
        setDashboardState(DASHBOARD_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: { status: 'idle', data: [] } }), {} as DashboardState));
        
        for (const category of DASHBOARD_CATEGORIES) {
            if (isCancelled) break;
            await loadCategory(category, currentRegion);
            if (isCancelled) break;
            // Wait for 3 seconds before fetching the next category to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        if (!isCancelled) {
            setIsFetchingAll(false);
        }
    };

    fetchAllWithDelay();
    
    return () => {
        isCancelled = true;
    };
  }, [currentRegion, loadCategory]);


  const handleRetry = (category: string) => {
    loadCategory(category, currentRegion);
  }
  
  const allCategories = Object.entries(dashboardState);
  const isLoadingOverall = isFetchingAll || Object.values(dashboardState).some(s => s.status === 'loading');

  return (
    <div className="p-4 md:p-8 h-full flex flex-col gap-6 text-gray-200 overflow-hidden">
      <header className="max-w-7xl w-full mx-auto px-1">
        <div className="flex flex-wrap gap-4 justify-between items-start">
            <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tighter">Live Intelligence Dashboard</h2>
                <p className="text-gray-400 mt-2 max-w-4xl">A real-time feed of global events, generated by Nexus AI. Intelligence signals are loaded automatically.</p>
            </div>
            <RegionSelector selectedRegion={currentRegion} onRegionChange={onRegionChange} />
        </div>
      </header>
      
      <main className="flex-grow overflow-y-auto max-w-7xl w-full mx-auto pb-8">
        {isLoadingOverall && allCategories.every(([_, s]) => s.status !== 'success') && <Loader message={`Connecting to Global Intelligence Feed for ${currentRegion}...`} />}
        
        <div className="space-y-10 px-1">
          {allCategories.map(([categoryName, state]) => (
            <section key={categoryName}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 className="text-2xl font-bold text-gray-200">{categoryName}</h3>
                <div className="flex items-center gap-4">
                  {state.fromCache && state.cacheTimestamp && (
                      <div className="text-xs text-amber-300 bg-amber-900/50 px-2 py-1 rounded-md" title={`Data as of: ${new Date(state.cacheTimestamp).toLocaleString()}`}>
                          Showing cached data (from {new Date(state.cacheTimestamp).toLocaleTimeString()})
                      </div>
                  )}
                  {state.status === 'loading' && <div className="w-5 h-5 border-2 border-purple-400 border-dashed rounded-full animate-spin"></div>}
                </div>
              </div>

              {state.status === 'error' && 
                <Card className="border-red-500/50 text-red-300 p-4">
                    <p className="font-semibold">Could not load this section.</p>
                    <p className="text-sm mt-1">{state.error}</p>
                    <button onClick={() => handleRetry(categoryName)} className="text-sm font-semibold mt-2 underline hover:text-red-200">Retry</button>
                </Card>
              }
              {state.status === 'success' && (
                state.data.length > 0 ? (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {state.data.map((item, index) => <IntelligenceCard key={`${item.company}-${index}`} item={item} onAnalyze={onAnalyze} onStartSymbiosis={onStartSymbiosis} />)}
                    </div>
                ) : (
                    <Card className="p-4"><p className="text-gray-500">No recent intelligence items found for this category.</p></Card>
                )
              )}
               {state.status === 'idle' && !isLoadingOverall && (
                  <Card className="p-4"><p className="text-gray-500">Waiting to fetch data for this category...</p></Card>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
