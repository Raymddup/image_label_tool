const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const IMAGES_DIR = path.join(__dirname, 'images');
const LABELS_FILE = path.join(__dirname, 'labels.json');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 静态文件服务 - 图像文件
app.use('/images', express.static(IMAGES_DIR));

// 支持的图像格式
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

// 检查文件是否为图像
function isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
}

// 递归获取所有图像文件
async function getAllImages(dir, baseDir = dir) {
    const images = [];
    
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                // 递归处理子目录
                const subImages = await getAllImages(fullPath, baseDir);
                images.push(...subImages);
            } else if (item.isFile() && isImageFile(item.name)) {
                // 计算相对路径
                const relativePath = path.relative(baseDir, fullPath);
                const normalizedPath = relativePath.replace(/\\/g, '/');
                images.push({
                    filename: normalizedPath,
                    category: path.dirname(relativePath) === '.' ? 'root' : path.dirname(relativePath),
                    basename: item.name
                });
            }
        }
    } catch (error) {
        console.error(`读取目录失败 ${dir}:`, error);
    }
    
    return images;
}

// API: 获取图像列表
app.get('/api/images', async (req, res) => {
    try {
        // 检查images目录是否存在
        try {
            await fs.access(IMAGES_DIR);
        } catch (error) {
            // 如果目录不存在，创建它
            await fs.mkdir(IMAGES_DIR, { recursive: true });
            console.log('创建了images目录');
        }

        const images = await getAllImages(IMAGES_DIR);
        
        console.log(`找到 ${images.length} 张图像`);
        res.json(images);
    } catch (error) {
        console.error('获取图像列表失败:', error);
        res.status(500).json({ error: '无法读取图像目录' });
    }
});

// API: 获取分类列表
app.get('/api/categories', async (req, res) => {
    try {
        const images = await getAllImages(IMAGES_DIR);
        const categories = [...new Set(images.map(img => img.category))];
        res.json(categories);
    } catch (error) {
        console.error('获取分类列表失败:', error);
        res.status(500).json({ error: '无法获取分类列表' });
    }
});

// API: 获取已有标签
app.get('/api/labels', async (req, res) => {
    try {
        const data = await fs.readFile(LABELS_FILE, 'utf8');
        const labels = JSON.parse(data);
        res.json(labels);
    } catch (error) {
        // 如果文件不存在，返回空对象
        if (error.code === 'ENOENT') {
            res.json({});
        } else {
            console.error('读取标签文件失败:', error);
            res.status(500).json({ error: '无法读取标签文件' });
        }
    }
});

// API: 保存标签
app.post('/api/label', async (req, res) => {
    try {
        const { filename, label } = req.body;
        
        if (!filename || !label) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        if (!['positive', 'negative'].includes(label)) {
            return res.status(400).json({ error: '无效的标签值' });
        }

        // 读取现有标签
        let labels = {};
        try {
            const data = await fs.readFile(LABELS_FILE, 'utf8');
            labels = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        // 添加新标签
        labels[filename] = label;

        // 保存到文件
        await fs.writeFile(LABELS_FILE, JSON.stringify(labels, null, 2));
        
        console.log(`标注保存: ${filename} -> ${label}`);
        res.json({ success: true });
    } catch (error) {
        console.error('保存标签失败:', error);
        res.status(500).json({ error: '无法保存标签' });
    }
});

// API: 获取标注统计
app.get('/api/stats', async (req, res) => {
    try {
        // 获取图像列表
        const images = await getAllImages(IMAGES_DIR);
        const totalImages = images.length;

        // 获取标签
        let labels = {};
        try {
            const data = await fs.readFile(LABELS_FILE, 'utf8');
            labels = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }

        const labeledCount = Object.keys(labels).length;
        const positiveCount = Object.values(labels).filter(l => l === 'positive').length;
        const negativeCount = Object.values(labels).filter(l => l === 'negative').length;

        // 按分类统计
        const categoryStats = {};
        images.forEach(img => {
            const category = img.category;
            if (!categoryStats[category]) {
                categoryStats[category] = {
                    total: 0,
                    labeled: 0,
                    positive: 0,
                    negative: 0
                };
            }
            categoryStats[category].total++;
            
            if (labels[img.filename]) {
                categoryStats[category].labeled++;
                if (labels[img.filename] === 'positive') {
                    categoryStats[category].positive++;
                } else {
                    categoryStats[category].negative++;
                }
            }
        });

        res.json({
            totalImages,
            labeledCount,
            remainingCount: totalImages - labeledCount,
            positiveCount,
            negativeCount,
            progress: totalImages > 0 ? (labeledCount / totalImages) * 100 : 0,
            categoryStats
        });
    } catch (error) {
        console.error('获取统计信息失败:', error);
        res.status(500).json({ error: '无法获取统计信息' });
    }
});

// API: 导出标签为CSV格式
app.get('/api/export/csv', async (req, res) => {
    try {
        const data = await fs.readFile(LABELS_FILE, 'utf8');
        const labels = JSON.parse(data);
        
        let csv = 'filename,label\n';
        for (const [filename, label] of Object.entries(labels)) {
            csv += `"${filename}","${label}"\n`;
        }
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="labels.csv"');
        res.send(csv);
    } catch (error) {
        console.error('导出CSV失败:', error);
        res.status(500).json({ error: '无法导出CSV文件' });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器（仅在本地开发时）
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 图像标注服务器已启动`);
        console.log(`📱 访问地址: http://localhost:${PORT}`);
        console.log(`📁 图像目录: ${IMAGES_DIR}`);
        console.log(`📋 标签文件: ${LABELS_FILE}`);
        console.log('\n请将待标注的图像文件放入 images/ 目录中');
        console.log('支持的格式: ' + SUPPORTED_FORMATS.join(', '));
    });

    // 优雅关闭
    process.on('SIGINT', () => {
        console.log('\n正在关闭服务器...');
        process.exit(0);
    });
}

// 导出app供Vercel使用
module.exports = app;