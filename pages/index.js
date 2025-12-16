// pages/index.js

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';

// =======================================================
// 1. 全局样式 (Global Styles) - 实现 Low-poly 视觉效果
// =======================================================

const GlobalStyle = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        /* Low-poly 风格的背景和字体 */
        background-color: #212529; /* 深空灰色 */
        color: #C0C0C0; /* 银色文本 */
        font-family: 'Pixelated', 'Courier New', monospace; 
        /* 提示：如果需要精确的像素字体效果，您可能需要导入一个像素字体 */
    }
`;

// 脉冲动画，用于 AI 响应或活动指示
const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(100, 255, 218, 0); }
    100% { box-shadow: 0 0 0 0 rgba(100, 255, 218, 0); }
`;

// =======================================================
// 2. 组件样式 (Styled Components)
// =======================================================

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    box-sizing: border-box;
    /* Low-poly 边框效果 */
    border: 3px solid #64FFDA; /* 青色霓虹 */
    border-radius: 8px;
    background-color: #1A1A1A; /* 略深的背景 */
`;

const Header = styled.h1`
    text-align: center;
    color: #64FFDA;
    font-size: 1.5em;
    margin-bottom: 20px;
    border-bottom: 2px solid #64FFDA;
    padding-bottom: 10px;
`;

const ChatWindow = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #444;
    margin-bottom: 15px;
    /* 模拟旧式 CRT 屏幕的滚动条 */
    scrollbar-color: #64FFDA #1A1A1A;
    scrollbar-width: thin;
`;

const Message = styled.div`
    margin-bottom: 15px;
    padding: 10px;
    border-radius: 4px;
    background-color: ${props => (props.role === 'user' ? '#333' : '#2A2A2A')};
    border-left: 3px solid ${props => (props.role === 'user' ? '#C0C0C0' : '#64FFDA')};
`;

const RoleTag = styled.span`
    font-weight: bold;
    color: ${props => (props.role === 'user' ? '#C0C0C0' : '#64FFDA')};
    margin-right: 8px;
    text-transform: uppercase;
`;

const InputArea = styled.form`
    display: flex;
    border-top: 1px solid #444;
    padding-top: 15px;
`;

const Input = styled.input`
    flex-grow: 1;
    padding: 10px;
    margin-right: 10px;
    background-color: #1A1A1A;
    border: 1px solid #64FFDA;
    color: #C0C0C0;
    font-size: 1em;
    &:focus {
        outline: none;
        border-color: #FFFF00; /* 聚焦时变为黄色 */
    }
`;

const SendButton = styled.button`
    padding: 10px 15px;
    background-color: #64FFDA;
    color: #1A1A1A;
    border: none;
    cursor: pointer;
    text-transform: uppercase;
    &:hover {
        background-color: #3C7A6D;
    }
    &:disabled {
        background-color: #555;
        cursor: not-allowed;
    }
`;

const LoadingIndicator = styled.div`
    text-align: center;
    padding: 10px;
    color: #64FFDA;
    /* Low-poly 脉冲效果 */
    span {
        display: inline-block;
        width: 10px;
        height: 10px;
        background-color: #64FFDA;
        border-radius: 50%;
        margin: 0 5px;
        animation: ${pulse} 1.5s infinite;
    }
`;

// =======================================================
// 3. 主要组件 (Chat Interface)
// =======================================================

const initialHistory = [
    { role: 'ai', content: '（系统启动声）能量态稳定。我是外星天文学家 XYLON。你的观测请求编号是？' }
];

export default function Chat() {
    const [input, setInput] = useState('');
    const [history, setHistory] = useState(initialHistory);
    const [isLoading, setIsLoading] = useState(false);
    const chatWindowRef = useRef(null);

    // 滚动到底部
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [history]);

    // 核心 API 调用函数
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userInput = input.trim();
        setInput('');
        setIsLoading(true);

        // 1. 更新 UI 历史记录
        const updatedHistory = [...history, { role: 'user', content: userInput }];
        setHistory(updatedHistory);

        try {
            // 2. 调用您的 Next.js API 路由
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    // 与后端 API /api/chat 的参数保持一致
                    message: userInput,
                }),
            });

            // 先解析后端返回的 body，再根据其中的 error 提示具体问题
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || 'API 响应错误');
            }
            
            // 3. 更新 AI 回复到历史记录
            setHistory((prevHistory) => [
                ...prevHistory,
                { role: 'ai', content: data.reply }
            ]);

            // 4. 处理退出逻辑（如果 AI 或用户触发了退出）
            if (data.exit) {
                console.log('Conversation ended by AI or User.');
                // 可以在此禁用输入框或显示结束消息
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            setHistory((prevHistory) => [
                ...prevHistory,
                { role: 'ai', content: `[错误：数据流中断。无法解析。错误信息: ${error.message}]` }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <GlobalStyle />
            <Container>
                <Header>🌌 外星天文学家 XYLON - 通讯模块 1.0</Header>
                
                <ChatWindow ref={chatWindowRef}>
                    {history.map((msg, index) => (
                        <Message key={index} role={msg.role}>
                            <RoleTag role={msg.role}>
                                {msg.role === 'user' ? '操作员' : 'XYLON'}
                            </RoleTag>
                            {msg.content}
                        </Message>
                    ))}
                    {isLoading && (
                        <LoadingIndicator>
                            XYLON 正在处理信息流 <span></span>
                        </LoadingIndicator>
                    )}
                </ChatWindow>
                
                <InputArea onSubmit={handleSubmit}>
                    <Input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isLoading ? "等待 XYLON 回应..." : "输入你的观测请求..."}
                        disabled={isLoading}
                    />
                    <SendButton type="submit" disabled={isLoading}>
                        发送
                    </SendButton>
                </InputArea>
            </Container>
        </>
    );
}