# 🏷️ Image IP Labeling Tool

一个用于图像侵权检测的人工标注系统，专为机器学习实验数据集生成而设计。

## 🎯 项目目标

本工具旨在帮助研究人员快速标注图像数据，生成高质量的训练数据集，用于评估AI模型（如GPT-4V、Claude等）在图像侵权检测任务上的性能。

## ✨ 核心功能

### 📸 图像逐张展示
- 每次页面加载一张图像
- 自动从本地 `images/` 目录读取图像文件
- 支持多种图像格式：JPG, PNG, GIF, BMP, WebP

### 🔘 二分类标注
- **✅ 侵权**：标记为正样本 (positive)
- **❌ 不侵权**：标记为负样本 (negative)
- 一键标注，自动跳转到下一张图像

### 💾 智能数据管理
- 标注结果自动保存到 `labels.json` 文件
- 支持导出为 CSV 格式
- 自动跳过已标注的图像
- 实时显示标注进度

### 📊 统计信息
- 总图像数量
- 已标注数量
- 剩余待标注数量
- 标注进度条

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
image tag/
├── images/              # 待标注图像目录
├── index.html          # 前端界面
├── server.js           # 后端服务器
├── package.json        # 项目配置
├── labels.json         # 标注结果（自动生成）
└── README.md           # 项目说明
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

### 获取图像列表
```
GET /api/images
```

### 获取已有标签
```
GET /api/labels
```

### 保存标签
```
POST /api/label
Content-Type: application/json

{
  "filename": "image1.jpg",
  "label": "positive"  // 或 "negative"
}
```

### 获取统计信息
```
GET /api/stats
```

### 导出CSV
```
GET /api/export/csv
```

## 🎨 界面特色

- **现代化设计**：采用渐变色彩和圆角设计
- **响应式布局**：适配不同屏幕尺寸
- **直观操作**：大按钮设计，操作简单明了
- **实时反馈**：进度条和统计信息实时更新
- **错误处理**：友好的错误提示信息

## 🧪 实验用途

本工具生成的标注数据可用于：

1. **基准数据集创建**：为AI模型评估提供金标准
2. **模型性能评估**：计算Precision、Recall、F1-Score等指标
3. **对比实验**：比较不同AI模型的侵权检测能力
4. **数据集质量分析**：评估人工标注的一致性

## 🔧 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **后端**：Node.js, Express.js
- **数据存储**：JSON文件
- **图像处理**：浏览器原生支持

## 📝 使用建议

1. **标注一致性**：建议多人标注同一批数据，提高标注质量
2. **定期备份**：及时备份 `labels.json` 文件
3. **批量处理**：建议每次标注50-100张图像后休息
4. **质量检查**：定期回顾已标注的数据，确保标注准确性

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个工具！

## 📄 许可证

MIT License - 详见 LICENSE 文件

---

**开始您的图像标注之旅吧！** 🚀