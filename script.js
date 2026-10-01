'use strict';

// Calculator state object
// Tracks the current input, stored operand, pending operator, and error/result flags
const state = {
  currentNumber: '0',
  storedNumber: null,
  pendingOperator: null,
  isResultDisplayed: false,
  isErrorState: false,
};

// Helper: Round a floating-point number to avoid arithmetic noise
// e.g. 0.1 + 0.2 = 0.30000000000000004 → roundToPrecision fixes this to 0.3
function roundToPrecision(num, decimals = 10) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

// Pure arithmetic functions — no side effects

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

// divide returns null on division by zero so the caller can show an error
function divide(a, b) {
  if (b === 0) {
    return null;
  }
  return a / b;
}

// calculate performs the pending operation using left-to-right evaluation:
// storedNumber <operator> currentNumber → result
// Returns the numeric result, or null if division by zero occurs.
function calculate(storedNumber, operator, currentNumber) {
  const a = parseFloat(storedNumber);
  const b = parseFloat(currentNumber);
  let result;

  switch (operator) {
    case '+':
      result = add(a, b);
      break;
    case '-':
      result = subtract(a, b);
      break;
    case '×':
      result = multiply(a, b);
      break;
    case '÷':
      result = divide(a, b);
      // Division by zero: propagate null to caller
      if (result === null) {
        return null;
      }
      break;
    default:
      return null;
  }

  // Apply floating-point precision handling to eliminate arithmetic noise
  return roundToPrecision(result);
}

// --- DOM interaction ---

const display = document.getElementById('display');

function updateDisplay(value) {
  display.textContent = value;
  display.setAttribute('aria-label', `Calculator display: ${value}`);
}

function handleDigit(digit) {
  if (state.isErrorState) return;

  if (state.isResultDisplayed) {
    // Start fresh after a result
    state.currentNumber = digit;
    state.isResultDisplayed = false;
  } else if (state.currentNumber === '0' && digit !== '.') {
    state.currentNumber = digit;
  } else {
    state.currentNumber += digit;
  }

  updateDisplay(state.currentNumber);
}

function handleDecimal() {
  if (state.isErrorState) return;

  if (state.isResultDisplayed) {
    state.currentNumber = '0.';
    state.isResultDisplayed = false;
    updateDisplay(state.currentNumber);
    return;
  }

  if (!state.currentNumber.includes('.')) {
    state.currentNumber += '.';
    updateDisplay(state.currentNumber);
  }
}

function handleOperator(operator) {
  if (state.isErrorState) return;

  // Left-to-right evaluation: if there is already a pending operator,
  // evaluate it before storing the new one.
  if (state.pendingOperator !== null && !state.isResultDisplayed) {
    const result = calculate(state.storedNumber, state.pendingOperator, state.currentNumber);
    if (result === null) {
      state.isErrorState = true;
      updateDisplay('Error');
      return;
    }
    state.storedNumber = String(result);
    updateDisplay(state.storedNumber);
  } else {
    state.storedNumber = state.currentNumber;
  }

  state.pendingOperator = operator;
  state.isResultDisplayed = true;
}

function handleEquals() {
  if (state.isErrorState) return;
  if (state.pendingOperator === null || state.storedNumber === null) return;

  const result = calculate(state.storedNumber, state.pendingOperator, state.currentNumber);
  if (result === null) {
    state.isErrorState = true;
    updateDisplay('Error');
    return;
  }

  state.currentNumber = String(result);
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = true;
  updateDisplay(state.currentNumber);
}

function handleClear() {
  state.currentNumber = '0';
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = false;
  state.isErrorState = false;
  updateDisplay('0');
}

function handleBackspace() {
  if (state.isErrorState || state.isResultDisplayed) return;

  if (state.currentNumber.length > 1) {
    state.currentNumber = state.currentNumber.slice(0, -1);
  } else {
    state.currentNumber = '0';
  }
  updateDisplay(state.currentNumber);
}

// Event delegation: one listener handles all button clicks
document.querySelector('.button-grid').addEventListener('click', function (event) {
  const btn = event.target.closest('button');
  if (!btn) return;

  if (btn.dataset.digit !== undefined) {
    handleDigit(btn.dataset.digit);
    return;
  }

  if (btn.dataset.operator !== undefined) {
    handleOperator(btn.dataset.operator);
    return;
  }

  switch (btn.dataset.action) {
    case 'clear':
      handleClear();
      break;
    case 'backspace':
      handleBackspace();
      break;
    case 'equals':
      handleEquals();
      break;
    case 'decimal':
      handleDecimal();
      break;
  }
});

// Keyboard support
document.addEventListener('keydown', function (event) {
  if (event.key >= '0' && event.key <= '9') {
    handleDigit(event.key);
  } else if (event.key === '.') {
    handleDecimal();
  } else if (event.key === '+') {
    handleOperator('+');
  } else if (event.key === '-') {
    handleOperator('-');
  } else if (event.key === '*') {
    handleOperator('×');
  } else if (event.key === '/') {
    event.preventDefault();
    handleOperator('÷');
  } else if (event.key === 'Enter' || event.key === '=') {
    handleEquals();
  } else if (event.key === 'Backspace') {
    handleBackspace();
  } else if (event.key === 'Escape') {
    handleClear();
  }
});
