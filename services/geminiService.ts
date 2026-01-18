
import { GoogleGenAI, Modality } from "@google/genai";

// Inicialização segura: assume que process.env.API_KEY está disponível globalmente conforme as instruções.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an explanation for a Bible passage based on 'The Message' translation style.
 */
export const getBibleExplanation = async (book: string, chapter: number, text: string) => {
  const ai = getAI();
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
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Como a Bíblia 'A Mensagem' aborda o seguinte tema ou sentimento: "${query}"? Sugira passagens específicas e explique o porquê.`,
  });
  return response.text;
};

/**
 * Generates a daily devotional inspired by Eugene Peterson's writing style.
 */
export const generateDailyDevotional = async () => {
  const ai = getAI();
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
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Leia calmamente e com ênfase pastoral: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    return decodeBase64(base64Audio);
  } catch (error) {
    console.error("Erro no TTS:", error);
    return null;
  }
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Plays raw PCM audio data.
 */
export const playRawAudio = async (data: Uint8Array) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return source;
};
