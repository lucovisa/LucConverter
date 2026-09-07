const themeToggle = document.getElementById('themeToggle');
const donateBtn = document.getElementById('donateBtn');
const donateModal = document.getElementById('donateModal');
const closeDonate = document.getElementById('closeDonate');
const copyButtons = document.querySelectorAll('.copy-btn');

let currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeButton();

themeToggle.addEventListener('click', function() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeButton();
});

function updateThemeButton() {
    themeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
}

donateBtn.addEventListener('click', function() {
    donateModal.classList.add('active');
});

closeDonate.addEventListener('click', function() {
    donateModal.classList.remove('active');
});

donateModal.addEventListener('click', function(e) {
    if (e.target === donateModal) {
        donateModal.classList.remove('active');
    }
});

copyButtons.forEach(button => {
    button.addEventListener('click', function() {
        const address = this.getAttribute('data-address');
        navigator.clipboard.writeText(address).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = originalText;
            }, 2000);
        });
    });
});