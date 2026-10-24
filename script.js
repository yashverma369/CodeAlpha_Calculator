const currentEl = document.getElementById("current");
const historyEl = document.getElementById("history");

let current = "0";        // number being typed
let previous = null;      // stored left operand (string)
let operator = null;      // + - * /
let justEvaluated = false;
let hasError = false;

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };

function compute(a, b, op) {
  a = parseFloat(a); b = parseFloat(b);
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return b === 0 ? null : a / b;
  }
}

function format(n) {
  if (n === null) return "Cannot divide by 0";
  // avoid floating point noise like 0.1 + 0.2
  const rounded = parseFloat(Number(n).toPrecision(12));
  return String(rounded);
}

function updateDisplay() {
  currentEl.textContent = current;
  currentEl.classList.toggle("small", current.length > 11);
  currentEl.classList.toggle("error", hasError);
  historyEl.textContent = previous !== null && operator
    ? `${previous} ${symbols[operator]}` : "";
  document.querySelectorAll(".key.op").forEach(k => {
    k.classList.toggle("active", operator === k.dataset.value && !justEvaluated && current === "0" && false);
  });
}

function resetAll() {
  current = "0"; previous = null; operator = null; justEvaluated = false; hasError = false;
}

function inputNumber(d) {
  if (hasError) resetAll();
  if (justEvaluated) { current = "0"; justEvaluated = false; }
  if (current === "0") current = d;
  else if (current === "-0") current = "-" + d;
  else if (current.replace(/[-.]/g, "").length < 15) current += d;
  updateDisplay();
}

function inputDecimal() {
  if (hasError) resetAll();
  if (justEvaluated) { current = "0"; justEvaluated = false; }
  if (!current.includes(".")) current += ".";
  updateDisplay();
}

function chooseOperator(op) {
  if (hasError) return;
  if (operator && previous !== null && !justEvaluated && current !== "") {
    // chain: 2 + 3 + ... evaluates 2+3 first
    const res = compute(previous, current, operator);
    if (res === null) return showError();
    previous = format(res);
  } else {
    previous = current;
  }
  operator = op;
  current = "0";
  justEvaluated = false;
  updateDisplay();
}

function equals() {
  if (hasError || operator === null || previous === null) return;
  const expr = `${previous} ${symbols[operator]} ${current} =`;
  const res = compute(previous, current, operator);
  if (res === null) return showError();
  current = format(res);
  historyEl.textContent = expr;
  previous = null; operator = null; justEvaluated = true;
  currentEl.textContent = current;
  currentEl.classList.toggle("small", current.length > 11);
}

function showError() {
  resetAll();
  hasError = true;
  current = "Cannot divide by 0";
  updateDisplay();
}

function del() {
  if (hasError) return resetAllAndUpdate();
  if (justEvaluated) return;
  current = current.length > 1 && !(current.length === 2 && current[0] === "-")
    ? current.slice(0, -1) : "0";
  updateDisplay();
}
function resetAllAndUpdate() { resetAll(); updateDisplay(); }

function percent() {
  if (hasError) return;
  current = format(parseFloat(current) / 100);
  updateDisplay();
}

function toggleSign() {
  if (hasError || current === "0") return;
  current = current.startsWith("-") ? current.slice(1) : "-" + current;
  updateDisplay();
}

// Button clicks
document.querySelector(".keys").addEventListener("click", e => {
  const btn = e.target.closest(".key");
  if (!btn) return;
  const { action, value } = btn.dataset;
  switch (action) {
    case "number": inputNumber(value); break;
    case "decimal": inputDecimal(); break;
    case "operator": chooseOperator(value); break;
    case "equals": equals(); break;
    case "clear": resetAllAndUpdate(); break;
    case "delete": del(); break;
    case "percent": percent(); break;
    case "sign": toggleSign(); break;
  }
});

// Keyboard support
document.addEventListener("keydown", e => {
  const k = e.key;
  let selector = null;
  if (/^[0-9]$/.test(k)) { inputNumber(k); selector = `[data-action="number"][data-value="${k}"]`; }
  else if (k === ".") { inputDecimal(); selector = '[data-action="decimal"]'; }
  else if ("+-*/".includes(k)) { chooseOperator(k); selector = `[data-action="operator"][data-value="${k}"]`; }
  else if (k === "Enter" || k === "=") { e.preventDefault(); equals(); selector = '[data-action="equals"]'; }
  else if (k === "Backspace") { del(); selector = '[data-action="delete"]'; }
  else if (k === "Escape" || k === "Delete") { resetAllAndUpdate(); selector = '[data-action="clear"]'; }
  else if (k === "%") { percent(); selector = '[data-action="percent"]'; }
  if (selector) {
    const el = document.querySelector(selector);
    if (el) { el.classList.add("pressed"); setTimeout(() => el.classList.remove("pressed"), 120); }
  }
});

updateDisplay();
