// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    initApp();
});

// 初始化应用
function initApp() {
    // 初始化标签页切换
    initTabs();
    // 初始化输入方式切换
    initInputMethods();
    // 初始化图片上传
    initImageUploads();
    // 初始化按钮事件
    initButtons();
    // 初始化模板管理
    initTemplates();
    // 初始化任务列表
    initTasks();
    // 初始化设置
    initSettings();
    // 更新首页统计
    updateDashboardStats();
    // 从本地存储加载数据
    loadData();
}

// 初始化标签页切换
function initTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // 移除所有活动状态
            navTabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 添加当前活动状态
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
                
                // 根据页面类型执行特定初始化
                if (targetTab === 'dashboard') {
                    updateDashboardStats();
                } else if (targetTab === 'tasks') {
                    displayTasks();
                } else if (targetTab === 'templates') {
                    displayTemplates();
                } else if (targetTab === 'settings') {
                    loadSettings();
                }
            }
        });
    });
}

// 初始化输入方式切换
function initInputMethods() {
    const inputMethodButtons = document.querySelectorAll('.input-methods .btn');
    const inputForms = document.querySelectorAll('.input-form');

    inputMethodButtons.forEach(button => {
        button.addEventListener('click', () => {
            const method = button.dataset.method;
            
            // 移除所有活动状态
            inputMethodButtons.forEach(b => b.classList.remove('active'));
            inputForms.forEach(f => f.classList.remove('active'));
            
            // 添加当前活动状态
            button.classList.add('active');
            document.getElementById(method + '-input').classList.add('active');
        });
    });
}

// 初始化图片上传
function initImageUploads() {
    initSingleUpload('main-image', 'main-image-preview');
    initSingleUpload('reference-image', 'reference-preview');
}

// 初始化单个图片上传功能
function initSingleUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const previewContainer = document.getElementById(previewId);

    input.addEventListener('change', function(e) {
        previewContainer.innerHTML = '';
        
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.className = 'preview-image';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    });
}

// 初始化按钮事件
function initButtons() {
    // 生成草稿按钮
    document.getElementById('generate-btn').addEventListener('click', generateDrafts);
    
    // 清空内容按钮
    document.getElementById('clear-btn').addEventListener('click', clearContent);
    
    // 生成测试数据按钮
    document.getElementById('generate-test-data').addEventListener('click', generateTestData);
    
    // 一键生成草稿按钮
    document.getElementById('one-click-generate').addEventListener('click', oneClickGenerate);
    
    // Excel导入功能（模拟）
    document.getElementById('excel-upload').addEventListener('change', handleExcelUpload);
}

// 处理Excel导入
function handleExcelUpload(e) {
    // 这里只是模拟Excel导入功能
    // 实际项目中需要使用Excel解析库如SheetJS
    const file = e.target.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        showMessage('Excel文件已选择，正在解析...', 'info');
        // 模拟解析过程
        setTimeout(() => {
            showMessage('Excel文件解析完成，共导入3个商品', 'success');
        }, 1500);
    } else {
        showMessage('请选择有效的Excel文件（.xlsx或.xls格式）', 'error');
    }
}

// 生成草稿
function generateDrafts() {
    // 获取当前激活的输入方式
    const activeMethod = document.querySelector('.input-methods .btn.active').dataset.method;
    
    let products = [];
    
    if (activeMethod === 'manual') {
        // 获取在线录入的商品信息
        const product = getManualInputData();
        if (product) {
            products.push(product);
        } else {
            return;
        }
    } else {
        // Excel导入（模拟）
        products = mockExcelData();
    }
    
    // 获取上传的图片
    const mainImages = getUploadedImages('main-image');
    const referenceImages = getUploadedImages('reference-image');
    const referenceLink = document.getElementById('reference-link').value;
    
    // 如果没有实际上传的图片，尝试从预览中获取
    if (mainImages.length === 0) {
        const mainPreview = document.getElementById('main-image-preview');
        if (mainPreview) {
            const imgElements = mainPreview.querySelectorAll('img');
            imgElements.forEach(img => {
                mainImages.push(img.src);
            });
        }
    }
    
    if (referenceImages.length === 0) {
        const referencePreview = document.getElementById('reference-image-preview');
        if (referencePreview) {
            const imgElements = referencePreview.querySelectorAll('img');
            imgElements.forEach(img => {
                referenceImages.push(img.src);
            });
        }
    }
    
    // 生成草稿
    const drafts = products.map((product, index) => {
        // 为每个商品分配图片
        const mainImage = mainImages[index] || mainImages[0] || 'https://via.placeholder.com/350x250?prompt=product%20main%20image%20white%20background&image_size=square';
        const referenceImage = referenceImages[index] || referenceImages[0] || null;
        
        return generateProductDraft(product, mainImage, referenceImage, referenceLink);
    });
    
    // 显示生成的草稿
    displayDrafts(drafts);
    
    // 保存商品素材到素材库（如果勾选）
    saveToLibrary(products, mainImages, referenceImages);
}

// 获取在线录入的商品信息
function getManualInputData() {
    const name = document.getElementById('product-name').value.trim();
    
    if (!name) {
        showMessage('请输入商品名称', 'error');
        return null;
    }
    
    return {
        name: name,
        category: document.getElementById('product-category').value.trim(),
        brand: document.getElementById('product-brand').value.trim(),
        material: document.getElementById('product-material').value.trim(),
        size: document.getElementById('product-size').value.trim(),
        color: document.getElementById('product-color').value.trim(),
        audience: document.getElementById('product-audience').value.trim()
    };
}

// 显示消息
function showMessage(message, type = 'info') {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    // 添加样式
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 50px;
        color: white;
        font-weight: bold;
        font-size: 16px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(255, 150, 180, 0.3);
        font-family: 'Comic Sans MS', sans-serif;
        border: 3px solid #fff;
    `;
    
    // 根据类型设置背景色
    if (type === 'error') {
        messageElement.style.backgroundColor = '#ff69b4';
    } else if (type === 'success') {
        messageElement.style.backgroundColor = '#ff1493';
    } else {
        messageElement.style.backgroundColor = '#ffb6c1';
    }
    
    // 添加到页面
    document.body.appendChild(messageElement);
    
    // 3秒后自动移除
    setTimeout(() => {
        messageElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 获取上传的图片
function getUploadedImages(inputId) {
    const input = document.getElementById(inputId);
    const files = Array.from(input.files);
    
    return files.filter(file => file.type.startsWith('image/')).map(file => URL.createObjectURL(file));
}

// 模拟Excel数据
function mockExcelData() {
    return [
        {
            name: '男士商务休闲皮鞋',
            category: '鞋靴 > 皮鞋',
            brand: '商务大师',
            material: '头层牛皮',
            size: '38-44',
            color: '黑色',
            audience: '商务人士'
        },
        {
            name: '女士纯棉T恤',
            category: '服装 > T恤',
            brand: '纯棉生活',
            material: '100%棉',
            size: 'S-XL',
            color: '白色',
            audience: '女性'
        },
        {
            name: '儿童益智积木',
            category: '玩具 > 积木',
            brand: '智慧童年',
            material: '环保塑料',
            size: '200pcs',
            color: '多彩',
            audience: '3-6岁儿童'
        }
    ];
}

// 生成测试数据
function generateTestData() {
    // 切换到手动输入方式
    const manualInputBtn = document.querySelector('.input-methods [data-method="manual"]');
    if (manualInputBtn) {
        manualInputBtn.click();
    }
    
    // 生成随机商品数据
    const testProducts = [
        {
            name: '男士夏季轻薄防晒衣',
            category: '服装 > 外套',
            brand: '户外先锋',
            material: '聚酯纤维',
            size: 'M-XXL',
            color: '浅蓝色',
            audience: '户外爱好者'
        },
        {
            name: '无线蓝牙耳机',
            category: '数码 > 耳机',
            brand: '音动科技',
            material: 'ABS塑料',
            size: '通用',
            color: '白色',
            audience: '年轻人'
        },
        {
            name: '家用空气净化器',
            category: '家电 > 空气净化',
            brand: '清新家居',
            material: 'PP塑料',
            size: '350x450mm',
            color: '白色',
            audience: '家庭用户'
        }
    ];
    
    // 随机选择一个商品
    const randomProduct = testProducts[Math.floor(Math.random() * testProducts.length)];
    
    // 填充表单数据
    document.getElementById('product-name').value = randomProduct.name;
    document.getElementById('product-category').value = randomProduct.category;
    document.getElementById('product-brand').value = randomProduct.brand;
    document.getElementById('product-material').value = randomProduct.material;
    document.getElementById('product-size').value = randomProduct.size;
    document.getElementById('product-color').value = randomProduct.color;
    document.getElementById('product-audience').value = randomProduct.audience;
    
    // 设置参考链接
    document.getElementById('reference-link').value = 'https://example.com/reference-product';
    
    // 模拟上传图片（使用占位图片URL）
    // 这里我们不能直接修改input的files属性，所以我们可以通过显示预览来模拟
    const mainImagePreview = document.getElementById('main-image-preview');
    const referenceImagePreview = document.getElementById('reference-image-preview');
    
    if (mainImagePreview) {
        mainImagePreview.innerHTML = `<div class="preview-item">
            <img src="https://via.placeholder.com/350x250?prompt=${encodeURIComponent(randomProduct.name)}%20product%20image%20white%20background&image_size=square" alt="商品主图">
            <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
        </div>`;
    }
    
    if (referenceImagePreview) {
        referenceImagePreview.innerHTML = `<div class="preview-item">
            <img src="https://via.placeholder.com/350x250?prompt=reference%20product%20image%20marketing%20screenshot&image_size=square" alt="参考素材">
            <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
        </div>`;
    }
    
    // 显示成功消息
    showMessage('测试数据已生成，点击"批量生成草稿"即可开始测试', 'success');
}

// 一键生成草稿
function oneClickGenerate() {
    // 首先生成测试数据
    generateTestData();
    
    // 等待短时间确保DOM更新完成
    setTimeout(() => {
        // 然后生成草稿
        generateDrafts();
    }, 500);
}

// 生成单个商品草稿
function generateProductDraft(product, mainImage, referenceImage, referenceLink) {
    // 生成标题
    const title = generateTitle(product);
    
    // 生成卖点
    const slogans = generateSlogans(product);
    
    return {
        id: Date.now() + Math.random().toString(36).substr(2, 5),
        product: product,
        mainImage: mainImage,
        referenceImage: referenceImage,
        referenceLink: referenceLink,
        title: title,
        slogans: slogans,
        generatedAt: new Date().toISOString()
    };
}

// 生成标题
function generateTitle(product) {
    // 标题生成逻辑
    const parts = [
        product.brand ? product.brand + ' ' : '',
        product.name,
        product.material ? ' ' + product.material : '',
        product.color ? ' ' + product.color : '',
        product.category ? ' ' + product.category.split('>').pop().trim() : ''
    ];
    
    return parts.join('').trim();
}

// 生成卖点
function generateSlogans(product) {
    const slogans = [];
    
    // 核心卖点
    if (product.brand) {
        slogans.push(product.brand + '品牌保证，品质值得信赖');
    }
    
    if (product.material) {
        slogans.push('精选优质' + product.material + '，舒适耐用');
    }
    
    if (product.color) {
        slogans.push(product.color + '经典配色，时尚百搭');
    }
    
    if (product.audience) {
        slogans.push('专为' + product.audience + '设计，贴合需求');
    }
    
    // 补充卖点
    if (slogans.length < 2) {
        slogans.push('优质工艺，细节彰显品质');
    }
    
    return slogans.slice(0, 2);
}

// 显示生成的草稿
function displayDrafts(drafts) {
    const outputList = document.getElementById('output-list');
    const template = document.getElementById('product-draft-template');
    
    outputList.innerHTML = '';
    
    drafts.forEach(draft => {
        const draftElement = createDraftElement(draft, template);
        outputList.appendChild(draftElement);
    });
}

// 创建草稿元素
function createDraftElement(draft, template) {
    const clone = document.importNode(template.content, true);
    const draftElement = clone.querySelector('.product-draft');
    
    // 设置图片
    draftElement.querySelector('.draft-image img').src = draft.mainImage;
    draftElement.querySelector('.draft-image img').alt = draft.product.name;
    
    // 设置标题
    draftElement.querySelector('.draft-title').textContent = draft.title;
    
    // 设置卖点
    const slogansContainer = draftElement.querySelector('.draft-slogans');
    slogansContainer.innerHTML = '';
    draft.slogans.forEach(slogan => {
        const sloganElement = document.createElement('p');
        sloganElement.className = 'draft-slogan';
        sloganElement.textContent = slogan;
        slogansContainer.appendChild(sloganElement);
    });
    
    // 设置收藏按钮事件
    const favoriteButton = draftElement.querySelector('.btn-primary');
    favoriteButton.addEventListener('click', () => {
        saveToTemplate(draft);
        favoriteButton.textContent = '已收藏';
        favoriteButton.disabled = true;
        favoriteButton.style.backgroundColor = '#95a5a6';
    });
    
    // 设置下载按钮事件
    const downloadButton = draftElement.querySelectorAll('.btn-secondary')[0];
    downloadButton.addEventListener('click', () => {
        downloadDraft(draft);
    });
    
    // 设置编辑按钮事件
    const editButton = draftElement.querySelectorAll('.btn-secondary')[1];
    editButton.addEventListener('click', () => {
        editDraft(draft);
    });
    
    return draftElement;
}

// 保存到模板库
function saveToTemplate(draft) {
    let templates = JSON.parse(localStorage.getItem('templates') || '[]');
    
    // 创建模板对象
    const template = {
        id: Date.now().toString(),
        name: draft.title.substring(0, 20) + '...',
        type: 'complete',
        content: {
            title: draft.title,
            slogans: draft.slogans,
            imageUrl: draft.mainImage
        },
        tags: [draft.product.category.split('>')[0].trim(), draft.product.brand || '无品牌'],
        createdBy: 'system',
        createdAt: new Date().toISOString()
    };
    
    templates.push(template);
    localStorage.setItem('templates', JSON.stringify(templates));
    
    // 更新模板库显示
    displayTemplates();
    
    showMessage('模板已收藏！', 'success');
}

// 下载草稿
function downloadDraft(draft) {
    // 这里只是模拟下载功能
    showMessage(`正在下载草稿：${draft.title}`, 'info');
}

// 编辑草稿
function editDraft(draft) {
    // 这里只是模拟编辑功能
    showMessage(`正在编辑草稿：${draft.title}`, 'info');
}

// 保存商品素材到素材库
function saveToLibrary(products, mainImages, referenceImages) {
    const isSaveEnabled = document.getElementById('save-to-library')?.checked || 
                        document.getElementById('save-to-library-excel')?.checked;
    
    if (!isSaveEnabled) return;
    
    let library = JSON.parse(localStorage.getItem('library') || '[]');
    
    products.forEach((product, index) => {
        const item = {
            id: Date.now() + index,
            product: product,
            mainImage: mainImages[index] || null,
            referenceImage: referenceImages[index] || null,
            savedAt: new Date().toISOString()
        };
        
        library.push(item);
    });
    
    localStorage.setItem('library', JSON.stringify(library));
}

// 清空内容
function clearContent() {
    // 清空表单
    document.getElementById('product-name').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('product-brand').value = '';
    document.getElementById('product-material').value = '';
    document.getElementById('product-size').value = '';
    document.getElementById('product-color').value = '';
    document.getElementById('product-audience').value = '';
    document.getElementById('reference-link').value = '';
    
    // 清空图片上传
    document.getElementById('main-image').value = '';
    document.getElementById('reference-image').value = '';
    document.getElementById('main-image-preview').innerHTML = '';
    document.getElementById('reference-preview').innerHTML = '';
    
    // 清空输出
    document.getElementById('output-list').innerHTML = '';
}

// 初始化模板管理
function initTemplates() {
    // 初始化搜索和筛选
    document.getElementById('template-search').addEventListener('input', displayTemplates);
    document.getElementById('template-filter').addEventListener('change', displayTemplates);
    
    // 显示模板
    displayTemplates();
}

// 显示模板
function displayTemplates() {
    const templatesList = document.getElementById('templates-list');
    const searchTerm = document.getElementById('template-search').value.toLowerCase();
    const filterType = document.getElementById('template-filter').value;
    
    let templates = JSON.parse(localStorage.getItem('templates') || '[]');
    
    // 筛选模板
    const filteredTemplates = templates.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchTerm) ||
                            template.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        const matchesFilter = filterType === 'all' || template.type === filterType;
        
        return matchesSearch && matchesFilter;
    });
    
    templatesList.innerHTML = '';
    
    if (filteredTemplates.length === 0) {
        templatesList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">暂无模板</p>';
        return;
    }
    
    filteredTemplates.forEach(template => {
        const templateElement = createTemplateElement(template);
        templatesList.appendChild(templateElement);
    });
}

// 创建模板元素
function createTemplateElement(template) {
    const element = document.createElement('div');
    element.className = 'template-card';
    
    element.innerHTML = `
        <div class="template-header">
            <div class="template-name">${template.name}</div>
            <div class="template-type">${template.type === 'complete' ? '完整组合' : '部分组合'}</div>
        </div>
        <div class="template-tags">
            ${template.tags.map(tag => `<span class="template-tag">${tag}</span>`).join('')}
        </div>
        <div class="template-content">
            ${template.content.imageUrl ? `<img src="${template.content.imageUrl}" alt="模板图片" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 10px;">` : ''}
            ${template.content.title ? `<p><strong>标题：</strong>${template.content.title}</p>` : ''}
            ${template.content.slogans ? `<div><strong>卖点：</strong><br>${template.content.slogans.map(s => '• ' + s).join('<br>')}</div>` : ''}
        </div>
        <div class="template-actions">
            <button class="btn btn-sm btn-primary" onclick="useTemplate('${template.id}')">使用</button>
            <button class="btn btn-sm btn-secondary" onclick="editTemplate('${template.id}')">编辑</button>
            <button class="btn btn-sm btn-secondary" onclick="deleteTemplate('${template.id}')">删除</button>
        </div>
    `;
    
    return element;
}

// 使用模板
function useTemplate(templateId) {
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
        // 这里可以实现模板应用逻辑
        showMessage(`正在使用模板：${template.name}`, 'info');
    }
}

// 编辑模板
function editTemplate(templateId) {
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
        // 这里可以实现模板编辑逻辑
        showMessage(`正在编辑模板：${template.name}`, 'info');
    }
}

// 删除模板
function deleteTemplate(templateId) {
    // 自定义确认对话框
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog';
    confirmDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background-color: #fff0f5;
        padding: 20px;
        border-radius: 20px;
        border: 3px solid #ff69b4;
        box-shadow: 0 8px 16px rgba(255, 105, 180, 0.3);
        width: 90%;
        max-width: 400px;
        text-align: center;
    `;
    
    dialogContent.innerHTML = `
        <h3 style="color: #ff69b4; margin-top: 0;">确认删除</h3>
        <p style="color: #666;">确定要删除此模板吗？此操作不可恢复。</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
            <button id="confirm-delete" class="btn btn-primary">删除</button>
            <button id="cancel-delete" class="btn btn-secondary">取消</button>
        </div>
    `;
    
    confirmDialog.appendChild(dialogContent);
    document.body.appendChild(confirmDialog);
    
    // 添加事件监听
    document.getElementById('confirm-delete').addEventListener('click', () => {
        let templates = JSON.parse(localStorage.getItem('templates') || '[]');
        templates = templates.filter(t => t.id !== templateId);
        localStorage.setItem('templates', JSON.stringify(templates));
        
        // 更新模板列表
        displayTemplates();
        // 更新首页统计
        updateDashboardStats();
        // 显示成功消息
        showMessage('模板已删除', 'success');
        // 移除对话框
        document.body.removeChild(confirmDialog);
    });
    
    document.getElementById('cancel-delete').addEventListener('click', () => {
        document.body.removeChild(confirmDialog);
    });
}

// 导出模板
function exportTemplates() {
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'templates-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    
    showMessage('模板已导出', 'success');
}

// 导入模板
function importTemplates() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedTemplates = JSON.parse(event.target.result);
                let templates = JSON.parse(localStorage.getItem('templates') || '[]');
                
                // 合并模板
                templates = [...templates, ...importedTemplates];
                localStorage.setItem('templates', JSON.stringify(templates));
                
                // 更新模板列表
                displayTemplates();
                // 更新首页统计
                updateDashboardStats();
                // 显示成功消息
                showMessage('模板已导入', 'success');
            } catch (error) {
                showMessage('导入失败，请检查文件格式', 'error');
            }
        };
        
        reader.readAsText(file);
    });
    
    input.click();
}
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background-color: #fff0f5;
        padding: 30px;
        border-radius: 20px;
        max-width: 450px;
        box-shadow: 0 6px 30px rgba(255, 105, 180, 0.4);
        border: 3px solid #ff69b4;
        font-family: 'Comic Sans MS', sans-serif;
    `;
    
    dialogContent.innerHTML = `
        <h3 style="margin-top: 0; color: #ff69b4; text-align: center; font-size: 24px; text-shadow: 2px 2px 0px #fff;">确认删除</h3>
        <p style="margin-bottom: 25px; color: #ff69b4; text-align: center; font-size: 16px; line-height: 1.6;">确定要删除此模板吗？此操作不可恢复哦～</p>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
            <button id="cancel-delete" style="padding: 12px 25px; border: 2px solid #ffb6c1; border-radius: 50px; background-color: white; cursor: pointer; color: #ff69b4; font-weight: bold; font-size: 16px; font-family: 'Comic Sans MS', sans-serif; transition: all 0.3s ease;">取消</button>
            <button id="confirm-delete" style="padding: 12px 25px; border: none; border-radius: 50px; background-color: #ff69b4; cursor: pointer; color: white; font-weight: bold; font-size: 16px; font-family: 'Comic Sans MS', sans-serif; transition: all 0.3s ease;">删除</button>
        </div>
    `;
    
    // 添加按钮悬停效果
    dialogContent.querySelector('#cancel-delete').addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#fff0f5';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(255, 150, 180, 0.3)';
    });
    
    dialogContent.querySelector('#cancel-delete').addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'white';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
    
    dialogContent.querySelector('#confirm-delete').addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#ff1493';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 12px rgba(255, 20, 147, 0.4)';
    });
    
    dialogContent.querySelector('#confirm-delete').addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#ff69b4';
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
    
    confirmDialog.appendChild(dialogContent);
    document.body.appendChild(confirmDialog);
    
    // 取消删除
    dialogContent.querySelector('#cancel-delete').addEventListener('click', () => {
        document.body.removeChild(confirmDialog);
    });
    
    // 确认删除
    dialogContent.querySelector('#confirm-delete').addEventListener('click', () => {
        let templates = JSON.parse(localStorage.getItem('templates') || '[]');
        templates = templates.filter(t => t.id !== templateId);
        localStorage.setItem('templates', JSON.stringify(templates));
        displayTemplates();
        showMessage('模板已删除', 'success');
        document.body.removeChild(confirmDialog);
    });
}

// 从本地存储加载数据
function loadData() {
    // 检查是否有现有数据，没有则初始化
    if (!localStorage.getItem('templates')) {
        localStorage.setItem('templates', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('library')) {
        localStorage.setItem('library', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('tasks')) {
        localStorage.setItem('tasks', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({
            defaultTitleLength: 30,
            defaultSloganCount: 2,
            defaultSaveToLibrary: true,
            titleStyle: 'concise',
            sloganStyle: 'feature',
            imageStyle: 'minimalist',
            language: 'zh-CN',
            theme: 'chiikawa'
        }));
    }
}

// 更新首页统计数据
function updateDashboardStats() {
    const templates = JSON.parse(localStorage.getItem('templates') || '[]');
    const library = JSON.parse(localStorage.getItem('library') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // 更新统计数字
    document.getElementById('total-products').textContent = library.length;
    document.getElementById('total-drafts').textContent = library.length * 2; // 假设每个商品生成2个草稿
    document.getElementById('total-templates').textContent = templates.length;
    document.getElementById('active-tasks').textContent = tasks.filter(task => 
        task.status === 'processing' || task.status === 'pending'
    ).length;
}

// 初始化设置
function initSettings() {
    // 加载设置
    loadSettings();
    
    // 添加保存和恢复默认按钮事件
    const saveSettingsBtn = document.getElementById('save-settings');
    const resetSettingsBtn = document.getElementById('reset-settings');
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', resetSettings);
    }
}

// 加载设置
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('settings') || '[]');
    
    // 设置表单字段
    const defaultTitleLength = document.getElementById('default-title-length');
    const defaultSloganCount = document.getElementById('default-slogan-count');
    const defaultSaveToLibrary = document.getElementById('default-save-to-library');
    const titleStyle = document.getElementById('title-style');
    const sloganStyle = document.getElementById('slogan-style');
    const imageStyle = document.getElementById('image-style');
    const language = document.getElementById('language');
    const theme = document.getElementById('theme');
    
    if (defaultTitleLength) {
        defaultTitleLength.value = settings.defaultTitleLength || 30;
    }
    
    if (defaultSloganCount) {
        defaultSloganCount.value = settings.defaultSloganCount || 2;
    }
    
    if (defaultSaveToLibrary) {
        defaultSaveToLibrary.checked = settings.defaultSaveToLibrary || true;
    }
    
    if (titleStyle) {
        titleStyle.value = settings.titleStyle || 'concise';
    }
    
    if (sloganStyle) {
        sloganStyle.value = settings.sloganStyle || 'feature';
    }
    
    if (imageStyle) {
        imageStyle.value = settings.imageStyle || 'minimalist';
    }
    
    if (language) {
        language.value = settings.language || 'zh-CN';
    }
    
    if (theme) {
        theme.value = settings.theme || 'chiikawa';
    }
}

// 保存设置
function saveSettings() {
    const settings = {
        defaultTitleLength: parseInt(document.getElementById('default-title-length')?.value || '30'),
        defaultSloganCount: parseInt(document.getElementById('default-slogan-count')?.value || '2'),
        defaultSaveToLibrary: document.getElementById('default-save-to-library')?.checked || true,
        titleStyle: document.getElementById('title-style')?.value || 'concise',
        sloganStyle: document.getElementById('slogan-style')?.value || 'feature',
        imageStyle: document.getElementById('image-style')?.value || 'minimalist',
        language: document.getElementById('language')?.value || 'zh-CN',
        theme: document.getElementById('theme')?.value || 'chiikawa'
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
    
    // 显示成功消息
    showMessage('设置已保存', 'success');
}

// 恢复默认设置
function resetSettings() {
    if (confirm('确定要恢复默认设置吗？')) {
        const defaultSettings = {
            defaultTitleLength: 30,
            defaultSloganCount: 2,
            defaultSaveToLibrary: true,
            titleStyle: 'concise',
            sloganStyle: 'feature',
            imageStyle: 'minimalist',
            language: 'zh-CN',
            theme: 'chiikawa'
        };
        
        localStorage.setItem('settings', JSON.stringify(defaultSettings));
        loadSettings();
        
        // 显示成功消息
        showMessage('默认设置已恢复', 'success');
    }
}

// 初始化任务列表
function initTasks() {
    // 为任务列表添加搜索和筛选功能
    const taskSearch = document.getElementById('task-search');
    const taskStatus = document.getElementById('task-status');
    
    if (taskSearch) {
        taskSearch.addEventListener('input', () => {
            displayTasks();
        });
    }
    
    if (taskStatus) {
        taskStatus.addEventListener('change', () => {
            displayTasks();
        });
    }
    
    // 初始化任务列表
    displayTasks();
}

// 显示任务列表
function displayTasks() {
    const taskList = document.getElementById('tasks-list');
    if (!taskList) return;
    
    // 获取任务数据
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    
    // 获取搜索和筛选条件
    const searchTerm = document.getElementById('task-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('task-status')?.value || 'all';
    
    // 过滤任务
    let filteredTasks = tasks;
    
    if (searchTerm) {
        filteredTasks = filteredTasks.filter(task => 
            task.name.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    // 按创建时间排序
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 生成任务列表HTML
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p style="text-align: center; color: #ff69b4; padding: 30px;">暂无任务</p>';
        return;
    }
    
    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item">
            <div class="task-header">
                <div class="task-title">${task.name}</div>
                <div class="task-status ${task.status}">${getStatusText(task.status)}</div>
            </div>
            <div class="task-info">
                <div>商品数量: ${task.productCount}</div>
                <div>创建时间: ${new Date(task.createdAt).toLocaleString()}</div>
                <div>更新时间: ${new Date(task.updatedAt).toLocaleString()}</div>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-primary" onclick="viewTask('${task.id}')">查看</button>
                <button class="btn btn-sm btn-secondary" onclick="editTask('${task.id}')">编辑</button>
                ${task.status === 'pending' ? `<button class="btn btn-sm btn-primary" onclick="startTask('${task.id}')">开始</button>` : ''}
                ${task.status === 'processing' ? `<button class="btn btn-sm btn-secondary" onclick="pauseTask('${task.id}')">暂停</button>` : ''}
                <button class="btn btn-sm btn-secondary" onclick="deleteTask('${task.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        pending: '待处理',
        processing: '处理中',
        completed: '已完成',
        failed: '失败'
    };
    return statusMap[status] || status;
}

// 添加新任务
function addNewTask() {
    const task = {
        id: Date.now().toString(),
        name: '新任务-' + new Date().toLocaleDateString(),
        description: '请填写任务描述',
        productCount: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.unshift(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // 更新任务列表
    displayTasks();
    // 更新首页统计
    updateDashboardStats();
    // 显示成功消息
    showMessage('任务已创建', 'success');
}

// 查看任务
function viewTask(taskId) {
    // 这里可以实现任务详情查看逻辑
    showMessage('查看任务详情', 'info');
}

// 编辑任务
function editTask(taskId) {
    // 这里可以实现任务编辑逻辑
    showMessage('编辑任务', 'info');
}

// 开始任务
function startTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].status = 'processing';
        tasks[taskIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateDashboardStats();
        showMessage('任务已开始', 'success');
    }
}

// 暂停任务
function pauseTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].status = 'pending';
        tasks[taskIndex].updatedAt = new Date().toISOString();
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateDashboardStats();
        showMessage('任务已暂停', 'info');
    }
}

// 删除任务
function deleteTask(taskId) {
    if (confirm('确定要删除此任务吗？')) {
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        tasks = tasks.filter(task => task.id !== taskId);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        displayTasks();
        updateDashboardStats();
        showMessage('任务已删除', 'success');
    }
}
