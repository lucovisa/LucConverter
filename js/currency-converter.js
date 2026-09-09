document.addEventListener('DOMContentLoaded', function() {
    initCurrencyConverter();
});

function initCurrencyConverter() {
    const amountInput = document.getElementById('currencyAmount');
    const fromSelect = document.getElementById('currencyFrom');
    const toSelect = document.getElementById('currencyTo');
    const swapBtn = document.getElementById('swapCurrencies');
    const convertBtn = document.querySelector('.convert-currency-btn');
    const resultDiv = document.querySelector('.currency-result');
    const rateInfo = document.querySelector('.exchange-rate-info');

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
        fromSelect.add(new Option(`${code} - ${currencies[code]}`, code));
        toSelect.add(new Option(`${code} - ${currencies[code]}`, code));
    });
    fromSelect.value = 'USD';
    toSelect.value = 'EUR';

    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.placeholder = 'Enter API key (optional, for own data source)';
    apiKeyInput.style.width = '100%';
    apiKeyInput.style.marginBottom = '1rem';
    apiKeyInput.style.padding = '0.6rem';
    apiKeyInput.style.background = 'var(--bg)';
    apiKeyInput.style.border = '1px solid var(--border)';
    apiKeyInput.style.borderRadius = '4px';
    apiKeyInput.style.color = 'var(--text)';
    const currencyBox = document.querySelector('.currency-converter-box');
    currencyBox.insertBefore(apiKeyInput, currencyBox.querySelector('.currency-input-group'));

    const searchHint = document.createElement('p');
    searchHint.textContent = 'Type a letter to search currencies';
    searchHint.style.fontSize = '0.8rem';
    searchHint.style.opacity = '0.7';
    searchHint.style.marginBottom = '1rem';
    currencyBox.insertBefore(searchHint, currencyBox.querySelector('.currency-input-group'));

    fromSelect.addEventListener('keydown', (e) => searchInSelect(fromSelect, e));
    toSelect.addEventListener('keydown', (e) => searchInSelect(toSelect, e));

    function searchInSelect(select, e) {
        if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
            e.preventDefault();
            const char = e.key.toUpperCase();
            const options = Array.from(select.options);
            const match = options.find(opt => opt.value.startsWith(char));
            if (match) select.value = match.value;
        }
    }

    swapBtn.addEventListener('click', () => {
        const temp = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = temp;
        autoConvert();
    });

    convertBtn.addEventListener('click', () => {
        autoConvert();
    });

    function autoConvert() {
        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) return;
        const from = fromSelect.value;
        const to = toSelect.value;
        const apiKey = apiKeyInput.value.trim();
        if (from === to) {
            resultDiv.style.display = 'block';
            resultDiv.textContent = `${amount} ${from} = ${amount} ${to}`;
            rateInfo.textContent = '';
            return;
        }
        fetchRate(from, to, amount, apiKey);
    }

    setInterval(() => {
        autoConvert();
    }, 60000);

    async function fetchRate(from, to, amount, apiKey) {
        rateInfo.textContent = 'Updating...';
        try {
            let rate;
            if (apiKey) {
                const resp = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`);
                const data = await resp.json();
                if (data.result === 'success') {
                    rate = data.conversion_rates[to];
                    rateInfo.textContent = `1 ${from} = ${rate.toFixed(6)} ${to} | Updated: ${data.time_last_update_utc}`;
                } else {
                    throw new Error('Invalid API key');
                }
            } else {
                const resp = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
                const data = await resp.json();
                if (data.rates && data.rates[to]) {
                    rate = data.rates[to];
                    rateInfo.textContent = `1 ${from} = ${rate.toFixed(6)} ${to} | Updated: ${new Date(data.time_last_updated * 1000).toLocaleString()}`;
                } else {
                    throw new Error('Rate not found');
                }
            }
            const result = amount * rate;
            resultDiv.style.display = 'block';
            resultDiv.textContent = `${amount} ${from} = ${result.toFixed(2)} ${to}`;
        } catch (e) {
            rateInfo.textContent = '';
            resultDiv.style.display = 'block';
            resultDiv.textContent = 'Failed to fetch rates';
        }
    }
}