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
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    dropZone.appendChild(fileInput);
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) processFiles(files);
    });
    fileInput.addEventListener('change', function() {
        const files = Array.from(this.files);
        if (files.length > 0) processFiles(files);
    });

    const editorContainer = document.createElement('div');
    editorContainer.id = 'mediaEditor';
    editorContainer.style.display = 'none';
    editorContainer.style.marginTop = '2rem';
    mediaSection.appendChild(dropZone);
    mediaSection.appendChild(editorContainer);

    let mediaFiles = [];
    let processedBlobs = [];
    let audioContext = null;

    function processFiles(files) {
        mediaFiles = files;
        processedBlobs = [];
        editorContainer.style.display = 'block';
        editorContainer.innerHTML = '';

        const title = document.createElement('h3');
        title.textContent = `Loaded ${files.length} file(s)`;
        title.style.color = 'var(--accent)';
        title.style.marginBottom = '1rem';
        editorContainer.appendChild(title);

        const fileListContainer = document.createElement('div');
        fileListContainer.style.marginBottom = '1rem';
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.style.padding = '0.5rem';
            fileItem.style.border = '1px solid var(--border)';
            fileItem.style.borderRadius = '4px';
            fileItem.style.marginBottom = '0.3rem';
            fileItem.textContent = `${index + 1}. ${file.name}`;
            fileListContainer.appendChild(fileItem);
        });
        editorContainer.appendChild(fileListContainer);

        const controlsContainer = document.createElement('div');
        controlsContainer.style.padding = '1rem';
        controlsContainer.style.background = 'var(--panel-bg)';
        controlsContainer.style.border = '1px solid var(--border)';
        controlsContainer.style.borderRadius = '4px';

        const settingsRow = document.createElement('div');
        settingsRow.style.display = 'flex';
        settingsRow.style.gap = '1rem';
        settingsRow.style.flexWrap = 'wrap';
        settingsRow.style.marginBottom = '1rem';

        const formatGroup = document.createElement('div');
        formatGroup.style.flex = '1';
        formatGroup.style.minWidth = '150px';
        formatGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Output Format</label>';
        const formatSelect = document.createElement('select');
        formatSelect.style.width = '100%';
        formatSelect.style.padding = '0.5rem';
        formatSelect.style.background = 'var(--bg)';
        formatSelect.style.border = '1px solid var(--border)';
        formatSelect.style.borderRadius = '4px';
        formatSelect.style.color = 'var(--text)';
        const isVideo = files.some(f => f.type.startsWith('video'));
        const isAudio = files.some(f => f.type.startsWith('audio'));
        if (isVideo && !isAudio) {
            ['webm', 'mp4', 'gif', 'jpg', 'png', 'mp3', 'wav'].forEach(f => formatSelect.add(new Option(f.toUpperCase(), f)));
        } else if (isAudio && !isVideo) {
            ['wav', 'mp3'].forEach(f => formatSelect.add(new Option(f.toUpperCase(), f)));
        } else {
            ['webm', 'mp4', 'gif', 'wav', 'mp3', 'jpg', 'png'].forEach(f => formatSelect.add(new Option(f.toUpperCase(), f)));
        }
        formatGroup.appendChild(formatSelect);
        settingsRow.appendChild(formatGroup);

        const qualityGroup = document.createElement('div');
        qualityGroup.style.flex = '1';
        qualityGroup.style.minWidth = '150px';
        qualityGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Quality / Bitrate</label>';
        const qualitySelect = document.createElement('select');
        qualitySelect.style.width = '100%';
        qualitySelect.style.padding = '0.5rem';
        qualitySelect.style.background = 'var(--bg)';
        qualitySelect.style.border = '1px solid var(--border)';
        qualitySelect.style.borderRadius = '4px';
        qualitySelect.style.color = 'var(--text)';
        [
            { value: 'low', label: 'Low (96 kbps)' },
            { value: 'medium', label: 'Medium (128 kbps)' },
            { value: 'high', label: 'High (192 kbps)' },
            { value: 'best', label: 'Best (320 kbps)' }
        ].forEach(q => qualitySelect.add(new Option(q.label, q.value)));
        qualityGroup.appendChild(qualitySelect);
        settingsRow.appendChild(qualityGroup);

        const resolutionGroup = document.createElement('div');
        resolutionGroup.style.flex = '1';
        resolutionGroup.style.minWidth = '150px';
        resolutionGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Resolution</label>';
        const resolutionSelect = document.createElement('select');
        resolutionSelect.style.width = '100%';
        resolutionSelect.style.padding = '0.5rem';
        resolutionSelect.style.background = 'var(--bg)';
        resolutionSelect.style.border = '1px solid var(--border)';
        resolutionSelect.style.borderRadius = '4px';
        resolutionSelect.style.color = 'var(--text)';
        [
            { value: 'original', label: 'Original' },
            { value: '1080p', label: '1080p (1920x1080)' },
            { value: '720p', label: '720p (1280x720)' },
            { value: '480p', label: '480p (854x480)' },
            { value: '360p', label: '360p (640x360)' }
        ].forEach(r => resolutionSelect.add(new Option(r.label, r.value)));
        resolutionGroup.appendChild(resolutionSelect);
        settingsRow.appendChild(resolutionGroup);

        const volumeGroup = document.createElement('div');
        volumeGroup.style.flex = '1';
        volumeGroup.style.minWidth = '150px';
        volumeGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Volume</label>';
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '1000';
        volumeSlider.value = '100';
        volumeSlider.style.width = '100%';
        const volumeLabel = document.createElement('span');
        volumeLabel.textContent = '100%';
        volumeLabel.style.fontSize = '0.85rem';
        volumeSlider.addEventListener('input', () => {
            volumeLabel.textContent = volumeSlider.value + '%';
        });
        volumeGroup.appendChild(volumeSlider);
        volumeGroup.appendChild(volumeLabel);
        settingsRow.appendChild(volumeGroup);

        const speedGroup = document.createElement('div');
        speedGroup.style.flex = '1';
        speedGroup.style.minWidth = '150px';
        speedGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Speed</label>';
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = '0.5';
        speedSlider.max = '2';
        speedSlider.step = '0.1';
        speedSlider.value = '1';
        speedSlider.style.width = '100%';
        const speedLabel = document.createElement('span');
        speedLabel.textContent = '1x';
        speedLabel.style.fontSize = '0.85rem';
        speedSlider.addEventListener('input', () => {
            speedLabel.textContent = speedSlider.value + 'x';
        });
        speedGroup.appendChild(speedSlider);
        speedGroup.appendChild(speedLabel);
        settingsRow.appendChild(speedGroup);

        controlsContainer.appendChild(settingsRow);

        const trimRow = document.createElement('div');
        trimRow.style.display = 'flex';
        trimRow.style.gap = '1rem';
        trimRow.style.flexWrap = 'wrap';
        trimRow.style.marginBottom = '1rem';

        const startGroup = document.createElement('div');
        startGroup.style.flex = '1';
        startGroup.style.minWidth = '120px';
        startGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Start (seconds)</label>';
        const startInput = document.createElement('input');
        startInput.type = 'number';
        startInput.min = '0';
        startInput.step = '0.1';
        startInput.value = '0';
        startInput.style.width = '100%';
        startInput.style.padding = '0.5rem';
        startInput.style.background = 'var(--bg)';
        startInput.style.border = '1px solid var(--border)';
        startInput.style.borderRadius = '4px';
        startInput.style.color = 'var(--text)';
        startGroup.appendChild(startInput);
        trimRow.appendChild(startGroup);

        const endGroup = document.createElement('div');
        endGroup.style.flex = '1';
        endGroup.style.minWidth = '120px';
        endGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">End (seconds)</label>';
        const endInput = document.createElement('input');
        endInput.type = 'number';
        endInput.min = '0';
        endInput.step = '0.1';
        endInput.value = '0';
        endInput.style.width = '100%';
        endInput.style.padding = '0.5rem';
        endInput.style.background = 'var(--bg)';
        endInput.style.border = '1px solid var(--border)';
        endInput.style.borderRadius = '4px';
        endInput.style.color = 'var(--text)';
        endGroup.appendChild(endInput);
        trimRow.appendChild(endGroup);

        const textOverlayGroup = document.createElement('div');
        textOverlayGroup.style.flex = '1';
        textOverlayGroup.style.minWidth = '200px';
        textOverlayGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Text Overlay (for video)</label>';
        const textOverlayInput = document.createElement('input');
        textOverlayInput.type = 'text';
        textOverlayInput.placeholder = 'Enter text to overlay';
        textOverlayInput.style.width = '100%';
        textOverlayInput.style.padding = '0.5rem';
        textOverlayInput.style.background = 'var(--bg)';
        textOverlayInput.style.border = '1px solid var(--border)';
        textOverlayInput.style.borderRadius = '4px';
        textOverlayInput.style.color = 'var(--text)';
        textOverlayGroup.appendChild(textOverlayInput);
        trimRow.appendChild(textOverlayGroup);

        controlsContainer.appendChild(trimRow);

        const mixRow = document.createElement('div');
        mixRow.style.display = 'flex';
        mixRow.style.gap = '1rem';
        mixRow.style.flexWrap = 'wrap';
        mixRow.style.marginBottom = '1rem';

        const mixSelectGroup = document.createElement('div');
        mixSelectGroup.style.flex = '1';
        mixSelectGroup.style.minWidth = '150px';
        mixSelectGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Mix with another file</label>';
        const mixSelect = document.createElement('select');
        mixSelect.style.width = '100%';
        mixSelect.style.padding = '0.5rem';
        mixSelect.style.background = 'var(--bg)';
        mixSelect.style.border = '1px solid var(--border)';
        mixSelect.style.borderRadius = '4px';
        mixSelect.style.color = 'var(--text)';
        mixSelect.add(new Option('None', ''));
        mediaFiles.forEach((f, i) => {
            mixSelect.add(new Option(f.name, i));
        });
        mixSelectGroup.appendChild(mixSelect);
        mixRow.appendChild(mixSelectGroup);

        const mixVolumeGroup = document.createElement('div');
        mixVolumeGroup.style.flex = '1';
        mixVolumeGroup.style.minWidth = '150px';
        mixVolumeGroup.innerHTML = '<label style="display:block;margin-bottom:0.3rem;color:var(--accent)">Mix Volume</label>';
        const mixVolume = document.createElement('input');
        mixVolume.type = 'range';
        mixVolume.min = '0';
        mixVolume.max = '100';
        mixVolume.value = '50';
        mixVolume.style.width = '100%';
        mixVolumeGroup.appendChild(mixVolume);
        mixRow.appendChild(mixVolumeGroup);

        controlsContainer.appendChild(mixRow);

        const actionRow = document.createElement('div');
        actionRow.style.display = 'flex';
        actionRow.style.gap = '0.5rem';
        actionRow.style.flexWrap = 'wrap';

        const processBtn = document.createElement('button');
        processBtn.textContent = 'Process All';
        processBtn.style.padding = '0.7rem 1.5rem';
        processBtn.style.background = 'var(--button-bg)';
        processBtn.style.color = 'white';
        processBtn.style.border = 'none';
        processBtn.style.borderRadius = '4px';
        processBtn.style.cursor = 'pointer';
        processBtn.addEventListener('click', async () => {
            const format = formatSelect.value;
            const quality = qualitySelect.value;
            const resolution = resolutionSelect.value;
            const volume = parseInt(volumeSlider.value);
            const speed = parseFloat(speedSlider.value);
            const start = parseFloat(startInput.value) || 0;
            const end = parseFloat(endInput.value) || 0;
            const overlayText = textOverlayInput.value.trim();
            const mixIndex = mixSelect.value;
            const mixVol = parseInt(mixVolume.value) / 100;
            processedBlobs = [];
            const statusDiv = document.createElement('div');
            statusDiv.className = 'success-message';
            statusDiv.textContent = 'Processing...';
            controlsContainer.appendChild(statusDiv);
            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i];
                let mixFile = null;
                if (mixIndex !== '' && i != mixIndex) {
                    mixFile = mediaFiles[mixIndex];
                }
                const blob = await processMediaFile(file, mixFile, start, end, format, volume, speed, quality, resolution, overlayText, mixVol);
                if (blob) {
                    processedBlobs.push({ blob, fileName: 'processed_' + file.name.replace(/\.[^.]+$/, '.' + format) });
                }
            }
            statusDiv.textContent = `Processed ${processedBlobs.length}/${mediaFiles.length} files`;
            setTimeout(() => statusDiv.remove(), 3000);
            if (processedBlobs.length > 0) {
                showDownloadButtons(processedBlobs, controlsContainer);
            }
        });
        actionRow.appendChild(processBtn);

        const downloadZipBtn = document.createElement('button');
        downloadZipBtn.textContent = 'Download All as ZIP';
        downloadZipBtn.style.padding = '0.7rem 1.5rem';
        downloadZipBtn.style.background = '#2e7d32';
        downloadZipBtn.style.color = 'white';
        downloadZipBtn.style.border = 'none';
        downloadZipBtn.style.borderRadius = '4px';
        downloadZipBtn.style.cursor = 'pointer';
        downloadZipBtn.addEventListener('click', async () => {
            if (processedBlobs.length === 0) {
                showError(downloadZipBtn, 'No processed files');
                return;
            }
            const zip = new JSZip();
            processedBlobs.forEach(item => {
                zip.file(item.fileName, item.blob);
            });
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(zipBlob);
            a.download = 'processed_media.zip';
            a.click();
        });
        actionRow.appendChild(downloadZipBtn);

        controlsContainer.appendChild(actionRow);
        editorContainer.appendChild(controlsContainer);
    }

    function showDownloadButtons(blobs, container) {
        const existing = container.querySelector('.download-results');
        if (existing) existing.remove();
        const downloadContainer = document.createElement('div');
        downloadContainer.className = 'download-results';
        downloadContainer.style.marginTop = '1rem';
        downloadContainer.innerHTML = '<h4 style="color:var(--accent);margin-bottom:0.5rem">Download Results</h4>';
        blobs.forEach(item => {
            const btn = document.createElement('button');
            btn.textContent = item.fileName;
            btn.style.display = 'block';
            btn.style.marginBottom = '0.3rem';
            btn.style.padding = '0.5rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', () => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(item.blob);
                a.download = item.fileName;
                a.click();
            });
            downloadContainer.appendChild(btn);
        });
        container.appendChild(downloadContainer);
    }

    async function processMediaFile(file, mixFile, start, end, format, volumePercent, speed, quality, resolution, overlayText, mixVolume) {
        const isVideo = file.type.startsWith('video');
        const isAudio = file.type.startsWith('audio');
        if (isAudio) {
            if (mixFile && mixFile.type.startsWith('audio')) {
                return await mixAudio(file, mixFile, mixVolume, speed, volumePercent, format, quality);
            } else {
                return await processAudio(file, start, end, volumePercent, speed, format, quality);
            }
        } else if (isVideo) {
            if (format === 'jpg' || format === 'png') {
                return await extractVideoFrame(file, start || 0, quality, resolution);
            } else if (format === 'webm' || format === 'mp4') {
                if (mixFile && mixFile.type.startsWith('audio')) {
                    return await mixAudioIntoVideo(file, mixFile, start, end, volumePercent, speed, quality, resolution, overlayText, mixVolume);
                } else {
                    return await trimVideo(file, start, end, volumePercent, speed, quality, resolution, overlayText);
                }
            } else if (format === 'gif') {
                return await videoToGif(file, start, end, quality, resolution);
            } else if (format === 'mp3' || format === 'wav') {
                return await extractAudioFromVideo(file, start, end, volumePercent, speed, quality, format);
            }
        }
        return null;
    }

    async function processAudio(file, start, end, volumePercent, speed, format, quality) {
        const arrayBuffer = await file.arrayBuffer();
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        try {
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const startSample = Math.floor((start || 0) * audioBuffer.sampleRate);
            const endSample = end > 0 ? Math.floor(end * audioBuffer.sampleRate) : audioBuffer.length;
            const duration = (endSample - startSample) / audioBuffer.sampleRate;
            const newLength = Math.floor(duration * audioBuffer.sampleRate / speed);
            const newBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, newLength, audioBuffer.sampleRate);
            for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
                const oldData = audioBuffer.getChannelData(channel);
                const newData = newBuffer.getChannelData(channel);
                for (let i = 0; i < newLength; i++) {
                    const srcIndex = startSample + Math.floor(i * speed);
                    if (srcIndex < endSample) {
                        newData[i] = oldData[srcIndex] * (volumePercent / 100);
                    } else {
                        newData[i] = 0;
                    }
                }
            }
            if (format === 'mp3') {
                return bufferToMp3(newBuffer, quality);
            }
            return bufferToWav(newBuffer, quality);
        } catch (e) {
            console.error('Audio decode error:', e);
            return null;
        }
    }

    async function mixAudio(file1, file2, mixVolume, speed, volumePercent, format, quality) {
        const arrayBuffer1 = await file1.arrayBuffer();
        const arrayBuffer2 = await file2.arrayBuffer();
        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        try {
            const buffer1 = await audioContext.decodeAudioData(arrayBuffer1);
            const buffer2 = await audioContext.decodeAudioData(arrayBuffer2);
            const length = Math.max(buffer1.length, buffer2.length);
            const newBuffer = audioContext.createBuffer(Math.max(buffer1.numberOfChannels, buffer2.numberOfChannels), length, buffer1.sampleRate);
            for (let channel = 0; channel < newBuffer.numberOfChannels; channel++) {
                const data1 = buffer1.getChannelData(channel);
                const data2 = buffer2.getChannelData(channel);
                const newData = newBuffer.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    const sample1 = i < buffer1.length ? data1[i] : 0;
                    const sample2 = i < buffer2.length ? data2[i] : 0;
                    newData[i] = (sample1 * (volumePercent / 100) + sample2 * mixVolume) / 2;
                }
            }
            if (format === 'mp3') {
                return bufferToMp3(newBuffer, quality);
            }
            return bufferToWav(newBuffer, quality);
        } catch (e) {
            return null;
        }
    }

    async function mixAudioIntoVideo(videoFile, audioFile, start, end, volumePercent, speed, quality, resolution, overlayText, mixVolume) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(videoFile);
            video.volume = volumePercent / 100;
            video.playbackRate = speed;
            const audio = new Audio();
            audio.src = URL.createObjectURL(audioFile);
            audio.volume = mixVolume;
            video.onloadedmetadata = () => {
                video.currentTime = start || 0;
                audio.currentTime = start || 0;
            };
            video.onseeked = () => {
                let width = video.videoWidth || 640;
                let height = video.videoHeight || 360;
                if (resolution === '1080p') { width = 1920; height = 1080; }
                else if (resolution === '720p') { width = 1280; height = 720; }
                else if (resolution === '480p') { width = 854; height = 480; }
                else if (resolution === '360p') { width = 640; height = 360; }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const stream = canvas.captureStream(30);
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                source.connect(dest);
                const audioElSource = audioCtx.createMediaElementSource(audio);
                audioElSource.connect(dest);
                dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
                const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                const chunks = [];
                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    resolve(blob);
                };
                const drawOverlay = () => {
                    ctx.drawImage(video, 0, 0, width, height);
                    if (overlayText) {
                        ctx.fillStyle = 'white';
                        ctx.font = '30px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(overlayText, width / 2, height / 2);
                    }
                };
                drawOverlay();
                recorder.start();
                video.play();
                audio.play();
                const duration = end > start ? (end - start) * 1000 / speed : 5000;
                const interval = setInterval(drawOverlay, 100);
                setTimeout(() => {
                    clearInterval(interval);
                    recorder.stop();
                    video.pause();
                    audio.pause();
                    source.disconnect();
                    audioElSource.disconnect();
                    audioCtx.close();
                }, duration);
            };
            video.onerror = reject;
        });
    }

    async function trimVideo(file, start, end, volumePercent, speed, quality, resolution, overlayText) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.volume = volumePercent / 100;
            video.playbackRate = speed;
            video.onloadedmetadata = () => {
                video.currentTime = start || 0;
            };
            video.onseeked = () => {
                let width = video.videoWidth || 640;
                let height = video.videoHeight || 360;
                if (resolution === '1080p') { width = 1920; height = 1080; }
                else if (resolution === '720p') { width = 1280; height = 720; }
                else if (resolution === '480p') { width = 854; height = 480; }
                else if (resolution === '360p') { width = 640; height = 360; }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const stream = canvas.captureStream(30);
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                source.connect(dest);
                dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
                const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                const chunks = [];
                recorder.ondataavailable = e => chunks.push(e.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    resolve(blob);
                };
                const drawOverlay = () => {
                    ctx.drawImage(video, 0, 0, width, height);
                    if (overlayText) {
                        ctx.fillStyle = 'white';
                        ctx.font = '30px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(overlayText, width / 2, height / 2);
                    }
                };
                drawOverlay();
                recorder.start();
                video.play();
                const duration = end > start ? (end - start) * 1000 / speed : 5000;
                const interval = setInterval(drawOverlay, 100);
                setTimeout(() => {
                    clearInterval(interval);
                    recorder.stop();
                    video.pause();
                    source.disconnect();
                    audioCtx.close();
                }, duration);
            };
            video.onerror = reject;
        });
    }

    async function videoToGif(file, start, end, quality, resolution) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = start || 0;
            };
            video.onseeked = () => {
                const width = video.videoWidth || 640;
                const height = video.videoHeight || 360;
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                const gif = new GIF({
                    workers: 2,
                    quality: 10,
                    width: width,
                    height: height
                });
                const duration = end > start ? (end - start) * 1000 : 2000;
                const fps = 10;
                const frameInterval = 1000 / fps;
                let frameCount = 0;
                const maxFrames = Math.floor(duration / frameInterval);
                const captureFrame = () => {
                    ctx.drawImage(video, 0, 0, width, height);
                    gif.addFrame(ctx, { copy: true, delay: frameInterval });
                    frameCount++;
                    if (frameCount >= maxFrames || video.ended) {
                        gif.render();
                    } else {
                        setTimeout(captureFrame, frameInterval);
                    }
                };
                gif.on('finished', (blob) => {
                    resolve(blob);
                });
                gif.on('error', reject);
                video.play();
                captureFrame();
            };
            video.onerror = reject;
        });
    }

    async function extractAudioFromVideo(file, start, end, volumePercent, speed, quality, format) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.playbackRate = speed;
            video.volume = volumePercent / 100;
            video.onloadedmetadata = () => {
                video.currentTime = start || 0;
            };
            video.onseeked = () => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = audioContext.createMediaElementSource(video);
                const destination = audioContext.createMediaStreamDestination();
                source.connect(destination);
                const mediaRecorder = new MediaRecorder(destination.stream);
                const chunks = [];
                mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, { type: format === 'mp3' ? 'audio/mpeg' : 'audio/wav' });
                    resolve(blob);
                };
                mediaRecorder.start();
                video.play();
                const duration = end > start ? (end - start) * 1000 / speed : 5000;
                setTimeout(() => {
                    mediaRecorder.stop();
                    video.pause();
                    source.disconnect();
                    audioContext.close();
                }, duration);
            };
            video.onerror = reject;
        });
    }

    function bufferToWav(buffer, quality) {
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

    function bufferToMp3(buffer, quality) {
        const bitrates = { low: 96, medium: 128, high: 192, best: 320 };
        const bitrate = bitrates[quality] || 128;
        const channels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
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
        return new Blob([mp3Data, endData], { type: 'audio/mp3' });
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