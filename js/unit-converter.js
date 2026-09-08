document.addEventListener('DOMContentLoaded', function() {
    initUnitConverter();
});

function initUnitConverter() {
    const timezoneFrom = document.getElementById('timezoneFrom');
    const timezoneTo = document.getElementById('timezoneTo');
    if (timezoneFrom && timezoneTo) {
        fillSelect(timezoneFrom, timezones);
        fillSelect(timezoneTo, timezones);
    }

    const selectMap = {
        weightConverter: weightUnits,
        distanceConverter: distanceUnits,
        durationConverter: durationUnits,
        speedConverter: speedUnits,
        areaConverter: areaUnits,
        volumeConverter: volumeUnits,
        pressureConverter: pressureUnits,
        energyConverter: energyUnits,
        powerConverter: powerUnits,
        angleConverter: angleUnits,
        temperatureConverter: tempUnits
    };

    for (const [id, units] of Object.entries(selectMap)) {
        const container = document.getElementById(id);
        if (!container) continue;
        const select = container.querySelector('select');
        if (select && select.options.length === 0) {
            fillSelect(select, units);
        }
    }

    const colorPicker = document.getElementById('colorPicker');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    if (colorPicker && hexInput && rgbInput && hslInput) {
        colorPicker.addEventListener('input', function() {
            const rgb = hexToRgb(this.value);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            hexInput.value = this.value;
            rgbInput.value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
            hslInput.value = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
        });
    }

    setupConverter('weightConverter', weightUnits, genericConvert);
    setupConverter('distanceConverter', distanceUnits, genericConvert);
    setupConverter('durationConverter', durationUnits, genericConvert);
    setupConverter('speedConverter', speedUnits, genericConvert);
    setupConverter('areaConverter', areaUnits, genericConvert);
    setupConverter('volumeConverter', volumeUnits, genericConvert);
    setupConverter('pressureConverter', pressureUnits, genericConvert);
    setupConverter('energyConverter', energyUnits, genericConvert);
    setupConverter('powerConverter', powerUnits, genericConvert);
    setupConverter('angleConverter', angleUnits, genericConvert);

    const tempSelect = document.querySelector('#temperatureConverter select');
    const tempInput = document.querySelector('#temperatureConverter input[type="number"]');
    const tempBtn = document.querySelector('#temperatureConverter button');
    const tempResult = document.querySelector('#temperatureConverter .result-display');
    if (tempSelect && tempInput && tempBtn && tempResult) {
        tempBtn.addEventListener('click', function() {
            const value = parseFloat(tempInput.value);
            if (isNaN(value)) {
                showError(tempInput, 'Please enter a valid temperature');
                return;
            }
            const unit = tempSelect.value;
            let celsius;
            if (unit === 'Celsius (°C)') celsius = value;
            else if (unit === 'Fahrenheit (°F)') celsius = (value - 32) * 5 / 9;
            else if (unit === 'Kelvin (K)') celsius = value - 273.15;
            else if (unit === 'Rankine (°R)') celsius = (value - 491.67) * 5 / 9;
            else if (unit === 'Réaumur (°Ré)') celsius = value * 5 / 4;
            const fahrenheit = celsius * 9 / 5 + 32;
            const kelvin = celsius + 273.15;
            const rankine = (celsius + 273.15) * 9 / 5;
            const reaumur = celsius * 4 / 5;
            tempResult.textContent = `${celsius.toFixed(2)}°C | ${fahrenheit.toFixed(2)}°F | ${kelvin.toFixed(2)}K | ${rankine.toFixed(2)}°R | ${reaumur.toFixed(2)}°Ré`;
        });
    }

    const timeBtn = document.querySelector('#timeConverter button');
    const timeResult = document.querySelector('#timeConverter .result-display');
    if (timeBtn && timeResult) {
        timeBtn.addEventListener('click', function() {
            const from = timezones[timezoneFrom.value];
            const to = timezones[timezoneTo.value];
            const now = new Date();
            const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
            const fromTime = new Date(utcTime + from * 3600000);
            const toTime = new Date(utcTime + to * 3600000);
            timeResult.textContent = `${timezoneFrom.value}: ${fromTime.toLocaleTimeString()} | ${timezoneTo.value}: ${toTime.toLocaleTimeString()}`;
        });
    }

    const fractionInput = document.querySelector('#fractionConverter input');
    const fractionBtn = document.querySelector('#fractionConverter button');
    const fractionResult = document.querySelector('#fractionConverter .result-display');
    if (fractionInput && fractionBtn && fractionResult) {
        fractionBtn.addEventListener('click', function() {
            const fraction = fractionInput.value.trim();
            const parts = fraction.split('/');
            if (parts.length !== 2) {
                showError(fractionInput, 'Please enter a valid fraction (e.g., 3/4)');
                return;
            }
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
                showError(fractionInput, 'Invalid fraction');
                return;
            }
            const decimal = numerator / denominator;
            fractionResult.textContent = `${fraction} = ${decimal.toFixed(6)}`;
        });
    }

    const romanInput = document.querySelector('#romanConverter input');
    const romanBtn = document.querySelector('#romanConverter button');
    const romanResult = document.querySelector('#romanConverter .result-display');
    if (romanInput && romanBtn && romanResult) {
        romanBtn.addEventListener('click', function() {
            const input = romanInput.value.trim().toUpperCase();
            if (/^\d+$/.test(input)) romanResult.textContent = `${input} = ${toRoman(parseInt(input))}`;
            else if (/^[IVXLCDM]+$/.test(input)) romanResult.textContent = `${input} = ${fromRoman(input)}`;
            else showError(romanInput, 'Please enter a valid number or Roman numeral');
        });
    }

    const numSysInput = document.querySelector('#numberSystemConverter input');
    const numSysSelect = document.querySelector('#numberSystemConverter select');
    const numSysBtn = document.querySelector('#numberSystemConverter button');
    const numSysResult = document.querySelector('#numberSystemConverter .result-display');
    if (numSysInput && numSysSelect && numSysBtn && numSysResult) {
        numSysBtn.addEventListener('click', function() {
            const input = numSysInput.value.trim();
            const system = numSysSelect.value;
            let decimal;
            try {
                if (system === 'binary') decimal = parseInt(input, 2);
                else if (system === 'octal') decimal = parseInt(input, 8);
                else if (system === 'decimal') decimal = parseInt(input, 10);
                else if (system === 'hexadecimal') decimal = parseInt(input, 16);
                if (isNaN(decimal)) throw new Error('Invalid');
                numSysResult.textContent = `Binary: ${decimal.toString(2)}\nOctal: ${decimal.toString(8)}\nDecimal: ${decimal.toString(10)}\nHexadecimal: ${decimal.toString(16).toUpperCase()}`;
            } catch (e) {
                showError(numSysInput, 'Invalid number for selected system');
            }
        });
    }

    const dateInput = document.getElementById('dateInput');
    const dateBtn = document.querySelector('#dateConverter button');
    const dateResult = document.querySelector('#dateConverter .result-display');
    if (dateInput && dateBtn && dateResult) {
        dateBtn.addEventListener('click', function() {
            if (!dateInput.value) {
                showError(dateInput, 'Please select a date');
                return;
            }
            const date = new Date(dateInput.value);
            const unixTimestamp = Math.floor(date.getTime() / 1000);
            dateResult.textContent = `ISO: ${date.toISOString()}\nUnix timestamp: ${unixTimestamp}\nDay of week: ${date.toLocaleDateString('en-US', { weekday: 'long' })}\nWeek number: ${getWeekNumber(date)}`;
        });
    }

    const uuidBtn = document.querySelector('#uuidGenerator button');
    const uuidResult = document.querySelector('#uuidGenerator .result-display');
    if (uuidBtn && uuidResult) {
        uuidBtn.addEventListener('click', function() {
            uuidResult.textContent = generateUUID();
        });
    }
}

function fillSelect(select, units) {
    if (!select) return;
    select.innerHTML = '';
    Object.keys(units).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    });
}

function setupConverter(containerId, units, convertFn) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const input = container.querySelector('input[type="number"]');
    const select = container.querySelector('select');
    const btn = container.querySelector('button');
    const result = container.querySelector('.result-display');
    if (input && select && btn && result) {
        btn.addEventListener('click', function() {
            const value = parseFloat(input.value);
            const unit = select.value;
            if (isNaN(value) || value <= 0) {
                showError(input, 'Please enter a valid value');
                return;
            }
            result.textContent = convertFn(value, unit, units);
        });
    }
}

function genericConvert(value, unit, units) {
    const baseValue = value * units[unit];
    let results = [];
    for (const u in units) {
        if (u !== unit) {
            results.push(`${(baseValue / units[u]).toFixed(6)} ${u}`);
        }
    }
    return results.join(' | ');
}

function toRoman(num) {
    const values = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let result = '';
    for (const [value, symbol] of values) {
        while (num >= value) {
            result += symbol;
            num -= value;
        }
    }
    return result;
}

function fromRoman(roman) {
    const values = { 'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000 };
    let result = 0;
    for (let i = 0; i < roman.length; i++) {
        const current = values[roman[i]];
        const next = values[roman[i + 1]];
        if (next && current < next) result -= current;
        else result += current;
    }
    return result;
}

function getWeekNumber(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const timezones = {
    'UTC': 0, 'GMT': 0, 'EST': -5, 'EDT': -4, 'CST': -6, 'CDT': -5,
    'MST': -7, 'MDT': -6, 'PST': -8, 'PDT': -7, 'AKST': -9, 'HST': -10,
    'CET': 1, 'CEST': 2, 'EET': 2, 'EEST': 3, 'MSK': 3, 'JST': 9,
    'KST': 9, 'AEST': 10, 'AEDT': 11, 'ACST': 9.5,
    'AWST': 8, 'NZST': 12, 'NZDT': 13, 'IST': 5.5, 'PKT': 5,
    'BST': 6, 'WIB': 7, 'WITA': 8, 'WIT': 9, 'SGT': 8, 'HKT': 8, 'PHT': 8
};

const weightUnits = {'Milligrams (mg)': 0.000001, 'Grams (g)': 0.001, 'Kilograms (kg)': 1, 'Tons (t)': 1000, 'Ounces (oz)': 0.0283495, 'Pounds (lbs)': 0.453592, 'Stones (st)': 6.35029, 'Carats (ct)': 0.0002};
const tempUnits = {'Celsius (°C)': 1, 'Fahrenheit (°F)': 1, 'Kelvin (K)': 1, 'Rankine (°R)': 1, 'Réaumur (°Ré)': 1};
const distanceUnits = {'Millimeters (mm)': 0.001, 'Centimeters (cm)': 0.01, 'Meters (m)': 1, 'Kilometers (km)': 1000, 'Inches (in)': 0.0254, 'Feet (ft)': 0.3048, 'Yards (yd)': 0.9144, 'Miles (mi)': 1609.344, 'Nautical Miles (nmi)': 1852};
const durationUnits = {'Milliseconds (ms)': 0.001, 'Seconds (s)': 1, 'Minutes (min)': 60, 'Hours (h)': 3600, 'Days (d)': 86400, 'Weeks (wk)': 604800, 'Months (mo)': 2592000, 'Years (yr)': 31536000};
const speedUnits = {'Meters per second (m/s)': 1, 'Kilometers per hour (km/h)': 0.277778, 'Miles per hour (mph)': 0.44704, 'Knots (kn)': 0.514444, 'Feet per second (ft/s)': 0.3048, 'Mach (M)': 340.29};
const areaUnits = {'Square meters (m²)': 1, 'Square kilometers (km²)': 1000000, 'Square feet (ft²)': 0.092903, 'Square yards (yd²)': 0.836127, 'Acres': 4046.86, 'Hectares (ha)': 10000, 'Square miles (mi²)': 2589988.11};
const volumeUnits = {'Liters (L)': 1, 'Milliliters (mL)': 0.001, 'Cubic meters (m³)': 1000, 'Gallons (gal)': 3.78541, 'Quarts (qt)': 0.946353, 'Pints (pt)': 0.473176, 'Cups': 0.236588, 'Fluid ounces (fl oz)': 0.0295735};
const pressureUnits = {'Pascal (Pa)': 1, 'Kilopascal (kPa)': 1000, 'Bar': 100000, 'Atmosphere (atm)': 101325, 'mmHg': 133.322, 'PSI': 6894.76};
const energyUnits = {'Joules (J)': 1, 'Kilojoules (kJ)': 1000, 'Calories (cal)': 4.184, 'Kilocalories (kcal)': 4184, 'Watt-hours (Wh)': 3600, 'BTU': 1055.06};
const powerUnits = {'Watts (W)': 1, 'Kilowatts (kW)': 1000, 'Horsepower (hp)': 745.7, 'BTU per hour': 0.293071};
const angleUnits = {'Degrees (°)': 1, 'Radians (rad)': 57.2958, 'Gradians (grad)': 0.9, "Minutes (')": 0.0166667, 'Seconds (")': 0.000277778};

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}