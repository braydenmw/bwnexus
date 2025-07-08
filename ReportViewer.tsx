


import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';
import type { ReportParameters, SymbiosisContext } from '../types';
import { DownloadIcon, LetterIcon } from './Icons';
import { Card } from './common/Card';
import { Loader } from './common/Loader';

// Utility to escape strings for safe insertion into HTML attributes
function escapeAttr(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

interface ReportViewerProps {
  content: string;
  parameters: ReportParameters;
  isGenerating: boolean;
  onReset: () => void;
  onStartSymbiosis: (context: SymbiosisContext) => void;
  onGenerateLetter: () => void;
  error: string | null;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ 
    content, 
    parameters, 
    isGenerating, 
    onReset,
    onStartSymbiosis,
    onGenerateLetter,
    error
}) => {
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const addSymbiosisHooks = useCallback(() => {
    if (!reportContainerRef.current) return;
    const interactiveElements = reportContainerRef.current.querySelectorAll('.nsil-interactive');
    interactiveElements.forEach(el => {
      const element = el as HTMLElement;
      if (element.querySelector('.symbiosis-trigger')) return;

      const title = element.dataset.symbiosisTitle || 'this topic';
      const rawContent = element.dataset.symbiosisContent || element.innerText;

      const button = document.createElement('button');
      button.className = 'symbiosis-trigger absolute top-2 right-2 p-1 text-purple-400 hover:text-cyan-300 rounded-full hover:bg-slate-700/50 transition-all opacity-0 group-hover:opacity-100';
      button.title = 'Start Symbiosis Chat';
      button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 21a9 9 0 1 1 0 -18a9 9 0 0 1 0 18z" /><path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18z" /><path d="M12 3a4 4 0 0 0 0 8a4 4 0 0 0 0 -8z" /><path d="M12 13a4 4 0 0 1 0 8a4 4 0 0 1 0 -8z" /></svg>`;
      
      button.onclick = (e) => {
        e.stopPropagation();
        onStartSymbiosis({
          topic: title,
          originalContent: rawContent,
          reportParameters: parameters
        });
      };
      element.classList.add('relative', 'group');
      element.appendChild(button);
    });
  }, [onStartSymbiosis, parameters]);

  useEffect(() => {
    addSymbiosisHooks();
  }, [content, addSymbiosisHooks]);

  const parsedContent = useMemo(() => {
    if (!content) return '';
    let processedText = content;

    processedText = processedText.replace(/<nsil:executive_summary>([\s\S]*?)<\/nsil:executive_summary>/g, (match, summary) => `<div class="nsil-interactive p-6 border-l-4 border-purple-400 bg-nexus-surface my-6 rounded-r-lg" data-symbiosis-title="Executive Summary" data-symbiosis-content="${escapeAttr(summary)}"><h3>Executive Summary</h3>${summary}</div>`);
    processedText = processedText.replace(/<nsil:strategic_outlook>([\s\S]*?)<\/nsil:strategic_outlook>/g, (match, text) => `<div class="nsil-interactive p-6 border-l-4 border-cyan-400 bg-nexus-surface my-6 rounded-r-lg" data-symbiosis-title="Strategic Outlook" data-symbiosis-content="${escapeAttr(text)}"><h3>Strategic Outlook</h3>${text}</div>`);
    processedText = processedText.replace(/<nsil:source_attribution>([\s\S]*?)<\/nsil:source_attribution>/g, (match, text) => `<div class="mt-8 pt-4 border-t border-nexus-border text-xs text-gray-500"><h4>Source Attribution</h4>${text}</div>`);
    processedText = processedText.replace(/<nsil:match_making_analysis>([\s\S]*?)<\/nsil:match_making_analysis>/g, `<h2>Partner Matchmaking Analysis</h2>$1`);
    processedText = processedText.replace(/<nsil:market_analysis>([\s\S]*?)<\/nsil:market_analysis>/g, `<h2>Strategic Market Analysis</h2>$1`);
    processedText = processedText.replace(/<nsil:match>([\s\S]*?)<\/nsil:match>/g, `<div class="p-4 my-4 border border-nexus-border rounded-lg bg-slate-800/40">$1</div>`);
    processedText = processedText.replace(/<nsil:company_profile name="(.*?)" headquarters="(.*?)" website="(.*?)">([\s\S]*?)<\/nsil:company_profile>/g, (match, name, hq, site, text) => `<h3>Company Profile: ${escapeAttr(name)}</h3><p><strong>Headquarters:</strong> ${escapeAttr(hq)} | <strong>Website:</strong> <a href="${escapeAttr(site)}" target="_blank" rel="noopener noreferrer" class="text-nexus-blue hover:underline">${escapeAttr(site)}</a></p>${text}`);
    processedText = processedText.replace(/<nsil:synergy_analysis>([\s\S]*?)<\/nsil:synergy_analysis>/g, `<div class="nsil-interactive" data-symbiosis-title="Synergy Analysis" data-symbiosis-content="${escapeAttr('$1')}"><h4>Synergy Analysis</h4>$1</div>`);
    processedText = processedText.replace(/<nsil:risk_map>([\s\S]*?)<\/nsil:risk_map>/g, '<h4>Risk & Opportunity Map</h4><div class="grid md:grid-cols-3 gap-4 mt-2">$1</div>');
    processedText = processedText.replace(/<nsil:zone color="(.*?)" title="(.*?)">([\s\S]*?)<\/nsil:zone>/g, (match, color, title, text) => {
        const colorClasses = { green: 'border-green-500 bg-green-900/20', yellow: 'border-yellow-500 bg-yellow-900/20', red: 'border-red-500 bg-red-900/20'}[color] || 'border-gray-500';
        return `<div class="nsil-interactive border-t-4 ${colorClasses} p-4 rounded-b-lg bg-slate-800/70" data-symbiosis-title="Risk Zone: ${escapeAttr(title)}" data-symbiosis-content="${escapeAttr(text)}"><h5>${escapeAttr(title)}</h5><p class="text-sm text-gray-400 mt-1">${text}</p></div>`
    });
    processedText = processedText.replace(/<nsil:lq_analysis industry="(.*?)" value="(.*?)" interpretation="(.*?)">([\s\S]*?)<\/nsil:lq_analysis>/g, (m, industry, value, interpretation, rationale) => `<div class="nsil-interactive my-4 p-4 rounded-lg bg-slate-800/40 border-l-4 border-sky-400" data-symbiosis-title="LQ Analysis for ${escapeAttr(industry)}" data-symbiosis-content="${escapeAttr(rationale)}"><h4>Location Quotient: ${escapeAttr(industry)}</h4><div class="flex items-center gap-4"><div class="text-center p-2"><div class="text-3xl font-bold">${escapeAttr(value)}</div><div class="text-sm text-sky-300">${escapeAttr(interpretation)}</div></div><p class="text-sm text-gray-400 flex-grow">${rationale}</p></div></div>`);
    processedText = processedText.replace(/<nsil:cluster_analysis anchor_industry="(.*?)">([\s\S]*?)<\/nsil:cluster_analysis>/g, (m, anchor, inner) => {
        const gaps = inner.replace(/<nsil:supply_chain_gap>([\s\S]*?)<\/nsil:supply_chain_gap>/g, '<li class="bg-rose-900/30 p-2 rounded text-rose-300">$1</li>');
        return `<div class="nsil-interactive my-4 p-4 rounded-lg bg-slate-800/40 border-l-4 border-teal-400" data-symbiosis-title="Cluster Analysis for ${escapeAttr(anchor)}" data-symbiosis-content="${escapeAttr(inner.replace(/<[^>]+>/g, ''))}"><h4>Supply Chain Cluster: ${escapeAttr(anchor)}</h4><p class="text-sm text-gray-400 mb-2">Key investment opportunities (supply chain gaps):</p><ul class="space-y-1">${gaps}</ul></div>`;
    });
     processedText = processedText.replace(/<nsil:shift_share_analysis>([\s\S]*?)<\/nsil:shift_share_analysis>/g, (m, inner) => {
        const components = inner.replace(/<nsil:growth_component type="(.*?)" effect="(.*?)">([\s\S]*?)<\/nsil:growth_component>/g, (match, type, effect, text) => {
            const effectColor = effect === 'positive' ? 'text-green-400' : effect === 'negative' ? 'text-red-400' : 'text-yellow-400';
            return `<div class="flex-1 p-3 bg-slate-800/60 rounded-lg"><div class="font-bold capitalize">${type} Effect</div><div class="text-sm font-semibold ${effectColor}">${effect.toUpperCase()}</div><p class="text-xs text-gray-400 mt-1">${text}</p></div>`
        });
        return `<div class="nsil-interactive my-4 p-4 rounded-lg bg-slate-800/40 border-l-4 border-amber-400" data-symbiosis-title="Shift-Share Analysis" data-symbiosis-content="${escapeAttr(inner.replace(/<[^>]+>/g, ''))}"><h4>Shift-Share Growth Analysis</h4><div class="flex flex-col md:flex-row gap-4 mt-2">${components}</div></div>`;
    });
    
    // Future-Cast Tags
    processedText = processedText.replace(/<nsil:future_cast>([\s\S]*?)<\/nsil:future_cast>/g, `<h2>Nexus Future-Cast Scenarios™</h2><p class="text-sm text-gray-400 mb-4">The following are plausible future scenarios. Use the Symbiosis button on each to explore strategic responses.</p><div class="mt-4 grid md:grid-cols-2 gap-6">$1</div>`);
    processedText = processedText.replace(/<nsil:scenario name="(.*?)">([\s\S]*?)<\/nsil:scenario>/g, (m, name, inner) => {
      const contentForData = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return `<div class="nsil-interactive flex flex-col p-5 rounded-xl border border-purple-500/50 bg-purple-900/20 shadow-lg h-full" data-symbiosis-title="Future-Cast Scenario: ${escapeAttr(name)}" data-symbiosis-content="${escapeAttr(contentForData)}"><h3 class="text-xl font-bold text-purple-300 mb-3">${escapeAttr(name)}</h3><div class="flex-grow space-y-3">${inner}</div></div>`;
    });
    processedText = processedText.replace(/<nsil:drivers>([\s\S]*?)<\/nsil:drivers>/g, `<div><h4 class="font-semibold text-gray-300">Drivers:</h4><p class="text-sm text-gray-400 font-mono bg-slate-800/50 p-2 rounded">${'$1'}</p></div>`);
    processedText = processedText.replace(/<nsil:regional_impact effect="(.*?)">([\s\S]*?)<\/nsil:regional_impact>/g, (m, effect, text) => {
      const effectColors: { [key: string]: string } = { positive: 'border-green-400 text-green-300', negative: 'border-red-400 text-red-300', mixed: 'border-yellow-400 text-yellow-300' };
      return `<div class="my-3"><h4 class="font-semibold text-gray-300">Regional Impact:</h4><div class="border-l-4 ${effectColors[effect] || 'border-gray-500'} pl-3 text-sm">${text}</div></div>`;
    });
    processedText = processedText.replace(/<nsil:recommendation>([\s\S]*?)<\/nsil:recommendation>/g, `<div class="mt-auto pt-3 border-t border-white/10"><h4 class="font-semibold text-cyan-300">Strategic Recommendation:</h4><p class="text-sm text-cyan-100">${'$1'}</p></div>`);


    return marked.parse(processedText, { breaks: true });
  }, [content]);

  const handleDownloadPdf = async () => {
    const reportElement = document.getElementById('report-for-pdf');
    if (!reportElement) return;

    setIsDownloading(true);
    try {
        const canvas = await html2canvas(reportElement, { scale: 2, backgroundColor: '#03045E' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps= pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        pdf.save(`Nexus-Report-${parameters.region.replace(/,?\s+/g, '-')}.pdf`);
    } catch (e) {
        console.error("Failed to generate PDF", e);
    } finally {
        setIsDownloading(false);
    }
  };

  const showLetterButton = !isGenerating && content && parameters.analysisMode === 'matchmaking';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-900/50">
        <header className="p-4 bg-slate-800/50 border-b border-nexus-border flex justify-between items-center flex-shrink-0">
            <div>
                <h2 className="text-xl font-bold text-gray-100">Strategic Intelligence Report</h2>
                <p className="text-sm text-gray-400">{parameters.region} &mdash; {parameters.industry}</p>
            </div>
            <div className="flex items-center space-x-4">
                {showLetterButton && (
                    <button onClick={onGenerateLetter} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-500 transition-colors flex items-center gap-2">
                        <LetterIcon className="w-5 h-5"/> Generate Letter
                    </button>
                )}
                <button onClick={onReset} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">
                    New Report
                </button>
                <button onClick={handleDownloadPdf} disabled={isGenerating || isDownloading} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2">
                    <DownloadIcon className="w-5 h-5"/> {isDownloading ? 'Saving...' : 'Download PDF'}
                </button>
            </div>
        </header>
      <div ref={reportContainerRef} className="flex-1 overflow-y-auto" role="document">
        <div id="report-for-pdf" className="max-w-5xl mx-auto p-4 md:p-8">
            <div className="blueprint-content">
                <h1 className="text-2xl font-black text-center mb-8 pb-2 border-b-2 border-nexus-blue">BWGA NEXUS AI - STRATEGIC REPORT</h1>
                <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
                {isGenerating && (
                    <div className="flex items-center justify-center text-gray-400 mt-4 p-4" aria-live="polite">
                        <div className="w-5 h-5 border-2 border-cyan-400 border-dashed rounded-full animate-spin mr-2"></div>
                        BWGA Nexus AI is analyzing...
                    </div>
                )}
                {error && <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg" dangerouslySetInnerHTML={{ __html: marked.parse(error) }}></div>}
            </div>
        </div>
      </div>
    </div>
  );
};