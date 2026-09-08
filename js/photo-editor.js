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

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.backgroundColor = 'white';
    canvas.style.cursor = 'crosshair';
    canvas.style.touchAction = 'none';
    canvas.style.display = 'block';

    const scrollContainer = document.createElement('div');
    scrollContainer.style.overflow = 'auto';
    scrollContainer.style.maxHeight = '70vh';
    scrollContainer.style.border = '1px solid var(--border)';
    scrollContainer.style.borderRadius = '4px';
    scrollContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let originalImage = null;
    let currentImage = null;
    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let brushSize = 5;
    let brushColor = '#000000';
    let brushOpacity = 100;
    let currentTool = 'brush';
    let history = [];

    function saveState() {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (history.length > 20) history.shift();
    }

    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = '📁 Upload';
    uploadBtn.style.padding = '0.5rem 0.8rem';
    uploadBtn.style.fontSize = '0.85rem';
    uploadBtn.style.background = 'var(--button-bg)';
    uploadBtn.style.color = 'white';
    uploadBtn.style.border = 'none';
    uploadBtn.style.borderRadius = '4px';
    uploadBtn.style.cursor = 'pointer';
    uploadBtn.addEventListener('click', () => fileInput.click());
    toolbar.appendChild(uploadBtn);

    const brushBtn = document.createElement('button');
    brushBtn.textContent = '✏️ Brush';
    brushBtn.style.padding = '0.5rem 0.8rem';
    brushBtn.style.fontSize = '0.85rem';
    brushBtn.style.background = 'var(--button-bg)';
    brushBtn.style.color = 'white';
    brushBtn.style.border = 'none';
    brushBtn.style.borderRadius = '4px';
    brushBtn.style.cursor = 'pointer';
    brushBtn.addEventListener('click', () => { currentTool = 'brush'; canvas.style.cursor = 'crosshair'; });
    toolbar.appendChild(brushBtn);

    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = '🧹 Eraser';
    eraserBtn.style.padding = '0.5rem 0.8rem';
    eraserBtn.style.fontSize = '0.85rem';
    eraserBtn.style.background = 'var(--button-bg)';
    eraserBtn.style.color = 'white';
    eraserBtn.style.border = 'none';
    eraserBtn.style.borderRadius = '4px';
    eraserBtn.style.cursor = 'pointer';
    eraserBtn.addEventListener('click', () => { currentTool = 'eraser'; canvas.style.cursor = 'cell'; });
    toolbar.appendChild(eraserBtn);

    const fillBtn = document.createElement('button');
    fillBtn.textContent = '🪣 Fill';
    fillBtn.style.padding = '0.5rem 0.8rem';
    fillBtn.style.fontSize = '0.85rem';
    fillBtn.style.background = 'var(--button-bg)';
    fillBtn.style.color = 'white';
    fillBtn.style.border = 'none';
    fillBtn.style.borderRadius = '4px';
    fillBtn.style.cursor = 'pointer';
    fillBtn.addEventListener('click', () => { currentTool = 'fill'; canvas.style.cursor = 'pointer'; });
    toolbar.appendChild(fillBtn);

    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#000000';
    colorPicker.style.width = '35px';
    colorPicker.style.height = '35px';
    colorPicker.style.border = 'none';
    colorPicker.style.borderRadius = '4px';
    colorPicker.style.cursor = 'pointer';
    colorPicker.addEventListener('change', function() { brushColor = this.value; });
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
    opacityInput.addEventListener('input', function() {
        brushOpacity = parseInt(this.value);
        opacityLabel.textContent = this.value + '%';
    });
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
    sizeInput.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        sizeLabel.textContent = this.value + 'px';
    });
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
    resizeBtn.style.fontSize = '0.85rem';
    resizeBtn.style.background = 'var(--button-bg)';
    resizeBtn.style.color = 'white';
    resizeBtn.style.border = 'none';
    resizeBtn.style.borderRadius = '4px';
    resizeBtn.style.cursor = 'pointer';
    resizeBtn.addEventListener('click', () => {
        const newW = parseInt(widthInput.value);
        const newH = parseInt(heightInput.value);
        if (!newW || !newH || newW < 1 || newH < 1) {
            showError(widthInput, 'Invalid size');
            return;
        }
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newW;
        tempCanvas.height = newH;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, newW, newH);
        tempCtx.drawImage(canvas, 0, 0, newW, newH);
        canvas.width = newW;
        canvas.height = newH;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newW, newH);
        ctx.drawImage(tempCanvas, 0, 0);
        originalImage = new Image();
        originalImage.src = canvas.toDataURL();
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history = [];
        sizeInput.max = Math.max(newW, newH);
    });
    toolbar.appendChild(widthInput);
    toolbar.appendChild(heightInput);
    toolbar.appendChild(resizeBtn);

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
            applyFilters();
        });
        valueDisplay.addEventListener('input', () => {
            let val = parseInt(valueDisplay.value) || 0;
            val = Math.max(filter.min, Math.min(filter.max, val));
            valueDisplay.value = val;
            slider.value = val;
            sliders[filter.name.toLowerCase()] = val;
            applyFilters();
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

    const applyBtn = document.createElement('button');
    applyBtn.textContent = '✅ Apply';
    applyBtn.style.padding = '0.5rem 0.8rem';
    applyBtn.style.fontSize = '0.85rem';
    applyBtn.style.background = 'var(--button-bg)';
    applyBtn.style.color = 'white';
    applyBtn.style.border = 'none';
    applyBtn.style.borderRadius = '4px';
    applyBtn.style.cursor = 'pointer';
    applyBtn.addEventListener('click', () => { saveState(); applyFilters(); });
    actionContainer.appendChild(applyBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 Reset';
    resetBtn.style.padding = '0.5rem 0.8rem';
    resetBtn.style.fontSize = '0.85rem';
    resetBtn.style.background = 'var(--button-bg)';
    resetBtn.style.color = 'white';
    resetBtn.style.border = 'none';
    resetBtn.style.borderRadius = '4px';
    resetBtn.style.cursor = 'pointer';
    resetBtn.addEventListener('click', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (originalImage) ctx.drawImage(originalImage, 0, 0);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history = [];
        filters.forEach(f => sliders[f.name.toLowerCase()] = f.value);
    });
    actionContainer.appendChild(resetBtn);

    const undoBtn = document.createElement('button');
    undoBtn.textContent = '↩️ Undo';
    undoBtn.style.padding = '0.5rem 0.8rem';
    undoBtn.style.fontSize = '0.85rem';
    undoBtn.style.background = 'var(--button-bg)';
    undoBtn.style.color = 'white';
    undoBtn.style.border = 'none';
    undoBtn.style.borderRadius = '4px';
    undoBtn.style.cursor = 'pointer';
    undoBtn.addEventListener('click', () => {
        if (history.length > 0) {
            const prev = history.pop();
            ctx.putImageData(prev, 0, 0);
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    });
    actionContainer.appendChild(undoBtn);

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '🗑️ Clear';
    clearBtn.style.padding = '0.5rem 0.8rem';
    clearBtn.style.fontSize = '0.85rem';
    clearBtn.style.background = '#8B0000';
    clearBtn.style.color = 'white';
    clearBtn.style.border = 'none';
    clearBtn.style.borderRadius = '4px';
    clearBtn.style.cursor = 'pointer';
    clearBtn.addEventListener('click', () => {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        originalImage = null;
        currentImage = null;
        history = [];
    });
    actionContainer.appendChild(clearBtn);

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '💾 Download';
    downloadBtn.style.padding = '0.5rem 0.8rem';
    downloadBtn.style.fontSize = '0.85rem';
    downloadBtn.style.background = 'var(--button-bg)';
    downloadBtn.style.color = 'white';
    downloadBtn.style.border = 'none';
    downloadBtn.style.borderRadius = '4px';
    downloadBtn.style.cursor = 'pointer';
    downloadBtn.addEventListener('click', () => {
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
    actionContainer.appendChild(downloadBtn);

    toolbar.appendChild(actionContainer);

    photoSection.appendChild(toolbar);
    photoSection.appendChild(scrollContainer);
    photoSection.appendChild(fileInput);

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = function() {
            const maxW = 800, maxH = 600;
            let w = img.width, h = img.height;
            const ratio = Math.min(maxW / w, maxH / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
            canvas.width = w;
            canvas.height = h;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            originalImage = new Image();
            originalImage.src = canvas.toDataURL();
            currentImage = ctx.getImageData(0, 0, w, h);
            history = [];
            widthInput.value = w;
            heightInput.value = h;
            sizeInput.max = Math.max(w, h);
        };
        img.src = URL.createObjectURL(file);
    });

    canvas.addEventListener('mousedown', (e) => {
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
            floodFill(Math.floor(x), Math.floor(y), brushColor, brushOpacity);
        }
    });
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        ctx.globalAlpha = brushOpacity / 100;
        ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        lastX = x;
        lastY = y;
    });
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });
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

    function floodFill(startX, startY, fillColor, opacity) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width, h = canvas.height;
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
        ctx.putImageData(imageData, 0, 0);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function applyFilters() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (originalImage) ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
        ctx.putImageData(imageData, 0, 0);
        if (blur > 0) applyBlur(blur);
        if (sharpen > 0) applySharpen(sharpen);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    function applyBlur(amount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        const w = canvas.width, h = canvas.height;
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
        ctx.putImageData(imageData, 0, 0);
    }

    function applySharpen(amount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        const w = canvas.width, h = canvas.height;
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
        ctx.putImageData(imageData, 0, 0);
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