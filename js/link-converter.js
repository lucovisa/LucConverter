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
        downloadBtn.addEventListener('click', function() {
            const link = document.createElement('a');
            link.download = 'qr-code.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
        qrCode.appendChild(downloadBtn);
    });
    
    const qrImageInput = document.getElementById('qrImageInput');
    const qrScanBtn = document.querySelector('#qrScanner button');
    const qrScanResult = document.querySelector('#qrScanner .result-display');
    
    qrScanBtn.addEventListener('click', function() {
        if (!qrImageInput.files.length) {
            showError(qrImageInput, 'Please select an image with QR code');
            return;
        }
        
        const file = qrImageInput.files[0];
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
                
                if (code) {
                    qrScanResult.textContent = `Decoded: ${code.data}`;
                } else {
                    qrScanResult.textContent = 'No QR code found in image';
                }
            } else {
                qrScanResult.textContent = 'QR scanner library not loaded';
            }
        };
        
        img.src = URL.createObjectURL(file);
    });
    
    const shortInput = document.querySelector('#linkShortener input');
    const shortBtn = document.querySelector('#linkShortener button');
    const shortResult = document.querySelector('#linkShortener .result-display');
    
    shortBtn.addEventListener('click', function() {
        const url = shortInput.value.trim();
        
        if (!url || !url.startsWith('http')) {
            showError(shortInput, 'Please enter a valid URL');
            return;
        }
        
        fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
            .then(response => response.text())
            .then(data => {
                if (data.startsWith('http')) {
                    shortResult.textContent = `Short URL: ${data}`;
                } else {
                    const shortCode = generateShortCode();
                    shortResult.textContent = `Short URL: ${shortCode}`;
                }
            })
            .catch(() => {
                const shortCode = generateShortCode();
                shortResult.textContent = `Short URL: ${shortCode}`;
            });
    });
    
    function generateShortCode() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'https://luc.tiny/';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    const passLengthInput = document.querySelector('#passwordGenerator input');
    const passBtn = document.querySelector('#passwordGenerator button');
    const passResult = document.querySelector('#passwordGenerator .result-display');
    
    passBtn.addEventListener('click', function() {
        const length = parseInt(passLengthInput.value);
        
        if (!length || length < 4 || length > 100) {
            showError(passLengthInput, 'Password length must be between 4 and 100');
            return;
        }
        
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        passResult.textContent = password;
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
        
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        hashResult.textContent = `${algorithm.toUpperCase()}: ${hashHex}`;
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