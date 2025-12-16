
import roleConfig from '../config/roleConfig.json'; 


export function shouldExitByUser(userInput) {
    const exitWords = ['再见', '退出', '结束', 'bye', 'exit'];
    const cleanedInput = userInput.trim().toLowerCase();
    return exitWords.includes(cleanedInput);
}


export function shouldExitByAi(aiReply) {
    const cleanedReply = aiReply.trim().replace(/[!！,，。.]/g, "");
    return cleanedReply === "再见";
}



export function preProcessUserInput(userInput) {
    
    let processedInput = userInput;
    
    // 1. 时间转换：将时间相关词汇抽象化
    processedInput = processedInput.replace(/昨天|过去/g, '信息累积的上一阶段');
    processedInput = processedInput.replace(/明天|未来/g, '结构演化的下一阶段');
    processedInput = processedInput.replace(/多久|时间/g, '信息熵的累积周期');

    // 2. 空间转换：将空间相关词汇抽象化
    processedInput = processedInput.replace(/遥远|很远/g, '高能量梯度区域');
    processedInput = processedInput.replace(/附近|很近/g, '低能量梯度区域');
    
    

    return processedInput;
}



export function postProcessAiResponse(aiText) {
    let processedText = aiText;
    
    // 1. 获取符号转换表（Symbol Translation Map）
    const symbolMap = roleConfig.symbolTranslation;
    
    // 2. 强制符号替换
    for (const [earthTerm, alienSymbol] of Object.entries(symbolMap)) {
        
        const regex = new RegExp(`\\b${earthTerm}\\b`, 'gi'); 
        processedText = processedText.replace(regex, alienSymbol);
    }
    
    // 3. 数据来源检查与补充 (可选增强项)
    const { dataSource } = roleConfig.threeDimensionConstraints;
    
    if (!/光谱|辐射|光子|噪音/gi.test(processedText)) {
        
        const dataSources = ['光谱分析', '热辐射强度图', '光子密度波动'];
        const randomSource = dataSources[Math.floor(Math.random() * dataSources.length)];
        
        
        processedText += ` (但需要指出，你所描述的现象的准确性，仍需结合${randomSource}进行校准。)`;
    }

    
    processedText = processedText.replace(/\b昨天\b|\b过去\b/gi, '信息累积阶段');
    
    return processedText;
}