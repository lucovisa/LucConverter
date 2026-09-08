document.addEventListener('DOMContentLoaded', function() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    let filesWithFormats = [];

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

    async function processFiles(files) {
        fileList.innerHTML = '';
        filesWithFormats = [];
        for (const file of files) {
            const realType = await detectRealType(file);
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.display = 'flex';
            fileItem.style.alignItems = 'center';
            fileItem.style.gap = '0.5rem';
            fileItem.style.flexWrap = 'wrap';

            const fileInfo = document.createElement('span');
            fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})${realType ? ` [${realType.toUpperCase()}]` : ''}`;
            fileInfo.style.flex = '1';
            fileInfo.style.minWidth = '150px';

            const formatSelect = document.createElement('select');
            formatSelect.style.width = 'auto';
            formatSelect.style.minWidth = '120px';
            const formats = getFormats(file, realType);
            formats.forEach(f => {
                const opt = document.createElement('option');
                opt.value = f.toLowerCase();
                opt.textContent = f;
                formatSelect.appendChild(opt);
            });

            filesWithFormats.push({ file, formatSelect, realType });

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(formatSelect);
            fileList.appendChild(fileItem);
        }

        if (filesWithFormats.length > 0) {
            const actionContainer = document.createElement('div');
            actionContainer.style.display = 'flex';
            actionContainer.style.gap = '0.5rem';
            actionContainer.style.marginTop = '1rem';
            actionContainer.style.flexWrap = 'wrap';

            const convertAllBtn = document.createElement('button');
            convertAllBtn.textContent = 'Convert All and Download ZIP';
            convertAllBtn.style.padding = '0.7rem 1.5rem';
            convertAllBtn.style.background = '#2e7d32';
            convertAllBtn.style.color = 'white';
            convertAllBtn.style.border = 'none';
            convertAllBtn.style.borderRadius = '4px';
            convertAllBtn.style.cursor = 'pointer';
            convertAllBtn.addEventListener('click', () => convertAllAndZip());
            actionContainer.appendChild(convertAllBtn);

            const clearBtn = document.createElement('button');
            clearBtn.textContent = 'Clear All';
            clearBtn.style.padding = '0.7rem 1.5rem';
            clearBtn.style.background = '#8B0000';
            clearBtn.style.color = 'white';
            clearBtn.style.border = 'none';
            clearBtn.style.borderRadius = '4px';
            clearBtn.style.cursor = 'pointer';
            clearBtn.addEventListener('click', () => {
                fileList.innerHTML = '';
                filesWithFormats = [];
            });
            actionContainer.appendChild(clearBtn);

            fileList.appendChild(actionContainer);
        }
    }

    async function convertAllAndZip() {
        const zip = new JSZip();
        for (const item of filesWithFormats) {
            const format = item.formatSelect.value;
            const blob = await convertFileToBlob(item.file, format, item.realType);
            if (blob) {
                const newName = item.file.name.replace(/\.[^.]+$/, '.' + format);
                zip.file(newName, blob);
            }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = 'converted_files.zip';
        a.click();
    }

    function convertFileToBlob(file, format, realType) {
        return new Promise((resolve) => {
            const fileType = realType ? getTypeCategory(realType) : file.type.split('/')[0];
            const extension = realType || file.name.split('.').pop().toLowerCase();
            const isImage = fileType === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif'].includes(extension);
            const isVideo = fileType === 'video' || ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'].includes(extension);
            const isAudio = fileType === 'audio' || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'].includes(extension);
            const isFont = ['ttf', 'otf', 'woff', 'woff2'].includes(extension);
            const isArchive = ['zip', 'rar', '7z'].includes(extension);

            if (isImage) {
                if (format === 'txt (ocr)') {
                    extractTextFromImage(file).then(blob => resolve(blob)).catch(() => resolve(null));
                } else {
                    convertImageToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                }
            } else if (isVideo) {
                if (format === 'jpg' || format === 'png') {
                    extractFrameFromVideo(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                } else if (format === 'mp3' || format === 'wav') {
                    extractAudioFromVideo(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                } else if (window.FFmpeg && isFFmpegAvailable()) {
                    convertWithFFmpeg(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                } else {
                    resolve(new Blob([file], { type: `video/${format}` }));
                }
            } else if (isAudio) {
                if (format === 'mp4' || format === 'webm') {
                    audioToVideo(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                } else if (window.FFmpeg && isFFmpegAvailable()) {
                    convertWithFFmpeg(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                } else if (format === 'mp3') {
                    convertAudioToMp3(file).then(blob => resolve(blob)).catch(() => resolve(null));
                } else {
                    resolve(new Blob([file], { type: `audio/${format}` }));
                }
            } else if (isFont) {
                resolve(new Blob([file], { type: 'application/octet-stream' }));
            } else if (extension === 'pdf') {
                convertPDFToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
            } else if (extension === 'html' || extension === 'htm') {
                convertHTMLToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
            } else if (extension === 'docx') {
                convertDOCXToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
            } else if (extension === 'xlsx' || extension === 'xls') {
                convertXLSXToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
            } else if (extension === 'glb' || extension === 'gltf') {
                convert3DToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
            } else if (extension === 'obj') {
                convert3DToBlob(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
            } else if (isArchive) {
                if (format === 'zip') {
                    handleArchive(file, format).then(blob => resolve(blob)).catch(() => resolve(null));
                } else {
                    resolve(new Blob([file], { type: 'text/plain' }));
                }
            } else {
                if (format === 'zip') {
                    convertToZip(file).then(blob => resolve(blob)).catch(() => resolve(null));
                } else {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        resolve(new Blob([e.target.result], { type: 'text/plain' }));
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsArrayBuffer(file);
                }
            }
        });
    }

    async function detectRealType(file) {
        const buffer = await file.slice(0, 64).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        if (bytes.length < 4) return null;
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
        if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'jpg';
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'gif';
        if (bytes[0] === 0x42 && bytes[1] === 0x4D) return 'bmp';
        if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01 && bytes[3] === 0x00) return 'ico';
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
            if (bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
            if (bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) return 'wav';
            if (bytes[8] === 0x41 && bytes[9] === 0x56 && bytes[10] === 0x49 && bytes[11] === 0x20) return 'avi';
        }
        if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf';
        if (bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) return 'zip';
        if (bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21) return 'rar';
        if (bytes[0] === 0x37 && bytes[1] === 0x7A && bytes[2] === 0xBC && bytes[3] === 0xAF && bytes[4] === 0x27 && bytes[5] === 0x1C) return '7z';
        if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'ogg';
        if (bytes[0] === 0x66 && bytes[1] === 0x4C && bytes[2] === 0x61 && bytes[3] === 0x43) return 'flac';
        if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x00 && bytes[3] === 0x18 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
            if (bytes[8] === 0x4D && bytes[9] === 0x34 && bytes[10] === 0x41) return 'm4a';
            if (bytes[8] === 0x69 && bytes[9] === 0x73 && bytes[10] === 0x6F && bytes[11] === 0x6D) return 'mp4';
        }
        if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return 'mkv';
        if (bytes[0] === 0x46 && bytes[1] === 0x4C && bytes[2] === 0x56 && bytes[3] === 0x01) return 'flv';
        if (bytes[0] === 0x30 && bytes[1] === 0x26 && bytes[2] === 0xB2 && bytes[3] === 0x75) return 'wmv';
        if (bytes[0] === 0x67 && bytes[1] === 0x6C && bytes[2] === 0x54 && bytes[3] === 0x46) return 'glb';
        if (bytes[0] === 0x7B && bytes[1] === 0x22 && bytes[2] === 0x61 && bytes[3] === 0x73 && bytes[4] === 0x73 && bytes[5] === 0x65 && bytes[6] === 0x74 && bytes[7] === 0x73) return 'gltf';
        if (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00 && bytes[4] === 0x00) return 'ttf';
        if (bytes[0] === 0x4F && bytes[1] === 0x54 && bytes[2] === 0x54 && bytes[3] === 0x4F) return 'otf';
        if (bytes[0] === 0x77 && bytes[1] === 0x4F && bytes[2] === 0x46 && bytes[3] === 0x46) return 'woff';
        if (bytes[0] === 0x77 && bytes[1] === 0x4F && bytes[2] === 0x46 && bytes[3] === 0x32) return 'woff2';
        return null;
    }

    function getFormats(file, realType) {
        const fileType = file.type.split('/')[0];
        const extension = realType || file.name.split('.').pop().toLowerCase();
        if (fileType === 'image' || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif'].includes(extension)) {
            return ['PNG', 'JPG', 'WebP', 'SVG', 'BMP', 'ICO', 'TXT (OCR)'];
        }
        if (fileType === 'video' || ['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'].includes(extension)) {
            return ['MP4', 'AVI', 'MOV', 'GIF', 'WebM', 'MP3', 'WAV', 'JPG', 'PNG'];
        }
        if (fileType === 'audio' || ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'].includes(extension)) {
            return ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A', 'MP4', 'WebM'];
        }
        if (['ttf', 'otf', 'woff', 'woff2'].includes(extension)) {
            return ['TTF', 'OTF', 'WOFF', 'WOFF2'];
        }
        if (extension === 'pdf') return ['TXT', 'HTML', 'JPG', 'PNG'];
        if (extension === 'html' || extension === 'htm') return ['TXT', 'Markdown', 'PDF'];
        if (extension === 'docx') return ['TXT', 'HTML', 'PDF'];
        if (extension === 'xlsx' || extension === 'xls') return ['CSV', 'JSON', 'HTML'];
        if (extension === 'glb' || extension === 'gltf') return ['OBJ', 'STL'];
        if (extension === 'obj') return ['STL'];
        if (extension === 'zip' || extension === 'rar' || extension === '7z') return ['ZIP'];
        return ['ZIP', 'TXT', 'HTML', 'JSON', 'XML', 'CSV'];
    }

    function getTypeCategory(realType) {
        if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'bmp', 'ico', 'gif'].includes(realType)) return 'image';
        if (['mp4', 'webm', 'avi', 'mov', 'gif', 'mkv', 'flv', 'wmv'].includes(realType)) return 'video';
        if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'opus', 'wma'].includes(realType)) return 'audio';
        if (['ttf', 'otf', 'woff', 'woff2'].includes(realType)) return 'font';
        return 'other';
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
        return blob;
    }

    async function convertAudioToMp3(file) {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        const samples = new Int16Array(audioBuffer.length * channels);
        let offset = 0;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < channels; channel++) {
                const sample = audioBuffer.getChannelData(channel)[i];
                const clamped = Math.max(-1, Math.min(1, sample));
                samples[offset++] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
            }
        }
        const mp3Data = mp3encoder.encodeBuffer(samples);
        const endData = mp3encoder.flush();
        return new Blob([mp3Data, endData], { type: 'audio/mp3' });
    }

    function convertImageToBlob(file, format) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                if (format === 'svg') {
                    const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}"><image href="${img.src}" width="${img.width}" height="${img.height}"/></svg>`;
                    resolve(new Blob([svgData], { type: 'image/svg+xml' }));
                } else if (format === 'ico') {
                    canvasToICO(canvas).then(blob => resolve(blob));
                } else if (format === 'bmp') {
                    resolve(new Blob([canvasToBMP(canvas)], { type: 'image/bmp' }));
                } else {
                    const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
                    canvas.toBlob(blob => resolve(blob), mimeType);
                }
            };
            img.onerror = () => resolve(null);
            img.src = URL.createObjectURL(file);
        });
    }

    async function extractTextFromImage(file) {
        const result = await Tesseract.recognize(file, 'eng');
        return new Blob([result.data.text], { type: 'text/plain' });
    }

    function extractFrameFromVideo(file, format) {
        return new Promise((resolve) => {
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
                canvas.toBlob(blob => resolve(blob), mimeType);
                video.src = '';
            };
            video.onerror = () => resolve(null);
        });
    }

    function extractAudioFromVideo(file, format) {
        return new Promise((resolve) => {
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
                    resolve(new Blob(chunks, { type: mimeType }));
                };
                mediaRecorder.start();
                video.play();
                setTimeout(() => {
                    mediaRecorder.stop();
                    video.pause();
                    source.disconnect();
                    audioContext.close();
                }, 5000);
            };
            video.onerror = () => resolve(null);
        });
    }

    function audioToVideo(file, format) {
        return new Promise((resolve) => {
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
                resolve(new Blob(chunks, { type: mimeType }));
            };
            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 3000);
        });
    }

    function convertPDFToBlob(file, format) {
        return new Promise(async (resolve) => {
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
                    resolve(new Blob([text], { type: 'text/plain' }));
                } else if (format === 'html') {
                    let html = '<html><body>';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const strings = content.items.map(item => item.str);
                        html += `<p>${strings.join(' ')}</p>`;
                    }
                    html += '</body></html>';
                    resolve(new Blob([html], { type: 'text/html' }));
                } else if (format === 'jpg' || format === 'png') {
                    const page = await pdf.getPage(1);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');
                    await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
                    canvas.toBlob(blob => resolve(blob), mimeType);
                }
            } catch (e) {
                resolve(null);
            }
        });
    }

    function convertHTMLToBlob(file, format) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const htmlContent = e.target.result;
                if (format === 'txt') {
                    const textContent = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    resolve(new Blob([textContent], { type: 'text/plain' }));
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
                    resolve(new Blob([md], { type: 'text/markdown' }));
                } else if (format === 'pdf') {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    const textContent = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    doc.text(textContent, 10, 10);
                    resolve(doc.output('blob'));
                }
            };
            reader.onerror = () => resolve(null);
            reader.readAsText(file);
        });
    }

    function convertDOCXToBlob(file, format) {
        return new Promise(async (resolve) => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                const html = result.value;
                if (format === 'txt') {
                    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    resolve(new Blob([text], { type: 'text/plain' }));
                } else if (format === 'html') {
                    resolve(new Blob([html], { type: 'text/html' }));
                } else if (format === 'pdf') {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    doc.text(text, 10, 10);
                    resolve(doc.output('blob'));
                }
            } catch (e) {
                resolve(null);
            }
        });
    }

    function convertXLSXToBlob(file, format) {
        return new Promise(async (resolve) => {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                if (format === 'csv') {
                    const csv = XLSX.utils.sheet_to_csv(firstSheet);
                    resolve(new Blob([csv], { type: 'text/csv' }));
                } else if (format === 'json') {
                    const json = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }));
                } else if (format === 'html') {
                    const html = XLSX.utils.sheet_to_html(firstSheet);
                    resolve(new Blob([html], { type: 'text/html' }));
                }
            } catch (e) {
                resolve(null);
            }
        });
    }

    function convert3DToBlob(file, format) {
        return new Promise(async (resolve) => {
            try {
                if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                    const url = URL.createObjectURL(file);
                    const loader = new THREE.GLTFLoader();
                    const gltf = await new Promise((res, rej) => {
                        loader.load(url, res, undefined, rej);
                    });
                    if (format === 'obj') {
                        const exporter = new THREE.OBJExporter();
                        resolve(new Blob([exporter.parse(gltf.scene)], { type: 'text/plain' }));
                    } else if (format === 'stl') {
                        const exporter = new THREE.STLExporter();
                        resolve(new Blob([exporter.parse(gltf.scene)], { type: 'text/plain' }));
                    }
                    URL.revokeObjectURL(url);
                } else if (file.name.endsWith('.obj')) {
                    if (format === 'stl') {
                        const text = await file.text();
                        resolve(new Blob([text], { type: 'text/plain' }));
                    } else {
                        resolve(null);
                    }
                }
            } catch (e) {
                resolve(null);
            }
        });
    }

    async function handleArchive(file, format) {
        if (format === 'zip') {
            if (file.name.endsWith('.zip')) {
                return file;
            }
            try {
                const archive = await Archive.open(file);
                const extracted = await archive.extractFiles();
                const zip = new JSZip();
                for (const f of extracted) {
                    zip.file(f.name, f.blob);
                }
                return await zip.generateAsync({ type: 'blob' });
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    async function convertToZip(file) {
        const zip = new JSZip();
        zip.file(file.name, file);
        return await zip.generateAsync({ type: 'blob' });
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
            'png': 'image/png',
            'ttf': 'font/ttf',
            'otf': 'font/otf',
            'woff': 'font/woff',
            'woff2': 'font/woff2'
        };
        return types[format] || 'application/octet-stream';
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
});