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
    dropZone.innerHTML = '<p>Drag and drop audio, video or 3D files here or click to select</p>';
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*,video/*,.glb,.gltf,.obj,.mp3,.wav,.ogg,.aac,.flac,.m4a,.opus,.wma,.mp4,.webm,.avi,.mov,.gif,.mkv,.flv,.wmv';
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

    function isAllowedFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const allowedExt = ['glb', 'gltf', 'obj'];
        const audioExt = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'];
        const videoExt = ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'];
        return file.type.startsWith('audio') || 
               file.type.startsWith('video') || 
               allowedExt.includes(ext) || 
               audioExt.includes(ext) || 
               videoExt.includes(ext);
    }

    function isMediaFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const audioExt = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'];
        const videoExt = ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'];
        return file.type.startsWith('audio') || file.type.startsWith('video') || audioExt.includes(ext) || videoExt.includes(ext);
    }

    function is3DFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['glb', 'gltf', 'obj'].includes(ext);
    }

    function processFiles(files) {
        const validFiles = files.filter(isAllowedFile);
        const invalidFiles = files.filter(f => !isAllowedFile(f));

        if (invalidFiles.length > 0) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = `Skipped ${invalidFiles.length} unsupported file(s). Only audio, video, GLB, GLTF and OBJ are allowed.`;
            editorContainer.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
        }

        if (validFiles.length === 0 && files.length > 0) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'No supported files. Please upload audio, video, GLB, GLTF or OBJ files.';
            editorContainer.appendChild(errorDiv);
            setTimeout(() => errorDiv.remove(), 5000);
            return;
        }

        if (validFiles.length > 0) {
            mediaFiles = [...mediaFiles, ...validFiles];
            processedBlobs = [];
        }

        if (mediaFiles.length === 0) {
            editorContainer.style.display = 'none';
            editorContainer.innerHTML = '';
            return;
        }

        editorContainer.style.display = 'block';
        editorContainer.innerHTML = '';

        const title = document.createElement('h3');
        title.textContent = `Loaded ${mediaFiles.length} file(s)`;
        title.style.color = 'var(--accent)';
        title.style.marginBottom = '1rem';
        editorContainer.appendChild(title);

        const previewContainer = document.createElement('div');
        previewContainer.style.display = 'flex';
        previewContainer.style.flexWrap = 'wrap';
        previewContainer.style.gap = '0.5rem';
        previewContainer.style.marginBottom = '1rem';

        mediaFiles.forEach((file, index) => {
            if (isMediaFile(file)) {
                const previewItem = document.createElement('div');
                previewItem.style.flex = '1';
                previewItem.style.minWidth = '200px';
                previewItem.style.maxWidth = '300px';
                previewItem.style.background = 'var(--panel-bg)';
                previewItem.style.border = '1px solid var(--border)';
                previewItem.style.borderRadius = '4px';
                previewItem.style.padding = '0.5rem';
                previewItem.style.position = 'relative';

                const removeBtn = document.createElement('button');
                removeBtn.textContent = '✕';
                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '5px';
                removeBtn.style.right = '5px';
                removeBtn.style.background = '#8B0000';
                removeBtn.style.color = 'white';
                removeBtn.style.border = 'none';
                removeBtn.style.borderRadius = '50%';
                removeBtn.style.width = '24px';
                removeBtn.style.height = '24px';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.zIndex = '10';
                removeBtn.style.fontSize = '12px';
                removeBtn.style.display = 'flex';
                removeBtn.style.alignItems = 'center';
                removeBtn.style.justifyContent = 'center';
                removeBtn.addEventListener('click', () => {
                    removeFile(index);
                });
                previewItem.appendChild(removeBtn);

                const previewLabel = document.createElement('div');
                previewLabel.textContent = file.name;
                previewLabel.style.fontSize = '0.85rem';
                previewLabel.style.marginBottom = '0.3rem';
                previewLabel.style.overflow = 'hidden';
                previewLabel.style.textOverflow = 'ellipsis';
                previewLabel.style.whiteSpace = 'nowrap';
                previewLabel.style.paddingRight = '25px';
                previewItem.appendChild(previewLabel);

                const ext = file.name.split('.').pop().toLowerCase();
                const isVideo = file.type.startsWith('video') || ['mp4','webm','avi','mov','gif','mkv','flv','wmv'].includes(ext);
                const isAudio = file.type.startsWith('audio') || ['mp3','wav','ogg','aac','flac','m4a','opus','wma'].includes(ext);

                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = URL.createObjectURL(file);
                    video.controls = true;
                    video.style.width = '100%';
                    video.style.maxHeight = '150px';
                    video.style.borderRadius = '4px';
                    video.preload = 'metadata';
                    previewItem.appendChild(video);
                } else if (isAudio) {
                    const audio = document.createElement('audio');
                    audio.src = URL.createObjectURL(file);
                    audio.controls = true;
                    audio.style.width = '100%';
                    audio.preload = 'metadata';
                    previewItem.appendChild(audio);
                }

                previewContainer.appendChild(previewItem);
            }
        });

        if (previewContainer.children.length > 0) {
            editorContainer.appendChild(previewContainer);
        }

        const fileListContainer = document.createElement('div');
        fileListContainer.style.marginBottom = '1rem';
        mediaFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.style.padding = '0.5rem';
            fileItem.style.border = '1px solid var(--border)';
            fileItem.style.borderRadius = '4px';
            fileItem.style.marginBottom = '0.3rem';
            fileItem.style.display = 'flex';
            fileItem.style.alignItems = 'center';
            fileItem.style.justifyContent = 'space-between';

            const fileName = document.createElement('span');
            fileName.textContent = `${index + 1}. ${file.name}`;
            fileName.style.flex = '1';
            fileName.style.marginRight = '10px';

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.style.padding = '0.3rem 0.8rem';
            deleteBtn.style.background = '#8B0000';
            deleteBtn.style.color = 'white';
            deleteBtn.style.border = 'none';
            deleteBtn.style.borderRadius = '4px';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.style.fontSize = '0.85rem';
            deleteBtn.addEventListener('click', () => {
                removeFile(index);
            });

            fileItem.appendChild(fileName);
            fileItem.appendChild(deleteBtn);
            fileListContainer.appendChild(fileItem);
        });

        const clearBtn = document.createElement('button');
        clearBtn.textContent = 'Clear All Files';
        clearBtn.style.padding = '0.5rem 1rem';
        clearBtn.style.background = '#8B0000';
        clearBtn.style.color = 'white';
        clearBtn.style.border = 'none';
        clearBtn.style.borderRadius = '4px';
        clearBtn.style.cursor = 'pointer';
        clearBtn.style.marginTop = '0.5rem';
        clearBtn.addEventListener('click', () => {
            mediaFiles = [];
            processedBlobs = [];
            editorContainer.style.display = 'none';
            editorContainer.innerHTML = '';
        });
        fileListContainer.appendChild(clearBtn);

        editorContainer.appendChild(fileListContainer);

        const has3D = mediaFiles.some(f => is3DFile(f));

        if (has3D) {
            const viewerContainer = document.createElement('div');
            viewerContainer.style.width = '100%';
            viewerContainer.style.height = '500px';
            viewerContainer.style.position = 'relative';
            viewerContainer.style.background = '#000000';
            viewerContainer.style.borderRadius = '4px';
            viewerContainer.style.marginBottom = '1rem';
            viewerContainer.style.overflow = 'hidden';
            editorContainer.appendChild(viewerContainer);

            const viewerInfo = document.createElement('div');
            viewerInfo.textContent = 'Loading 3D model...';
            viewerInfo.style.position = 'absolute';
            viewerInfo.style.top = '50%';
            viewerInfo.style.left = '50%';
            viewerInfo.style.transform = 'translate(-50%, -50%)';
            viewerInfo.style.color = 'white';
            viewerInfo.style.fontSize = '1.2rem';
            viewerInfo.style.zIndex = '10';
            viewerContainer.appendChild(viewerInfo);

            const controlsInfo = document.createElement('div');
            controlsInfo.textContent = 'Mouse: rotate | Wheel: zoom | Right click: pan';
            controlsInfo.style.position = 'absolute';
            controlsInfo.style.bottom = '10px';
            controlsInfo.style.left = '50%';
            controlsInfo.style.transform = 'translateX(-50%)';
            controlsInfo.style.color = '#aaa';
            controlsInfo.style.fontSize = '0.85rem';
            controlsInfo.style.zIndex = '10';
            controlsInfo.style.background = 'rgba(0,0,0,0.7)';
            controlsInfo.style.padding = '0.3rem 0.8rem';
            controlsInfo.style.borderRadius = '4px';
            viewerContainer.appendChild(controlsInfo);

            const toolbar = document.createElement('div');
            toolbar.style.position = 'absolute';
            toolbar.style.top = '10px';
            toolbar.style.left = '10px';
            toolbar.style.right = '10px';
            toolbar.style.display = 'flex';
            toolbar.style.gap = '0.3rem';
            toolbar.style.flexWrap = 'wrap';
            toolbar.style.zIndex = '20';
            viewerContainer.appendChild(toolbar);

            const autoRotateBtn = document.createElement('button');
            autoRotateBtn.textContent = 'Auto: Off';
            autoRotateBtn.style.padding = '0.4rem 0.6rem';
            autoRotateBtn.style.background = 'rgba(0,0,0,0.7)';
            autoRotateBtn.style.color = 'white';
            autoRotateBtn.style.border = '1px solid #444';
            autoRotateBtn.style.borderRadius = '4px';
            autoRotateBtn.style.cursor = 'pointer';
            autoRotateBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(autoRotateBtn);

            const resetCameraBtn = document.createElement('button');
            resetCameraBtn.textContent = 'Reset Camera';
            resetCameraBtn.style.padding = '0.4rem 0.6rem';
            resetCameraBtn.style.background = 'rgba(0,0,0,0.7)';
            resetCameraBtn.style.color = 'white';
            resetCameraBtn.style.border = '1px solid #444';
            resetCameraBtn.style.borderRadius = '4px';
            resetCameraBtn.style.cursor = 'pointer';
            resetCameraBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(resetCameraBtn);

            const bgColorBtn = document.createElement('button');
            bgColorBtn.textContent = 'BG';
            bgColorBtn.style.padding = '0.4rem 0.6rem';
            bgColorBtn.style.background = 'rgba(0,0,0,0.7)';
            bgColorBtn.style.color = 'white';
            bgColorBtn.style.border = '1px solid #444';
            bgColorBtn.style.borderRadius = '4px';
            bgColorBtn.style.cursor = 'pointer';
            bgColorBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(bgColorBtn);

            const gridBtn = document.createElement('button');
            gridBtn.textContent = 'Grid: On';
            gridBtn.style.padding = '0.4rem 0.6rem';
            gridBtn.style.background = 'rgba(0,0,0,0.7)';
            gridBtn.style.color = 'white';
            gridBtn.style.border = '1px solid #444';
            gridBtn.style.borderRadius = '4px';
            gridBtn.style.cursor = 'pointer';
            gridBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(gridBtn);

            const wireframeBtn = document.createElement('button');
            wireframeBtn.textContent = 'Wireframe';
            wireframeBtn.style.padding = '0.4rem 0.6rem';
            wireframeBtn.style.background = 'rgba(0,0,0,0.7)';
            wireframeBtn.style.color = 'white';
            wireframeBtn.style.border = '1px solid #444';
            wireframeBtn.style.borderRadius = '4px';
            wireframeBtn.style.cursor = 'pointer';
            wireframeBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(wireframeBtn);

            const edgesBtn = document.createElement('button');
            edgesBtn.textContent = 'Edges';
            edgesBtn.style.padding = '0.4rem 0.6rem';
            edgesBtn.style.background = 'rgba(0,0,0,0.7)';
            edgesBtn.style.color = 'white';
            edgesBtn.style.border = '1px solid #444';
            edgesBtn.style.borderRadius = '4px';
            edgesBtn.style.cursor = 'pointer';
            edgesBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(edgesBtn);

            const verticesBtn = document.createElement('button');
            verticesBtn.textContent = 'Vertices';
            verticesBtn.style.padding = '0.4rem 0.6rem';
            verticesBtn.style.background = 'rgba(0,0,0,0.7)';
            verticesBtn.style.color = 'white';
            verticesBtn.style.border = '1px solid #444';
            verticesBtn.style.borderRadius = '4px';
            verticesBtn.style.cursor = 'pointer';
            verticesBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(verticesBtn);

            const materialBtn = document.createElement('button');
            materialBtn.textContent = 'Material';
            materialBtn.style.padding = '0.4rem 0.6rem';
            materialBtn.style.background = 'rgba(0,0,0,0.7)';
            materialBtn.style.color = 'white';
            materialBtn.style.border = '1px solid #444';
            materialBtn.style.borderRadius = '4px';
            materialBtn.style.cursor = 'pointer';
            materialBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(materialBtn);

            const lightBtn = document.createElement('button');
            lightBtn.textContent = 'Light: Normal';
            lightBtn.style.padding = '0.4rem 0.6rem';
            lightBtn.style.background = 'rgba(0,0,0,0.7)';
            lightBtn.style.color = 'white';
            lightBtn.style.border = '1px solid #444';
            lightBtn.style.borderRadius = '4px';
            lightBtn.style.cursor = 'pointer';
            lightBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(lightBtn);

            const hideUIBtn = document.createElement('button');
            hideUIBtn.textContent = 'Hide UI';
            hideUIBtn.style.padding = '0.4rem 0.6rem';
            hideUIBtn.style.background = 'rgba(0,0,0,0.7)';
            hideUIBtn.style.color = 'white';
            hideUIBtn.style.border = '1px solid #444';
            hideUIBtn.style.borderRadius = '4px';
            hideUIBtn.style.cursor = 'pointer';
            hideUIBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(hideUIBtn);

            const screenshotBtn = document.createElement('button');
            screenshotBtn.textContent = 'Screenshot';
            screenshotBtn.style.padding = '0.4rem 0.6rem';
            screenshotBtn.style.background = 'rgba(0,0,0,0.7)';
            screenshotBtn.style.color = 'white';
            screenshotBtn.style.border = '1px solid #444';
            screenshotBtn.style.borderRadius = '4px';
            screenshotBtn.style.cursor = 'pointer';
            screenshotBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(screenshotBtn);

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';
            closeBtn.style.padding = '0.4rem 0.6rem';
            closeBtn.style.background = 'rgba(139,0,0,0.8)';
            closeBtn.style.color = 'white';
            closeBtn.style.border = '1px solid #444';
            closeBtn.style.borderRadius = '4px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontSize = '0.75rem';
            toolbar.appendChild(closeBtn);

            init3DViewer(
                viewerContainer,
                mediaFiles.find(f => is3DFile(f)),
                viewerInfo,
                autoRotateBtn,
                bgColorBtn,
                gridBtn,
                wireframeBtn,
                edgesBtn,
                verticesBtn,
                materialBtn,
                resetCameraBtn,
                screenshotBtn,
                lightBtn,
                closeBtn,
                hideUIBtn,
                controlsInfo,
                toolbar
            );
        }

        const hasMedia = mediaFiles.some(f => isMediaFile(f));
        if (hasMedia) {
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
            const isVideo = mediaFiles.some(f => f.type.startsWith('video') || ['mp4','webm','avi','mov','gif','mkv','flv','wmv'].includes(f.name.split('.').pop().toLowerCase()));
            const isAudio = mediaFiles.some(f => f.type.startsWith('audio') || ['mp3','wav','ogg','aac','flac','m4a','opus','wma'].includes(f.name.split('.').pop().toLowerCase()));
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
                processedBlobs = [];
                const statusDiv = document.createElement('div');
                statusDiv.className = 'success-message';
                statusDiv.textContent = 'Processing...';
                controlsContainer.appendChild(statusDiv);
                for (const file of mediaFiles) {
                    if (isMediaFile(file)) {
                        const blob = await processMediaFile(file, start, end, format, volume, speed, quality, resolution, overlayText);
                        if (blob) {
                            processedBlobs.push({ blob, fileName: 'processed_' + file.name.replace(/\.[^.]+$/, '.' + format) });
                        }
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
    }

    function removeFile(index) {
        mediaFiles.splice(index, 1);
        processedBlobs = [];
        
        if (mediaFiles.length === 0) {
            editorContainer.style.display = 'none';
            editorContainer.innerHTML = '';
            return;
        }
        
        processFiles([]);
    }

    function init3DViewer(container, file, infoEl, autoRotateBtn, bgColorBtn, gridBtn, wireframeBtn, edgesBtn, verticesBtn, materialBtn, resetCameraBtn, screenshotBtn, lightBtn, closeBtn, hideUIBtn, controlsInfo, toolbar) {
        if (!file || typeof THREE === 'undefined') {
            infoEl.textContent = '3D library not loaded';
            return;
        }

        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.set(3, 2, 5);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = false;
        controls.autoRotateSpeed = 2;
        controls.target.set(0, 0, 0);
        controls.update();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);

        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
        scene.add(hemisphereLight);

        let lightMode = 'normal';
        let uiHidden = false;

        function hideUI() {
            uiHidden = true;
            toolbar.style.display = 'none';
            controlsInfo.style.display = 'none';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.zIndex = '9999';
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }

        function showUI() {
            uiHidden = false;
            toolbar.style.display = 'flex';
            controlsInfo.style.display = 'block';
            container.style.position = 'relative';
            container.style.top = 'auto';
            container.style.left = 'auto';
            container.style.width = '100%';
            container.style.height = '500px';
            container.style.zIndex = 'auto';
            renderer.setSize(container.clientWidth, container.clientHeight);
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
        }

        hideUIBtn.addEventListener('click', () => {
            if (uiHidden) {
                showUI();
                hideUIBtn.textContent = 'Hide UI';
            } else {
                hideUI();
                hideUIBtn.textContent = 'Show UI';
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11') {
                e.preventDefault();
                if (uiHidden) {
                    showUI();
                    hideUIBtn.textContent = 'Hide UI';
                } else {
                    hideUI();
                    hideUIBtn.textContent = 'Show UI';
                }
            }
            if (e.key === 'Escape' && uiHidden) {
                showUI();
                hideUIBtn.textContent = 'Hide UI';
            }
        });

        lightBtn.addEventListener('click', () => {
            if (lightMode === 'normal') {
                ambientLight.intensity = 1.5;
                directionalLight.intensity = 2.5;
                hemisphereLight.intensity = 1.2;
                lightMode = 'bright';
                lightBtn.textContent = 'Light: Bright';
            } else if (lightMode === 'bright') {
                ambientLight.intensity = 2.5;
                directionalLight.intensity = 4;
                hemisphereLight.intensity = 2;
                lightMode = 'ultra';
                lightBtn.textContent = 'Light: Ultra';
            } else {
                ambientLight.intensity = 0.6;
                directionalLight.intensity = 1.2;
                hemisphereLight.intensity = 0.4;
                lightMode = 'normal';
                lightBtn.textContent = 'Light: Normal';
            }
        });

        closeBtn.addEventListener('click', () => {
            container.style.display = 'none';
            const openBtn = document.createElement('button');
            openBtn.textContent = 'Open 3D Viewer';
            openBtn.style.padding = '0.5rem 1rem';
            openBtn.style.background = 'var(--button-bg)';
            openBtn.style.color = 'white';
            openBtn.style.border = 'none';
            openBtn.style.borderRadius = '4px';
            openBtn.style.cursor = 'pointer';
            openBtn.style.marginBottom = '1rem';
            openBtn.addEventListener('click', () => {
                container.style.display = 'block';
                openBtn.remove();
            });
            container.parentElement.insertBefore(openBtn, container);
        });

        let gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
        scene.add(gridHelper);

        let currentModel = null;
        let originalMaterials = [];
        let materialMode = 'original';
        let wireframeMode = false;

        const materials = {
            metal: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0.2 }),
            plastic: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0, roughness: 0.5 }),
            wood: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, metalness: 0, roughness: 0.8 })
        };

        autoRotateBtn.addEventListener('click', () => {
            controls.autoRotate = !controls.autoRotate;
            autoRotateBtn.textContent = 'Auto: ' + (controls.autoRotate ? 'On' : 'Off');
        });

        resetCameraBtn.addEventListener('click', () => {
            camera.position.set(3, 2, 5);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();
        });

        let currentBgIndex = 0;
        const bgColors = [0x000000, 0x1a1a1a, 0x2a2a2a, 0x3a3a3a, 0xffffff, 0x1b2838];
        bgColorBtn.addEventListener('click', () => {
            currentBgIndex = (currentBgIndex + 1) % bgColors.length;
            scene.background = new THREE.Color(bgColors[currentBgIndex]);
        });

        gridBtn.addEventListener('click', () => {
            if (gridHelper) {
                scene.remove(gridHelper);
                gridHelper = null;
                gridBtn.textContent = 'Grid: Off';
            } else {
                gridHelper = new THREE.GridHelper(10, 20, 0x888888, 0x444444);
                scene.add(gridHelper);
                gridBtn.textContent = 'Grid: On';
            }
        });

        wireframeBtn.addEventListener('click', () => {
            if (currentModel) {
                wireframeMode = !wireframeMode;
                currentModel.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.wireframe = wireframeMode;
                    }
                });
                wireframeBtn.textContent = wireframeMode ? 'Wireframe: On' : 'Wireframe';
            }
        });

        edgesBtn.addEventListener('click', () => {
            if (currentModel) {
                const existingEdges = [];
                currentModel.traverse((child) => {
                    if (child.userData && child.userData.edgesHelper) {
                        existingEdges.push(child);
                    }
                });
                if (existingEdges.length > 0) {
                    existingEdges.forEach(child => {
                        child.remove(child.userData.edgesHelper);
                        child.userData.edgesHelper = null;
                    });
                    edgesBtn.textContent = 'Edges';
                } else {
                    currentModel.traverse((child) => {
                        if (child.isMesh && child.geometry) {
                            const edges = new THREE.EdgesGeometry(child.geometry);
                            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x000000 }));
                            child.add(line);
                            child.userData.edgesHelper = line;
                        }
                    });
                    edgesBtn.textContent = 'Edges: On';
                }
            }
        });

        verticesBtn.addEventListener('click', () => {
            if (currentModel) {
                const existingPoints = [];
                currentModel.traverse((child) => {
                    if (child.userData && child.userData.pointsHelper) {
                        existingPoints.push(child);
                    }
                });
                if (existingPoints.length > 0) {
                    existingPoints.forEach(child => {
                        child.remove(child.userData.pointsHelper);
                        child.userData.pointsHelper = null;
                    });
                    verticesBtn.textContent = 'Vertices';
                } else {
                    currentModel.traverse((child) => {
                        if (child.isMesh && child.geometry) {
                            const points = new THREE.Points(child.geometry, new THREE.PointsMaterial({ color: 0xff0000, size: 0.03 }));
                            child.add(points);
                            child.userData.pointsHelper = points;
                        }
                    });
                    verticesBtn.textContent = 'Vertices: On';
                }
            }
        });

        materialBtn.addEventListener('click', () => {
            if (!currentModel) return;
            const modes = ['original', 'metal', 'plastic', 'wood'];
            const currentIdx = modes.indexOf(materialMode);
            materialMode = modes[(currentIdx + 1) % modes.length];
            applyMaterial(materialMode);
            materialBtn.textContent = 'Material: ' + materialMode;
        });

        function applyMaterial(mode) {
            if (!currentModel) return;
            currentModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    if (mode === 'original') {
                        const original = originalMaterials.find(m => m.mesh === child);
                        if (original) child.material = original.material;
                    } else {
                        child.material = materials[mode].clone();
                    }
                    child.material.wireframe = wireframeMode;
                }
            });
        }

        screenshotBtn.addEventListener('click', () => {
            renderer.render(scene, camera);
            const a = document.createElement('a');
            a.href = renderer.domElement.toDataURL('image/png');
            a.download = '3d-screenshot.png';
            a.click();
        });

        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'glb' || ext === 'gltf') {
            const loader = new THREE.GLTFLoader();
            const url = URL.createObjectURL(file);
            loader.load(url, (gltf) => {
                infoEl.style.display = 'none';
                currentModel = gltf.scene;
                const box = new THREE.Box3().setFromObject(currentModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDim;
                currentModel.scale.setScalar(scale);
                currentModel.position.sub(center.multiplyScalar(scale));
                scene.add(currentModel);
                controls.target.set(0, 0, 0);
                controls.update();
                originalMaterials = [];
                currentModel.traverse((child) => {
                    if (child.isMesh && child.material) {
                        originalMaterials.push({ mesh: child, material: child.material });
                    }
                });
                if (gltf.animations && gltf.animations.length > 0) {
                    const mixer = new THREE.AnimationMixer(currentModel);
                    const action = mixer.clipAction(gltf.animations[0]);
                    action.play();
                    currentModel.userData.mixer = mixer;
                }
                URL.revokeObjectURL(url);
            }, undefined, (error) => {
                infoEl.textContent = 'Failed to load 3D model';
            });
        } else if (ext === 'obj') {
            const loader = new THREE.OBJLoader();
            const url = URL.createObjectURL(file);
            loader.load(url, (obj) => {
                infoEl.style.display = 'none';
                currentModel = obj;
                const box = new THREE.Box3().setFromObject(currentModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDim;
                currentModel.scale.setScalar(scale);
                currentModel.position.sub(center.multiplyScalar(scale));
                scene.add(currentModel);
                controls.target.set(0, 0, 0);
                controls.update();
                originalMaterials = [];
                currentModel.traverse((child) => {
                    if (child.isMesh && child.material) {
                        originalMaterials.push({ mesh: child, material: child.material });
                    }
                });
                URL.revokeObjectURL(url);
            }, undefined, (error) => {
                infoEl.textContent = 'Failed to load 3D model';
            });
        }

        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            if (currentModel && currentModel.userData.mixer) {
                currentModel.userData.mixer.update(0.016);
            }
            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
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

    async function processMediaFile(file, start, end, format, volumePercent, speed, quality, resolution, overlayText) {
        const isVideo = file.type.startsWith('video') || ['mp4','webm','avi','mov','gif','mkv','flv','wmv'].includes(file.name.split('.').pop().toLowerCase());
        const isAudio = file.type.startsWith('audio') || ['mp3','wav','ogg','aac','flac','m4a','opus','wma'].includes(file.name.split('.').pop().toLowerCase());
        if (isAudio) {
            return await processAudio(file, start, end, volumePercent, speed, format, quality);
        } else if (isVideo) {
            if (format === 'jpg' || format === 'png') {
                return await extractVideoFrame(file, start || 0, quality, resolution);
            } else if (format === 'webm' || format === 'mp4') {
                return await trimVideo(file, start, end, volumePercent, speed, quality, resolution, overlayText);
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

    async function extractVideoFrame(file, time, quality, resolution) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
                video.currentTime = time || 0;
            };
            video.onseeked = () => {
                let width = video.videoWidth;
                let height = video.videoHeight;
                if (resolution === '1080p') { width = 1920; height = 1080; }
                else if (resolution === '720p') { width = 1280; height = 720; }
                else if (resolution === '480p') { width = 854; height = 480; }
                else if (resolution === '360p') { width = 640; height = 360; }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, width, height);
                canvas.toBlob(blob => resolve(blob), 'image/png');
                video.src = '';
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