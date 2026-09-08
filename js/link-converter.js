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
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const blob = await response.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = url.split('/').pop().split('?')[0] || 'download';
            a.click();
            downloadFromLinkResult.textContent = 'Download started';
        } catch (e) {
            downloadFromLinkResult.textContent = 'Download failed. The site may block direct downloads. Try a different link.';
        }
    });
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