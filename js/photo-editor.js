document.addEventListener('DOMContentLoaded', function() {
    initPhotoEditor();
});

function initPhotoEditor() {
    const photoSection = document.getElementById('photoEditor');
    if (!photoSection) return;
    photoSection.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => showMainMenu());
    photoSection.appendChild(backBtn);

    const mainLayout = document.createElement('div');
    mainLayout.style.display = 'flex';
    mainLayout.style.gap = '1rem';
    mainLayout.style.flexWrap = 'wrap';

    const editorArea = document.createElement('div');
    editorArea.style.flex = '2';
    editorArea.style.minWidth = '300px';

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

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.backgroundColor = 'white';
    canvas.style.cursor = 'crosshair';
    canvas.style.touchAction = 'none';
    canvas.style.display = 'block';
    canvas.style.maxWidth = '100%';

    const scrollContainer = document.createElement('div');
    scrollContainer.style.overflow = 'auto';
    scrollContainer.style.maxHeight = '70vh';
    scrollContainer.style.border = '1px solid var(--border)';
    scrollContainer.style.borderRadius = '4px';
    scrollContainer.appendChild(canvas);

    const layersPanel = document.createElement('div');
    layersPanel.style.flex = '1';
    layersPanel.style.minWidth = '200px';
    layersPanel.style.background = 'var(--panel-bg)';
    layersPanel.style.border = '1px solid var(--border)';
    layersPanel.style.borderRadius = '4px';
    layersPanel.style.padding = '1rem';
    layersPanel.style.maxHeight = '500px';
    layersPanel.style.overflowY = 'auto';

    let layers = [];
    let activeLayerIndex = -1;
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let brushSize = 5;
    let brushColor = '#000000';
    let brushOpacity = 100;
    let currentTool = 'brush';
    let history = [];

    function createLayer(name, width, height, imageData = null) {
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = width;
        layerCanvas.height = height;
        const ctx = layerCanvas.getContext('2d');
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        } else {
            ctx.clearRect(0, 0, width, height);
        }
        return { name, canvas: layerCanvas, ctx, opacity: 1, visible: true, rotation: 0 };
    }

    function addLayer(name = 'Layer ' + (layers.length + 1), imageData = null) {
        const layer = createLayer(name, canvas.width, canvas.height, imageData);
        layers.push(layer);
        activeLayerIndex = layers.length - 1;
        updateLayersPanel();
        redrawCanvas();
    }

    function deleteLayer(index) {
        if (layers.length <= 1) return;
        layers.splice(index, 1);
        if (activeLayerIndex >= layers.length) activeLayerIndex = layers.length - 1;
        updateLayersPanel();
        redrawCanvas();
    }

    function moveLayer(from, to) {
        if (to < 0 || to >= layers.length) return;
        const [layer] = layers.splice(from, 1);
        layers.splice(to, 0, layer);
        activeLayerIndex = to;
        updateLayersPanel();
        redrawCanvas();
    }

    function redrawCanvas() {
        const mainCtx = canvas.getContext('2d');
        mainCtx.clearRect(0, 0, canvas.width, canvas.height);
        for (const layer of layers) {
            if (!layer.visible) continue;
            mainCtx.globalAlpha = layer.opacity;
            if (layer.rotation) {
                const rad = layer.rotation * Math.PI / 180;
                const cx = layer.canvas.width / 2;
                const cy = layer.canvas.height / 2;
                mainCtx.save();
                mainCtx.translate(cx, cy);
                mainCtx.rotate(rad);
                mainCtx.drawImage(layer.canvas, -cx, -cy);
                mainCtx.restore();
            } else {
                mainCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        mainCtx.globalAlpha = 1;
    }

    function updateLayersPanel() {
        layersPanel.innerHTML = '<h3 style="color:var(--accent);margin-bottom:0.5rem">Layers</h3>';
        layers.forEach((layer, i) => {
            const layerDiv = document.createElement('div');
            layerDiv.style.display = 'flex';
            layerDiv.style.alignItems = 'center';
            layerDiv.style.gap = '0.5rem';
            layerDiv.style.padding = '0.3rem';
            layerDiv.style.cursor = 'pointer';
            layerDiv.style.background = i === activeLayerIndex ? 'var(--hover)' : 'transparent';
            layerDiv.addEventListener('click', () => {
                activeLayerIndex = i;
                updateLayersPanel();
            });

            const visibilityToggle = document.createElement('button');
            visibilityToggle.textContent = layer.visible ? '👁️' : '🚫';
            visibilityToggle.style.background = 'none';
            visibilityToggle.style.border = 'none';
            visibilityToggle.style.cursor = 'pointer';
            visibilityToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                updateLayersPanel();
                redrawCanvas();
            });

            const nameSpan = document.createElement('span');
            nameSpan.textContent = layer.name;
            nameSpan.style.flex = '1';

            const opacityInput = document.createElement('input');
            opacityInput.type = 'range';
            opacityInput.min = '0';
            opacityInput.max = '100';
            opacityInput.value = layer.opacity * 100;
            opacityInput.style.width = '50px';
            opacityInput.addEventListener('input', (e) => {
                layer.opacity = parseInt(e.target.value) / 100;
                redrawCanvas();
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '🗑️';
            deleteBtn.style.background = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteLayer(i);
            });

            layerDiv.appendChild(visibilityToggle);
            layerDiv.appendChild(nameSpan);
            layerDiv.appendChild(opacityInput);
            layerDiv.appendChild(deleteBtn);
            layersPanel.appendChild(layerDiv);
        });

        const addLayerBtn = document.createElement('button');
        addLayerBtn.textContent = '+ Add Layer';
        addLayerBtn.style.marginTop = '0.5rem';
        addLayerBtn.style.padding = '0.5rem';
        addLayerBtn.style.background = 'var(--button-bg)';
        addLayerBtn.style.color = 'white';
        addLayerBtn.style.border = 'none';
        addLayerBtn.style.borderRadius = '4px';
        addLayerBtn.style.cursor = 'pointer';
        addLayerBtn.addEventListener('click', () => addLayer());
        layersPanel.appendChild(addLayerBtn);

        const addImageLayerBtn = document.createElement('button');
        addImageLayerBtn.textContent = '+ Add Image Layer';
        addImageLayerBtn.style.marginTop = '0.5rem';
        addImageLayerBtn.style.marginLeft = '0.5rem';
        addImageLayerBtn.style.padding = '0.5rem';
        addImageLayerBtn.style.background = 'var(--button-bg)';
        addImageLayerBtn.style.color = 'white';
        addImageLayerBtn.style.border = 'none';
        addImageLayerBtn.style.borderRadius = '4px';
        addImageLayerBtn.style.cursor = 'pointer';
        addImageLayerBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.addEventListener('change', function() {
                const file = this.files[0];
                if (!file) return;
                const img = new Image();
                img.onload = function() {
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = canvas.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(img, 0, 0);
                    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    addLayer('Image ' + (layers.length + 1), imageData);
                };
                img.src = URL.createObjectURL(file);
            });
            input.click();
        });

        const moveUpBtn = document.createElement('button');
        moveUpBtn.textContent = 'Move Up';
        moveUpBtn.style.marginTop = '0.5rem';
        moveUpBtn.style.padding = '0.5rem';
        moveUpBtn.style.background = 'var(--button-bg)';
        moveUpBtn.style.color = 'white';
        moveUpBtn.style.border = 'none';
        moveUpBtn.style.borderRadius = '4px';
        moveUpBtn.style.cursor = 'pointer';
        moveUpBtn.addEventListener('click', () => {
            if (activeLayerIndex > 0) moveLayer(activeLayerIndex, activeLayerIndex - 1);
        });
        layersPanel.appendChild(moveUpBtn);

        const moveDownBtn = document.createElement('button');
        moveDownBtn.textContent = 'Move Down';
        moveDownBtn.style.marginTop = '0.5rem';
        moveDownBtn.style.marginLeft = '0.5rem';
        moveDownBtn.style.padding = '0.5rem';
        moveDownBtn.style.background = 'var(--button-bg)';
        moveDownBtn.style.color = 'white';
        moveDownBtn.style.border = 'none';
        moveDownBtn.style.borderRadius = '4px';
        moveDownBtn.style.cursor = 'pointer';
        moveDownBtn.addEventListener('click', () => {
            if (activeLayerIndex >= 0 && activeLayerIndex < layers.length - 1) moveLayer(activeLayerIndex, activeLayerIndex + 1);
        });
        layersPanel.appendChild(moveDownBtn);
    }

    function saveState() {
        const snapshot = canvas.toDataURL();
        history.push(snapshot);
        if (history.length > 20) history.shift();
    }

    function applyFiltersToActiveLayer() {
        if (activeLayerIndex < 0) return;
        const layer = layers[activeLayerIndex];
        const imageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        const data = imageData.data;
        const brightness = sliders.brightness || 0;
        const contrast = sliders.contrast || 0;
        const saturation = sliders.saturation || 0;
        const blur = sliders.blur || 0;
        const sharpen = sliders.sharpen || 0;
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i+1], b = data[i+2];
            if (brightness !== 0) { r += brightness * 2.55; g += brightness * 2.55; b += brightness * 2.55; }
            if (contrast !== 0) {
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                r = factor * (r - 128) + 128; g = factor * (g - 128) + 128; b = factor * (b - 128) + 128;
            }
            if (saturation !== 0) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                const sf = 1 + saturation / 100;
                r = gray + sf * (r - gray); g = gray + sf * (g - gray); b = gray + sf * (b - gray);
            }
            data[i] = Math.max(0, Math.min(255, r));
            data[i+1] = Math.max(0, Math.min(255, g));
            data[i+2] = Math.max(0, Math.min(255, b));
        }
        layer.ctx.putImageData(imageData, 0, 0);
        if (blur > 0) applyBlurToLayer(layer, blur);
        if (sharpen > 0) applySharpenToLayer(layer, sharpen);
        redrawCanvas();
    }

    function applyBlurToLayer(layer, amount) {
        const imageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        const w = layer.canvas.width, h = layer.canvas.height;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                let r=0,g=0,b=0,a=0,count=0;
                for (let dy=-amount; dy<=amount; dy++) {
                    for (let dx=-amount; dx<=amount; dx++) {
                        const nx = x+dx, ny = y+dy;
                        if (nx>=0 && nx<w && ny>=0 && ny<h) {
                            const idx = (ny*w+nx)*4;
                            r += tempData[idx]; g += tempData[idx+1]; b += tempData[idx+2]; a += tempData[idx+3];
                            count++;
                        }
                    }
                }
                const idx = (y*w+x)*4;
                data[idx] = r/count; data[idx+1] = g/count; data[idx+2] = b/count; data[idx+3] = a/count;
            }
        }
        layer.ctx.putImageData(imageData, 0, 0);
    }

    function applySharpenToLayer(layer, amount) {
        const imageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        const w = layer.canvas.width, h = layer.canvas.height;
        const strength = amount / 5;
        for (let y=1; y<h-1; y++) {
            for (let x=1; x<w-1; x++) {
                const idx = (y*w+x)*4;
                for (let c=0; c<3; c++) {
                    const center = tempData[idx+c];
                    const left = tempData[idx-4+c];
                    const right = tempData[idx+4+c];
                    const top = tempData[idx-w*4+c];
                    const bottom = tempData[idx+w*4+c];
                    const sharpened = center * (1 + 4*strength) - (left+right+top+bottom)*strength;
                    data[idx+c] = Math.max(0, Math.min(255, sharpened));
                }
            }
        }
        layer.ctx.putImageData(imageData, 0, 0);
    }

    function addButton(text, title, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.title = title;
        btn.style.padding = '0.5rem 0.8rem';
        btn.style.background = 'var(--button-bg)';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '0.85rem';
        btn.addEventListener('click', onClick);
        toolbar.appendChild(btn);
    }

    addButton('📁 Upload', 'Upload', () => fileInput.click());
    addButton('✏️ Brush', 'Brush', () => { currentTool = 'brush'; canvas.style.cursor = 'crosshair'; });
    addButton('🧹 Eraser', 'Eraser', () => { currentTool = 'eraser'; canvas.style.cursor = 'cell'; });
    addButton('🪣 Fill', 'Fill', () => { currentTool = 'fill'; canvas.style.cursor = 'pointer'; });

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#000000';
    colorPicker.style.width = '35px';
    colorPicker.style.height = '35px';
    colorPicker.style.border = 'none';
    colorPicker.style.borderRadius = '4px';
    colorPicker.style.cursor = 'pointer';
    colorPicker.addEventListener('change', () => brushColor = colorPicker.value);
    toolbar.appendChild(colorPicker);

    const opacityInput = document.createElement('input');
    opacityInput.type = 'range';
    opacityInput.min = '1';
    opacityInput.max = '100';
    opacityInput.value = '100';
    opacityInput.style.width = '80px';
    const opacityLabel = document.createElement('span');
    opacityLabel.textContent = '100%';
    opacityLabel.style.fontSize = '0.8rem';
    opacityInput.addEventListener('input', () => { brushOpacity = parseInt(opacityInput.value); opacityLabel.textContent = opacityInput.value + '%'; });
    toolbar.appendChild(opacityInput);
    toolbar.appendChild(opacityLabel);

    const sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '1';
    sizeInput.max = '512';
    sizeInput.value = '5';
    sizeInput.style.width = '80px';
    const sizeLabel = document.createElement('span');
    sizeLabel.textContent = '5px';
    sizeLabel.style.fontSize = '0.8rem';
    sizeInput.addEventListener('input', () => { brushSize = parseInt(sizeInput.value); sizeLabel.textContent = sizeInput.value + 'px'; });
    toolbar.appendChild(sizeInput);
    toolbar.appendChild(sizeLabel);

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.placeholder = 'Width';
    widthInput.value = '800';
    widthInput.style.width = '70px';
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.placeholder = 'Height';
    heightInput.value = '600';
    heightInput.style.width = '70px';
    const resizeBtn = document.createElement('button');
    resizeBtn.textContent = 'Resize';
    resizeBtn.style.padding = '0.4rem 0.8rem';
    resizeBtn.style.background = 'var(--button-bg)';
    resizeBtn.style.color = 'white';
    resizeBtn.style.border = 'none';
    resizeBtn.style.borderRadius = '4px';
    resizeBtn.style.cursor = 'pointer';
    resizeBtn.addEventListener('click', () => {
        const newW = parseInt(widthInput.value);
        const newH = parseInt(heightInput.value);
        if (!newW || !newH || newW < 1 || newH < 1) { showError(widthInput, 'Invalid size'); return; }
        canvas.width = newW;
        canvas.height = newH;
        layers.forEach(layer => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = newW;
            tempCanvas.height = newH;
            tempCanvas.getContext('2d').drawImage(layer.canvas, 0, 0, newW, newH);
            layer.canvas.width = newW;
            layer.canvas.height = newH;
            layer.ctx.drawImage(tempCanvas, 0, 0);
        });
        redrawCanvas();
    });
    toolbar.appendChild(widthInput);
    toolbar.appendChild(heightInput);
    toolbar.appendChild(resizeBtn);

    const rotateInput = document.createElement('input');
    rotateInput.type = 'number';
    rotateInput.placeholder = 'Degrees';
    rotateInput.value = '0';
    rotateInput.style.width = '70px';
    const rotateBtn = document.createElement('button');
    rotateBtn.textContent = 'Rotate';
    rotateBtn.style.padding = '0.4rem 0.8rem';
    rotateBtn.style.background = 'var(--button-bg)';
    rotateBtn.style.color = 'white';
    rotateBtn.style.border = 'none';
    rotateBtn.style.borderRadius = '4px';
    rotateBtn.style.cursor = 'pointer';
    rotateBtn.addEventListener('click', () => {
        if (activeLayerIndex < 0) return;
        const degrees = parseFloat(rotateInput.value);
        if (isNaN(degrees)) { showError(rotateInput, 'Enter valid degrees'); return; }
        const layer = layers[activeLayerIndex];
        layer.rotation = (layer.rotation || 0) + degrees;
        redrawCanvas();
    });
    toolbar.appendChild(rotateInput);
    toolbar.appendChild(rotateBtn);

    const filterContainer = document.createElement('div');
    filterContainer.style.display = 'flex';
    filterContainer.style.flexWrap = 'wrap';
    filterContainer.style.gap = '0.5rem';
    filterContainer.style.marginTop = '0.5rem';
    filterContainer.style.width = '100%';

    const filters = [
        { name: 'Brightness', min: -100, max: 100, value: 0 },
        { name: 'Contrast', min: -100, max: 100, value: 0 },
        { name: 'Saturation', min: -100, max: 100, value: 0 },
        { name: 'Blur', min: 0, max: 10, value: 0 },
        { name: 'Sharpen', min: 0, max: 10, value: 0 }
    ];
    const sliders = {};
    filters.forEach(filter => {
        const cont = document.createElement('div');
        cont.className = 'filter-row';
        cont.style.display = 'flex';
        cont.style.alignItems = 'center';
        cont.style.gap = '0.3rem';
        cont.style.flex = '1';
        cont.style.minWidth = '180px';
        cont.style.background = 'var(--bg)';
        cont.style.padding = '0.4rem';
        cont.style.borderRadius = '4px';
        const label = document.createElement('label');
        label.textContent = filter.name + ':';
        label.style.minWidth = '70px';
        label.style.fontSize = '0.8rem';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = filter.min;
        slider.max = filter.max;
        slider.value = filter.value;
        slider.style.flex = '1';
        const valueDisplay = document.createElement('input');
        valueDisplay.type = 'number';
        valueDisplay.value = filter.value;
        valueDisplay.min = filter.min;
        valueDisplay.max = filter.max;
        valueDisplay.style.width = '50px';
        valueDisplay.style.padding = '0.2rem';
        valueDisplay.style.background = 'var(--panel-bg)';
        valueDisplay.style.border = '1px solid var(--border)';
        valueDisplay.style.borderRadius = '4px';
        valueDisplay.style.color = 'var(--text)';
        valueDisplay.style.fontSize = '0.8rem';
        slider.addEventListener('input', () => {
            valueDisplay.value = slider.value;
            sliders[filter.name.toLowerCase()] = parseInt(slider.value);
            applyFiltersToActiveLayer();
        });
        valueDisplay.addEventListener('input', () => {
            let val = parseInt(valueDisplay.value) || 0;
            val = Math.max(filter.min, Math.min(filter.max, val));
            valueDisplay.value = val;
            slider.value = val;
            sliders[filter.name.toLowerCase()] = val;
            applyFiltersToActiveLayer();
        });
        cont.appendChild(label);
        cont.appendChild(slider);
        cont.appendChild(valueDisplay);
        filterContainer.appendChild(cont);
        sliders[filter.name.toLowerCase()] = filter.value;
    });
    toolbar.appendChild(filterContainer);

    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.gap = '0.5rem';
    actionContainer.style.marginTop = '0.5rem';
    actionContainer.style.width = '100%';
    actionContainer.style.flexWrap = 'wrap';

    addButton('✅ Apply', 'Apply', () => { saveState(); applyFiltersToActiveLayer(); });
    addButton('🔄 Reset', 'Reset', () => {
        if (layers.length > 0) {
            layers.forEach(layer => {
                layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
                layer.rotation = 0;
            });
            redrawCanvas();
        }
    });
    addButton('↩️ Undo', 'Undo', () => {
        if (history.length > 0) {
            const snapshot = history.pop();
            const img = new Image();
            img.onload = () => {
                canvas.getContext('2d').drawImage(img, 0, 0);
            };
            img.src = snapshot;
        }
    });
    addButton('🗑️ Clear', 'Clear', () => {
        layers = [];
        addLayer('Layer 1');
        redrawCanvas();
    });
    addButton('💾 Download', 'Download', () => {
        const formatSelect = document.createElement('select');
        ['png', 'jpg', 'webp', 'bmp', 'ico', 'svg'].forEach(f => formatSelect.add(new Option(f.toUpperCase(), f)));
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%,-50%)';
        container.style.background = 'var(--panel-bg)';
        container.style.padding = '1rem';
        container.style.borderRadius = '4px';
        container.style.zIndex = '2000';
        container.style.display = 'flex';
        container.style.gap = '0.5rem';
        container.style.flexDirection = 'column';
        container.innerHTML = '<h3 style="color:var(--accent)">Save As</h3>';
        container.appendChild(formatSelect);
        const dlBtn = document.createElement('button');
        dlBtn.textContent = 'Download';
        dlBtn.style.padding = '0.6rem';
        dlBtn.style.background = 'var(--button-bg)';
        dlBtn.style.color = 'white';
        dlBtn.style.border = 'none';
        dlBtn.style.borderRadius = '4px';
        dlBtn.style.cursor = 'pointer';
        dlBtn.addEventListener('click', () => {
            const format = formatSelect.value;
            redrawCanvas();
            if (format === 'svg') {
                const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
                const blob = new Blob([svg], { type: 'image/svg+xml' });
                downloadBlob(blob, 'edited.svg');
            } else if (format === 'bmp') {
                const bmp = canvasToBMP(canvas);
                const blob = new Blob([bmp], { type: 'image/bmp' });
                downloadBlob(blob, 'edited.bmp');
            } else if (format === 'ico') {
                canvas.toBlob(blob => downloadBlob(blob, 'edited.ico'), 'image/x-icon');
            } else {
                const mime = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                canvas.toBlob(blob => downloadBlob(blob, `edited.${format}`), mime);
            }
            container.remove();
        });
        container.appendChild(dlBtn);
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '0.6rem';
        cancelBtn.style.background = 'var(--border)';
        cancelBtn.style.color = 'var(--text)';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.addEventListener('click', () => container.remove());
        container.appendChild(cancelBtn);
        document.body.appendChild(container);
    });

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            tempCanvas.getContext('2d').drawImage(img, 0, 0);
            const imageData = tempCanvas.getContext('2d').getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            layers = [];
            addLayer('Background', imageData);
            redrawCanvas();
        };
        img.src = URL.createObjectURL(file);
    });

    editorArea.appendChild(toolbar);
    editorArea.appendChild(scrollContainer);

    mainLayout.appendChild(editorArea);
    mainLayout.appendChild(layersPanel);
    photoSection.appendChild(mainLayout);
    photoSection.appendChild(fileInput);

    addLayer('Layer 1');

    canvas.addEventListener('mousedown', (e) => {
        if (activeLayerIndex < 0) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        if (currentTool === 'brush' || currentTool === 'eraser') {
            isDrawing = true;
            lastX = x;
            lastY = y;
            saveState();
        } else if (currentTool === 'fill') {
            saveState();
            floodFill(activeLayerIndex, Math.floor(x), Math.floor(y), brushColor, brushOpacity);
        }
    });
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing || activeLayerIndex < 0) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        const layer = layers[activeLayerIndex];
        layer.ctx.globalAlpha = brushOpacity / 100;
        layer.ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
        layer.ctx.lineWidth = brushSize;
        layer.ctx.lineCap = 'round';
        layer.ctx.lineJoin = 'round';
        layer.ctx.beginPath();
        layer.ctx.moveTo(lastX, lastY);
        layer.ctx.lineTo(x, y);
        layer.ctx.stroke();
        layer.ctx.globalAlpha = 1;
        lastX = x;
        lastY = y;
        redrawCanvas();
    });
    canvas.addEventListener('mouseup', () => { isDrawing = false; });
    canvas.addEventListener('mouseleave', () => { isDrawing = false; });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY });
        canvas.dispatchEvent(mouseEvent);
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent('mouseup'));
    });

    function floodFill(layerIndex, startX, startY, fillColor, opacity) {
        const layer = layers[layerIndex];
        const imageData = layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
        const data = imageData.data;
        const w = layer.canvas.width, h = layer.canvas.height;
        if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;
        const startIdx = (startY * w + startX) * 4;
        const targetR = data[startIdx], targetG = data[startIdx+1], targetB = data[startIdx+2];
        const fillR = parseInt(fillColor.slice(1,3),16);
        const fillG = parseInt(fillColor.slice(3,5),16);
        const fillB = parseInt(fillColor.slice(5,7),16);
        const alpha = opacity / 100;
        const queue = [[startX, startY]];
        const visited = new Set();
        while (queue.length) {
            const [x, y] = queue.shift();
            const key = `${x},${y}`;
            if (x < 0 || x >= w || y < 0 || y >= h || visited.has(key)) continue;
            const idx = (y * w + x) * 4;
            if (Math.abs(data[idx] - targetR) > 30 || Math.abs(data[idx+1] - targetG) > 30 || Math.abs(data[idx+2] - targetB) > 30) continue;
            visited.add(key);
            data[idx] = fillR * alpha + data[idx] * (1 - alpha);
            data[idx+1] = fillG * alpha + data[idx+1] * (1 - alpha);
            data[idx+2] = fillB * alpha + data[idx+2] * (1 - alpha);
            data[idx+3] = 255;
            queue.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
        }
        layer.ctx.putImageData(imageData, 0, 0);
        redrawCanvas();
    }

    function canvasToBMP(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;
        const rowSize = Math.floor((24 * w + 31) / 32) * 4;
        const pixelArraySize = rowSize * h;
        const fileSize = 54 + pixelArraySize;
        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);
        view.setUint8(0, 66); view.setUint8(1, 77);
        view.setUint32(2, fileSize, true);
        view.setUint32(10, 54, true);
        view.setUint32(14, 40, true);
        view.setInt32(18, w, true);
        view.setInt32(22, h, true);
        view.setUint16(26, 1, true);
        view.setUint16(28, 24, true);
        view.setUint32(34, pixelArraySize, true);
        let offset = 54;
        for (let y = h - 1; y >= 0; y--) {
            for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4;
                view.setUint8(offset, data[idx+2]);
                view.setUint8(offset+1, data[idx+1]);
                view.setUint8(offset+2, data[idx]);
                offset += 3;
            }
            const padding = rowSize - w * 3;
            for (let p=0; p<padding; p++) { view.setUint8(offset, 0); offset++; }
        }
        return buffer;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}