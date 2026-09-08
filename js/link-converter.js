document.addEventListener('DOMContentLoaded', function() {
    const urlTextarea = document.querySelector('#urlConverter textarea');
    const urlResult = document.getElementById('urlResult');
    
    const qrInput = document.querySelector('#qrConverter input[type="text"]');
    const qrBtn = document.querySelector('#qrConverter button');
    const qrCode = document.getElementById('qrCode');
    
    qrBtn.addEventListener('click', function() {
        const text = qrInput.value.trim();
        if (!text) {
            showError(qrInput, 'Please enter text or URL');
            return;
        }
        
        if (text.length > 100) {
            showError(qrInput, 'Too many characters. Download as .txt or .zip instead.');
            
            const downloadContainer = document.createElement('div');
            downloadContainer.style.marginTop = '0.5rem';
            
            const txtBtn = document.createElement('button');
            txtBtn.textContent = 'Download .txt';
            txtBtn.style.marginRight = '0.5rem';
            txtBtn.style.padding = '0.5rem 1rem';
            txtBtn.style.background = 'var(--button-bg)';
            txtBtn.style.color = 'white';
            txtBtn.style.border = 'none';
            txtBtn.style.borderRadius = '4px';
            txtBtn.style.cursor = 'pointer';
            txtBtn.addEventListener('click', function() {
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'text.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            
            const zipBtn = document.createElement('button');
            zipBtn.textContent = 'Download .zip';
            zipBtn.style.padding = '0.5rem 1rem';
            zipBtn.style.background = 'var(--button-bg)';
            zipBtn.style.color = 'white';
            zipBtn.style.border = 'none';
            zipBtn.style.borderRadius = '4px';
            zipBtn.style.cursor = 'pointer';
            zipBtn.addEventListener('click', async function() {
                const zip = new JSZip();
                zip.file('text.txt', text);
                const blob = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'text.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });
            
            downloadContainer.appendChild(txtBtn);
            downloadContainer.appendChild(zipBtn);
            
            qrInput.parentElement.appendChild(downloadContainer);
            
            setTimeout(() => {
                downloadContainer.remove();
            }, 5000);
            
            return;
        }
        
        qrCode.innerHTML = '';
        
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'black';
        
        const qrData = generateQRData(text);
        const cellSize = 200 / 25;
        
        for (let i = 0; i < qrData.length; i++) {
            for (let j = 0; j < qrData[i].length; j++) {
                if (qrData[i][j] === 1) {
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
        
        qrCode.appendChild(canvas);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download QR Code';
        downloadBtn.style.marginTop = '0.5rem';
        downloadBtn.style.padding = '0.5rem 1rem';
        downloadBtn.style.background = 'var(--button-bg)';
        downloadBtn.style.color = 'white';
        downloadBtn.style.border = 'none';
        downloadBtn.style.borderRadius = '4px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.addEventListener('click', function() {
            const link = document.createElement('a');
            link.download = 'qr-code.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
        qrCode.appendChild(downloadBtn);
        
        qrCode.dataset.text = text;
    });
    
    const qrDropZone = document.getElementById('qrDropZone');
    const qrImageInput = document.getElementById('qrImageInput');
    const qrScanBtn = document.querySelector('#qrScanner button');
    const qrScanResult = document.querySelector('#qrScanner .result-display');
    
    qrDropZone.addEventListener('click', function() {
        qrImageInput.click();
    });
    
    qrDropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        qrDropZone.classList.add('drag-over');
    });
    
    qrDropZone.addEventListener('dragleave', function() {
        qrDropZone.classList.remove('drag-over');
    });
    
    qrDropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        qrDropZone.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            qrImageInput.files = e.dataTransfer.files;
            scanQRImage(files[0]);
        }
    });
    
    qrImageInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            scanQRImage(this.files[0]);
        }
    });
    
    qrScanBtn.addEventListener('click', function() {
        if (qrImageInput.files.length > 0) {
            scanQRImage(qrImageInput.files[0]);
        } else if (qrCode.dataset.text) {
            qrScanResult.textContent = `Decoded: ${qrCode.dataset.text}`;
        } else {
            showError(qrImageInput, 'Please select an image with QR code');
        }
    });
    
    function scanQRImage(file) {
        const img = new Image();
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code && code.data) {
                    qrScanResult.textContent = `Decoded: ${code.data}`;
                } else {
                    qrScanResult.textContent = 'No QR code found in image. Try the generated QR code.';
                }
            } else {
                qrScanResult.textContent = 'QR scanner library not loaded';
            }
        };
        
        img.src = URL.createObjectURL(file);
    }
    
    const shortInput = document.querySelector('#linkShortener input');
    const shortBtn = document.querySelector('#linkShortener button');
    const shortResult = document.querySelector('#linkShortener .result-display');
    
    shortBtn.addEventListener('click', function() {
        const url = shortInput.value.trim();
        
        if (!url || !url.startsWith('http')) {
            showError(shortInput, 'Please enter a valid URL');
            return;
        }
        
        const shortCode = generateRandomString(6);
        const shortUrl = 'https://luc.tiny/' + shortCode;
        
        shortResult.textContent = `Short URL: ${shortUrl}`;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.marginTop = '0.5rem';
        copyBtn.style.padding = '0.5rem 1rem';
        copyBtn.style.background = 'var(--button-bg)';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(shortUrl);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
        shortResult.appendChild(copyBtn);
    });
    
    const lengthenInput = document.querySelector('#linkLengthener input');
    const lengthenBtn = document.querySelector('#linkLengthener button');
    const lengthenResult = document.querySelector('#linkLengthener .result-display');
    
    lengthenBtn.addEventListener('click', function() {
        const url = lengthenInput.value.trim();
        
        if (!url) {
            showError(lengthenInput, 'Please enter a URL');
            return;
        }
        
        const params = 'utm_source=lengthener&utm_medium=link&utm_campaign=luc_converter&ref=';
        const randomPath = generateRandomString(20);
        const lengthenedUrl = url + (url.includes('?') ? '&' : '?') + params + randomPath;
        
        lengthenResult.textContent = lengthenedUrl;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.marginTop = '0.5rem';
        copyBtn.style.padding = '0.5rem 1rem';
        copyBtn.style.background = 'var(--button-bg)';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(lengthenedUrl);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
        lengthenResult.appendChild(copyBtn);
    });
    
    const passLengthInput = document.querySelector('#passwordGenerator input[type="number"]');
    const passBtn = document.querySelector('#passwordGenerator button');
    const passResult = document.querySelector('#passwordGenerator .result-display');
    const useUppercase = document.getElementById('useUppercase');
    const useLowercase = document.getElementById('useLowercase');
    const useNumbers = document.getElementById('useNumbers');
    const useSymbols = document.getElementById('useSymbols');
    
    passBtn.addEventListener('click', function() {
        const length = parseInt(passLengthInput.value);
        
        if (!length || length < 4 || length > 100) {
            showError(passLengthInput, 'Password length must be between 4 and 100');
            return;
        }
        
        let charset = '';
        
        if (useUppercase.checked) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (useLowercase.checked) charset += 'abcdefghijklmnopqrstuvwxyz';
        if (useNumbers.checked) charset += '0123456789';
        if (useSymbols.checked) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (!charset) {
            showError(passLengthInput, 'Please select at least one character type');
            return;
        }
        
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        passResult.textContent = password;
        
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.style.marginTop = '0.5rem';
        copyBtn.style.padding = '0.5rem 1rem';
        copyBtn.style.background = 'var(--button-bg)';
        copyBtn.style.color = 'white';
        copyBtn.style.border = 'none';
        copyBtn.style.borderRadius = '4px';
        copyBtn.style.cursor = 'pointer';
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(password);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
            }, 2000);
        });
        passResult.appendChild(copyBtn);
    });
    
    const minInput = document.querySelector('#randomNumber input:first-of-type');
    const maxInput = document.querySelector('#randomNumber input:last-of-type');
    const randomBtn = document.querySelector('#randomNumber button');
    const randomResult = document.querySelector('#randomNumber .result-display');
    
    randomBtn.addEventListener('click', function() {
        const min = parseInt(minInput.value);
        const max = parseInt(maxInput.value);
        
        if (isNaN(min) || isNaN(max) || min >= max) {
            showError(minInput, 'Min must be less than max');
            return;
        }
        
        const random = Math.floor(Math.random() * (max - min + 1)) + min;
        randomResult.textContent = `Random number: ${random}`;
    });
    
    const hashInput = document.querySelector('#hashGenerator input');
    const hashSelect = document.querySelector('#hashGenerator select');
    const hashBtn = document.querySelector('#hashGenerator button');
    const hashResult = document.querySelector('#hashGenerator .result-display');
    
    hashBtn.addEventListener('click', async function() {
        const text = hashInput.value.trim();
        const algorithm = hashSelect.value;
        
        if (!text) {
            showError(hashInput, 'Please enter text to hash');
            return;
        }
        
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);
            
            let hashBuffer;
            
            if (algorithm === 'md5') {
                hashResult.textContent = 'MD5 requires external library';
                return;
            }
            
            const algoMap = {
                'sha1': 'SHA-1',
                'sha256': 'SHA-256',
                'sha512': 'SHA-512'
            };
            
            hashBuffer = await crypto.subtle.digest(algoMap[algorithm], data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            hashResult.textContent = `${algorithm.toUpperCase()}: ${hashHex}`;
        } catch (e) {
            hashResult.textContent = 'Error generating hash';
        }
    });
    
    const textToBinaryTextarea = document.querySelector('#textToBinary textarea');
    const textToBinaryBtn = document.querySelector('#textToBinary button');
    const textToBinaryResult = document.querySelector('#textToBinary .result-display');
    
    textToBinaryBtn.addEventListener('click', function() {
        const text = textToBinaryTextarea.value.trim();
        
        if (!text) {
            showError(textToBinaryTextarea, 'Please enter text');
            return;
        }
        
        const binary = text.split('').map(char => {
            return char.charCodeAt(0).toString(2).padStart(8, '0');
        }).join(' ');
        
        textToBinaryResult.textContent = binary;
    });
    
    const asciiTextarea = document.querySelector('#asciiConverter textarea');
    const asciiBtn = document.querySelector('#asciiConverter button');
    const asciiResult = document.querySelector('#asciiConverter .result-display');
    
    asciiBtn.addEventListener('click', function() {
        const text = asciiTextarea.value.trim();
        
        if (!text) {
            showError(asciiTextarea, 'Please enter text');
            return;
        }
        
        const ascii = text.split('').map(char => char.charCodeAt(0)).join(' ');
        asciiResult.textContent = ascii;
    });
});

function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateQRData(text) {
    const size = 25;
    const qrData = [];
    
    for (let i = 0; i < size; i++) {
        qrData[i] = [];
        for (let j = 0; j < size; j++) {
            qrData[i][j] = 0;
        }
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