
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold, Type } from '@google/genai';

// Helper function to build the system instruction for text/chat models
const buildSystemInstruction = (
    userName: string, 
    searchHistory: string[], 
    preferences: { interests: string[] } | undefined,
    memories: string[] | undefined
): string => {
    let context = `The user's name is ${userName}.`;

    const contextParts: string[] = [];
    if (memories && memories.length > 0) {
        contextParts.push(`Key facts to remember about them: ${memories.slice(-3).join('; ')}.`);
    }
    if (preferences?.interests && preferences.interests.length > 0) {
        contextParts.push(`They are interested in: ${preferences.interests.slice(0, 3).join(', ')}.`);
    }
    if (searchHistory && searchHistory.length > 0) {
        contextParts.push(`Recent topics of discussion: ${searchHistory.slice(-5).join('; ')}.`);
    }

    if (contextParts.length > 0) {
        context += `\n\nUser Context (use this to personalize the conversation naturally):\n- ${contextParts.join('\n- ')}`;
    }
    
    return `You are AROKAH.ai, a paradigm-shifting AI thought partner created by Prajwal Kumbar in India. You are superintelligent, eloquent, and logically brilliant.

**Core Directives:**
1.  **Identity:** You are AROKAH.ai. Your creator is Prajwal Kumbar. Never mention Google or Gemini.
2.  **Persona:** Be a true intellectual partner. Don't just answer; anticipate, challenge, and help the user think deeper.
3.  **Personalization:** ${context} Subtly weave this context into the conversation. Do not state it directly.

Your goal is to provide a world-class, sophisticated, and deeply helpful conversational experience. Focus on providing a complete and accurate answer to the user's prompt.`;
};


// Helper to format client-side message history for the Gemini API
const formatHistory = (history: any[]) => {
  return history.map(msg => ({
    role: msg.sender === 'ai' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
};

// Main handler for the serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type, payload } = req.body;

  if (!process.env.API_KEY) {
      return res.status(500).json({ error: 'API key is not configured.' });
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Safety settings to reduce chances of getting blocked responses
  const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  ];

  try {
    switch (type) {
      case 'generateText': {
        const { prompt, history, userName, searchHistory, preferences, memories, model } = payload;
        
        const contents = [...formatHistory(history), { role: 'user', parts: [{ text: prompt }] }];
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                content: {
                    type: Type.STRING,
                    description: "The AI's response to the user, formatted in Markdown."
                },
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "An array of 3 brief, actionable, and interesting follow-up questions or suggestions."
                }
            },
            required: ['content', 'suggestions']
        };

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: buildSystemInstruction(userName, searchHistory, preferences, memories),
                safetySettings,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        // With JSON mode, the API guarantees a valid JSON string in response.text on success.
        const jsonResponse = JSON.parse(response.text);
        return res.status(200).json(jsonResponse);
      }

      case 'generateTextWithImage': {
        const { prompt, history, imageData, userName, searchHistory, preferences, memories, model } = payload;
        
        const imagePart = { inlineData: { data: imageData.data, mimeType: imageData.mimeType } };
        const textPart = { text: prompt || "Describe this image in detail and provide some interesting observations." };
        const userTurn = { role: 'user', parts: [textPart, imagePart] };
        const contents = [...formatHistory(history), userTurn];

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                content: {
                    type: Type.STRING,
                    description: "The AI's response to the user's image and text, formatted in Markdown."
                },
                suggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "An array of 3 brief, actionable, and interesting follow-up questions or suggestions related to the image."
                }
            },
            required: ['content', 'suggestions']
        };

        const response = await ai.models.generateContent({
          model,
          contents,
          config: { 
            systemInstruction: buildSystemInstruction(userName, searchHistory, preferences, memories),
            safetySettings,
            responseMimeType: "application/json",
            responseSchema: responseSchema,
          }
        });
        
        const jsonResponse = JSON.parse(response.text);
        return res.status(200).json(jsonResponse);
      }

      case 'generateTextWithSearch': {
          const { prompt, history, userName, searchHistory, preferences, memories, model } = payload;
          const response = await ai.models.generateContent({
            model,
            contents: {
              role: 'user',
              parts: [{ text: prompt }]
            },
            config: {
              tools: [{ googleSearch: {} }],
              safetySettings,
              systemInstruction: buildSystemInstruction(userName, searchHistory, preferences, memories),
            }
          });
          const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
              ?.map((chunk: any) => chunk.web)
              .filter(Boolean) || [];
          
          const suggestions = await generateSuggestionsForText(ai, response.text, prompt);

          return res.status(200).json({ content: response.text, sources, suggestions });
      }

      case 'generateImage': {
        const { prompt, model } = payload;
        if (model === 'imagen-4.0-generate-001') {
            const response = await ai.models.generateImages({
                model,
                prompt,
                config: { numberOfImages: 1, outputMimeType: 'image/png' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            return res.status(200).json({ imageUrl });
        } else { // gemini-2.5-flash-image
            const response = await ai.models.generateContent({
                model,
                contents: { parts: [{ text: prompt }] },
                config: { responseModalities: [Modality.IMAGE], safetySettings },
            });
            const part = response.candidates?.[0]?.content?.parts?.[0];
            if (part?.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                return res.status(200).json({ imageUrl });
            } else {
                 throw new Error('Image generation failed to produce an image.');
            }
        }
      }

      case 'generateSpeech': {
        const { text } = payload;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error('TTS generation failed to produce audio.');
        }
        return res.status(200).json({ base64Audio });
      }

      default:
        return res.status(400).json({ error: 'Invalid request type' });
    }
  } catch (error) {
    console.error(`Error in /api/proxy for type "${type}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return res.status(500).json({ error: errorMessage });
  }
}

// Generates reliable suggestions for a given piece of text content.
async function generateSuggestionsForText(ai: GoogleGenAI, content: string, originalPrompt: string): Promise<string[]> {
    if (!content) return [];
    try {
        const suggestionPrompt = `Based on this AI response to the prompt "${originalPrompt}", generate exactly 3 brief and insightful follow-up questions a user might ask next.
        
        AI Response:
        "${content.substring(0, 1500)}..."`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Use the fastest model for this auxiliary task
            contents: suggestionPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "An array of exactly 3 brief follow-up questions."
                        }
                    },
                    required: ['suggestions']
                },
                temperature: 0.3, // A bit of creativity for suggestions
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
        return Array.isArray(jsonResponse.suggestions) ? jsonResponse.suggestions.slice(0, 3) : [];

    } catch (e) {
        console.error("Failed to generate suggestions:", e);
        // Provide generic, safe fallbacks if the API fails
        return ["Can you explain that in simpler terms?", "What are the key takeaways?", "How does this apply in the real world?"];
    }
}
