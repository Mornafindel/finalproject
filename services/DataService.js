// services/AIService.js - 针对 Vercel 部署的最终版本

const { GoogleGenAI } = require('@google/genai'); 

const apiKey = process.env.GEMINI_API_KEY; 
const defaultModel = 'gemini-2.5-flash';

if (!apiKey) {
    console.error("[配置警告] GEMINI_API_KEY 未设置。");
}

// ------------------------------------------------
// 关键点：不再配置 baseURL 或代理
// ------------------------------------------------
const ai = new GoogleGenAI({ 
    apiKey,
    // Vercel 的网络环境可以直接访问 Google API，因此不需要 baseURL 或 proxy 设置。
    // 我们保留超时设置，以防网络偶尔波动。
    requestOptions: {
        timeout: 30000 
    }
});


/**
 * 核心 API 调用函数
 */
async function callGeminiApi({ systemInstruction, contents, temperature = 0.7, model = defaultModel }) {
    
    if (!apiKey) {
        throw new Error("[配置错误] 无法连接 AI 核心：GEMINI_API_KEY 未设置。");
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: temperature,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        // 如果是 ConnectTimeoutError，在 Vercel 上它可能就不会发生了
        throw new Error(`[AI系统故障] 核心议会连接中断。Error: ${error.message}`);
    }
}

module.exports = callGeminiApi;