document.addEventListener('DOMContentLoaded', function() {
    const photoSection = document.getElementById('photoEditor');
    
    photoSection.innerHTML = '';
    
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '0.5rem';
    toolbar.style.marginBottom = '1rem';
    toolbar.style.padding = '1rem';
    toolbar.style.background = 'var(--panel-bg)';
    toolbar.style.border = '1px solid var(--border)';
    toolbar.style.borderRadius = '4px';
    
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
    let zoomLevel = 1;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let currentTool = 'brush';
    let touchStartDistance = 0;
    let touchStartZoom = 1;
    
    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = 'Upload';
    uploadBtn.style.padding = '0.6rem 1rem';
    uploadBtn.style.fontSize = '0.9rem';
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    toolbar.appendChild(uploadBtn);
    
    const brushBtn = document.createElement('button');
    brushBtn.textContent = 'Brush';
    brushBtn.style.padding = '0.6rem 1rem';
    brushBtn.style.fontSize = '0.9rem';
    brushBtn.addEventListener('click', function() {
        currentTool = 'brush';
        canvas.style.cursor = 'crosshair';
    });
    toolbar.appendChild(brushBtn);
    
    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = 'Eraser';
    eraserBtn.style.padding = '0.6rem 1rem';
    eraserBtn.style.fontSize = '0.9rem';
    eraserBtn.addEventListener('click', function() {
        currentTool = 'eraser';
        canvas.style.cursor = 'cell';
    });
    toolbar.appendChild(eraserBtn);
    
    const zoomInBtn = document.createElement('button');
    zoomInBtn.textContent = 'Zoom In';
    zoomInBtn.style.padding = '0.6rem 1rem';
    zoomInBtn.style.fontSize = '0.9rem';
    zoomInBtn.addEventListener('click', function() {
        zoomLevel = Math.min(zoomLevel * 1.2, 5);
        redrawCanvas();
    });
    toolbar.appendChild(zoomInBtn);
    
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.textContent = 'Zoom Out';
    zoomOutBtn.style.padding = '0.6rem 1rem';
    zoomOutBtn.style.fontSize = '0.9rem';
    zoomOutBtn.addEventListener('click', function() {
        zoomLevel = Math.max(zoomLevel / 1.2, 0.1);
        redrawCanvas();
    });
    toolbar.appendChild(zoomOutBtn);
    
    const panBtn = document.createElement('button');
    panBtn.textContent = 'Pan';
    panBtn.style.padding = '0.6rem 1rem';
    panBtn.style.fontSize = '0.9rem';
    panBtn.addEventListener('click', function() {
        currentTool = 'pan';
        canvas.style.cursor = 'grab';
    });
    toolbar.appendChild(panBtn);
    
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = '#000000';
    colorPicker.style.width = '40px';
    colorPicker.style.height = '40px';
    colorPicker.style.border = 'none';
    colorPicker.style.borderRadius = '4px';
    colorPicker.addEventListener('change', function() {
        brushColor = this.value;
    });
    toolbar.appendChild(colorPicker);
    
    const brushSizeInput = document.createElement('input');
    brushSizeInput.type = 'range';
    brushSizeInput.min = '1';
    brushSizeInput.max = '50';
    brushSizeInput.value = '5';
    brushSizeInput.style.flex = '1';
    brushSizeInput.style.minWidth = '100px';
    brushSizeInput.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        brushSizeLabel.textContent = this.value + 'px';
    });
    toolbar.appendChild(brushSizeInput);
    
    const brushSizeLabel = document.createElement('span');
    brushSizeLabel.textContent = '5px';
    brushSizeLabel.style.fontSize = '0.9rem';
    toolbar.appendChild(brushSizeLabel);
    
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
        sliderContainer.style.gap = '0.5rem';
        sliderContainer.style.flex = '1';
        sliderContainer.style.minWidth = '200px';
        
        const label = document.createElement('label');
        label.textContent = filter.name + ':';
        label.style.minWidth = '80px';
        label.style.fontSize = '0.9rem';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = filter.min;
        slider.max = filter.max;
        slider.value = filter.value;
        slider.style.flex = '1';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = filter.value;
        valueDisplay.style.minWidth = '40px';
        valueDisplay.style.fontSize = '0.9rem';
        
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
            sliders[filter.name.toLowerCase()] = parseInt(this.value);
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
    applyBtn.textContent = 'Apply Filters';
    applyBtn.style.padding = '0.6rem 1rem';
    applyBtn.style.fontSize = '0.9rem';
    applyBtn.addEventListener('click', function() {
        if (!originalImage) {
            showError(canvas, 'Please upload an image first');
            return;
        }
        applyFilters();
    });
    actionContainer.appendChild(applyBtn);
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.padding = '0.6rem 1rem';
    resetBtn.style.fontSize = '0.9rem';
    resetBtn.addEventListener('click', function() {
        if (originalImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            zoomLevel = 1;
            panX = 0;
            panY = 0;
            
            filters.forEach(filter => {
                sliders[filter.name.toLowerCase()] = filter.value;
            });
        }
    });
    actionContainer.appendChild(resetBtn);
    
    const undoBtn = document.createElement('button');
    undoBtn.textContent = 'Undo';
    undoBtn.style.padding = '0.6rem 1rem';
    undoBtn.style.fontSize = '0.9rem';
    undoBtn.addEventListener('click', function() {
        if (originalImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
    });
    actionContainer.appendChild(undoBtn);
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.style.padding = '0.6rem 1rem';
    downloadBtn.style.fontSize = '0.9rem';
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
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
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, width, height);
            
            originalImage = new Image();
            originalImage.src = canvas.toDataURL();
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            zoomLevel = 1;
            panX = 0;
            panY = 0;
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
        
        const x = (clientX - rect.left) / zoomLevel - panX;
        const y = (clientY - rect.top) / zoomLevel - panY;
        
        return { x, y, clientX, clientY };
    }
    
    canvas.addEventListener('mousedown', function(e) {
        const coords = getCanvasCoordinates(e);
        
        if (currentTool === 'brush' || currentTool === 'eraser') {
            isDrawing = true;
            lastX = coords.x;
            lastY = coords.y;
        } else if (currentTool === 'pan') {
            isPanning = true;
            lastX = coords.clientX;
            lastY = coords.clientY;
            canvas.style.cursor = 'grabbing';
        }
    });
    
    canvas.addEventListener('mousemove', function(e) {
        const coords = getCanvasCoordinates(e);
        
        if (isDrawing) {
            ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : brushColor;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            
            lastX = coords.x;
            lastY = coords.y;
        } else if (isPanning) {
            const dx = coords.clientX - lastX;
            const dy = coords.clientY - lastY;
            panX += dx / zoomLevel;
            panY += dy / zoomLevel;
            lastX = coords.clientX;
            lastY = coords.clientY;
            redrawCanvas();
        }
    });
    
    canvas.addEventListener('mouseup', function() {
        isDrawing = false;
        isPanning = false;
        canvas.style.cursor = currentTool === 'pan' ? 'grab' : 'crosshair';
    });
    
    canvas.addEventListener('mouseleave', function() {
        isDrawing = false;
        isPanning = false;
    });
    
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        
        if (e.touches.length === 2) {
            touchStartDistance = getDistance(e.touches[0], e.touches[1]);
            touchStartZoom = zoomLevel;
            return;
        }
        
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        
        if (e.touches.length === 2) {
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            zoomLevel = Math.max(0.1, Math.min(5, touchStartZoom * (currentDistance / touchStartDistance)));
            redrawCanvas();
            return;
        }
        
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
    
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    canvas.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const oldZoom = zoomLevel;
        
        if (e.deltaY < 0) {
            zoomLevel = Math.min(zoomLevel * 1.1, 5);
        } else {
            zoomLevel = Math.max(zoomLevel / 1.1, 0.1);
        }
        
        const zoomRatio = zoomLevel / oldZoom;
        panX = mouseX / zoomLevel - (mouseX / oldZoom - panX);
        panY = mouseY / zoomLevel - (mouseY / oldZoom - panY);
        
        redrawCanvas();
    });
    
    function redrawCanvas() {
        if (!originalImage) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);
        ctx.translate(panX, panY);
        ctx.drawImage(originalImage, 0, 0);
        ctx.restore();
        
        if (currentImage) {
            ctx.putImageData(currentImage, 0, 0);
        }
    }
    
    function applyFilters() {
        if (!originalImage) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
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
});