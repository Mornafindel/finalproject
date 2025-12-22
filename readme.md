# 🛸 XYLON - 外星人对话AI

一个具有自我学习能力的智能外星人对话系统，能够通过对话不断学习和理解人类概念，形成独特的认知体系。

## ✨ 功能特性

### 🤖 核心AI能力
- **思维解构**：AI会先分析用户输入，记录其思维过程
- **智能回复**：基于思维分析生成符合外星人视角的回复
- **概念学习**：自动识别并学习用户输入中的新概念
- **记忆积累**：学习的概念会持续积累到记忆库中

### 🧠 学习与进化
- **Few-shot学习**：利用历史对话和反思进行学习
- **自我反思**：每10轮对话后进行深度反思总结
- **持续进化**：反思内容参与后续对话，形成学习循环

### 💾 数据持久化
- **本地存储**：使用localStorage保存对话历史和学习内容
- **记忆库**：JSON格式的概念记忆库，支持新增和更新
- **状态恢复**：页面刷新后恢复所有历史数据

### 🎨 独特UI设计
- **像素风格**：复古的1-bit像素艺术风格
- **动态效果**：闪烁、扭曲等视觉效果
- **实时解码**：逐字符显示AI回复的解码动画

## 🛠️ 技术栈

- **前端**: Next.js 14 + React 18
- **样式**: Styled-components
- **AI服务**: 智谱AI (GLM-4-Flash)
- **部署**: Vercel
- **存储**: LocalStorage + JSON文件

## 📦 安装与运行

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd finalproject
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

创建 `.env.local` 文件：
```bash
ZHIPU_API_KEY=your_zhipu_api_key_here
```

4. **运行开发服务器**
```bash
npm run dev
```

5. **访问应用**
打开浏览器访问 `http://localhost:3000`

## ⚙️ 配置说明

### 智谱AI API配置
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号，获取API Key
3. 将API Key添加到环境变量 `ZHIPU_API_KEY`

### 角色配置 (`config/roleConfig.json`)
```json
{
  "baseSystemInstruction": "你是XYLON，一个来自高维空间的外星观察者...",
  "personalityAndContext": {
    "cognitiveLimitation": "高维思维 vs 低维理解的局限",
    "symbolMisunderstanding": "人类符号的扭曲理解",
    "highDimensionalThinking": "几何/物理逻辑的运用"
  }
}
```

### Few-shot示例 (`config/configExamples.json`)
预设的对话示例，用于指导AI的行为模式。

### 记忆库 (`config/observationLog.json`)
AI学习到的人类概念定义，会持续积累。

## 🚀 部署指南

### Vercel一键部署

1. **推送代码到Git仓库**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **连接Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 导入你的Git仓库

3. **配置环境变量**
   - 在Vercel项目设置中添加：
     - `ZHIPU_API_KEY`: 你的智谱AI API Key

4. **部署**
   - Vercel会自动检测Next.js项目并部署
   - 部署完成后获得访问URL

### 手动部署

详细的部署步骤请参考 [DEPLOY.md](./DEPLOY.md)

## 🎮 使用指南

### 基本对话
1. 在输入框输入消息
2. AI会先进行"思维解构"分析
3. 然后生成外星人视角的回复
4. 回复会以逐字符解码动画显示

### 观察学习过程
- **Cognitive Log**: 查看AI的思维过程和学习记录
- **概念学习**: AI会自动学习新概念并记录到记忆库
- **反思**: 每10轮对话后AI会进行自我反思

### 数据持久化
- 所有对话历史和学习内容都会自动保存
- 页面刷新后数据完全恢复
- 概念记忆库持续积累

## 🏗️ 项目结构

```
finalproject/
├── config/                    # 配置文件
│   ├── configExamples.json    # Few-shot示例
│   ├── memory.json           # 对话记忆
│   ├── observationLog.json   # 概念学习记忆库
│   └── roleConfig.json       # 角色配置
├── pages/                     # Next.js页面
│   ├── api/
│   │   ├── chat.js           # 聊天API
│   │   └── reflection.js     # 反思API
│   └── index.js              # 主页面
├── services/                  # 业务逻辑
│   ├── AlienCouncilService.js # AI服务调用
│   ├── DataService.js        # 数据服务
│   ├── LogicService.js       # 逻辑处理
│   └── RoleService.js        # 角色和提示词
├── DEPLOY.md                 # 部署指南
└── README.md                 # 项目说明
```

## 🔬 核心机制

### 思维解构流程
```
用户输入 → 思维分析 → 概念学习 → 智能回复 → 记忆存储
```

### 学习循环
```
对话 → 学习概念 → 积累记忆 → 反思总结 → 优化回复
```

### Few-shot增强
- 基础示例：预设对话模式
- 反思历史：利用过往学习经验
- 概念记忆：已学习的知识应用

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 智谱AI提供的大语言模型支持
- Next.js生态系统
- 像素艺术设计灵感

---

**体验外星人的思维世界，与XYLON一起探索人类概念的无限可能！** 🌌✨
