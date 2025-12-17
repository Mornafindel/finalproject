import roleConfig from '../config/roleConfig.json'; 

// 角色配置中已经去除了 symbolTranslation，但我们保留导入，以防主程序依赖 roleConfig
// 如果 JSON 文件不再有 symbolTranslation 字段，此处的 Object.entries 也会安全地返回空数组。


export function shouldExitByUser(userInput) {
    // 保持用户触发退出逻辑不变
    const exitWords = ['再见', '退出', '结束', 'bye', 'exit'];
    const cleanedInput = userInput.trim().toLowerCase();
    return exitWords.includes(cleanedInput);
}


export function shouldExitByAi(aiReply) {
    // 匹配我们最终确定的退出回复：“静默...回归...”
    const cleanedReply = aiReply.trim().replace(/[!！,，。.]/g, "");
    return cleanedReply === "静默回归"; // 匹配“静默...回归...”
}


export function preProcessUserInput(userInput) {
    
    // **重大修改：删除所有预处理逻辑**
    // 允许 AI 直接接收用户原始词汇，以便根据自身逻辑进行语义错位，而不是被硬编码的替换所限制。
    
    return userInput;
}


export function postProcessAiResponse(aiText) {
    
    // **重大修改：删除所有后处理逻辑**
    // 删除了符号替换和数据来源检查/补充。
    // 我们依赖 AI 自身（通过 System Instruction 和 Memory）来生成符合异质语法的文本。
    
    let processedText = aiText;
    
    // 确保退出语是干净的，以防 AI 误加标点
    if (processedText.includes("静默...回归...")) {
        return "静默...回归...";
    }
    
    return processedText;
}