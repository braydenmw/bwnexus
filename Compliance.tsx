


import React from 'react';
import { Card } from './common/Card';
import { NexusLogo } from './Icons';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="mb-6 border-transparent bg-slate-900/50">
        <div className="p-6">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">{title}</h3>
            <div className="prose prose-invert max-w-none text-gray-400 text-sm leading-relaxed space-y-3">
                {children}
            </div>
        </div>
    </Card>
);

export const Compliance: React.FC = () => {
    return (
        <div className="p-4 md:p-8 overflow-y-auto h-full bg-slate-800 text-gray-300">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-12">
                     <NexusLogo className="w-16 h-16 text-nexus-blue mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2 text-center text-gray-100 tracking-tight">BWGA Nexus AI: Our Foundation</h2>
                    <p className="text-lg text-gray-400">Our commitment to ethical development, data governance, and our core mission.</p>
                </header>

                <Section title="I. Our Genesis: A Founder's Insight into a Global Imperative">
                    <p>BW Global Advisory (BWGA) is an independent Australian initiative, born not from established institutional frameworks, but from a profound and simple observation made during more than a year of immersive, on-the-ground experience within the regional Philippines. Living amongst local communities revealed a critical "Understanding Gap."</p>
                    <p>This gap – fueled by information asymmetries, outdated perceptions, and the lack of sophisticated, unbiased, and forward-looking intelligence – systematically hinders equitable development. It became clear that while global capital and opportunity exist, and regional assets abound, a crucial piece of intelligent, proactive, and ethically grounded facilitation was missing.</p>
                    <p className="text-cyan-300 font-semibold">This firsthand realization, coupled with over 17 years of prior diverse international business experience, was the genesis of BWGA Nexus. This initiative is the product of dedicated, independent development to empower regional economies by systematically illuminating their potential.</p>
                </Section>
                
                <Section title="II. Our Mission & Core Philosophy: Ethical AI-Human Symbiosis">
                    <p><strong>Mission:</strong> To fundamentally transform regional economic development by creating a globally intelligent, adaptive AI-Human system. BWGA Nexus™ proactively identifies, validates, and facilitates symbiotic partnerships between regional governments, international investors, and relevant solution providers.</p>
                    <p><strong>Core Philosophy:</strong> We operate on the principle of <strong>Ethical AI-Human Symbiosis</strong>. Artificial Intelligence (AI) is a powerful amplifier of human strategic insight, but human expertise remains indispensable for contextualization, ethical oversight, validation, and building trust. Our "Nexus AI" engine is designed to augment, not replace, human judgment.</p>
                </Section>

                <Section title="VI. Our Commitment to Ethical AI & Data Governance">
                    <p>BWGA is unequivocally committed to the responsible development and deployment of AI. Our Ethical AI & Data Governance Framework v1.0 outlines our principles for:</p>
                     <ul className="list-disc list-inside grid grid-cols-2 gap-x-4 gap-y-2">
                        <li>Human-Centricity</li>
                        <li>Fairness/Non-Discrimination</li>
                        <li>Transparency/Explainability</li>
                        <li>Accountability/Human Oversight</li>
                        <li>Security/Safety</li>
                        <li>Robust data privacy practices</li>
                    </ul>
                    <p className="mt-3">Our framework aligns with global best practices like OECD AI Principles and GDPR concepts.</p>
                </Section>
                
                <Section title="VII. Intellectual Property & Confidentiality">
                    <p>The concepts, methodologies, analytical processes, platform architecture, the "Nexus Symbiotic Intelligence Language" (NSIL), and the "BWGA Nexus™" name and system constitute the developing and proprietary intellectual property of BW Global Advisory (Brayden Walls, ABN 55 978 113 300). All rights are reserved.</p>
                    <p className="font-semibold text-rose-300">All information, analysis, and data disclosed by BWGA is provided to recipients on a STRICTLY CONFIDENTIAL BASIS and is for internal evaluation purposes only.</p>
                </Section>

                <Section title="IMPORTANT NOTICE: Developmental Status & Use of Information">
                    <p><strong>Developmental Status:</strong> BWGA is an initiative in an active R&D and pre-commercial phase. The "BWGA Nexus" vision, including the Live AI Dashboard and advanced AI engines, are under ongoing development and are subject to modification, refinement, or change without prior notice.</p>
                    <p><strong>For Guidance & Decision Support Only:</strong> The information provided by BWGA is intended to serve as advanced decision-support. It is NOT intended to be, and should NOT be construed as, a substitute for the Recipient's own comprehensive internal assessments, independent feasibility studies, or professional financial or legal advice. The Recipient is solely responsible for all decisions made and actions taken based on its interpretation or use of the Information.</p>
                    <p><strong>No Warranties:</strong> BWGA provides this Information "as is" and "as available." While every reasonable effort is made to ensure accuracy, given the developmental status and reliance on public data, BWGA makes no representations or warranties of any kind as to the absolute completeness, accuracy, or reliability of the Information.</p>
                </Section>
            </div>
        </div>
    );
};
