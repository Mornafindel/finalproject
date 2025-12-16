# 🚀 Vercel 部署指南

## 前置准备

1. **确保代码已提交到 Git 仓库**（GitHub / GitLab / Bitbucket）

2. **准备智谱AI API Key**
   - 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
   - 注册/登录账号，创建或获取你的 API Key

## 部署步骤

### 方法一：通过 Vercel 网页界面（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 Git 仓库
   - Vercel 会自动检测到 Next.js 项目

3. **配置环境变量**（⚠️ 关键步骤）
   - 在 "Environment Variables" 页面，添加：
     - **Name**: `ZHIPU_API_KEY`
     - **Value**: 你的智谱AI API Key
     - **Environment**: 选择 `Production`（如果 Preview 也需要，再添加一条选 `Preview`）

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 1-2 分钟）

5. **测试**
   - 部署成功后，访问 Vercel 提供的 URL（如 `https://your-project.vercel.app`）
   - 在聊天框输入消息，测试外星人对话是否正常

### 方法二：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 在项目根目录登录
vercel login

# 3. 部署（首次会引导配置）
vercel

# 4. 设置环境变量
vercel env add ZHIPU_API_KEY
# 按提示输入你的 API Key，选择 Production 环境

# 5. 重新部署以应用环境变量
vercel --prod
```

## 常见问题排查

### 问题 1: 部署后仍然报错 "ZHIPU_API_KEY 未设置"
- **解决**: 检查 Vercel 项目 Settings → Environment Variables 里是否已添加 `ZHIPU_API_KEY`，并确保选择了正确的环境（Production/Preview）

### 问题 2: 构建失败
- **解决**: 查看 Vercel 的构建日志，常见原因：
  - 缺少依赖（检查 `package.json` 的 `dependencies`）
  - Next.js 版本不兼容（当前使用 `^14.1.0`）

### 问题 3: 运行时错误 "Connect Timeout" 或 API 调用失败
- **解决**: 
  - 检查 API Key 是否有效（智谱AI的API Key格式通常是 `xxx.xxx.xxx`）
  - 检查是否有配额限制或余额不足
  - 查看 Vercel Function Logs 里的详细错误信息
  - 确认使用的是正确的模型名称（默认 `glm-4-flash`）

## 查看日志

在 Vercel Dashboard → 你的项目 → "Functions" 标签页，可以查看 API 路由的实时日志，帮助调试问题。

## 更新代码

每次推送到 Git 仓库的主分支，Vercel 会自动重新部署。如果需要手动触发，在 Vercel Dashboard 点击 "Redeploy"。

