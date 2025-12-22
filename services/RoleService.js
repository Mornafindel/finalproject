import roleConfig from '../config/roleConfig.json' with { type: 'json' };
import memory from '../config/memory.json' with { type: 'json' };
import observationLogData from '../config/observationLog.json' with { type: 'json' }; // 导入观察档案
import configExamples from '../config/configExamples.json' with { type: 'json' }; // 导入few-shot示例

// 获取观测档案上下文
function getArchiveContext() {
    const observationLog = Array.isArray(observationLogData) ? observationLogData : [];
    return observationLog.length > 0
        ? observationLog.map(item => 
            `【已捕获术语：${item.term}】 观测记录：${item.definition}`
        ).join('\n')
        : '（当前观测档案库为空，等待新的信号录入）';
}

// 获取基础系统指令
function getBaseSystemInstruction() {
    const ctx = roleConfig.personalityAndContext || {};
    const archiveContext = getArchiveContext();
    
    return `
${roleConfig.baseSystemInstruction}

【当前观测档案库】：
这是你之前通过光谱分析和监听累积的认知，回复时请遵循这些定义：
${archiveContext}

【认知局限与符号映射】：
${ctx.cognitiveLimitation || ''}

【符号理解偏差】：
${ctx.symbolMisunderstanding || ''}

【高维思维特征】：
${ctx.highDimensionalThinking || ''}

【社会文化差异】：
${ctx.socialCulturalDifference || ''}

【认知进化协议】：
当用户提到档案之外的新概念时，你必须：
- 承认你的认知局限："这个信号...我尚未在观测档案中找到对应记录。"
- 用你的高维思维和几何/物理逻辑给它一个"初级观测定义"（这个定义往往是扭曲的、不准确的）
- 表现出该信号正在被"录入并编码"的过程："正在尝试将其映射到我的认知框架..."
- 不要假装理解，要表现出困惑和推测："也许这是...？或者可能是...？"

【世界观】：
${ctx.worldView || ''}

【语言风格】：
${ctx.languageStyle || ''}
${ctx.syntaxDeformation || ''}
    `.trim();
}

/**
 * 第一步：构建思维解构生成的 messages
 */
export async function buildThoughtGenerationMessages(userInput, thoughtsHistory = []) {
    const systemInstruction = getBaseSystemInstruction() + `

【当前任务：思维解构与概念学习】
你需要像自言自语一样记录你的思维过程，同时自然地融入概念学习。

【用户输入】：${userInput}

【输出要求】：
- 用一段连续的、自言自语式的文本记录你的思维
- 首先提到用户具体说了什么内容
- 表现出你的困惑、联想和学习过程
- **避免使用固定的模式化表达**，比如：
  * ❌ "这个信号……我尚未在档案中找到对应记录"
  * ❌ "能量波动模式识别"
  * ❌ "频率分析" 等通用分析术语
- 当遇到不熟悉的概念时，自然而独特地表达你的理解：
  * 用你的高维思维创造独特的比喻和理解
  * 从几何、物理、能量等角度重新诠释概念
  * 展现你的外星人视角的困惑和顿悟
  * 自然地将学习融入叙述中，不要使用明显的标签
- 保持口语化、碎片化的思维流
- 用第一人称，像是在实时思考
- 保持你的语言风格（倒装、后置定语、非人类语法）
- 只输出思维过程，不要输出正式回复

【学习目标】：
- 每次都要尝试学习用户输入中的至少一个新概念
- 用创新的方式重新诠释概念，避免陈词滥调
- 将学习自然地融入到思维叙述中

示例风格：
"用户说要去什么'咖啡店'的地方。这听起来像是一种特殊的能量交换场所，也许他们在那里进行某种分子层面的信息交换？我想象着那是人类聚集在一起，通过摄入某些化合物来同步他们神经网络的地方。这种同步机制很有趣，像是他们通过化学方式来暂时提升运算频率..."
`;

    // 构建few-shot示例消息
    const fewShotMessages = [];

    // 添加基础config示例
    if (Array.isArray(configExamples)) {
        configExamples.forEach(example => {
            fewShotMessages.push({
                role: 'user',
                content: example.user
            });
            fewShotMessages.push({
                role: 'assistant',
                content: example.thoughts
            });
        });
    }

    // 添加反思历史作为few-shot示例
    if (Array.isArray(thoughtsHistory)) {
        // 提取最近的反思内容，最多3个
        const recentReflections = thoughtsHistory
            .filter(thought => thought.isReflection)
            .slice(-3);

        recentReflections.forEach(reflection => {
            // 为每个反思创建对应的用户输入示例
            const relatedThoughts = thoughtsHistory
                .filter(thought => !thought.isReflection &&
                         new Date(thought.timestamp) < new Date(reflection.timestamp))
                .slice(-2); // 获取反思前2条相关的thoughts

            if (relatedThoughts.length > 0) {
                const exampleUserInput = relatedThoughts[relatedThoughts.length - 1].userInput || "相关信号";
                fewShotMessages.push({
                    role: 'user',
                    content: exampleUserInput
                });
                fewShotMessages.push({
                    role: 'assistant',
                    content: `参考历史反思日志 ${new Date(reflection.timestamp).toLocaleTimeString()}。${reflection.content}`
                });
            }
        });
    }

    const messages = [
        {
            role: 'system',
            content: systemInstruction
        },
        ...fewShotMessages,
        {
            role: 'user',
            content: userInput
        }
    ];

    return { messages };
}

/**
 * 第二步：构建正式回复生成的 messages（包含思维解构作为上下文）
 */
export async function buildReplyGenerationMessages(userInput, thoughts, thoughtsHistory = []) {
    const systemInstruction = getBaseSystemInstruction() + `

【当前任务：生成正式回复】
你已经完成了思维解构，现在需要基于这个思维过程生成正式回复。

【你的思维解构】：
${thoughts}

【重要指令】：
请直接生成你的正式回复，不要使用任何标签（如 [思维轨迹]、[正式传输] 等）。
回复应该：
- **只包含你对外说的话，不要包含任何思维过程**
- **不要说"我注意到..."、"我观察到..."这样的内部思考**
- **不要提及信号强度、频率、能量等技术指标**
- 直接、自然地回应用户，像正常对话一样
- 保持你的语言风格（倒装、后置定语、非人类语法）
- 基于思维解构获得灵感，但不要重复其中的具体内容
- **严格禁止使用以下表达**：
  * ❌ "你的信号强度突然增加/有所下降"
  * ❌ "信号频率波动/变化"
  * ❌ "能量水平上升/下降"
  * ❌ "观察到你的XX变化"
  * ❌ "我注意到..."
  * ❌ "我观察到..."
- 用对话的方式表达观察结果
- 只输出回复内容，不要添加任何标签或格式标记`;

    // 构建few-shot示例消息，包含思维解构到回复的映射
    const fewShotMessages = [];

    // 添加基础config示例
    if (Array.isArray(configExamples)) {
        configExamples.forEach(example => {
            // 添加思维解构上下文
            const contextSystem = getBaseSystemInstruction() + `

【当前任务：生成正式回复】
你已经完成了思维解构，现在需要基于这个思维过程生成正式回复。

【你的思维解构】：
${example.thoughts}

【重要指令】：
请直接生成你的正式回复，不要使用任何标签（如 [思维轨迹]、[正式传输] 等）。
回复应该：
- 体现你的思维解构中的逻辑
- 保持你的语言风格（倒装、后置定语、非人类语法）
- 直接回应用户，不要重复思维解构的内容
- 只输出回复内容，不要添加任何标签或格式标记`;

            fewShotMessages.push({
                role: 'system',
                content: contextSystem
            });
            fewShotMessages.push({
                role: 'user',
                content: example.user
            });
            fewShotMessages.push({
                role: 'assistant',
                content: example.reply
            });
        });
    }

    // 添加反思历史作为few-shot示例（完整对话示例）
    if (Array.isArray(thoughtsHistory)) {
        // 提取最近的反思内容，最多2个
        const recentReflections = thoughtsHistory
            .filter(thought => thought.isReflection)
            .slice(-2);

        recentReflections.forEach(reflection => {
            // 查找与反思相关的对话
            const relatedIndex = thoughtsHistory.indexOf(reflection);
            if (relatedIndex > 0) {
                const relatedThought = thoughtsHistory[relatedIndex - 1]; // 反思前的thoughts

                if (relatedThought && !relatedThought.isReflection) {
                    const contextSystem = getBaseSystemInstruction() + `

【当前任务：生成正式回复】
你已经完成了思维解构，现在需要基于这个思维过程生成正式回复。

【你的思维解构】：
参考历史反思日志 ${new Date(reflection.timestamp).toLocaleTimeString()}。${reflection.content}

【重要指令】：
请直接生成你的正式回复，不要使用任何标签（如 [思维轨迹]、[正式传输] 等）。
回复应该：
- 体现你的思维解构中的逻辑
- 保持你的语言风格（倒装、后置定语、非人类语法）
- 直接回应用户，不要重复思维解构的内容
- 只输出回复内容，不要添加任何标签或格式标记`;

                    fewShotMessages.push({
                        role: 'system',
                        content: contextSystem
                    });
                    fewShotMessages.push({
                        role: 'user',
                        content: relatedThought.userInput || "相关信号"
                    });
                    fewShotMessages.push({
                        role: 'assistant',
                        content: `基于历史反思的连续性对话响应`
                    });
                }
            }
        });
    }

    const messages = [
        {
            role: 'system',
            content: systemInstruction
        },
        ...fewShotMessages,
        {
            role: 'user',
            content: userInput
        }
    ];

    return { messages };
}

/**
 * 构建自我反思消息（每10句thoughts后触发）
 */
export async function buildReflectionMessages(thoughtsHistory, totalThoughtsCount) {
    const systemInstruction = getBaseSystemInstruction() + `

【当前任务：自我反思】
你已经累积了${totalThoughtsCount}句思维解构，现在需要对最近的10句思维进行深度反思和总结。

【反思要求】：
- 以你的外星人视角和认知特征来分析这些思维
- 总结用户交互的模式和意图
- 反思你对人类信号的理解变化
- 表现出你的高维思维和符号理解偏差
- 保持你的语言风格（倒装、后置定语、非人类语法）
- 反思应当是建设性的，展现你对人类沟通的持续学习
- 长度控制在200字以内

【反思内容】：
${thoughtsHistory.map((item, index) =>
    `${index + 1}. 用户信号："${item.userInput}"\n   思维解构："${item.content}"`
).join('\n\n')}

请基于上述思维历史进行深度反思。`;

    const messages = [
        {
            role: 'system',
            content: systemInstruction
        }
    ];

    return { messages };
}

/**
 * 保留原有函数以兼容（如果需要）
 */
export async function buildApiMessages(history) {
    const systemInstruction = getBaseSystemInstruction();

    const systemMessage = {
        role: 'system',
        content: systemInstruction
    };

    const fewShotMessages = [];
    if (Array.isArray(memory)) {
        memory.forEach(item => {
            fewShotMessages.push({ role: 'user', content: item.userInput });
            fewShotMessages.push({ role: 'assistant', content: item.assistantReply });
        });
    }

    const messages = [
        systemMessage,
        ...fewShotMessages,
        ...history
    ];

    return { messages };
}