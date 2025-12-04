// 後台管理 UI 邏輯

let sidebarItems = [];
let formFields = [];
let fieldTemplates = [];
let editingSidebarId = null;
let editingFieldId = null;
let editingTemplateId = null;

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
    
    // 載入表單欄位配置
    await loadFormFieldsConfig();
    
    // 載入欄位模板
    await loadFieldTemplates();
    
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
    
    sidebarItems = sidebarItems.filter(item => item.id !== id);
    await saveSidebarConfig(sidebarItems);
    renderSidebarList();
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
    }
    
    await saveSidebarConfig(sidebarItems);
    renderSidebarList();
    closeSidebarModal();
    showAlert('儲存成功', 'success');
}

// 載入表單欄位配置
async function loadFormFieldsConfig() {
    formFields = await getFormFieldsConfig();
    renderFormFields();
}

// 渲染表單欄位
function renderFormFields() {
    const container = document.getElementById('fieldsByContentType');
    if (!container) return;
    
    const contentTypes = ['all', 'news', 'video', 'article', 'suggestion', 'project', 'job', 'expert'];
    const typeLabels = {
        'all': '所有類型',
        'news': '最新消息',
        'video': '影片分享',
        'article': '文章分享',
        'suggestion': '懸賞區',
        'project': '作品分享',
        'job': '專案支援及技能媒合',
        'expert': '找內部專家'
    };
    
    container.innerHTML = contentTypes.map(type => {
        const fields = formFields.filter(f => f.contentType === type);
        const sortedFields = [...fields].sort((a, b) => a.order - b.order);
        
        return `
            <div class="content-type-group">
                <div class="content-type-header" onclick="toggleContentTypeFields('${type}')">
                    <strong>${typeLabels[type]}</strong>
                    <span>(${sortedFields.length} 個欄位)</span>
                </div>
                <div class="content-type-fields" id="fields_${type}">
                    ${sortedFields.map(field => `
                        <div class="field-item">
                            <div class="field-info">
                                <div class="field-label">
                                    ${field.label}
                                    ${field.required ? '<span class="required-badge">必填</span>' : ''}
                                </div>
                                <div class="field-key">${field.fieldKey} (${field.fieldType})</div>
                            </div>
                            <div class="enabled-toggle">
                                <span>${field.enabled ? '啟用' : '停用'}</span>
                                <div class="toggle-switch ${field.enabled ? 'active' : ''}" onclick="toggleFieldEnabled('${field.id}')"></div>
                            </div>
                            <div class="item-actions">
                                <button class="btn-small" onclick="editField('${field.id}')">編輯</button>
                                <button class="btn-small btn-danger" onclick="deleteField('${field.id}')">刪除</button>
                            </div>
                        </div>
                    `).join('')}
                    <button class="btn-add" onclick="showAddFieldModal('${type}')" style="margin-top: 0.5rem;">+ 新增欄位</button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleContentTypeFields(type) {
    const fieldsDiv = document.getElementById(`fields_${type}`);
    if (fieldsDiv) {
        fieldsDiv.style.display = fieldsDiv.style.display === 'none' ? 'block' : 'none';
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
    renderFormFields();
    showAlert('欄位已刪除', 'success');
}

// 切換欄位啟用狀態
async function toggleFieldEnabled(id) {
    const field = formFields.find(f => f.id === id);
    if (!field) return;
    
    field.enabled = !field.enabled;
    await saveFormFieldsConfig(formFields);
    renderFormFields();
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
    renderFormFields();
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
    fieldTemplates = await getFieldTemplates();
    renderTemplatesList();
}

// 渲染模板列表
function renderTemplatesList() {
    const list = document.getElementById('templatesList');
    if (!list) return;
    
    if (fieldTemplates.length === 0) {
        list.innerHTML = '<p style="color: #999; text-align: center; padding: 2rem;">目前沒有模板，點擊「新增模板」開始創建</p>';
        return;
    }
    
    list.innerHTML = fieldTemplates.map(template => `
        <div class="field-item">
            <div class="field-info">
                <div class="field-label">
                    ${template.name}
                    ${template.required ? '<span class="required-badge">必填</span>' : ''}
                </div>
                <div class="field-key">${template.fieldKey} (${template.fieldType})</div>
            </div>
            <div class="item-actions">
                <button class="btn-small" onclick="editTemplate('${template.id}')">編輯</button>
                <button class="btn-small btn-danger" onclick="deleteTemplate('${template.id}')">刪除</button>
            </div>
        </div>
    `).join('');
}

// 顯示新增模板 Modal
function showAddTemplateModal() {
    editingTemplateId = null;
    document.getElementById('templateModalTitle').textContent = '新增欄位模板';
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
    document.getElementById('templateModalTitle').textContent = '編輯欄位模板';
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
            fieldTemplates[index] = template;
        }
    } else {
        // 新增
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
    
    if (!modal || !list) return;
    
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
function selectTemplate(templateId) {
    const template = fieldTemplates.find(t => t.id === templateId);
    if (!template) return;
    
    // 填入表單欄位
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
    
    // 關閉選擇器
    closeTemplateSelector();
    
    showAlert('模板已套用', 'success');
}

