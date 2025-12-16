// services/DataService.js - 针对 Vercel 部署的 Gemini JS SDK 封装

const apiKey = process.env.GEMINI_API_KEY;
// 使用 REST API 需要完整的模型路径：models/模型名
const defaultModel = 'models/gemini-1.5-flash';

if (!apiKey) {
  console.error('[配置警告] GEMINI_API_KEY 未设置。');
}

/**
 * 核心 API 调用函数
 */
export async function callGeminiApi({
  systemInstruction,
  contents,
  temperature = 0.7,
  model = defaultModel
}) {
  if (!apiKey) {
    throw new Error('[配置错误] 无法连接 AI 核心：GEMINI_API_KEY 未设置。');
  }

  try {
    // 组合符合 Gemini REST API 的请求结构
    const body = {
      contents,
      systemInstruction: systemInstruction
        ? {
            role: 'system',
            parts: [{ text: systemInstruction }]
          }
        : undefined,
      generationConfig: {
        temperature
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini HTTP Error:', response.status, errorText);
      throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('') || '';

    if (!text) {
      throw new Error('Gemini 返回内容为空或无法解析。');
    }

    return text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    // 如果是 ConnectTimeoutError，在 Vercel 上它可能就不会发生了
    throw new Error(`[AI系统故障] 核心议会连接中断。Error: ${error.message}`);
  }
}
