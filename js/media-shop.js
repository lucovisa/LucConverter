document.addEventListener('DOMContentLoaded', function() {
    const mediaSection = document.getElementById('mediaShop');
    
    mediaSection.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.style.marginBottom = '1rem';
    backBtn.addEventListener('click', function() {
        showMainMenu();
    });
    mediaSection.appendChild(backBtn);
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = '<p>Drag and drop audio or video files here or click to select</p>';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*,video/*,.mp3,.wav,.ogg,.aac,.flac,.m4a,.mp4,.webm,.avi,.mov,.mkv,.gif';
    fileInput.style.display = 'none';
    
    dropZone.appendChild(fileInput);
    
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    });
    
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            processFile(this.files[0]);
        }
    });
    
    const editorContainer = document.createElement('div');
    editorContainer.id = 'mediaEditor';
    editorContainer.style.display = 'none';
    editorContainer.style.marginTop = '2rem';
    
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
            ffmpegInstance = createFFmpeg({ 
                log: false,
                corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
            });
            
            await ffmpegInstance.load();
            return ffmpegInstance;
        } catch (e) {
            console.error('FFmpeg load error:', e);
            return null;
        }
    }
    
    function showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentElement.insertBefore(errorDiv, element.nextSibling);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
    
    function processFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus'];
        const videoExtensions = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif', 'flv', 'wmv', 'm4v'];
        
        const isAudio = file.type.startsWith('audio/') || audioExtensions.includes(extension);
        const isVideo = file.type.startsWith('video/') || videoExtensions.includes(extension);
        
        if (!isAudio && !isVideo) {
            showError(dropZone, 'Unsupported file type. Please select audio or video.');
            return;
        }
        
        originalFile = file;
        processedBlob = null;
        
        editorContainer.style.display = 'block';
        editorContainer.innerHTML = '';
        
        const mediaTitle = document.createElement('h3');
        mediaTitle.textContent = `Editing: ${file.name}`;
        mediaTitle.style.marginBottom = '1rem';
        mediaTitle.style.color = 'var(--accent)';
        editorContainer.appendChild(mediaTitle);
        
        const splitContainer = document.createElement('div');
        splitContainer.style.display = 'flex';
        splitContainer.style.gap = '1rem';
        splitContainer.style.flexWrap = 'wrap';
        splitContainer.style.marginBottom = '1rem';
        
        const originalContainer = document.createElement('div');
        originalContainer.style.flex = '1';
        originalContainer.style.minWidth = '300px';
        
        const originalLabel = document.createElement('h4');
        originalLabel.textContent = 'Original';
        originalLabel.style.color = 'var(--accent)';
        originalLabel.style.marginBottom = '0.5rem';
        originalContainer.appendChild(originalLabel);
        
        const mediaElement = document.createElement(isVideo ? 'video' : 'audio');
        mediaElement.controls = true;
        mediaElement.style.width = '100%';
        mediaElement.style.display = 'block';
        mediaElement.src = URL.createObjectURL(file);
        
        mediaElement.addEventListener('loadedmetadata', function() {
            mediaDuration = mediaElement.duration;
            endTimeInput.value = mediaDuration;
            endTimeInput.max = mediaDuration;
            startTimeInput.max = mediaDuration;
            durationLabel.textContent = `Duration: ${formatTime(mediaDuration)}`;
        });
        
        originalContainer.appendChild(mediaElement);
        splitContainer.appendChild(originalContainer);
        
        const resultContainer = document.createElement('div');
        resultContainer.style.flex = '1';
        resultContainer.style.minWidth = '300px';
        
        const resultLabel = document.createElement('h4');
        resultLabel.textContent = 'Result';
        resultLabel.style.color = 'var(--accent)';
        resultLabel.style.marginBottom = '0.5rem';
        resultContainer.appendChild(resultLabel);
        
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
        resultContainer.appendChild(resultPlaceholder);
        splitContainer.appendChild(resultContainer);
        
        editorContainer.appendChild(splitContainer);
        
        const controlsContainer = document.createElement('div');
        controlsContainer.style.padding = '1rem';
        controlsContainer.style.background = 'var(--panel-bg)';
        controlsContainer.style.border = '1px solid var(--border)';
        controlsContainer.style.borderRadius = '4px';
        
        const trimSection = document.createElement('div');
        trimSection.style.marginBottom = '1rem';
        
        const trimTitle = document.createElement('h4');
        trimTitle.textContent = 'Select Start and End';
        trimTitle.style.marginBottom = '0.5rem';
        trimTitle.style.color = 'var(--accent)';
        trimSection.appendChild(trimTitle);
        
        const trimControls = document.createElement('div');
        trimControls.style.display = 'flex';
        trimControls.style.gap = '1rem';
        trimControls.style.flexWrap = 'wrap';
        trimControls.style.alignItems = 'center';
        
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'number';
        startTimeInput.placeholder = 'Start (seconds)';
        startTimeInput.min = '0';
        startTimeInput.step = '0.1';
        startTimeInput.value = '0';
        startTimeInput.style.flex = '1';
        startTimeInput.style.minWidth = '120px';
        startTimeInput.style.padding = '0.6rem';
        startTimeInput.style.background = 'var(--bg)';
        startTimeInput.style.border = '1px solid var(--border)';
        startTimeInput.style.borderRadius = '4px';
        startTimeInput.style.color = 'var(--text)';
        
        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'number';
        endTimeInput.placeholder = 'End (seconds)';
        endTimeInput.min = '0';
        endTimeInput.step = '0.1';
        endTimeInput.value = '0';
        endTimeInput.style.flex = '1';
        endTimeInput.style.minWidth = '120px';
        endTimeInput.style.padding = '0.6rem';
        endTimeInput.style.background = 'var(--bg)';
        endTimeInput.style.border = '1px solid var(--border)';
        endTimeInput.style.borderRadius = '4px';
        endTimeInput.style.color = 'var(--text)';
        
        const durationLabel = document.createElement('span');
        durationLabel.textContent = 'Duration: 0:00';
        durationLabel.style.fontSize = '0.85rem';
        durationLabel.style.opacity = '0.8';
        
        trimControls.appendChild(startTimeInput);
        trimControls.appendChild(endTimeInput);
        trimSection.appendChild(trimControls);
        trimSection.appendChild(durationLabel);
        controlsContainer.appendChild(trimSection);
        
        const formatSection = document.createElement('div');
        formatSection.style.marginBottom = '1rem';
        
        const formatTitle = document.createElement('h4');
        formatTitle.textContent = 'Output Format';
        formatTitle.style.marginBottom = '0.5rem';
        formatTitle.style.color = 'var(--accent)';
        formatSection.appendChild(formatTitle);
        
        const formatSelect = document.createElement('select');
        formatSelect.style.width = '100%';
        formatSelect.style.padding = '0.6rem';
        formatSelect.style.background = 'var(--bg)';
        formatSelect.style.border = '1px solid var(--border)';
        formatSelect.style.borderRadius = '4px';
        formatSelect.style.color = 'var(--text)';
        
        const formats = isVideo ? 
            ['MP4', 'WebM', 'AVI', 'MOV', 'GIF', 'MP3', 'WAV', 'OGG', 'JPG', 'PNG'] : 
            ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'MP4', 'WebM'];
        
        formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format.toLowerCase();
            option.textContent = format;
            formatSelect.appendChild(option);
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
        processBtn.style.fontSize = '1rem';
        processBtn.addEventListener('click', async function() {
            const startTime = parseFloat(startTimeInput.value);
            const endTime = parseFloat(endTimeInput.value);
            const format = formatSelect.value;
            
            if (isNaN(startTime) || startTime < 0) {
                showError(startTimeInput, 'Please enter a valid start time');
                return;
            }
            
            if (isNaN(endTime) || endTime <= startTime) {
                showError(endTimeInput, 'End time must be greater than start time');
                return;
            }
            
            if (mediaDuration > 0 && endTime > mediaDuration) {
                showError(endTimeInput, `End time cannot exceed ${formatTime(mediaDuration)}`);
                return;
            }
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'success-message';
            statusDiv.textContent = 'Processing... Please wait...';
            controlsContainer.appendChild(statusDiv);
            
            const resultBlob = await processMedia(file, startTime, endTime, format);
            
            statusDiv.remove();
            
            if (resultBlob) {
                processedBlob = resultBlob;
                
                const url = URL.createObjectURL(resultBlob);
                
                const resultElement = document.createElement(isVideo && ['mp4', 'webm', 'avi', 'mov'].includes(format) ? 'video' : 
                    ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(format) ? 'audio' : 'img');
                
                resultElement.controls = resultElement.tagName !== 'IMG';
                resultElement.style.width = '100%';
                resultElement.style.display = 'block';
                resultElement.src = url;
                
                resultPlaceholder.innerHTML = '';
                resultPlaceholder.style.opacity = '1';
                resultPlaceholder.appendChild(resultElement);
            }
        });
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Result';
        downloadBtn.style.padding = '0.7rem 1.5rem';
        downloadBtn.style.background = '#2e7d32';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.style.fontSize = '1rem';
        downloadBtn.addEventListener('click', function() {
            if (processedBlob) {
                const format = formatSelect.value;
                const url = URL.createObjectURL(processedBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'processed_' + file.name.replace(/\.[^.]+$/, '.' + format);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                showError(downloadBtn, 'No processed file. Click Process first.');
            }
        });
        
        actionContainer.appendChild(processBtn);
        actionContainer.appendChild(downloadBtn);
        controlsContainer.appendChild(actionContainer);
        
        editorContainer.appendChild(controlsContainer);
    }
    
    async function processMedia(file, startTime, endTime, format) {
        const duration = endTime - startTime;
        
        const ffmpeg = await initFFmpeg();
        
        if (!ffmpeg) {
            return basicProcess(file, format);
        }
        
        try {
            const { fetchFile } = FFmpeg;
            const inputName = 'input' + getExtension(file.name);
            const outputName = 'output.' + format;
            
            ffmpeg.FS('writeFile', inputName, await fetchFile(file));
            
            const args = ['-i', inputName, '-ss', startTime.toString(), '-t', duration.toString()];
            
            if (['jpg', 'png'].includes(format)) {
                args.push('-vframes', '1');
            }
            
            if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(format)) {
                args.push('-vn');
            }
            
            if (['mp4', 'webm', 'avi', 'mov'].includes(format)) {
                args.push('-c:v', 'libx264', '-c:a', 'aac');
            }
            
            args.push(outputName);
            
            await ffmpeg.run(...args);
            
            const data = ffmpeg.FS('readFile', outputName);
            const mimeType = getMimeType(format);
            const blob = new Blob([data.buffer], { type: mimeType });
            
            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
            
            return blob;
        } catch (e) {
            console.error('FFmpeg error:', e);
            return basicProcess(file, format);
        }
    }
    
    function basicProcess(file, format) {
        if (format === 'jpg' || format === 'png') {
            return null;
        }
        
        return new Blob([file], { type: getMimeType(format) });
    }
    
    function getExtension(filename) {
        return filename.substring(filename.lastIndexOf('.'));
    }
    
    function getMimeType(format) {
        const types = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'gif': 'image/gif',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'm4a': 'audio/mp4',
            'jpg': 'image/jpeg',
            'png': 'image/png'
        };
        return types[format] || 'application/octet-stream';
    }
    
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
});