
import type { ReportParameters, SymbiosisContext, ChatMessage, LetterRequest, DashboardIntelligence, DashboardIntelligenceItem, ReportTier } from "../types";

// --- API PROXY CALLS ---

async function postToNexusAPI(action: string, payload: any) {
  const response = await fetch('/api/nexus', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      error: `API request failed with status ${response.status}` 
    }));
    throw new Error(errorData.error || 'Failed to fetch data from Nexus API.');
  }
  return response;
}

async function* streamFromNexusAPI(action: string, payload: any): AsyncGenerator<string, void, undefined> {
    const response = await fetch('/api/nexus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`Failed to generate stream: ${response.statusText} - ${errorText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
        }
    } finally {
        reader.releaseLock();
    }
}


// --- API FUNCTIONS ---

export function generateStrategicReport(params: ReportParameters): AsyncGenerator<string, void, undefined> {
  return streamFromNexusAPI('generateStrategicReport', { params });
}


export const generateAnalysisStream = (item: DashboardIntelligenceItem, region: string): AsyncGenerator<string, void, undefined> => {
    return streamFromNexusAPI('generateAnalysisStream', { item, region });
};

export async function fetchSymbiosisResponse(context: SymbiosisContext, history: ChatMessage[]): Promise<string> {
    const response = await postToNexusAPI('fetchSymbiosisResponse', { context, history });
    const { text } = await response.json();
    return text;
}

export async function generateOutreachLetter(request: LetterRequest): Promise<string> {
    const response = await postToNexusAPI('generateOutreachLetter', { request });
    const { text } = await response.json();
    return text;
}


// --- CACHED FUNCTIONS ---

const CITIES_CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function fetchRegionalCities(country: string): Promise<string[]> {
    const cacheKey = `cities_cache_${country}`;

    try {
        const cachedDataString = localStorage.getItem(cacheKey);
        if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString);
            const cacheAge = new Date().getTime() - new Date(cachedData.timestamp).getTime();
            if (cachedData && Array.isArray(cachedData.cities) && cacheAge < CITIES_CACHE_DURATION_MS) {
                return cachedData.cities;
            }
        }
    } catch (e) {
        console.warn("Could not read city cache. Proceeding with API call.", e);
    }
    
    try {
        const response = await postToNexusAPI('fetchRegionalCities', { country });
        const { cities } = await response.json();

        if (!Array.isArray(cities)) throw new Error("API returned non-array data for cities.");

        const dataToCache = { cities, timestamp: new Date().toISOString() };
        localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        return cities;

    } catch (apiError) {
        console.warn(`API call failed for cities in ${country}. Attempting to load from fallback cache.`, apiError);
        
        try {
            const cachedDataString = localStorage.getItem(cacheKey);
            if (cachedDataString) {
                const cachedData = JSON.parse(cachedDataString);
                if (cachedData && Array.isArray(cachedData.cities)) {
                    return cachedData.cities;
                }
            }
        } catch (cacheError) {
            console.error("Failed to read from fallback city cache:", cacheError);
        }
        
        throw new Error(`Could not fetch cities for ${country}. The API service may be unavailable or rate-limited.`);
    }
}


const DASHBOARD_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

export async function fetchDashboardCategory(category: string, region: string): Promise<DashboardIntelligence> {
    const cacheKey = `dashboard_cache_${region}_${category}`;

    try {
        const cachedDataString = localStorage.getItem(cacheKey);
        if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString);
            const cacheAge = new Date().getTime() - new Date(cachedData.timestamp).getTime();
            if (cachedData && cachedData.data && cacheAge < DASHBOARD_CACHE_DURATION_MS) {
                return { 
                    ...cachedData.data, 
                    fromCache: true, 
                    cacheTimestamp: cachedData.timestamp 
                } as DashboardIntelligence;
            }
        }
    } catch (cacheError) {
        console.warn("Could not read or parse proactive cache. Proceeding with API call.", cacheError);
    }
    
    try {
        const response = await postToNexusAPI('fetchDashboardCategory', { category, region });
        const result = await response.json();

        const dataToCache = {
            data: result,
            timestamp: new Date().toISOString()
        };
        try {
            localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
        } catch (cacheError) {
            console.warn("Could not write to localStorage", cacheError);
        }
        return { ...result, fromCache: false, cacheTimestamp: undefined } as DashboardIntelligence;

    } catch (apiError: any) {
        console.warn(`API call failed for ${category} in ${region}. Attempting to load from fallback cache.`, apiError);
        
        try {
            const cachedDataString = localStorage.getItem(cacheKey);
            if (cachedDataString) {
                const cachedData = JSON.parse(cachedDataString);
                if (cachedData && cachedData.data && cachedData.timestamp) {
                    return { 
                        ...cachedData.data, 
                        fromCache: true, 
                        cacheTimestamp: cachedData.timestamp 
                    } as DashboardIntelligence;
                }
            }
        } catch (cacheError) {
            console.error("Failed to read or parse from fallback localStorage:", cacheError);
        }

        throw apiError;
    }
}
