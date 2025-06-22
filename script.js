const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons button');
const clickSound = document.getElementById('click-sound');
const modeBtn = document.getElementById('toggle-mode');
let current = '0';
let resetNext = false;

// Mode toggle
function setMode(light) {
  document.body.classList.toggle('light', light);
  modeBtn.textContent = light ? '🌞' : '🌙';
  localStorage.setItem('calc-mode', light ? 'light' : 'dark');
}
modeBtn.addEventListener('click', () => {
  setMode(!document.body.classList.contains('light'));
});
window.addEventListener('DOMContentLoaded', () => {
  setMode(localStorage.getItem('calc-mode') === 'light');
});

function playClick() {
  clickSound.currentTime = 0;
  clickSound.play();
}
function updateDisplay() {
  display.textContent = current;
}
function appendValue(value) {
  if (resetNext) {
    current = (value === '.') ? '0.' : value;
    resetNext = false;
  } else {
    if (current === '0' && value !== '.') {
      current = value;
    } else if (value === '.' && current.includes('.')) {
      return;
    } else {
      current += value;
    }
  }
  updateDisplay();
}
function handleOperator(op) {
  if (/[+\-*/]$/.test(current)) {
    current = current.slice(0, -1) + op;
  } else {
    current += op;
  }
  resetNext = false;
  updateDisplay();
}
function calculate() {
  try {
    let result = eval(current.replace(/÷/g, '/').replace(/×/g, '*'));
    if (result === Infinity || isNaN(result)) {
      current = 'Error';
    } else {
      current = result.toString();
    }
  } catch {
    current = 'Error';
  }
  updateDisplay();
  resetNext = true;
}
function clearAll() {
  current = '0';
  updateDisplay();
}
function backspace() {
  if (resetNext || current.length === 1) {
    current = '0';
  } else {
    current = current.slice(0, -1);
    if (current === '' || current === '-') current = '0';
  }
  updateDisplay();
}
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    playClick();
    if (btn.dataset.value) {
      if (['+', '-', '*', '/'].includes(btn.dataset.value)) {
        handleOperator(btn.dataset.value);
      } else if (btn.dataset.value === '.') {
        // Only allow one dot per number
        if (!current.split(/[\+\-\*\/]/).pop().includes('.')) {
          appendValue('.');
        }
      } else {
        appendValue(btn.dataset.value);
      }
    } else if (btn.dataset.action === 'clear') {
      clearAll();
    } else if (btn.dataset.action === 'backspace') {
      backspace();
    } else if (btn.dataset.action === 'equals') {
      calculate();
    } else if (btn.dataset.action === 'sqrt') {
      // Square root of current value
      try {
        let val = parseFloat(current.split(/[\+\-\*\/]/).pop());
        if (val < 0) {
          current = 'Error';
        } else {
          // Replace the last number with its square root
          current = current.replace(/([\d.]+)$/, Math.sqrt(val).toString());
        }
      } catch {
        current = 'Error';
      }
      updateDisplay();
      resetNext = true;
    } else if (btn.dataset.action === 'square') {
      // Square of current value
      try {
        let val = parseFloat(current.split(/[\+\-\*\/]/).pop());
        // Replace the last number with its square
        current = current.replace(/([\d.]+)$/, (val * val).toString());
      } catch {
        current = 'Error';
      }
      updateDisplay();
      resetNext = true;
    }
  });
});
// Touch feedback for mobile
buttons.forEach(btn => {
  btn.addEventListener('touchstart', () => {
    btn.classList.add('active');
  });
  btn.addEventListener('touchend', () => {
    btn.classList.remove('active');
  });
});

// Dino Game
const dinoBtn = document.getElementById('dino-btn');
const dinoGame = document.getElementById('dino-game');
let dinoInterval, cactusInterval, isJumping = false, dino, cactus, score = 0;

function createDinoGame() {
  dinoGame.innerHTML = `
    <div id="dino" style="
      position:absolute;left:30px;bottom:10px;width:30px;height:30px;
      background:#4caf50;border-radius:6px;">
      <span style="font-size:24px;position:absolute;top:-8px;left:2px;">🦖</span>
    </div>
    <div id="cactus" style="
      position:absolute;right:0;bottom:10px;width:18px;height:38px;
      background:#ff9800;border-radius:4px;">
      <span style="font-size:22px;position:absolute;top:-8px;left:0;">🌵</span>
    </div>
    <div id="dino-score" style="
      position:absolute;top:4px;right:10px;font-size:14px;color:#222;">Score: 0</div>
  `;
  dino = document.getElementById('dino');
  cactus = document.getElementById('cactus');
  score = 0;
  document.getElementById('dino-score').textContent = 'Score: 0';
}

function startDinoGame() {
  dinoGame.style.display = 'flex';
  createDinoGame();
  let dinoBottom = 10;
  let cactusLeft = dinoGame.offsetWidth - 30;
  isJumping = false;
  let gameOver = false;

  function jump() {
    if (isJumping) return;
    isJumping = true;
    let jumpPeak = 70;
    let jumpSpeed = 3; // Lower is slower (was 8)
    let upInterval = setInterval(() => {
      if (dinoBottom >= jumpPeak) {
        clearInterval(upInterval);
        let downInterval = setInterval(() => {
          if (dinoBottom <= 10) {
            clearInterval(downInterval);
            isJumping = false;
          } else {
            dinoBottom -= jumpSpeed;
            dino.style.bottom = dinoBottom + 'px';
          }
        }, 10);
      } else {
        dinoBottom += jumpSpeed;
        dino.style.bottom = dinoBottom + 'px';
      }
    }, 10);
  }

  function moveCactus() {
    cactusLeft -= 4;
    cactus.style.left = cactusLeft + 'px';
    // Collision detection
    if (
      cactusLeft < 60 && cactusLeft > 20 &&
      dinoBottom < 38
    ) {
      endDinoGame();
      return;
    }
    if (cactusLeft < -20) {
      cactusLeft = dinoGame.offsetWidth - 30;
      score++;
      document.getElementById('dino-score').textContent = 'Score: ' + score;
    }
  }

  function endDinoGame() {
    clearInterval(dinoInterval);
    clearInterval(cactusInterval);
    dinoGame.innerHTML += `<div style="
      position:absolute;top:40px;left:0;width:100%;text-align:center;
      font-size:18px;color:#f44336;font-weight:bold;">Game Over<br>Score: ${score}<br><button id='dino-restart' style='margin-top:8px;padding:4px 12px;border-radius:6px;border:none;background:#4caf50;color:#fff;cursor:pointer;'>Restart</button></div>`;
    document.getElementById('dino-restart').onclick = () => {
      startDinoGame();
    };
  }

  document.onkeydown = (e) => {
    if (e.code === 'Space' || e.key === ' ') jump();
  };
  dinoGame.onclick = jump;

  dinoInterval = setInterval(() => {
    // nothing needed here, jump is handled by event
  }, 20);
  cactusInterval = setInterval(moveCactus, 30);
}

if (dinoBtn && dinoGame) {
  dinoBtn.addEventListener('click', () => {
    dinoGame.style.display = dinoGame.style.display === 'flex' ? 'none' : 'flex';
    if (dinoGame.style.display === 'flex') {
      startDinoGame();
    } else {
      // Stop game if closed
      clearInterval(dinoInterval);
      clearInterval(cactusInterval);
      dinoGame.innerHTML = '';
      document.onkeydown = null;
    }
  });
}

// Advanced Panel
const advBtn = document.getElementById('adv-btn');
const advPanel = document.getElementById('adv-panel');

if (advBtn && advPanel) {
  advBtn.addEventListener('click', () => {
    advPanel.style.display = advPanel.style.display === 'flex' ? 'none' : 'flex';
  });
  advPanel.querySelector('.close-adv').addEventListener('click', () => {
    advPanel.style.display = 'none';
  });

  advPanel.addEventListener('click', (e) => {
    if (!e.target.dataset.action) return;
    let lastNum = parseFloat(current.split(/[\+\-\*\/]/).pop());
    switch (e.target.dataset.action) {
      case 'sin':
        current = current.replace(/([\d.]+)$/, Math.sin(lastNum * Math.PI / 180).toString());
        break;
      case 'cos':
        current = current.replace(/([\d.]+)$/, Math.cos(lastNum * Math.PI / 180).toString());
        break;
      case 'tan':
        current = current.replace(/([\d.]+)$/, Math.tan(lastNum * Math.PI / 180).toString());
        break;
      case 'log':
        current = current.replace(/([\d.]+)$/, Math.log10(lastNum).toString());
        break;
      case 'ln':
        current = current.replace(/([\d.]+)$/, Math.log(lastNum).toString());
        break;
      case 'exp':
        current = current.replace(/([\d.]+)$/, Math.exp(lastNum).toString());
        break;
      case 'pi':
        current += Math.PI.toString();
        break;
      case 'fact':
        function fact(n) { return n <= 1 ? 1 : n * fact(n - 1); }
        current = current.replace(/([\d.]+)$/, fact(lastNum).toString());
        break;
      case 'pow':
        current += '**';
        break;
    }
    updateDisplay();
    resetNext = true;
  });
}