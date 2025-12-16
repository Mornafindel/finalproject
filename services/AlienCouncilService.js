// services/AlienCouncilService.js
// 负责把“外星议会”的角色设定 + 历史对话，打包给智谱AI API 调用

import { buildApiMessages } from './RoleService';
import { callZhipuApi } from './DataService';

export async function processAlienResponse(userInput) {
  try {
    // 当前只有单轮输入，如需多轮对话，可在这里把前端传来的 history 一并传入
    const history = [
      {
        role: 'user',
        content: userInput
      }
    ];

    // 1. 基于角色设定 + 记忆，构造 messages 数组（包含 system message）
    const { messages } = await buildApiMessages(history);

    // 2. 调用封装好的智谱AI API
    const text = await callZhipuApi({
      messages
    });

    return text || '';
  } catch (err) {
    console.error('Alien Council ZhipuAI Error:', err);
    // 将底层错误信息透传出去，方便前端展示和调试
    throw new Error(err?.message || '[AI系统故障] 核心议会连接中断。');
  }
}

