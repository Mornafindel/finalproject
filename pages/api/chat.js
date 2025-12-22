// pages/api/chat.js
import { processAlienResponse } from '../../services/AlienCouncilService';
import {
  shouldExitByUser,
  preProcessUserInput,
  postProcessAiResponse,
  shouldExitByAi
} from '../../services/LogicService';
import * as fs from 'fs/promises';
import path from 'path';

const OBSERVATION_LOG_PATH = path.join(process.cwd(), 'config', 'observationLog.json');

async function updateObservationArchive(alienResult) {
  try {
    if (!alienResult.includes('[观测录入]') && !alienResult.includes('【观测录入】')) return;

    let archive = [];
    try {
      const fileContent = await fs.readFile(OBSERVATION_LOG_PATH, 'utf-8');
      archive = JSON.parse(fileContent);
    } catch (e) { archive = []; }

    const archiveMatch = alienResult.match(/(?:\[观测录入\]|【观测录入】)\s*([\s\S]*?)$/);
    if (archiveMatch) {
      archive.push({
        timestamp: new Date().toISOString(),
        content: archiveMatch[1].trim()
      });
      await fs.writeFile(OBSERVATION_LOG_PATH, JSON.stringify(archive, null, 2), 'utf-8');
    }
  } catch (error) { console.error('Archive Error:', error); }
}

async function processConceptLearning(thoughts) {
  try {
    let newConcepts = [];

    // 方法1: 寻找完整的概念-定义对
    // 匹配 "概念名...[一些描述]我理解为定义" 的跨句子模式
    const fullMatches = thoughts.match(/([^…]+?)(…|\.\.\.)[^]*?(?:我现在理解[^]*?为|我理解[^]*?为)([^。！？]*[。！？])/g);

    if (fullMatches) {
      for (const match of fullMatches) {
        const subMatch = match.match(/([^…]+?)…[^]*?(?:我现在理解[^]*?为|我理解[^]*?为)([^。！？]*[。！？])/);
        if (subMatch) {
          const term = subMatch[1].trim().replace(/['"”“]/g, '').replace(/[这个词组信号概念]/g, '').trim();
          const definition = subMatch[2].trim().replace(/[。！？]$/, ''); // 移除结尾标点

          if (term && definition && term.length > 1 && term.length < 20) {
            newConcepts.push({
              term: term,
              definition: definition
            });
          }
        }
      }
    }

    // 方法2: 如果方法1没找到，尝试寻找独立的定义句子
    if (newConcepts.length === 0) {
      // 寻找所有可能的概念名（在"..."之前，尝试提取关键词）
      const conceptCandidates = [];

      // 模式1: 直接的词语后面跟...或…
      const directMatches = thoughts.match(/([^\s，。！？]{2,10})(…|\.\.\.)/g);
      if (directMatches) {
        for (const match of directMatches) {
          let term = match.replace(/…|\.\.\./g, '').trim().replace(/['"”“]/g, '');
          // 清理多余的文字
          term = term.replace(/^中的/, '').replace(/^这个/, '').trim();
          // 排除一些无意义的前缀，但保留像"电影"这样的具体名词
          if (term && term.length > 1 && term.length < 20 &&
              !term.includes('这个词') && !term.includes('这个词组') &&
              !term.includes('用户') && !term.includes('信号') &&
              !term.includes('一种') && !term.includes('现象')) {
            conceptCandidates.push(term);
          }
        }
      }

      // 模式2: 从引号或特定格式中提取
      const quoteMatches = thoughts.match(/"([^"]+?)"/g);
      if (quoteMatches) {
        for (const match of quoteMatches) {
          const term = match.replace(/"/g, '').trim();
          if (term && term.length > 1 && term.length < 20) {
            conceptCandidates.push(term);
          }
        }
      }

      // 寻找所有可能的定义（在"我理解为"或"我现在理解为"之后的内容）
      const definitionMatches = thoughts.match(/(?:我现在理解[^]*?为|我理解[^]*?为)([^。！？]*[。！？])/g);
      if (definitionMatches && conceptCandidates.length > 0) {
        // 简单地将第一个概念和第一个定义配对
        const defMatch = definitionMatches[0].match(/(?:我现在理解[^]*?为|我理解[^]*?为)([^。！？]*[。！？])/);
        if (defMatch) {
          const definition = defMatch[1].trim().replace(/[。！？]$/, '');

          if (definition) {
            newConcepts.push({
              term: conceptCandidates[0],
              definition: definition
            });
          }
        }
      }
    }

    if (newConcepts.length === 0) return;

    // 读取现有的记忆库
    let memory = [];
    try {
      const fileContent = await fs.readFile(OBSERVATION_LOG_PATH, 'utf-8');
      memory = JSON.parse(fileContent);
    } catch (e) {
      memory = [];
    }

    // 处理每个新概念
    for (const concept of newConcepts) {
      // 检查是否已存在相同的概念
      const existingIndex = memory.findIndex(item => item.term === concept.term);

      if (existingIndex >= 0) {
        // 更新现有概念
        memory[existingIndex].definition = concept.definition;
        memory[existingIndex].lastUpdated = new Date().toISOString();
        console.log(`[概念更新] ${concept.term}`);
      } else {
        // 添加新概念
        memory.push({
          term: concept.term,
          definition: concept.definition,
          learnedAt: new Date().toISOString()
        });
        console.log(`[概念学习] 新增: ${concept.term}`);
      }
    }

    // 保存更新后的记忆库
    await fs.writeFile(OBSERVATION_LOG_PATH, JSON.stringify(memory, null, 2), 'utf-8');

  } catch (error) {
    console.error('Concept Learning Error:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { message, thoughtsHistory = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    if (shouldExitByUser(message)) {
      return res.status(200).json({ reply: '【通信终止】静默...回归...' });
    }

    const processedInput = preProcessUserInput(message);
    
    // 两步生成：先思维解构，再正式回复
    const { thoughts, reply } = await processAlienResponse(processedInput, thoughtsHistory);

    // 处理概念学习：从thoughts中提取新概念并添加到记忆库
    if (thoughts) {
      await processConceptLearning(thoughts);
    }

    // 如果 reply 为空，使用降级处理
    if (!reply || reply.trim().length === 0) {
      return res.status(200).json({
        thoughts: thoughts || '思维解构已完成。',
        reply: '（信号微弱，无法成句）',
        exit: false,
        rawArchive: false
      });
    }

    // --- 核心清洗流程开始 ---
    let cleanReply = postProcessAiResponse(reply);
    
    // 1. 标签内容提取
    const replyMatch = cleanReply.match(/(?:\[正式传输\]|【正式传输】)\s*([\s\S]*?)(?=(?:\[观测录入\]|【观测录入】)|$)/);
    
    if (replyMatch && replyMatch[1].trim()) {
      cleanReply = replyMatch[1].trim();
    } else {
      cleanReply = cleanReply
          .replace(/[\[【]思维轨迹[\]】][\s\S]*?(?=[\[【]正式传输[\]】]|$)/g, '')
          .replace(/[\[【]正式传输[\]】]\s*/g, '')
          .replace(/[\[【]观测录入[\]】][\s\S]*/g, '')
          .trim();
    }

    // 2. 【核心过滤】：剔除解释性的机械废话
    const filterWords = [
        "正在解码", "尝试映射", "认知框架", "档案记录", 
        "数据不足", "频率模式", "语义符号", "录入并编码", 
        "尚未记录", "互动尝试", "简单互动", "建立联系",
        "理解为一种", "映射到我的"
    ];
    
    // 逻辑：如果某句话包含上述词汇，直接抹除整句
    filterWords.forEach(word => {
        const regex = new RegExp(`[^。！？]*${word}[^。！？]*[。！？]?`, 'g');
        cleanReply = cleanReply.replace(regex, '');
    });

    // 3. 字数截断已移除 - 允许完整回复

    // 4. 保底机制：如果清洗后变空，抓取原回复的第一句
    if (!cleanReply || cleanReply.trim().length === 0) {
      cleanReply = reply.replace(/[\[【].*?[\]】]/g, '').split(/[。！？]/)[0] + "。";
    }
    // --- 核心清洗流程结束 ---

    // 检查并录入档案
    if (reply.includes('[观测录入]') || reply.includes('【观测录入】')) {
        updateObservationArchive(reply);
    }

    return res.status(200).json({
      thoughts: thoughts || '正在解构信号...', 
      reply: cleanReply.trim(),
      exit: shouldExitByAi(cleanReply),
      rawArchive: reply.includes('[观测录入]') || reply.includes('【观测录入】')
    });

  } catch (error) {
    console.error('Critical API Process Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}