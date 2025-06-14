# 图像标注工具 - Vercel 部署指南

这是一个用于图像侵权检测的人工标注系统，支持多人协作标注。

## 🚀 快速部署到 Vercel

### 第一步：准备 GitHub 仓库

1. **初始化 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Image labeling tool"
   ```

2. **创建 GitHub 仓库**
   - 访问 [GitHub](https://github.com) 并登录
   - 点击右上角的 "+" 号，选择 "New repository"
   - 仓库名称：`image-labeling-tool`（或你喜欢的名称）
   - 设置为 Public（免费用户）
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

3. **推送代码到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用户名/image-labeling-tool.git
   git branch -M main
   git push -u origin main
   ```

### 第二步：部署到 Vercel

1. **注册 Vercel 账号**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 并选择 "Continue with GitHub"
   - 授权 Vercel 访问你的 GitHub 账号

2. **导入项目**
   - 在 Vercel 控制台点击 "New Project"
   - 找到你刚创建的 `image-labeling-tool` 仓库
   - 点击 "Import"

3. **配置部署设置**
   - **Project Name**: 保持默认或修改为你喜欢的名称
   - **Framework Preset**: 选择 "Other"
   - **Root Directory**: 保持默认 "./"
   - **Build and Output Settings**: 保持默认
   - 点击 "Deploy"

4. **等待部署完成**
   - 部署通常需要 1-3 分钟
   - 完成后会显示你的应用 URL，格式类似：`https://your-project-name.vercel.app`

### 第三步：上传图像数据

由于 Vercel 是静态部署，你需要将图像文件包含在项目中：

1. **本地添加图像**
   - 将待标注的图像放入 `images/` 目录
   - 可以按分类创建子文件夹，如：
     ```
     images/
     ├── category1/
     │   ├── image1.jpg
     │   └── image2.png
     └── category2/
         ├── image3.jpg
         └── image4.png
     ```

2. **推送更新**
   ```bash
   git add .
   git commit -m "Add images for labeling"
   git push
   ```

3. **自动重新部署**
   - Vercel 会自动检测到 GitHub 的更新
   - 几分钟后新的图像就会在线上可用

## 🔧 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 或使用 nodemon 进行开发
npm run dev
```

## 👥 多人协作使用

### 分享给团队成员
1. 将 Vercel 生成的 URL 分享给团队成员
2. 每个人都可以直接访问进行标注
3. 标注结果会实时保存

### 数据同步说明
⚠️ **重要提醒**：当前版本的标注数据保存在服务器的 `labels.json` 文件中。在 Vercel 的免费版本中，这个文件在每次部署时会被重置。

**推荐的数据持久化方案**：
1. **定期备份**：管理员定期下载 `labels.json` 文件
2. **升级到数据库**：使用 Firebase 或 Supabase（见下方说明）

## 🗄️ 数据持久化升级（可选）

为了避免数据丢失，建议升级到云数据库：

### 方案一：Firebase Firestore
1. 创建 Firebase 项目
2. 启用 Firestore 数据库
3. 修改代码使用 Firebase SDK

### 方案二：Supabase
1. 创建 Supabase 项目
2. 创建标注数据表
3. 使用 Supabase 客户端库

## 📊 功能特性

- ✅ 支持多种图像格式（JPG, PNG, GIF, BMP, WebP）
- ✅ 分类管理和筛选
- ✅ 实时标注进度统计
- ✅ 标注结果导出（CSV 格式）
- ✅ 响应式设计，支持移动设备
- ✅ 标注结果审查和修改
- ✅ 跳过功能和导航控制

## 🔗 有用的链接

- [Vercel 文档](https://vercel.com/docs)
- [GitHub 使用指南](https://docs.github.com/cn)
- [Node.js 官网](https://nodejs.org/)

## 🆘 常见问题

**Q: 部署后无法访问图像？**
A: 确保图像文件已经推送到 GitHub 仓库，并且路径正确。

**Q: 标注数据丢失了？**
A: Vercel 免费版在重新部署时会重置文件。建议定期备份或升级到数据库方案。

**Q: 如何添加新的图像？**
A: 将图像添加到本地 `images/` 目录，然后推送到 GitHub，Vercel 会自动重新部署。

**Q: 可以自定义域名吗？**
A: 可以，在 Vercel 项目设置中可以添加自定义域名。

## 📞 技术支持

如果遇到问题，可以：
1. 检查 Vercel 部署日志
2. 查看浏览器开发者工具的控制台
3. 确认 GitHub 仓库内容是否正确

---

祝你使用愉快！🎉