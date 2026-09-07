document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.querySelector('#currencyConverter input[type="number"]');
    const fromCurrency = document.querySelector('#currencyConverter select:first-of-type');
    const toCurrency = document.querySelector('#currencyConverter select:last-of-type');
    const convertBtn = document.querySelector('#currencyConverter button');
    const resultDiv = document.createElement('div');
    resultDiv.style.marginTop = '1rem';
    resultDiv.style.fontSize = '1.2rem';
    resultDiv.style.fontWeight = 'bold';
    convertBtn.parentNode.appendChild(resultDiv);
    
    const exchangeRates = {
        USD: { EUR: 0.92, RUB: 90.5, BTC: 0.000023, ETH: 0.00033, USD: 1 },
        EUR: { USD: 1.09, RUB: 98.3, BTC: 0.000025, ETH: 0.00036, EUR: 1 },
        RUB: { USD: 0.011, EUR: 0.010, BTC: 0.00000025, ETH: 0.0000036, RUB: 1 },
        BTC: { USD: 43000, EUR: 39500, RUB: 3900000, ETH: 13.5, BTC: 1 },
        ETH: { USD: 3200, EUR: 2930, RUB: 289000, BTC: 0.074, ETH: 1 }
    };
    
    convertBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const from = fromCurrency.value;
        const to = toCurrency.value;
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        const rate = exchangeRates[from][to];
        const result = amount * rate;
        
        resultDiv.textContent = `${amount} ${from} = ${result.toFixed(8)} ${to}`;
    });
    
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });
});