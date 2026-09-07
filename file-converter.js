const fileConverterBtn = document.getElementById('fileConverterBtn');
const fileConverterContent = document.getElementById('fileConverterContent');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

fileConverterBtn.addEventListener('click', function() {
    fileConverterContent.classList.toggle('active');
});

fileInput.addEventListener('change', function() {
    fileList.innerHTML = '';
    
    const files = Array.from(this.files);
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.style.padding = '0.5rem';
        fileItem.style.borderBottom = '1px solid var(--border)';
        fileItem.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
        fileList.appendChild(fileItem);
    });
});