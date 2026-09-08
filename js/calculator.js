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
    calcContainer.style.maxWidth = '400px';
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
    buttonsContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    buttonsContainer.style.gap = '0.5rem';

    const buttons = [
        { text: 'sin', type: 'sin', bg: '#3d5a80', color: '#c7d5e0' },
        { text: 'cos', type: 'cos', bg: '#3d5a80', color: '#c7d5e0' },
        { text: 'log', type: 'log', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '√', type: 'sqrt', bg: '#3d5a80', color: '#c7d5e0' },
        { text: 'π', type: 'pi', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '(', type: 'paren', bg: '#3d5a80', color: '#c7d5e0' },
        { text: ')', type: 'paren', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '%', type: 'percent', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '÷', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: 'C', type: 'clear', bg: '#8B0000', color: '#fff' },
        { text: '7', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '8', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '9', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '×', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '⌫', type: 'backspace', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '4', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '5', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '6', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '-', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '±', type: 'negate', bg: '#3d5a80', color: '#c7d5e0' },
        { text: '1', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '2', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '3', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '+', type: 'operator', bg: '#1a44c2', color: '#fff' },
        { text: '=', type: 'equals', bg: '#2e7d32', color: '#fff' },
        { text: '0', type: 'number', bg: '#2a475e', color: '#c7d5e0' },
        { text: '.', type: 'decimal', bg: '#2a475e', color: '#c7d5e0' }
    ];

    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let shouldResetDisplay = false;
    let errorState = false;

    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.textContent = btn.text;
        button.style.padding = '0.8rem';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.background = btn.bg;
        button.style.color = btn.color;
        button.style.fontSize = '1rem';
        button.style.cursor = 'pointer';
        button.style.transition = 'all 0.2s ease';

        if (btn.text === '0') {
            button.style.gridColumn = 'span 2';
        }
        if (btn.text === '=') {
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
            case 'sqrt':
                sqrt();
                break;
            case 'sin':
                scientific('sin');
                break;
            case 'cos':
                scientific('cos');
                break;
            case 'log':
                scientific('log');
                break;
            case 'pi':
                currentInput = String(Math.PI);
                shouldResetDisplay = true;
                break;
            case 'paren':
                inputParen(text);
                break;
        }
        updateDisplay();
    }

    function inputNumber(num) {
        if (shouldResetDisplay || errorState) {
            currentInput = num;
            shouldResetDisplay = false;
            errorState = false;
        } else {
            currentInput = currentInput === '0' ? num : currentInput + num;
        }
    }

    function inputDecimal() {
        if (shouldResetDisplay || errorState) {
            currentInput = '0.';
            shouldResetDisplay = false;
            errorState = false;
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

    function inputParen(paren) {
        if (shouldResetDisplay) {
            currentInput = paren;
            shouldResetDisplay = false;
        } else {
            currentInput += paren;
        }
    }

    function calculate() {
        if (operator === null || shouldResetDisplay || errorState) return;
        let expression = previousInput + operator + currentInput;
        try {
            expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
            const result = eval(expression);
            currentInput = String(result);
            operator = null;
            shouldResetDisplay = true;
        } catch (e) {
            display.textContent = 'Error';
            errorState = true;
            operator = null;
            shouldResetDisplay = false;
            return;
        }
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

    function sqrt() {
        if (errorState) return;
        const value = parseFloat(currentInput);
        if (value < 0) {
            display.textContent = 'Error';
            errorState = true;
            return;
        }
        currentInput = String(Math.sqrt(value));
        shouldResetDisplay = true;
    }

    function scientific(func) {
        if (errorState) return;
        const value = parseFloat(currentInput);
        let result;
        switch(func) {
            case 'sin':
                result = Math.sin(value * Math.PI / 180);
                break;
            case 'cos':
                result = Math.cos(value * Math.PI / 180);
                break;
            case 'log':
                if (value <= 0) {
                    display.textContent = 'Error';
                    errorState = true;
                    return;
                }
                result = Math.log10(value);
                break;
        }
        currentInput = String(result);
        shouldResetDisplay = true;
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