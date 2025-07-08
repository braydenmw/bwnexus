

import React from 'react';
import { Card } from './common/Card';

const SectionTitle: React.FC<{ subtitle: string; title: string; }> = ({ subtitle, title }) => (
    <div className="mb-10 text-center">
        <h3 className="text-sm font-bold uppercase tracking-widest text-cyan-400">{subtitle}</h3>
        <h2 className="mt-2 text-3xl lg:text-4xl font-extrabold text-gray-100 tracking-tight">{title}</h2>
    </div>
);

const Pillar: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <Card className="p-6 bg-slate-900/50 border-transparent text-center h-full">
        <h4 className="text-lg font-bold text-gray-100 mb-2">{title}</h4>
        <p className="text-sm text-gray-400">{children}</p>
    </Card>
);

export const BusinessProfile: React.FC = () => {
    return (
        <div className="overflow-y-auto h-full bg-slate-800 text-gray-300">
            {/* Hero Section */}
            <div className="relative bg-gray-900">
                <div className="absolute inset-0">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2684&auto=format&fit=crop" alt="Global network connections" />
                    <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" aria-hidden="true"></div>
                </div>
                <div className="relative max-w-5xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight">A New Standard for Global Intelligence</h1>
                    <p className="mt-6 text-xl text-cyan-200 max-w-3xl mx-auto">
                        We are a world-first symbiotic intelligence platform 100% dedicated to discovering and de-risking opportunities in overlooked and misunderstood regional economies.
                    </p>
                </div>
            </div>

            <div className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Part I: The Genesis & Vision */}
                    <section className="mb-16 md:mb-24">
                        <SectionTitle subtitle="Part I: The Genesis & Vision" title="Why This Was Built, and For Whom" />
                        <Card className="mt-10 p-8 bg-slate-900/50 border-transparent space-y-6">
                            <p className="leading-relaxed">
                                My name is Brayden Walls, Founder and Creator of BWGA. This Platform wasn't developed in an office; it was made by living in a regional city, and if it wasn't for that reason, I would never have seen the incredible strength of those who are the reason why I am here today, hoping to give them a new way for the world to see the real worth they hold in themselves and in their land. My journey here is unconventional. For 17 years, my focus was in the high-stakes world of the global cargo industry, specializing in asset protection and developing systems to prevent cargo theft and acts of terrorism. This perspective, combined with experience in asset valuations, gave me a unique lens through which I view the world.
                            </p>
                             <blockquote className="p-6 bg-slate-800/60 rounded-lg border-l-4 border-purple-400 text-gray-300 italic">
                                When I spent time on the ground in Mindanao, Philippines, I saw the greatest unprotected asset of all: <strong className="text-white">regional potential.</strong>
                            </blockquote>
                            <p>
                                I witnessed a profound disconnect. Immense, quantifiable wealth in local resources, human capital, and government initiatives was completely invisible to the outside world. I saw global markets overlooking these opportunities due to poor information, outdated perceptions, and sometimes, a simple unwillingness to look beyond established corridors. The tools to bridge this gap simply did not exist. Companies wanting to expand or diversify away from high-cost markets had no trusted, cost-effective way to get an early-stage read on a new region. Regional governments struggled to articulate their true value to a global audience.
                            </p>
                            <p className="font-semibold text-white">This is why I built Nexus. It is the system I wish existed. It is for the development agency seeking to maximize the impact of every dollar. It is for the company deterred by uncertainty. And it is for the regional communities themselves, to help them unlock the value we in the developed world too often take for granted.</p>
                        </Card>
                    </section>

                     {/* Part II: The Problem */}
                    <section className="mb-16 md:mb-24">
                        <SectionTitle subtitle="Part II: The Systemic Failure" title="The 'Global Understanding Gap'" />
                         <div className="mt-10 grid md:grid-cols-3 gap-8 text-center">
                            <Pillar title="Poor Information Access">
                                Critical data is fragmented, unreliable, or non-existent online. Investment decisions are made based on decade-old headlines, not current reality.
                            </Pillar>
                             <Pillar title="Prohibitive Cost of Entry">
                                The high cost of traditional due diligence from major consulting firms makes exploring new regional markets impossible for many.
                            </Pillar>
                            <Pillar title="Internal Bottlenecks">
                                Local and national complexities that obscure genuine opportunities, preventing regions from effectively signaling their value.
                            </Pillar>
                        </div>
                    </section>

                    {/* Part III: The Philosophy */}
                    <section className="mb-16 md:mb-24">
                        <SectionTitle subtitle="Part III: The Core Philosophy" title="Our Operating Principles" />
                        <div className="mt-10 space-y-12">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <img src="https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2706&auto=format&fit=crop" className="w-full md:w-1/3 h-64 object-cover rounded-lg shadow-lg" alt="Developer at work" />
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-cyan-300 mb-3">1. AI-Human Symbiosis</h4>
                                    <p>We believe in augmenting, not replacing, human expertise. Our platform fuses the scalable analytical power of AI with the irreplaceable nuance of human strategic oversight. We offer both pure AI-driven reports for initial discovery and tiered, human-in-the-loop reports for strategic decisions, ensuring you get the right intelligence for your needs.</p>
                                </div>
                            </div>
                             <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                                <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop" className="w-full md:w-1/3 h-64 object-cover rounded-lg shadow-lg" alt="Business partnership" />
                                <div className="flex-1">
                                    <h4 className="text-2xl font-bold text-cyan-300 mb-3">2. A Proprietary Language for Development</h4>
                                    <p>To solve the unique challenges of regional analysis, we architected a system capable of understanding the complex relationships between economic indicators, policy incentives, and cultural factors. This makes BWGA Nexus the only platform capable of generating reports with this level of integrated, specialized insight.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                     <section>
                         <div className="text-center p-10 bg-gradient-to-br from-purple-800 to-cyan-800 rounded-2xl border border-cyan-700/50">
                             <h2 className="text-3xl font-extrabold text-white">Our Mission: An Objective First Look</h2>
                             <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-200">
                                To be the most trusted and cost-effective first step in global opportunity discovery. We provide the initial layer of data-driven, AI-enhanced intelligence that gives organizations the confidence to take the next step—to engage, to invest, and to build sustainable partnerships in regions that need them most. <strong className="text-white">We are the tool that makes the overlooked, visible.</strong>
                             </p>
                         </div>
                    </section>

                </div>
            </div>
        </div>
    );
};