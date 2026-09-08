function showSection(sectionId) {
    document.getElementById('mainMenu').style.display = 'none';
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';

    const titles = {
        fileConverter: 'File Converter',
        unitConverter: 'Unit Converter',
        linkConverter: 'Link Converter',
        currencyConverter: 'Currency Converter',
        mediaShop: 'Media Shop',
        photoEditor: 'Photoshop',
        textEditor: 'Text Editor',
        calculator: 'Calculator',
        info: 'Info'
    };
    document.title = 'LucConverter - ' + (titles[sectionId] || sectionId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()));
    history.pushState(null, '', '#' + sectionId);
}

function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'grid';
    const sections = document.querySelectorAll('.tool-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.title = 'LucConverter';
    history.pushState(null, '', window.location.pathname);
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

function showSuccess(inputElement, message) {
    const existingSuccess = inputElement.parentElement.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    inputElement.parentElement.insertBefore(successDiv, inputElement.nextSibling);
    setTimeout(() => {
        successDiv.remove();
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
    showSuccess(input, 'Text encoded successfully');
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
        showSuccess(input, 'Text decoded successfully');
    } catch (e) {
        showError(input, 'Invalid encoded text');
    }
}

window.addEventListener('hashchange', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else if (!hash) {
        showMainMenu();
    }
});

window.addEventListener('load', function() {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        showMainMenu();
    }
});