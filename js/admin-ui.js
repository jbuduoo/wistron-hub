// 後台管理 UI 邏輯

let sidebarItems = [];
let formFields = [];
let fieldTemplates = [];
let editingSidebarId = null;
let editingFieldId = null;
let editingTemplateId = null;
let currentContentTypeForTemplate = null; // 記錄從哪個內容類型打開模板選擇器

// 初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 檢查管理員權限
    if (!checkAdminAccess()) {
        return;
    }
    
    // 顯示管理員資訊
    const user = Auth.getCurrentUser();
    if (user) {
        const adminUserInfo = document.getElementById('adminUserInfo');
        if (adminUserInfo) {
            adminUserInfo.textContent = `管理員: ${user.name || user.username}`;
        }
    }
    
    // 載入側邊欄配置
    await loadSidebarConfig();
    
    // 先載入欄位模板（表單欄位渲染需要模板）
    await loadFieldTemplates();
    
    // 載入表單欄位配置（會調用 renderFormFields，此時模板已載入）
    await loadFormFieldsConfig();
    
    // 綁定表單提交事件
    document.getElementById('sidebarForm').addEventListener('submit', handleSidebarSubmit);
    document.getElementById('fieldForm').addEventListener('submit', handleFieldSubmit);
    document.getElementById('templateForm').addEventListener('submit', handleTemplateSubmit);
    
    // 監聽模板欄位類型變化
    const templateFieldType = document.getElementById('templateFieldType');
    if (templateFieldType) {
        templateFieldType.addEventListener('change', function() {
            const optionsGroup = document.getElementById('templateOptionsGroup');
            if (this.value === 'select') {
                optionsGroup.style.display = 'block';
            } else {
                optionsGroup.style.display = 'none';
            }
        });
    }
    
    // 監聽欄位類型變化
    document.getElementById('fieldType').addEventListener('change', function() {
        const optionsGroup = document.getElementById('fieldOptionsGroup');
        if (this.value === 'select') {
            optionsGroup.style.display = 'block';
        } else {
            optionsGroup.style.display = 'none';
        }
    });
});

// 切換標籤頁
function switchTab(tabName) {
    // 更新標籤按鈕狀態
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 更新內容顯示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'sidebar') {
        document.getElementById('sidebarTab').classList.add('active');
    } else if (tabName === 'fields') {
        document.getElementById('fieldsTab').classList.add('active');
    } else if (tabName === 'templates') {
        document.getElementById('templatesTab').classList.add('active');
        // 切換到模板標籤頁時，確保模板列表已載入並渲染
        if (fieldTemplates.length === 0) {
            loadFieldTemplates();
        } else {
            renderTemplatesList();
        }
    }
}

// 載入側邊欄配置
async function loadSidebarConfig() {
    sidebarItems = await getSidebarConfig();
    renderSidebarList();
}

// 渲染側邊欄列表
function renderSidebarList() {
    const list = document.getElementById('sidebarList');
    if (!list) return;
    
    // 按順序排序
    const sortedItems = [...sidebarItems].sort((a, b) => a.order - b.order);
    
    list.innerHTML = sortedItems.map(item => `
        <li class="item-list-item" data-id="${item.id}">
            <span class="drag-handle">☰</span>
            <div class="item-info">
                <span class="item-icon">${item.icon}</span>
                <span class="item-label">${item.label}</span>
                <span class="item-filter">${item.filter}</span>
                ${!item.enabled ? '<span style="color: #999;">(已停用)</span>' : ''}
            </div>
            <div class="item-actions">
                <button class="btn-small" onclick="editSidebarItem('${item.id}')">編輯</button>
                <button class="btn-small btn-danger" onclick="deleteSidebarItem('${item.id}')">刪除</button>
            </div>
        </li>
    `).join('');
    
    // 添加拖拽排序功能
    initDragAndDrop();
}

// 拖拽排序
function initDragAndDrop() {
    const list = document.getElementById('sidebarList');
    if (!list) return;
    
    let draggedElement = null;
    
    list.querySelectorAll('.item-list-item').forEach(item => {
        item.draggable = true;
        
        item.addEventListener('dragstart', function(e) {
            draggedElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            // 更新順序
            updateSidebarOrder();
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggedElement);
            } else {
                list.insertBefore(draggedElement, afterElement);
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.item-list-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 更新側邊欄順序
async function updateSidebarOrder() {
    const list = document.getElementById('sidebarList');
    const items = list.querySelectorAll('.item-list-item');
    
    items.forEach((item, index) => {
        const id = item.getAttribute('data-id');
        const sidebarItem = sidebarItems.find(i => i.id === id);
        if (sidebarItem) {
            sidebarItem.order = index + 1;
        }
    });
    
    await saveSidebarConfig(sidebarItems);
    showAlert('順序已更新', 'success');
}

// 顯示新增側邊欄項目 Modal
function showAddSidebarModal() {
    editingSidebarId = null;
    document.getElementById('sidebarModalTitle').textContent = '新增側邊欄項目';
    document.getElementById('sidebarForm').reset();
    document.getElementById('sidebarItemId').value = '';
    document.getElementById('sidebarModal').classList.add('active');
}

// 編輯側邊欄項目
function editSidebarItem(id) {
    const item = sidebarItems.find(i => i.id === id);
    if (!item) return;
    
    editingSidebarId = id;
    document.getElementById('sidebarModalTitle').textContent = '編輯側邊欄項目';
    document.getElementById('sidebarItemId').value = item.id;
    document.getElementById('sidebarFilter').value = item.filter;
    document.getElementById('sidebarIcon').value = item.icon;
    document.getElementById('sidebarLabel').value = item.label;
    document.getElementById('sidebarOrder').value = item.order;
    document.getElementById('sidebarEnabled').checked = item.enabled !== false;
    document.getElementById('sidebarModal').classList.add('active');
}

// 刪除側邊欄項目
async function deleteSidebarItem(id) {
    if (!confirm('確定要刪除此項目嗎？')) return;
    
    // 找到要刪除的項目，獲取其 filter 值
    const itemToDelete = sidebarItems.find(item => item.id === id);
    const filterToDelete = itemToDelete ? itemToDelete.filter : null;
    
    // 刪除側邊欄項目
    sidebarItems = sidebarItems.filter(item => item.id !== id);
    await saveSidebarConfig(sidebarItems);
    renderSidebarList();
    
    // 刪除對應的表單欄位配置
    if (filterToDelete) {
        await deleteFormFieldsForContentType(filterToDelete);
    }
    
    showAlert('項目已刪除', 'success');
}

// 關閉側邊欄 Modal
function closeSidebarModal() {
    document.getElementById('sidebarModal').classList.remove('active');
}

// 處理側邊欄表單提交
async function handleSidebarSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('sidebarItemId').value;
    const filter = document.getElementById('sidebarFilter').value.trim();
    const icon = document.getElementById('sidebarIcon').value.trim();
    const label = document.getElementById('sidebarLabel').value.trim();
    const order = parseInt(document.getElementById('sidebarOrder').value) || 0;
    const enabled = document.getElementById('sidebarEnabled').checked;
    
    if (!filter || !icon || !label) {
        showAlert('請填寫所有必填欄位', 'error');
        return;
    }
    
    const item = {
        id: id || Date.now().toString(),
        filter,
        icon,
        label,
        order,
        enabled
    };
    
    if (editingSidebarId) {
        // 更新
        const index = sidebarItems.findIndex(i => i.id === editingSidebarId);
        if (index !== -1) {
            sidebarItems[index] = item;
        }
    } else {
        // 新增
        sidebarItems.push(item);
        
        // 檢查並創建對應的表單欄位配置
        await createFormFieldsForContentType(item.filter);
    }
    
    await saveSidebarConfig(sidebarItems);
    renderSidebarList();
    closeSidebarModal();
    showAlert('儲存成功', 'success');
}

// 為新的內容類型創建表單欄位配置（從"所有類型"複製基礎欄位）
async function createFormFieldsForContentType(contentType) {
    // 跳過 'all' 類型，因為它是基礎類型
    if (contentType === 'all') return;
    
    // 檢查是否已經存在該內容類型的欄位
    const existingFields = formFields.filter(f => f.contentType === contentType);
    if (existingFields.length > 0) {
        // 已經存在，不需要創建
        return;
    }
    
    // 獲取"所有類型"的基礎欄位（排除 contentType 選擇欄位）
    const baseFields = formFields.filter(f => 
        f.contentType === 'all' && f.fieldKey !== 'contentType'
    );
    
    if (baseFields.length === 0) {
        // 如果沒有基礎欄位，從預設配置獲取
        const defaultFields = getDefaultFormFieldsConfig();
        const defaultBaseFields = defaultFields.filter(f => 
            f.contentType === 'all' && f.fieldKey !== 'contentType'
        );
        
        // 複製基礎欄位並設置新的 contentType
        const timestamp = Date.now();
        const newFields = defaultBaseFields.map((field, index) => ({
            ...field,
            id: 'f' + timestamp + '_' + index + '_' + Math.random().toString(36).substr(2, 5),
            contentType: contentType,
            order: field.order
        }));
        
        formFields.push(...newFields);
    } else {
        // 複製基礎欄位並設置新的 contentType
        const timestamp = Date.now();
        const newFields = baseFields.map((field, index) => ({
            ...field,
            id: 'f' + timestamp + '_' + index + '_' + Math.random().toString(36).substr(2, 5),
            contentType: contentType,
            order: field.order
        }));
        
        formFields.push(...newFields);
    }
    
    // 儲存更新後的表單欄位配置
    await saveFormFieldsConfig(formFields);
    
    // 如果當前在表單欄位管理標籤頁，重新渲染
    const fieldsTab = document.getElementById('fieldsTab');
    if (fieldsTab && fieldsTab.classList.contains('active')) {
        await renderFormFields();
    }
}

// 刪除指定內容類型的表單欄位配置
async function deleteFormFieldsForContentType(contentType) {
    // 跳過 'all' 類型，因為它是基礎類型，不應該被刪除
    if (contentType === 'all') return;
    
    // 刪除該內容類型的所有欄位
    formFields = formFields.filter(f => f.contentType !== contentType);
    
    // 儲存更新後的表單欄位配置
    await saveFormFieldsConfig(formFields);
    
    // 如果當前在表單欄位管理標籤頁，重新渲染
    const fieldsTab = document.getElementById('fieldsTab');
    if (fieldsTab && fieldsTab.classList.contains('active')) {
        await renderFormFields();
    }
}

// 載入表單欄位配置
async function loadFormFieldsConfig() {
    formFields = await getFormFieldsConfig();
    await renderFormFields();
}

// 渲染表單欄位
async function renderFormFields() {
    const container = document.getElementById('fieldsByContentType');
    if (!container) return;
    
    // 確保模板已載入
    if (fieldTemplates.length === 0) {
        await loadFieldTemplates();
    }
    
    const contentTypes = ['news', 'video', 'article', 'suggestion', 'project', 'job', 'expert'];
    const typeLabels = {
        'news': '最新消息',
        'video': '影片分享',
        'article': '文章分享',
        'suggestion': '懸賞區',
        'project': '作品分享',
        'job': '專案支援及技能媒合',
        'expert': '找內部專家'
    };
    
    // 記錄當前展開的內容類型（在重新渲染前）
    const openContentTypes = new Set();
    contentTypes.forEach(type => {
        const fieldsDiv = document.getElementById(`fields_${type}`);
        if (fieldsDiv) {
            const computedStyle = window.getComputedStyle(fieldsDiv);
            if (computedStyle.display !== 'none') {
                openContentTypes.add(type);
            }
        }
    });
    
    // 生成模板選項
    const templateOptions = fieldTemplates.map(template => 
        `<option value="${template.id}">${template.name} (${template.fieldKey})</option>`
    ).join('');
    
    container.innerHTML = contentTypes.map(type => {
        const fields = formFields.filter(f => f.contentType === type);
        const sortedFields = [...fields].sort((a, b) => a.order - b.order);
        
        // 如果之前是展開的，保持展開狀態
        const shouldDisplay = openContentTypes.has(type) ? 'block' : 'none';
        
        return `
            <div class="content-type-group">
                <div class="content-type-header" onclick="toggleContentTypeFields('${type}')">
                    <strong>${typeLabels[type]}</strong>
                    <span>(${sortedFields.length} 個欄位)</span>
                </div>
                <div class="content-type-fields" id="fields_${type}" style="display: ${shouldDisplay};">
                    ${sortedFields.map(field => `
                        <div class="field-item" data-id="${field.id}" data-content-type="${type}">
                            <span class="drag-handle">☰</span>
                            <div class="field-info">
                                <div class="field-label">
                                    ${field.label}
                                    ${field.required ? '<span class="required-badge">必填</span>' : ''}
                                </div>
                                <div class="field-key">${field.fieldKey} (${field.fieldType})</div>
                            </div>
                            <div class="enabled-toggle" onclick="event.stopPropagation();">
                                <span>${field.enabled ? '啟用' : '停用'}</span>
                                <div class="toggle-switch ${field.enabled ? 'active' : ''}" onclick="event.stopPropagation(); toggleFieldEnabled('${field.id}')"></div>
                            </div>
                            <div class="item-actions" onclick="event.stopPropagation();">
                                <button class="btn-small" onclick="event.stopPropagation(); editField('${field.id}')">編輯</button>
                                <button class="btn-small btn-danger" onclick="event.stopPropagation(); deleteField('${field.id}')">刪除</button>
                            </div>
                        </div>
                    `).join('')}
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;" onclick="event.stopPropagation();">
                        <select id="templateSelect_${type}" style="padding: 0.4rem 0.6rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem; min-width: 200px;">
                            <option value="">請選擇模板</option>
                            ${templateOptions}
                        </select>
                        <button class="btn-add" onclick="event.stopPropagation(); addFieldFromTemplate('${type}');" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">+ 新增模版</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 初始化欄位拖拽排序
    initFieldDragAndDrop();
}

// 欄位拖拽排序
let draggedFieldElement = null; // 全局變數，用於追蹤正在拖拽的欄位

function initFieldDragAndDrop() {
    const contentTypes = ['news', 'video', 'article', 'suggestion', 'project', 'job', 'expert'];
    
    contentTypes.forEach(type => {
        const fieldsContainer = document.getElementById(`fields_${type}`);
        if (!fieldsContainer) return;
        
        const fieldItems = fieldsContainer.querySelectorAll('.field-item');
        
        fieldItems.forEach(item => {
            item.draggable = true;
            
            item.addEventListener('dragstart', function(e) {
                draggedFieldElement = this;
                this.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            
            item.addEventListener('dragend', function() {
                this.classList.remove('dragging');
                // 更新順序
                if (draggedFieldElement) {
                    const contentType = draggedFieldElement.getAttribute('data-content-type');
                    updateFieldOrder(contentType);
                }
                draggedFieldElement = null;
            });
            
            item.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (!draggedFieldElement) return;
                
                // 只允許在同一內容類型內拖拽
                const contentType = this.getAttribute('data-content-type');
                const draggedContentType = draggedFieldElement.getAttribute('data-content-type');
                
                if (contentType === draggedContentType && this !== draggedFieldElement) {
                    const afterElement = getDragAfterFieldElement(fieldsContainer, e.clientY, contentType);
                    if (afterElement == null) {
                        // 插入到最後（在新增模板區域之前）
                        const addTemplateDiv = fieldsContainer.querySelector('div[style*="display: flex"]');
                        if (addTemplateDiv) {
                            fieldsContainer.insertBefore(draggedFieldElement, addTemplateDiv);
                        } else {
                            fieldsContainer.appendChild(draggedFieldElement);
                        }
                    } else {
                        fieldsContainer.insertBefore(draggedFieldElement, afterElement);
                    }
                }
            });
            
            item.addEventListener('drop', function(e) {
                e.preventDefault();
            });
        });
    });
}

function getDragAfterFieldElement(container, y, contentType) {
    const draggableElements = [...container.querySelectorAll(`.field-item[data-content-type="${contentType}"]:not(.dragging)`)];
    
    if (draggableElements.length === 0) return null;
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 更新欄位順序
async function updateFieldOrder(contentType) {
    const fieldsContainer = document.getElementById(`fields_${contentType}`);
    if (!fieldsContainer) return;
    
    const fieldItems = fieldsContainer.querySelectorAll(`.field-item[data-content-type="${contentType}"]`);
    
    fieldItems.forEach((item, index) => {
        const id = item.getAttribute('data-id');
        const field = formFields.find(f => f.id === id);
        if (field) {
            field.order = index + 1;
        }
    });
    
    await saveFormFieldsConfig(formFields);
    showAlert('欄位順序已更新', 'success');
}

function toggleContentTypeFields(type) {
    const fieldsDiv = document.getElementById(`fields_${type}`);
    if (!fieldsDiv) return;
    
    // 检查当前项目是否已打开（使用 getComputedStyle 更可靠）
    const computedStyle = window.getComputedStyle(fieldsDiv);
    const isCurrentlyOpen = computedStyle.display !== 'none';
    
    // 获取所有内容类型的字段容器
    const contentTypes = ['news', 'video', 'article', 'suggestion', 'project', 'job', 'expert'];
    
    // 如果当前项目是关闭的，先关闭所有其他项目
    if (!isCurrentlyOpen) {
        contentTypes.forEach(ct => {
            if (ct !== type) {
                const otherFieldsDiv = document.getElementById(`fields_${ct}`);
                if (otherFieldsDiv) {
                    otherFieldsDiv.style.display = 'none';
                }
            }
        });
        // 然后打开当前项目
        fieldsDiv.style.display = 'block';
    } else {
        // 如果当前项目是打开的，则关闭它
        fieldsDiv.style.display = 'none';
    }
}

// 顯示新增欄位 Modal
function showAddFieldModal(contentType) {
    editingFieldId = null;
    document.getElementById('fieldModalTitle').textContent = '新增表單欄位';
    document.getElementById('fieldForm').reset();
    document.getElementById('fieldId').value = '';
    document.getElementById('fieldContentType').value = contentType;
    document.getElementById('fieldModal').classList.add('active');
}

// 編輯欄位
function editField(id) {
    const field = formFields.find(f => f.id === id);
    if (!field) return;
    
    editingFieldId = id;
    document.getElementById('fieldModalTitle').textContent = '編輯表單欄位';
    document.getElementById('fieldId').value = field.id;
    document.getElementById('fieldContentType').value = field.contentType;
    document.getElementById('fieldKey').value = field.fieldKey;
    document.getElementById('fieldType').value = field.fieldType;
    document.getElementById('fieldLabel').value = field.label;
    document.getElementById('fieldPlaceholder').value = field.placeholder || '';
    document.getElementById('fieldRequired').checked = field.required || false;
    document.getElementById('fieldEnabled').checked = field.enabled !== false;
    document.getElementById('fieldOrder').value = field.order || 0;
    
    // 處理選項
    if (field.options && field.options.length > 0) {
        const optionsText = field.options.map(opt => 
            typeof opt === 'string' ? opt : `${opt.value}|${opt.label}`
        ).join('\n');
        document.getElementById('fieldOptions').value = optionsText;
        document.getElementById('fieldOptionsGroup').style.display = 'block';
    } else {
        document.getElementById('fieldOptions').value = '';
        document.getElementById('fieldOptionsGroup').style.display = 
            field.fieldType === 'select' ? 'block' : 'none';
    }
    
    document.getElementById('fieldModal').classList.add('active');
}

// 刪除欄位
async function deleteField(id) {
    if (!confirm('確定要刪除此欄位嗎？')) return;
    
    formFields = formFields.filter(f => f.id !== id);
    await saveFormFieldsConfig(formFields);
    await renderFormFields();
    showAlert('欄位已刪除', 'success');
}

// 切換欄位啟用狀態
async function toggleFieldEnabled(id) {
    const field = formFields.find(f => f.id === id);
    if (!field) return;
    
    field.enabled = !field.enabled;
    await saveFormFieldsConfig(formFields);
    await renderFormFields();
    showAlert(`欄位已${field.enabled ? '啟用' : '停用'}`, 'success');
}

// 關閉欄位 Modal
function closeFieldModal() {
    document.getElementById('fieldModal').classList.remove('active');
}

// 處理欄位表單提交
async function handleFieldSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('fieldId').value;
    const contentType = document.getElementById('fieldContentType').value;
    const fieldKey = document.getElementById('fieldKey').value.trim();
    const fieldType = document.getElementById('fieldType').value;
    const label = document.getElementById('fieldLabel').value.trim();
    const placeholder = document.getElementById('fieldPlaceholder').value.trim();
    const required = document.getElementById('fieldRequired').checked;
    const enabled = document.getElementById('fieldEnabled').checked;
    const order = parseInt(document.getElementById('fieldOrder').value) || 0;
    
    // 處理選項
    let options = [];
    if (fieldType === 'select') {
        const optionsText = document.getElementById('fieldOptions').value.trim();
        if (optionsText) {
            options = optionsText.split('\n').map(line => {
                const parts = line.split('|');
                if (parts.length === 2) {
                    return { value: parts[0].trim(), label: parts[1].trim() };
                } else {
                    return { value: line.trim(), label: line.trim() };
                }
            });
        }
    }
    
    if (!contentType || !fieldKey || !fieldType || !label) {
        showAlert('請填寫所有必填欄位', 'error');
        return;
    }
    
    const field = {
        id: id || 'f' + Date.now(),
        contentType,
        fieldKey,
        fieldType,
        label,
        placeholder,
        required,
        enabled,
        order,
        options: options.length > 0 ? options : undefined
    };
    
    if (editingFieldId) {
        // 更新
        const index = formFields.findIndex(f => f.id === editingFieldId);
        if (index !== -1) {
            formFields[index] = field;
        }
    } else {
        // 新增
        formFields.push(field);
    }
    
    await saveFormFieldsConfig(formFields);
    await renderFormFields();
    closeFieldModal();
    showAlert('儲存成功', 'success');
}

// 顯示提示訊息
function showAlert(message, type = 'success') {
    const container = document.getElementById('alertContainer');
    if (!container) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    container.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// ========== 欄位模板管理 ==========

// 載入欄位模板
async function loadFieldTemplates() {
    try {
        fieldTemplates = await getFieldTemplates();
        console.log('載入的模板數量:', fieldTemplates.length);
        console.log('模板數據:', fieldTemplates);
        
        // 如果模板為空，強制初始化預設模板
        if (!fieldTemplates || fieldTemplates.length === 0) {
            console.log('模板為空，初始化預設模板');
            fieldTemplates = getDefaultFieldTemplates();
            await saveFieldTemplates(fieldTemplates);
        }
        
        renderTemplatesList();
    } catch (error) {
        console.error('載入欄位模板失敗:', error);
        // 如果載入失敗，使用預設模板
        try {
            fieldTemplates = getDefaultFieldTemplates();
            await saveFieldTemplates(fieldTemplates);
            renderTemplatesList();
        } catch (fallbackError) {
            console.error('初始化預設模板失敗:', fallbackError);
            showAlert('載入模板失敗', 'error');
        }
    }
}

// 渲染模板列表
function renderTemplatesList() {
    const list = document.getElementById('templatesList');
    if (!list) {
        console.warn('找不到 templatesList 元素');
        return;
    }
    
    console.log('渲染模板列表，模板數量:', fieldTemplates.length);
    
    if (fieldTemplates.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">目前沒有模板，點擊「新增模板」開始創建</p>';
        return;
    }
    
    // 確保每個模板都有 order 欄位，如果沒有則按索引賦值
    fieldTemplates.forEach((template, index) => {
        if (template.order === undefined || template.order === null) {
            template.order = index + 1;
        }
    });
    
    // 按 order 排序
    const sortedTemplates = [...fieldTemplates].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    list.innerHTML = sortedTemplates.map(template => `
        <div class="field-item" data-id="${template.id}" data-type="template">
            <span class="drag-handle">☰</span>
            <div class="field-info">
                <div class="field-label">
                    ${template.name}
                    ${template.required ? '<span class="required-badge">必填</span>' : ''}
                </div>
                <div class="field-key">${template.fieldKey} (${template.fieldType})</div>
            </div>
            <div class="item-actions" onclick="event.stopPropagation();">
                <button class="btn-small" onclick="event.stopPropagation(); editTemplate('${template.id}')">編輯</button>
                <button class="btn-small btn-danger" onclick="event.stopPropagation(); deleteTemplate('${template.id}')">刪除</button>
            </div>
        </div>
    `).join('');
    
    // 初始化模板拖拽排序
    initTemplateDragAndDrop();
}

// 模板拖拽排序
let draggedTemplateElement = null; // 全局變數，用於追蹤正在拖拽的模板

function initTemplateDragAndDrop() {
    const list = document.getElementById('templatesList');
    if (!list) return;
    
    const templateItems = list.querySelectorAll('.field-item[data-type="template"]');
    
    templateItems.forEach(item => {
        item.draggable = true;
        
        item.addEventListener('dragstart', function(e) {
            draggedTemplateElement = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            // 更新順序
            if (draggedTemplateElement) {
                updateTemplateOrder();
            }
            draggedTemplateElement = null;
        });
        
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (!draggedTemplateElement) return;
            
            if (this !== draggedTemplateElement) {
                const afterElement = getDragAfterTemplateElement(list, e.clientY);
                if (afterElement == null) {
                    list.appendChild(draggedTemplateElement);
                } else {
                    list.insertBefore(draggedTemplateElement, afterElement);
                }
            }
        });
        
        item.addEventListener('drop', function(e) {
            e.preventDefault();
        });
    });
}

function getDragAfterTemplateElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.field-item[data-type="template"]:not(.dragging)')];
    
    if (draggableElements.length === 0) return null;
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 更新模板順序
async function updateTemplateOrder() {
    const list = document.getElementById('templatesList');
    if (!list) return;
    
    const templateItems = list.querySelectorAll('.field-item[data-type="template"]');
    
    templateItems.forEach((item, index) => {
        const id = item.getAttribute('data-id');
        const template = fieldTemplates.find(t => t.id === id);
        if (template) {
            template.order = index + 1;
        }
    });
    
    await saveFieldTemplates(fieldTemplates);
    showAlert('模板順序已更新', 'success');
}

// 從下拉選單選擇模板並新增欄位
async function addFieldFromTemplate(contentType) {
    const selectElement = document.getElementById(`templateSelect_${contentType}`);
    if (!selectElement) return;
    
    const templateId = selectElement.value;
    if (!templateId) {
        showAlert('請先選擇模板', 'error');
        return;
    }
    
    // 確保模板已載入
    if (fieldTemplates.length === 0) {
        await loadFieldTemplates();
    }
    
    const template = fieldTemplates.find(t => t.id === templateId);
    if (!template) {
        showAlert('模板不存在', 'error');
        return;
    }
    
    // 檢查是否已存在相同 fieldKey 的欄位
    const existingField = formFields.find(f => 
        f.contentType === contentType && f.fieldKey === template.fieldKey
    );
    
    if (existingField) {
        showAlert(`欄位「${template.label}」已存在於此內容類型中`, 'error');
        return;
    }
    
    // 創建新欄位
    const newField = {
        id: 'f' + Date.now(),
        contentType: contentType,
        fieldKey: template.fieldKey,
        fieldType: template.fieldType,
        label: template.label,
        placeholder: template.placeholder || '',
        required: template.required || false,
        enabled: true,
        order: formFields.filter(f => f.contentType === contentType).length,
        options: template.options || undefined
    };
    
    // 新增到陣列
    formFields.push(newField);
    
    // 儲存到資料庫/localStorage
    await saveFormFieldsConfig(formFields);
    
    // 重新渲染表單欄位列表
    await renderFormFields();
    
    // 重置下拉選單
    selectElement.value = '';
    
    showAlert(`欄位「${template.label}」已成功新增`, 'success');
}

// 顯示新增模板 Modal
function showAddTemplateModal() {
    editingTemplateId = null;
    document.getElementById('templateModalTitle').textContent = '新增模板名稱';
    document.getElementById('templateForm').reset();
    document.getElementById('templateId').value = '';
    document.getElementById('templateOptionsGroup').style.display = 'none';
    document.getElementById('templateModal').classList.add('active');
}

// 編輯模板
function editTemplate(id) {
    const template = fieldTemplates.find(t => t.id === id);
    if (!template) return;
    
    editingTemplateId = id;
    document.getElementById('templateModalTitle').textContent = '編輯模板名稱';
    document.getElementById('templateId').value = template.id;
    document.getElementById('templateName').value = template.name;
    document.getElementById('templateFieldKey').value = template.fieldKey;
    document.getElementById('templateFieldType').value = template.fieldType;
    document.getElementById('templateLabel').value = template.label;
    document.getElementById('templatePlaceholder').value = template.placeholder || '';
    document.getElementById('templateRequired').checked = template.required || false;
    
    // 處理選項
    if (template.options && template.options.length > 0) {
        const optionsText = template.options.map(opt => 
            typeof opt === 'string' ? opt : `${opt.value}|${opt.label}`
        ).join('\n');
        document.getElementById('templateOptions').value = optionsText;
        document.getElementById('templateOptionsGroup').style.display = 'block';
    } else {
        document.getElementById('templateOptions').value = '';
        document.getElementById('templateOptionsGroup').style.display = 
            template.fieldType === 'select' ? 'block' : 'none';
    }
    
    document.getElementById('templateModal').classList.add('active');
}

// 刪除模板
async function deleteTemplate(id) {
    if (!confirm('確定要刪除此模板嗎？')) return;
    
    fieldTemplates = fieldTemplates.filter(t => t.id !== id);
    await saveFieldTemplates(fieldTemplates);
    renderTemplatesList();
    showAlert('模板已刪除', 'success');
}

// 關閉模板 Modal
function closeTemplateModal() {
    document.getElementById('templateModal').classList.remove('active');
}

// 處理模板表單提交
async function handleTemplateSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('templateId').value;
    const name = document.getElementById('templateName').value.trim();
    const fieldKey = document.getElementById('templateFieldKey').value.trim();
    const fieldType = document.getElementById('templateFieldType').value;
    const label = document.getElementById('templateLabel').value.trim();
    const placeholder = document.getElementById('templatePlaceholder').value.trim();
    const required = document.getElementById('templateRequired').checked;
    
    // 處理選項
    let options = [];
    if (fieldType === 'select') {
        const optionsText = document.getElementById('templateOptions').value.trim();
        if (optionsText) {
            options = optionsText.split('\n').map(line => {
                const parts = line.split('|');
                if (parts.length === 2) {
                    return { value: parts[0].trim(), label: parts[1].trim() };
                } else {
                    return { value: line.trim(), label: line.trim() };
                }
            });
        }
    }
    
    if (!name || !fieldKey || !fieldType || !label) {
        showAlert('請填寫所有必填欄位', 'error');
        return;
    }
    
    const template = {
        id: id || 't' + Date.now(),
        name,
        fieldKey,
        fieldType,
        label,
        placeholder,
        required,
        options: options.length > 0 ? options : undefined
    };
    
    if (editingTemplateId) {
        // 更新
        const index = fieldTemplates.findIndex(t => t.id === editingTemplateId);
        if (index !== -1) {
            // 保留原有的 order
            template.order = fieldTemplates[index].order || fieldTemplates.length + 1;
            fieldTemplates[index] = template;
        }
    } else {
        // 新增 - 設置 order 為最後一個
        template.order = fieldTemplates.length > 0 
            ? Math.max(...fieldTemplates.map(t => t.order || 0)) + 1 
            : 1;
        fieldTemplates.push(template);
    }
    
    await saveFieldTemplates(fieldTemplates);
    renderTemplatesList();
    closeTemplateModal();
    showAlert('儲存成功', 'success');
}

// 顯示模板選擇器
async function showTemplateSelector() {
    const modal = document.getElementById('templateSelectorModal');
    const list = document.getElementById('templateSelectorList');
    const modalTitle = modal.querySelector('.modal-header h3');
    
    if (!modal || !list) return;
    
    // 根據使用情境設定標題
    if (currentContentTypeForTemplate) {
        modalTitle.textContent = '選擇欄位模板（將用於新增欄位）';
    } else {
        modalTitle.textContent = '選擇欄位模板';
    }
    
    // 載入模板（如果還沒載入）
    if (fieldTemplates.length === 0) {
        await loadFieldTemplates();
    }
    
    if (fieldTemplates.length === 0) {
        list.innerHTML = '<p style="padding: 2rem; text-align: center; color: #999;">目前沒有模板，請先在「欄位內容」分頁中創建模板</p>';
    } else {
        list.innerHTML = fieldTemplates.map(template => `
            <div class="field-item" style="cursor: pointer;" onclick="selectTemplate('${template.id}')">
                <div class="field-info">
                    <div class="field-label">
                        ${template.name}
                        ${template.required ? '<span class="required-badge">必填</span>' : ''}
                    </div>
                    <div class="field-key">${template.fieldKey} (${template.fieldType})</div>
                </div>
                <div style="color: #858ae8;">選擇</div>
            </div>
        `).join('');
    }
    
    modal.classList.add('active');
}

// 關閉模板選擇器
function closeTemplateSelector() {
    document.getElementById('templateSelectorModal').classList.remove('active');
}

// 選擇模板並填入表單
async function selectTemplate(templateId) {
    const template = fieldTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // 關閉模板選擇器
    closeTemplateSelector();
    
    // 如果是在表單欄位管理頁面選擇模板，則直接新增欄位
    if (currentContentTypeForTemplate) {
        const contentType = currentContentTypeForTemplate;
        
        // 檢查是否已存在相同 fieldKey 的欄位
        const existingField = formFields.find(f => 
            f.contentType === contentType && f.fieldKey === template.fieldKey
        );
        
        if (existingField) {
            showAlert(`欄位「${template.label}」已存在於此內容類型中`, 'error');
            currentContentTypeForTemplate = null;
            return;
        }
        
        // 創建新欄位
        const newField = {
            id: 'f' + Date.now(),
            contentType: contentType,
            fieldKey: template.fieldKey,
            fieldType: template.fieldType,
            label: template.label,
            placeholder: template.placeholder || '',
            required: template.required || false,
            enabled: true,
            order: formFields.filter(f => f.contentType === contentType).length,
            options: template.options || undefined
        };
        
        // 新增到陣列
        formFields.push(newField);
        
        // 儲存到資料庫/localStorage
        await saveFormFieldsConfig(formFields);
        
        // 重新渲染表單欄位列表
        await renderFormFields();
        
        // 重置變數
        currentContentTypeForTemplate = null;
        
        showAlert(`欄位「${template.label}」已成功新增`, 'success');
    } else {
        // 原本的功能：在欄位表單中選擇模板
        document.getElementById('fieldKey').value = template.fieldKey;
        document.getElementById('fieldType').value = template.fieldType;
        document.getElementById('fieldLabel').value = template.label;
        document.getElementById('fieldPlaceholder').value = template.placeholder || '';
        document.getElementById('fieldRequired').checked = template.required || false;
        
        // 處理選項
        if (template.options && template.options.length > 0) {
            const optionsText = template.options.map(opt => 
                typeof opt === 'string' ? opt : `${opt.value}|${opt.label}`
            ).join('\n');
            document.getElementById('fieldOptions').value = optionsText;
            document.getElementById('fieldOptionsGroup').style.display = 'block';
        } else {
            document.getElementById('fieldOptions').value = '';
            document.getElementById('fieldOptionsGroup').style.display = 
                template.fieldType === 'select' ? 'block' : 'none';
        }
        
        showAlert('模板已套用', 'success');
    }
}

