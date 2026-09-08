document.addEventListener('DOMContentLoaded', function() {
    const textSection = document.getElementById('textEditor');
    
    textSection.innerHTML = '';
    
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '0.5rem';
    toolbar.style.marginBottom = '1rem';
    toolbar.style.padding = '1rem';
    toolbar.style.background = 'var(--panel-bg)';
    toolbar.style.border = '1px solid var(--border)';
    toolbar.style.borderRadius = '4px';
    
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
    newBtn.textContent = 'New';
    newBtn.addEventListener('click', function() {
        textarea.value = '';
        textarea.focus();
    });
    toolbar.appendChild(newBtn);
    
    const openBtn = document.createElement('button');
    openBtn.textContent = 'Open';
    openBtn.addEventListener('click', function() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.html,.css,.js,.json,.xml,.csv';
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
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', function() {
        const formatSelect = document.createElement('select');
        formatSelect.style.marginLeft = '0.5rem';
        
        const formats = ['txt', 'md', 'html', 'css', 'js', 'json', 'xml', 'csv'];
        formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = '.' + format;
            formatSelect.appendChild(option);
        });
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.style.marginLeft = '0.5rem';
        
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
        
        const title = document.createElement('h3');
        title.textContent = 'Save As';
        title.style.color = 'var(--accent)';
        container.appendChild(title);
        
        const filenameInput = document.createElement('input');
        filenameInput.type = 'text';
        filenameInput.placeholder = 'filename';
        filenameInput.value = 'document';
        container.appendChild(filenameInput);
        
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '0.5rem';
        row.appendChild(formatSelect);
        row.appendChild(downloadBtn);
        container.appendChild(row);
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Cancel';
        closeBtn.addEventListener('click', function() {
            container.remove();
        });
        container.appendChild(closeBtn);
        
        document.body.appendChild(container);
        
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
    });
    toolbar.appendChild(saveBtn);
    
    const clearBtn = document.createElement('button');
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', function() {
        textarea.value = '';
    });
    toolbar.appendChild(clearBtn);
    
    const uppercaseBtn = document.createElement('button');
    uppercaseBtn.textContent = 'UPPERCASE';
    uppercaseBtn.addEventListener('click', function() {
        textarea.value = textarea.value.toUpperCase();
    });
    toolbar.appendChild(uppercaseBtn);
    
    const lowercaseBtn = document.createElement('button');
    lowercaseBtn.textContent = 'lowercase';
    lowercaseBtn.addEventListener('click', function() {
        textarea.value = textarea.value.toLowerCase();
    });
    toolbar.appendChild(lowercaseBtn);
    
    const capitalizeBtn = document.createElement('button');
    capitalizeBtn.textContent = 'Capitalize';
    capitalizeBtn.addEventListener('click', function() {
        textarea.value = textarea.value.replace(/\b\w/g, function(char) {
            return char.toUpperCase();
        });
    });
    toolbar.appendChild(capitalizeBtn);
    
    const reverseBtn = document.createElement('button');
    reverseBtn.textContent = 'Reverse';
    reverseBtn.addEventListener('click', function() {
        textarea.value = textarea.value.split('').reverse().join('');
    });
    toolbar.appendChild(reverseBtn);
    
    const sortBtn = document.createElement('button');
    sortBtn.textContent = 'Sort Lines';
    sortBtn.addEventListener('click', function() {
        const lines = textarea.value.split('\n').sort();
        textarea.value = lines.join('\n');
    });
    toolbar.appendChild(sortBtn);
    
    const dedupeBtn = document.createElement('button');
    dedupeBtn.textContent = 'Remove Duplicates';
    dedupeBtn.addEventListener('click', function() {
        const lines = textarea.value.split('\n');
        const unique = [...new Set(lines)];
        textarea.value = unique.join('\n');
    });
    toolbar.appendChild(dedupeBtn);
    
    const wordCountBtn = document.createElement('button');
    wordCountBtn.textContent = 'Word Count';
    wordCountBtn.addEventListener('click', function() {
        const text = textarea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = textarea.value.length;
        const lines = textarea.value ? textarea.value.split('\n').length : 0;
        alert(`Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`);
    });
    toolbar.appendChild(wordCountBtn);
    
    const findReplaceBtn = document.createElement('button');
    findReplaceBtn.textContent = 'Find & Replace';
    findReplaceBtn.addEventListener('click', function() {
        const findInput = document.createElement('input');
        findInput.type = 'text';
        findInput.placeholder = 'Find';
        findInput.style.marginRight = '0.5rem';
        
        const replaceInput = document.createElement('input');
        replaceInput.type = 'text';
        replaceInput.placeholder = 'Replace';
        replaceInput.style.marginRight = '0.5rem';
        
        const replaceBtn = document.createElement('button');
        replaceBtn.textContent = 'Replace All';
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
        cancelBtn.addEventListener('click', function() {
            container.remove();
        });
        
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
        
        container.appendChild(findInput);
        container.appendChild(replaceInput);
        container.appendChild(replaceBtn);
        container.appendChild(cancelBtn);
        
        document.body.appendChild(container);
    });
    toolbar.appendChild(findReplaceBtn);
    
    const indentBtn = document.createElement('button');
    indentBtn.textContent = 'Indent';
    indentBtn.addEventListener('click', function() {
        textarea.value = textarea.value.split('\n').map(line => '    ' + line).join('\n');
    });
    toolbar.appendChild(indentBtn);
    
    const outdentBtn = document.createElement('button');
    outdentBtn.textContent = 'Outdent';
    outdentBtn.addEventListener('click', function() {
        textarea.value = textarea.value.split('\n').map(line => line.replace(/^    /, '')).join('\n');
    });
    toolbar.appendChild(outdentBtn);
    
    const trimBtn = document.createElement('button');
    trimBtn.textContent = 'Trim Spaces';
    trimBtn.addEventListener('click', function() {
        textarea.value = textarea.value.split('\n').map(line => line.trim()).join('\n');
    });
    toolbar.appendChild(trimBtn);
    
    textSection.appendChild(toolbar);
    textSection.appendChild(textarea);
});