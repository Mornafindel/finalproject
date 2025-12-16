
import { saveLatestReply } from '../../services/DataService'; 
import { 
    shouldExitByUser, 
    preProcessUserInput, 
    postProcessAiResponse,
    shouldExitByAi
} from '../../services/LogicService';

import { processAlienResponse } from '../../services/AlienCouncilService';


// ... (所有 import 语句)

// ===================================
// DEBUG: 检查 API Key 是否已加载 (添加这两行)
// ===================================
console.log("DEBUG: GEMINI_API_KEY loaded:", !!process.env.GEMINI_API_KEY); 
// ===================================


export default async function handler(req, res) {
    
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    
    
    const { input, history } = req.body; 

    if (!input || !Array.isArray(history)) {
        return res.status(400).json({ message: 'Invalid input or history format.' });
    }

    try {
        
        if (shouldExitByUser(input)) {
            return res.status(200).json({ reply: '再见', exit: true });
        }
        
       
        const processedInput = preProcessUserInput(input);

        
        const updatedHistory = [...history, { role: "user", content: processedInput }];

        
        const rawResponse = await processAlienResponse(updatedHistory, processedInput); // <--- 修改点 2

        
        const finalResponse = postProcessAiResponse(rawResponse);

        
        if (shouldExitByAi(finalResponse)) {
            return res.status(200).json({ reply: finalResponse, exit: true });
        }
        
        
        await saveLatestReply(finalResponse); 

        
        res.status(200).json({ 
            reply: finalResponse, 
            exit: false 
        });

    } catch (error) {
        
        console.error("Critical API Process Error:", error);
        res.status(500).json({ 
            message: 'Internal AI processing failed.', 
            error: error.message 
        });
    }
}