import { GoogleGenAI } from "@google/genai";
import { errorHandler } from '../utils/errorHandler';
import { BRAND } from '../config';
import { Product } from '../types';

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

// Helper to convert File to GenerativePart
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const getGeminiResponse = async (userMessage: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Accessing via Vite env
    if (!apiKey) {
      return "Desculpe, meu sistema de inteligência não está conectado no momento (Chave de API ausente).";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          parts: [{ text: userMessage }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Desculpe, não consegui processar sua resposta.";
  } catch (error) {
    errorHandler.handle(error as Error, 'geminiService.getGeminiResponse');
    return "Estou tendo dificuldades técnicas no momento. Por favor, tente novamente mais tarde.";
  }
};

export const verifyImageEnvironment = async (imageFile: File): Promise<{ valid: boolean; category: string; reason: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `Analise esta imagem e determine se é um ambiente adequado para aplicação de pedras ornamentais, piscinas, calçadas, jardins ou paisagismo.
    Retorne APENAS um JSON no seguinte formato:
    {
      "valid": boolean, // true se for garagem, jardim, quintal, fachada, piscina, área interna reformável. false se for foto de pessoa, carro, comida, meme, etc.
      "category": string, // ex: "Jardim", "Piscina", "Garagem", "Fachada", "Indefinido"
      "reason": string // breve explicação em pt-br
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ]
    });

    const responseText = response.text || "";
    
    // Clean code blocks if present
    const cleanJson = responseText.replace(/```json|```/g, '').trim();
    // Verify if cleanJson is empty or invalid
    if (!cleanJson) return { valid: false, category: "Erro", reason: "Falha na resposta da IA." };

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Erro na verificação da imagem:", error);
    return { valid: false, category: "Erro", reason: "Falha ao processar imagem." };
  }
};

export const analyzeImageWithProducts = async (imageFile: File, selectedProducts: Product[]): Promise<string> => {
   try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key missing");

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = await fileToGenerativePart(imageFile);
    
    const productList = selectedProducts.map(p => `- ${p.name} (${p.category}): ${p.usage}`).join('\n');

    const prompt = `O cliente enviou esta foto do ambiente dele e selecionou os seguintes produtos do nosso catálogo:
    ${productList}

    Aja como um consultor especialista da EcoJardim & Pedras.
    1. Analise o ambiente da foto (iluminação, cores, estilo atual).
    2. Sugira como os produtos selecionados podem ser aplicados neste ambiente específico para valorizá-lo.
    3. Dê dicas de instalação ou combinação considerando o que você vê na imagem.
    4. Seja encorajador e profissional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            imagePart
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction
      }
    });

    return response.text || "Não foi possível realizar a análise detalhada no momento.";

  } catch (error) {
    errorHandler.handle(error as Error, 'geminiService.analyzeImageWithProducts');
    return "Não foi possível realizar a análise detalhada no momento.";
  }
}