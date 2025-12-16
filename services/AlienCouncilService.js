// services/AlienCouncilService.js

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 调试：确认环境变量是否加载
console.log('[DEBUG] GEMINI_API_KEY loaded:', !!GEMINI_API_KEY);

async function processAlienResponse(userInput) {
  try {
    // 调用 Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { parts: [{ text: userInput }] }
          ]
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Gemini API response error:', text);
      throw new Error(text);
    }

    const data = await response.json();
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return result;

  } catch (err) {
    console.error('Alien Council Gemini Error:', err);
    throw new Error('[AI系统故障] 核心议会连接中断。');
  }
}

module.exports = { processAlienResponse };
