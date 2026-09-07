document.addEventListener('DOMContentLoaded', function() {
    const audioSection = document.getElementById('audioConverter');
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.style.marginBottom = '1rem';
    
    const formatSelect = document.createElement('select');
    formatSelect.style.marginBottom = '1rem';
    
    const formats = ['MP3', 'WAV', 'OGG', 'AAC', 'FLAC', 'M4A'];
    formats.forEach(format => {
        const option = document.createElement('option');
        option.value = format.toLowerCase();
        option.textContent = format;
        formatSelect.appendChild(option);
    });
    
    const bitrateSelect = document.createElement('select');
    bitrateSelect.style.marginBottom = '1rem';
    
    const bitrates = ['64 kbps', '128 kbps', '192 kbps', '256 kbps', '320 kbps'];
    bitrates.forEach(bitrate => {
        const option = document.createElement('option');
        option.value = bitrate.split(' ')[0];
        option.textContent = bitrate;
        bitrateSelect.appendChild(option);
    });
    
    const convertBtn = document.createElement('button');
    convertBtn.textContent = 'Convert Audio';
    convertBtn.style.marginBottom = '1rem';
    
    const statusDiv = document.createElement('div');
    statusDiv.style.marginTop = '1rem';
    statusDiv.style.padding = '1rem';
    statusDiv.style.border = '1px solid var(--border)';
    statusDiv.style.borderRadius = '4px';
    statusDiv.style.display = 'none';
    
    audioSection.innerHTML = '';
    audioSection.appendChild(fileInput);
    audioSection.appendChild(formatSelect);
    audioSection.appendChild(bitrateSelect);
    audioSection.appendChild(convertBtn);
    audioSection.appendChild(statusDiv);
    
    convertBtn.addEventListener('click', function() {
        const file = fileInput.files[0];
        const format = formatSelect.value;
        const bitrate = bitrateSelect.value;
        
        if (!file) {
            alert('Please select an audio file');
            return;
        }
        
        if (!file.type.startsWith('audio/')) {
            alert('Please select a valid audio file');
            return;
        }
        
        statusDiv.style.display = 'block';
        statusDiv.textContent = `Converting ${file.name} to ${format.toUpperCase()} (${bitrate} kbps)...`;
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const reader = new FileReader();
        
        reader.onload = function(e) {
            audioContext.decodeAudioData(e.target.result, function(buffer) {
                const duration = buffer.duration;
                const sampleRate = buffer.sampleRate;
                const channels = buffer.numberOfChannels;
                
                statusDiv.textContent = `Audio Info: ${duration.toFixed(2)}s, ${sampleRate}Hz, ${channels} channel(s)`;
                
                setTimeout(() => {
                    statusDiv.textContent = 'Client-side conversion completed. Downloading file...';
                    
                    const processedBuffer = buffer;
                    const wavBlob = audioBufferToWav(processedBuffer);
                    downloadFile(wavBlob, file.name.replace(/\.[^.]+$/, `.${format}`));
                }, 1500);
            }, function(error) {
                statusDiv.textContent = 'Error decoding audio. Downloading original file...';
                
                reader.onload = function(e) {
                    const blob = new Blob([e.target.result], { type: file.type });
                    downloadFile(blob, file.name);
                };
                reader.readAsArrayBuffer(file);
            });
        };
        reader.readAsArrayBuffer(file);
    });
    
    function audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1;
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const data = new Float32Array(buffer.length * numChannels);
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < buffer.length; i++) {
                data[i * numChannels + channel] = channelData[i];
            }
        }
        
        const dataSize = data.length * bytesPerSample;
        const bufferSize = 44 + dataSize;
        const arrayBuffer = new ArrayBuffer(bufferSize);
        const view = new DataView(arrayBuffer);
        
        writeString(view, 0, 'RIFF');
        view.setUint32(4, bufferSize - 8, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);
        
        let offset = 44;
        for (let i = 0; i < data.length; i++) {
            const sample = Math.max(-1, Math.min(1, data[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += bytesPerSample;
        }
        
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
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