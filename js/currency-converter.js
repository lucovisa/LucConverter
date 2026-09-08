document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.getElementById('currencyAmount');
    const fromSelect = document.getElementById('currencyFrom');
    const toSelect = document.getElementById('currencyTo');
    const swapBtn = document.getElementById('swapCurrencies');
    const convertBtn = document.querySelector('.convert-currency-btn');
    const resultDiv = document.querySelector('.currency-result');
    const rateInfo = document.querySelector('.exchange-rate-info');
    
    const currencies = {
        USD: 'US Dollar',
        EUR: 'Euro',
        GBP: 'British Pound',
        JPY: 'Japanese Yen',
        CNY: 'Chinese Yuan',
        RUB: 'Russian Ruble',
        INR: 'Indian Rupee',
        BRL: 'Brazilian Real',
        CAD: 'Canadian Dollar',
        AUD: 'Australian Dollar',
        CHF: 'Swiss Franc',
        SEK: 'Swedish Krona',
        NOK: 'Norwegian Krone',
        DKK: 'Danish Krone',
        PLN: 'Polish Zloty',
        CZK: 'Czech Koruna',
        HUF: 'Hungarian Forint',
        TRY: 'Turkish Lira',
        KRW: 'South Korean Won',
        SGD: 'Singapore Dollar',
        HKD: 'Hong Kong Dollar',
        NZD: 'New Zealand Dollar',
        MXN: 'Mexican Peso',
        ZAR: 'South African Rand',
        AED: 'UAE Dirham',
        SAR: 'Saudi Riyal',
        THB: 'Thai Baht',
        MYR: 'Malaysian Ringgit',
        IDR: 'Indonesian Rupiah',
        PHP: 'Philippine Peso',
        VND: 'Vietnamese Dong',
        UAH: 'Ukrainian Hryvnia',
        KZT: 'Kazakhstani Tenge',
        BYN: 'Belarusian Ruble',
        RON: 'Romanian Leu',
        BGN: 'Bulgarian Lev',
        HRK: 'Croatian Kuna',
        ISK: 'Icelandic Krona',
        ILS: 'Israeli Shekel',
        EGP: 'Egyptian Pound',
        NGN: 'Nigerian Naira',
        KES: 'Kenyan Shilling',
        GHS: 'Ghanaian Cedi',
        TZS: 'Tanzanian Shilling',
        UGX: 'Ugandan Shilling',
        ETB: 'Ethiopian Birr',
        MAD: 'Moroccan Dirham',
        DZD: 'Algerian Dinar',
        TND: 'Tunisian Dinar',
        LYD: 'Libyan Dinar',
        IQD: 'Iraqi Dinar',
        JOD: 'Jordanian Dinar',
        KWD: 'Kuwaiti Dinar',
        BHD: 'Bahraini Dinar',
        OMR: 'Omani Rial',
        QAR: 'Qatari Riyal',
        LBP: 'Lebanese Pound',
        SYP: 'Syrian Pound',
        YER: 'Yemeni Rial',
        AFN: 'Afghan Afghani',
        PKR: 'Pakistani Rupee',
        BDT: 'Bangladeshi Taka',
        LKR: 'Sri Lankan Rupee',
        NPR: 'Nepalese Rupee',
        MMK: 'Myanmar Kyat',
        KHR: 'Cambodian Riel',
        LAK: 'Lao Kip',
        MNT: 'Mongolian Tugrik',
        KPW: 'North Korean Won',
        TWD: 'Taiwan Dollar',
        MOP: 'Macanese Pataca',
        BND: 'Brunei Dollar',
        FJD: 'Fijian Dollar',
        PGK: 'Papua New Guinean Kina',
        SBD: 'Solomon Islands Dollar',
        VUV: 'Vanuatu Vatu',
        WST: 'Samoan Tala',
        TOP: 'Tongan Paʻanga',
        BTC: 'Bitcoin',
        ETH: 'Ethereum',
        USDT: 'Tether',
        BNB: 'Binance Coin',
        XRP: 'Ripple',
        ADA: 'Cardano',
        SOL: 'Solana',
        DOGE: 'Dogecoin',
        DOT: 'Polkadot',
        LTC: 'Litecoin'
    };
    
    Object.keys(currencies).sort().forEach(code => {
        const option1 = document.createElement('option');
        option1.value = code;
        option1.textContent = `${code} - ${currencies[code]}`;
        fromSelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = code;
        option2.textContent = `${code} - ${currencies[code]}`;
        toSelect.appendChild(option2);
    });
    
    fromSelect.value = 'USD';
    toSelect.value = 'EUR';
    
    swapBtn.addEventListener('click', function() {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
    });
    
    convertBtn.addEventListener('click', function() {
        const amount = parseFloat(amountInput.value);
        const from = fromSelect.value;
        const to = toSelect.value;
        
        if (!amount || amount <= 0) {
            showError(amountInput, 'Please enter a valid amount');
            return;
        }
        
        fetchExchangeRate(from, to, amount);
    });
    
    amountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });
    
    function fetchExchangeRate(from, to, amount) {
        resultDiv.style.display = 'none';
        rateInfo.textContent = 'Fetching exchange rates...';
        
        fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.rates[to];
                const result = amount * rate;
                
                resultDiv.style.display = 'block';
                resultDiv.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
                rateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
            })
            .catch(error => {
                rateInfo.textContent = 'Error fetching rates. Trying backup API...';
                fetchBackupRate(from, to, amount);
            });
    }
    
    function fetchBackupRate(from, to, amount) {
        fetch(`https://open.er-api.com/v6/latest/${from}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.rates[to];
                const result = amount * rate;
                
                resultDiv.style.display = 'block';
                resultDiv.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
                rateInfo.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
            })
            .catch(error => {
                rateInfo.textContent = '';
                showError(amountInput, 'Failed to fetch exchange rates. Please try again later.');
            });
    }
});