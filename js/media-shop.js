document.addEventListener('DOMContentLoaded', function() {
    const mediaSection = document.getElementById('mediaShop');
    
    mediaSection.innerHTML = '';
    
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = '<p>Drag and drop audio or video files here or click to select</p>';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*,video/*';
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
    
    async function initFFmpeg() {
        if (ffmpegInstance) return ffmpegInstance;
        
        try {
            const { createFFmpeg, fetchFile } = FFmpeg;
            ffmpegInstance = createFFmpeg({ 
                log: true,
                corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
            });
            
            await ffmpegInstance.load();
            return ffmpegInstance;
        } catch (e) {
            console.error('FFmpeg load error:', e);
            return null;
        }
    }
    
    function processFile(file) {
        const isAudio = file.type.startsWith('audio/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isAudio && !isVideo) {
            alert('Unsupported file type. Please select audio or video.');
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
        
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'number';
        startTimeInput.placeholder = 'Start (seconds)';
        startTimeInput.min = '0';
        startTimeInput.step = '0.1';
        startTimeInput.style.flex = '1';
        startTimeInput.style.minWidth = '150px';
        
        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'number';
        endTimeInput.placeholder = 'End (seconds)';
        endTimeInput.min = '0';
        endTimeInput.step = '0.1';
        endTimeInput.style.flex = '1';
        endTimeInput.style.minWidth = '150px';
        
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
                alert('Please enter a valid start time');
                return;
            }
            
            if (isNaN(endTime) || endTime <= startTime) {
                alert('End time must be greater than start time');
                return;
            }
            
            const duration = endTime - startTime;
            
            const ffmpeg = await initFFmpeg();
            if (!ffmpeg) {
                alert('FFmpeg not loaded. Using preview instead.');
                mediaElement.currentTime = startTime;
                mediaElement.play();
                setTimeout(() => mediaElement.pause(), duration * 1000);
                return;
            }
            
            const { fetchFile } = FFmpeg;
            ffmpeg.FS('writeFile', 'input' + getExtension(file.name), await fetchFile(file));
            
            await ffmpeg.run(
                '-i', 'input' + getExtension(file.name),
                '-ss', startTime.toString(),
                '-t', duration.toString(),
                '-c', 'copy',
                'output' + getExtension(file.name)
            );
            
            const data = ffmpeg.FS('readFile', 'output' + getExtension(file.name));
            const blob = new Blob([data.buffer], { type: file.type });
            downloadFile(blob, 'trimmed_' + file.name);
        });
        
        trimControls.appendChild(startTimeInput);
        trimControls.appendChild(endTimeInput);
        trimControls.appendChild(trimBtn);
        trimSection.appendChild(trimControls);
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
            ['MP4', 'WebM', 'AVI', 'MOV', 'GIF', 'MP3', 'WAV', 'JPG', 'PNG'] : 
            ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'MP4', 'WebM'];
        
        formats.forEach(format => {
            const convertBtn = document.createElement('button');
            convertBtn.textContent = format;
            convertBtn.style.padding = '0.6rem 1rem';
            convertBtn.style.background = 'var(--button-bg)';
            convertBtn.style.color = 'white';
            convertBtn.style.border = 'none';
            convertBtn.style.borderRadius = '4px';
            convertBtn.style.cursor = 'pointer';
            convertBtn.addEventListener('click', async function() {
                await convertWithFFmpeg(file, format.toLowerCase());
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
    
    async function convertWithFFmpeg(file, format) {
        const ffmpeg = await initFFmpeg();
        
        if (!ffmpeg) {
            alert('FFmpeg not loaded. Using basic conversion.');
            basicConvert(file, format);
            return;
        }
        
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