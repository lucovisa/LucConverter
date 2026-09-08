document.addEventListener('DOMContentLoaded', function() {
    const amountInput = document.getElementById('currencyAmount');
    const fromSelect = document.getElementById('currencyFrom');
    const toSelect = document.getElementById('currencyTo');
    const swapBtn = document.getElementById('swapCurrencies');
    const convertBtn = document.querySelector('.convert-currency-btn');
    const resultDiv = document.querySelector('.currency-result');
    const rateInfo = document.querySelector('.exchange-rate-info');
    
    fromSelect.style.width = '100%';
    toSelect.style.width = '100%';
    
    fromSelect.addEventListener('keydown', function(e) {
        if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            e.preventDefault();
            const searchChar = e.key.toUpperCase();
            const options = Array.from(fromSelect.options);
            const match = options.find(opt => opt.value.startsWith(searchChar));
            if (match) {
                fromSelect.value = match.value;
            }
        }
    });
    
    toSelect.addEventListener('keydown', function(e) {
        if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            e.preventDefault();
            const searchChar = e.key.toUpperCase();
            const options = Array.from(toSelect.options);
            const match = options.find(opt => opt.value.startsWith(searchChar));
            if (match) {
                toSelect.value = match.value;
            }
        }
    });
    
    const searchHint = document.createElement('p');
    searchHint.textContent = '💡 Type a letter to search currencies';
    searchHint.style.fontSize = '0.8rem';
    searchHint.style.opacity = '0.7';
    searchHint.style.marginBottom = '1rem';
    
    const currencyBox = document.querySelector('.currency-converter-box');
    currencyBox.insertBefore(searchHint, currencyBox.querySelector('.currency-input-group'));
    
    const currencies = {
        USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
        CNY: 'Chinese Yuan', RUB: 'Russian Ruble', INR: 'Indian Rupee',
        BRL: 'Brazilian Real', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
        CHF: 'Swiss Franc', SEK: 'Swedish Krona', NOK: 'Norwegian Krone',
        DKK: 'Danish Krone', PLN: 'Polish Zloty', CZK: 'Czech Koruna',
        HUF: 'Hungarian Forint', TRY: 'Turkish Lira', KRW: 'South Korean Won',
        SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar', NZD: 'New Zealand Dollar',
        MXN: 'Mexican Peso', ZAR: 'South African Rand', AED: 'UAE Dirham',
        SAR: 'Saudi Riyal', THB: 'Thai Baht', MYR: 'Malaysian Ringgit',
        IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso', VND: 'Vietnamese Dong',
        UAH: 'Ukrainian Hryvnia', KZT: 'Kazakhstani Tenge', BYN: 'Belarusian Ruble',
        RON: 'Romanian Leu', BGN: 'Bulgarian Lev', ISK: 'Icelandic Krona',
        ILS: 'Israeli Shekel', EGP: 'Egyptian Pound', NGN: 'Nigerian Naira',
        KES: 'Kenyan Shilling', GHS: 'Ghanaian Cedi', TZS: 'Tanzanian Shilling',
        UGX: 'Ugandan Shilling', ETB: 'Ethiopian Birr', MAD: 'Moroccan Dirham',
        DZD: 'Algerian Dinar', TND: 'Tunisian Dinar', IQD: 'Iraqi Dinar',
        JOD: 'Jordanian Dinar', KWD: 'Kuwaiti Dinar', BHD: 'Bahraini Dinar',
        OMR: 'Omani Rial', QAR: 'Qatari Riyal', LBP: 'Lebanese Pound',
        PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka', LKR: 'Sri Lankan Rupee',
        NPR: 'Nepalese Rupee', MMK: 'Myanmar Kyat', KHR: 'Cambodian Riel',
        LAK: 'Lao Kip', MNT: 'Mongolian Tugrik', TWD: 'Taiwan Dollar',
        MOP: 'Macanese Pataca', BND: 'Brunei Dollar', FJD: 'Fijian Dollar',
        PGK: 'Papua New Guinean Kina', SBD: 'Solomon Islands Dollar',
        VUV: 'Vanuatu Vatu', WST: 'Samoan Tala', TOP: 'Tongan Paʻanga',
        AFN: 'Afghan Afghani', AMD: 'Armenian Dram', AZN: 'Azerbaijani Manat',
        BAM: 'Bosnia-Herzegovina Mark', BBD: 'Barbadian Dollar', BIF: 'Burundian Franc',
        BOB: 'Bolivian Boliviano', BSD: 'Bahamian Dollar', BTN: 'Bhutanese Ngultrum',
        BWP: 'Botswana Pula', BZD: 'Belize Dollar', CDF: 'Congolese Franc',
        CLP: 'Chilean Peso', COP: 'Colombian Peso', CRC: 'Costa Rican Colon',
        CVE: 'Cape Verdean Escudo', DJF: 'Djiboutian Franc', DOP: 'Dominican Peso',
        ERN: 'Eritrean Nakfa', GEL: 'Georgian Lari', GIP: 'Gibraltar Pound',
        GMD: 'Gambian Dalasi', GNF: 'Guinean Franc', GTQ: 'Guatemalan Quetzal',
        GYD: 'Guyanese Dollar', HNL: 'Honduran Lempira', HTG: 'Haitian Gourde',
        IRR: 'Iranian Rial', JMD: 'Jamaican Dollar', KGS: 'Kyrgyzstani Som',
        KMF: 'Comorian Franc', KPW: 'North Korean Won', KYD: 'Cayman Islands Dollar',
        LRD: 'Liberian Dollar', LSL: 'Lesotho Loti', LYD: 'Libyan Dinar',
        MDL: 'Moldovan Leu', MGA: 'Malagasy Ariary', MKD: 'Macedonian Denar',
        MUR: 'Mauritian Rupee', MVR: 'Maldivian Rufiyaa',
        MWK: 'Malawian Kwacha', MZN: 'Mozambican Metical', NAD: 'Namibian Dollar',
        NIO: 'Nicaraguan Cordoba', PAB: 'Panamanian Balboa', PEN: 'Peruvian Sol',
        PYG: 'Paraguayan Guarani', RSD: 'Serbian Dinar', RWF: 'Rwandan Franc',
        SCR: 'Seychellois Rupee', SDG: 'Sudanese Pound', SLL: 'Sierra Leonean Leone',
        SOS: 'Somali Shilling', SRD: 'Surinamese Dollar', SSP: 'South Sudanese Pound',
        SVC: 'Salvadoran Colon', SYP: 'Syrian Pound',
        SZL: 'Swazi Lilangeni', TJS: 'Tajikistani Somoni', TMT: 'Turkmenistani Manat',
        TTD: 'Trinidad and Tobago Dollar', UYU: 'Uruguayan Peso',
        UZS: 'Uzbekistani Som', VEF: 'Venezuelan Bolivar', XAF: 'Central African CFA Franc',
        XCD: 'East Caribbean Dollar', XOF: 'West African CFA Franc',
        XPF: 'CFP Franc', YER: 'Yemeni Rial', ZMW: 'Zambian Kwacha',
        BTC: 'Bitcoin', ETH: 'Ethereum', USDT: 'Tether', BNB: 'Binance Coin',
        XRP: 'Ripple', ADA: 'Cardano', SOL: 'Solana', DOGE: 'Dogecoin',
        DOT: 'Polkadot', LTC: 'Litecoin', BCH: 'Bitcoin Cash', LINK: 'Chainlink',
        MATIC: 'Polygon', SHIB: 'Shiba Inu', AVAX: 'Avalanche', UNI: 'Uniswap'
    };
    
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    
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
        
        if (from === to) {
            resultDiv.style.display = 'block';
            resultDiv.textContent = `${amount} ${from} = ${amount} ${to}`;
            rateInfo.textContent = '';
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
        
        fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`)
            .then(response => response.json())
            .then(data => {
                if (data.rates && data.rates[to]) {
                    const rate = data.rates[to];
                    const result = amount * rate;
                    
                    resultDiv.style.display = 'block';
                    resultDiv.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
                    rateInfo.textContent = `1 ${from} = ${rate.toFixed(6)} ${to} | Date: ${data.date}`;
                } else {
                    fetchBackupRate(from, to, amount);
                }
            })
            .catch(() => {
                fetchBackupRate(from, to, amount);
            });
    }
    
    function fetchBackupRate(from, to, amount) {
        fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
            .then(response => response.json())
            .then(data => {
                const rate = data.rates[to];
                const result = amount * rate;
                
                resultDiv.style.display = 'block';
                resultDiv.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
                rateInfo.textContent = `1 ${from} = ${rate.toFixed(6)} ${to} | Updated: ${new Date(data.time_last_updated * 1000).toLocaleString()}`;
            })
            .catch(() => {
                rateInfo.textContent = '';
                showError(amountInput, 'Failed to fetch exchange rates. Please try again later.');
            });
    }
});