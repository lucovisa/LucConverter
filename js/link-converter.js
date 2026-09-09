document.addEventListener('DOMContentLoaded', function() {
    initLinkConverter();
});

function initLinkConverter() {
    const qrInput = document.querySelector('#qrConverter input[type="text"]');
    const qrBtn = document.querySelector('#qrConverter button');
    const qrCode = document.getElementById('qrCode');

    qrBtn.addEventListener('click', () => {
        const text = qrInput.value.trim();
        if (!text) { showError(qrInput, 'Please enter text or URL'); return; }
        if (text.length > 100) {
            showError(qrInput, 'Too many characters. Download as .txt or .zip instead.');
            const container = document.createElement('div');
            container.style.marginTop = '0.5rem';
            const txtBtn = document.createElement('button');
            txtBtn.textContent = 'Download .txt';
            txtBtn.style.marginRight = '0.5rem';
            txtBtn.style.padding = '0.5rem 1rem';
            txtBtn.style.background = 'var(--button-bg)';
            txtBtn.style.color = 'white';
            txtBtn.style.border = 'none';
            txtBtn.style.borderRadius = '4px';
            txtBtn.style.cursor = 'pointer';
            txtBtn.addEventListener('click', () => {
                const blob = new Blob([text], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'text.txt';
                a.click();
            });
            const zipBtn = document.createElement('button');
            zipBtn.textContent = 'Download .zip';
            zipBtn.style.padding = '0.5rem 1rem';
            zipBtn.style.background = 'var(--button-bg)';
            zipBtn.style.color = 'white';
            zipBtn.style.border = 'none';
            zipBtn.style.borderRadius = '4px';
            zipBtn.style.cursor = 'pointer';
            zipBtn.addEventListener('click', async () => {
                const zip = new JSZip();
                zip.file('text.txt', text);
                const blob = await zip.generateAsync({ type: 'blob' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'text.zip';
                a.click();
            });
            container.appendChild(txtBtn);
            container.appendChild(zipBtn);
            qrInput.parentElement.appendChild(container);
            setTimeout(() => container.remove(), 5000);
            return;
        }
        qrCode.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            const qrContainer = document.createElement('div');
            qrCode.appendChild(qrContainer);
            new QRCode(qrContainer, {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
            const canvas = qrContainer.querySelector('canvas');
            const img = qrContainer.querySelector('img');
            if (canvas) {
                addQRDownload(canvas, text);
            } else if (img) {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = 200;
                tempCanvas.height = 200;
                const ctx = tempCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                addQRDownload(tempCanvas, text);
            }
        } else {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 200, 200);
            ctx.fillStyle = 'black';
            const data = generateQRData(text);
            const cell = 200 / 25;
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i].length; j++) {
                    if (data[i][j]) ctx.fillRect(j * cell, i * cell, cell, cell);
                }
            }
            qrCode.appendChild(canvas);
            addQRDownload(canvas, text);
        }
    });

    function addQRDownload(canvas, text) {
        const btn = document.createElement('button');
        btn.textContent = 'Download QR Code';
        btn.style.marginTop = '0.5rem';
        btn.style.padding = '0.5rem 1rem';
        btn.style.background = 'var(--button-bg)';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = 'qr-code.png';
            a.click();
        });
        qrCode.appendChild(btn);
        qrCode.dataset.text = text;
    }

    const qrDropZone = document.getElementById('qrDropZone');
    const qrImageInput = document.getElementById('qrImageInput');
    const qrScanBtn = document.querySelector('#qrScanner button');
    const qrScanResult = document.querySelector('#qrScanner .result-display');

    qrDropZone.addEventListener('click', () => qrImageInput.click());
    qrDropZone.addEventListener('dragover', (e) => { e.preventDefault(); qrDropZone.classList.add('drag-over'); });
    qrDropZone.addEventListener('dragleave', () => qrDropZone.classList.remove('drag-over'));
    qrDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        qrDropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            qrImageInput.files = e.dataTransfer.files;
            scanQR(e.dataTransfer.files[0]);
        }
    });
    qrImageInput.addEventListener('change', function() {
        if (this.files.length) scanQR(this.files[0]);
    });
    qrScanBtn.addEventListener('click', () => {
        if (qrImageInput.files.length) scanQR(qrImageInput.files[0]);
        else if (qrCode.dataset.text) qrScanResult.textContent = `Decoded: ${qrCode.dataset.text}`;
        else showError(qrImageInput, 'Please select an image with QR code');
    });

    function scanQR(file) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                qrScanResult.textContent = code && code.data ? `Decoded: ${code.data}` : 'No QR code found.';
            } else {
                qrScanResult.textContent = 'QR scanner library not loaded';
            }
        };
        img.src = URL.createObjectURL(file);
    }

    const urlTextarea = document.querySelector('#urlConverter textarea');
    const urlResult = document.getElementById('urlResult');
    const encodeBtn = document.querySelector('#urlConverter .button-group button:first-child');
    const decodeBtn = document.querySelector('#urlConverter .button-group button:last-child');
    encodeBtn.addEventListener('click', () => {
        if (!urlTextarea.value.trim()) { showError(urlTextarea, 'Please enter text to encode'); return; }
        urlResult.value = encodeURIComponent(urlTextarea.value);
    });
    decodeBtn.addEventListener('click', () => {
        if (!urlTextarea.value.trim()) { showError(urlTextarea, 'Please enter text to decode'); return; }
        try { urlResult.value = decodeURIComponent(urlTextarea.value); } catch (e) { showError(urlTextarea, 'Invalid encoded text'); }
    });

    const shortInput = document.querySelector('#linkShortener input');
    const shortBtn = document.querySelector('#linkShortener button');
    const shortResult = document.querySelector('#linkShortener .result-display');
    shortBtn.addEventListener('click', () => {
        const url = shortInput.value.trim();
        if (!url.startsWith('http')) { showError(shortInput, 'Please enter a valid URL'); return; }
        const code = generateRandomString(6);
        shortResult.textContent = `https://luc.tiny/${code}`;
    });

    const lengthenInput = document.querySelector('#linkLengthener input');
    const lengthenBtn = document.querySelector('#linkLengthener button');
    const lengthenResult = document.querySelector('#linkLengthener .result-display');
    lengthenBtn.addEventListener('click', () => {
        const url = lengthenInput.value.trim();
        if (!url) { showError(lengthenInput, 'Please enter a URL'); return; }
        const params = '?utm_source=lengthener&utm_medium=link&utm_campaign=luc_converter&ref=' + generateRandomString(20);
        lengthenResult.textContent = url + params;
    });

    const passLengthInput = document.querySelector('#passwordGenerator input[type="number"]');
    const passBtn = document.querySelector('#passwordGenerator button');
    const passResult = document.querySelector('#passwordGenerator .result-display');
    const useUppercase = document.getElementById('useUppercase');
    const useLowercase = document.getElementById('useLowercase');
    const useNumbers = document.getElementById('useNumbers');
    const useSymbols = document.getElementById('useSymbols');
    passBtn.addEventListener('click', () => {
        const length = parseInt(passLengthInput.value);
        if (!length || length < 4) { showError(passLengthInput, 'Length must be at least 4'); return; }
        let charset = '';
        if (useUppercase.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLowercase.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useNumbers.checked) charset += '0123456789';
        if (useSymbols.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (!charset) { showError(passLengthInput, 'Select at least one character type'); return; }
        let password = '';
        for (let i = 0; i < length; i++) password += charset[Math.floor(Math.random() * charset.length)];
        passResult.textContent = password;
    });

    const minInput = document.querySelector('#randomNumber input:first-of-type');
    const maxInput = document.querySelector('#randomNumber input:last-of-type');
    const randomBtn = document.querySelector('#randomNumber button');
    const randomResult = document.querySelector('#randomNumber .result-display');
    randomBtn.addEventListener('click', () => {
        const min = parseInt(minInput.value);
        const max = parseInt(maxInput.value);
        if (isNaN(min) || isNaN(max) || min >= max) { showError(minInput, 'Min must be less than max'); return; }
        randomResult.textContent = `Random number: ${Math.floor(Math.random() * (max - min + 1)) + min}`;
    });

    const hashInput = document.querySelector('#hashGenerator input');
    const hashSelect = document.querySelector('#hashGenerator select');
    const hashBtn = document.querySelector('#hashGenerator button');
    const hashResult = document.querySelector('#hashGenerator .result-display');
    hashBtn.addEventListener('click', async () => {
        const text = hashInput.value.trim();
        if (!text) { showError(hashInput, 'Please enter text to hash'); return; }
        const algo = { sha1: 'SHA-1', sha256: 'SHA-256', sha512: 'SHA-512' }[hashSelect.value];
        const data = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest(algo, data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        hashResult.textContent = `${hashSelect.value.toUpperCase()}: ${hashHex}`;
    });

    const textToBinaryTextarea = document.querySelector('#textToBinary textarea');
    const textToBinaryBtn = document.querySelector('#textToBinary button');
    const textToBinaryResult = document.querySelector('#textToBinary .result-display');
    textToBinaryBtn.addEventListener('click', () => {
        const text = textToBinaryTextarea.value.trim();
        if (!text) { showError(textToBinaryTextarea, 'Please enter text'); return; }
        textToBinaryResult.textContent = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    });

    const asciiTextarea = document.querySelector('#asciiConverter textarea');
    const asciiBtn = document.querySelector('#asciiConverter button');
    const asciiResult = document.querySelector('#asciiConverter .result-display');
    asciiBtn.addEventListener('click', () => {
        const text = asciiTextarea.value.trim();
        if (!text) { showError(asciiTextarea, 'Please enter text'); return; }
        asciiResult.textContent = text.split('').map(c => c.charCodeAt(0)).join(' ');
    });

    const downloadFromLinkInput = document.querySelector('#downloadFromLink input');
    const downloadFromLinkBtn = document.querySelector('#downloadFromLink button');
    const downloadFromLinkResult = document.querySelector('#downloadFromLink .result-display');
    downloadFromLinkBtn.addEventListener('click', async () => {
        const url = downloadFromLinkInput.value.trim();
        if (!url) { showError(downloadFromLinkInput, 'Please enter a link'); return; }
        downloadFromLinkResult.textContent = 'Trying to fetch...';
        try {
            const apiUrl = 'https://api.cobalt.tools/api/json';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: url })
            });
            if (!response.ok) throw new Error('API error');
            const data = await response.json();
            if (data.status === 'success' && data.url) {
                const a = document.createElement('a');
                a.href = data.url;
                a.target = '_blank';
                a.textContent = 'Download link ready. Click here to download.';
                downloadFromLinkResult.textContent = '';
                downloadFromLinkResult.appendChild(a);
                a.click();
            } else if (data.status === 'error') {
                downloadFromLinkResult.textContent = 'Error: ' + (data.text || 'Unknown error');
            } else {
                downloadFromLinkResult.textContent = 'Download failed. Try a different link.';
            }
        } catch (e) {
            downloadFromLinkResult.textContent = 'Download failed. The service may be unavailable.';
        }
    });

    const qrWithLogoInput = document.querySelector('#qrLogoConverter input[type="text"]');
    const qrLogoFileInput = document.querySelector('#qrLogoConverter input[type="file"]');
    const qrLogoBtn = document.querySelector('#qrLogoConverter button');
    const qrLogoResult = document.getElementById('qrLogoResult');
    qrLogoBtn.addEventListener('click', () => {
        const text = qrWithLogoInput.value.trim();
        if (!text) { showError(qrWithLogoInput, 'Please enter text or URL'); return; }
        if (typeof QRCode !== 'undefined') {
            const container = document.createElement('div');
            qrLogoResult.innerHTML = '';
            qrLogoResult.appendChild(container);
            new QRCode(container, {
                text: text,
                width: 300,
                height: 300,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
            if (qrLogoFileInput.files.length > 0) {
                const logoFile = qrLogoFileInput.files[0];
                const logoImg = new Image();
                logoImg.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = 300;
                    canvas.height = 300;
                    const ctx = canvas.getContext('2d');
                    const qrCanvas = container.querySelector('canvas');
                    if (qrCanvas) {
                        ctx.drawImage(qrCanvas, 0, 0, 300, 300);
                    } else {
                        const qrImg = container.querySelector('img');
                        if (qrImg) {
                            ctx.drawImage(qrImg, 0, 0, 300, 300);
                        }
                    }
                    const logoSize = 60;
                    const logoX = (300 - logoSize) / 2;
                    const logoY = (300 - logoSize) / 2;
                    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                    const downloadBtn = document.createElement('button');
                    downloadBtn.textContent = 'Download QR with Logo';
                    downloadBtn.style.marginTop = '0.5rem';
                    downloadBtn.style.padding = '0.5rem 1rem';
                    downloadBtn.style.background = 'var(--button-bg)';
                    downloadBtn.style.color = 'white';
                    downloadBtn.style.border = 'none';
                    downloadBtn.style.borderRadius = '4px';
                    downloadBtn.style.cursor = 'pointer';
                    downloadBtn.addEventListener('click', () => {
                        const a = document.createElement('a');
                        a.href = canvas.toDataURL('image/png');
                        a.download = 'qr-with-logo.png';
                        a.click();
                    });
                    qrLogoResult.appendChild(canvas);
                    qrLogoResult.appendChild(downloadBtn);
                };
                logoImg.src = URL.createObjectURL(logoFile);
            }
        } else {
            showError(qrLogoBtn, 'QR library not loaded');
        }
    });

    initUploadFile();
}

function initUploadFile() {
    const uploadFileInput = document.createElement('input');
    uploadFileInput.type = 'file';
    uploadFileInput.style.display = 'none';
    document.body.appendChild(uploadFileInput);

    const uploadBtn = document.createElement('button');
    uploadBtn.textContent = 'Upload File';
    uploadBtn.style.padding = '0.7rem 1.3rem';
    uploadBtn.style.background = 'var(--button-bg)';
    uploadBtn.style.color = 'var(--button-text)';
    uploadBtn.style.border = 'none';
    uploadBtn.style.borderRadius = '4px';
    uploadBtn.style.cursor = 'pointer';
    uploadBtn.style.fontSize = '0.9rem';

    const uploadResult = document.createElement('div');
    uploadResult.className = 'result-display';
    uploadResult.style.marginTop = '1rem';
    uploadResult.style.wordBreak = 'break-all';

    const uploadContainer = document.createElement('div');
    uploadContainer.style.marginTop = '2rem';
    uploadContainer.style.padding = '1.5rem';
    uploadContainer.style.background = 'var(--panel-bg)';
    uploadContainer.style.border = '1px solid var(--border)';
    uploadContainer.style.borderRadius = '4px';

    const uploadTitle = document.createElement('h3');
    uploadTitle.textContent = 'Upload File';
    uploadTitle.style.color = 'var(--accent)';
    uploadTitle.style.marginBottom = '1rem';

    const durationLabel = document.createElement('label');
    durationLabel.textContent = 'Storage time (minutes): ';
    durationLabel.style.color = 'var(--text)';
    durationLabel.style.fontSize = '0.9rem';
    durationLabel.style.marginRight = '0.5rem';

    const durationSelect = document.createElement('select');
    durationSelect.style.padding = '0.5rem';
    durationSelect.style.background = 'var(--bg)';
    durationSelect.style.border = '1px solid var(--border)';
    durationSelect.style.borderRadius = '4px';
    durationSelect.style.color = 'var(--text)';
    durationSelect.style.marginRight = '1rem';

    for (let i = 1; i <= 60; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${i} min`;
        durationSelect.appendChild(opt);
    }

    const downloadsLabel = document.createElement('label');
    downloadsLabel.textContent = 'Max downloads: ';
    downloadsLabel.style.color = 'var(--text)';
    downloadsLabel.style.fontSize = '0.9rem';
    downloadsLabel.style.marginRight = '0.5rem';

    const downloadsSelect = document.createElement('select');
    downloadsSelect.style.padding = '0.5rem';
    downloadsSelect.style.background = 'var(--bg)';
    downloadsSelect.style.border = '1px solid var(--border)';
    downloadsSelect.style.borderRadius = '4px';
    downloadsSelect.style.color = 'var(--text)';
    downloadsSelect.style.marginRight = '1rem';

    for (let i = 1; i <= 100; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        downloadsSelect.appendChild(opt);
    }

    const optionsRow = document.createElement('div');
    optionsRow.style.display = 'flex';
    optionsRow.style.alignItems = 'center';
    optionsRow.style.flexWrap = 'wrap';
    optionsRow.style.gap = '0.5rem';
    optionsRow.style.marginBottom = '1rem';

    optionsRow.appendChild(durationLabel);
    optionsRow.appendChild(durationSelect);
    optionsRow.appendChild(downloadsLabel);
    optionsRow.appendChild(downloadsSelect);

    uploadBtn.addEventListener('click', () => uploadFileInput.click());

    uploadFileInput.addEventListener('change', async () => {
        if (!uploadFileInput.files.length) return;
        
        const file = uploadFileInput.files[0];
        
        if (file.size > 50 * 1024 * 1024) {
            uploadResult.textContent = '❌ File too large. Maximum 50MB.';
            uploadResult.style.color = 'var(--error-text)';
            return;
        }
        
        uploadBtn.textContent = 'Uploading...';
        uploadBtn.disabled = true;
        
        const uniqueId = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const duration = durationSelect.value;
        const maxDownloads = downloadsSelect.value;
        
        const formData = new FormData();
        formData.append('chat_id', '7072200354');
        formData.append('document', file);
        formData.append('caption', `upload|${uniqueId}|upload|${duration}|${maxDownloads}`);
        
        try {
            const response = await fetch('https://api.telegram.org/bot8933081113:AAFBexwnw8B2V_BuZaNKv-TxMyqe4n1YU_U/sendDocument', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.ok) {
                for (let i = 0; i < 60; i++) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    const statusResponse = await fetch(`https://converter-ashy-kappa.vercel.app/api/status/${uniqueId}`);
                    const statusResult = await statusResponse.json();
                    
                    if (statusResult.status === 'ready') {
                        uploadResult.textContent = '';
                        uploadResult.style.color = 'var(--success-text)';
                        
                        const link = document.createElement('a');
                        link.href = statusResult.download_url;
                        link.textContent = '📥 View/Download File';
                        link.style.display = 'inline-block';
                        link.style.padding = '0.7rem 1.3rem';
                        link.style.background = 'var(--button-bg)';
                        link.style.color = 'var(--button-text)';
                        link.style.borderRadius = '4px';
                        link.style.textDecoration = 'none';
                        link.style.fontSize = '0.9rem';
                        link.style.marginTop = '0.5rem';
                        
                        uploadResult.appendChild(link);
                        break;
                    }
                }
            } else {
                uploadResult.textContent = '❌ Upload failed';
                uploadResult.style.color = 'var(--error-text)';
            }
        } catch (e) {
            uploadResult.textContent = '❌ Network error';
            uploadResult.style.color = 'var(--error-text)';
        }
        
        uploadBtn.textContent = 'Upload File';
        uploadBtn.disabled = false;
        uploadFileInput.value = '';
    });

    uploadContainer.appendChild(uploadTitle);
    uploadContainer.appendChild(optionsRow);
    uploadContainer.appendChild(uploadBtn);
    uploadContainer.appendChild(uploadResult);

    const downloadFromLinkSection = document.getElementById('downloadFromLink');
    downloadFromLinkSection.parentElement.appendChild(uploadContainer);
}

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function generateQRData(text) {
    const size = 25;
    const qrData = [];
    for (let i = 0; i < size; i++) {
        qrData[i] = [];
        for (let j = 0; j < size; j++) qrData[i][j] = 0;
    }
    const hash = simpleHash(text);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const value = (hash * (i + 1) * (j + 1)) % 100;
            qrData[i][j] = value > 50 ? 1 : 0;
        }
    }
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
            qrData[i][j] = 1;
            qrData[size - 1 - i][j] = 1;
            qrData[i][size - 1 - j] = 1;
        }
    }
    for (let i = 2; i < 5; i++) {
        for (let j = 2; j < 5; j++) {
            qrData[i][j] = 0;
            qrData[size - 1 - i][j] = 0;
            qrData[i][size - 1 - j] = 0;
        }
    }
    return qrData;
}

function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}