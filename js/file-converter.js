document.addEventListener('DOMContentLoaded', function() {
    const pdfInput = document.querySelector('#pdfConverter input[type="file"]');
    const pdfFormat = document.querySelector('#pdfConverter select');
    const pdfConvertBtn = document.querySelector('#pdfConverter button');
    
    pdfConvertBtn.addEventListener('click', function() {
        if (!pdfInput.files.length) {
            alert('Please select a PDF file');
            return;
        }
        
        const file = pdfInput.files[0];
        const format = pdfFormat.value;
        
        alert(`Converting ${file.name} to ${format.toUpperCase()}...`);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const blob = new Blob([content], { type: getMimeType(format) });
            downloadFile(blob, file.name.replace('.pdf', `.${format}`));
        };
        reader.readAsArrayBuffer(file);
    });
    
    const imageInput = document.querySelector('#imageConverter input[type="file"]');
    const imageFormat = document.querySelector('#imageConverter select');
    const imageConvertBtn = document.querySelector('#imageConverter button');
    
    imageConvertBtn.addEventListener('click', function() {
        if (!imageInput.files.length) {
            alert('Please select an image');
            return;
        }
        
        const file = imageInput.files[0];
        const format = imageFormat.value;
        
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const mimeType = `image/${format === 'jpg' ? 'jpeg' : format}`;
            canvas.toBlob(function(blob) {
                downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
            }, mimeType);
        };
        img.src = URL.createObjectURL(file);
    });
    
    const videoInput = document.querySelector('#videoConverter input[type="file"]');
    const videoFormat = document.querySelector('#videoConverter select');
    const videoConvertBtn = document.querySelector('#videoConverter button');
    
    videoConvertBtn.addEventListener('click', function() {
        if (!videoInput.files.length) {
            alert('Please select a video');
            return;
        }
        
        const file = videoInput.files[0];
        const format = videoFormat.value;
        
        alert(`Video conversion requires server-side processing. ${file.name} to ${format}`);
    });
    
    const docInput = document.querySelector('#documentConverter input[type="file"]');
    const docFormat = document.querySelector('#documentConverter select');
    const docConvertBtn = document.querySelector('#documentConverter button');
    
    docConvertBtn.addEventListener('click', function() {
        if (!docInput.files.length) {
            alert('Please select a document');
            return;
        }
        
        const file = docInput.files[0];
        const format = docFormat.value;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            
            let converted = content;
            if (format === 'txt') {
                converted = content.replace(/<[^>]+>/g, '');
            } else if (format === 'html') {
                converted = `<pre>${content}</pre>`;
            } else if (format === 'markdown') {
                converted = content.replace(/<h1>(.*?)<\/h1>/g, '# $1')
                                  .replace(/<h2>(.*?)<\/h2>/g, '## $1')
                                  .replace(/<p>(.*?)<\/p>/g, '$1\n');
            }
            
            const blob = new Blob([converted], { type: 'text/plain' });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        };
        reader.readAsText(file);
    });
    
    const codeTextarea = document.querySelector('#codeConverter textarea');
    const codeFormat = document.querySelector('#codeConverter select');
    const codeConvertBtn = document.querySelector('#codeConverter button');
    
    codeConvertBtn.addEventListener('click', function() {
        const input = codeTextarea.value.trim();
        if (!input) {
            alert('Please paste code');
            return;
        }
        
        const format = codeFormat.value;
        let result = input;
        
        try {
            if (format === 'json') {
                result = JSON.stringify(JSON.parse(input), null, 2);
            } else if (format === 'xml') {
                result = jsonToXml(JSON.parse(input));
            } else if (format === 'csv') {
                result = jsonToCsv(JSON.parse(input));
            } else if (format === 'yaml') {
                result = jsonToYaml(JSON.parse(input));
            }
        } catch (e) {
            alert('Invalid input format');
            return;
        }
        
        codeTextarea.value = result;
    });
    
    const fontInput = document.querySelector('#fontConverter input[type="file"]');
    const fontFormat = document.querySelector('#fontConverter select');
    const fontConvertBtn = document.querySelector('#fontConverter button');
    
    fontConvertBtn.addEventListener('click', function() {
        if (!fontInput.files.length) {
            alert('Please select a font file');
            return;
        }
        
        const file = fontInput.files[0];
        const format = fontFormat.value;
        
        alert(`Font conversion requires specialized tools. ${file.name} to ${format}`);
    });
});

function getMimeType(format) {
    const types = {
        'word': 'application/msword',
        'excel': 'application/vnd.ms-excel',
        'jpg': 'image/jpeg',
        'html': 'text/html',
        'png': 'image/png',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',
        'mp4': 'video/mp4',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'gif': 'image/gif',
        'doc': 'application/msword',
        'txt': 'text/plain',
        'markdown': 'text/markdown'
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

function jsonToXml(obj) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
    
    for (const key in obj) {
        xml += `  <${key}>${obj[key]}</${key}>\n`;
    }
    
    xml += '</root>';
    return xml;
}

function jsonToCsv(obj) {
    if (Array.isArray(obj) && obj.length > 0) {
        const headers = Object.keys(obj[0]);
        let csv = headers.join(',') + '\n';
        
        obj.forEach(item => {
            const row = headers.map(header => item[header]).join(',');
            csv += row + '\n';
        });
        
        return csv;
    }
    
    return 'Invalid CSV data';
}

function jsonToYaml(obj) {
    let yaml = '';
    
    for (const key in obj) {
        yaml += `${key}: ${obj[key]}\n`;
    }
    
    return yaml;
}