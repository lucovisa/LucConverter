document.addEventListener('DOMContentLoaded', function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFiles(files);
        }
    });
    
    fileInput.addEventListener('change', function() {
        const files = Array.from(this.files);
        if (files.length > 0) {
            processFiles(files);
        }
    });
    
    function processFiles(files) {
        fileList.innerHTML = '';
        
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileInfo = document.createElement('div');
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
            
            const convertBtn = document.createElement('button');
            convertBtn.textContent = 'Convert';
            convertBtn.style.padding = '0.5rem 1rem';
            convertBtn.style.background = 'var(--button-bg)';
            convertBtn.style.color = 'white';
            convertBtn.style.border = 'none';
            convertBtn.style.borderRadius = '4px';
            convertBtn.style.cursor = 'pointer';
            convertBtn.addEventListener('click', function() {
                showConvertOptions(file);
            });
            
            fileItem.appendChild(fileInfo);
            fileItem.appendChild(convertBtn);
            fileList.appendChild(fileItem);
        });
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
    
    function showConvertOptions(file) {
        const fileType = file.type.split('/')[0];
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (fileType === 'image') {
            showImageOptions(file);
        } else if (fileType === 'video') {
            showVideoOptions(file);
        } else if (fileType === 'audio') {
            showAudioOptions(file);
        } else if (extension === 'pdf') {
            showPDFOptions(file);
        } else if (extension === 'html' || extension === 'htm') {
            showHTMLOptions(file);
        } else if (extension === 'docx') {
            showDOCXOptions(file);
        } else if (extension === 'xlsx' || extension === 'xls') {
            showXLSXOptions(file);
        } else {
            showGenericOptions(file);
        }
    }
    
    function showImageOptions(file) {
        const optionsDiv = createOptionsContainer('Convert image to:');
        
        const formats = ['PNG', 'JPG', 'WebP', 'SVG', 'BMP', 'ICO', 'TXT (OCR)'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                if (format === 'TXT (OCR)') {
                    extractTextFromImage(file);
                } else {
                    convertImage(file, format.toLowerCase());
                }
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    function convertImage(file, format) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            if (format === 'svg') {
                const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}"><image href="${img.src}" width="${img.width}" height="${img.height}"/></svg>`;
                const blob = new Blob([svgData], { type: 'image/svg+xml' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.svg'));
            } else if (format === 'ico') {
                canvas.toBlob(function(blob) {
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, '.ico'));
                }, 'image/x-icon');
            } else if (format === 'bmp') {
                const bmpData = canvasToBMP(canvas);
                const blob = new Blob([bmpData], { type: 'image/bmp' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.bmp'));
            } else {
                const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                canvas.toBlob(function(blob) {
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
                }, mimeType);
            }
        };
        img.src = URL.createObjectURL(file);
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
    
    async function extractTextFromImage(file) {
        try {
            const result = await Tesseract.recognize(file, 'eng');
            const blob = new Blob([result.data.text], { type: 'text/plain' });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, '.txt'));
        } catch (e) {
            showError(fileList, 'OCR failed. Please try another image.');
        }
    }
    
    function showVideoOptions(file) {
        const optionsDiv = createOptionsContainer('Convert video to:');
        
        const formats = ['MP4', 'AVI', 'MOV', 'GIF', 'WebM', 'MP3', 'WAV', 'JPG', 'PNG'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                convertVideo(file, format.toLowerCase());
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    function convertVideo(file, format) {
        if (format === 'jpg' || format === 'png') {
            extractFrameFromVideo(file, format);
        } else if (format === 'mp3' || format === 'wav') {
            extractAudioFromVideo(file, format);
        } else {
            const blob = new Blob([file], { type: `video/${format}` });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        }
    }
    
    function showAudioOptions(file) {
        const optionsDiv = createOptionsContainer('Convert audio to:');
        
        const formats = ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'MP4', 'WebM'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                convertAudio(file, format.toLowerCase());
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    function convertAudio(file, format) {
        if (format === 'mp4' || format === 'webm') {
            audioToVideo(file, format);
        } else {
            const blob = new Blob([file], { type: `audio/${format}` });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        }
    }
    
    function showPDFOptions(file) {
        const optionsDiv = createOptionsContainer('Convert PDF to:');
        
        const formats = ['TXT', 'HTML', 'JPG', 'PNG'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                convertPDF(file, format.toLowerCase());
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    async function convertPDF(file, format) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            if (format === 'txt') {
                let text = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map(item => item.str);
                    text += strings.join(' ') + '\n\n';
                }
                
                const blob = new Blob([text], { type: 'text/plain' });
                downloadFile(blob, file.name.replace('.pdf', '.txt'));
            } else if (format === 'html') {
                let html = '<html><body>';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const strings = content.items.map(item => item.str);
                    html += `<p>${strings.join(' ')}</p>`;
                }
                
                html += '</body></html>';
                
                const blob = new Blob([html], { type: 'text/html' });
                downloadFile(blob, file.name.replace('.pdf', '.html'));
            } else if (format === 'jpg' || format === 'png') {
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2 });
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    
                    const ctx = canvas.getContext('2d');
                    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                    
                    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
                    canvas.toBlob(function(blob) {
                        downloadFile(blob, file.name.replace('.pdf', `_page${i}.${format}`));
                    }, mimeType);
                }
            }
        } catch (e) {
            showError(fileList, 'PDF conversion failed');
        }
    }
    
    function showHTMLOptions(file) {
        const optionsDiv = createOptionsContainer('Convert HTML to:');
        
        const formats = ['TXT', 'Markdown', 'PDF'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                convertHTML(file, format.toLowerCase());
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    function convertHTML(file, format) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const htmlContent = e.target.result;
            
            if (format === 'txt') {
                const textContent = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                const blob = new Blob([textContent], { type: 'text/plain' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.txt'));
            } else if (format === 'markdown') {
                let md = htmlContent;
                md = md.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
                md = md.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
                md = md.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
                md = md.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
                md = md.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
                md = md.replace(/<em>(.*?)<\/em>/g, '*$1*');
                md = md.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
                md = md.replace(/<[^>]+>/g, '');
                const blob = new Blob([md], { type: 'text/markdown' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.md'));
            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const textContent = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                doc.text(textContent, 10, 10);
                const blob = doc.output('blob');
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.pdf'));
            }
        };
        
        reader.readAsText(file);
    }
    
    function showDOCXOptions(file) {
        const optionsDiv = createOptionsContainer('Convert DOCX to:');
        
        const formats = ['TXT', 'HTML', 'PDF'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                convertDOCX(file, format.toLowerCase());
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    async function convertDOCX(file, format) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
            const html = result.value;
            
            if (format === 'txt') {
                const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                const blob = new Blob([text], { type: 'text/plain' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.txt'));
            } else if (format === 'html') {
                const blob = new Blob([html], { type: 'text/html' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.html'));
            } else if (format === 'pdf') {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                doc.text(text, 10, 10);
                const blob = doc.output('blob');
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.pdf'));
            }
        } catch (e) {
            showError(fileList, 'DOCX conversion failed');
        }
    }
    
    function showXLSXOptions(file) {
        const optionsDiv = createOptionsContainer('Convert XLSX to:');
        
        const formats = ['CSV', 'JSON', 'HTML'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                convertXLSX(file, format.toLowerCase());
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    async function convertXLSX(file, format) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            
            if (format === 'csv') {
                const csv = XLSX.utils.sheet_to_csv(firstSheet);
                const blob = new Blob([csv], { type: 'text/csv' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.csv'));
            } else if (format === 'json') {
                const json = XLSX.utils.sheet_to_json(firstSheet);
                const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.json'));
            } else if (format === 'html') {
                const html = XLSX.utils.sheet_to_html(firstSheet);
                const blob = new Blob([html], { type: 'text/html' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.html'));
            }
        } catch (e) {
            showError(fileList, 'XLSX conversion failed');
        }
    }
    
    function showGenericOptions(file) {
        const optionsDiv = createOptionsContainer('Convert to:');
        
        const formats = ['ZIP', 'TXT', 'HTML', 'JSON', 'XML', 'CSV'];
        
        formats.forEach(format => {
            const btn = document.createElement('button');
            btn.textContent = format;
            btn.style.marginRight = '0.5rem';
            btn.style.marginBottom = '0.5rem';
            btn.style.padding = '0.5rem 1rem';
            btn.style.background = 'var(--button-bg)';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.addEventListener('click', function() {
                if (format === 'ZIP') {
                    convertToZip(file);
                } else {
                    convertGeneric(file, format.toLowerCase());
                }
            });
            optionsDiv.appendChild(btn);
        });
        
        fileList.appendChild(optionsDiv);
    }
    
    async function convertToZip(file) {
        try {
            const zip = new JSZip();
            zip.file(file.name, file);
            
            const blob = await zip.generateAsync({ type: 'blob' });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, '.zip'));
        } catch (e) {
            showError(fileList, 'ZIP conversion failed');
        }
    }
    
    function convertGeneric(file, format) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const content = e.target.result;
            let blob;
            
            if (['txt', 'html', 'json', 'xml', 'csv'].includes(format)) {
                blob = new Blob([content], { type: 'text/plain' });
            } else {
                blob = new Blob([content], { type: 'application/octet-stream' });
            }
            
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        };
        
        reader.readAsArrayBuffer(file);
    }
    
    function createOptionsContainer(title) {
        const optionsDiv = document.createElement('div');
        optionsDiv.style.marginTop = '1rem';
        optionsDiv.style.padding = '1rem';
        optionsDiv.style.background = 'var(--panel-bg)';
        optionsDiv.style.border = '1px solid var(--border)';
        optionsDiv.style.borderRadius = '4px';
        
        const titleEl = document.createElement('p');
        titleEl.textContent = title;
        titleEl.style.marginBottom = '0.5rem';
        titleEl.style.color = 'var(--accent)';
        optionsDiv.appendChild(titleEl);
        
        return optionsDiv;
    }
    
    function extractFrameFromVideo(file, format) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            video.currentTime = Math.min(1, video.duration / 2);
        };
        
        video.onseeked = function() {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            canvas.toBlob(function(blob) {
                downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
            }, mimeType);
            
            video.src = '';
        };
    }
    
    function extractAudioFromVideo(file, format) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        
        video.onloadedmetadata = function() {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(video);
            const destination = audioContext.createMediaStreamDestination();
            
            source.connect(destination);
            
            const mediaRecorder = new MediaRecorder(destination.stream);
            const chunks = [];
            
            mediaRecorder.ondataavailable = function(e) {
                chunks.push(e.data);
            };
            
            mediaRecorder.onstop = function() {
                const mimeType = format === 'mp3' ? 'audio/mpeg' : 'audio/wav';
                const blob = new Blob(chunks, { type: mimeType });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
            };
            
            mediaRecorder.start();
            video.play();
            
            setTimeout(() => {
                mediaRecorder.stop();
                video.pause();
                video.src = '';
            }, 5000);
        };
    }
    
    function audioToVideo(file, format) {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1b2838';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#66c0f4';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(file.name, canvas.width / 2, canvas.height / 2);
        
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];
        
        mediaRecorder.ondataavailable = function(e) {
            chunks.push(e.data);
        };
        
        mediaRecorder.onstop = function() {
            const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
            const blob = new Blob(chunks, { type: mimeType });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        };
        
        mediaRecorder.start();
        
        setTimeout(() => {
            mediaRecorder.stop();
        }, 3000);
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