
import React, { useState, useEffect } from 'react';
import type { ReportTier, ReportParameters, TierDetail, AnalysisMode } from '../types';
import { ReportTier as ReportTierEnum } from '../types';
import { INDUSTRIES, COUNTRIES, TIER_DETAILS, COMPANY_SIZES, KEY_TECHNOLOGIES, TARGET_MARKETS } from '../constants';
import { Card } from './common/Card';
import { fetchRegionalCities } from '../services/nexusService';
import { PartnerIcon, ShieldCheckIcon, BookOpenIcon } from './Icons';

interface ReportGeneratorProps {
  onGenerate: (params: ReportParameters) => void;
  isGenerating: boolean;
}

const ProgressIndicator: React.FC<{ current: number; labels: string[] }> = ({ current, labels }) => (
    <div className="w-full mb-10 px-4">
        <ol className="flex items-center w-full">
            {labels.map((label, index) => {
                const step = index + 1;
                const isCompleted = current > step;
                const isCurrent = current === step;
                return (
                    <li key={label} className={`flex items-center text-sm md:text-base ${index < labels.length - 1 ? 'w-full' : ''}`}>
                        <div className="flex flex-col md:flex-row items-center">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-300
                                ${isCompleted ? 'bg-purple-600' : isCurrent ? 'bg-cyan-500 scale-110 shadow-lg shadow-cyan-500/30' : 'bg-slate-700'}`}>
                                {isCompleted ? (
                                    <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                                    </svg>
                                ) : (
                                    <span className={`font-bold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>{step}</span>
                                )}
                            </div>
                            <div className="mt-2 md:mt-0 md:ml-4 text-center md:text-left">
                                <h3 className={`font-medium ${isCurrent ? 'text-white' : 'text-slate-500'}`}>{label}</h3>
                            </div>
                        </div>
                        {index < labels.length - 1 && (
                            <div className={`flex-auto border-t-2 transition-all duration-500 mx-4 ${isCompleted ? 'border-purple-600' : 'border-slate-700'}`}></div>
                        )}
                    </li>
                );
            })}
        </ol>
    </div>
);

const placeholderMatchmaking = "Example:\n'My department is leading a new initiative to develop a local AgriTech hub. My objective is to attract a foreign technology partner to establish a new R&D and production facility in our region. This partner should leverage our strong agricultural base and skilled workforce to produce precision agriculture solutions (like drones or soil sensors) for both domestic and export markets. The goal is to create high-skilled jobs, transfer technology, and boost our agricultural sector's productivity.'";
const placeholderAnalysis = "Example:\n'My objective is to understand the current state and future potential of the Advanced Manufacturing sector in our region. I need a comprehensive analysis of our strengths (supported by Location Quotient data), weaknesses, opportunities (including supply chain gaps), and threats (informed by Shift-Share analysis of our competitiveness). This will inform our new 5-year economic development strategy.'";


export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onGenerate, isGenerating }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('matchmaking');
  const [userName, setUserName] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userCountry, setUserCountry] = useState('Australia');
  const [targetCountry, setTargetCountry] = useState('Philippines');
  const [regionalCity, setRegionalCity] = useState('');
  const [industry, setIndustry] = useState(INDUSTRIES[4]);
  const [tier, setTier] = useState<ReportTier | null>(null);
  const [customObjective, setCustomObjective] = useState('');
  
  // Matchmaking parameters
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[0]);
  const [keyTechnologies, setKeyTechnologies] = useState<string[]>([]);
  const [targetMarket, setTargetMarket] = useState<string[]>([]);
  
  // Manual Entry State
  const [manualCityEntry, setManualCityEntry] = useState(false);
  const [manualIndustry, setManualIndustry] = useState('');
  const [isManualIndustry, setIsManualIndustry] = useState(false);
  const [manualKeyTech, setManualKeyTech] = useState('');
  const [isManualKeyTech, setIsManualKeyTech] = useState(false);
  
  // City loader state
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [cityLookupError, setCityLookupError] = useState<string | null>(null);
  const [regionalCities, setRegionalCities] = useState<string[]>([]);

  useEffect(() => {
    let isCancelled = false;
    if (manualCityEntry || !targetCountry) {
        setRegionalCities([]);
        setRegionalCity('');
        return;
    }
    
    const timerId = setTimeout(() => {
        const loadCities = async () => {
          setIsCityLoading(true); setCityLookupError(null); setRegionalCity(''); setRegionalCities([]);
          try {
            const cities = await fetchRegionalCities(targetCountry);
            if (isCancelled) return;
            if (cities && cities.length > 0) { setRegionalCities(cities); setRegionalCity(cities[0]); } 
            else { setCityLookupError(`No regional centers found. Please enter manually.`); setManualCityEntry(true); }
          } catch (error) {
            if (isCancelled) return;
            setCityLookupError((error as Error).message || "An unknown error occurred."); setManualCityEntry(true);
          } finally {
            if (!isCancelled) setIsCityLoading(false);
          }
        };
        loadCities();
    }, 100);
    return () => { isCancelled = true; clearTimeout(timerId); };
  }, [targetCountry, manualCityEntry]);

  const handleTierSelect = (selectedTier: ReportTier) => {
    setTier(selectedTier);
    setCurrentStep(2);
  };
  
  const handleNext = () => {
    let canProceed = false;
    if (currentStep === 3) {
        const cityOk = manualCityEntry ? regionalCity.trim() !== '' : regionalCity !== '';
        const industryOk = isManualIndustry ? manualIndustry.trim() !== '' : industry !== '';
        if (userName && userDepartment && cityOk && industryOk) canProceed = true;
        else alert("Please complete your details, select a regional area, and define the industry focus.");
    } else if (currentStep === 4) {
         const techOk = isManualKeyTech ? manualKeyTech.trim() !== '' : keyTechnologies.length > 0;
         if (techOk && targetMarket.length > 0) canProceed = true;
         else alert("Please define at least one Key Technology and one Target Market.");
    } else { canProceed = true; }

    if (canProceed) {
        const next = currentStep === 3 && analysisMode === 'analysis' ? 5 : currentStep + 1;
        setCurrentStep(next);
    }
  };

  const handleBack = () => {
    let prev = currentStep - 1;
    if (currentStep === 5 && analysisMode === 'analysis') prev = 3;
    setCurrentStep(prev);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tier) { alert("Something went wrong, please restart the process."); setCurrentStep(1); return; }
    if (!regionalCity.trim()) { alert("Please select or enter a regional city/area."); setCurrentStep(3); return; }
    if (!customObjective.trim()) { alert("Please define your strategic intent to guide the AI."); setCurrentStep(5); return; }
    
    const finalIndustry = isManualIndustry ? manualIndustry : industry;
    const finalKeyTechs = isManualKeyTech ? manualKeyTech.split(',').map(t => t.trim()).filter(Boolean) : keyTechnologies;
    const region = `${regionalCity}, ${targetCountry}`;
    
    onGenerate({ analysisMode, region, industry: finalIndustry, tier, userName, userDepartment, userCountry, customObjective, 
        companySize: analysisMode === 'matchmaking' ? companySize : undefined,
        keyTechnologies: analysisMode === 'matchmaking' ? finalKeyTechs : undefined,
        targetMarket: analysisMode === 'matchmaking' ? targetMarket : undefined
    });
  };
  
  const inputStyles = "w-full p-3 bg-slate-800/80 border border-nexus-border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition placeholder:text-gray-500 disabled:bg-slate-900 disabled:cursor-not-allowed";
  const labelStyles = "block text-sm font-medium text-gray-400 mb-2";
  const ManualEntryCheckbox: React.FC<{ isChecked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ isChecked, onChange }) => (
    <label className="flex items-center text-xs text-gray-400 cursor-pointer">
      <input type="checkbox" checked={isChecked} onChange={onChange} className="mr-2 h-4 w-4 rounded bg-slate-700 border-slate-500 text-purple-500 focus:ring-purple-600"/> Manual
    </label>
  );

  const wizardLabels = analysisMode === 'matchmaking' ? ["Select Tier", "Select Mode", "Scope", "Partner Profile", "Finalize"] : ["Select Tier", "Select Mode", "Scope", "Finalize"];
  const totalSteps = wizardLabels.length;

  const renderStepContent = () => {
      switch (currentStep) {
          case 1: return (
            <div>
                <Card className="bg-purple-900/20 border border-purple-500/50 p-6 mb-8">
                    <h3 className="text-xl font-bold text-cyan-300 mb-3">Unlimited Access for Government Partners</h3>
                    <p className="text-gray-300 text-sm">We offer an annual license that provides government departments with unlimited access to all report tiers and the Live Intelligence Dashboard. This enables continuous strategic analysis across all your initiatives. For a detailed proposal on a departmental or national license, please contact us directly.</p>
                     <button className="mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Contact Us for Licensing</button>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {TIER_DETAILS.map(detail => (
                    <Card key={detail.tier} className="flex flex-col p-4 bg-slate-800/50 border border-nexus-border hover:border-cyan-400 transition-all">
                        <div className="flex-grow">
                            <h4 className="font-bold text-cyan-400">{detail.tier}</h4>
                            <p className="text-xs text-gray-400 mt-2 h-20">{detail.brief}</p>
                            <div className="border-t border-white/10 my-3 pt-3 flex justify-between items-baseline text-sm">
                                <span className="font-semibold text-green-400">{detail.cost}</span>
                                <span className="text-gray-400 font-medium">{detail.pageCount}</span>
                            </div>
                        </div>
                        <button onClick={() => handleTierSelect(detail.tier)} className="w-full mt-auto bg-nexus-blue text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-400 transition-colors">
                            Select & Configure
                        </button>
                    </Card>
                  ))}
                </div>
            </div>
          );
          case 2: return (
              <Card className="bg-nexus-surface p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-center text-white mb-2">Select Analysis Mode</h3>
                  <p className="text-gray-400 mb-8 text-center">How do you want to use the Nexus AI? Your choice will tailor the next steps.</p>
                  <div className="grid md:grid-cols-2 gap-6">
                      <div onClick={() => setAnalysisMode('matchmaking')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${analysisMode === 'matchmaking' ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-purple-400'}`}>
                          <PartnerIcon className="w-10 h-10 text-purple-400 mb-3" />
                          <h4 className="text-xl font-bold text-purple-300 mb-3">Find a Partner</h4>
                          <p className="text-gray-400 text-sm">Identify and vet specific private sector companies (e.g., investors, tech providers) that align with your region's strategic development goals.</p>
                      </div>
                      <div onClick={() => setAnalysisMode('analysis')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${analysisMode === 'analysis' ? 'border-cyan-500 bg-cyan-900/30 shadow-lg shadow-cyan-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-cyan-400'}`}>
                          <BookOpenIcon className="w-10 h-10 text-cyan-400 mb-3" />
                          <h4 className="text-xl font-bold text-cyan-300 mb-3">Analyze a Market</h4>
                          <p className="text-gray-400 text-sm">Conduct a deep-dive analysis of a specific industry within your region to understand its potential, challenges, and competitive landscape.</p>
                      </div>
                  </div>
              </Card>
          );
          case 3: return (
            <Card className="bg-nexus-surface p-6 md:p-8">
                <h3 className="text-2xl font-bold text-cyan-400 mb-6">Your Details & Report Scope</h3>
                <div className="grid lg:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-6"><h4 className="font-semibold text-purple-300 text-lg">Your Details</h4>
                        <div><label htmlFor="userName" className={labelStyles}>Name</label><input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} className={inputStyles} placeholder="e.g., Jane Doe" required /></div>
                        <div><label htmlFor="userDepartment" className={labelStyles}>Department/Agency</label><input type="text" id="userDepartment" value={userDepartment} onChange={(e) => setUserDepartment(e.target.value)} className={inputStyles} placeholder="e.g., Department of Trade" required /></div>
                        <div><label htmlFor="userCountry" className={labelStyles}>Your Country</label><select id="userCountry" value={userCountry} onChange={(e) => setUserCountry(e.target.value)} className={inputStyles} required>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    </div>
                    <div className="space-y-6"><h4 className="font-semibold text-purple-300 text-lg">The Regional Focus</h4>
                        <div><label htmlFor="targetCountry" className={labelStyles}>Target Country</label><select id="targetCountry" value={targetCountry} onChange={(e) => { setTargetCountry(e.target.value); setManualCityEntry(false); }} className={inputStyles} required>{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><div className="flex justify-between items-center mb-2"><label htmlFor="regionalCity" className={labelStyles}>Regional City / Area</label><ManualEntryCheckbox isChecked={manualCityEntry} onChange={(e) => setManualCityEntry(e.target.checked)} /></div>
                            {manualCityEntry ? <input type="text" id="regionalCity" value={regionalCity} onChange={(e) => setRegionalCity(e.target.value)} className={inputStyles} placeholder="e.g., Clark Freeport Zone" required/> : isCityLoading ? <div className={`${inputStyles} flex items-center justify-center text-gray-400`}><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Fetching...</div> : regionalCities.length > 0 ? <select id="regionalCity" value={regionalCity} onChange={(e) => setRegionalCity(e.target.value)} className={inputStyles} required>{regionalCities.map(c => <option key={c} value={c}>{c}</option>)}</select> : <input type="text" className={inputStyles} placeholder="Select target country" disabled/>}
                            {cityLookupError && <p className="text-red-400 text-xs mt-2">{cityLookupError}</p>}
                        </div>
                        <div><div className="flex justify-between items-center mb-2"><label htmlFor="industry" className={labelStyles}>Industry Focus</label><ManualEntryCheckbox isChecked={isManualIndustry} onChange={(e) => setIsManualIndustry(e.target.checked)} /></div>
                            {isManualIndustry ? <input type="text" id="industry" value={manualIndustry} onChange={e => setManualIndustry(e.target.value)} className={inputStyles} placeholder="Enter custom industry" required/> : <select id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputStyles} required>{INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}</select>}
                        </div>
                    </div>
                </div>
            </Card>
          );
          case 4: return ( // Partner Profile
              <Card className="bg-nexus-surface p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-6">Define the Ideal Private Sector Partner</h3>
                  <div className="grid lg:grid-cols-2 gap-8">
                      <div><label htmlFor="companySize" className={labelStyles}>Partner Company Size</label><select id="companySize" value={companySize} onChange={(e) => setCompanySize(e.target.value)} className={inputStyles} required>{COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                      <div><label htmlFor="targetMarket" className={labelStyles}>Partner's Target Markets <span className="text-red-400">*</span></label><select id="targetMarket" multiple value={targetMarket} onChange={(e) => setTargetMarket(Array.from(e.target.selectedOptions, option => option.value))} className={`${inputStyles} h-32`} required>{TARGET_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                      <div className="lg:col-span-2"><div className="flex justify-between items-center mb-2"><label htmlFor="keyTechnologies" className={labelStyles}>Key Technologies / Capabilities <span className="text-red-400">*</span></label><ManualEntryCheckbox isChecked={isManualKeyTech} onChange={e => setIsManualKeyTech(e.target.checked)} /></div>
                          {isManualKeyTech ? <textarea id="keyTechnologies" value={manualKeyTech} onChange={e => setManualKeyTech(e.target.value)} className={`${inputStyles} h-32`} placeholder="Enter technologies, separated by commas" required/> : <select id="keyTechnologies" multiple value={keyTechnologies} onChange={(e) => setKeyTechnologies(Array.from(e.target.selectedOptions, option => option.value))} className={`${inputStyles} h-32`} required>{KEY_TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}</select>}
                      </div>
                  </div>
              </Card>
          );
          case 5: return ( // Finalize
              <Card className="bg-nexus-surface p-6 md:p-8">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4">Define Your Strategic Intent</h3>
                  <p className="text-gray-400 mb-4 text-sm">{analysisMode === 'matchmaking' ? "Describe the primary goal of this partnership. What does success look like for your department and region?" : "Describe the primary goal of this market analysis. What key questions do you need this report to answer for your department?"}</p>
                  <textarea value={customObjective} onChange={(e) => setCustomObjective(e.target.value)} rows={8} className={inputStyles} placeholder={analysisMode === 'matchmaking' ? placeholderMatchmaking : placeholderAnalysis} required/>
              </Card>
          );
          default: return <div>Invalid Step</div>;
      }
  };
  
  return (
    <div className="overflow-y-auto h-full p-4 md:p-8 flex flex-col items-center">
      <header className="mb-8 text-center max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter">Nexus Report Generator</h2>
        <p className="text-gray-400 mt-2">A guided process for generating bespoke strategic intelligence for government & public sector partners.</p>
      </header>
      
      <div className="w-full max-w-6xl">
        <ProgressIndicator current={currentStep} labels={wizardLabels} />
        <form onSubmit={handleSubmit}>
            {renderStepContent()}
            <div className="mt-8 flex justify-between items-center">
                <button type="button" onClick={handleBack} disabled={currentStep === 1} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Back
                </button>
                {currentStep < totalSteps ? (
                    <button type="button" onClick={handleNext} className="bg-gradient-to-r from-purple-500 to-cyan-400 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-all">
                        Next
                    </button>
                ) : (
                    <button type="submit" disabled={isGenerating} className="bg-gradient-to-r from-green-500 to-teal-400 text-white font-bold py-3 px-10 rounded-lg hover:opacity-90 transition-all disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px] text-lg shadow-lg shadow-green-500/20 disabled:shadow-none">
                        {isGenerating ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>
                        ) : 'Activate Nexus AI'}
                    </button>
                )}
            </div>
        </form>
      </div>
    </div>
  );
};
