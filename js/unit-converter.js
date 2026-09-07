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
    const timeResult = document.createElement('div');
    timeResult.style.marginTop = '1rem';
    timeConvertBtn.parentNode.appendChild(timeResult);
    
    const timezones = {
        UTC: 0,
        EST: -5,
        PST: -8,
        GMT: 0,
        CET: 1,
        EET: 2,
        MSK: 3,
        JST: 9,
        AEST: 10
    };
    
    for (const tz in timezones) {
        const option1 = document.createElement('option');
        option1.value = tz;
        option1.textContent = tz;
        timezoneFrom.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = tz;
        option2.textContent = tz;
        timezoneTo.appendChild(option2);
    }
    
    timeConvertBtn.addEventListener('click', function() {
        const from = timezones[timezoneFrom.value];
        const to = timezones[timezoneTo.value];
        const now = new Date();
        const utcHours = now.getUTCHours();
        const utcMinutes = now.getUTCMinutes();
        
        const fromTime = utcHours + from;
        const toTime = utcHours + to;
        const diff = to - from;
        
        const resultDate = new Date();
        resultDate.setHours(resultDate.getHours() + diff);
        
        timeResult.textContent = `Current time in ${timezoneTo.value}: ${resultDate.toLocaleTimeString()}`;
    });
    
    const weightInput = document.querySelector('#weightConverter input[type="number"]');
    const weightUnit = document.querySelector('#weightConverter select');
    const weightBtn = document.querySelector('#weightConverter button');
    const weightResult = document.createElement('div');
    weightResult.style.marginTop = '1rem';
    weightBtn.parentNode.appendChild(weightResult);
    
    const weightUnits = {
        kg: 1,
        lbs: 0.453592,
        oz: 0.0283495,
        g: 0.001,
        ton: 1000
    };
    
    for (const unit in weightUnits) {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit.toUpperCase();
        weightUnit.appendChild(option);
    }
    
    weightBtn.addEventListener('click', function() {
        const value = parseFloat(weightInput.value);
        const unit = weightUnit.value;
        
        if (!value || value <= 0) {
            alert('Please enter a valid weight');
            return;
        }
        
        const kgValue = value * weightUnits[unit];
        const results = [];
        
        for (const u in weightUnits) {
            results.push(`${(kgValue / weightUnits[u]).toFixed(2)} ${u.toUpperCase()}`);
        }
        
        weightResult.textContent = results.join(' | ');
    });
    
    const tempInput = document.querySelector('#temperatureConverter input[type="number"]');
    const tempUnit = document.querySelector('#temperatureConverter select');
    const tempBtn = document.querySelector('#temperatureConverter button');
    const tempResult = document.createElement('div');
    tempResult.style.marginTop = '1rem';
    tempBtn.parentNode.appendChild(tempResult);
    
    const tempUnits = ['celsius', 'fahrenheit', 'kelvin'];
    
    tempUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit;
        option.textContent = unit.charAt(0).toUpperCase() + unit.slice(1);
        tempUnit.appendChild(option);
    });
    
    tempBtn.addEventListener('click', function() {
        const value = parseFloat(tempInput.value);
        const unit = tempUnit.value;
        
        if (isNaN(value)) {
            alert('Please enter a valid temperature');
            return;
        }
        
        let celsius;
        if (unit === 'celsius') {
            celsius = value;
        } else if (unit === 'fahrenheit') {
            celsius = (value - 32) * 5/9;
        } else if (unit === 'kelvin') {
            celsius = value - 273.15;
        }
        
        const fahrenheit = celsius * 9/5 + 32;
        const kelvin = celsius + 273.15;
        
        tempResult.textContent = `${celsius.toFixed(2)}°C | ${fahrenheit.toFixed(2)}°F | ${kelvin.toFixed(2)}K`;
    });
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