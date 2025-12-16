// services/DataService.js - 智谱AI (ZhipuAI) API 封装

const apiKey = process.env.ZHIPU_API_KEY;
const defaultModel = 'glm-4-flash';

if (!apiKey) {
  console.error('[配置警告] ZHIPU_API_KEY 未设置。');
}

/**
 * 核心 API 调用函数 - 调用智谱AI
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
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
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

    // 智谱AI 返回格式：{ choices: [{ message: { content: "..." } }] }
    const text = data?.choices?.[0]?.message?.content || '';

    if (!text) {
      throw new Error('ZhipuAI 返回内容为空或无法解析。');
    }

    return text;
  } catch (error) {
    console.error('ZhipuAI API Error:', error);
    throw new Error(`[AI系统故障] 核心议会连接中断。Error: ${error.message}`);
  }
}
