document.addEventListener('DOMContentLoaded', function() {
    initMediaShop();
});

function initMediaShop() {
    const mediaSection = document.getElementById('mediaShop');
    if (!mediaSection) return;
    mediaSection.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => showMainMenu());
    mediaSection.appendChild(backBtn);
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = '<p>Drag and drop audio or video files here or click to select</p>';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*,video/*';
    fileInput.style.display = 'none';
    dropZone.appendChild(fileInput);
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) processFile(this.files[0]);
    });
    
    const editorContainer = document.createElement('div');
    editorContainer.id = 'mediaEditor';
    editorContainer.style.display = 'none';
    mediaSection.appendChild(dropZone);
    mediaSection.appendChild(editorContainer);
    
    let ffmpegInstance = null;
    let mediaDuration = 0;
    let originalFile = null;
    let processedBlob = null;
    
    async function initFFmpeg() {
        if (ffmpegInstance) return ffmpegInstance;
        try {
            const { createFFmpeg, fetchFile } = FFmpeg;
            ffmpegInstance = createFFmpeg({ log: false, corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js' });
            await ffmpegInstance.load();
            return ffmpegInstance;
        } catch(e) { return null; }
    }
    
    function processFile(file) {
        originalFile = file;
        processedBlob = null;
        editorContainer.style.display = 'block';
        editorContainer.innerHTML = '';
        const title = document.createElement('h3');
        title.textContent = `Editing: ${file.name}`;
        title.style.color = 'var(--accent)';
        editorContainer.appendChild(title);
        
        const previewContainer = document.createElement('div');
        previewContainer.style.display = 'flex';
        previewContainer.style.gap = '1rem';
        previewContainer.style.flexWrap = 'wrap';
        previewContainer.style.marginBottom = '1rem';
        
        const originalPreview = document.createElement('div');
        originalPreview.style.flex = '1';
        originalPreview.style.minWidth = '300px';
        const originalLabel = document.createElement('h4');
        originalLabel.textContent = 'Original';
        originalLabel.style.color = 'var(--accent)';
        originalPreview.appendChild(originalLabel);
        const mediaElement = document.createElement(file.type.startsWith('video') ? 'video' : 'audio');
        mediaElement.controls = true;
        mediaElement.style.width = '100%';
        mediaElement.src = URL.createObjectURL(file);
        mediaElement.addEventListener('loadedmetadata', () => {
            mediaDuration = mediaElement.duration;
            endTimeInput.max = mediaDuration;
            endTimeInput.value = mediaDuration;
            durationLabel.textContent = `Duration: ${formatTime(mediaDuration)}`;
        });
        originalPreview.appendChild(mediaElement);
        previewContainer.appendChild(originalPreview);
        
        const resultPreview = document.createElement('div');
        resultPreview.style.flex = '1';
        resultPreview.style.minWidth = '300px';
        const resultLabel = document.createElement('h4');
        resultLabel.textContent = 'Result';
        resultLabel.style.color = 'var(--accent)';
        resultPreview.appendChild(resultLabel);
        const resultPlaceholder = document.createElement('div');
        resultPlaceholder.style.width = '100%';
        resultPlaceholder.style.minHeight = '200px';
        resultPlaceholder.style.background = 'var(--bg)';
        resultPlaceholder.style.border = '1px solid var(--border)';
        resultPlaceholder.style.borderRadius = '4px';
        resultPlaceholder.style.display = 'flex';
        resultPlaceholder.style.alignItems = 'center';
        resultPlaceholder.style.justifyContent = 'center';
        resultPlaceholder.style.color = 'var(--text)';
        resultPlaceholder.style.opacity = '0.5';
        resultPlaceholder.textContent = 'Result will appear here';
        resultPreview.appendChild(resultPlaceholder);
        previewContainer.appendChild(resultPreview);
        editorContainer.appendChild(previewContainer);
        
        const controlsContainer = document.createElement('div');
        controlsContainer.style.padding = '1rem';
        controlsContainer.style.background = 'var(--panel-bg)';
        controlsContainer.style.border = '1px solid var(--border)';
        controlsContainer.style.borderRadius = '4px';
        
        const trimSection = document.createElement('div');
        trimSection.style.marginBottom = '1rem';
        trimSection.innerHTML = '<h4 style="color: var(--accent); margin-bottom: 0.5rem;">Select Start and End</h4>';
        const trimControls = document.createElement('div');
        trimControls.style.display = 'flex';
        trimControls.style.gap = '1rem';
        trimControls.style.flexWrap = 'wrap';
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'number';
        startTimeInput.placeholder = 'Start (seconds)';
        startTimeInput.min = '0';
        startTimeInput.step = '0.1';
        startTimeInput.value = '0';
        startTimeInput.style.flex = '1';
        startTimeInput.style.minWidth = '120px';
        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'number';
        endTimeInput.placeholder = 'End (seconds)';
        endTimeInput.min = '0';
        endTimeInput.step = '0.1';
        endTimeInput.value = '0';
        endTimeInput.style.flex = '1';
        endTimeInput.style.minWidth = '120px';
        const durationLabel = document.createElement('span');
        durationLabel.textContent = 'Duration: 0:00';
        durationLabel.style.fontSize = '0.85rem';
        trimControls.appendChild(startTimeInput);
        trimControls.appendChild(endTimeInput);
        trimControls.appendChild(durationLabel);
        trimSection.appendChild(trimControls);
        controlsContainer.appendChild(trimSection);
        
        const volumeSection = document.createElement('div');
        volumeSection.style.marginBottom = '1rem';
        volumeSection.innerHTML = '<h4 style="color: var(--accent); margin-bottom: 0.5rem;">Volume</h4>';
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '1000';
        volumeSlider.value = '100';
        volumeSlider.style.width = '100%';
        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = '100%';
        volumeSlider.addEventListener('input', function() {
            volumeLabel.textContent = this.value + '%';
            mediaElement.volume = this.value / 100;
        });
        volumeSection.appendChild(volumeSlider);
        volumeSection.appendChild(volumeLabel);
        controlsContainer.appendChild(volumeSection);
        
        const formatSection = document.createElement('div');
        formatSection.style.marginBottom = '1rem';
        formatSection.innerHTML = '<h4 style="color: var(--accent); margin-bottom: 0.5rem;">Output Format</h4>';
        const formatSelect = document.createElement('select');
        formatSelect.style.width = '100%';
        const formats = file.type.startsWith('video') ? ['mp4','webm','avi','mov','gif','mp3','wav','ogg','jpg','png'] : ['mp3','wav','ogg','aac','flac','m4a','mp4','webm'];
        formats.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f.toUpperCase();
            formatSelect.appendChild(opt);
        });
        formatSection.appendChild(formatSelect);
        controlsContainer.appendChild(formatSection);
        
        const actionContainer = document.createElement('div');
        actionContainer.style.display = 'flex';
        actionContainer.style.gap = '0.5rem';
        actionContainer.style.flexWrap = 'wrap';
        
        const processBtn = document.createElement('button');
        processBtn.textContent = 'Process';
        processBtn.style.padding = '0.7rem 1.5rem';
        processBtn.style.background = 'var(--button-bg)';
        processBtn.style.color = 'white';
        processBtn.style.border = 'none';
        processBtn.style.borderRadius = '4px';
        processBtn.style.cursor = 'pointer';
        processBtn.addEventListener('click', async () => {
            const start = parseFloat(startTimeInput.value);
            const end = parseFloat(endTimeInput.value);
            const format = formatSelect.value;
            const volume = parseInt(volumeSlider.value);
            if (isNaN(start) || start < 0) { showError(startTimeInput, 'Invalid start time'); return; }
            if (isNaN(end) || end <= start) { showError(endTimeInput, 'End must be greater than start'); return; }
            if (mediaDuration > 0 && end > mediaDuration) { showError(endTimeInput, 'End exceeds duration'); return; }
            const status = document.createElement('div');
            status.className = 'success-message';
            status.textContent = 'Processing...';
            controlsContainer.appendChild(status);
            processedBlob = await processMedia(file, start, end, format, volume);
            status.remove();
            if (processedBlob) {
                const url = URL.createObjectURL(processedBlob);
                const resultEl = document.createElement(['mp4','webm','avi','mov'].includes(format) ? 'video' : ['mp3','wav','ogg','aac','flac','m4a'].includes(format) ? 'audio' : 'img');
                resultEl.controls = resultEl.tagName !== 'IMG';
                resultEl.src = url;
                resultEl.style.width = '100%';
                resultPlaceholder.innerHTML = '';
                resultPlaceholder.style.opacity = '1';
                resultPlaceholder.appendChild(resultEl);
            }
        });
        actionContainer.appendChild(processBtn);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Result';
        downloadBtn.style.padding = '0.7rem 1.5rem';
        downloadBtn.style.background = '#2e7d32';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', () => {
            if (processedBlob) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(processedBlob);
                a.download = 'processed_' + originalFile.name.replace(/\.[^.]+$/, '.' + formatSelect.value);
                a.click();
            } else {
                showError(downloadBtn, 'No processed file');
            }
        });
        actionContainer.appendChild(downloadBtn);
        
        const downloadOriginalBtn = document.createElement('button');
        downloadOriginalBtn.textContent = 'Download Original';
        downloadOriginalBtn.style.padding = '0.7rem 1.5rem';
        downloadOriginalBtn.style.background = 'var(--border)';
        downloadOriginalBtn.style.color = 'var(--text)';
        downloadOriginalBtn.style.border = 'none';
        downloadOriginalBtn.style.borderRadius = '4px';
        downloadOriginalBtn.style.cursor = 'pointer';
        downloadOriginalBtn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(originalFile);
            a.download = originalFile.name;
            a.click();
        });
        actionContainer.appendChild(downloadOriginalBtn);
        
        controlsContainer.appendChild(actionContainer);
        editorContainer.appendChild(controlsContainer);
    }
    
    async function processMedia(file, start, end, format, volumePercent) {
        const duration = end - start;
        const ffmpeg = await initFFmpeg();
        if (!ffmpeg) return basicProcess(file, format, start, end);
        try {
            const { fetchFile } = FFmpeg;
            const inputName = 'input' + getExtension(file.name);
            const outputName = 'output.' + format;
            ffmpeg.FS('writeFile', inputName, await fetchFile(file));
            const args = ['-i', inputName, '-ss', start.toString(), '-t', duration.toString()];
            if (['mp3','wav','ogg','aac','flac','m4a'].includes(format)) args.push('-vn');
            if (['jpg','png'].includes(format)) args.push('-vframes', '1');
            if (['mp4','webm','avi','mov'].includes(format)) args.push('-c:v', 'libx264', '-c:a', 'aac');
            if (volumePercent !== 100) {
                const volumeDb = 20 * Math.log10(volumePercent / 100);
                args.push('-af', `volume=${volumeDb.toFixed(2)}dB`);
            }
            args.push(outputName);
            await ffmpeg.run(...args);
            const data = ffmpeg.FS('readFile', outputName);
            const blob = new Blob([data.buffer], { type: getMimeType(format) });
            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
            return blob;
        } catch(e) {
            return basicProcess(file, format, start, end);
        }
    }
    
    function basicProcess(file, format, start, end) {
        return new Blob([file], { type: getMimeType(format) });
    }
    
    function getExtension(filename) { return filename.substring(filename.lastIndexOf('.')); }
    function getMimeType(format) {
        const types = {
            'mp4':'video/mp4','webm':'video/webm','avi':'video/x-msvideo','mov':'video/quicktime','gif':'image/gif',
            'mp3':'audio/mpeg','wav':'audio/wav','ogg':'audio/ogg','aac':'audio/aac','flac':'audio/flac','m4a':'audio/mp4',
            'jpg':'image/jpeg','png':'image/png'
        };
        return types[format] || 'application/octet-stream';
    }
    function formatTime(seconds) {
        const mins = Math.floor(seconds/60);
        const secs = Math.floor(seconds%60);
        return `${mins}:${secs.toString().padStart(2,'0')}`;
    }
}