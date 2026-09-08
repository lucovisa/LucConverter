document.addEventListener('DOMContentLoaded', function() {
    const textSection = document.getElementById('textEditor');
    
    textSection.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.style.marginBottom = '1rem';
    backBtn.addEventListener('click', function() {
        showMainMenu();
    });
    textSection.appendChild(backBtn);
    
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '0.5rem';
    toolbar.style.marginBottom = '1rem';
    toolbar.style.padding = '1rem';
    toolbar.style.background = 'var(--panel-bg)';
    toolbar.style.border = '1px solid var(--border)';
    toolbar.style.borderRadius = '4px';
    toolbar.style.alignItems = 'center';
    
    const textarea = document.createElement('textarea');
    textarea.style.width = '100%';
    textarea.style.minHeight = '400px';
    textarea.style.padding = '1rem';
    textarea.style.background = 'var(--bg)';
    textarea.style.border = '1px solid var(--border)';
    textarea.style.borderRadius = '4px';
    textarea.style.color = 'var(--text)';
    textarea.style.fontSize = '1rem';
    textarea.style.fontFamily = 'monospace';
    textarea.style.resize = 'vertical';
    textarea.placeholder = 'Start typing here...';
    
    const newBtn = document.createElement('button');
    newBtn.textContent = '📄';
    newBtn.title = 'New';
    newBtn.style.padding = '0.5rem 0.8rem';
    newBtn.style.background = 'var(--button-bg)';
    newBtn.style.color = 'white';
    newBtn.style.border = 'none';
    newBtn.style.borderRadius = '4px';
    newBtn.style.cursor = 'pointer';
    newBtn.style.fontSize = '1rem';
    newBtn.addEventListener('click', function() {
        textarea.value = '';
        textarea.focus();
    });
    toolbar.appendChild(newBtn);
    
    const openBtn = document.createElement('button');
    openBtn.textContent = '📂';
    openBtn.title = 'Open';
    openBtn.style.padding = '0.5rem 0.8rem';
    openBtn.style.background = 'var(--button-bg)';
    openBtn.style.color = 'white';
    openBtn.style.border = 'none';
    openBtn.style.borderRadius = '4px';
    openBtn.style.cursor = 'pointer';
    openBtn.style.fontSize = '1rem';
    openBtn.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.html,.css,.js,.json,.xml,.csv,.py,.cpp,.java';
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                textarea.value = e.target.result;
            };
            reader.readAsText(file);
        });
        fileInput.click();
    });
    toolbar.appendChild(openBtn);
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾';
    saveBtn.title = 'Save';
    saveBtn.style.padding = '0.5rem 0.8rem';
    saveBtn.style.background = 'var(--button-bg)';
    saveBtn.style.color = 'white';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '4px';
    saveBtn.style.cursor = 'pointer';
    saveBtn.style.fontSize = '1rem';
    saveBtn.addEventListener('click', function() {
        showSaveDialog(textarea);
    });
    toolbar.appendChild(saveBtn);
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️';
    clearBtn.title = 'Clear';
    clearBtn.style.padding = '0.5rem 0.8rem';
    clearBtn.style.background = '#8B0000';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.style.fontSize = '1rem';
    clearBtn.addEventListener('click', function() {
        textarea.value = '';
    });
    toolbar.appendChild(clearBtn);
    
    const separator1 = document.createElement('span');
    separator1.style.width = '1px';
    separator1.style.height = '30px';
    separator1.style.background = 'var(--border)';
    separator1.style.margin = '0 0.5rem';
    toolbar.appendChild(separator1);
    
    const boldBtn = document.createElement('button');
    boldBtn.innerHTML = '<b>B</b>';
    boldBtn.title = 'Bold';
    boldBtn.style.padding = '0.5rem 0.8rem';
    boldBtn.style.background = 'var(--button-bg)';
    boldBtn.style.color = 'white';
    boldBtn.style.border = 'none';
    boldBtn.style.borderRadius = '4px';
    boldBtn.style.cursor = 'pointer';
    boldBtn.style.fontSize = '1rem';
    boldBtn.addEventListener('click', function() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        textarea.value = textarea.value.substring(0, start) + '**' + selected + '**' + textarea.value.substring(end);
    });
    toolbar.appendChild(boldBtn);
    
    const italicBtn = document.createElement('button');
    italicBtn.innerHTML = '<i>I</i>';
    italicBtn.title = 'Italic';
    italicBtn.style.padding = '0.5rem 0.8rem';
    italicBtn.style.background = 'var(--button-bg)';
    italicBtn.style.color = 'white';
    italicBtn.style.border = 'none';
    italicBtn.style.borderRadius = '4px';
    italicBtn.style.cursor = 'pointer';
    italicBtn.style.fontSize = '1rem';
    italicBtn.addEventListener('click', function() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        textarea.value = textarea.value.substring(0, start) + '*' + selected + '*' + textarea.value.substring(end);
    });
    toolbar.appendChild(italicBtn);
    
    const underlineBtn = document.createElement('button');
    underlineBtn.innerHTML = '<u>U</u>';
    underlineBtn.title = 'Underline';
    underlineBtn.style.padding = '0.5rem 0.8rem';
    underlineBtn.style.background = 'var(--button-bg)';
    underlineBtn.style.color = 'white';
    underlineBtn.style.border = 'none';
    underlineBtn.style.borderRadius = '4px';
    underlineBtn.style.cursor = 'pointer';
    underlineBtn.style.fontSize = '1rem';
    underlineBtn.addEventListener('click', function() {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        textarea.value = textarea.value.substring(0, start) + '__' + selected + '__' + textarea.value.substring(end);
    });
    toolbar.appendChild(underlineBtn);
    
    const separator2 = document.createElement('span');
    separator2.style.width = '1px';
    separator2.style.height = '30px';
    separator2.style.background = 'var(--border)';
    separator2.style.margin = '0 0.5rem';
    toolbar.appendChild(separator2);
    
    const languageSelect = document.createElement('select');
    languageSelect.style.padding = '0.5rem';
    languageSelect.style.background = 'var(--bg)';
    languageSelect.style.border = '1px solid var(--border)';
    languageSelect.style.borderRadius = '4px';
    languageSelect.style.color = 'var(--text)';
    languageSelect.style.fontSize = '0.9rem';
    
    const languages = [
        { value: 'none', label: 'None' },
        { value: 'python', label: 'Python' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'html', label: 'HTML' },
        { value: 'css', label: 'CSS' },
        { value: 'json', label: 'JSON' },
        { value: 'xml', label: 'XML' },
        { value: 'cpp', label: 'C++' },
        { value: 'java', label: 'Java' },
        { value: 'csharp', label: 'C#' },
        { value: 'php', label: 'PHP' },
        { value: 'ruby', label: 'Ruby' },
        { value: 'go', label: 'Go' },
        { value: 'rust', label: 'Rust' }
    ];
    
    languages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.value;
        option.textContent = lang.label;
        languageSelect.appendChild(option);
    });
    
    languageSelect.addEventListener('change', function() {
        highlightSyntax(this.value);
    });
    toolbar.appendChild(languageSelect);
    
    function highlightSyntax(language) {
        let content = textarea.value;
        
        if (language === 'none') {
            textarea.style.color = 'var(--text)';
            return;
        }
        
        if (language === 'python') {
            content = content.replace(/(#.*)/g, '<span style="color: #6a9955;">$1</span>');
            content = content.replace(/\b(def|class|import|from|return|if|else|elif|for|while|print|True|False|None)\b/g, '<span style="color: #569cd6;">$1</span>');
            content = content.replace(/(".*?"|'.*?')/g, '<span style="color: #ce9178;">$1</span>');
        } else if (language === 'javascript') {
            content = content.replace(/(\/\/.*)/g, '<span style="color: #6a9955;">$1</span>');
            content = content.replace(/\b(const|let|var|function|return|if|else|for|while|console|log|true|false|null|undefined)\b/g, '<span style="color: #569cd6;">$1</span>');
            content = content.replace(/(".*?"|'.*?'|`.*?`)/g, '<span style="color: #ce9178;">$1</span>');
        } else if (language === 'html') {
            content = content.replace(/(&lt;.*?&gt;)/g, '<span style="color: #569cd6;">$1</span>');
        } else if (language === 'json') {
            content = content.replace(/(".*?")/g, '<span style="color: #ce9178;">$1</span>');
            content = content.replace(/\b(true|false|null)\b/g, '<span style="color: #569cd6;">$1</span>');
        }
        
        const preview = document.createElement('div');
        preview.innerHTML = content;
        textarea.value = preview.textContent;
    }
    
    const separator3 = document.createElement('span');
    separator3.style.width = '1px';
    separator3.style.height = '30px';
    separator3.style.background = 'var(--border)';
    separator3.style.margin = '0 0.5rem';
    toolbar.appendChild(separator3);
    
    const uppercaseBtn = document.createElement('button');
    uppercaseBtn.textContent = 'ABC';
    uppercaseBtn.title = 'UPPERCASE';
    uppercaseBtn.style.padding = '0.5rem 0.8rem';
    uppercaseBtn.style.background = 'var(--button-bg)';
    uppercaseBtn.style.color = 'white';
    uppercaseBtn.style.border = 'none';
    uppercaseBtn.style.borderRadius = '4px';
    uppercaseBtn.style.cursor = 'pointer';
    uppercaseBtn.style.fontSize = '0.85rem';
    uppercaseBtn.addEventListener('click', function() {
        textarea.value = textarea.value.toUpperCase();
    });
    toolbar.appendChild(uppercaseBtn);
    
    const lowercaseBtn = document.createElement('button');
    lowercaseBtn.textContent = 'abc';
    lowercaseBtn.title = 'lowercase';
    lowercaseBtn.style.padding = '0.5rem 0.8rem';
    lowercaseBtn.style.background = 'var(--button-bg)';
    lowercaseBtn.style.color = 'white';
    lowercaseBtn.style.border = 'none';
    lowercaseBtn.style.borderRadius = '4px';
    lowercaseBtn.style.cursor = 'pointer';
    lowercaseBtn.style.fontSize = '0.85rem';
    lowercaseBtn.addEventListener('click', function() {
        textarea.value = textarea.value.toLowerCase();
    });
    toolbar.appendChild(lowercaseBtn);
    
    const reverseBtn = document.createElement('button');
    reverseBtn.textContent = '↔️';
    reverseBtn.title = 'Reverse';
    reverseBtn.style.padding = '0.5rem 0.8rem';
    reverseBtn.style.background = 'var(--button-bg)';
    reverseBtn.style.color = 'white';
    reverseBtn.style.border = 'none';
    reverseBtn.style.borderRadius = '4px';
    reverseBtn.style.cursor = 'pointer';
    reverseBtn.style.fontSize = '0.85rem';
    reverseBtn.addEventListener('click', function() {
        textarea.value = textarea.value.split('').reverse().join('');
    });
    toolbar.appendChild(reverseBtn);
    
    const sortBtn = document.createElement('button');
    sortBtn.textContent = '↓';
    sortBtn.title = 'Sort Lines';
    sortBtn.style.padding = '0.5rem 0.8rem';
    sortBtn.style.background = 'var(--button-bg)';
    sortBtn.style.color = 'white';
    sortBtn.style.border = 'none';
    sortBtn.style.borderRadius = '4px';
    sortBtn.style.cursor = 'pointer';
    sortBtn.style.fontSize = '0.85rem';
    sortBtn.addEventListener('click', function() {
        const lines = textarea.value.split('\n').sort();
        textarea.value = lines.join('\n');
    });
    toolbar.appendChild(sortBtn);
    
    const dedupeBtn = document.createElement('button');
    dedupeBtn.textContent = '⊜';
    dedupeBtn.title = 'Remove Duplicates';
    dedupeBtn.style.padding = '0.5rem 0.8rem';
    dedupeBtn.style.background = 'var(--button-bg)';
    dedupeBtn.style.color = 'white';
    dedupeBtn.style.border = 'none';
    dedupeBtn.style.borderRadius = '4px';
    dedupeBtn.style.cursor = 'pointer';
    dedupeBtn.style.fontSize = '0.85rem';
    dedupeBtn.addEventListener('click', function() {
        const lines = textarea.value.split('\n');
        const unique = [...new Set(lines)];
        textarea.value = unique.join('\n');
    });
    toolbar.appendChild(dedupeBtn);
    
    const wordCountBtn = document.createElement('button');
    wordCountBtn.textContent = 'Σ';
    wordCountBtn.title = 'Word Count';
    wordCountBtn.style.padding = '0.5rem 0.8rem';
    wordCountBtn.style.background = 'var(--button-bg)';
    wordCountBtn.style.color = 'white';
    wordCountBtn.style.border = 'none';
    wordCountBtn.style.borderRadius = '4px';
    wordCountBtn.style.cursor = 'pointer';
    wordCountBtn.style.fontSize = '0.85rem';
    wordCountBtn.addEventListener('click', function() {
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = textarea.value.length;
        const lines = textarea.value ? textarea.value.split('\n').length : 0;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'success-message';
        infoDiv.textContent = `Words: ${words} | Characters: ${chars} | Lines: ${lines}`;
        textSection.insertBefore(infoDiv, toolbar);
        
        setTimeout(() => {
            infoDiv.remove();
        }, 3000);
    });
    toolbar.appendChild(wordCountBtn);
    
    const findReplaceBtn = document.createElement('button');
    findReplaceBtn.textContent = '🔍';
    findReplaceBtn.title = 'Find & Replace';
    findReplaceBtn.style.padding = '0.5rem 0.8rem';
    findReplaceBtn.style.background = 'var(--button-bg)';
    findReplaceBtn.style.color = 'white';
    findReplaceBtn.style.border = 'none';
    findReplaceBtn.style.borderRadius = '4px';
    findReplaceBtn.style.cursor = 'pointer';
    findReplaceBtn.style.fontSize = '0.85rem';
    findReplaceBtn.addEventListener('click', function() {
        showFindReplaceDialog(textarea);
    });
    toolbar.appendChild(findReplaceBtn);
    
    function showSaveDialog(textarea) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.background = 'var(--panel-bg)';
        container.style.border = '1px solid var(--border)';
        container.style.borderRadius = '4px';
        container.style.padding = '2rem';
        container.style.zIndex = '2000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '1rem';
        container.style.minWidth = '300px';
        
        const title = document.createElement('h3');
        title.textContent = 'Save As';
        title.style.color = 'var(--accent)';
        container.appendChild(title);
        
        const filenameInput = document.createElement('input');
        filenameInput.type = 'text';
        filenameInput.placeholder = 'filename';
        filenameInput.value = 'document';
        filenameInput.style.padding = '0.8rem';
        filenameInput.style.background = 'var(--bg)';
        filenameInput.style.border = '1px solid var(--border)';
        filenameInput.style.borderRadius = '4px';
        filenameInput.style.color = 'var(--text)';
        container.appendChild(filenameInput);
        
        const formatSelect = document.createElement('select');
        formatSelect.style.padding = '0.8rem';
        formatSelect.style.background = 'var(--bg)';
        formatSelect.style.border = '1px solid var(--border)';
        formatSelect.style.borderRadius = '4px';
        formatSelect.style.color = 'var(--text)';
        
        const formats = ['txt', 'md', 'html', 'css', 'js', 'json', 'xml', 'csv', 'py', 'cpp', 'java'];
        formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = '.' + format;
            formatSelect.appendChild(option);
        });
        container.appendChild(formatSelect);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.style.padding = '0.8rem';
        downloadBtn.style.background = 'var(--button-bg)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', function() {
            const filename = filenameInput.value.trim() || 'document';
            const format = formatSelect.value;
            const content = textarea.value;
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            container.remove();
        });
        container.appendChild(downloadBtn);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '0.8rem';
        cancelBtn.style.background = 'var(--border)';
        cancelBtn.style.color = 'var(--text)';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.addEventListener('click', function() {
            container.remove();
        });
        container.appendChild(cancelBtn);
        
        document.body.appendChild(container);
    }
    
    function showFindReplaceDialog(textarea) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.background = 'var(--panel-bg)';
        container.style.border = '1px solid var(--border)';
        container.style.borderRadius = '4px';
        container.style.padding = '1rem';
        container.style.zIndex = '2000';
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.gap = '0.5rem';
        container.style.alignItems = 'center';
        container.style.maxWidth = '90%';
        
        const findInput = document.createElement('input');
        findInput.type = 'text';
        findInput.placeholder = 'Find';
        findInput.style.padding = '0.5rem';
        findInput.style.background = 'var(--bg)';
        findInput.style.border = '1px solid var(--border)';
        findInput.style.borderRadius = '4px';
        findInput.style.color = 'var(--text)';
        findInput.style.flex = '1';
        findInput.style.minWidth = '150px';
        
        const replaceInput = document.createElement('input');
        replaceInput.type = 'text';
        replaceInput.placeholder = 'Replace';
        replaceInput.style.padding = '0.5rem';
        replaceInput.style.background = 'var(--bg)';
        replaceInput.style.border = '1px solid var(--border)';
        replaceInput.style.borderRadius = '4px';
        replaceInput.style.color = 'var(--text)';
        replaceInput.style.flex = '1';
        replaceInput.style.minWidth = '150px';
        
        const replaceBtn = document.createElement('button');
        replaceBtn.textContent = 'Replace All';
        replaceBtn.style.padding = '0.5rem 1rem';
        replaceBtn.style.background = 'var(--button-bg)';
        replaceBtn.style.color = 'white';
        replaceBtn.style.border = 'none';
        replaceBtn.style.borderRadius = '4px';
        replaceBtn.style.cursor = 'pointer';
        replaceBtn.addEventListener('click', function() {
            const find = findInput.value;
            const replace = replaceInput.value;
            
            if (!find) {
                alert('Please enter text to find');
                return;
            }
            
            textarea.value = textarea.value.split(find).join(replace);
            container.remove();
        });
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '0.5rem 1rem';
        cancelBtn.style.background = 'var(--border)';
        cancelBtn.style.color = 'var(--text)';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.addEventListener('click', function() {
            container.remove();
        });
        
        container.appendChild(findInput);
        container.appendChild(replaceInput);
        container.appendChild(replaceBtn);
        container.appendChild(cancelBtn);
        
        document.body.appendChild(container);
    }
    
    textSection.appendChild(toolbar);
    textSection.appendChild(textarea);
});