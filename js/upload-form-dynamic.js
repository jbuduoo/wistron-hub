// 動態表單欄位生成

let formFieldsConfig = [];

// 載入表單欄位配置
async function loadFormFieldsConfig() {
    if (typeof getFormFieldsConfig !== 'undefined') {
        try {
            formFieldsConfig = await getFormFieldsConfig();
            return formFieldsConfig;
        } catch (error) {
            console.warn('載入表單欄位配置失敗:', error);
            return [];
        }
    }
    return [];
}

// 根據內容類型渲染表單欄位
async function renderFormFieldsForType(contentType) {
    const form = document.getElementById('uploadForm');
    if (!form) return;
    
    // 載入配置
    const config = await loadFormFieldsConfig();
    if (config.length === 0) {
        // 如果沒有配置，使用預設行為
        return;
    }
    
    // 找到動態欄位容器，如果不存在則創建
    let dynamicContainer = document.getElementById('dynamicFieldsContainer');
    if (!dynamicContainer) {
        // 在 contentType 選擇器後面插入容器
        const contentTypeGroup = document.getElementById('contentType').closest('.form-group');
        dynamicContainer = document.createElement('div');
        dynamicContainer.id = 'dynamicFieldsContainer';
        contentTypeGroup.insertAdjacentElement('afterend', dynamicContainer);
    }
    
    // 獲取該內容類型的所有欄位（包括 'all' 類型）
    const fields = config.filter(f => 
        (f.contentType === contentType || f.contentType === 'all') && 
        f.enabled
    ).sort((a, b) => a.order - b.order);
    
    // 清空容器
    dynamicContainer.innerHTML = '';
    
    // 生成欄位 HTML
    fields.forEach(field => {
        // 跳過 contentType 欄位（已經存在）
        if (field.fieldKey === 'contentType') return;
        
        const fieldHtml = generateFieldHTML(field);
        dynamicContainer.insertAdjacentHTML('beforeend', fieldHtml);
    });
    
    // 重新綁定事件
    bindDynamicFieldEvents();
}

// 生成欄位 HTML
function generateFieldHTML(field) {
    const fieldId = field.fieldKey;
    const requiredAttr = field.required ? 'required' : '';
    const requiredStar = field.required ? '<span class="required">*</span>' : '';
    
    let fieldHtml = '';
    
    switch (field.fieldType) {
        case 'text':
        case 'url':
            fieldHtml = `
                <div class="form-group form-group-inline" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}： ${requiredStar}</label>
                    <input type="${field.fieldType}" id="${fieldId}" name="${fieldId}" ${requiredAttr} placeholder="${field.placeholder || ''}">
                </div>
            `;
            break;
            
        case 'textarea':
            fieldHtml = `
                <div class="form-group" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}： ${requiredStar}</label>
                    <textarea id="${fieldId}" name="${fieldId}" rows="4" ${requiredAttr} placeholder="${field.placeholder || ''}"></textarea>
                </div>
            `;
            break;
            
        case 'select':
            const optionsHtml = field.options ? field.options.map(opt => {
                const value = typeof opt === 'string' ? opt : opt.value;
                const label = typeof opt === 'string' ? opt : opt.label;
                return `<option value="${value}">${label}</option>`;
            }).join('') : '';
            fieldHtml = `
                <div class="form-group form-group-inline" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}： ${requiredStar}</label>
                    <select id="${fieldId}" name="${fieldId}" ${requiredAttr}>
                        <option value="">請選擇</option>
                        ${optionsHtml}
                    </select>
                </div>
            `;
            break;
            
        case 'date':
        case 'datetime-local':
            fieldHtml = `
                <div class="form-group form-group-inline" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}： ${requiredStar}</label>
                    <input type="${field.fieldType}" id="${fieldId}" name="${fieldId}" ${requiredAttr}>
                </div>
            `;
            break;
            
        case 'file':
            fieldHtml = `
                <div class="form-group" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}</label>
                    <div class="file-upload">
                        <input type="file" id="${fieldId}" name="${fieldId}" ${requiredAttr} accept="video/*,image/*">
                        <label for="${fieldId}" class="file-label">
                            <span class="file-icon">📎</span>
                            <span class="file-text">選擇檔案（影片或圖片）</span>
                        </label>
                        <div class="file-preview" id="${fieldId}Preview"></div>
                    </div>
                </div>
            `;
            break;
            
        case 'editor':
            // 富文本編輯器需要特殊處理
            fieldHtml = `
                <div class="form-group" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}： ${requiredStar}</label>
                    <div class="text-editor-toolbar">
                        <button type="button" class="toolbar-btn" onclick="formatText('bold')" title="粗體">
                            <strong>B</strong>
                        </button>
                        <button type="button" class="toolbar-btn" onclick="formatText('italic')" title="斜體">
                            <em>I</em>
                        </button>
                        <button type="button" class="toolbar-btn" onclick="formatText('underline')" title="底線">
                            <u>U</u>
                        </button>
                        <div class="toolbar-separator"></div>
                        <select class="toolbar-select" id="fontSize" onchange="formatText('fontSize', this.value)" title="字體大小">
                            <option value="">字體大小</option>
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                            <option value="16px" selected>16px</option>
                            <option value="18px">18px</option>
                            <option value="20px">20px</option>
                            <option value="24px">24px</option>
                        </select>
                        <input type="color" class="toolbar-color" id="fontColor" value="#000000" onchange="formatText('foreColor', this.value)" title="文字顏色">
                        <input type="color" class="toolbar-color" id="bgColor" value="#ffffff" onchange="formatText('backColor', this.value)" title="背景顏色">
                        <div class="toolbar-separator"></div>
                        <button type="button" class="toolbar-btn" onclick="formatText('insertUnorderedList')" title="項目符號">•</button>
                        <button type="button" class="toolbar-btn" onclick="formatText('insertOrderedList')" title="編號清單">1.</button>
                        <div class="toolbar-separator"></div>
                        <button type="button" class="toolbar-btn" onclick="formatText('justifyLeft')" title="靠左對齊">⬅</button>
                        <button type="button" class="toolbar-btn" onclick="formatText('justifyCenter')" title="置中">⬌</button>
                        <button type="button" class="toolbar-btn" onclick="formatText('justifyRight')" title="靠右對齊">➡</button>
                    </div>
                    <div class="text-editor-wrapper">
                        <div id="${fieldId}Editor" contenteditable="true" class="text-editor" ${requiredAttr} placeholder="${field.placeholder || ''}"></div>
                        <textarea id="${fieldId}" name="${fieldId}" rows="15" style="display: none;" ${requiredAttr}></textarea>
                    </div>
                </div>
            `;
            break;
            
        default:
            fieldHtml = `
                <div class="form-group form-group-inline" id="${fieldId}Group">
                    <label for="${fieldId}">${field.label}： ${requiredStar}</label>
                    <input type="text" id="${fieldId}" name="${fieldId}" ${requiredAttr} placeholder="${field.placeholder || ''}">
                </div>
            `;
    }
    
    return fieldHtml;
}

// 綁定動態欄位事件
function bindDynamicFieldEvents() {
    // 綁定檔案上傳預覽
    document.querySelectorAll('#dynamicFieldsContainer input[type="file"]').forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            const previewId = this.id + 'Preview';
            const preview = document.getElementById(previewId);
            
            if (preview && file) {
                preview.innerHTML = `<p>已選擇：${file.name}</p>`;
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        preview.innerHTML += `<img src="${e.target.result}" style="max-width: 200px; margin-top: 10px; border-radius: 8px;">`;
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    });
    
    // 綁定富文本編輯器
    document.querySelectorAll('#dynamicFieldsContainer .text-editor').forEach(editor => {
        const textareaId = editor.id.replace('Editor', '');
        const textarea = document.getElementById(textareaId);
        
        if (textarea) {
            editor.addEventListener('input', function() {
                textarea.value = this.innerHTML;
            });
            
            editor.addEventListener('paste', function(e) {
                e.preventDefault();
                const text = (e.clipboardData || window.clipboardData).getData('text');
                document.execCommand('insertText', false, text);
                textarea.value = this.innerHTML;
            });
        }
    });
}

// 初始化動態表單
document.addEventListener('DOMContentLoaded', async function() {
    const contentTypeSelect = document.getElementById('contentType');
    if (!contentTypeSelect) return;
    
    // 監聽內容類型變化
    contentTypeSelect.addEventListener('change', async function() {
        const contentType = this.value;
        if (contentType) {
            await renderFormFieldsForType(contentType);
        } else {
            // 清空動態欄位
            const container = document.getElementById('dynamicFieldsContainer');
            if (container) {
                container.innerHTML = '';
            }
        }
    });
    
    // 如果已經選擇了內容類型，立即渲染
    if (contentTypeSelect.value) {
        await renderFormFieldsForType(contentTypeSelect.value);
    }
});

