document.addEventListener('DOMContentLoaded', function() {
    const photoSection = document.getElementById('photoEditor');
    
    photoSection.innerHTML = '';
    
    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.style.marginBottom = '1rem';
    backBtn.addEventListener('click', function() {
        showMainMenu();
    });
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
    canvas.style.width = '100%';
    canvas.style.maxWidth = '800px';
    canvas.style.border = '1px solid var(--border)';
    canvas.style.borderRadius = '4px';
    canvas.style.backgroundColor = 'white';
    canvas.style.cursor = 'crosshair';
    canvas.style.touchAction = 'none';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let originalImage = null;
    let currentImage = null;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let brushSize = 5;
    let brushColor = '#000000';
    let brushOpacity = 100;
    let currentTool = 'brush';
    let history = [];
    let offsetX = 0;
    let offsetY = 0;
    
    function saveState() {
        history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        if (history.length > 20) {
            history.shift();
        }
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
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
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
    brushBtn.addEventListener('click', function() {
        currentTool = 'brush';
        canvas.style.cursor = 'crosshair';
    });
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
    eraserBtn.addEventListener('click', function() {
        currentTool = 'eraser';
        canvas.style.cursor = 'cell';
    });
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
    fillBtn.addEventListener('click', function() {
        currentTool = 'fill';
        canvas.style.cursor = 'pointer';
    });
    toolbar.appendChild(fillBtn);
    
    const colorLabel = document.createElement('span');
    colorLabel.textContent = '🎨';
    toolbar.appendChild(colorLabel);
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#000000';
    colorPicker.style.width = '35px';
    colorPicker.style.height = '35px';
    colorPicker.style.border = 'none';
    colorPicker.style.borderRadius = '4px';
    colorPicker.style.cursor = 'pointer';
    colorPicker.addEventListener('change', function() {
        brushColor = this.value;
    });
    toolbar.appendChild(colorPicker);
    
    const opacityLabel = document.createElement('span');
    opacityLabel.textContent = '💧';
    toolbar.appendChild(opacityLabel);
    
    const opacityInput = document.createElement('input');
    opacityInput.type = 'range';
    opacityInput.min = '1';
    opacityInput.max = '100';
    opacityInput.value = '100';
    opacityInput.style.width = '80px';
    opacityInput.addEventListener('input', function() {
        brushOpacity = parseInt(this.value);
        opacityValue.textContent = this.value + '%';
    });
    toolbar.appendChild(opacityInput);
    
    const opacityValue = document.createElement('span');
    opacityValue.textContent = '100%';
    opacityValue.style.fontSize = '0.8rem';
    opacityValue.style.minWidth = '40px';
    toolbar.appendChild(opacityValue);
    
    const sizeLabel = document.createElement('span');
    sizeLabel.textContent = '📏';
    toolbar.appendChild(sizeLabel);
    
    const brushSizeInput = document.createElement('input');
    brushSizeInput.type = 'range';
    brushSizeInput.min = '1';
    brushSizeInput.max = '512';
    brushSizeInput.value = '5';
    brushSizeInput.style.width = '80px';
    brushSizeInput.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        brushSizeValue.value = this.value;
    });
    toolbar.appendChild(brushSizeInput);
    
    const brushSizeValue = document.createElement('input');
    brushSizeValue.type = 'number';
    brushSizeValue.min = '1';
    brushSizeValue.max = '512';
    brushSizeValue.value = '5';
    brushSizeValue.style.width = '60px';
    brushSizeValue.style.padding = '0.3rem';
    brushSizeValue.style.background = 'var(--bg)';
    brushSizeValue.style.border = '1px solid var(--border)';
    brushSizeValue.style.borderRadius = '4px';
    brushSizeValue.style.color = 'var(--text)';
    brushSizeValue.style.fontSize = '0.85rem';
    brushSizeValue.addEventListener('input', function() {
        brushSize = parseInt(this.value) || 5;
        brushSizeInput.value = this.value;
    });
    toolbar.appendChild(brushSizeValue);
    
    const resolutionLabel = document.createElement('span');
    resolutionLabel.textContent = '📐';
    toolbar.appendChild(resolutionLabel);
    
    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.placeholder = 'Width';
    widthInput.value = '800';
    widthInput.style.width = '70px';
    widthInput.style.padding = '0.3rem';
    widthInput.style.background = 'var(--bg)';
    widthInput.style.border = '1px solid var(--border)';
    widthInput.style.borderRadius = '4px';
    widthInput.style.color = 'var(--text)';
    widthInput.style.fontSize = '0.85rem';
    toolbar.appendChild(widthInput);
    
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.placeholder = 'Height';
    heightInput.value = '600';
    heightInput.style.width = '70px';
    heightInput.style.padding = '0.3rem';
    heightInput.style.background = 'var(--bg)';
    heightInput.style.border = '1px solid var(--border)';
    heightInput.style.borderRadius = '4px';
    heightInput.style.color = 'var(--text)';
    heightInput.style.fontSize = '0.85rem';
    toolbar.appendChild(heightInput);
    
    const resizeBtn = document.createElement('button');
    resizeBtn.textContent = 'Resize';
    resizeBtn.style.padding = '0.4rem 0.8rem';
    resizeBtn.style.fontSize = '0.85rem';
    resizeBtn.style.background = 'var(--button-bg)';
    resizeBtn.style.color = 'white';
    resizeBtn.style.border = 'none';
    resizeBtn.style.borderRadius = '4px';
    resizeBtn.style.cursor = 'pointer';
    resizeBtn.addEventListener('click', function() {
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);
        
        if (!newWidth || !newHeight || newWidth < 1 || newHeight < 1 || newWidth > 4096 || newHeight > 4096) {
            showError(widthInput, 'Size must be between 1 and 4096');
            return;
        }
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, newWidth, newHeight);
        tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);
        ctx.drawImage(tempCanvas, 0, 0);
        
        originalImage = new Image();
        originalImage.src = canvas.toDataURL();
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        history = [];
        
        brushSizeInput.max = Math.max(newWidth, newHeight);
        brushSizeValue.max = Math.max(newWidth, newHeight);
    });
    toolbar.appendChild(resizeBtn);
    
    const nudgeContainer = document.createElement('div');
    nudgeContainer.style.display = 'grid';
    nudgeContainer.style.gridTemplateColumns = 'repeat(3, 30px)';
    nudgeContainer.style.gridTemplateRows = 'repeat(3, 30px)';
    nudgeContainer.style.gap = '2px';
    
    const nudgeUp = document.createElement('button');
    nudgeUp.textContent = '↑';
    nudgeUp.style.gridColumn = '2';
    nudgeUp.style.gridRow = '1';
    nudgeUp.style.padding = '0';
    nudgeUp.style.background = 'var(--button-bg)';
    nudgeUp.style.color = 'white';
    nudgeUp.style.border = 'none';
    nudgeUp.style.borderRadius = '4px';
    nudgeUp.style.cursor = 'pointer';
    nudgeUp.addEventListener('click', function() {
        offsetY -= 10;
        redrawCanvas();
    });
    nudgeContainer.appendChild(nudgeUp);
    
    const nudgeLeft = document.createElement('button');
    nudgeLeft.textContent = '←';
    nudgeLeft.style.gridColumn = '1';
    nudgeLeft.style.gridRow = '2';
    nudgeLeft.style.padding = '0';
    nudgeLeft.style.background = 'var(--button-bg)';
    nudgeLeft.style.color = 'white';
    nudgeLeft.style.border = 'none';
    nudgeLeft.style.borderRadius = '4px';
    nudgeLeft.style.cursor = 'pointer';
    nudgeLeft.addEventListener('click', function() {
        offsetX -= 10;
        redrawCanvas();
    });
    nudgeContainer.appendChild(nudgeLeft);
    
    const nudgeCenter = document.createElement('button');
    nudgeCenter.textContent = '•';
    nudgeCenter.style.gridColumn = '2';
    nudgeCenter.style.gridRow = '2';
    nudgeCenter.style.padding = '0';
    nudgeCenter.style.background = 'var(--border)';
    nudgeCenter.style.color = 'var(--text)';
    nudgeCenter.style.border = 'none';
    nudgeCenter.style.borderRadius = '4px';
    nudgeCenter.style.cursor = 'pointer';
    nudgeCenter.addEventListener('click', function() {
        offsetX = 0;
        offsetY = 0;
        redrawCanvas();
    });
    nudgeContainer.appendChild(nudgeCenter);
    
    const nudgeRight = document.createElement('button');
    nudgeRight.textContent = '→';
    nudgeRight.style.gridColumn = '3';
    nudgeRight.style.gridRow = '2';
    nudgeRight.style.padding = '0';
    nudgeRight.style.background = 'var(--button-bg)';
    nudgeRight.style.color = 'white';
    nudgeRight.style.border = 'none';
    nudgeRight.style.borderRadius = '4px';
    nudgeRight.style.cursor = 'pointer';
    nudgeRight.addEventListener('click', function() {
        offsetX += 10;
        redrawCanvas();
    });
    nudgeContainer.appendChild(nudgeRight);
    
    const nudgeDown = document.createElement('button');
    nudgeDown.textContent = '↓';
    nudgeDown.style.gridColumn = '2';
    nudgeDown.style.gridRow = '3';
    nudgeDown.style.padding = '0';
    nudgeDown.style.background = 'var(--button-bg)';
    nudgeDown.style.color = 'white';
    nudgeDown.style.border = 'none';
    nudgeDown.style.borderRadius = '4px';
    nudgeDown.style.cursor = 'pointer';
    nudgeDown.addEventListener('click', function() {
        offsetY += 10;
        redrawCanvas();
    });
    nudgeContainer.appendChild(nudgeDown);
    
    toolbar.appendChild(nudgeContainer);
    
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
        const sliderContainer = document.createElement('div');
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        sliderContainer.style.gap = '0.3rem';
        sliderContainer.style.flex = '1';
        sliderContainer.style.minWidth = '180px';
        sliderContainer.style.background = 'var(--bg)';
        sliderContainer.style.padding = '0.4rem';
        sliderContainer.style.borderRadius = '4px';
        
        const label = document.createElement('label');
        label.textContent = filter.name + ':';
        label.style.minWidth = '70px';
        label.style.fontSize = '0.8rem';
        label.style.color = 'var(--text)';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = filter.min;
        slider.max = filter.max;
        slider.value = filter.value;
        slider.style.flex = '1';
        slider.style.minWidth = '60px';
        
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
        
        slider.addEventListener('input', function() {
            valueDisplay.value = this.value;
            sliders[filter.name.toLowerCase()] = parseInt(this.value);
            applyFilters();
        });
        
        valueDisplay.addEventListener('input', function() {
            let val = parseInt(this.value) || 0;
            val = Math.max(filter.min, Math.min(filter.max, val));
            this.value = val;
            slider.value = val;
            sliders[filter.name.toLowerCase()] = val;
            applyFilters();
        });
        
        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        filterContainer.appendChild(sliderContainer);
        
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
    applyBtn.addEventListener('click', function() {
        saveState();
        applyFilters();
    });
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
    resetBtn.addEventListener('click', function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (originalImage) {
            ctx.drawImage(originalImage, 0, 0);
        }
        
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        offsetX = 0;
        offsetY = 0;
        history = [];
        
        filters.forEach(filter => {
            sliders[filter.name.toLowerCase()] = filter.value;
        });
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
    undoBtn.addEventListener('click', function() {
        if (history.length > 0) {
            const prevState = history.pop();
            ctx.putImageData(prevState, 0, 0);
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
    clearBtn.addEventListener('click', function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        originalImage = null;
        currentImage = null;
        history = [];
        offsetX = 0;
        offsetY = 0;
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
    downloadBtn.addEventListener('click', function() {
        showDownloadDialog(canvas);
    });
    actionContainer.appendChild(downloadBtn);
    
    toolbar.appendChild(actionContainer);
    
    photoSection.appendChild(toolbar);
    photoSection.appendChild(canvas);
    photoSection.appendChild(fileInput);
    
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;
        
        const img = new Image();
        img.onload = function() {
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            
            canvas.width = width;
            canvas.height = height;
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            originalImage = new Image();
            originalImage.src = canvas.toDataURL();
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            history = [];
            offsetX = 0;
            offsetY = 0;
            
            brushSizeInput.max = Math.max(width, height);
            brushSizeValue.max = Math.max(width, height);
            widthInput.value = width;
            heightInput.value = height;
        };
        img.src = URL.createObjectURL(file);
    });
    
    function getCanvasCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (clientX - rect.left) * scaleX - offsetX;
        const y = (clientY - rect.top) * scaleY - offsetY;
        
        return { x, y, clientX, clientY };
    }
    
    canvas.addEventListener('mousedown', function(e) {
        const coords = getCanvasCoordinates(e);
        
        if (currentTool === 'brush' || currentTool === 'eraser') {
            isDrawing = true;
            lastX = coords.x;
            lastY = coords.y;
            saveState();
        } else if (currentTool === 'fill') {
            saveState();
            floodFill(Math.floor(coords.x), Math.floor(coords.y), brushColor, brushOpacity);
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        const coords = getCanvasCoordinates(e);
        
        if (isDrawing) {
            ctx.globalAlpha = brushOpacity / 100;
            ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            
            ctx.globalAlpha = 1;
            
            lastX = coords.x;
            lastY = coords.y;
        }
    });
    
    canvas.addEventListener('mouseup', function() {
        isDrawing = false;
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    });
    
    canvas.addEventListener('mouseleave', function() {
        isDrawing = false;
    });
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
        
        const mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
    });
    
    function redrawCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (originalImage) {
            ctx.drawImage(originalImage, offsetX, offsetY);
        }
        
        if (currentImage) {
            ctx.putImageData(currentImage, 0, 0);
        }
    }
    
    function floodFill(startX, startY, fillColor, opacity) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;
        
        if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;
        
        const startIdx = (startY * width + startX) * 4;
        const targetR = data[startIdx];
        const targetG = data[startIdx + 1];
        const targetB = data[startIdx + 2];
        
        const fillR = parseInt(fillColor.slice(1, 3), 16);
        const fillG = parseInt(fillColor.slice(3, 5), 16);
        const fillB = parseInt(fillColor.slice(5, 7), 16);
        
        const alpha = opacity / 100;
        
        const queue = [[startX, startY]];
        const visited = new Set();
        
        while (queue.length > 0) {
            const [x, y] = queue.shift();
            const key = `${x},${y}`;
            
            if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) continue;
            
            const idx = (y * width + x) * 4;
            
            if (Math.abs(data[idx] - targetR) > 30 || 
                Math.abs(data[idx + 1] - targetG) > 30 || 
                Math.abs(data[idx + 2] - targetB) > 30) continue;
            
            visited.add(key);
            
            data[idx] = fillR * alpha + data[idx] * (1 - alpha);
            data[idx + 1] = fillG * alpha + data[idx + 1] * (1 - alpha);
            data[idx + 2] = fillB * alpha + data[idx + 2] * (1 - alpha);
            data[idx + 3] = 255;
            
            queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        
        ctx.putImageData(imageData, 0, 0);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    function applyFilters() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (originalImage) {
            ctx.drawImage(originalImage, 0, 0);
        }
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const brightness = sliders.brightness || 0;
        const contrast = sliders.contrast || 0;
        const saturation = sliders.saturation || 0;
        const blur = sliders.blur || 0;
        const sharpen = sliders.sharpen || 0;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            if (brightness !== 0) {
                r += brightness * 2.55;
                g += brightness * 2.55;
                b += brightness * 2.55;
            }
            
            if (contrast !== 0) {
                const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                b = factor * (b - 128) + 128;
            }
            
            if (saturation !== 0) {
                const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
                const saturationFactor = 1 + saturation / 100;
                r = gray + saturationFactor * (r - gray);
                g = gray + saturationFactor * (g - gray);
                b = gray + saturationFactor * (b - gray);
            }
            
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        if (blur > 0) {
            applyBlur(blur);
        }
        
        if (sharpen > 0) {
            applySharpen(sharpen);
        }
        
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    
    function applyBlur(amount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        
        const width = canvas.width;
        const height = canvas.height;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;
                
                for (let dy = -amount; dy <= amount; dy++) {
                    for (let dx = -amount; dx <= amount; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const idx = (ny * width + nx) * 4;
                            r += tempData[idx];
                            g += tempData[idx + 1];
                            b += tempData[idx + 2];
                            a += tempData[idx + 3];
                            count++;
                        }
                    }
                }
                
                const idx = (y * width + x) * 4;
                data[idx] = r / count;
                data[idx + 1] = g / count;
                data[idx + 2] = b / count;
                data[idx + 3] = a / count;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function applySharpen(amount) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const tempData = new Uint8ClampedArray(data);
        
        const width = canvas.width;
        const height = canvas.height;
        const strength = amount / 5;
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    const center = tempData[idx + c];
                    const left = tempData[idx - 4 + c];
                    const right = tempData[idx + 4 + c];
                    const top = tempData[idx - width * 4 + c];
                    const bottom = tempData[idx + width * 4 + c];
                    
                    const sharpened = center * (1 + 4 * strength) - (left + right + top + bottom) * strength;
                    data[idx + c] = Math.max(0, Math.min(255, sharpened));
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function showDownloadDialog(canvas) {
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '50%';
        container.style.left = '50%';
        container.style.transform = 'translate(-50%, -50%)';
        container.style.background = 'var(--panel-bg)';
        container.style.border = '1px solid var(--border)';
        container.style.borderRadius = '4px';
        container.style.padding = '1.5rem';
        container.style.zIndex = '2000';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '0.8rem';
        container.style.minWidth = '250px';
        
        const title = document.createElement('h3');
        title.textContent = 'Save As';
        title.style.color = 'var(--accent)';
        container.appendChild(title);
        
        const formatSelect = document.createElement('select');
        formatSelect.style.padding = '0.6rem';
        formatSelect.style.background = 'var(--bg)';
        formatSelect.style.border = '1px solid var(--border)';
        formatSelect.style.borderRadius = '4px';
        formatSelect.style.color = 'var(--text)';
        
        const formats = ['PNG', 'JPG', 'WebP', 'SVG', 'BMP', 'ICO'];
        formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format.toLowerCase();
            option.textContent = format;
            formatSelect.appendChild(option);
        });
        container.appendChild(formatSelect);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.style.padding = '0.6rem';
        downloadBtn.style.background = 'var(--button-bg)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', function() {
            const format = formatSelect.value;
            
            if (format === 'svg') {
                const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                downloadBlob(blob, 'edited-image.svg');
            } else if (format === 'bmp') {
                const bmpData = canvasToBMP(canvas);
                const blob = new Blob([bmpData], { type: 'image/bmp' });
                downloadBlob(blob, 'edited-image.bmp');
            } else if (format === 'ico') {
                canvas.toBlob(function(blob) {
                    downloadBlob(blob, 'edited-image.ico');
                }, 'image/x-icon');
            } else {
                const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                canvas.toBlob(function(blob) {
                    downloadBlob(blob, `edited-image.${format}`);
                }, mimeType);
            }
            
            container.remove();
        });
        container.appendChild(downloadBtn);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.padding = '0.6rem';
        cancelBtn.style.background = 'var(--border)';
        cancelBtn.style.color = 'var(--text)';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.addEventListener('click', function() {
            container.remove();
        });
        container.appendChild(cancelBtn);
        
        document.body.appendChild(container);
    }
    
    function canvasToBMP(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        const width = canvas.width;
        const height = canvas.height;
        const rowSize = Math.floor((24 * width + 31) / 32) * 4;
        const pixelArraySize = rowSize * height;
        const fileSize = 54 + pixelArraySize;
        
        const buffer = new ArrayBuffer(fileSize);
        const view = new DataView(buffer);
        
        view.setUint8(0, 66);
        view.setUint8(1, 77);
        view.setUint32(2, fileSize, true);
        view.setUint32(10, 54, true);
        view.setUint32(14, 40, true);
        view.setInt32(18, width, true);
        view.setInt32(22, height, true);
        view.setUint16(26, 1, true);
        view.setUint16(28, 24, true);
        view.setUint32(34, pixelArraySize, true);
        
        let offset = 54;
        
        for (let y = height - 1; y >= 0; y--) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                
                const b = data[idx + 2];
                const g = data[idx + 1];
                const r = data[idx];
                
                view.setUint8(offset, b);
                view.setUint8(offset + 1, g);
                view.setUint8(offset + 2, r);
                offset += 3;
            }
            
            const padding = rowSize - width * 3;
            for (let p = 0; p < padding; p++) {
                view.setUint8(offset, 0);
                offset++;
            }
        }
        
        return buffer;
    }
    
    function downloadBlob(blob, filename) {
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