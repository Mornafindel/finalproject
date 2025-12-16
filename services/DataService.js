// services/DataService.js - QnAIGC（OpenAI 兼容）API 封装

const apiKey = process.env.ZHIPU_API_KEY;
// 根据你的需求可调整模型名称（这里示例写一个常见 OpenAI 兼容模型名）
const defaultModel = 'gpt-3.5-turbo';

if (!apiKey) {
  console.error('[配置警告] ZHIPU_API_KEY 未设置。');
}

/**
 * 核心 API 调用函数 - 调用 QnAIGC OpenAI 兼容接口
 * @param {Object} params
 * @param {Array} params.messages - OpenAI 兼容格式的消息数组 [{ role: 'system'|'user'|'assistant', content: '...' }]
 * @param {number} params.temperature - 温度参数，默认 0.7
 * @param {string} params.model - 模型名称，默认 'glm-4-flash'
 */
export async function callZhipuApi({
  messages,
  temperature = 0.7,
  model = defaultModel
}) {
  if (!apiKey) {
    throw new Error('[配置错误] 无法连接 AI 核心：ZHIPU_API_KEY 未设置。');
  }

  try {
    const url = 'https://api.qnaigc.com/v1/chat/completions';
    
    const body = {
      model,
      messages,
      temperature
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ZhipuAI HTTP Error:', response.status, errorText);
      throw new Error(`ZhipuAI HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    // OpenAI 兼容返回格式：{ choices: [{ message: { content: "..." } }] }
    const text = data?.choices?.[0]?.message?.content || '';

    if (!text) {
      throw new Error('QnAIGC 返回内容为空或无法解析。');
    }

    return text;
  } catch (error) {
    console.error('QnAIGC API Error:', error);
    throw new Error(`[AI系统故障] 核心议会连接中断。Error: ${error.message}`);
  }
}
