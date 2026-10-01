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

// clearError recovers from error state by resetting currentNumber to '0'.
// This is called at the start of input handlers so users can recover from
// error conditions (e.g. division by zero) by simply entering new input.
function clearError() {
  if (state.isErrorState) {
    state.currentNumber = '0';
    state.isErrorState = false;
  }
}

// appendDigit handles digit (0-9) input entry with leading zero suppression.
// State transitions:
//   isErrorState → clearError() resets currentNumber → accept new digit
//   isResultDisplayed → reset currentNumber → start fresh input
//   currentNumber === '0' && digit !== '0' → replace leading zero with digit
//   currentNumber === '0' && digit === '0' → discard (no multiple leading zeros)
//   otherwise → append digit to currentNumber
function appendDigit(digit) {
  // Clear error state on new digit input; allows recovery without full reset
  clearError();

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
  // Clear error state so the user can start fresh input after an error
  clearError();

  // Single decimal constraint: ignore if '.' already present in currentNumber
  if (state.currentNumber.includes('.')) return;
  state.currentNumber += '.';
  updateDisplay();
}

// performCalculation evaluates storedNumber <pendingOperator> currentNumber.
// On success: updates currentNumber with the result, clears storedNumber and
//   pendingOperator, and sets isResultDisplayed to true.
// On division by zero: sets isErrorState to true and displays a descriptive error message.
function performCalculation() {
  const result = calculate(state.storedNumber, state.pendingOperator, parseFloat(state.currentNumber));
  if (result === null) {
    // Division by zero: enter error state; clearError() in input handlers enables recovery
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

// setOperator stores the selected operator and handles operator chaining.
// State transitions:
//   pendingOperator exists && currentNumber !== '' → evaluate pending operation first
//   then: store parseFloat(currentNumber) as storedNumber, set new pendingOperator,
//   reset currentNumber to '' for right-operand entry, set isResultDisplayed to false.
function setOperator(operator) {
  // Clear error state; allows the user to recover by pressing an operator key
  clearError();

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

// equals evaluates the pending binary operation and displays the final result.
// If no pendingOperator is set, returns early (nothing to calculate).
// After calculation, isResultDisplayed is set to true so subsequent digit
// input starts a fresh number rather than appending to the result.
function equals() {
  // No pending operator means there is nothing to evaluate
  if (state.pendingOperator === null) return;

  // Delegate to performCalculation which handles the arithmetic and error state
  performCalculation();
  // Ensure the result flag is set even if performCalculation already set it
  state.isResultDisplayed = true;
}

// clear resets the calculator to its initial state, clearing all operands,
// operators, flags, and the display. Recovers from error states as well.
function clear() {
  state.currentNumber = '0';
  state.storedNumber = null;
  state.pendingOperator = null;
  state.isResultDisplayed = false;
  state.isErrorState = false;
  updateDisplay();
}

// backspace removes the last entered digit from currentNumber.
// Returns early if a result is displayed (backspace does not undo calculations).
// Falls back to '0' when removing the final remaining character.
function backspace() {
  // Backspace does not apply after a completed result; user must start fresh or clear
  if (state.isResultDisplayed) return;

  if (state.currentNumber.length <= 1) {
    // Single character remaining: reset to neutral '0' state
    state.currentNumber = '0';
  } else {
    state.currentNumber = state.currentNumber.slice(0, -1);
  }
  updateDisplay();
}

// --- Event Binding ---
// All event listeners are registered inside DOMContentLoaded to ensure the DOM
// is fully parsed before querying elements. Listeners are scoped to local variables
// to prevent memory leaks — no global references are retained after initialization.

document.addEventListener('DOMContentLoaded', () => {
  // Store reference to the display element for direct access if needed
  const display = document.getElementById('display'); // eslint-disable-line no-unused-vars

  // Digit buttons: each [data-digit] button appends its digit value on click.
  // Strategy: individual listeners per button; button reference is captured in
  // the forEach closure, so no event delegation on a parent element is needed.
  document.querySelectorAll('[data-digit]').forEach((button) => {
    button.addEventListener('click', () => appendDigit(button.dataset.digit));
  });

  // Operator buttons: each [data-operator] button sets the pending operator on click.
  // The data-operator attribute holds the operator symbol passed directly to setOperator.
  document.querySelectorAll('[data-operator]').forEach((button) => {
    button.addEventListener('click', () => setOperator(button.dataset.operator));
  });

  // Action buttons: bound individually by their data-action value.

  // Equals: evaluate the pending binary operation and show the result.
  const equalsBtn = document.querySelector('[data-action="equals"]');
  if (equalsBtn) equalsBtn.addEventListener('click', equals);

  // Clear: reset all calculator state to the initial '0' display.
  const clearBtn = document.querySelector('[data-action="clear"]');
  if (clearBtn) clearBtn.addEventListener('click', clear);

  // Backspace: delete the last entered character from the current number.
  const backspaceBtn = document.querySelector('[data-action="backspace"]');
  if (backspaceBtn) backspaceBtn.addEventListener('click', backspace);

  // Decimal: append a decimal point (ignored if one already exists).
  const decimalBtn = document.querySelector('[data-action="decimal"]');
  if (decimalBtn) decimalBtn.addEventListener('click', appendDecimal);

  // Keyboard navigation:
  // Digits 0-9       → appendDigit(key)
  // '+'              → setOperator('+')
  // '-'              → setOperator('−')  Unicode minus sign to match display
  // '*'              → setOperator('×')  Unicode multiplication sign to match display
  // '/'              → setOperator('÷')  event.preventDefault stops browser quick-find
  // 'Enter'          → equals()          evaluate the pending operation
  // 'Escape'         → clear()           full reset of calculator state
  // 'Backspace'      → backspace()       remove last entered digit
  // '.'              → appendDecimal()   insert decimal point
  document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        appendDigit(event.key);
        break;
      case '+':
        setOperator('+');
        break;
      case '-':
        setOperator('−');
        break;
      case '*':
        setOperator('×');
        break;
      case '/':
        event.preventDefault();
        setOperator('÷');
        break;
      case 'Enter':
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
