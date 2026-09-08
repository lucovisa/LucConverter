document.addEventListener('DOMContentLoaded', function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

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

    function processFiles(files) {
        fileList.innerHTML = '';
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.display = 'flex';
            fileItem.style.alignItems = 'center';
            fileItem.style.gap = '0.5rem';
            fileItem.style.flexWrap = 'wrap';

            const fileInfo = document.createElement('span');
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
            fileInfo.style.flex = '1';
            fileInfo.style.minWidth = '150px';

            const formatSelect = document.createElement('select');
            formatSelect.style.width = 'auto';
            formatSelect.style.minWidth = '120px';
            const formats = getFormats(file);
            formats.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.toLowerCase();
                opt.textContent = f;
                formatSelect.appendChild(opt);
            });

            const convertBtn = document.createElement('button');
            convertBtn.textContent = 'Convert';
            convertBtn.style.padding = '0.5rem 1rem';
            convertBtn.style.background = 'var(--button-bg)';
            convertBtn.style.color = 'white';
            convertBtn.style.border = 'none';
            convertBtn.style.borderRadius = '4px';
            convertBtn.style.cursor = 'pointer';
            convertBtn.addEventListener('click', () => {
                performConversion(file, formatSelect.value);
            });

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(formatSelect);
            fileItem.appendChild(convertBtn);
            fileList.appendChild(fileItem);
        });
    }

    function getFormats(file) {
        const fileType = file.type.split('/')[0];
        const extension = file.name.split('.').pop().toLowerCase();

        if (fileType === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif'].includes(extension)) {
            return ['PNG', 'JPG', 'WebP', 'SVG', 'BMP', 'ICO', 'TXT (OCR)'];
        }
        if (fileType === 'video' || ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'].includes(extension)) {
            return ['MP4', 'AVI', 'MOV', 'GIF', 'WebM', 'MP3', 'WAV', 'JPG', 'PNG'];
        }
        if (fileType === 'audio' || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'].includes(extension)) {
            return ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'MP4', 'WebM'];
        }
        if (extension === 'pdf') return ['TXT', 'HTML', 'JPG', 'PNG'];
        if (extension === 'html' || extension === 'htm') return ['TXT', 'Markdown', 'PDF'];
        if (extension === 'docx') return ['TXT', 'HTML', 'PDF'];
        if (extension === 'xlsx' || extension === 'xls') return ['CSV', 'JSON', 'HTML'];
        if (extension === 'glb' || extension === 'gltf') return ['OBJ', 'STL'];
        if (extension === 'obj') return ['STL', 'GLB'];
        if (extension === 'zip' || extension === 'rar' || extension === '7z') return ['ZIP'];
        return ['ZIP', 'TXT', 'HTML', 'JSON', 'XML', 'CSV'];
    }

    function performConversion(file, format) {
        const fileType = file.type.split('/')[0];
        const extension = file.name.split('.').pop().toLowerCase();
        const isImage = fileType === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif'].includes(extension);
        const isVideo = fileType === 'video' || ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'].includes(extension);
        const isAudio = fileType === 'audio' || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'].includes(extension);
        const isArchive = ['zip', 'rar', '7z'].includes(extension);

        if (isImage) {
            if (format === 'txt (ocr)') extractTextFromImage(file);
            else convertImage(file, format);
        } else if (isVideo) {
            if (format === 'jpg' || format === 'png') extractFrameFromVideo(file, format);
            else if (format === 'mp3' || format === 'wav') extractAudioFromVideo(file, format);
            else if (window.FFmpeg && isFFmpegAvailable()) convertWithFFmpeg(file, format);
            else convertVideoFallback(file, format);
        } else if (isAudio) {
            if (format === 'mp4' || format === 'webm') audioToVideo(file, format);
            else if (window.FFmpeg && isFFmpegAvailable()) convertWithFFmpeg(file, format);
            else convertAudioFallback(file, format);
        } else if (extension === 'pdf') {
            convertPDF(file, format);
        } else if (extension === 'html' || extension === 'htm') {
            convertHTML(file, format);
        } else if (extension === 'docx') {
            convertDOCX(file, format);
        } else if (extension === 'xlsx' || extension === 'xls') {
            convertXLSX(file, format);
        } else if (extension === 'glb' || extension === 'gltf') {
            convert3D(file, format);
        } else if (extension === 'obj') {
            convert3D(file, format);
        } else if (isArchive) {
            if (format === 'zip') handleArchive(file, format);
            else convertGeneric(file, format);
        } else {
            if (format === 'zip') convertToZip(file);
            else convertGeneric(file, format);
        }
    }

    let ffmpegLoaded = false;
    let ffmpegInstance = null;

    function isFFmpegAvailable() {
        return typeof SharedArrayBuffer !== 'undefined' && typeof FFmpeg !== 'undefined';
    }

    async function loadFFmpeg() {
        if (ffmpegLoaded) return ffmpegInstance;
        const { createFFmpeg, fetchFile } = FFmpeg;
        ffmpegInstance = createFFmpeg({ log: false });
        await ffmpegInstance.load();
        ffmpegLoaded = true;
        return ffmpegInstance;
    }

    async function convertWithFFmpeg(file, format) {
        try {
            const ffmpeg = await loadFFmpeg();
            const inputName = 'input' + getExtension(file.name);
            const outputName = 'output.' + format;
            ffmpeg.FS('writeFile', inputName, await fetchFile(file));
            const args = ['-i', inputName];
            if (['jpg', 'png'].includes(format)) args.push('-vframes', '1');
            if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'].includes(format)) args.push('-vn');
            if (['mp4', 'webm', 'avi', 'mov'].includes(format)) args.push('-c:v', 'libx264', '-c:a', 'aac');
            args.push(outputName);
            await ffmpeg.run(...args);
            const data = ffmpeg.FS('readFile', outputName);
            const blob = new Blob([data.buffer], { type: getMimeType(format) });
            ffmpeg.FS('unlink', inputName);
            ffmpeg.FS('unlink', outputName);
            downloadFile(blob, file.name.replace(/\.[^.]+$/, '.' + format));
        } catch (e) {
            showError(fileList, 'FFmpeg conversion failed: ' + e.message);
        }
    }

    function convertVideoFallback(file, format) {
        const blob = new Blob([file], { type: `video/${format}` });
        downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
    }

    function convertAudioFallback(file, format) {
        const blob = new Blob([file], { type: `audio/${format}` });
        downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
    }

    async function convert3D(file, format) {
        try {
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                const url = URL.createObjectURL(file);
                const loader = new THREE.GLTFLoader();
                const gltf = await new Promise((resolve, reject) => {
                    loader.load(url, resolve, undefined, reject);
                });
                if (format === 'obj') {
                    const exporter = new THREE.OBJExporter();
                    const objData = exporter.parse(gltf.scene);
                    const blob = new Blob([objData], { type: 'text/plain' });
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, '.obj'));
                } else if (format === 'stl') {
                    const exporter = new THREE.STLExporter();
                    const stlData = exporter.parse(gltf.scene);
                    const blob = new Blob([stlData], { type: 'text/plain' });
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, '.stl'));
                }
                URL.revokeObjectURL(url);
            } else if (file.name.endsWith('.obj')) {
                if (format === 'glb') {
                    showError(fileList, 'OBJ to GLB requires Blender or server-side tool. Use OBJ to STL instead.');
                    return;
                } else if (format === 'stl') {
                    const text = await file.text();
                    const blob = new Blob([text], { type: 'text/plain' });
                    downloadFile(blob, file.name.replace(/\.[^.]+$/, '.stl'));
                }
            } else {
                showError(fileList, 'Unsupported 3D format');
            }
        } catch (e) {
            showError(fileList, '3D conversion failed: ' + e.message);
        }
    }

    async function handleArchive(file, format) {
        if (format === 'zip') {
            if (file.name.endsWith('.zip')) {
                downloadFile(file, file.name);
                return;
            }
            try {
                const archive = await Archive.open(file);
                const extracted = await archive.extractFiles();
                const zip = new JSZip();
                for (const f of extracted) {
                    zip.file(f.name, f.blob);
                }
                const blob = await zip.generateAsync({ type: 'blob' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.zip'));
            } catch (e) {
                showError(fileList, 'Archive extraction failed: ' + e.message);
            }
        }
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
            const blob = new Blob([content], { type: 'text/plain' });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        };
        reader.readAsArrayBuffer(file);
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
                canvasToICO(canvas).then(blob => downloadFile(blob, file.name.replace(/\.[^.]+$/, '.ico')));
            } else if (format === 'bmp') {
                const bmpData = canvasToBMP(canvas);
                const blob = new Blob([bmpData], { type: 'image/bmp' });
                downloadFile(blob, file.name.replace(/\.[^.]+$/, '.bmp'));
            } else {
                const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                canvas.toBlob(blob => downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`)), mimeType);
            }
        };
        img.src = URL.createObjectURL(file);
    }

    async function extractTextFromImage(file) {
        try {
            const result = await Tesseract.recognize(file, 'eng');
            const blob = new Blob([result.data.text], { type: 'text/plain' });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, '.txt'));
        } catch (e) {
            showError(fileList, 'OCR failed: ' + e.message);
        }
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
                    canvas.toBlob(blob => downloadFile(blob, file.name.replace('.pdf', `_page${i}.${format}`)), mimeType);
                }
            }
        } catch (e) {
            showError(fileList, 'PDF conversion failed: ' + e.message);
        }
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
            showError(fileList, 'DOCX conversion failed: ' + e.message);
        }
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
            showError(fileList, 'XLSX conversion failed: ' + e.message);
        }
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
            canvas.toBlob(blob => downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`)), mimeType);
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
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
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
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
            const blob = new Blob(chunks, { type: mimeType });
            downloadFile(blob, file.name.replace(/\.[^.]+$/, `.${format}`));
        };
        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 3000);
    }

    function canvasToICO(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob((pngBlob) => {
                const reader = new FileReader();
                reader.onload = function() {
                    const pngData = new Uint8Array(reader.result);
                    const icoBuffer = new ArrayBuffer(6 + 16 + pngData.length);
                    const view = new DataView(icoBuffer);
                    view.setUint16(0, 0, true);
                    view.setUint16(2, 1, true);
                    view.setUint16(4, 1, true);
                    view.setUint8(6, canvas.width >= 256 ? 0 : canvas.width);
                    view.setUint8(7, canvas.height >= 256 ? 0 : canvas.height);
                    view.setUint8(8, 0);
                    view.setUint8(9, 0);
                    view.setUint16(10, 1, true);
                    view.setUint16(12, 32, true);
                    view.setUint32(14, pngData.length, true);
                    view.setUint32(18, 22, true);
                    new Uint8Array(icoBuffer, 22).set(pngData);
                    resolve(new Blob([icoBuffer], { type: 'image/x-icon' }));
                };
                reader.readAsArrayBuffer(pngBlob);
            }, 'image/png');
        });
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

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    function getExtension(filename) {
        return filename.substring(filename.lastIndexOf('.'));
    }

    function getMimeType(format) {
        const types = {
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'avi': 'video/x-msvideo',
            'mov': 'video/quicktime',
            'gif': 'image/gif',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'aac': 'audio/aac',
            'flac': 'audio/flac',
            'm4a': 'audio/mp4',
            'jpg': 'image/jpeg',
            'png': 'image/png'
        };
        return types[format] || 'application/octet-stream';
    }
});