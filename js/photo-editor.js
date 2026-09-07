document.addEventListener('DOMContentLoaded', function() {
    const photoSection = document.getElementById('photoEditor');
    
    photoSection.innerHTML = '';
    
    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '0.5rem';
    toolbar.style.marginBottom = '1rem';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    
    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = 'Upload Image';
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.width = '100%';
    canvas.style.maxWidth = '800px';
    canvas.style.border = '1px solid var(--border)';
    canvas.style.borderRadius = '4px';
    canvas.style.backgroundColor = 'white';
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const tools = [
        { name: 'Brightness', min: -100, max: 100, value: 0 },
        { name: 'Contrast', min: -100, max: 100, value: 0 },
        { name: 'Saturation', min: -100, max: 100, value: 0 },
        { name: 'Blur', min: 0, max: 10, value: 0 },
        { name: 'Sharpen', min: 0, max: 10, value: 0 },
        { name: 'Opacity', min: 0, max: 100, value: 100 }
    ];
    
    let originalImage = null;
    let currentImage = null;
    
    const sliders = {};
    tools.forEach(tool => {
        const sliderContainer = document.createElement('div');
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        sliderContainer.style.gap = '0.5rem';
        
        const label = document.createElement('label');
        label.textContent = tool.name + ':';
        label.style.minWidth = '80px';
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = tool.min;
        slider.max = tool.max;
        slider.value = tool.value;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = tool.value;
        valueDisplay.style.minWidth = '40px';
        
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
            sliders[tool.name.toLowerCase()] = parseInt(this.value);
            applyFilters();
        });
        
        sliderContainer.appendChild(label);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(valueDisplay);
        toolbar.appendChild(sliderContainer);
        
        sliders[tool.name.toLowerCase()] = tool.value;
    });
    
    const filterBtn = document.createElement('button');
    filterBtn.textContent = 'Apply Filters';
    filterBtn.addEventListener('click', function() {
        if (!originalImage) {
            alert('Please upload an image first');
            return;
        }
        applyFilters();
    });
    
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', function() {
        if (originalImage) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
            currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            tools.forEach(tool => {
                const slider = document.querySelector(`input[type="range"][min="${tool.min}"]`);
                if (slider) {
                    slider.value = tool.value;
                    slider.nextElementSibling.textContent = tool.value;
                }
            });
        }
    });
    
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '0.5rem';
    buttonContainer.style.marginBottom = '1rem';
    
    buttonContainer.appendChild(uploadBtn);
    buttonContainer.appendChild(filterBtn);
    buttonContainer.appendChild(resetBtn);
    buttonContainer.appendChild(downloadBtn);
    
    photoSection.appendChild(buttonContainer);
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
        };
        img.src = URL.createObjectURL(file);
    });
    
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
        const opacity = sliders.opacity !== undefined ? sliders.opacity : 100;
        
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
            
            if (opacity !== 100) {
                data[i + 3] = (opacity / 100) * 255;
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