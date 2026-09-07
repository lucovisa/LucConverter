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
        converter.style.display = 'none';
    });
    document.getElementById(converterId).style.display = 'block';
}

function encodeURL() {
    const input = document.querySelector('#urlConverter textarea');
    const result = document.getElementById('urlResult');
    result.value = encodeURIComponent(input.value);
}

function decodeURL() {
    const input = document.querySelector('#urlConverter textarea');
    const result = document.getElementById('urlResult');
    result.value = decodeURIComponent(input.value);
}