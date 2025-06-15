# 🏷️ 图像侵权标注工具

一个功能完整的图像标注系统，支持多分类管理、文件上传、云端同步等功能，专为机器学习实验数据集生成而设计。

## 🎯 项目目标

本工具旨在帮助研究人员快速标注图像数据，生成高质量的训练数据集，用于评估AI模型（如GPT-4V、Claude等）在图像侵权检测任务上的性能。支持多人协作、云端同步、数据导出等企业级功能。

## ✨ 核心功能

### 📸 智能图像标注
- **逐张展示**：每次显示一张图像，专注标注
- **二分类标注**：侵权(positive) / 不侵权(negative)
- **快捷操作**：一键标注，自动跳转下一张
- **跳过功能**：可跳过难以判断的图像
- **回顾模式**：查看和修改已标注图像

### 📁 多分类管理
- **分类创建**：通过界面创建新的图像分类
- **分类删除**：删除空的分类目录
- **分类过滤**：按分类筛选显示图像
- **自动检测**：系统自动识别新增分类
- **批量管理**：支持批量操作和管理

### 📤 文件上传系统
- **大批量上传**：一次最多上传2000张图像文件
- **分类上传**：直接上传到指定分类目录
- **格式支持**：JPG, PNG, GIF, BMP, WebP
- **大小限制**：单文件最大10MB
- **进度显示**：实时显示上传进度和状态
- **企业级容量**：支持大规模数据集批量处理

### 🗑️ 文件管理
- **删除图像**：删除当前显示的图像文件
- **批量删除**：选择多个文件进行删除
- **同步删除**：同时删除文件和标注记录
- **安全确认**：删除前需要用户确认

### ☁️ 云端同步
- **Firebase集成**：支持云端数据存储
- **多人协作**：多用户同时标注
- **实时同步**：标注数据实时更新
- **数据备份**：云端自动备份

### 📊 数据统计与导出
- **实时统计**：总数、已标注、剩余数量
- **进度可视化**：标注进度条和百分比
- **详细报告**：按分类、标注者、日期统计
- **多格式导出**：支持CSV和JSON格式导出
- **统计分析**：生成详细的数据分析报告

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备图像数据

在项目根目录创建 `images` 文件夹，并将待标注的图像文件放入其中：

```
image tag/
├── images/
│   ├── image1.jpg
│   ├── image2.png
│   ├── image3.gif
│   └── ...
├── server.js
├── index.html
└── package.json
```

### 3. 启动服务器

```bash
npm start
```

### 4. 开始标注

打开浏览器访问：`http://localhost:3000`

## 📁 项目结构

```
image-label-tool/
├── images/                    # 图像文件目录
│   ├── disney/               # 迪士尼相关图像
│   ├── marvel/               # 漫威相关图像
│   ├── pixar/                # 皮克斯相关图像
│   └── uploads/              # 默认上传目录
├── server.js                 # 后端服务器
├── index.html               # 前端界面
├── firebase-config.js       # Firebase配置
├── package.json             # 项目配置
├── package-lock.json        # 依赖锁定文件
├── labels.json              # 本地标注数据（自动生成）
├── README.md                # 项目说明
├── README_DEPLOY.md         # Vercel部署指南
├── FIREBASE_DEPLOY_GUIDE.md # Firebase部署指南
├── VERCEL_LIMITATIONS.md    # Vercel限制说明
├── 多分类使用说明.md        # 详细使用说明
├── .gitignore               # Git忽略文件
├── railway.toml             # Railway部署配置
└── vercel.json              # Vercel配置文件
```

## 📋 数据格式

### labels.json 格式

```json
{
  "image1.jpg": "positive",
  "image2.png": "negative",
  "image3.gif": "positive"
}
```

### CSV 导出格式

```csv
filename,label
"image1.jpg","positive"
"image2.png","negative"
"image3.gif","positive"
```

## 🔧 API 接口

### 图像管理
```
GET /api/images              # 获取所有图像列表
POST /api/upload             # 上传图像文件
DELETE /api/images/:filename # 删除指定图像
DELETE /api/images           # 批量删除图像
```

### 分类管理
```
GET /api/categories                    # 获取所有分类列表
POST /api/categories                   # 创建新分类
DELETE /api/categories/:categoryName   # 删除分类
```

### 标注数据
```
GET /api/labels              # 获取所有标注数据
POST /api/label              # 保存单个标注
GET /api/stats               # 获取统计信息
GET /api/export/csv          # 导出CSV格式数据
```

### 请求示例

**保存标注**
```json
POST /api/label
Content-Type: application/json

{
  "filename": "disney/mickey.jpg",
  "label": "positive"  // 或 "negative"
}
```

**创建分类**
```json
POST /api/categories
Content-Type: application/json

{
  "categoryName": "new_category"
}
```

**上传文件**
```
POST /api/upload
Content-Type: multipart/form-data

category: disney
files: [image files]
```

## 🎨 界面特色

- **现代化设计**：采用渐变色彩和圆角设计
- **响应式布局**：适配不同屏幕尺寸
- **直观操作**：大按钮设计，操作简单明了
- **实时反馈**：进度条和统计信息实时更新
- **错误处理**：友好的错误提示信息

## 🌐 部署指南

### 本地开发
```bash
# 克隆项目
git clone <repository-url>
cd image-label-tool

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 或启动生产服务器
npm start
```

### 云端部署

#### Vercel 部署
1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（如需要）
4. 自动部署完成

详细步骤请参考：[README_DEPLOY.md](README_DEPLOY.md)

#### Firebase 部署
1. 创建 Firebase 项目
2. 启用 Firestore 数据库
3. 配置 Firebase 认证
4. 部署到 Firebase Hosting

详细步骤请参考：[FIREBASE_DEPLOY_GUIDE.md](FIREBASE_DEPLOY_GUIDE.md)

## 🧪 实验用途

本工具生成的标注数据可用于：

1. **基准数据集创建**：为AI模型评估提供金标准
2. **模型性能评估**：计算Precision、Recall、F1-Score等指标
3. **对比实验**：比较不同AI模型的侵权检测能力
4. **数据集质量分析**：评估人工标注的一致性
5. **多人协作研究**：支持团队协作标注大规模数据集

## 🛠️ 技术栈

### 前端技术
- **HTML5/CSS3**：现代化界面设计
- **JavaScript ES6+**：交互逻辑实现
- **Firebase SDK**：云端数据同步
- **响应式设计**：适配不同设备

### 后端技术
- **Node.js**：服务器运行环境
- **Express.js**：Web 框架
- **Multer**：文件上传处理
- **CORS**：跨域请求支持

### 数据存储
- **本地存储**：JSON 文件存储
- **云端存储**：Firebase Firestore
- **文件系统**：本地图像文件管理

## 💡 最佳实践

### 标注工作流程
1. **准备阶段**：整理图像文件，创建分类目录
2. **上传阶段**：大批量上传图像到对应分类（支持2000张/次）
3. **标注阶段**：按分类逐一进行标注
4. **检查阶段**：使用回顾模式检查标注质量
5. **导出阶段**：生成最终的标注数据集

### 大批量上传最佳实践
- **分批策略**：建议每次上传500-1000张，避免网络超时
- **网络环境**：选择网络稳定的时段进行大批量上传
- **系统准备**：确保足够的磁盘空间（2000张约需20GB+）
- **进度监控**：密切关注上传进度，及时处理异常
- **备份策略**：上传前备份重要数据，避免意外丢失

### 团队协作建议
- **分工明确**：不同成员负责不同分类
- **标准统一**：制定明确的标注标准
- **定期同步**：定期同步云端数据
- **质量控制**：交叉检查标注结果

### 数据管理
- **定期备份**：定期备份 `labels.json` 文件
- **版本控制**：使用 Git 管理项目代码
- **数据验证**：定期检查数据完整性
- **格式转换**：根据需要导出不同格式

## 📚 文档说明

- **[README.md](README.md)**：项目主要说明文档
- **[多分类使用说明.md](多分类使用说明.md)**：详细功能使用指南
- **[README_DEPLOY.md](README_DEPLOY.md)**：Vercel部署指南
- **[FIREBASE_DEPLOY_GUIDE.md](FIREBASE_DEPLOY_GUIDE.md)**：Firebase部署指南
- **[VERCEL_LIMITATIONS.md](VERCEL_LIMITATIONS.md)**：Vercel平台限制说明

## 🔍 故障排除

### 常见问题

**Q: 上传图片失败**
A: 检查文件格式和大小，确保符合要求（JPG/PNG/GIF/BMP/WebP，<10MB）

**Q: 分类不显示**
A: 确保分类目录存在且包含图像文件，或手动创建分类

**Q: 标注数据丢失**
A: 检查 `labels.json` 文件是否存在，启用 Firebase 同步备份

**Q: Firebase 同步失败**
A: 检查网络连接和 Firebase 配置，确保 API 密钥正确

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个工具！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 技术支持

如遇到问题或需要功能建议，请：
1. 查看文档的故障排除部分
2. 检查项目的 GitHub Issues
3. 提交新的 Issue 描述问题
4. 参考相关部署指南文档

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**开始您的高效图像标注之旅！** 🚀

本工具将帮助您快速构建高质量的图像数据集，为机器学习项目提供可靠的训练数据。