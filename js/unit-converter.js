document.addEventListener('DOMContentLoaded', function() {
    const colorPicker = document.getElementById('colorPicker');
    const hexInput = document.getElementById('hexInput');
    const rgbInput = document.getElementById('rgbInput');
    const hslInput = document.getElementById('hslInput');
    
    colorPicker.addEventListener('input', function() {
        const hex = this.value;
        const rgb = hexToRgb(hex);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        hexInput.value = hex;
        rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    });
    
    hexInput.addEventListener('input', function() {
        const hex = this.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            colorPicker.value = hex;
            const rgb = hexToRgb(hex);
            const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
            rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        }
    });
    
    const timezoneFrom = document.getElementById('timezoneFrom');
    const timezoneTo = document.getElementById('timezoneTo');
    const timeConvertBtn = document.querySelector('#timeConverter button');
    const timeResult = document.querySelector('#timeConverter .result-display');
    
    const timezones = {
        'UTC': 0, 'GMT': 0, 'EST': -5, 'EDT': -4, 'CST': -6, 'CDT': -5,
        'MST': -7, 'MDT': -6, 'PST': -8, 'PDT': -7, 'AKST': -9, 'HST': -10,
        'CET': 1, 'CEST': 2, 'EET': 2, 'EEST': 3, 'MSK': 3, 'JST': 9,
        'KST': 9, 'CST_CHINA': 8, 'AEST': 10, 'AEDT': 11, 'ACST': 9.5,
        'AWST': 8, 'NZST': 12, 'NZDT': 13, 'IST': 5.5, 'PKT': 5,
        'BST': 6, 'WIB': 7, 'WITA': 8, 'WIT': 9, 'SGT': 8, 'HKT': 8, 'PHT': 8
    };
    
    Object.keys(timezones).forEach(tz => {
        const option1 = document.createElement('option');
        option1.value = tz;
        option1.textContent = tz;
        timezoneFrom.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = tz;
        option2.textContent = tz;
        timezoneTo.appendChild(option2);
    });
    
    timeConvertBtn.addEventListener('click', function() {
        const from = timezones[timezoneFrom.value];
        const to = timezones[timezoneTo.value];
        const now = new Date();
        const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
        
        const fromTime = new Date(utcTime + from * 3600000);
        const toTime = new Date(utcTime + to * 3600000);
        
        timeResult.textContent = `${timezoneFrom.value}: ${fromTime.toLocaleTimeString()} | ${timezoneTo.value}: ${toTime.toLocaleTimeString()}`;
    });
    
    const weightInput = document.querySelector('#weightConverter input[type="number"]');
    const weightUnit = document.querySelector('#weightConverter select');
    const weightBtn = document.querySelector('#weightConverter button');
    const weightResult = document.querySelector('#weightConverter .result-display');
    
    const weightUnits = {
        'Milligrams (mg)': 0.000001, 'Grams (g)': 0.001, 'Kilograms (kg)': 1,
        'Tons (t)': 1000, 'Ounces (oz)': 0.0283495, 'Pounds (lbs)': 0.453592,
        'Stones (st)': 6.35029, 'Carats (ct)': 0.0002, 'Grains (gr)': 0.0000647989
    };
    
    Object.keys(weightUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        weightUnit.appendChild(option);
    });
    
    weightBtn.addEventListener('click', function() {
        const value = parseFloat(weightInput.value);
        const unit = weightUnit.value;
        
        if (!value || value <= 0) {
            showError(weightInput, 'Please enter a valid weight');
            return;
        }
        
        const kgValue = value * weightUnits[unit];
        let results = [];
        
        for (const u in weightUnits) {
            if (u !== unit) {
                results.push(`${(kgValue / weightUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        weightResult.textContent = results.join(' | ');
    });
    
    const tempInput = document.querySelector('#temperatureConverter input[type="number"]');
    const tempUnit = document.querySelector('#temperatureConverter select');
    const tempBtn = document.querySelector('#temperatureConverter button');
    const tempResult = document.querySelector('#temperatureConverter .result-display');
    
    const tempUnits = {
        'Celsius (°C)': 'celsius', 'Fahrenheit (°F)': 'fahrenheit',
        'Kelvin (K)': 'kelvin', 'Rankine (°R)': 'rankine', 'Réaumur (°Ré)': 'reaumur'
    };
    
    Object.keys(tempUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = tempUnits[unit];
        option.textContent = unit;
        tempUnit.appendChild(option);
    });
    
    tempBtn.addEventListener('click', function() {
        const value = parseFloat(tempInput.value);
        const unit = tempUnit.value;
        
        if (isNaN(value)) {
            showError(tempInput, 'Please enter a valid temperature');
            return;
        }
        
        let celsius;
        switch(unit) {
            case 'celsius': celsius = value; break;
            case 'fahrenheit': celsius = (value - 32) * 5/9; break;
            case 'kelvin': celsius = value - 273.15; break;
            case 'rankine': celsius = (value - 491.67) * 5/9; break;
            case 'reaumur': celsius = value * 5/4; break;
        }
        
        const fahrenheit = celsius * 9/5 + 32;
        const kelvin = celsius + 273.15;
        const rankine = (celsius + 273.15) * 9/5;
        const reaumur = celsius * 4/5;
        
        tempResult.textContent = `${celsius.toFixed(2)}°C | ${fahrenheit.toFixed(2)}°F | ${kelvin.toFixed(2)}K | ${rankine.toFixed(2)}°R | ${reaumur.toFixed(2)}°Ré`;
    });
    
    const distanceInput = document.querySelector('#distanceConverter input[type="number"]');
    const distanceUnit = document.querySelector('#distanceConverter select');
    const distanceBtn = document.querySelector('#distanceConverter button');
    const distanceResult = document.querySelector('#distanceConverter .result-display');
    
    const distanceUnits = {
        'Millimeters (mm)': 0.001, 'Centimeters (cm)': 0.01, 'Meters (m)': 1,
        'Kilometers (km)': 1000, 'Inches (in)': 0.0254, 'Feet (ft)': 0.3048,
        'Yards (yd)': 0.9144, 'Miles (mi)': 1609.344,
        'Nautical Miles (nmi)': 1852, 'Light Years (ly)': 9460730472580800,
        'Astronomical Units (au)': 149597870700
    };
    
    Object.keys(distanceUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        distanceUnit.appendChild(option);
    });
    
    distanceBtn.addEventListener('click', function() {
        const value = parseFloat(distanceInput.value);
        const unit = distanceUnit.value;
        
        if (!value || value <= 0) {
            showError(distanceInput, 'Please enter a valid distance');
            return;
        }
        
        const meterValue = value * distanceUnits[unit];
        let results = [];
        
        for (const u in distanceUnits) {
            if (u !== unit) {
                results.push(`${(meterValue / distanceUnits[u]).toFixed(6)} ${u}`);
            }
        }
        
        distanceResult.textContent = results.join(' | ');
    });
    
    const durationInput = document.querySelector('#durationConverter input[type="number"]');
    const durationUnit = document.querySelector('#durationConverter select');
    const durationBtn = document.querySelector('#durationConverter button');
    const durationResult = document.querySelector('#durationConverter .result-display');
    
    const durationUnits = {
        'Milliseconds (ms)': 0.001, 'Seconds (s)': 1, 'Minutes (min)': 60,
        'Hours (h)': 3600, 'Days (d)': 86400, 'Weeks (wk)': 604800,
        'Months (mo)': 2592000, 'Years (yr)': 31536000,
        'Decades': 315360000, 'Centuries': 3153600000
    };
    
    Object.keys(durationUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        durationUnit.appendChild(option);
    });
    
    durationBtn.addEventListener('click', function() {
        const value = parseFloat(durationInput.value);
        const unit = durationUnit.value;
        
        if (!value || value <= 0) {
            showError(durationInput, 'Please enter a valid duration');
            return;
        }
        
        const secondsValue = value * durationUnits[unit];
        let results = [];
        
        for (const u in durationUnits) {
            if (u !== unit) {
                results.push(`${(secondsValue / durationUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        durationResult.textContent = results.join(' | ');
    });
    
    const speedInput = document.querySelector('#speedConverter input[type="number"]');
    const speedUnit = document.querySelector('#speedConverter select');
    const speedBtn = document.querySelector('#speedConverter button');
    const speedResult = document.querySelector('#speedConverter .result-display');
    
    const speedUnits = {
        'Meters per second (m/s)': 1,
        'Kilometers per hour (km/h)': 0.277778,
        'Miles per hour (mph)': 0.44704,
        'Knots (kn)': 0.514444,
        'Feet per second (ft/s)': 0.3048,
        'Mach (M)': 340.29
    };
    
    Object.keys(speedUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        speedUnit.appendChild(option);
    });
    
    speedBtn.addEventListener('click', function() {
        const value = parseFloat(speedInput.value);
        const unit = speedUnit.value;
        
        if (!value || value <= 0) {
            showError(speedInput, 'Please enter a valid speed');
            return;
        }
        
        const msValue = value * speedUnits[unit];
        let results = [];
        
        for (const u in speedUnits) {
            if (u !== unit) {
                results.push(`${(msValue / speedUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        speedResult.textContent = results.join(' | ');
    });
    
    const areaInput = document.querySelector('#areaConverter input[type="number"]');
    const areaUnit = document.querySelector('#areaConverter select');
    const areaBtn = document.querySelector('#areaConverter button');
    const areaResult = document.querySelector('#areaConverter .result-display');
    
    const areaUnits = {
        'Square meters (m²)': 1,
        'Square kilometers (km²)': 1000000,
        'Square feet (ft²)': 0.092903,
        'Square yards (yd²)': 0.836127,
        'Acres': 4046.86,
        'Hectares (ha)': 10000,
        'Square miles (mi²)': 2589988.11
    };
    
    Object.keys(areaUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        areaUnit.appendChild(option);
    });
    
    areaBtn.addEventListener('click', function() {
        const value = parseFloat(areaInput.value);
        const unit = areaUnit.value;
        
        if (!value || value <= 0) {
            showError(areaInput, 'Please enter a valid area');
            return;
        }
        
        const m2Value = value * areaUnits[unit];
        let results = [];
        
        for (const u in areaUnits) {
            if (u !== unit) {
                results.push(`${(m2Value / areaUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        areaResult.textContent = results.join(' | ');
    });
    
    const volumeInput = document.querySelector('#volumeConverter input[type="number"]');
    const volumeUnit = document.querySelector('#volumeConverter select');
    const volumeBtn = document.querySelector('#volumeConverter button');
    const volumeResult = document.querySelector('#volumeConverter .result-display');
    
    const volumeUnits = {
        'Liters (L)': 1,
        'Milliliters (mL)': 0.001,
        'Cubic meters (m³)': 1000,
        'Gallons (gal)': 3.78541,
        'Quarts (qt)': 0.946353,
        'Pints (pt)': 0.473176,
        'Cups': 0.236588,
        'Fluid ounces (fl oz)': 0.0295735,
        'Barrels (bbl)': 158.987
    };
    
    Object.keys(volumeUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        volumeUnit.appendChild(option);
    });
    
    volumeBtn.addEventListener('click', function() {
        const value = parseFloat(volumeInput.value);
        const unit = volumeUnit.value;
        
        if (!value || value <= 0) {
            showError(volumeInput, 'Please enter a valid volume');
            return;
        }
        
        const literValue = value * volumeUnits[unit];
        let results = [];
        
        for (const u in volumeUnits) {
            if (u !== unit) {
                results.push(`${(literValue / volumeUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        volumeResult.textContent = results.join(' | ');
    });
    
    const pressureInput = document.querySelector('#pressureConverter input[type="number"]');
    const pressureUnit = document.querySelector('#pressureConverter select');
    const pressureBtn = document.querySelector('#pressureConverter button');
    const pressureResult = document.querySelector('#pressureConverter .result-display');
    
    const pressureUnits = {
        'Pascal (Pa)': 1,
        'Kilopascal (kPa)': 1000,
        'Bar': 100000,
        'Atmosphere (atm)': 101325,
        'mmHg': 133.322,
        'PSI': 6894.76
    };
    
    Object.keys(pressureUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        pressureUnit.appendChild(option);
    });
    
    pressureBtn.addEventListener('click', function() {
        const value = parseFloat(pressureInput.value);
        const unit = pressureUnit.value;
        
        if (!value || value <= 0) {
            showError(pressureInput, 'Please enter a valid pressure');
            return;
        }
        
        const paValue = value * pressureUnits[unit];
        let results = [];
        
        for (const u in pressureUnits) {
            if (u !== unit) {
                results.push(`${(paValue / pressureUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        pressureResult.textContent = results.join(' | ');
    });
    
    const energyInput = document.querySelector('#energyConverter input[type="number"]');
    const energyUnit = document.querySelector('#energyConverter select');
    const energyBtn = document.querySelector('#energyConverter button');
    const energyResult = document.querySelector('#energyConverter .result-display');
    
    const energyUnits = {
        'Joules (J)': 1,
        'Kilojoules (kJ)': 1000,
        'Calories (cal)': 4.184,
        'Kilocalories (kcal)': 4184,
        'Watt-hours (Wh)': 3600,
        'Electron volts (eV)': 1.602e-19,
        'BTU': 1055.06
    };
    
    Object.keys(energyUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        energyUnit.appendChild(option);
    });
    
    energyBtn.addEventListener('click', function() {
        const value = parseFloat(energyInput.value);
        const unit = energyUnit.value;
        
        if (!value || value <= 0) {
            showError(energyInput, 'Please enter a valid energy value');
            return;
        }
        
        const jouleValue = value * energyUnits[unit];
        let results = [];
        
        for (const u in energyUnits) {
            if (u !== unit) {
                results.push(`${(jouleValue / energyUnits[u]).toFixed(6)} ${u}`);
            }
        }
        
        energyResult.textContent = results.join(' | ');
    });
    
    const powerInput = document.querySelector('#powerConverter input[type="number"]');
    const powerUnit = document.querySelector('#powerConverter select');
    const powerBtn = document.querySelector('#powerConverter button');
    const powerResult = document.querySelector('#powerConverter .result-display');
    
    const powerUnits = {
        'Watts (W)': 1,
        'Kilowatts (kW)': 1000,
        'Horsepower (hp)': 745.7,
        'BTU per hour': 0.293071,
        'Foot-pounds per minute': 0.022597
    };
    
    Object.keys(powerUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        powerUnit.appendChild(option);
    });
    
    powerBtn.addEventListener('click', function() {
        const value = parseFloat(powerInput.value);
        const unit = powerUnit.value;
        
        if (!value || value <= 0) {
            showError(powerInput, 'Please enter a valid power value');
            return;
        }
        
        const wattValue = value * powerUnits[unit];
        let results = [];
        
        for (const u in powerUnits) {
            if (u !== unit) {
                results.push(`${(wattValue / powerUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        powerResult.textContent = results.join(' | ');
    });
    
    const angleInput = document.querySelector('#angleConverter input[type="number"]');
    const angleUnit = document.querySelector('#angleConverter select');
    const angleBtn = document.querySelector('#angleConverter button');
    const angleResult = document.querySelector('#angleConverter .result-display');
    
    const angleUnits = {
        'Degrees (°)': 1,
        'Radians (rad)': 57.2958,
        'Gradians (grad)': 0.9,
        'Minutes (')': 0.0166667,
        'Seconds (")': 0.000277778
    };
    
    Object.keys(angleUnits).forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit;
        angleUnit.appendChild(option);
    });
    
    angleBtn.addEventListener('click', function() {
        const value = parseFloat(angleInput.value);
        const unit = angleUnit.value;
        
        if (isNaN(value)) {
            showError(angleInput, 'Please enter a valid angle');
            return;
        }
        
        const degreeValue = value * angleUnits[unit];
        let results = [];
        
        for (const u in angleUnits) {
            if (u !== unit) {
                results.push(`${(degreeValue / angleUnits[u]).toFixed(4)} ${u}`);
            }
        }
        
        angleResult.textContent = results.join(' | ');
    });
    
    const fractionInput = document.querySelector('#fractionConverter input');
    const fractionBtn = document.querySelector('#fractionConverter button');
    const fractionResult = document.querySelector('#fractionConverter .result-display');
    
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
    
    const romanInput = document.querySelector('#romanConverter input');
    const romanBtn = document.querySelector('#romanConverter button');
    const romanResult = document.querySelector('#romanConverter .result-display');
    
    romanBtn.addEventListener('click', function() {
        const input = romanInput.value.trim().toUpperCase();
        
        if (/^\d+$/.test(input)) {
            romanResult.textContent = `${input} = ${toRoman(parseInt(input))}`;
        } else if (/^[IVXLCDM]+$/.test(input)) {
            romanResult.textContent = `${input} = ${fromRoman(input)}`;
        } else {
            showError(romanInput, 'Please enter a valid number or Roman numeral');
        }
    });
    
    function toRoman(num) {
        const values = [
            [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
            [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
            [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
        ];
        
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
            
            if (next && current < next) {
                result -= current;
            } else {
                result += current;
            }
        }
        
        return result;
    }
    
    const numberSystemInput = document.querySelector('#numberSystemConverter input');
    const numberSystemSelect = document.querySelector('#numberSystemConverter select');
    const numberSystemBtn = document.querySelector('#numberSystemConverter button');
    const numberSystemResult = document.querySelector('#numberSystemConverter .result-display');
    
    numberSystemBtn.addEventListener('click', function() {
        const input = numberSystemInput.value.trim();
        const system = numberSystemSelect.value;
        
        let decimal;
        
        try {
            switch(system) {
                case 'binary': decimal = parseInt(input, 2); break;
                case 'octal': decimal = parseInt(input, 8); break;
                case 'decimal': decimal = parseInt(input, 10); break;
                case 'hexadecimal': decimal = parseInt(input, 16); break;
            }
            
            if (isNaN(decimal)) {
                throw new Error('Invalid number');
            }
            
            numberSystemResult.textContent = 
                `Binary: ${decimal.toString(2)}\n` +
                `Octal: ${decimal.toString(8)}\n` +
                `Decimal: ${decimal.toString(10)}\n` +
                `Hexadecimal: ${decimal.toString(16).toUpperCase()}`;
        } catch (e) {
            showError(numberSystemInput, 'Invalid number for selected system');
        }
    });
    
    const dateInput = document.getElementById('dateInput');
    const dateBtn = document.querySelector('#dateConverter button');
    const dateResult = document.querySelector('#dateConverter .result-display');
    
    dateBtn.addEventListener('click', function() {
        if (!dateInput.value) {
            showError(dateInput, 'Please select a date');
            return;
        }
        
        const date = new Date(dateInput.value);
        const unixTimestamp = Math.floor(date.getTime() / 1000);
        
        dateResult.textContent = 
            `ISO: ${date.toISOString()}\n` +
            `Unix timestamp: ${unixTimestamp}\n` +
            `Day of week: ${date.toLocaleDateString('en-US', { weekday: 'long' })}\n` +
            `Week number: ${getWeekNumber(date)}`;
    });
    
    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }
    
    const uuidBtn = document.querySelector('#uuidGenerator button');
    const uuidResult = document.querySelector('#uuidGenerator .result-display');
    
    uuidBtn.addEventListener('click', function() {
        uuidResult.textContent = generateUUID();
    });
    
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
});

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}