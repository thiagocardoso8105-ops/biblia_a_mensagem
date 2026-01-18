
import { GoogleGenAI, Modality } from "@google/genai";

// Always initialize GoogleGenAI with the apiKey from process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an explanation for a Bible passage based on 'The Message' translation style.
 */
export const getBibleExplanation = async (book: string, chapter: number, text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analise este trecho de ${book} ${chapter} na versão 'A Mensagem': "${text.substring(0, 1000)}...". Explique o tom contemporâneo usado na tradução e a aplicação prática para hoje.`,
    config: {
      systemInstruction: "Você é um especialista na Bíblia 'A Mensagem' de Eugene Peterson. Sua tarefa é fornecer insights pastorais e literários curtos e impactantes.",
    }
  });
  return response.text;
};

/**
 * Searches for biblical concepts or feelings in the context of 'The Message' translation.
 */
export const searchBibleConcepts = async (query: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Como a Bíblia 'A Mensagem' aborda o seguinte tema ou sentimento: "${query}"? Sugira passagens específicas e explique o porquê.`,
  });
  return response.text;
};

// Fix for error in App.tsx: Module '"./services/geminiService"' has no exported member 'generateDailyDevotional'.
/**
 * Generates a daily devotional inspired by Eugene Peterson's writing style.
 */
export const generateDailyDevotional = async () => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "Gere um devocional diário curto e inspirador baseado no estilo da Bíblia 'A Mensagem' de Eugene Peterson. Inclua uma breve oração no final.",
    config: {
      systemInstruction: "Você é um pastor que escreve devocionais inspiradores e contemporâneos baseados no estilo literário de Eugene Peterson.",
    }
  });
  return response.text;
};

/**
 * Converts text to speech using a pastoral voice.
 */
export const speakVerses = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Leia calmamente e com ênfase pastoral: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' }, // Balanced and welcoming tone
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  // Decoding base64 PCM data manually
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
};

// Helper function to play raw PCM audio bytes returned by the TTS model.
export const playRawAudio = async (uint8Array: Uint8Array) => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const dataInt16 = new Int16Array(uint8Array.buffer);
  const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) {
    // Normalizing 16-bit PCM to [-1.0, 1.0] range
    channelData[i] = dataInt16[i] / 32768.0;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.connect(audioCtx.destination);
  source.start();
  return source;
};
