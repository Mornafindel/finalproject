// services/AlienCouncilService.js
// 负责把“外星议会”的角色设定 + 历史对话，打包给智谱AI API 调用

import { buildApiMessages, buildThoughtGenerationMessages, buildReplyGenerationMessages } from './RoleService';
import { callZhipuApi } from './DataService';

/**
 * 第一步：生成思维解构
 */
export async function generateThoughts(userInput, thoughtsHistory = []) {
  try {
    const { messages } = await buildThoughtGenerationMessages(userInput, thoughtsHistory);
    const text = await callZhipuApi({ messages });
    return text || '';
  } catch (err) {
    console.error('Thought Generation Error:', err);
    throw new Error(err?.message || '[AI系统故障] 思维解构模块连接中断。');
  }
}

/**
 * 第二步：基于思维解构生成正式回复
 */
export async function generateReply(userInput, thoughts, thoughtsHistory = []) {
  try {
    const { messages } = await buildReplyGenerationMessages(userInput, thoughts, thoughtsHistory);
    console.log('[DEBUG] Reply generation messages:', JSON.stringify(messages, null, 2));
    const text = await callZhipuApi({ messages });
    console.log('[DEBUG] Reply generation result length:', text?.length || 0);
    console.log('[DEBUG] Reply generation result preview:', text?.substring(0, 200) || 'EMPTY');
    return text || '';
  } catch (err) {
    console.error('Reply Generation Error:', err);
    throw new Error(err?.message || '[AI系统故障] 正式回复模块连接中断。');
  }
}

/**
 * 两步生成：先思维解构，再正式回复
 */
export async function processAlienResponse(userInput, thoughtsHistory = []) {
  try {
    // 第一步：生成思维解构
    const thoughts = await generateThoughts(userInput, thoughtsHistory);

    // 第二步：基于思维解构生成正式回复
    const reply = await generateReply(userInput, thoughts, thoughtsHistory);

    return {
      thoughts: thoughts.trim(),
      reply: reply.trim()
    };
  } catch (err) {
    console.error('Alien Council ZhipuAI Error:', err);
    throw new Error(err?.message || '[AI系统故障] 核心议会连接中断。');
  }
}

