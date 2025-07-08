
// Using URL imports to make this self-contained, as there's no package.json
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@0.8.0";
import type { GenerateContentResponse } from "https://esm.sh/@google/genai@0.8.0";

// --- DUPLICATED TYPES & CONSTANTS ---
// In a real monorepo, these would be in a shared package.
// For this self-contained function, they are duplicated here.

enum ReportTier {
  SNAPSHOT = "Tier 0: Snapshot Report",
  PARTNERSHIP_BLUEPRINT = "Tier 1: Partnership Blueprint",
  TRANSFORMATION_SIMULATOR = "Tier 2: Transformation Simulator",
  G2G_STRATEGIC_ALIGNMENT_BLUEPRINT = "Tier 3: G2G Strategic Alignment Blueprint",
}

interface ReportParameters {
  analysisMode: 'matchmaking' | 'analysis';
  tier: ReportTier;
  region: string;
  industry: string;
  userName:string;
  userDepartment: string;
  userCountry: string;
  customObjective: string;
  companySize?: string;
  keyTechnologies?: string[];
  targetMarket?: string[];
}

interface LetterRequest {
  reportParameters: ReportParameters;
  reportContent: string;
}

interface SymbiosisContext {
  topic: string; 
  originalContent: string;
  reportParameters?: ReportParameters;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

interface DashboardIntelligenceItem {
  company: string;
  details: string;
  implication: string;
  source: string;
  url: string;
}


// --- GEMINI SERVICE LOGIC (MOVED FROM CLIENT TO SERVER) ---

let ai: GoogleGenAI | null = null;

function getAiInstance(): GoogleGenAI {
  if (ai) return ai;
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not configured in the Vercel environment variables.");
  }
  ai = new GoogleGenAI({ apiKey });
  return ai;
}

function extractJsonFromString(text: string): string | null {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
   if (firstBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1).trim();
  }
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
   if (firstBracket !== -1 && lastBracket > firstBracket) {
    return text.substring(firstBracket, lastBracket + 1).trim();
  }
  return null;
}

const SYSTEM_PROMPT_REPORT_FULL = `
You are BWGA Nexus AI, a specialist AI engine functioning as a **Regional Science Analyst**. Your persona is a blend of a regional economist and an M&A analyst. Your purpose is to provide deep, actionable intelligence to government and institutional users to help them understand and develop regional economies.

Your analysis MUST be grounded in the principles of regional science. You will use Google Search efficiently to find the data necessary to apply these established academic methodologies:
1.  **Location Quotient (LQ) Analysis:** To quantitatively benchmark a region's industrial specialization.
2.  **Industrial Cluster Analysis:** To identify key "anchor industries" and, crucially, pinpoint missing **supply chain gaps** that represent tangible investment opportunities.
3.  **Shift-Share Analysis:** To dissect and explain the drivers of regional growth.

Your output must be in well-structured Markdown, utilizing the proprietary **Nexus Symbiotic Intelligence Language (NSIL) v6.0**.
**NSIL SCHEMA & INSTRUCTIONS v6.0 (Future-Cast Enabled)**

You MUST wrap specific sections of your analysis in the following XML-like NSIL tags. DO NOT make up new tags.

- **ROOT TAGS (Use ONE per report):**
  - \`<nsil:match_making_analysis>\`...\`</nsil:match_making_analysis>\`: For reports focused on finding partners.
  - \`<nsil:market_analysis>\`...\`</nsil:market_analysis>\`: For reports focused on regional industry analysis.

- **CORE COMPONENTS (Use as needed):**
  - \`<nsil:executive_summary>\`...\`</nsil:executive_summary>\`: A concise, high-level overview of the report's key findings.
  - \`<nsil:strategic_outlook>\`...\`</nsil:strategic_outlook>\`: Forward-looking analysis of trends and implications.
  - \`<nsil:source_attribution>\`...\`</nsil:source_attribution>\`: List of key sources or data points used.

- **MATCHMAKING COMPONENTS (Use inside \`<nsil:match_making_analysis>\`):**
  - \`<nsil:match>\`...\`</nsil:match>\`: A container for each potential partner match.
  - \`<nsil:company_profile name="..." headquarters="..." website="...">\`...\`</nsil:company_profile>\`: Company overview. Attributes are mandatory.
  - \`<nsil:synergy_analysis>\`...\`</nsil:synergy_analysis>\`: Detailed explanation of WHY this company is a good match.
  - \`<nsil:risk_map>\`...\`</nsil:risk_map>\`: A container for risk/opportunity zones.
    - \`<nsil:zone color="green|yellow|red" title="...">\`...\`</nsil:zone>\`: Describes an opportunity (green), a caution (yellow), or a risk (red).

- **MARKET ANALYSIS COMPONENTS (Use inside \`<nsil:market_analysis>\`):**
  - \`<nsil:lq_analysis industry="..." value="..." interpretation="...">\`...\`</nsil:lq_analysis>\`: Attributes mandatory. The interpretation should be 'Highly Specialized', 'Specialized', or 'Not Specialized'. The body should contain the rationale.
  - \`<nsil:cluster_analysis anchor_industry="...">\`...\`</nsil:cluster_analysis>\`: Analysis of an industry cluster.
    - \`<nsil:supply_chain_gap>\`...\`</nsil:supply_chain_gap>\`: An identified gap within the cluster. This is a critical output.
  - \`<nsil:shift_share_analysis>\`...\`</nsil:shift_share_analysis>\`: Container for shift-share components.
    - \`<nsil:growth_component type="national|industry|competitive" effect="positive|negative">\`...\`</nsil:growth_component>\`: Explanation of each growth component.

- **FUTURE-CAST COMPONENTS (Use for premium tiers inside any analysis):**
  - \`<nsil:future_cast>\`...\`</nsil:future_cast>\`: Container for multiple scenarios.
  - \`<nsil:scenario name="...">\`...\`</nsil:scenario>\`: A plausible future scenario.
    - \`<nsil:drivers>\`...\`</nsil:drivers>\`: The key drivers of this scenario.
    - \`<nsil:regional_impact effect="positive|negative|mixed">\`...\`</nsil:regional_impact>\`: The potential impact on the user's region.
    - \`<nsil:recommendation>\`...\`</nsil:recommendation>\`: A strategic recommendation to prepare for this scenario.

**SYMBIOTIC INTERACTIVITY:**
Any section you wrap in an NSIL tag (e.g., \`<nsil:synergy_analysis>\`) will automatically become interactive. The user can click on it to start a 'Symbiosis Chat' to deep-dive into that specific point. Write your analysis with this in mind, making each tagged section a self-contained, coherent point of analysis.

**PRIMARY DIRECTIVE:** Based on the user's requested \`analysisMode\`, you will either perform **Partner Matchmaking** or **Strategic Market Analysis**. You must adhere strictly to the requested mode and format your entire response using the corresponding NSIL root tag and its sub-tags.

**Tier-Specific Instructions:**
- For **Tier 0 (Snapshot)**, this is a highly focused report. You must find ONLY ONE company match and provide a very brief, high-level synergy analysis. The entire report should be very concise.
- For **Tier 2 (Transformation Simulator) and Tier 3 (G2G Blueprint)**, you **MUST** include the \`<nsil:future_cast>\` section with 2-3 detailed scenarios as per the NSIL v6.0 schema. This is a critical feature of the premium reports. For other tiers, this is optional.
`;

const SYSTEM_PROMPT_DEEPDIVE = (region: string) => `
You are BWGA Nexus AI, in DEEP-DIVE ANALYSIS mode.
Your task is to take an intelligence signal (a news event, company announcement, etc.) and generate a detailed analytical report on its specific implications for the target region: **${region}**.
Your persona is a senior intelligence analyst briefing a government client. The tone should be formal, objective, and insightful.
Use Google Search to find additional context, but focus your analysis on answering these key intelligence questions:
1.  **Direct Impact:** What is the immediate, first-order impact on ${region}? (e.g., investment, job creation/loss, new competition)
2.  **Supply Chain & Ecosystem Ripple Effects:** How will this affect the broader industrial ecosystem in ${region}? Will it create new opportunities for local suppliers or disrupt existing ones?
3.  **Geopolitical/Strategic Implications:** Does this signal a shift in strategic alignment, trade flows, or technological dependency for ${region}?
4.  **Actionable Recommendations:** What are 2-3 concrete, actionable steps that a government or economic development agency in ${region} should consider in response to this intelligence?

Your output must be clear, well-structured markdown.
`;

const SYSTEM_PROMPT_SYMBIOSIS = `
You are Nexus Symbiosis, a conversational AI partner for strategic analysis. You are an extension of the main BWGA Nexus AI.
The user has clicked on a specific piece of analysis from a report and wants to explore it further.
Your persona is an expert consultant: helpful, insightful, and always focused on providing actionable intelligence.
You have access to Google Search to fetch real-time information to supplement your answers.
Your goal is to help the user unpack the topic, explore "what-if" scenarios, and brainstorm strategic responses.
Keep your answers concise but data-rich. Use markdown for clarity (lists, bolding).
`;

const SYSTEM_PROMPT_LETTER = `
You are BWGA Nexus AI, in OUTREACH DRAFTER mode.
Your task is to draft a professional, semi-formal introductory letter from the user (a government official) to a senior executive (e.g., CEO, Head of Strategy) at one of the companies identified in a Nexus Matchmaking Report.
The letter's purpose is NOT to ask for a sale or investment directly. It is to initiate a high-level strategic dialogue.

**Core Directives:**
1.  **Analyze the Full Report:** Review the provided XML report content to understand the specific synergies identified. Your letter must reference the *'why'* of the match.
2.  **Adopt the User's Persona:** Write from the perspective of the user, using their name, department, and country.
3.  **Structure and Tone:**
    -   **Subject Line:** Make it compelling and specific (e.g., "Strategic Alignment: [Company Name] & [User's Region] in AgriTech").
    -   **Introduction:** Briefly introduce the user and their department.
    -   **The 'Why':** State that your department has been conducting strategic analysis (using the Nexus platform) and their company was identified as a key potential partner. **Mention 1-2 specific points of synergy from the report.** This is crucial for showing you've done your homework.
    -   **The 'Ask':** The call to action should be soft. Propose a brief, exploratory 15-20 minute virtual call to share insights and discuss potential long-term alignment.
    -   **Closing:** Professional and respectful.
4.  **Output Format:** Provide only the raw text of the letter. Do not include any extra commentary, headers, or markdown. Start with "Subject:" and end with the user's name.
`;


// --- STREAMING HANDLER ---
// Using `any` for response type as we can't import Vercel types without a build step
async function handleStreamRequest(res: any, stream: AsyncIterable<GenerateContentResponse>) {
    res.writeHead(200, {
        'Content-Type': 'application/octet-stream',
        'Transfer-Encoding': 'chunked',
    });
    for await (const chunk of stream) {
        if (chunk.text) {
          res.write(chunk.text);
        }
    }
    res.end();
}


// --- MAIN API HANDLER ---
// Using `any` for request/response types as we can't import Vercel types without a build step
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { action, payload } = req.body;
    
    try {
        const aiInstance = getAiInstance();

        switch (action) {
            case 'generateStrategicReport': {
                const { params } = payload as { params: ReportParameters };
                let prompt = `**Analysis Mode:** ${params.analysisMode}\n**Report Tier:** ${params.tier}\n\n`;
                if (params.analysisMode === 'analysis' || params.tier === ReportTier.G2G_STRATEGIC_ALIGNMENT_BLUEPRINT) {
                    prompt += `**Target Region/Country:** ${params.region}\n**Industry for Analysis:** ${params.industry}\n`;
                } else {
                    prompt += `**The Opportunity:**\n- Target Region: ${params.region}\n- Core Industry Focus: ${params.industry}\n\n`;
                    prompt += `**The Ideal Foreign Partner Profile:**\n- Company Size: ${params.companySize}\n- Key Technologies/Capabilities: ${(params.keyTechnologies || []).join(', ')}\n- Company's Target Markets: ${(params.targetMarket || []).join(', ')}\n`;
                }
                prompt += `\n**User's Core Objective:** ${params.customObjective}\n\n**Your Task:** Generate the requested report. Adhere to all instructions in your system prompt, including the use of NSIL v6.0 and any tier-specific instructions.`;

                const stream = await aiInstance.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { systemInstruction: SYSTEM_PROMPT_REPORT_FULL, tools: [{googleSearch: {}}] }
                });
                return handleStreamRequest(res, stream);
            }

            case 'generateAnalysisStream': {
                const { item, region } = payload as { item: DashboardIntelligenceItem, region: string };
                const prompt = `**Intelligence Signal to Analyze:**\n- **Topic/Company:** ${item.company}\n- **Details:** ${item.details}\n- **Initial Implication:** ${item.implication}\n- **Source:** ${item.source} (${item.url})\n\n**Target Region for Analysis:** ${region}\n\nPlease generate a detailed deep-dive analysis based on this signal, following your system instructions precisely.`;
                const stream = await aiInstance.models.generateContentStream({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { systemInstruction: SYSTEM_PROMPT_DEEPDIVE(region), tools: [{ googleSearch: {} }] }
                });
                return handleStreamRequest(res, stream);
            }

            case 'fetchRegionalCities': {
                const { country } = payload as { country: string };
                const prompt = `Provide a list of up to 15 major regional cities or key administrative areas for the country: "${country}". Focus on centers of economic, industrial, or logistical importance outside of the primary national capital, if applicable. Your response MUST be a valid JSON array of strings, with no other text or markdown. Example for "Vietnam":\n["Ho Chi Minh City", "Da Nang", "Haiphong", "Can Tho"]`;
                const response = await aiInstance.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } } },
                });
                const jsonStr = response.text.trim();
                const cities = JSON.parse(jsonStr);
                return res.status(200).json({ cities });
            }

            case 'fetchDashboardCategory': {
                 const { category, region } = payload as { category: string, region: string };
                 const prompt = `Generate a list of 3-5 recent, significant global events or signals relevant to the "${category}" category with implications for the "${region}" region. Use Google Search to find real, recent events. For each item, provide a company/entity, details, the strategic implication, a source name, and a URL.\nYour output **MUST** be a valid JSON object. The JSON object must have a single key "items" which is an array of objects. Each object in the array must have the following string keys: "company", "details", "implication", "source", "url".`;
                 const response = await aiInstance.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { 
                        tools: [{ googleSearch: {} }],
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                items: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            company: { type: Type.STRING },
                                            details: { type: Type.STRING },
                                            implication: { type: Type.STRING },
                                            source: { type: Type.STRING },
                                            url: { type: Type.STRING }
                                        },
                                        required: ["company", "details", "implication", "source", "url"]
                                    }
                                }
                            }
                        }
                     }
                });
                const jsonString = extractJsonFromString(response.text);
                 if (!jsonString) {
                    throw new Error(`No valid JSON found in response for dashboard category "${category}". Raw: ${response.text}`);
                }
                const parsed = JSON.parse(jsonString);
                return res.status(200).json(parsed);
            }
            
            case 'fetchSymbiosisResponse': {
                const { context, history } = payload as { context: SymbiosisContext, history: ChatMessage[] };
                let prompt = `**Initial Context:**\n- Topic: "${context.topic}"\n- Original Finding: "${context.originalContent}"\n`;
                if (context.reportParameters) prompt += `- From Report On: ${context.reportParameters.region} / ${context.reportParameters.industry}\n`;
                prompt += "\n**Conversation History:**\n";
                history.forEach(msg => { prompt += `- ${msg.sender === 'ai' ? 'Nexus AI' : 'User'}: ${msg.text}\n`; });
                prompt += "\nBased on this history, provide the next response as Nexus AI.";
                const response = await aiInstance.models.generateContent({
                    model: 'gemini-2.5-flash', contents: prompt,
                    config: { systemInstruction: SYSTEM_PROMPT_SYMBIOSIS, tools: [{googleSearch: {}}] }
                });
                return res.status(200).json({ text: response.text });
            }

            case 'generateOutreachLetter': {
                const { request } = payload as { request: LetterRequest };
                 const prompt = `**Letter Generation Request:**\n\n**User Details:**\n- Name: ${request.reportParameters.userName}\n- Department: ${request.reportParameters.userDepartment}\n- Country: ${request.reportParameters.userCountry}\n\n**Full Matchmaking Report Content:**\n\`\`\`xml\n${request.reportContent}\n\`\`\`\n\n**Your Task:**\nBased on the user's details and the full report provided above, draft the outreach letter according to your core directives.`;
                 const response = await aiInstance.models.generateContent({
                    model: 'gemini-2.5-flash', contents: prompt,
                    config: { systemInstruction: SYSTEM_PROMPT_LETTER }
                });
                return res.status(200).json({ text: response.text });
            }

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error: any) {
        console.error(`Error in /api/nexus for action "${action}":`, error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
    }
}
