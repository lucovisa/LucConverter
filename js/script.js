function showSection(sectionId) {
    document.getElementById('mainMenu').style.display = 'none';
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'grid';
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
}

function showConverter(converterId) {
    const converters = document.querySelectorAll('.converter-content');
    converters.forEach(converter => {
        converter.classList.remove('active');
    });
    document.getElementById(converterId).classList.add('active');
}

function showError(inputElement, message) {
    const existingError = inputElement.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    inputElement.parentElement.insertBefore(errorDiv, inputElement.nextSibling);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function encodeURL() {
    const input = document.querySelector('#urlConverter textarea');
    const result = document.getElementById('urlResult');
    
    if (!input.value.trim()) {
        showError(input, 'Please enter text to encode');
        return;
    }
    
    result.value = encodeURIComponent(input.value);
}

function decodeURL() {
    const input = document.querySelector('#urlConverter textarea');
    const result = document.getElementById('urlResult');
    
    if (!input.value.trim()) {
        showError(input, 'Please enter text to decode');
        return;
    }
    
    try {
        result.value = decodeURIComponent(input.value);
    } catch (e) {
        showError(input, 'Invalid encoded text');
    }
}