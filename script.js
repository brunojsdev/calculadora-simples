/* Calculadora simples: script.js
   Funcionalidades:
   - clique nos botões para construir expressão
   - teclado compatível (números, + - * / . Enter, Backspace, Esc)
   - C = limpar, ← = backspace, % funciona como operador (usado na avaliação)
   - evita operadores repetidos consecutivos
   - tratamento de erros e formatação do resultado
*/

(() => {
  const displayEl = document.getElementById('display');
  const keys = document.querySelectorAll('.btn');

  let expr = ''; // expressão atual exibida

  const isOperator = (ch) => ['+','-','*','/','%'].includes(ch);

  function render() {
    displayEl.textContent = expr === '' ? '0' : expr;
  }

  function appendValue(v) {
    if (v === '.') {
      // evita múltiplos pontos no mesmo número
      // encontra último token (desde o fim até operador)
      const tokens = expr.split(/([+\-*/%])/).filter(Boolean);
      const last = tokens.length ? tokens[tokens.length-1] : '';
      if (last.includes('.')) return;
      if (last === '') {
        // se começar um número com '.' prefixa 0
        expr += '0';
      }
    }

    if (isOperator(v)) {
      // evita operador no início (exceto '-'), e operadores consecutivos
      if (expr === '' && v !== '-') return;
      if (expr !== '') {
        const lastChar = expr[expr.length - 1];
        if (isOperator(lastChar)) {
          // substitui operador anterior por novo (exceto se novo for '-' e anterior não for '-')
          // Ex.: "5+" seguido de "-" -> permite "5+-" (tratamos como válidos para avaliação JS)
          // Para simplicidade, substituímos apenas quando ambos são operadores simples
          expr = expr.slice(0, -1) + v;
          return;
        }
      }
    }

    expr += v;
  }

  function clearAll() {
    expr = '';
  }

  function backspace() {
    if (expr.length) expr = expr.slice(0, -1);
  }

  function calculate() {
    if (!expr) return;
    // sanitize simple issues: termina com operador -> remove último
    while (expr.length && isOperator(expr[expr.length - 1])) {
      expr = expr.slice(0, -1);
    }
    if (!expr) return;

    try {
      // Transformação segura mínima:
      // substitui '×' / '÷' caso tenha sido usado visualmente (não usado aqui, mas deixa robusto)
      const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');

      // tratar porcento: interpretar "a%b" no sentido "a * (b/100)" é ambíguo.
      // Aqui tratamos token '%' como JS % (módulo) — alternativa: converter "50%" => 0.5.
      // Para suporte simples a "50%" standalone, convertemos número seguido de % para (num/100)
      const withPercent = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

      // Avaliar expressão com Function (forma mais recomendada que eval em contexto controlado)
      const result = Function('"use strict"; return (' + withPercent + ')')();

      if (!isFinite(result)) {
        expr = 'Erro';
      } else {
        // limitar casas significativas (máx 12)
        const rounded = Number.isInteger(result) ? String(result) : String(Number.parseFloat(result.toPrecision(12)));
        expr = rounded;
      }
    } catch (e) {
      expr = 'Erro';
    }
  }

  // delegação dos botões
  keys.forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.value;
      const action = btn.dataset.action;

      if (action === 'clear') {
        clearAll();
      } else if (action === 'backspace') {
        backspace();
      } else if (action === 'calculate') {
        calculate();
      } else if (typeof v !== 'undefined') {
        appendValue(v);
      }
      render();
    });
  });

  // teclado
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if ((/^[0-9]$/).test(key)) {
      appendValue(key);
      render();
      return;
    }
    if (key === '.' ) { appendValue('.'); render(); return; }
    if (key === 'Enter' || key === '=') { e.preventDefault(); calculate(); render(); return; }
    if (key === 'Backspace') { backspace(); render(); return; }
    if (key === 'Escape') { clearAll(); render(); return; }
    if (key === '+' || key === '-' || key === '*' || key === '/' ) { appendValue(key); render(); return; }
    if (key === '%') { appendValue('%'); render(); return; }
  });

  // inicializa
  render();
})();
