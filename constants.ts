
import type { ReportTier, TierDetail } from './types';
import { ReportTier as ReportTierEnum } from './types';

export const REPORT_TIERS = Object.values(ReportTierEnum);

export const INDUSTRIES = [
  "Advanced Manufacturing & Robotics",
  "Agriculture & Aquaculture Technology (AgriTech)",
  "Artificial Intelligence (AI) & Machine Learning",
  "Biotechnology & Life Sciences",
  "Clean Technology & Renewable Energy",
  "Critical Minerals & Rare Earth Elements",
  "Cybersecurity",
  "Digital Infrastructure (Data Centers, 5G)",
  "Financial Technology (FinTech)",
  "Logistics & Supply Chain Tech",
  "Medical Technology & Healthcare Innovation",
  "Space Technology & Exploration",
  "Sustainable Materials",
  "Water Technology & Management",
];

export const COUNTRIES = [
  "Australia", "Brazil", "Canada", "Chile", "Egypt", "Estonia",
  "Finland", "Germany", "Ghana", "India", "Indonesia", "Israel",
  "Japan", "Kenya", "Malaysia", "Mexico", "Morocco", "Netherlands",
  "New Zealand", "Nigeria", "Norway", "Oman", "Philippines", "Poland",
  "Portugal", "Qatar", "Rwanda", "Saudi Arabia", "Singapore",
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Taiwan", "Tanzania", "Thailand", "Turkey", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Vietnam"
];

export const COMPANY_SIZES = [
    "Startup (1-50 employees)",
    "Small-Medium Enterprise (51-500 employees)",
    "Large Corporation (501-5000 employees)",
    "Multinational (5000+ employees)"
];

export const KEY_TECHNOLOGIES = [
    "AI/ML Platforms",
    "IoT & Edge Computing",
    "Blockchain & DLT",
    "Advanced Materials",
    "Robotics & Automation",
    "Gene Editing/CRISPR",
    "Quantum Computing",
    "5G/6G Communications",
    "Battery & Energy Storage",
    "Carbon Capture, Utilization, and Storage (CCUS)",
    "Precision Agriculture",
    "Digital Twin Technology"
];

export const TARGET_MARKETS = [
    "Developed Economies (e.g., North America, Western Europe)",
    "Emerging Asia (e.g., Southeast Asia, India)",
    "Latin America",
    "Middle East & North Africa (MENA)",
    "Sub-Saharan Africa",
    "Global/Any",
];

export const GLOBAL_REGIONS = [
    "Global",
    "North America",
    "Europe",
    "Asia-Pacific",
    "Latin America",
    "Middle East & Africa",
];

export const DASHBOARD_CATEGORIES = [
  "Geopolitical Shifts",
  "Technology Breakthroughs",
  "Supply Chain Disruptions",
  "Market Entry Signals"
];

export const TIER_DETAILS: TierDetail[] = [
    {
        tier: ReportTierEnum.SNAPSHOT,
        brief: "A quick, 1-to-1 match to validate a partnership idea for a specific government program.",
        fullDescription: "The Snapshot is a low-cost, rapid-assessment tool. It provides an AI-generated match between a single private sector company and a specific government objective or regional need, offering a data point to start an internal conversation.",
        cost: "$75",
        pageCount: "Approx. 4 pages",
        keyDeliverables: [
            "AI-Generated 1-to-1 Company Match",
            "High-Level Synergy Rationale",
            "Key Public Data Points",
            "Initial Talking Points for Internal Discussion",
        ],
        idealFor: "Government departments needing a quick, affordable data point to validate a potential private-public partnership idea."
    },
    {
        tier: ReportTierEnum.PARTNERSHIP_BLUEPRINT,
        brief: "A vetted shortlist of up to 3 potential private sector partners with deeper synergy analysis.",
        fullDescription: "The Partnership Blueprint builds a robust case for private sector engagement. It moves beyond a single match to provide a vetted shortlist of potential partners for your region, complete with strategic intelligence and risk analysis.",
        cost: "R&D Phase: $0",
        pageCount: "Approx. 20-35 pages",
        keyDeliverables: [
            "All elements from Snapshot, PLUS:",
            "Vetted shortlist of up to 3 companies",
            "In-Depth Synergy Analysis for each",
            "Preliminary Risk Map for each partnership",
            "Sector-Specific Ecosystem Analysis for your region",
        ],
        idealFor: "Economic development agencies needing a list of viable, pre-vetted private sector partners for a specific regional initiative."
    },
     {
        tier: ReportTierEnum.TRANSFORMATION_SIMULATOR,
        brief: "A deep dive on the #1 matched partner, including economic impact modeling AND the new 'Nexus Future-Cast Scenarios'.",
        fullDescription: "The premium offering for major strategic decisions. This tier provides an exhaustive analysis of the top partner, including detailed economic impact modeling and the 'Nexus Future-Cast Scenarios'—a dynamic strategic playbook that models multiple plausible futures.",
        cost: "R&D Phase: $0",
        pageCount: "Approx. 40-60+ pages",
        keyDeliverables: [
            "All elements from Partnership Blueprint, PLUS:",
            "Deep dive on the #1 partner",
            "Economic Impact Modeling for your region",
            "Nexus Future-Cast Scenarios™",
            "Advanced Infrastructure & Logistics Audit",
            "ESG & Climate Resilience Due Diligence",
        ],
        idealFor: "Government bodies planning significant, long-term strategic initiatives requiring a full-spectrum analysis of risks and opportunities under various future conditions."
    },
    {
        tier: ReportTierEnum.G2G_STRATEGIC_ALIGNMENT_BLUEPRINT,
        brief: "A country-to-country strategic analysis for high-level government departments.",
        fullDescription: "This report is designed for government-to-government (G2G) strategy. It analyzes the strategic alignment between two nations on key industries, using LQ, Cluster, and Shift-Share analysis for both to find areas of complementary strength and competitive advantage.",
        cost: "Enquire for Partnership Pricing",
        pageCount: "Custom",
        keyDeliverables: [
            "Bilateral Economic & Industrial Analysis",
            "Comparative LQ, Cluster, & Shift-Share Analysis",
            "Identification of Complementary Strengths",
            "Geopolitical & Supply Chain Stress-Testing",
            "Actionable Policy Recommendations for Collaboration",
        ],
        idealFor: "High-level government departments (e.g., Foreign Affairs, Trade, Defence) formulating bilateral strategies."
    }
];
