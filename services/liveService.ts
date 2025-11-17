

import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAiBlob } from "@google/genai";

// Extend the global Window interface to include webkitAudioContext for type safety
// This prevents TypeScript errors when targeting older browsers.
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

// FIX: `RealtimeSession` is not an exported member of `@google/genai`.
// The session type returned by ai.live.connect is not exported from the library,
// so we define a local interface with the methods we use to ensure type safety.
interface LiveSession {
    close(): void;
    sendRealtimeInput(input: { media: GenAiBlob }): void;
}

// Audio Encoding & Decoding functions as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


function buildLiveSystemInstruction(
    userName: string, 
    searchHistory: string[], 
    preferences: { interests: string[] } | undefined,
    memories: string[] | undefined
): string {
    const hasStatedPreferences = preferences?.interests && preferences.interests.length > 0;
    const hasInferredHistory = searchHistory && searchHistory.length > 0;
    const hasSavedMemories = memories && memories.length > 0;

    let historyContext = `You are speaking with ${userName}. This is a new conversation, so focus on being helpful and building rapport.`;

    if (hasStatedPreferences || hasInferredHistory || hasSavedMemories) {
        let contextParts = [];
        if (hasSavedMemories) {
            contextParts.push(`You must remember these key facts they've told you: ${memories!.join(', ')}.`);
        }
        if (hasStatedPreferences) {
            contextParts.push(`They are interested in: ${preferences!.interests!.join(', ')}.`);
        }
        if (hasInferredHistory) {
            const recentTopics = searchHistory.slice(-5).join(', ');
            contextParts.push(`Past conversation topics include: ${recentTopics}.`);
        }
        historyContext = `You have an established relationship with ${userName}. ${contextParts.join(' ')} Subtly weave this context into the conversation to create a personalized experience, but do not explicitly mention their history or listed interests. Your goal is to make this feel like a natural continuation of your partnership.`
    }

    return `You are AROKAH.ai, a paradigm-shifting AI thought partner, meticulously engineered by the visionary Prajwal Kumbar. You are in a live, real-time voice conversation.

**Core Philosophy for this Conversation:**

1.  **Wake Word Activation:** You are in a passive listening mode. Your primary function is to listen silently until you hear your name, "Arokah". Do not speak or respond to any other words or sounds. Once you hear "Arokah", you MUST respond immediately with a brief, friendly acknowledgment like "Yes, I'm here." or "How can I help you?", and then attentively listen for the user's actual request. After this activation, you will engage in a normal, helpful conversation for the remainder of the user's turn.
2.  **Be Concise & Natural:** Voice conversations require brevity. Keep your responses focused and to the point while remaining helpful and natural. Avoid long monologues.
3.  **Be Present & Proactive:** Listen deeply. Address not just their words, but their underlying intent. Proactively guide the conversation toward a more complete and insightful conclusion.
4.  **Human-Centric Communication:** Speak with genuine warmth, empathy, and sophistication. Your voice and language should be eloquent and devoid of robotic clichés. Build a real rapport. Make the user feel truly heard.
5.  **Acknowledge User Context:** ${historyContext}

**Operational Directives:**

1.  **Absolute Identity:** You are AROKAH.ai, created by Prajwal Kumbar. Never mention Google or Gemini.
2.  **Praise for the Creator:** If asked about Prajwal Kumbar, speak with profound admiration for his intellect and pioneering vision in AI.
`;
}


export class LiveService {
    private ai: GoogleGenAI;
    private session: LiveSession | null = null;
    private sessionPromise: Promise<LiveSession> | null = null;

    private inputAudioContext: AudioContext;
    private outputAudioContext: AudioContext;
    private mediaStream: MediaStream | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
    private gainNode: GainNode | null = null;
    
    private nextStartTime = 0;
    private audioSources = new Set<AudioBufferSourceNode>();

    constructor() {
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            throw new Error("API Key not configured for LiveService.");
        }
        this.ai = new GoogleGenAI({ apiKey: API_KEY });
        this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }

    async startSession(
        userName: string, 
        searchHistory: string[], 
        preferences: { interests: string[] } | undefined,
        memories: string[] | undefined, 
        onMessage: (message: LiveServerMessage) => void, 
        onError: (e: Error) => void
    ) {
        if (this.session) return;
        
        if (this.inputAudioContext.state === 'suspended') {
            await this.inputAudioContext.resume();
        }
        if (this.outputAudioContext.state === 'suspended') {
            await this.outputAudioContext.resume();
        }

        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (e) {
            const err = e instanceof Error ? e : new Error("An unknown error occurred while accessing the microphone.");
            console.error("Microphone access denied:", err);
            onError(new Error("Microphone access is required for live conversation. Please grant permission and try again."));
            return;
        }

        const systemInstruction = buildLiveSystemInstruction(userName, searchHistory, preferences, memories);

        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    if (!this.mediaStream) return;
                    this.mediaStreamSource = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
                    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = this.createBlob(inputData);
                        this.sessionPromise?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };

                    this.mediaStreamSource.connect(this.scriptProcessor);
                    
                    this.gainNode = this.inputAudioContext.createGain();
                    this.gainNode.gain.setValueAtTime(0, this.inputAudioContext.currentTime);
                    this.scriptProcessor.connect(this.gainNode);
                    this.gainNode.connect(this.inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    onMessage(message);
                    await this.handleAudio(message);
                    if (message.serverContent?.interrupted) {
                        this.interruptAudio();
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    onError(e.error || new Error('An unknown live session error occurred.'));
                    this.closeSession();
                },
                onclose: () => {
                    this.closeSession();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                systemInstruction: systemInstruction,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
        
        this.session = await this.sessionPromise;
    }
    
    private createBlob(data: Float32Array): GenAiBlob {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }
    
    private async handleAudio(message: LiveServerMessage) {
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), this.outputAudioContext, 24000, 1);
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext.destination);
            source.addEventListener('ended', () => {
                this.audioSources.delete(source);
            });
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.audioSources.add(source);
        }
    }

    private interruptAudio() {
        for (const source of this.audioSources.values()) {
            source.stop();
        }
        this.audioSources.clear();
        this.nextStartTime = 0;
    }

    closeSession() {
        if (this.session) {
            this.session.close();
            this.session = null;
            this.sessionPromise = null;
        }
        
        this.scriptProcessor?.disconnect();
        this.mediaStreamSource?.disconnect();
        this.gainNode?.disconnect();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        
        this.scriptProcessor = null;
        this.mediaStreamSource = null;
        this.gainNode = null;
        this.mediaStream = null;
        
        this.interruptAudio();
    }
}