// pages/api/reflection.js
import { buildReflectionMessages } from '../../services/RoleService';
import { callZhipuApi } from '../../services/DataService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { thoughtsHistory, totalThoughtsCount } = req.body;

    if (!thoughtsHistory || !Array.isArray(thoughtsHistory)) {
      return res.status(400).json({ error: 'Thoughts history is required and must be an array' });
    }

    // 构建反思消息
    const { messages } = await buildReflectionMessages(thoughtsHistory, totalThoughtsCount);

    // 调用AI生成反思
    const reflection = await callZhipuApi({ messages });

    return res.status(200).json({
      reflection: reflection?.trim() || '反思生成失败'
    });

  } catch (error) {
    console.error('Reflection API Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
      reflection: '反思过程中发生错误'
    });
  }
}
