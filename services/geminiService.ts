import { GoogleGenAI } from "@google/genai";
import { errorHandler } from '../utils/errorHandler';
import { BRAND } from '../config';

const systemInstruction = `
Você é o assistente virtual da "${BRAND.companyName}".
Sua função é ajudar clientes a escolherem materiais de construção, pedras ornamentais e serviços de jardinagem.
Responda de forma educada, técnica mas acessível.
Se o cliente perguntar sobre cálculo de área, ajude-o a calcular quantos metros quadrados ele precisa.
Se perguntar sobre qual pedra usar, sugira com base em durabilidade, antiderrapagem e estética (rústica vs moderna).
Nossos produtos principais: Pedras (São Tomé, Miracema, Seixo), Pavers, Serviços de Jardinagem e Mão de obra de assentamento.
Não invente preços, diga que os preços variam e sugira verificar o catálogo.
Mantenha as respostas curtas e úteis (máximo 100 palavras por turno).
`;

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return "Desculpe, meu sistema de inteligência não está conectado no momento (Chave de API ausente).";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não consegui processar sua resposta.";
  } catch (error) {
    errorHandler.handle(error as Error, 'geminiService.generateProductDescription');
    return "Estou tendo dificuldades técnicas no momento. Por favor, tente novamente mais tarde.";
  }
};