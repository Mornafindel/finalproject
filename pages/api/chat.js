// pages/api/chat.js

import { processAlienResponse } from '../../services/AlienCouncilService';
import {
  shouldExitByUser,
  preProcessUserInput,
  postProcessAiResponse,
  shouldExitByAi
} from '../../services/LogicService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (shouldExitByUser(message)) {
      return res.status(200).json({
        reply: '【通信终止】外星议会已结束本次观测。'
      });
    }

    const processedInput = preProcessUserInput(message);

    const alienResult = await processAlienResponse(processedInput);

    // processAlienResponse 现在直接返回文本字符串
    const finalReply = postProcessAiResponse(alienResult);

    if (shouldExitByAi(finalReply)) {
      return res.status(200).json({
        reply: finalReply,
        exit: true
      });
    }

    return res.status(200).json({
      reply: finalReply
    });
  } catch (error) {
    console.error('Critical API Process Error:', error);
    // 在 Vercel 上，错误信息会出现在 Function Logs 中
    // 这里返回详细的错误信息给前端，方便调试
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
