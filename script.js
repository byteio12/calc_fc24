// Calculadora mejorada: sin inline handlers, sin eval, soporte de teclado
(function () {
  const display = document.getElementById('display');
  const keyboard = document.querySelector('.buttons');

  // Estado de la calculadora
  let current = '0';
  let lastOperator = null; // '+', '-', '*', '/'
  let accumulator = null; // número
  let justEvaluated = false;

  function updateDisplay(value = current) {
    display.value = value;
  }

  function clearAll() {
    current = '0';
    lastOperator = null;
    accumulator = null;
    justEvaluated = false;
    updateDisplay();
  }

  function deleteLast() {
    if (justEvaluated) {
      // Tras evaluar, DEL limpia a 0
      current = '0';
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (current.length > 1) {
      current = current.slice(0, -1);
    } else {
      current = '0';
    }
    updateDisplay();
  }

  function inputDigit(d) {
    if (justEvaluated) {
      current = d; // empezar nuevo número
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (current === '0') {
      current = d; // evitar ceros a la izquierda
    } else {
      current += d;
    }
    updateDisplay();
  }

  function inputDot() {
    if (justEvaluated) {
      current = '0.';
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (!current.includes('.')) {
      current += '.';
      updateDisplay();
    }
  }

  function toNumber(str) {
    // Convierte string a número seguro
    const n = Number(str);
    if (!Number.isFinite(n)) return 0;
    return n;
  }

  function applyPercent() {
    // % contextual con resolución inmediata cuando hay operación en curso
    // - Sin operación o tras evaluación: n -> n/100
    // - Con A op B:
    //   + : resultado = A + A*(B/100)
    //   - : resultado = A - A*(B/100)
    //   * : resultado = A * (B/100)
    //   / : resultado = A / (B/100)
    if (accumulator !== null && lastOperator && !justEvaluated) {
      const a = toNumber(accumulator);
      const b = toNumber(current);
      let result;
      if (lastOperator === '+') {
        result = a + a * (b / 100);
      } else if (lastOperator === '-') {
        result = a - a * (b / 100);
      } else if (lastOperator === '*') {
        result = a * (b / 100);
      } else if (lastOperator === '/') {
        result = (b === 0) ? NaN : a / (b / 100);
      } else {
        result = b / 100;
      }
      current = Number.isFinite(result) ? formatNumber(result) : 'Error';
      // Tras calcular con %, consideramos la operación resuelta
      accumulator = null;
      lastOperator = null;
      justEvaluated = true;
      updateDisplay(current);
    } else {
      const n = toNumber(current) / 100;
      current = formatNumber(n);
      updateDisplay(current);
    }
  }

  function formatNumber(n) {
    // Mostrar sin decimales: redondeo al entero más cercano
    if (!Number.isFinite(n)) return 'Error';
    const s = Math.round(n);
    return String(s);
  }

  function compute(a, op, b) {
    switch (op) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '*':
        return a * b;
      case '/':
        return b === 0 ? NaN : a / b;
      default:
        return b; // si no hay op, devolver último
    }
  }

  function commitOperator(op) {
    const num = toNumber(current);

    if (accumulator === null) {
      accumulator = num;
    } else if (!justEvaluated) {
      accumulator = compute(accumulator, lastOperator, num);
    }

    lastOperator = op;
    current = '0';
    justEvaluated = false;
    updateDisplay(formatNumber(accumulator));
  }

  function equals() {
    const num = toNumber(current);
    if (accumulator === null && lastOperator === null) {
      // nada que evaluar
      justEvaluated = true;
      updateDisplay(current);
      return;
    }
    const result = compute(accumulator ?? 0, lastOperator, num);
    current = Number.isFinite(result) ? formatNumber(result) : 'Error';
    accumulator = null;
    lastOperator = null;
    justEvaluated = true;
    updateDisplay(current);
  }

  // Eventos de botones (delegación)
  keyboard.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    const value = btn.getAttribute('data-value');

    switch (action) {
      case 'digit':
        inputDigit(value);
        break;
      case 'dot':
        inputDot();
        break;
      case 'operator':
        commitOperator(value);
        break;
      case 'percent':
        applyPercent();
        break;
      case 'clear':
        clearAll();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'equals':
        equals();
        break;
    }
  });

  // Soporte de teclado
  window.addEventListener('keydown', (e) => {
    const { key } = e;
    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
      e.preventDefault();
      return;
    }
    if (key === '.') {
      inputDot();
      e.preventDefault();
      return;
    }
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      commitOperator(key);
      e.preventDefault();
      return;
    }
    if (key === 'Enter' || key === '=') {
      equals();
      e.preventDefault();
      return;
    }
    if (key === 'Backspace') {
      deleteLast();
      e.preventDefault();
      return;
    }
    if (key.toLowerCase() === 'c') {
      clearAll();
      e.preventDefault();
      return;
    }
    if (key === '%') {
      applyPercent();
      e.preventDefault();
      return;
    }
  });

  // Inicializa
  clearAll();
})();