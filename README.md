# Simple Calculator

A browser-based arithmetic calculator application built with vanilla HTML, CSS, and JavaScript. The calculator supports basic operations (addition, subtraction, multiplication, division), handles decimal numbers, and provides a clean, responsive interface suitable for both desktop and mobile devices. No frameworks, build tools, or backend required.

## Project Overview

Simple Calculator is a lightweight, single-file web application that performs basic arithmetic operations directly in the browser. It requires no installation, no internet connection after initial load, and no external dependencies.

## Features

- **Number Entry** — Click digit buttons (0–9) to build numbers
- **Decimal Support** — Enter decimal numbers using the `.` button
- **Four Operations** — Addition (`+`), subtraction (`-`), multiplication (`×`), division (`÷`)
- **Equals / Result** — Press `=` to evaluate the current expression
- **Clear** — `AC` resets the calculator to its initial state
- **Backspace** — Delete the last entered digit or character
- **Display** — Shows current input and running result
- **Button Layout** — Standard calculator grid layout, intuitive and familiar
- **Error Handling** — Division by zero and invalid input are handled gracefully

## Usage Instructions

### Opening the Calculator

1. Open `index.html` directly in any modern web browser (no server required).
2. The calculator loads instantly — no install or setup needed.

### Using the Calculator

1. Click digit buttons to enter a number.
2. Click an operator (`+`, `-`, `×`, `÷`) to select the operation.
3. Enter the second number.
4. Press `=` to see the result.
5. Press `AC` to clear all input and start over.
6. Press the backspace button to delete the last character.
7. Use `.` to enter decimal values (only one decimal point per number is allowed).

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 120+           |
| Firefox | 121+           |
| Safari  | 17+            |
| Edge    | 120+           |

## Known Limitations

- **Left-to-right evaluation** — Expressions are evaluated in the order entered, not by standard mathematical precedence.
- **No operator precedence** — Multiplication and division are not prioritized over addition and subtraction.
- **No parentheses** — Grouping sub-expressions with `(` `)` is not supported.
- **No scientific functions** — Square root, exponentiation, trigonometry, and similar functions are not available.

## Manual Testing Checklist

- [ ] **Basic arithmetic** — Verify `+`, `-`, `×`, `÷` produce correct results
- [ ] **Decimal handling** — Confirm decimal numbers work correctly (e.g., `1.5 + 2.5 = 4`)
- [ ] **Division by zero** — Ensure an appropriate error message is shown instead of crashing
- [ ] **Overflow** — Check behavior with very large or very small numbers
- [ ] **Keyboard navigation** — Confirm the interface is accessible and operable via keyboard
- [ ] **Responsive design** — Verify layout adapts correctly on mobile, tablet, and desktop screen sizes

## Technical Details

- **Stack** — Vanilla HTML, CSS, and JavaScript; no frameworks or libraries
- **Architecture** — Single-file application (under 10 KB total)
- **Offline capable** — Works fully without an internet connection after the page is loaded
- **No build step** — Open `index.html` directly; nothing to compile or bundle
