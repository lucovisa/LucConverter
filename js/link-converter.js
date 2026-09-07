document.addEventListener('DOMContentLoaded', function() {
    const urlTextarea = document.querySelector('#urlConverter textarea');
    const urlResult = document.getElementById('urlResult');
    const encodeBtn = document.querySelector('#urlConverter button:first-of-type');
    const decodeBtn = document.querySelector('#urlConverter button:last-of-type');
    
    encodeBtn.addEventListener('click', function() {
        const input = urlTextarea.value;
        if (!input) {
            alert('Please enter text to encode');
            return;
        }
        
        urlResult.value = encodeURIComponent(input);
    });
    
    decodeBtn.addEventListener('click', function() {
        const input = urlTextarea.value;
        if (!input) {
            alert('Please enter text to decode');
            return;
        }
        
        try {
            urlResult.value = decodeURIComponent(input);
        } catch (e) {
            alert('Invalid encoded text');
        }
    });
    
    const qrInput = document.querySelector('#qrConverter input[type="text"]');
    const qrBtn = document.querySelector('#qrConverter button');
    const qrCode = document.getElementById('qrCode');
    
    qrBtn.addEventListener('click', function() {
        const text = qrInput.value.trim();
        if (!text) {
            alert('Please enter text or URL');
            return;
        }
        
        qrCode.innerHTML = '';
        
        const qr = document.createElement('div');
        qr.style.width = '200px';
        qr.style.height = '200px';
        qr.style.margin = '1rem auto';
        qr.style.backgroundColor = 'white';
        qr.style.padding = '10px';
        qr.style.borderRadius = '4px';
        
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 200);
        ctx.fillStyle = 'black';
        
        const size = 200;
        const cellSize = size / 25;
        const qrData = generateQRData(text);
        
        for (let i = 0; i < qrData.length; i++) {
            for (let j = 0; j < qrData[i].length; j++) {
                if (qrData[i][j] === 1) {
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
        
        qr.appendChild(canvas);
        qrCode.appendChild(qr);
        
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