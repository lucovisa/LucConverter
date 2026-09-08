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

    let mediaDuration = 0;
    let originalFile = null;
    let processedBlob = null;
    let audioBuffer = null;
    let audioContext = null;

    function processFile(file) {
        originalFile = file;
        processedBlob = null;
        audioBuffer = null;
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
        const formats = file.type.startsWith('video') ? ['webm', 'jpg', 'png'] : ['wav', 'mp3'];
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
            const volumePercent = parseInt(volumeSlider.value);

            if (isNaN(start) || start < 0) { showError(startTimeInput, 'Invalid start time'); return; }
            if (isNaN(end) || end <= start) { showError(endTimeInput, 'End must be greater than start'); return; }
            if (mediaDuration > 0 && end > mediaDuration) { showError(endTimeInput, 'End exceeds duration'); return; }

            const status = document.createElement('div');
            status.className = 'success-message';
            status.textContent = 'Processing...';
            controlsContainer.appendChild(status);

            processedBlob = await processMediaFile(file, start, end, format, volumePercent);
            status.remove();

            if (processedBlob) {
                const url = URL.createObjectURL(processedBlob);
                const resultEl = document.createElement(format === 'jpg' || format === 'png' ? 'img' : format === 'webm' ? 'video' : 'audio');
                if (resultEl.tagName !== 'IMG') {
                    resultEl.controls = true;
                }
                resultEl.src = url;
                resultEl.style.width = '100%';
                resultPlaceholder.innerHTML = '';
                resultPlaceholder.style.opacity = '1';
                resultPlaceholder.appendChild(resultEl);
            } else {
                showError(processBtn, 'Processing failed. Unsupported conversion.');
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

    async function processMediaFile(file, start, end, format, volumePercent) {
        const isVideo = file.type.startsWith('video');
        const isAudio = file.type.startsWith('audio');

        if (isAudio) {
            return await processAudio(file, start, end, volumePercent, format);
        } else if (isVideo) {
            if (format === 'jpg' || format === 'png') {
                return await extractVideoFrame(file, start);
            } else if (format === 'webm') {
                return await trimVideo(file, start, end, volumePercent);
            }
        }
        return null;
    }

    async function processAudio(file, start, end, volumePercent, format) {
        const arrayBuffer = await file.arrayBuffer();
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();

        try {
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error('Audio decode error:', e);
            return null;
        }

        const startSample = Math.floor(start * audioBuffer.sampleRate);
        const endSample = Math.floor(end * audioBuffer.sampleRate);
        const duration = end - start;
        const newLength = Math.floor(duration * audioBuffer.sampleRate);
        const newBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, newLength, audioBuffer.sampleRate);

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
            const oldData = audioBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);
            for (let i = 0; i < newLength; i++) {
                newData[i] = oldData[startSample + i] * (volumePercent / 100);
            }
        }

        if (format === 'mp3') {
            return bufferToMp3(newBuffer);
        }
        return bufferToWav(newBuffer);
    }

    async function trimVideo(file, start, end, volumePercent) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.volume = volumePercent / 100;
            
            video.onloadedmetadata = () => {
                video.currentTime = start;
            };

            video.onseeked = () => {
                const stream = video.captureStream();
                const recorder = new MediaRecorder(stream);
                const chunks = [];
                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.onstop = () => {
                    resolve(new Blob(chunks, { type: 'video/webm' }));
                };
                recorder.start();
                video.play();
                setTimeout(() => {
                    recorder.stop();
                    video.pause();
                }, (end - start) * 1000);
            };

            video.onerror = () => reject(new Error('Video error'));
        });
    }

    async function extractVideoFrame(file, time) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = time;
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                canvas.toBlob(blob => resolve(blob), 'image/png');
                video.src = '';
            };
            video.onerror = reject;
        });
    }

    function bufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1;
        const bitDepth = 16;
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        const dataLength = buffer.length * blockAlign;
        const bufferSize = 44 + dataLength;
        const arrayBuffer = new ArrayBuffer(bufferSize);
        const view = new DataView(arrayBuffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, bufferSize - 8, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sample = buffer.getChannelData(channel)[i];
                const clamped = Math.max(-1, Math.min(1, sample));
                view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    function bufferToMp3(buffer) {
        const channels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        const samples = new Int16Array(buffer.length * channels);
        let offset = 0;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = buffer.getChannelData(channel)[i];
                const clamped = Math.max(-1, Math.min(1, sample));
                samples[offset++] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
            }
        }
        const mp3Data = mp3encoder.encodeBuffer(samples);
        const endData = mp3encoder.flush();
        const blob = new Blob([mp3Data, endData], { type: 'audio/mp3' });
        return blob;
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function getExtension(filename) {
        return filename.substring(filename.lastIndexOf('.'));
    }
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}