const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

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

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const category = req.body.category || 'uploads';
        const uploadPath = path.join(IMAGES_DIR, category);
        
        console.log(`Multer destination - category: ${category}`);
        console.log(`Multer destination - IMAGES_DIR: ${IMAGES_DIR}`);
        console.log(`Multer destination - uploadPath: ${uploadPath}`);
        console.log(`Multer destination - __dirname: ${__dirname}`);
        
        // 确保目录存在
        fs.mkdir(uploadPath, { recursive: true })
            .then(() => {
                console.log(`Multer destination - 目录创建成功: ${uploadPath}`);
                cb(null, uploadPath);
            })
            .catch(err => {
                console.error(`Multer destination - 目录创建失败:`, err);
                cb(err);
            });
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名，保持原始扩展名
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const fileName = `${baseName}_${timestamp}_${randomSuffix}${ext}`;
        cb(null, fileName);
    }
});

// 文件过滤器，只允许图片文件
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (SUPPORTED_FORMATS.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`不支持的文件格式: ${ext}。支持的格式: ${SUPPORTED_FORMATS.join(', ')}`), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制文件大小为10MB
    }
});

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
        // 获取所有包含图片的分类
        const images = await getAllImages(IMAGES_DIR);
        const categoriesFromImages = [...new Set(images.map(img => img.category))];
        
        // 获取所有分类目录（包括空目录）
        const categoriesFromDirs = [];
        try {
            const items = await fs.readdir(IMAGES_DIR, { withFileTypes: true });
            for (const item of items) {
                if (item.isDirectory()) {
                    categoriesFromDirs.push(item.name);
                }
            }
        } catch (error) {
            console.log('读取分类目录失败:', error);
        }
        
        // 合并两个列表，去重
        const allCategories = [...new Set([...categoriesFromImages, ...categoriesFromDirs])];
        
        console.log('找到的分类:', allCategories);
        res.json(allCategories);
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

// API: 上传图片
app.post('/api/upload', (req, res, next) => {
    // 检查是否在 Vercel 等无服务器环境中
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        return res.status(400).json({ 
            error: '云端部署环境不支持文件上传。请在本地添加图片到对应分类文件夹，然后推送到 GitHub 重新部署。' 
        });
    }
    
    // 如果不在云端环境，继续处理上传
    upload.array('images', 10)(req, res, async (err) => {
        if (err) {
            console.error('Multer 上传错误:', err);
            return res.status(500).json({ error: '文件上传失败: ' + err.message });
        }
        
        try {
            console.log('收到上传请求');
            console.log('req.files:', req.files ? req.files.length : 0);
            console.log('req.body:', req.body);
            
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: '没有上传任何文件' });
            }

            const uploadedFiles = [];
            const category = req.body.category || 'uploads';
            console.log(`上传分类: ${category}`);
            
            for (const file of req.files) {
                console.log(`处理文件: ${file.originalname}, 路径: ${file.path}`);
                const relativePath = path.relative(IMAGES_DIR, file.path).replace(/\\/g, '/');
                uploadedFiles.push({
                    originalName: file.originalname,
                    filename: relativePath,
                    category: category,
                    size: file.size,
                    uploadTime: new Date().toISOString()
                });
            }

            console.log(`成功上传 ${uploadedFiles.length} 个文件到分类: ${category}`);
            res.json({ 
                success: true, 
                message: `成功上传 ${uploadedFiles.length} 个文件`,
                files: uploadedFiles 
            });
        } catch (error) {
            console.error('上传文件失败:', error);
            console.error('错误详情:', {
                message: error.message,
                code: error.code,
                path: error.path,
                stack: error.stack
            });
            res.status(500).json({ error: '上传失败: ' + error.message });
        }
    });
});

// API: 创建新分类
app.post('/api/categories', async (req, res) => {
    try {
        // 检查是否在 Vercel 等无服务器环境中
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            return res.status(400).json({ 
                error: '云端部署环境不支持动态创建分类目录。请在本地项目的 images/ 目录下手动创建分类文件夹，然后推送到 GitHub 重新部署。' 
            });
        }
        
        const { categoryName } = req.body;
        
        if (!categoryName || categoryName.trim() === '') {
            return res.status(400).json({ error: '分类名称不能为空' });
        }
        
        // 验证分类名称（只允许字母、数字、下划线和中文）
        if (!/^[\w\u4e00-\u9fa5]+$/.test(categoryName)) {
            return res.status(400).json({ error: '分类名称只能包含字母、数字、下划线和中文字符' });
        }
        
        const categoryPath = path.join(IMAGES_DIR, categoryName);
        console.log(`尝试创建分类目录: ${categoryPath}`);
        console.log(`当前工作目录: ${process.cwd()}`);
        console.log(`__dirname: ${__dirname}`);
        console.log(`IMAGES_DIR: ${IMAGES_DIR}`);
        
        // 检查分类是否已存在
        try {
            await fs.access(categoryPath);
            return res.status(400).json({ error: '分类已存在' });
        } catch (error) {
            // 分类不存在，可以创建
        }
        
        // 确保父目录存在
        await fs.mkdir(IMAGES_DIR, { recursive: true });
        
        // 创建分类目录
        await fs.mkdir(categoryPath, { recursive: true });
        
        console.log(`创建新分类成功: ${categoryName} -> ${categoryPath}`);
        res.json({ success: true, message: `分类 "${categoryName}" 创建成功` });
    } catch (error) {
        console.error('创建分类失败:', error);
        console.error('错误详情:', {
            message: error.message,
            code: error.code,
            path: error.path,
            stack: error.stack
        });
        res.status(500).json({ error: '创建分类失败: ' + error.message });
    }
});

// API: 删除分类
app.delete('/api/categories/:categoryName', async (req, res) => {
    try {
        // 检查是否在 Vercel 等无服务器环境中
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
            return res.status(400).json({ 
                error: '云端部署环境不支持删除分类目录。请在本地项目中手动删除分类文件夹，然后推送到 GitHub 重新部署。' 
            });
        }
        
        const categoryName = req.params.categoryName;
        
        if (!categoryName || categoryName.trim() === '') {
            return res.status(400).json({ error: '分类名称不能为空' });
        }
        
        // 不允许删除特殊分类
        if (categoryName === 'root' || categoryName === 'uploads') {
            return res.status(400).json({ error: '不能删除系统默认分类' });
        }
        
        const categoryPath = path.join(IMAGES_DIR, categoryName);
        console.log(`尝试删除分类目录: ${categoryPath}`);
        
        // 检查分类目录是否存在
        try {
            await fs.access(categoryPath);
        } catch (error) {
            return res.status(404).json({ error: '分类不存在' });
        }
        
        // 检查目录是否为空
        const items = await fs.readdir(categoryPath);
        if (items.length > 0) {
            return res.status(400).json({ 
                error: `分类 "${categoryName}" 不为空，包含 ${items.length} 个文件。请先删除分类中的所有文件。` 
            });
        }
        
        // 删除空目录
        await fs.rmdir(categoryPath);
        
        console.log(`删除分类成功: ${categoryName}`);
        res.json({ success: true, message: `分类 "${categoryName}" 删除成功` });
    } catch (error) {
        console.error('删除分类失败:', error);
        res.status(500).json({ error: '删除分类失败: ' + error.message });
    }
});

// API: 删除图片
app.delete('/api/images/:filename(*)', async (req, res) => {
    try {
        const filename = req.params.filename;
        
        if (!filename) {
            return res.status(400).json({ error: '文件名不能为空' });
        }
        
        const imagePath = path.join(IMAGES_DIR, filename);
        
        // 检查文件是否存在
        try {
            await fs.access(imagePath);
        } catch (error) {
            return res.status(404).json({ error: '文件不存在' });
        }
        
        // 删除物理文件
        await fs.unlink(imagePath);
        
        // 删除标签记录
        let labels = {};
        try {
            const data = await fs.readFile(LABELS_FILE, 'utf8');
            labels = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('读取标签文件失败:', error);
            }
        }
        
        // 从标签记录中删除该图片
        if (labels[filename]) {
            delete labels[filename];
            
            // 保存更新后的标签文件
            await fs.writeFile(LABELS_FILE, JSON.stringify(labels, null, 2));
        }
        
        console.log(`删除图片: ${filename}`);
        res.json({ success: true, message: `图片 "${filename}" 删除成功` });
    } catch (error) {
        console.error('删除图片失败:', error);
        res.status(500).json({ error: '删除图片失败: ' + error.message });
    }
});

// API: 批量删除图片
app.delete('/api/images', async (req, res) => {
    try {
        const { filenames } = req.body;
        
        if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
            return res.status(400).json({ error: '请提供要删除的文件列表' });
        }
        
        const results = {
            success: [],
            failed: []
        };
        
        // 读取标签文件
        let labels = {};
        try {
            const data = await fs.readFile(LABELS_FILE, 'utf8');
            labels = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('读取标签文件失败:', error);
            }
        }
        
        // 逐个删除文件
        for (const filename of filenames) {
            try {
                const imagePath = path.join(IMAGES_DIR, filename);
                
                // 检查文件是否存在
                await fs.access(imagePath);
                
                // 删除物理文件
                await fs.unlink(imagePath);
                
                // 从标签记录中删除
                if (labels[filename]) {
                    delete labels[filename];
                }
                
                results.success.push(filename);
            } catch (error) {
                results.failed.push({ filename, error: error.message });
            }
        }
        
        // 保存更新后的标签文件
        if (results.success.length > 0) {
            await fs.writeFile(LABELS_FILE, JSON.stringify(labels, null, 2));
        }
        
        console.log(`批量删除完成: 成功 ${results.success.length} 个，失败 ${results.failed.length} 个`);
        res.json({ 
            success: true, 
            message: `删除完成: 成功 ${results.success.length} 个，失败 ${results.failed.length} 个`,
            results 
        });
    } catch (error) {
        console.error('批量删除图片失败:', error);
        res.status(500).json({ error: '批量删除失败: ' + error.message });
    }
});

// 根路径路由 - 提供 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理所有其他路径，也返回 index.html（用于单页应用）
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
if (require.main === module) {
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