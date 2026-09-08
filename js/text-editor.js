document.addEventListener('DOMContentLoaded', function() {
    initTextEditor();
});

function initTextEditor() {
    const textSection = document.getElementById('textEditor');
    if (!textSection) return;
    textSection.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => showMainMenu());
    textSection.appendChild(backBtn);

    const mainContainer = document.createElement('div');
    mainContainer.style.display = 'flex';
    mainContainer.style.gap = '1rem';
    mainContainer.style.flexWrap = 'wrap';

    const editorContainer = document.createElement('div');
    editorContainer.style.flex = '2';
    editorContainer.style.minWidth = '300px';

    const consoleContainer = document.createElement('div');
    consoleContainer.style.flex = '1';
    consoleContainer.style.minWidth = '250px';
    consoleContainer.style.background = 'var(--panel-bg)';
    consoleContainer.style.border = '1px solid var(--border)';
    consoleContainer.style.borderRadius = '4px';
    consoleContainer.style.padding = '1rem';
    consoleContainer.style.display = 'none';

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
    newBtn.addEventListener('click', () => { textarea.value = ''; clearConsole(); });
    toolbar.appendChild(newBtn);

    const openBtn = document.createElement('button');
    openBtn.textContent = '📂';
    openBtn.title = 'Open';
    openBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.html,.css,.js,.json,.xml,.csv,.py,.lua,.sql';
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => textarea.value = e.target.result;
            reader.readAsText(file);
        });
        fileInput.click();
    });
    toolbar.appendChild(openBtn);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾';
    saveBtn.title = 'Save';
    saveBtn.addEventListener('click', () => {
        const blob = new Blob([textarea.value], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'document.txt';
        a.click();
    });
    toolbar.appendChild(saveBtn);

    const printBtn = document.createElement('button');
    printBtn.textContent = '🖨️';
    printBtn.title = 'Print';
    printBtn.addEventListener('click', () => {
        const win = window.open('', '_blank');
        win.document.write('<pre>' + textarea.value.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
        win.document.close();
        win.print();
    });
    toolbar.appendChild(printBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️';
    clearBtn.title = 'Clear';
    clearBtn.addEventListener('click', () => { textarea.value = ''; clearConsole(); });
    toolbar.appendChild(clearBtn);

    const boldBtn = document.createElement('button');
    boldBtn.innerHTML = '<b>B</b>';
    boldBtn.title = 'Bold';
    boldBtn.addEventListener('click', () => wrapSelection(textarea, '**', '**'));
    toolbar.appendChild(boldBtn);

    const italicBtn = document.createElement('button');
    italicBtn.innerHTML = '<i>I</i>';
    italicBtn.title = 'Italic';
    italicBtn.addEventListener('click', () => wrapSelection(textarea, '*', '*'));
    toolbar.appendChild(italicBtn);

    const underlineBtn = document.createElement('button');
    underlineBtn.innerHTML = '<u>U</u>';
    underlineBtn.title = 'Underline';
    underlineBtn.addEventListener('click', () => wrapSelection(textarea, '__', '__'));
    toolbar.appendChild(underlineBtn);

    const languageSelect = document.createElement('select');
    languageSelect.style.padding = '0.5rem';
    languageSelect.style.background = 'var(--bg)';
    languageSelect.style.border = '1px solid var(--border)';
    languageSelect.style.borderRadius = '4px';
    languageSelect.style.color = 'var(--text)';
    const languages = [
        { value: 'none', label: 'None' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'html', label: 'HTML' },
        { value: 'json', label: 'JSON' },
        { value: 'python', label: 'Python' },
        { value: 'lua', label: 'Lua' },
        { value: 'sql', label: 'SQL' }
    ];
    languages.forEach(l => languageSelect.add(new Option(l.label, l.value)));
    toolbar.appendChild(languageSelect);

    const runBtn = document.createElement('button');
    runBtn.textContent = '▶️ Run';
    runBtn.style.padding = '0.5rem 0.8rem';
    runBtn.style.background = '#2e7d32';
    runBtn.style.color = 'white';
    runBtn.style.border = 'none';
    runBtn.style.borderRadius = '4px';
    runBtn.style.cursor = 'pointer';
    runBtn.style.display = 'none';
    runBtn.addEventListener('click', () => runCode(languageSelect.value, textarea.value, consoleContainer));
    toolbar.appendChild(runBtn);

    languageSelect.addEventListener('change', function() {
        runBtn.style.display = this.value === 'none' ? 'none' : 'inline-block';
        if (this.value === 'none') clearConsole();
    });

    const uppercaseBtn = document.createElement('button');
    uppercaseBtn.textContent = 'ABC';
    uppercaseBtn.title = 'UPPERCASE';
    uppercaseBtn.addEventListener('click', () => textarea.value = textarea.value.toUpperCase());
    toolbar.appendChild(uppercaseBtn);

    const lowercaseBtn = document.createElement('button');
    lowercaseBtn.textContent = 'abc';
    lowercaseBtn.title = 'lowercase';
    lowercaseBtn.addEventListener('click', () => textarea.value = textarea.value.toLowerCase());
    toolbar.appendChild(lowercaseBtn);

    const reverseBtn = document.createElement('button');
    reverseBtn.textContent = '↔️';
    reverseBtn.title = 'Reverse';
    reverseBtn.addEventListener('click', () => textarea.value = textarea.value.split('').reverse().join(''));
    toolbar.appendChild(reverseBtn);

    const sortBtn = document.createElement('button');
    sortBtn.textContent = '↓';
    sortBtn.title = 'Sort Lines';
    sortBtn.addEventListener('click', () => textarea.value = textarea.value.split('\n').sort().join('\n'));
    toolbar.appendChild(sortBtn);

    const dedupeBtn = document.createElement('button');
    dedupeBtn.textContent = '⊜';
    dedupeBtn.title = 'Remove Duplicates';
    dedupeBtn.addEventListener('click', () => textarea.value = [...new Set(textarea.value.split('\n'))].join('\n'));
    toolbar.appendChild(dedupeBtn);

    const wordCountBtn = document.createElement('button');
    wordCountBtn.textContent = 'Σ';
    wordCountBtn.title = 'Word Count';
    wordCountBtn.addEventListener('click', () => {
        const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
        const chars = textarea.value.length;
        const lines = textarea.value ? textarea.value.split('\n').length : 0;
        alert(`Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`);
    });
    toolbar.appendChild(wordCountBtn);

    const findReplaceBtn = document.createElement('button');
    findReplaceBtn.textContent = '🔍';
    findReplaceBtn.title = 'Find & Replace';
    findReplaceBtn.addEventListener('click', () => {
        const find = prompt('Find:');
        if (find === null) return;
        const replace = prompt('Replace with:');
        if (replace === null) return;
        textarea.value = textarea.value.split(find).join(replace);
    });
    toolbar.appendChild(findReplaceBtn);

    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(textarea);

    mainContainer.appendChild(editorContainer);
    mainContainer.appendChild(consoleContainer);

    textSection.appendChild(mainContainer);

    function wrapSelection(textarea, before, after) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        textarea.value = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
    }

    function clearConsole() {
        consoleContainer.style.display = 'none';
        consoleContainer.innerHTML = '';
    }

    async function runCode(language, code, consoleContainer) {
        consoleContainer.style.display = 'block';
        consoleContainer.innerHTML = '<h4 style="color:var(--accent);margin-bottom:0.5rem">Console</h4>';
        const outputDiv = document.createElement('div');
        outputDiv.style.background = 'var(--bg)';
        outputDiv.style.border = '1px solid var(--border)';
        outputDiv.style.borderRadius = '4px';
        outputDiv.style.padding = '0.8rem';
        outputDiv.style.minHeight = '100px';
        outputDiv.style.maxHeight = '400px';
        outputDiv.style.overflowY = 'auto';
        outputDiv.style.fontFamily = 'monospace';
        outputDiv.style.whiteSpace = 'pre-wrap';
        consoleContainer.appendChild(outputDiv);

        if (language === 'javascript') {
            try {
                const originalLog = console.log;
                let output = '';
                console.log = (...args) => { output += args.join(' ') + '\n'; };
                const result = eval(code);
                console.log = originalLog;
                if (output) outputDiv.textContent = output;
                else if (result !== undefined) outputDiv.textContent = String(result);
                else outputDiv.textContent = 'Code executed successfully.';
            } catch (e) {
                outputDiv.style.color = '#ff6b6b';
                outputDiv.textContent = `Error: ${e.message}`;
            }
        } else if (language === 'html') {
            const win = window.open('', '_blank');
            win.document.write(code);
            win.document.close();
            outputDiv.textContent = 'HTML opened in new tab.';
        } else if (language === 'json') {
            try {
                const parsed = JSON.parse(code);
                outputDiv.textContent = JSON.stringify(parsed, null, 2);
            } catch (e) {
                outputDiv.style.color = '#ff6b6b';
                outputDiv.textContent = `Invalid JSON: ${e.message}`;
            }
        } else if (language === 'python') {
            outputDiv.textContent = 'Loading Python...';
            try {
                const pyodide = await loadPyodide();
                outputDiv.textContent = 'Python ready. Running...';
                const result = await pyodide.runPythonAsync(code);
                if (result !== undefined) outputDiv.textContent = String(result);
                else outputDiv.textContent = 'Code executed successfully.';
            } catch (e) {
                outputDiv.style.color = '#ff6b6b';
                outputDiv.textContent = `Error: ${e.message}`;
            }
        } else if (language === 'lua') {
            outputDiv.textContent = 'Loading Lua...';
            try {
                const lua = await loadFengari();
                outputDiv.textContent = 'Lua ready. Running...';
                const result = lua.lua.execute(code);
                if (result !== undefined) outputDiv.textContent = String(result);
                else outputDiv.textContent = 'Code executed successfully.';
            } catch (e) {
                outputDiv.style.color = '#ff6b6b';
                outputDiv.textContent = `Error: ${e.message}`;
            }
        } else if (language === 'sql') {
            outputDiv.textContent = 'Loading SQLite...';
            try {
                const SQL = await loadSqlJs();
                outputDiv.textContent = 'SQLite ready. Running...';
                const db = new SQL.Database();
                const results = db.exec(code);
                if (results.length > 0) {
                    let output = '';
                    results.forEach((result, idx) => {
                        output += `Result ${idx + 1}:\n`;
                        output += result.columns.join(' | ') + '\n';
                        result.values.forEach(row => {
                            output += row.join(' | ') + '\n';
                        });
                        output += '\n';
                    });
                    outputDiv.textContent = output;
                } else {
                    outputDiv.textContent = 'Query executed successfully (no results).';
                }
                db.close();
            } catch (e) {
                outputDiv.style.color = '#ff6b6b';
                outputDiv.textContent = `Error: ${e.message}`;
            }
        } else {
            outputDiv.textContent = 'Compilation not supported for this language.';
        }
    }

    async function loadPyodide() {
        if (window.pyodide) return window.pyodide;
        if (!document.getElementById('pyodide-script')) {
            const script = document.createElement('script');
            script.id = 'pyodide-script';
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
        const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });
        window.pyodide = pyodide;
        return pyodide;
    }

    async function loadFengari() {
        if (window.fengari) return window.fengari;
        if (!document.getElementById('fengari-script')) {
            const script = document.createElement('script');
            script.id = 'fengari-script';
            script.src = 'https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js';
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
        window.fengari = { lua: window.fengari };
        return window.fengari;
    }

    async function loadSqlJs() {
        if (window.SQL) return window.SQL;
        if (!document.getElementById('sqljs-script')) {
            const script = document.createElement('script');
            script.id = 'sqljs-script';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        window.SQL = SQL;
        return SQL;
    }
}