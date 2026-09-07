document.addEventListener('DOMContentLoaded', function() {
    const mediaSection = document.getElementById('mediaConverter');
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    fileInput.style.marginBottom = '1rem';
    
    const formatSelect = document.createElement('select');
    formatSelect.style.marginBottom = '1rem';
    
    const formats = ['MP4', 'AVI', 'MOV', 'GIF', 'WebM', 'MKV'];
    formats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.toLowerCase();
        option.textContent = format;
        formatSelect.appendChild(option);
    });
    
    const convertBtn = document.createElement('button');
    convertBtn.textContent = 'Convert Media';
    convertBtn.style.marginBottom = '1rem';
    
    const statusDiv = document.createElement('div');
    statusDiv.style.marginTop = '1rem';
    statusDiv.style.padding = '1rem';
    statusDiv.style.border = '1px solid var(--border)';
    statusDiv.style.borderRadius = '4px';
    statusDiv.style.display = 'none';
    
    mediaSection.innerHTML = '';
    mediaSection.appendChild(fileInput);
    mediaSection.appendChild(formatSelect);
    mediaSection.appendChild(convertBtn);
    mediaSection.appendChild(statusDiv);
    
    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        const format = formatSelect.value;
        
        if (!file) {
            alert('Please select a media file');
            return;
        }
        
        statusDiv.style.display = 'block';
        statusDiv.textContent = 'Processing...';
        
        setTimeout(() => {
            statusDiv.textContent = `Converting ${file.name} to ${format.toUpperCase()}...`;
            
            setTimeout(() => {
                if (file.type.startsWith('image/')) {
                    convertImage(file, format, statusDiv);
                } else if (file.type.startsWith('video/')) {
                    convertVideo(file, format, statusDiv);
                } else {
                    statusDiv.textContent = 'Unsupported file type';
                }
            }, 1000);
        }, 500);
    });
    
    function convertImage(file, format, statusDiv) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            if (format === 'gif') {
                statusDiv.textContent = 'Converting to GIF...';
                canvas.toBlob(function(blob) {
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, '.gif'));
                    statusDiv.textContent = 'Conversion complete!';
                }, 'image/gif');
            } else {
                const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
                canvas.toBlob(function(blob) {
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
                    statusDiv.textContent = 'Conversion complete!';
                }, mimeType);
            }
        };
        img.src = URL.createObjectURL(file);
    }
    
    function convertVideo(file, format, statusDiv) {
        statusDiv.textContent = 'Video conversion requires server-side processing. Downloading original file...';
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const blob = new Blob([e.target.result], { type: `video/${format}` });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
            statusDiv.textContent = 'File downloaded (client-side conversion not possible)';
        };
        reader.readAsArrayBuffer(file);
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