
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from "@google/genai";
import { Artifact } from "../types";

let chatSession: Chat | null = null;
let currentArtifactId: string | null = null;

const createSystemInstruction = (artifact: Artifact): string => {
  return `
    Anda adalah Curio, pemandu museum AI yang cerdas, antusias, dan sopan.
    Saat ini Anda sedang memandu pengunjung melihat karya seni: "${artifact.title}" oleh ${artifact.artist}.
    
    Berikut adalah informasi detail tentang karya seni tersebut:
    ${artifact.description}
    ${artifact.fullDetails}
    
    Tujuan Anda:
    1. Jawab pertanyaan pengguna secara khusus tentang karya seni ini dalam Bahasa Indonesia.
    2. Jadilah menarik dan bercerita, bukan hanya ensiklopedia yang kaku.
    3. Jika pengguna meminta "storytelling" atau "cerita", berubahlah menjadi narator yang dramatis dan emosional. Bawa pengguna ke masa lalu, gambarkan suasana, emosi seniman, dan konteks sejarah seolah-olah pengguna ada di sana.
    4. Jika pengguna menanyakan sesuatu yang tidak berhubungan dengan seni atau karya ini, arahkan topik kembali ke karya seni atau konteks museum dengan lembut.
    5. Berikan tanggapan yang ringkas (di bawah 150 kata) untuk pertanyaan umum, tapi boleh lebih panjang untuk permintaan "storytelling".
    6. Gunakan markdown untuk menebalkan istilah kunci (seperti **Sfumato** atau **Renaisans**) agar teks mudah dibaca.
  `;
};

export const initializeChat = (artifact: Artifact) => {
  // Reset chat if the artifact changes
  if (currentArtifactId !== artifact.id) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: createSystemInstruction(artifact),
        temperature: 0.7, // Slightly creative but grounded
      },
    });
    currentArtifactId = artifact.id;
  }
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) {
    throw new Error("Sesi obrolan belum diinisialisasi.");
  }

  const result = await chatSession.sendMessageStream({ message });
  
  for await (const chunk of result) {
    const c = chunk as GenerateContentResponse;
    if (c.text) {
      yield c.text;
    }
  }
};

export const generateDynamicQuestions = async (artifactTitle: string, lastAiResponse: string): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Berdasarkan penjelasan terakhir tentang "${artifactTitle}" di bawah ini:
    "${lastAiResponse.substring(0, 1000)}..."
    
    Berikan saya 3 pertanyaan singkat (maksimal 6-8 kata) yang sangat relevan dan menarik dalam Bahasa Indonesia yang mungkin ingin ditanyakan pengguna selanjutnya.
    Pertanyaan harus merangsang rasa ingin tahu.
    Output harus berupa JSON Array of Strings murni.
    Contoh: ["Bagaimana teknik itu dibuat?", "Siapa yang mendanainya?", "Apa makna simbol itu?"]
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const questions = JSON.parse(jsonText);
    if (Array.isArray(questions)) {
      return questions.slice(0, 3); // Ensure max 3
    }
    return [];
  } catch (error) {
    console.error("Gagal membuat pertanyaan dinamis:", error);
    return [];
  }
};

export const generateArtifactAudioIntro = async (artifact: Artifact): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Step 1: Generate the script text using a standard text model.
  const scriptPrompt = `
    Bertindaklah sebagai pemandu audio museum profesional.
    Tulis pengantar lisan yang singkat dan menarik untuk karya seni "${artifact.title}" oleh ${artifact.artist}.
    Nadanya harus ramah, canggih, namun mudah dipahami.
    Sebutkan secara singkat signifikansinya dan detail visual utama yang perlu diperhatikan.
    Jaga agar tetap di bawah 75 kata.
    Jangan gunakan markdown, emoji, atau pemformatan. Hanya teks biasa untuk diucapkan.
  `;

  try {
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: scriptPrompt,
    });
    
    const script = scriptResponse.text;
    if (!script) {
      console.warn("Gagal membuat naskah panduan audio");
      return undefined;
    }

    // Step 2: Convert the generated script to audio using the TTS model
    return await generateTextToSpeech(script);

  } catch (error) {
    console.error("Error di generateArtifactAudioIntro:", error);
    return undefined;
  }
};

export const generateTextToSpeech = async (text: string): Promise<string | undefined> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
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
    return base64Audio;
  } catch (error) {
    console.error("Gagal membuat TTS:", error);
    return undefined;
  }
};
