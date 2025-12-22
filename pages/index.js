import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// 错误边界组件
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    color: '#fff',
                    background: '#000',
                    fontFamily: 'Courier New, monospace',
                    textAlign: 'center'
                }}>
                    <h2>系统错误</h2>
                    <p>XYLON系统遇到问题，正在重启...</p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        style={{
                            padding: '10px 20px',
                            background: '#fff',
                            color: '#000',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        重试
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// 外星文字字符集
const ALIEN_CHARS = '█▓▒░▯▬▭▮▰▱▲△▴▵▶▷▸▹►▻▼▽▾▿◀◁◂◃◄◅◆◇◈◉◊○◌◍◎●◐◑◒◓◔◕◖◗◘◙◚◛◜◝◞◟◠◡◢◣◤◥◦◧◨◩◪◫◬◭◮◯◰◱◲◳◴◵◶◷◸◹◺◻◼◽◾◿';

// --- 动画优化：使用 steps() 产生断续的像素跳动感 ---
const pixelFlicker = keyframes`
    0%, 100% { opacity: 1; }
    50% { opacity: 0.92; }
`;

const subtleDistort = keyframes`
    0% { transform: translate(0,0); }
    20% { transform: translate(1px, -1px); }
    40% { transform: translate(-1px, 1px); }
    60% { transform: translate(1px, 1px); }
    80% { transform: translate(-1px, -1px); }
    100% { transform: translate(0,0); }
`;

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        background-color: #000;
        color: #fff;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        /* 优化文字像素密度 - 针对英文字符 */
        font-weight: normal;
        font-variant-numeric: tabular-nums;
        text-rendering: optimizeLegibility;
        font-smooth: never;
        -webkit-font-smoothing: none;
        letter-spacing: 0.01em;
        line-height: 1.25;
        /* 应用 1-bit 滤镜 */
        filter: url(#pixel-dither);
        overflow: hidden;
    }

    /* 模拟旧屏幕的扫描线 */
    body::after {
        content: "";
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
        background-size: 100% 4px;
        z-index: 999;
        pointer-events: none;
    }
`;

// =======================================================
// 1. 样式组件
// =======================================================

const MainLayout = styled.div`
    display: flex;
    height: 100vh;
    width: 100vw;
    padding: 15px;
    box-sizing: border-box;
    gap: 15px;
    background: #000;
`;

const LeftSection = styled.div`
    flex: 1.2;
    display: flex;
    flex-direction: column;
    border: 2px solid #fff;
    background: #000;
    position: relative;
`;

// 莱拉风格的“脸部”显示区
const FaceArea = styled.div`
    height: 150px;
    border-bottom: 2px solid #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 4rem;
    overflow: hidden;
    background: #000;
    animation: ${subtleDistort} 4s steps(4) infinite;
`;

const ThoughtPanel = styled.div`
    flex: 0.8;
    border: 2px solid #fff;
    display: flex;
    flex-direction: column;
    padding: 15px;
    background: #000;
`;

const ThoughtTitle = styled.h2`
    font-size: 0.9rem;
    border-bottom: 2px solid #fff;
    padding-bottom: 5px;
    margin-bottom: 10px;
    font-weight: bold;
    text-transform: uppercase;
`;

const ThoughtContent = styled.div`
    font-size: 0.9rem;
    line-height: 1.4;
    white-space: pre-wrap;
    flex: 1;
    overflow-y: auto;
    letter-spacing: 0.02em;
    font-weight: normal;
    animation: ${pixelFlicker} 0.2s steps(2) infinite;
`;

const ChatWindow = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 15px;
`;

const Message = styled.div`
    margin-bottom: 15px;
    border-left: 2px solid #fff;
    padding-left: 10px;
    line-height: 1.35;
    letter-spacing: 0.02em;
    font-weight: normal;
`;

const RoleTag = styled.div`
    font-size: 0.7rem;
    margin-bottom: 5px;
    text-transform: uppercase;
    background: #fff;
    color: #000;
    display: inline-block;
    padding: 0 4px;
`;

const DecodingText = styled.div`
    font-size: 0.95rem;
    line-height: 1.35;
    letter-spacing: 0.02em;
    font-weight: normal;
    word-break: break-all;
`;

const InputArea = styled.form`
    display: flex;
    padding: 15px;
    border-top: 2px solid #fff;
`;

const Input = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    color: #fff;
    font-family: inherit;
    font-size: 1rem;
    letter-spacing: 0.02em;
    line-height: 1.25;
    font-weight: normal;
    &:focus { outline: none; }
`;

// =======================================================
// 2. 1-bit 像素滤镜组件
// =======================================================

const LilaFilter = () => (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <filter id="pixel-dither" x="0" y="0" width="100%" height="100%">
        {/* 1. 极小步长采样：只在边缘产生锯齿，不破坏文字主体 */}
        <feFlood x="0" y="0" height="0.2" width="0.2" />
        <feComposite width="1" height="1" />
        <feTile result="tiles" />
        <feComposite in="SourceGraphic" in2="tiles" operator="in" />
        
        {/* 2. 锐化与对比度：让黑白更纯粹，文字更硬朗 */}
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 1" />
          <feFuncG type="discrete" tableValues="0 1" />
          <feFuncB type="discrete" tableValues="0 1" />
        </feComponentTransfer>
      </filter>
    </svg>
  );

// =======================================================
// 3. 核心逻辑
// =======================================================

function Chat() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { role: 'ai', content: 'CONNECTION ESTABLISHED. WAITING FOR SIGNAL.' }
    ]);
    const [thoughts, setThoughts] = useState('IDLE...');
    const [thoughtsHistory, setThoughtsHistory] = useState([]);
    const [thoughtsCount, setThoughtsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [decodingText, setDecodingText] = useState('');
    const [decodingIndex, setDecodingIndex] = useState(0);
    const chatWindowRef = useRef(null);

    // 加载本地存储的数据
    useEffect(() => {
        try {
            const savedThoughtsHistory = localStorage.getItem('alienThoughtsHistory');
            const savedThoughtsCount = localStorage.getItem('alienThoughtsCount');

            // console.log('Loading from localStorage:', { savedThoughtsHistory, savedThoughtsCount });

            if (savedThoughtsHistory) {
                try {
                    const parsedHistory = JSON.parse(savedThoughtsHistory);
                    // 验证数据格式
                    if (Array.isArray(parsedHistory)) {
                        // console.log('Parsed thoughts history:', parsedHistory);
                        setThoughtsHistory(parsedHistory);
                        if (parsedHistory.length > 0) {
                            const lastThought = parsedHistory[parsedHistory.length - 1];
                            const lastContent = typeof lastThought === 'string' ? lastThought : (lastThought && lastThought.content ? lastThought.content : 'IDLE...');
                            setThoughts(lastContent);
                        }
                    } else {
                        console.warn('Invalid thoughtsHistory format, resetting to empty array');
                        setThoughtsHistory([]);
                    }
                } catch (e) {
                    console.error('Failed to parse thoughts history:', e);
                    setThoughtsHistory([]);
                    setThoughts('IDLE...');
                }
            }

            if (savedThoughtsCount) {
                const count = parseInt(savedThoughtsCount, 10);
                setThoughtsCount(isNaN(count) ? 0 : count);
            }
        } catch (storageError) {
            console.error('localStorage access error:', storageError);
            // 如果localStorage不可用，继续正常运行
        }

        setDataLoaded(true);
    }, []);

    // 保存数据到本地存储
    useEffect(() => {
        try {
            localStorage.setItem('alienThoughtsHistory', JSON.stringify(thoughtsHistory));
            localStorage.setItem('alienThoughtsCount', thoughtsCount.toString());
        } catch (storageError) {
            console.error('Failed to save to localStorage:', storageError);
            // 如果localStorage不可用，继续正常运行
        }
    }, [thoughtsHistory, thoughtsCount]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [history, decodingText, decodingIndex]);

    const performSelfReflection = async (currentThoughts) => {
        try {
            // 获取最近10句thoughts进行反思
            const recentThoughts = thoughtsHistory.slice(-9); // 获取前9句 + 当前这一句 = 10句
            recentThoughts.push({
                content: currentThoughts,
                timestamp: new Date().toISOString(),
                userInput: input
            });

            const response = await fetch('/api/reflection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    thoughtsHistory: recentThoughts,
                    totalThoughtsCount: thoughtsCount + 1
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.reflection) {
                    // 添加反思到thoughts历史
                    setThoughtsHistory(prev => [...prev, {
                        content: data.reflection,
                        timestamp: new Date().toISOString(),
                        isReflection: true
                    }]);

                    // 更新当前显示的thoughts为反思内容
                    setThoughts(data.reflection);
                }
            }
        } catch (error) {
            console.error('Self-reflection failed:', error);
        }
    };

    const startDecoding = (finalText) => {
        setDecodingText(finalText);
        setDecodingIndex(0);
        let currentIdx = 0;

        const interval = setInterval(() => {
            currentIdx++;
            setDecodingIndex(currentIdx);
            if (currentIdx >= finalText.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setHistory(prev => [...prev, { role: 'ai', content: finalText }]);
                    setDecodingText('');
                }, 500);
            }
        }, 50); // 加快解码速度，使其更具动感
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput('');
        setIsLoading(true);
        setHistory(prev => [...prev, { role: 'user', content: userInput }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userInput,
                    thoughtsHistory: thoughtsHistory
                }),
            });
            const data = await response.json();

            const newThoughts = data.thoughts || 'NO DATA';
            setThoughts(newThoughts);

            // 添加到thoughts历史 - 包含用户输入和AI的学习过程
            setThoughtsHistory(prev => [...prev, {
                content: newThoughts,
                timestamp: new Date().toISOString(),
                userInput: userInput,
                type: 'learning' // 标记为学习过程
            }]);

            // 增加计数器
            const newCount = thoughtsCount + 1;
            setThoughtsCount(newCount);

            // 每10句thoughts进行自我反思
            if (newCount % 10 === 0) {
                await performSelfReflection(newThoughts);
            }

            startDecoding(data.reply);
        } catch (error) {
            setHistory(prev => [...prev, { role: 'ai', content: 'SIGNAL LOST.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <LilaFilter />
            <GlobalStyle />
            <MainLayout>
                <LeftSection>
                    <FaceArea>
                        {isLoading ? 
                            ALIEN_CHARS[Math.floor(Math.random() * ALIEN_CHARS.length)] : 
                            '◉_◉'}
                    </FaceArea>
                    <ChatWindow ref={chatWindowRef}>
                        {history.map((msg, index) => (
                            <Message key={index}>
                                <RoleTag>{msg.role === 'user' ? 'USER' : 'XYLON'}</RoleTag>
                                <div>{msg.content}</div>
                            </Message>
                        ))}
                        {decodingText && (
                            <Message>
                                <RoleTag>XYLON</RoleTag>
                                <DecodingText>
                                    {decodingText.split('').map((char, i) => 
                                        i < decodingIndex ? char : ALIEN_CHARS[Math.floor(Math.random() * ALIEN_CHARS.length)]
                                    )}
                                </DecodingText>
                            </Message>
                        )}
                    </ChatWindow>
                    <InputArea onSubmit={handleSubmit}>
                        <Input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="INPUT COMMAND..."
                            disabled={isLoading}
                        />
                    </InputArea>
                </LeftSection>

                <ThoughtPanel>
                    <ThoughtTitle>Cognitive Log</ThoughtTitle>
                    <ThoughtContent>
                        {isLoading ? "ANALYZING..." : (
                            !dataLoaded ? "LOADING..." : (
                                thoughtsHistory.length === 0 ? "IDLE..." : (
                                    (() => {
                                        // console.log('Rendering thoughtsHistory:', thoughtsHistory);
                                        return thoughtsHistory.slice(-5).map((thought, index) => (
                                    <div key={index} style={{
                                        marginBottom: '12px',
                                        paddingBottom: '6px',
                                        borderBottom: index < thoughtsHistory.slice(-5).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                        color: thought.isReflection ? '#00ffff' : 'inherit'
                                    }}>
                                        <div style={{fontSize: '0.75rem', opacity: 0.7, marginBottom: '4px'}}>
                                            [{thought.timestamp ? new Date(thought.timestamp).toLocaleTimeString() : '未知时间'}]
                                            {thought.isReflection ? ' 反思' : ''}
                                        </div>
                                        <div style={{fontSize: '0.9rem', lineHeight: '1.4'}}>
                                            {typeof thought === 'string' ? thought : (thought && thought.content ? thought.content : '无内容')}
                                        </div>
                                    </div>
                                ))
                                    })()
                                )
                            )
                        )}
                    </ThoughtContent>
                </ThoughtPanel>
            </MainLayout>
        </>
    );
}

// 简化版组件，避免复杂的状态管理导致的问题
function SimpleChat() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { role: 'ai', content: 'CONNECTION ESTABLISHED. WAITING FOR SIGNAL.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [thoughtsHistory, setThoughtsHistory] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput('');
        setIsLoading(true);

        setHistory(prev => [...prev, { role: 'user', content: userInput }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // 添加思考内容到历史记录
            if (data.thoughts) {
                setThoughtsHistory(prev => [...prev, {
                    content: data.thoughts,
                    timestamp: new Date().toISOString(),
                    userInput: userInput
                }]);
            }

            setHistory(prev => [...prev, { role: 'ai', content: data.reply || 'SIGNAL LOST.' }]);
        } catch (error) {
            console.error('Chat error:', error);
            setThoughtsHistory(prev => [...prev, {
                content: '分析过程中发生错误',
                timestamp: new Date().toISOString(),
                userInput: userInput
            }]);
            setHistory(prev => [...prev, { role: 'ai', content: 'SIGNAL LOST.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <GlobalStyle />
            <MainLayout>
                <LeftSection>
                    <FaceArea>
                        {isLoading ? '◉_◉' : '◉_◉'}
                    </FaceArea>
                    <ChatWindow>
                        {history.map((msg, index) => (
                            <Message key={index}>
                                <RoleTag>{msg.role === 'user' ? 'USER' : 'XYLON'}</RoleTag>
                                <div>{msg.content}</div>
                            </Message>
                        ))}
                    </ChatWindow>
                    <InputArea onSubmit={handleSubmit}>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="INPUT COMMAND..."
                            disabled={isLoading}
                        />
                    </InputArea>
                </LeftSection>

                <ThoughtPanel>
                    <ThoughtTitle>Cognitive Log</ThoughtTitle>
                    <ThoughtContent>
                        {isLoading ? "ANALYZING..." : (
                            thoughtsHistory.length === 0 ? "IDLE..." : (
                                thoughtsHistory.slice(-5).map((thought, index) => (
                                    <div key={index} style={{
                                        marginBottom: '8px',
                                        paddingBottom: '4px',
                                        borderBottom: index < thoughtsHistory.slice(-5).length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                                    }}>
                                        <div style={{fontSize: '0.75rem', opacity: 0.7, marginBottom: '2px'}}>
                                            [{thought.timestamp ? new Date(thought.timestamp).toLocaleTimeString() : '未知时间'}]
                                        </div>
                                        <div style={{fontSize: '0.85rem', lineHeight: '1.4'}}>
                                            {thought.content}
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </ThoughtContent>
                </ThoughtPanel>
            </MainLayout>
        </>
    );
}

export default function ChatApp() {
    return (
        <ErrorBoundary>
            <SimpleChat />
        </ErrorBoundary>
    );
}