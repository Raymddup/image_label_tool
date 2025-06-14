# 🚀 Firebase + Vercel + GitHub 完整部署指南

## 📋 部署概览

这个指南将帮你完成以下部署架构：
- **GitHub**: 代码托管和版本控制
- **Firebase Firestore**: 云数据库存储标注数据
- **Vercel**: 网站托管和部署
- **多人协作**: 支持团队成员同时标注

## 🎯 优势
- ✅ **数据永不丢失**: Firebase 云数据库自动备份
- ✅ **实时同步**: 多人标注实时更新
- ✅ **免费使用**: 所有服务都有充足的免费额度
- ✅ **自动部署**: 代码更新自动重新部署
- ✅ **全球访问**: 任何地方都能访问

---

## 第一步：创建 Firebase 项目

### 1.1 注册 Firebase 账号
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 使用 Google 账号登录
3. 点击 "创建项目" 或 "Add project"

### 1.2 创建项目
1. **项目名称**: `image-labeling-tool`（或你喜欢的名称）
2. **Google Analytics**: 可以关闭（不需要）
3. 点击 "创建项目"
4. 等待项目创建完成

### 1.3 启用 Firestore 数据库
1. 在 Firebase 控制台左侧菜单点击 "Firestore Database"
2. 点击 "创建数据库"
3. **安全规则**: 选择 "以测试模式启动"（稍后会修改）
4. **位置**: 选择 "asia-east1 (台湾)" 或最近的位置
5. 点击 "完成"

### 1.4 获取 Firebase 配置
1. 点击左侧菜单的 "项目设置"（齿轮图标）
2. 滚动到 "你的应用" 部分
3. 点击 "</> Web" 图标
4. **应用昵称**: `image-labeling-web`
5. **不要**勾选 "Firebase Hosting"
6. 点击 "注册应用"
7. **重要**: 复制配置代码，格式如下：
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### 1.5 配置 Firestore 安全规则
1. 在 Firestore Database 页面点击 "规则" 标签
2. 将规则修改为：
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // 允许读写 labels 集合
       match /labels/{document} {
         allow read, write: if true;
       }
     }
   }
   ```
3. 点击 "发布"

---

## 第二步：配置项目代码

### 2.1 更新 Firebase 配置
打开 `index.html` 文件，找到这部分代码：
```javascript
// Firebase 配置 - 请替换为你的实际配置
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};
```

**替换为你在步骤 1.4 中获取的实际配置！**

### 2.2 测试 Firebase 连接（可选）
在项目目录打开命令行，运行：
```bash
npm start
```
访问 `http://localhost:3000`，打开浏览器开发者工具，应该能看到 "从 Firebase 加载标签" 的日志。

---

## 第三步：部署到 GitHub

### 3.1 初始化 Git 仓库
在项目目录中运行：
```bash
git init
git add .
git commit -m "Initial commit with Firebase integration"
```

### 3.2 创建 GitHub 仓库
1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. **仓库名称**: `image-labeling-firebase`
4. **可见性**: Public（免费用户必须选择）
5. **不要**勾选任何初始化选项
6. 点击 "Create repository"

### 3.3 推送代码到 GitHub
```bash
# 替换为你的实际 GitHub 用户名和仓库名
git remote add origin https://github.com/你的用户名/image-labeling-firebase.git
git branch -M main
git push -u origin main
```

---

## 第四步：部署到 Vercel

### 4.1 注册 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"
4. 授权 Vercel 访问你的 GitHub

### 4.2 导入项目
1. 在 Vercel 控制台点击 "New Project"
2. 找到你的 `image-labeling-firebase` 仓库
3. 点击 "Import"

### 4.3 配置部署设置
- **Project Name**: 保持默认或修改
- **Framework Preset**: 选择 "Other"
- **Root Directory**: 保持默认 "./"
- **Build and Output Settings**: 保持默认
- 点击 "Deploy"

### 4.4 等待部署完成
- 部署通常需要 2-3 分钟
- 完成后会显示你的应用 URL：`https://your-project.vercel.app`

---

## 第五步：添加图像数据

### 5.1 准备图像文件
将待标注的图像放入 `images/` 目录，支持子文件夹分类：
```
images/
├── category1/
│   ├── image1.jpg
│   └── image2.png
├── category2/
│   ├── image3.jpg
│   └── image4.png
└── other/
    └── image5.jpg
```

### 5.2 推送图像到 GitHub
```bash
git add .
git commit -m "Add images for labeling"
git push
```

### 5.3 自动重新部署
Vercel 会自动检测到更新并重新部署，几分钟后新图像就可以在线访问了。

---

## 第六步：团队协作设置

### 6.1 分享访问链接
将 Vercel 生成的 URL 分享给团队成员：
`https://your-project.vercel.app`

### 6.2 用户识别
- 每个用户首次标注时会提示输入用户名
- 用户名会保存在浏览器中，用于标识标注者
- 所有标注记录都会包含标注者信息

### 6.3 协作最佳实践
1. **分工标注**: 建议不同成员标注不同类别
2. **定期沟通**: 讨论标注标准和疑难案例
3. **质量检查**: 使用复查功能检查标注质量

---

## 🔧 管理和维护

### 数据查看
1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击 "Firestore Database"
4. 查看 "labels" 集合中的所有标注数据

### 数据导出
访问 `https://your-project.vercel.app/api/export/csv` 下载 CSV 格式的标注结果。

### 添加新图像
1. 将新图像添加到本地 `images/` 目录
2. 推送到 GitHub：
   ```bash
   git add .
   git commit -m "Add new images"
   git push
   ```
3. Vercel 自动重新部署

### 更新代码
任何代码修改都可以通过 Git 推送自动部署：
```bash
git add .
git commit -m "描述你的更改"
git push
```

---

## 🎉 完成！

现在你的图像标注工具已经完全部署并支持多人协作了！

### ✅ 你获得了什么：
- 🌐 **在线访问**: 任何地方都能使用
- 👥 **多人协作**: 团队成员同时标注
- 💾 **数据安全**: Firebase 自动备份，永不丢失
- 🔄 **实时同步**: 标注结果实时更新
- 📊 **详细记录**: 包含标注者和时间信息
- 🚀 **自动部署**: 代码更新自动上线

### 📞 技术支持

**常见问题：**

**Q: Firebase 配置错误怎么办？**
A: 检查 `index.html` 中的 Firebase 配置是否与 Firebase Console 中的完全一致。

**Q: 标注数据没有保存？**
A: 打开浏览器开发者工具查看控制台错误信息，通常是 Firebase 配置或网络问题。

**Q: 如何查看所有标注数据？**
A: 访问 Firebase Console → Firestore Database → labels 集合。

**Q: 可以自定义域名吗？**
A: 可以，在 Vercel 项目设置中添加自定义域名。

**Q: Firebase 免费额度够用吗？**
A: 对于中小型标注项目完全够用。免费额度包括：
- 1GB 存储空间
- 每天 50,000 次读取
- 每天 20,000 次写入

---

🎊 **恭喜！你现在拥有了一个专业级的在线图像标注平台！**