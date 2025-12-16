
import roleConfig from '../config/roleConfig.json'; 
import * as fs from 'fs/promises';
import path from 'path';

const MEMORY_FILE_PATH = path.join(process.cwd(), 'data', 'memory.json');


async function getRoleStyleMemory() {
    try {
        const fileContent = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        
        let contents = [];
        if (Array.isArray(data)) {
            
            contents = data.map(item => item.content || '').filter(c => c);
        } else if (typeof data === 'object' && data !== null) {
            
            contents = [data.content].filter(c => c);
        }
        
        if (contents.length > 0) {
            return `【你的语言风格示例】\n以下是你的一些典型表达，请模仿这种语气和风格：\n\n${contents.join('\n')}`;
        }
        return "";

    } catch (e) {
        // 如果文件不存在或解析失败，忽略
        console.warn("未找到或无法读取角色风格记忆文件 (memory.json)。");
        return "";
    }
}



export async function buildApiMessages(history) {
    // 1. 获取核心设定和风格示例
    const styleMemory = await getRoleStyleMemory();
    const { baseSystemInstruction, threeDimensionConstraints, symbolTranslation, breakRules } = roleConfig;

    // 2. 组合 System Instruction（整合三个思维维度）
    const systemInstruction = `
        ${baseSystemInstruction}

        ---
        【思维模型和约束】
        1. **数据来源限定:** ${threeDimensionConstraints.dataSource}
        2. **时空概念突破:** ${threeDimensionConstraints.spaceTime}
        3. **社会符号转换表:** 你必须严格遵循以下映射关系来理解人类概念，并以抽象符号回应。
           ${JSON.stringify(symbolTranslation, null, 2)}
        
        ${styleMemory}
        
        ${breakRules}
        
        ---
        `;

   
    const contents = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user', 
        parts: [{ text: msg.content }]
    }));

    return {
        systemInstruction: systemInstruction,
        contents: contents
    };
}