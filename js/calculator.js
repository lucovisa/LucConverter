document.addEventListener('DOMContentLoaded', function() {
    initCalculator();
});

function initCalculator() {
    const calcSection = document.getElementById('calculator');
    if (!calcSection) return;
    calcSection.innerHTML = '';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';
    backBtn.textContent = '← Back';
    backBtn.addEventListener('click', () => showMainMenu());
    calcSection.appendChild(backBtn);

    const calcContainer = document.createElement('div');
    calcContainer.style.maxWidth = '350px';
    calcContainer.style.margin = '0 auto';
    calcContainer.style.background = 'transparent';
    calcContainer.style.padding = '0';

    const display = document.createElement('div');
    display.style.background = 'var(--panel-bg)';
    display.style.border = '1px solid var(--border)';
    display.style.borderRadius = '4px';
    display.style.padding = '1rem';
    display.style.marginBottom = '1rem';
    display.style.textAlign = 'right';
    display.style.fontSize = '2rem';
    display.style.minHeight = '60px';
    display.style.wordBreak = 'break-all';
    display.textContent = '0';
    calcContainer.appendChild(display);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'grid';
    buttonsContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    buttonsContainer.style.gap = '0.5rem';

    const buttons = [
        { text: 'C', type: 'clear', bg: '#8B0000', color: '#fff' },
        { text: '±', type: 'negate', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '%', type: 'percent', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '÷', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '7', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '8', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '9', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '×', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '4', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '5', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '6', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '-', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '1', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '2', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '3', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '+', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '0', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '.', type: 'decimal', bg: '#2a475e', color: '#c7d5e0' },
        { text: '⌫', type: 'backspace', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '=', type: 'equals', bg: '#2e7d32', color: '#fff' }
    ];

    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let shouldResetDisplay = false;
    let errorState = false;

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.padding = '1rem';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.background = btn.bg;
        button.style.color = btn.color;
        button.style.fontSize = '1.2rem';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';

        if (btn.text === '0') {
            button.style.gridColumn = 'span 2';
        }

        button.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.2)';
        });
        button.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1)';
        });
        button.addEventListener('click', function() {
            handleButtonClick(btn.text, btn.type);
        });

        buttonsContainer.appendChild(button);
    });

    calcContainer.appendChild(buttonsContainer);

    const keyboardInfo = document.createElement('p');
    keyboardInfo.style.marginTop = '1rem';
    keyboardInfo.style.textAlign = 'center';
    keyboardInfo.style.fontSize = '0.85rem';
    keyboardInfo.style.opacity = '0.7';
    keyboardInfo.textContent = 'Keyboard: 0-9, +, -, *, /, Enter, Backspace, Escape';
    calcContainer.appendChild(keyboardInfo);

    calcSection.appendChild(calcContainer);

    function handleButtonClick(text, type) {
        if (errorState) {
            clearAll();
            errorState = false;
        }
        switch(type) {
            case 'number':
                inputNumber(text);
                break;
            case 'decimal':
                inputDecimal();
                break;
            case 'operator':
                inputOperator(text);
                break;
            case 'equals':
                calculate();
                break;
            case 'clear':
                clearAll();
                break;
            case 'backspace':
                backspace();
                break;
            case 'negate':
                negate();
                break;
            case 'percent':
                percent();
                break;
        }
        updateDisplay();
    }

    function inputNumber(num) {
        if (errorState) {
            currentInput = num;
            errorState = false;
            shouldResetDisplay = false;
        } else if (shouldResetDisplay) {
            currentInput = num;
            shouldResetDisplay = false;
        } else {
            currentInput = currentInput === '0' ? num : currentInput + num;
        }
    }

    function inputDecimal() {
        if (errorState) {
            currentInput = '0.';
            errorState = false;
            shouldResetDisplay = false;
        } else if (shouldResetDisplay) {
            currentInput = '0.';
            shouldResetDisplay = false;
        } else if (!currentInput.includes('.')) {
            currentInput += '.';
        }
    }

    function inputOperator(op) {
        if (errorState) return;
        if (operator !== null && !shouldResetDisplay) {
            calculate();
        }
        previousInput = currentInput;
        operator = op;
        shouldResetDisplay = true;
    }

    function calculate() {
        if (operator === null || shouldResetDisplay) return;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        let result;
        switch(operator) {
            case '+': result = prev + current; break;
            case '-': result = prev - current; break;
            case '×': result = prev * current; break;
            case '÷':
                if (current === 0) {
                    display.textContent = 'Error';
                    errorState = true;
                    operator = null;
                    shouldResetDisplay = false;
                    return;
                }
                result = prev / current;
                break;
        }
        currentInput = String(result);
        operator = null;
        shouldResetDisplay = true;
    }

    function clearAll() {
        currentInput = '0';
        previousInput = '';
        operator = null;
        shouldResetDisplay = false;
        errorState = false;
    }

    function backspace() {
        if (errorState) {
            clearAll();
            return;
        }
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
    }

    function negate() {
        if (errorState) return;
        currentInput = String(parseFloat(currentInput) * -1);
    }

    function percent() {
        if (errorState) return;
        currentInput = String(parseFloat(currentInput) / 100);
    }

    function updateDisplay() {
        display.textContent = errorState ? 'Error' : currentInput;
    }

    document.addEventListener('keydown', function(e) {
        if (calcSection.style.display === 'none') return;
        const key = e.key;
        if (key >= '0' && key <= '9') {
            handleButtonClick(key, 'number');
        } else if (key === '.') {
            handleButtonClick('.', 'decimal');
        } else if (key === '+') {
            handleButtonClick('+', 'operator');
        } else if (key === '-') {
            handleButtonClick('-', 'operator');
        } else if (key === '*') {
            handleButtonClick('×', 'operator');
        } else if (key === '/') {
            e.preventDefault();
            handleButtonClick('÷', 'operator');
        } else if (key === 'Enter' || key === '=') {
            handleButtonClick('=', 'equals');
        } else if (key === 'Backspace') {
            handleButtonClick('⌫', 'backspace');
        } else if (key === 'Escape') {
            handleButtonClick('C', 'clear');
        } else if (key === '%') {
            handleButtonClick('%', 'percent');
        }
    });
}