
/**
 * Generates speech from text by calling our secure serverless proxy.
 * @param text The text content to convert to speech.
 * @returns A promise that resolves to a base64 encoded audio string.
 */
export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'generateSpeech',
                payload: { text }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate speech.");
        }

        const { base64Audio } = await response.json();
        if (!base64Audio) {
            throw new Error("No audio data found in the TTS response.");
        }
        return base64Audio;

    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech. Please check the console for details.");
    }
};
