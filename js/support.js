const donateBtn = document.getElementById('donateBtn');
const donatePanel = document.getElementById('donatePanel');
const closeDonate = document.getElementById('closeDonate');
const copyButtons = document.querySelectorAll('.copy-btn');

donateBtn.addEventListener('click', function() {
    donatePanel.classList.add('active');
});

closeDonate.addEventListener('click', function() {
    donatePanel.classList.remove('active');
});

document.addEventListener('click', function(e) {
    if (donatePanel.classList.contains('active') && 
        !donatePanel.contains(e.target) && 
        e.target !== donateBtn) {
        donatePanel.classList.remove('active');
    }
});

copyButtons.forEach(button => {
    button.addEventListener('click', function() {
        const address = this.getAttribute('data-address');
        navigator.clipboard.writeText(address).then(() => {
            const originalText = this.textContent;
            this.textContent = 'Copied!';
            this.style.background = '#4CAF50';
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
        });
    });
});