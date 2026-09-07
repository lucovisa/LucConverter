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