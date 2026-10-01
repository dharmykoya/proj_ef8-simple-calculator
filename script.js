'use strict';

const state = {
  currentNumber: '0',
  storedNumber: null,
  pendingOperator: null,
  isResultDisplayed: false,
  isErrorState: false,
};

function roundToPrecision(num, decimals = 10) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

function add(a, b) { return a + b; }
function subtract(a, b) { return a - b; }
function multiply(a, b) { return a * b; }

function divide(a, b) {
  if (b === 0) return null;
  return a / b;
}

function calculate(storedNumber, operator, currentNumber) {
  const a = parseFloat(storedNumber);
  const b = parseFloat(currentNumber);
  let result;

  switch (operator) {
    case '+': result = add(a, b); break;
    case '-': result = subtract(a, b); break;
    case '×': result = multiply(a, b); break;
    case '÷':
      result = divide(a, b);
      if (result === null) return null;
      break;
    default:
      return null;
  }

  return roundToPrecision(result);
}

function updateDisplay() {
  const display = document.getElementById('display');
  const value = state.currentNumber || '0';
  display.textContent = value;
  display.setAttribute('aria-label', `Calculator display: ${value}`);
}

function clearError() {
  if (state.isErrorState) {
    state.currentNumber = '0';
    state.isErrorState = false;
  }
}

function appendDigit(digit) {
  clearError();

  if (state.isResultDisplayed) {
    state.currentNumber = '0';
    state.isResultDisplayed = false;
  }

  if (state.currentNumber === '0' && digit !== '0') {
    state.currentNumber = digit;
  } else if (state.currentNumber === '0' && digit === '0') {
    return;
  } else {
    state.currentNumber += digit;
  }

  updateDisplay();
}

function appendDecimal() {
  clearError();

  if (state.currentNumber.includes('.')) return;

  if (state.currentNumber === '') {
    state.currentNumber = '0.';
  } else {
    state.currentNumber += '.';
  }

  updateDisplay();
}

function performCalculation() {
  const result = calculate(state.storedNumber, state.pendingOperator, parseFloat(state.currentNumber));
  if (result === null) {
    state.currentNumber = 'Cannot divide by 0';
    state.isErrorState = true;
    updateDisplay();
    return;
  }
  state.currentNumber = String(result);
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = true;
}

function setOperator(operator) {
  clearError();

  if (state.pendingOperator && state.currentNumber !== '') {
    performCalculation();
    if (state.isErrorState) return;
  }

  state.storedNumber = parseFloat(state.currentNumber);
  state.pendingOperator = operator;
  state.currentNumber = '';
  state.isResultDisplayed = false;
  updateDisplay();
}

function equals() {
  if (state.pendingOperator === null) return;
  performCalculation();
  state.isResultDisplayed = true;
}

function clear() {
  state.currentNumber = '0';
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = false;
  state.isErrorState = false;
  updateDisplay();
}

function backspace() {
  if (state.isResultDisplayed) return;

  if (state.currentNumber.length <= 1) {
    state.currentNumber = '0';
  } else {
    state.currentNumber = state.currentNumber.slice(0, -1);
  }
  updateDisplay();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-digit]').forEach((button) => {
    button.addEventListener('click', () => appendDigit(button.dataset.digit));
  });

  document.querySelectorAll('[data-operator]').forEach((button) => {
    button.addEventListener('click', () => setOperator(button.dataset.operator));
  });

  const equalsBtn = document.querySelector('[data-action="equals"]');
  if (equalsBtn) equalsBtn.addEventListener('click', equals);

  const clearBtn = document.querySelector('[data-action="clear"]');
  if (clearBtn) clearBtn.addEventListener('click', clear);

  const backspaceBtn = document.querySelector('[data-action="backspace"]');
  if (backspaceBtn) backspaceBtn.addEventListener('click', backspace);

  const decimalBtn = document.querySelector('[data-action="decimal"]');
  if (decimalBtn) decimalBtn.addEventListener('click', appendDecimal);

  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        appendDigit(event.key);
        break;
      case '+':
        setOperator('+');
        break;
      case '-':
        setOperator('-');
        break;
      case '*':
        setOperator('×');
        break;
      case '/':
        event.preventDefault();
        setOperator('÷');
        break;
      case 'Enter':
        event.preventDefault();
        equals();
        break;
      case 'Escape':
        clear();
        break;
      case 'Backspace':
        backspace();
        break;
      case '.':
        appendDecimal();
        break;
    }
  });
});
