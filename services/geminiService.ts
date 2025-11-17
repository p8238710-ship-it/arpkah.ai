
import { Message } from '../types';

const MEMORY_LIMIT = 50; // Store the last 50 prompts in localStorage
const API_TIMEOUT = 55000; // 55 seconds, must be less than Vercel's maxDuration

async function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal  
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error(`The request timed out after ${API_TIMEOUT / 1000} seconds. The server might be busy. Please try again.`);
        }
        throw error;
    }
}


// This is a generic error handler for our new API proxy.
const handleApiError = async (response: Response): Promise<Error> => {
    try {
        const errorData = await response.json();
        return new Error(errorData.error || 'An unexpected error occurred.');
    } catch (e) {
        return new Error(`An unexpected error occurred (Status: ${response.status}).`);
    }
};

const getMemoryKey = (userName: string): string => `arokah_memory_${userName.toLowerCase().replace(/\s+/g, '_')}`;

const loadMemory = (userName: string): string[] => {
    try {
        const memoryKey = getMemoryKey(userName);
        const storedMemory = localStorage.getItem(memoryKey);
        if (storedMemory) {
            const parsedMemory: { prompts: string[] } = JSON.parse(storedMemory);
            return parsedMemory.prompts || [];
        }
    } catch (error) {
        console.error("Failed to load conversation memory from localStorage:", error);
    }
    return [];
};

const saveMemory = (userName: string, newPrompt: string): void => {
    if (!newPrompt) return;
    try {
        const memoryKey = getMemoryKey(userName);
        const currentPrompts = loadMemory(userName);
        const updatedPrompts = [newPrompt, ...currentPrompts.filter(p => p !== newPrompt)];
        const limitedPrompts = updatedPrompts.slice(0, MEMORY_LIMIT);
        localStorage.setItem(memoryKey, JSON.stringify({ prompts: limitedPrompts }));
    } catch (error) {
        console.error("Failed to save conversation memory to localStorage:", error);
    }
};


export const generateText = async (
    prompt: string, 
    history: Message[], 
    userName: string, 
    searchHistory: string[], 
    preferences: { interests: string[] } | undefined, 
    memories: string[] | undefined,
    model: string
): Promise<{ content: string; suggestions: string[] }> => {
  saveMemory(userName, prompt);
  
  try {
    const response = await fetchWithTimeout('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'generateText',
            payload: { prompt, history, userName, searchHistory, preferences, memories, model }
        })
    });

    if (!response.ok) {
        throw await handleApiError(response);
    }
    return await response.json();

  } catch (error) {
    console.error(`Error generating text:`, error);
    throw error;
  }
};

export const generateTextWithImage = async (
  prompt: string, 
  history: Message[], 
  imageData: { data: string; mimeType: string },
  userName: string, 
  searchHistory: string[],
  preferences: { interests: string[] } | undefined,
  memories: string[] | undefined,
  model: string
): Promise<{ content: string; suggestions: string[] }> => {
  saveMemory(userName, prompt);
  
  try {
     const response = await fetchWithTimeout('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'generateTextWithImage',
            payload: { prompt, history, imageData, userName, searchHistory, preferences, memories, model }
        })
    });

    if (!response.ok) {
        throw await handleApiError(response);
    }
    return await response.json();

  } catch (error) {
    console.error("Error generating text with image:", error);
    throw error;
  }
};


export const generateTextWithSearch = async (
    prompt: string, 
    history: Message[], 
    userName: string, 
    searchHistory: string[], 
    preferences: { interests: string[] } | undefined,
    memories: string[] | undefined,
    model: string
): Promise<{ content: string, sources: { uri: string; title: string }[], suggestions: string[] }> => {
    saveMemory(userName, prompt);
    try {
        const response = await fetchWithTimeout('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'generateTextWithSearch',
                payload: { prompt, history, userName, searchHistory, preferences, memories, model }
            })
        });

        if (!response.ok) {
            throw await handleApiError(response);
        }
        return await response.json();

    } catch (error) {
        console.error("Error generating text with search:", error);
        throw error;
    }
}

export const generateImage = async (prompt: string, model: string): Promise<string> => {
    try {
       const response = await fetchWithTimeout('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'generateImage',
                payload: { prompt, model }
            })
        });

        if (!response.ok) {
            throw await handleApiError(response);
        }
        const { imageUrl } = await response.json();
        return imageUrl;

    } catch (error) {
        console.error("Error generating image:", error);
        throw error;
    }
};
