import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real app, never expose API keys on the client. 
// This is for demonstration purposes using the environment variable approach requested.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateFileDescription = async (fileName: string, fileType: string, base64Data?: string): Promise<string> => {
  if (!process.env.API_KEY) return "Configuração da API Key necessária para análise IA.";

  try {
    const model = 'gemini-2.5-flash';
    let prompt = `Analise os metadados deste arquivo: Nome: ${fileName}, Tipo: ${fileType}. Crie uma descrição curta e amigável (máximo 20 palavras) sobre o que este arquivo pode conter.`;

    const parts: any[] = [{ text: prompt }];

    // If it's an image and we have data, add it for multimodal analysis
    if (base64Data && fileType.startsWith('image/')) {
       prompt = "Descreva esta imagem de forma resumida para um gerenciador de arquivos.";
       parts[0] = { text: prompt };
       parts.push({
         inlineData: {
           mimeType: fileType,
           data: base64Data.split(',')[1] // Remove data URL prefix
         }
       });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
    });

    return response.text || "Não foi possível gerar uma descrição.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao analisar arquivo com IA.";
  }
};

export const analyzeSupportTicket = async (message: string): Promise<string> => {
  if (!process.env.API_KEY) return "IA indisponível sem API Key.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Um usuário enviou o seguinte feedback para nossa plataforma de arquivos "Mandei Pegou": "${message}". 
      Responda como um agente de suporte técnico amigável e empático, sugerindo uma solução ou agradecendo o feedback. Mantenha curto (máx 50 palavras).`,
    });
    return response.text || "Obrigado pelo seu contato.";
  } catch (error) {
    console.error("Gemini Support Error:", error);
    return "Erro ao processar suporte via IA.";
  }
};