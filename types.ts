
export enum ReportTier {
  SNAPSHOT = "Tier 0: Snapshot Report",
  PARTNERSHIP_BLUEPRINT = "Tier 1: Partnership Blueprint",
  TRANSFORMATION_SIMULATOR = "Tier 2: Transformation Simulator",
  G2G_STRATEGIC_ALIGNMENT_BLUEPRINT = "Tier 3: G2G Strategic Alignment Blueprint",
}

export type AnalysisMode = 'matchmaking' | 'analysis';

export interface TierDetail {
  tier: ReportTier;
  brief: string;
  fullDescription: string;
  cost: string;
  pageCount: string;
  keyDeliverables: (string | { subItem: string })[];
  idealFor: string;
}

export interface ReportParameters {
  analysisMode: AnalysisMode;
  tier: ReportTier;
  region: string;
  industry: string;
  userName:string;
  userDepartment: string;
  userCountry: string;
  customObjective: string;
  // Fields for matchmaking mode
  companySize?: string;
  keyTechnologies?: string[];
  targetMarket?: string[];
}

export interface LetterRequest {
  reportParameters: ReportParameters;
  reportContent: string;
}

// --- Nexus Symbiosis™ Types ---
export interface SymbiosisContext {
  topic: string; 
  originalContent: string;
  reportParameters?: ReportParameters;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

// --- Dashboard & Analysis Types ---
export interface DashboardIntelligenceItem {
  company: string;
  details: string;
  implication: string;
  source: string;
  url: string;
}

export interface DashboardIntelligence {
    items: DashboardIntelligenceItem[];
    fromCache?: boolean;
    cacheTimestamp?: string;
}
