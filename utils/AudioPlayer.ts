/**
 * Decodes a base64 string into a Uint8Array.
 * @param base64 The base64 encoded string.
 * @returns The decoded byte array.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into a playable AudioBuffer.
 * This is necessary as the Gemini API returns raw audio streams, not standard file formats.
 * @param data The raw audio data as a Uint8Array.
 * @param ctx The AudioContext to use for decoding.
 * @returns A promise that resolves to an AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  const sampleRate = 24000; // The TTS model returns audio at a 24000 sample rate.
  const numChannels = 1;
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

export class AudioPlayer {
    private audioContext: AudioContext;
    private sourceNode: AudioBufferSourceNode | null = null;

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 24000,
        });
    }

    /**
     * Plays audio from a base64 encoded string.
     * @param base64Audio The base64 audio data.
     * @param onEnded A callback function to execute when playback finishes.
     */
    public async play(base64Audio: string, onEnded: () => void): Promise<void> {
        this.stop(); // Stop any currently playing audio.

        try {
            // Resume audio context if it's suspended (e.g., due to browser policy)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, this.audioContext);
            
            this.sourceNode = this.audioContext.createBufferSource();
            this.sourceNode.buffer = audioBuffer;
            this.sourceNode.connect(this.audioContext.destination);
            
            this.sourceNode.onended = () => {
                onEnded();
                this.sourceNode = null; // Clean up the source node after playback.
            };

            this.sourceNode.start();
        } catch (error) {
            console.error("Failed to play audio:", error);
            onEnded(); // Ensure state is cleaned up even on error.
        }
    }

    /**
     * Stops the currently playing audio track, if any.
     */
    public stop(): void {
        if (this.sourceNode) {
            this.sourceNode.onended = null; // Prevent onEnded from firing on manual stop.
            this.sourceNode.stop();
            this.sourceNode = null;
        }
    }
}
