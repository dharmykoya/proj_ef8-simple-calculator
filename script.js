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

// updateDisplay reads current display value from state.currentNumber,
// falling back to '0' if currentNumber is empty.
function updateDisplay() {
  const display = document.getElementById('display');
  const value = state.currentNumber || '0';
  display.textContent = value;
  display.setAttribute('aria-label', `Calculator display: ${value}`);
}

// appendDigit handles digit (0-9) input entry with leading zero suppression.
// State transitions:
//   isErrorState → reset all state → accept new digit
//   isResultDisplayed → reset currentNumber → start fresh input
//   currentNumber === '0' && digit !== '0' → replace leading zero with digit
//   currentNumber === '0' && digit === '0' → discard (no multiple leading zeros)
//   otherwise → append digit to currentNumber
function appendDigit(digit) {
  // Clear error state on new digit input; reset to a clean slate
  if (state.isErrorState) {
    state.currentNumber = '0';
    state.isErrorState = false;
    state.storedNumber = null;
    state.pendingOperator = null;
  }

  // Start fresh after a completed result
  if (state.isResultDisplayed) {
    state.currentNumber = '0';
    state.isResultDisplayed = false;
  }

  // Leading zero suppression: replace lone '0' with the incoming non-zero digit
  if (state.currentNumber === '0' && digit !== '0') {
    state.currentNumber = digit;
  } else if (state.currentNumber === '0' && digit === '0') {
    // Discard superfluous leading zero — display stays as '0'
    return;
  } else {
    state.currentNumber += digit;
  }

  updateDisplay();
}

// appendDecimal adds a decimal point to the current number.
// Edge case: only one decimal point is allowed per number entry.
function appendDecimal() {
  // Single decimal constraint: ignore if '.' already present in currentNumber
  if (state.currentNumber.includes('.')) return;
  state.currentNumber += '.';
  updateDisplay();
}

// performCalculation evaluates storedNumber <pendingOperator> currentNumber.
// On success: updates currentNumber with the result, clears storedNumber and
//   pendingOperator, and sets isResultDisplayed to true.
// On division by zero: sets isErrorState to true and displays error message.
function performCalculation() {
  const result = calculate(state.storedNumber, state.pendingOperator, parseFloat(state.currentNumber));
  if (result === null) {
    // Division by zero: enter error state; no further input is accepted
    state.isErrorState = true;
    state.currentNumber = 'Error';
    updateDisplay();
    return;
  }
  state.currentNumber = String(result);
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = true;
}

// setOperator stores the selected operator and handles operator chaining.
// State transitions:
//   pendingOperator exists && currentNumber !== '' → evaluate pending operation first
//   then: store parseFloat(currentNumber) as storedNumber, set new pendingOperator,
//   reset currentNumber to '' for right-operand entry, set isResultDisplayed to false.
function setOperator(operator) {
  if (state.isErrorState) return;

  // Operator chaining: if there is already a pending operation and the user
  // has entered a right operand, evaluate it before accepting the new operator.
  if (state.pendingOperator && state.currentNumber !== '') {
    performCalculation();
    // If performCalculation encountered an error, abort operator handling
    if (state.isErrorState) return;
  }

  // Store the left operand for the upcoming binary operation
  state.storedNumber = parseFloat(state.currentNumber);
  state.pendingOperator = operator;
  // Clear currentNumber so the user enters the right operand from scratch
  state.currentNumber = '';
  state.isResultDisplayed = false;
  updateDisplay();
}

function handleDigit(digit) {
  appendDigit(digit);
}

function handleDecimal() {
  if (state.isErrorState) return;

  if (state.isResultDisplayed) {
    // After a result, start a new decimal number from '0.'
    state.currentNumber = '0.';
    state.isResultDisplayed = false;
    updateDisplay();
    return;
  }

  if (!state.currentNumber.includes('.')) {
    state.currentNumber += '.';
    updateDisplay();
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
      state.currentNumber = 'Error';
      updateDisplay();
      return;
    }
    state.storedNumber = String(result);
    state.currentNumber = state.storedNumber;
    updateDisplay();
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
    state.currentNumber = 'Error';
    updateDisplay();
    return;
  }

  state.currentNumber = String(result);
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = true;
  updateDisplay();
}

function handleClear() {
  state.currentNumber = '0';
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = false;
  state.isErrorState = false;
  updateDisplay();
}

function handleBackspace() {
  if (state.isErrorState || state.isResultDisplayed) return;

  if (state.currentNumber.length > 1) {
    state.currentNumber = state.currentNumber.slice(0, -1);
  } else {
    state.currentNumber = '0';
  }
  updateDisplay();
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
