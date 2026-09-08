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

    const editor = document.createElement('div');
    editor.id = 'richEditor';
    editor.contentEditable = 'true';
    editor.style.width = '100%';
    editor.style.minHeight = '400px';
    editor.style.padding = '1rem';
    editor.style.background = 'var(--bg)';
    editor.style.border = '1px solid var(--border)';
    editor.style.borderRadius = '4px';
    editor.style.color = 'var(--text)';
    editor.style.fontSize = '1rem';
    editor.style.fontFamily = 'Arial, sans-serif';
    editor.style.overflowY = 'auto';
    editor.style.outline = 'none';

    function addButton(html, title, action) {
        const btn = document.createElement('button');
        btn.innerHTML = html;
        btn.title = title;
        btn.style.padding = '0.5rem 0.8rem';
        btn.style.background = 'var(--button-bg)';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '0.9rem';
        btn.style.fontWeight = 'bold';
        btn.addEventListener('click', action);
        toolbar.appendChild(btn);
    }

    addButton('📄', 'New', () => { editor.innerHTML = ''; clearConsole(); });
    addButton('📂', 'Open', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.html,.css,.js,.json,.xml,.csv,.py,.lua,.sql';
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => editor.textContent = e.target.result;
            reader.readAsText(file);
        });
        fileInput.click();
    });
    addButton('💾', 'Save', () => {
        const blob = new Blob([editor.innerText], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'document.txt';
        a.click();
    });
    addButton('🖨️', 'Print', () => {
        const win = window.open('', '_blank');
        win.document.write('<pre>' + editor.innerText.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>');
        win.document.close();
        win.print();
    });
    addButton('🗑️', 'Clear', () => { editor.innerHTML = ''; clearConsole(); });
    addButton('<b>B</b>', 'Bold', () => document.execCommand('bold'));
    addButton('<i>I</i>', 'Italic', () => document.execCommand('italic'));
    addButton('<u>U</u>', 'Underline', () => document.execCommand('underline'));

    const emojiBtn = document.createElement('button');
    emojiBtn.textContent = '😊';
    emojiBtn.title = 'Emoji';
    emojiBtn.style.padding = '0.5rem 0.8rem';
    emojiBtn.style.background = 'var(--button-bg)';
    emojiBtn.style.color = 'white';
    emojiBtn.style.border = 'none';
    emojiBtn.style.borderRadius = '4px';
    emojiBtn.style.cursor = 'pointer';
    emojiBtn.style.fontSize = '0.9rem';
    emojiBtn.addEventListener('click', () => {
        showEmojiPanel();
    });
    toolbar.appendChild(emojiBtn);

    const fontUploadInput = document.createElement('input');
    fontUploadInput.type = 'file';
    fontUploadInput.accept = '.ttf,.otf,.woff,.woff2';
    fontUploadInput.style.display = 'none';
    fontUploadInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            const fontName = 'CustomFont';
            const fontFace = new FontFace(fontName, e.target.result);
            fontFace.load().then(loadedFace => {
                document.fonts.add(loadedFace);
                editor.style.fontFamily = fontName;
            }).catch(err => {
                showError(editor, 'Failed to load font');
            });
        };
        reader.readAsArrayBuffer(file);
    });

    const fontUploadBtn = document.createElement('button');
    fontUploadBtn.textContent = '📝 Font';
    fontUploadBtn.title = 'Upload custom font';
    fontUploadBtn.style.padding = '0.5rem 0.8rem';
    fontUploadBtn.style.background = 'var(--button-bg)';
    fontUploadBtn.style.color = 'white';
    fontUploadBtn.style.border = 'none';
    fontUploadBtn.style.borderRadius = '4px';
    fontUploadBtn.style.cursor = 'pointer';
    fontUploadBtn.addEventListener('click', () => fontUploadInput.click());
    toolbar.appendChild(fontUploadBtn);

    const fontSizeSelect = document.createElement('select');
    fontSizeSelect.style.padding = '0.5rem';
    fontSizeSelect.style.background = 'var(--bg)';
    fontSizeSelect.style.border = '1px solid var(--border)';
    fontSizeSelect.style.borderRadius = '4px';
    fontSizeSelect.style.color = 'var(--text)';
    const sizes = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 72];
    sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size + 'px';
        fontSizeSelect.appendChild(option);
    });
    fontSizeSelect.value = 16;
    fontSizeSelect.addEventListener('change', function() {
        editor.style.fontSize = this.value + 'px';
    });
    toolbar.appendChild(fontSizeSelect);

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
    runBtn.addEventListener('click', () => runCode(languageSelect.value, editor.innerText, consoleContainer));
    toolbar.appendChild(runBtn);

    languageSelect.addEventListener('change', function() {
        runBtn.style.display = this.value === 'none' ? 'none' : 'inline-block';
        if (this.value === 'none') clearConsole();
    });

    addButton('ABC', 'UPPERCASE', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().toUpperCase();
            range.deleteContents();
            range.insertNode(document.createTextNode(selectedText));
        } else {
            editor.innerText = editor.innerText.toUpperCase();
        }
    });

    addButton('abc', 'lowercase', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().toLowerCase();
            range.deleteContents();
            range.insertNode(document.createTextNode(selectedText));
        } else {
            editor.innerText = editor.innerText.toLowerCase();
        }
    });

    addButton('↔️', 'Reverse', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().split('').reverse().join('');
            range.deleteContents();
            range.insertNode(document.createTextNode(selectedText));
        } else {
            editor.innerText = editor.innerText.split('').reverse().join('');
        }
    });

    addButton('↓', 'Sort Lines', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = range.toString().split('\n').sort().join('\n');
            range.deleteContents();
            range.insertNode(document.createTextNode(selectedText));
        } else {
            editor.innerText = editor.innerText.split('\n').sort().join('\n');
        }
    });

    addButton('⊜', 'Remove Duplicates', () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = [...new Set(range.toString().split('\n'))].join('\n');
            range.deleteContents();
            range.insertNode(document.createTextNode(selectedText));
        } else {
            editor.innerText = [...new Set(editor.innerText.split('\n'))].join('\n');
        }
    });

    addButton('Σ', 'Word Count', () => {
        const text = editor.innerText;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const lines = text ? text.split('\n').length : 0;
        const message = `Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`;
        const infoDiv = document.createElement('div');
        infoDiv.className = 'success-message';
        infoDiv.textContent = message;
        textSection.insertBefore(infoDiv, toolbar);
        setTimeout(() => infoDiv.remove(), 3000);
    });

    addButton('🔍', 'Find & Replace', () => {
        const find = prompt('Find:');
        if (find === null) return;
        const replace = prompt('Replace with:');
        if (replace === null) return;
        editor.innerText = editor.innerText.split(find).join(replace);
    });

    function showEmojiPanel() {
        const existingPanel = document.querySelector('.emoji-panel');
        if (existingPanel) {
            existingPanel.remove();
            return;
        }

        const panel = document.createElement('div');
        panel.className = 'emoji-panel';
        panel.style.position = 'fixed';
        panel.style.zIndex = '10000';
        panel.style.background = 'var(--panel-bg)';
        panel.style.border = '1px solid var(--border)';
        panel.style.borderRadius = '8px';
        panel.style.padding = '0.5rem';
        panel.style.maxWidth = '320px';
        panel.style.maxHeight = '250px';
        panel.style.overflowY = 'auto';
        panel.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';

        const emojis = [
            '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊',
            '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗',
            '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮',
            '🤐', '😯', '😪', '😫', '😴', '😌', '😛', '😜', '😝', '🤤',
            '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖',
            '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯',
            '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠',
            '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺',
            '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹',
            '👺', '💀', '👻', '👽', '🤖', '💩', '😺', '😸', '😹', '😻',
            '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚', '💙',
            '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓',
            '💗', '💖', '💘', '💝', '💟', '👍', '👎', '👌', '✌️', '🤞',
            '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚',
            '🖐️', '🖖', '👋', '🤝', '🙏', '💪', '🦾', '🖕', '✍️', '🤳',
            '💅', '🦻', '🦶', '🦵', '🦿', '👀', '👁️', '👅', '👄', '🦷',
            '🦴', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓',
            '👴', '👲', '👳‍♀️', '👳‍♂️', '🧕', '👮‍♀️', '👮‍♂️', '👷‍♀️', '👷‍♂️', '💂‍♀️',
            '💂‍♂️', '🕵️‍♀️', '🕵️‍♂️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓',
            '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼',
            '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️',
            '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '🦸‍♀️', '🦸‍♂️', '🦹‍♀️', '🦹‍♂️', '🎅',
            '🤶', '🧙‍♀️', '🧙‍♂️', '🧝‍♀️', '🧝‍♂️', '🧛‍♀️', '🧛‍♂️', '🧟‍♀️', '🧟‍♂️', '🧞‍♀️',
            '🧞‍♂️', '🧜‍♀️', '🧜‍♂️', '🧚‍♀️', '🧚‍♂️', '👼', '🤰', '🤱', '👸', '🤴',
            '🥷', '🦸', '🦹', '🧙', '🧝', '🧛', '🧟', '🧞', '🧜', '🧚',
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
            '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
            '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
            '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙',
            '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋',
            '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏',
            '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏',
            '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🐓', '🦃',
            '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫',
            '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵',
            '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋',
            '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀',
            '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕',
            '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍',
            '🌏', '🪐', '💫', '⭐', '🌟', '✨', '⚡', '☄️', '💥', '🔥',
            '🌪️', '🌈', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️',
            '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '💧', '💦', '☔',
            '☂️', '🌊', '🌫️', '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉',
            '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅',
            '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅',
            '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳',
            '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔',
            '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫',
            '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙',
            '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦',
            '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩',
            '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤',
            '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
            '🧊', '🥄', '🍴', '🍽️', '🥣', '🥡', '🥢', '⚽', '🏀', '🏈',
            '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸',
            '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣',
            '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿',
            '⛷️', '🏂', '🪂', '🏋️‍♀️', '🏋️‍♂️', '🤸‍♀️', '🤸‍♂️', '⛹️‍♀️', '⛹️‍♂️', '🤺',
            '🤾‍♀️', '🤾‍♂️', '🏌️‍♀️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘‍♂️', '🏄‍♀️', '🏄‍♂️', '🏊‍♀️',
            '🏊‍♂️', '🤽‍♀️', '🤽‍♂️', '🚣‍♀️', '🚣‍♂️', '🧗‍♀️', '🧗‍♂️', '🚵‍♀️', '🚵‍♂️', '🚴‍♀️',
            '🚴‍♂️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫',
            '🎟️', '🎪', '🤹‍♀️', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧',
            '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️',
            '🎯', '🎳', '🎮', '🎰', '🧩', '🚗', '🚕', '🚙', '🚌', '🚎',
            '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🛴', '🚲',
            '🛵', '🏍️', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟',
            '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇',
            '🚊', '🚉', '✈️', '🛫', '🛬', '🛩️', '💺', '🛰️', '🚀', '🛸',
            '🚁', '🛶', '⛵', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓', '🚧',
            '⛽', '🚏', '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯',
            '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋',
            '⛰️', '🏔️', '🗻', '🏕️', '⛺', '🏠', '🏡', '🏘️', '🏚️', '🏗️',
            '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫',
            '🏩', '💒', '🏛️', '⛪', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️',
            '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇',
            '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁', '⌚', '📱', '📲', '💻',
            '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿',
            '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️',
            '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️',
            '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️',
            '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳',
            '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️',
            '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️',
            '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️',
            '🔭', '🔬', '🕳️', '💊', '💉', '🩸', '🩹', '🩺', '🌡️', '🚪',
            '🛏️', '🛋️', '🚿', '🛁', '🚽', '🧻', '🧼', '🧽', '🧹', '🧺',
            '🚰', '🚮', '🚯', '♿', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂',
            '🛃', '🛄', '🛅', '⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯',
            '🚱', '🚷', '📵', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️',
            '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️',
            '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉️',
            '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '♈',
            '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒',
            '♓', '⛎', '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️',
            '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️',
            '🎦', '🔅', '🔆', '📶', '📳', '📴', '♀️', '♂️', '⚧️', '✖️',
            '➕', '➖', '➗', '♾️', '‼️', '⁉️', '❓', '❔', '❕', '❗',
            '〰️', '💱', '💲', '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕',
            '✅', '☑️', '✔️', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️',
            '❇️', '©️', '®️', '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣',
            '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔠', '🔡', '🔢',
            '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔',
            'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁',
            '🈂️', '🈷️', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸',
            '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵', '🔴', '🟠', '🟡', '🟢',
            '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦',
            '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️',
            '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲'
        ];

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(8, 1fr)';
        grid.style.gap = '0.2rem';

        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.padding = '0.2rem';
            btn.style.background = 'transparent';
            btn.style.border = 'none';
            btn.style.cursor = 'pointer';
            btn.style.fontSize = '1.2rem';
            btn.style.borderRadius = '4px';
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--hover)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'transparent';
            });
            btn.addEventListener('click', () => {
                const selection = window.getSelection();
                if (selection.rangeCount > 0 && selection.toString().length > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    const span = document.createElement('span');
                    span.textContent = emoji;
                    span.style.fontSize = fontSizeSelect.value + 'px';
                    range.insertNode(span);
                } else {
                    const span = document.createElement('span');
                    span.textContent = emoji;
                    span.style.fontSize = fontSizeSelect.value + 'px';
                    editor.appendChild(span);
                    const range = document.createRange();
                    range.setStartAfter(span);
                    range.collapse(true);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
                editor.focus();
                panel.remove();
            });
            grid.appendChild(btn);
        });

        panel.appendChild(grid);

        const btnRect = emojiBtn.getBoundingClientRect();
        panel.style.top = (btnRect.bottom + 5) + 'px';
        panel.style.left = btnRect.left + 'px';

        document.body.appendChild(panel);

        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target) && e.target !== emojiBtn) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });
    }

    editorContainer.appendChild(toolbar);
    editorContainer.appendChild(editor);

    mainContainer.appendChild(editorContainer);
    mainContainer.appendChild(consoleContainer);

    textSection.appendChild(mainContainer);

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