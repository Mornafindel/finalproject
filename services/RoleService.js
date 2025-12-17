import roleConfig from '../config/roleConfig.json';
import memory from '../config/memory.json';

export async function buildApiMessages(history) {
  // 1. 获取系统核心指令
  const systemMessage = {
    role: 'system',
    content: `${roleConfig.baseSystemInstruction}\n\n当前观测目标状态：${roleConfig.personalityAndContext.worldView}\n通信协议：${roleConfig.personalityAndContext.informationProtocol}\n语言风格指南：${roleConfig.personalityAndContext.languageStyle}`
  };

  // 2. 将 memory.json 里的例子转化为 AI 的“少样本学习” (Few-shot)
  // 这能确保 AI 模仿 memory 里的提问风格
  const fewShotMessages = [];
  memory.forEach(item => {
    fewShotMessages.push({ role: 'user', content: item.userInput });
    fewShotMessages.push({ role: 'assistant', content: item.assistantReply });
  });

  // 3. 组合最终发送给智谱 AI 的数组
  // 结构：System Prompt + 记忆案例 + 当前对话历史
  const messages = [
    systemMessage,
    ...fewShotMessages,
    ...history
  ];

  return { messages };
}