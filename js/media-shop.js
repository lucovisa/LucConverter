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
    let isPlaying = false;
    
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
        const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma', 'opus', 'webm'];
        const videoExtensions = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'gif', 'flv', 'wmv', 'm4v'];
        
        const isAudio = file.type.startsWith('audio/') || audioExtensions.includes(extension);
        const isVideo = file.type.startsWith('video/') || videoExtensions.includes(extension);
        
        if (!isAudio && !isVideo) {
            showError(dropZone, 'Unsupported file type. Please select audio or video.');
            return;
        }
        
        editorContainer.style.display = 'block';
        editorContainer.innerHTML = '';
        
        const mediaTitle = document.createElement('h3');
        mediaTitle.textContent = `Editing: ${file.name}`;
        mediaTitle.style.marginBottom = '1rem';
        mediaTitle.style.color = 'var(--accent)';
        editorContainer.appendChild(mediaTitle);
        
        const mediaElement = document.createElement(isVideo ? 'video' : 'audio');
        mediaElement.controls = true;
        mediaElement.style.width = '100%';
        mediaElement.style.maxWidth = '800px';
        mediaElement.style.display = 'block';
        mediaElement.style.margin = '0 auto 1rem';
        mediaElement.src = URL.createObjectURL(file);
        
        mediaElement.addEventListener('loadedmetadata', function() {
            mediaDuration = mediaElement.duration;
            endTimeInput.max = mediaDuration;
            endTimeInput.value = mediaDuration;
            durationLabel.textContent = `Duration: ${formatTime(mediaDuration)}`;
        });
        
        editorContainer.appendChild(mediaElement);
        
        const controlsContainer = document.createElement('div');
        controlsContainer.style.padding = '1rem';
        controlsContainer.style.background = 'var(--panel-bg)';
        controlsContainer.style.border = '1px solid var(--border)';
        controlsContainer.style.borderRadius = '4px';
        
        const trimSection = document.createElement('div');
        trimSection.style.marginBottom = '1rem';
        
        const trimTitle = document.createElement('h4');
        trimTitle.textContent = 'Trim';
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
        
        const trimBtn = document.createElement('button');
        trimBtn.textContent = 'Trim';
        trimBtn.style.padding = '0.6rem 1rem';
        trimBtn.style.background = 'var(--button-bg)';
        trimBtn.style.color = 'white';
        trimBtn.style.border = 'none';
        trimBtn.style.borderRadius = '4px';
        trimBtn.style.cursor = 'pointer';
        trimBtn.addEventListener('click', async function() {
            const startTime = parseFloat(startTimeInput.value);
            const endTime = parseFloat(endTimeInput.value);
            
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
            
            const duration = endTime - startTime;
            
            const statusDiv = document.createElement('div');
            statusDiv.className = 'success-message';
            statusDiv.textContent = 'Trimming... Please wait...';
            trimSection.appendChild(statusDiv);
            
            const ffmpeg = await initFFmpeg();
            if (!ffmpeg) {
                statusDiv.textContent = 'FFmpeg not loaded. Preview only.';
                mediaElement.currentTime = startTime;
                mediaElement.play();
                setTimeout(() => mediaElement.pause(), duration * 1000);
                return;
            }
            
            try {
                const { fetchFile } = FFmpeg;
                const inputName = 'input' + getExtension(file.name);
                const outputName = 'output' + getExtension(file.name);
                
                ffmpeg.FS('writeFile', inputName, await fetchFile(file));
                
                await ffmpeg.run(
                    '-i', inputName,
                    '-ss', startTime.toString(),
                    '-t', duration.toString(),
                    '-c', 'copy',
                    outputName
                );
                
                const data = ffmpeg.FS('readFile', outputName);
                const blob = new Blob([data.buffer], { type: file.type });
                downloadFile(blob, 'trimmed_' + file.name);
                
                ffmpeg.FS('unlink', inputName);
                ffmpeg.FS('unlink', outputName);
                
                statusDiv.textContent = 'Trim complete! Downloaded.';
                setTimeout(() => statusDiv.remove(), 3000);
            } catch (e) {
                statusDiv.remove();
                showError(trimBtn, 'Trim failed. Try different format or shorter duration.');
            }
        });
        
        trimControls.appendChild(startTimeInput);
        trimControls.appendChild(endTimeInput);
        trimControls.appendChild(trimBtn);
        trimSection.appendChild(trimControls);
        trimSection.appendChild(durationLabel);
        controlsContainer.appendChild(trimSection);
        
        const convertSection = document.createElement('div');
        convertSection.style.marginBottom = '1rem';
        
        const convertTitle = document.createElement('h4');
        convertTitle.textContent = 'Convert';
        convertTitle.style.marginBottom = '0.5rem';
        convertTitle.style.color = 'var(--accent)';
        convertSection.appendChild(convertTitle);
        
        const convertControls = document.createElement('div');
        convertControls.style.display = 'flex';
        convertControls.style.gap = '0.5rem';
        convertControls.style.flexWrap = 'wrap';
        
        const formats = isVideo ? 
            ['MP4', 'WebM', 'AVI', 'MOV', 'GIF', 'MP3', 'WAV', 'OGG', 'JPG', 'PNG'] : 
            ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'MP4', 'WebM'];
        
        formats.forEach(format => {
            const convertBtn = document.createElement('button');
            convertBtn.textContent = format;
            convertBtn.style.padding = '0.5rem 0.8rem';
            convertBtn.style.background = 'var(--button-bg)';
            convertBtn.style.color = 'white';
            convertBtn.style.border = 'none';
            convertBtn.style.borderRadius = '4px';
            convertBtn.style.cursor = 'pointer';
            convertBtn.style.fontSize = '0.85rem';
            convertBtn.addEventListener('click', async function() {
                const statusDiv = document.createElement('div');
                statusDiv.className = 'success-message';
                statusDiv.textContent = `Converting to ${format}...`;
                convertSection.appendChild(statusDiv);
                
                await convertWithFFmpeg(file, format.toLowerCase(), statusDiv);
                
                setTimeout(() => statusDiv.remove(), 3000);
            });
            convertControls.appendChild(convertBtn);
        });
        
        convertSection.appendChild(convertControls);
        controlsContainer.appendChild(convertSection);
        
        const volumeSection = document.createElement('div');
        volumeSection.style.marginBottom = '1rem';
        
        const volumeTitle = document.createElement('h4');
        volumeTitle.textContent = 'Volume';
        volumeTitle.style.marginBottom = '0.5rem';
        volumeTitle.style.color = 'var(--accent)';
        volumeSection.appendChild(volumeTitle);
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '200';
        volumeSlider.value = '100';
        volumeSlider.style.width = '100%';
        volumeSlider.style.marginBottom = '0.5rem';
        
        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = '100%';
        volumeLabel.style.fontSize = '0.9rem';
        volumeSlider.addEventListener('input', function() {
            volumeLabel.textContent = this.value + '%';
            mediaElement.volume = this.value / 100;
        });
        
        volumeSection.appendChild(volumeSlider);
        volumeSection.appendChild(volumeLabel);
        controlsContainer.appendChild(volumeSection);
        
        const downloadSection = document.createElement('div');
        
        const downloadTitle = document.createElement('h4');
        downloadTitle.textContent = 'Download';
        downloadTitle.style.marginBottom = '0.5rem';
        downloadTitle.style.color = 'var(--accent)';
        downloadSection.appendChild(downloadTitle);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download Original';
        downloadBtn.style.padding = '0.6rem 1rem';
        downloadBtn.style.background = 'var(--button-bg)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', function() {
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
        
        downloadSection.appendChild(downloadBtn);
        controlsContainer.appendChild(downloadSection);
        
        editorContainer.appendChild(controlsContainer);
    }
    
    async function convertWithFFmpeg(file, format, statusDiv) {
        const ffmpeg = await initFFmpeg();
        
        if (!ffmpeg) {
            statusDiv.textContent = 'FFmpeg not loaded. Basic conversion only.';
            basicConvert(file, format);
            return;
        }
        
        try {
            const { fetchFile } = FFmpeg;
            const inputName = 'input' + getExtension(file.name);
            const outputName = 'output.' + format;
            
            ffmpeg.FS('writeFile', inputName, await fetchFile(file));
            
            const args = ['-i', inputName];
            
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
            downloadFile(blob, file.name.replace(/\.[^.]+$/, '.' + format));
            
            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
            
            statusDiv.textContent = `Converted to ${format.toUpperCase()}! Downloaded.`;
        } catch (e) {
            statusDiv.textContent = 'Conversion failed. Try different format.';
        }
    }
    
    function basicConvert(file, format) {
        if (format === 'jpg' || format === 'png') {
            extractFrame(file, format);
        } else {
            const blob = new Blob([file], { type: getMimeType(format) });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, '.' + format));
        }
    }
    
    function extractFrame(videoFile, format) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        
        video.onloadedmetadata = function() {
            video.currentTime = Math.min(1, video.duration / 2);
        };
        
        video.onseeked = function() {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            canvas.toBlob(function(blob) {
                downloadFile(blob, videoFile.name.replace(/\.[^.]+$/, '.' + format));
            }, mimeType);
            
            video.src = '';
        };
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
    
    function downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});