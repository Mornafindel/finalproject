import roleConfig from '../config/roleConfig.json';
import memory from '../config/memory.json';

export async function buildApiMessages(history) {
    // 使用 ?. 确保即使 JSON 结构不对也不会崩溃
    const ctx = roleConfig.personalityAndContext || {};
    
    const systemMessage = {
      role: 'system',
      content: [
        roleConfig.baseSystemInstruction || "你是一个高维观测者。",
        `当前观测目标状态：${ctx.worldView || "形态分析中"}`,
        `通信协议：${ctx.informationProtocol || "非线性交互"}`,
        `语言风格指南：${ctx.languageStyle || "异质化语序"}`
      ].join('\n')
    };
  
    // 2. 这里的 memory 也要加个保护，万一 memory.json 是空的或者格式不对
    const fewShotMessages = [];
    if (Array.isArray(memory)) {
      memory.forEach(item => {
        fewShotMessages.push({ role: 'user', content: item.userInput });
        fewShotMessages.push({ role: 'assistant', content: item.assistantReply });
      });
    }
  
    // ... 后面逻辑不变 ...
  
  // 3. 组合最终发送给智谱 AI 的数组
  // 结构：System Prompt + 记忆案例 + 当前对话历史
  const messages = [
    systemMessage,
    ...fewShotMessages,
    ...history
  ];

  return { messages };
}