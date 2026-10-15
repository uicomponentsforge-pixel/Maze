
(() => {
    const canvas = document.getElementById("maze");
    const ctx = canvas.getContext("2d");
  
    const levelSelect = document.getElementById("levelSelect");
    const timerEl = document.getElementById("timer");
    const movesEl = document.getElementById("moves");
    const statusEl = document.getElementById("status");
    const winScreen = document.getElementById("winScreen");
  
    const LEVELS = 100;
    const SAVE_KEY = "maze100-progress-v1";
  
    let level = 1;
    let highestCleared = 0;
    let grid = [];
    let player = { x: 0, y: 0 };
    let exit = { x: 0, y: 0 };
  
    let moves = 0;
    let seconds = 0;
    let started = false;
    let finished = false;
    let timerId = null;
    let cellSize = 10;
  
    function loadProgress() {
      try {
        const saved = JSON.parse(
          localStorage.getItem(SAVE_KEY) || "{}"
        );
  
        highestCleared = Math.max(
          0,
          Math.min(LEVELS, Number(saved.highestCleared) || 0)
        );
      } catch {
        highestCleared = 0;
      }
    }
  
    function saveProgress() {
      try {
        localStorage.setItem(
          SAVE_KEY,
          JSON.stringify({ highestCleared })
        );
      } catch {
        // The game can still be played if storage is unavailable.
      }
    }
  
    function difficultyName(n) {
      if (n <= 20) return "Easy";
      if (n <= 40) return "Normal";
      if (n <= 60) return "Hard";
      if (n <= 80) return "Expert";
      if (n <= 99) return "Nightmare";
      return "IMPOSSIBLE";
    }
  
    function mazeSize(n) {
      // Progressively increase maze size.
      return 9 + Math.floor((n - 1) / 4) * 2;
    }
  
    function createGrid(size) {
      return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
          top: true,
          right: true,
          bottom: true,
          left: true,
          visited: false
        }))
      );
    }
  
    function generateMaze(size) {
      const g = createGrid(size);
      const stack = [{ x: 0, y: 0 }];
  
      g[0][0].visited = true;
  
      // Iterative depth-first search creates a maze
      // with a connected route between start and exit.
      while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const x = current.x;
        const y = current.y;
  
        const options = [
          { x, y: y - 1, wall: "top", opposite: "bottom" },
          { x: x + 1, y, wall: "right", opposite: "left" },
          { x, y: y + 1, wall: "bottom", opposite: "top" },
          { x: x - 1, y, wall: "left", opposite: "right" }
        ].filter(next =>
          next.x >= 0 &&
          next.y >= 0 &&
          next.x < size &&
          next.y < size &&
          !g[next.y][next.x].visited
        );
  
        if (options.length === 0) {
          stack.pop();
          continue;
        }
  
        const next = options[
          Math.floor(Math.random() * options.length)
        ];
  
        g[y][x][next.wall] = false;
        g[next.y][next.x][next.opposite] = false;
        g[next.y][next.x].visited = true;
  
        stack.push({ x: next.x, y: next.y });
      }
  
      return g;
    }
  
    function fillLevelOptions() {
      levelSelect.innerHTML = "";
  
      for (let i = 1; i <= LEVELS; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent =
          `Level ${i} — ${difficultyName(i)}`;
        levelSelect.appendChild(option);
      }
    }
  
    function updateProgress() {
      const percent = highestCleared;
  
      document.getElementById("cleared").textContent =
        `${highestCleared} / ${LEVELS}`;
  
      document.getElementById("progressText").textContent =
        `${percent}%`;
  
      document.getElementById("progressBar").style.width =
        `${percent}%`;
  
      document.querySelectorAll(".ladder-item").forEach((item, i) => {
        const firstLevel = i === 0 ? 1 : i * 20 + 1;
        const lastLevel = i === 4 ? 99 : (i + 1) * 20;
  
        item.classList.toggle(
          "completed",
          highestCleared >= lastLevel
        );
  
        item.classList.toggle(
          "active",
          level >= firstLevel && level <= lastLevel
        );
      });
    }
  
    function updateStats() {
      document.getElementById("currentLevel").textContent =
        `${level} / ${LEVELS}`;
  
      document.getElementById("difficulty").textContent =
        difficultyName(level);
  
      document.getElementById("mazeSize").textContent =
        `${grid.length} × ${grid.length}`;
  
      movesEl.textContent = moves;
      levelSelect.value = String(level);
  
      updateProgress();
    }
  
    function stopTimer() {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  
    function startTimer() {
      if (started || finished) return;
  
      started = true;
      statusEl.textContent = "Find the exit";
  
      timerId = setInterval(() => {
        seconds++;
  
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
  
        timerEl.textContent =
          `${String(mins).padStart(2, "0")}:` +
          `${String(secs).padStart(2, "0")}`;
      }, 1000);
    }
  
    function newLevel(number) {
      level = Math.max(1, Math.min(LEVELS, number));
  
      stopTimer();
  
      grid = generateMaze(mazeSize(level));
      player = { x: 0, y: 0 };
  
      exit = {
        x: grid.length - 1,
        y: grid.length - 1
      };
  
      moves = 0;
      seconds = 0;
      started = false;
      finished = false;
  
      timerEl.textContent = "00:00";
      statusEl.textContent = "Ready to play";
  
      winScreen.classList.add("hidden");
  
      updateStats();
      drawMaze();
    }
  
    function drawMaze() {
      if (!grid.length) return;
  
      const size = grid.length;
      const available = canvas.parentElement.clientWidth || 600;
      const boardSize = Math.min(700, Math.max(220, available));
  
      cellSize = boardSize / size;
  
      const dpr = window.devicePixelRatio || 1;
  
      canvas.width = Math.round(boardSize * dpr);
      canvas.height = Math.round(boardSize * dpr);
      canvas.style.width = boardSize + "px";
      canvas.style.height = boardSize + "px";
  
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, boardSize, boardSize);
  
      ctx.fillStyle = "#090d13";
      ctx.fillRect(0, 0, boardSize, boardSize);
  
      // Subtle floor grid.
      ctx.strokeStyle = "#141d29";
      ctx.lineWidth = 1;
  
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          ctx.strokeRect(
            x * cellSize + 0.5,
            y * cellSize + 0.5,
            cellSize,
            cellSize
          );
        }
      }
  
      // Glowing exit.
      const ex = exit.x * cellSize;
      const ey = exit.y * cellSize;
  
      ctx.fillStyle = "#12312e";
      ctx.fillRect(ex + 1, ey + 1, cellSize - 2, cellSize - 2);
  
      ctx.shadowColor = "#55e6d0";
      ctx.shadowBlur = Math.max(4, cellSize * 0.6);
      ctx.fillStyle = "#55e6d0";
      ctx.beginPath();
      ctx.arc(
        ex + cellSize / 2,
        ey + cellSize / 2,
        Math.max(2, cellSize * 0.2),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;
  
      // Draw all maze walls.
      ctx.strokeStyle = "#718197";
      ctx.lineWidth = Math.max(1, cellSize * 0.075);
      ctx.lineCap = "square";
      ctx.beginPath();
  
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const c = grid[y][x];
          const px = x * cellSize;
          const py = y * cellSize;
  
          if (c.top) {
            ctx.moveTo(px, py);
            ctx.lineTo(px + cellSize, py);
          }
  
          if (c.left) {
            ctx.moveTo(px, py);
            ctx.lineTo(px, py + cellSize);
          }
  
          if (c.right) {
            ctx.moveTo(px + cellSize, py);
            ctx.lineTo(px + cellSize, py + cellSize);
          }
  
          if (c.bottom) {
            ctx.moveTo(px, py + cellSize);
            ctx.lineTo(px + cellSize, py + cellSize);
          }
        }
      }
  
      ctx.stroke();
  
      // Draw the player.
      const px = player.x * cellSize + cellSize / 2;
      const py = player.y * cellSize + cellSize / 2;
  
      ctx.shadowColor = "#c8ff4d";
      ctx.shadowBlur = Math.max(5, cellSize * 0.8);
      ctx.fillStyle = "#c8ff4d";
  
      ctx.beginPath();
      ctx.arc(
        px,
        py,
        Math.max(2.5, cellSize * 0.27),
        0,
        Math.PI * 2
      );
      ctx.fill();
  
      ctx.shadowBlur = 0;
    }
  
    function movePlayer(dx, dy) {
      if (finished) return;
  
      const nx = player.x + dx;
      const ny = player.y + dy;
      const size = grid.length;
  
      if (nx < 0 || ny < 0 || nx >= size || ny >= size) {
        return;
      }
  
      const current = grid[player.y][player.x];
  
      const wall =
        dx === 1 ? current.right :
        dx === -1 ? current.left :
        dy === 1 ? current.bottom :
        current.top;
  
      // A wall blocks movement.
      if (wall) return;
  
      startTimer();
  
      player = { x: nx, y: ny };
      moves++;
  
      movesEl.textContent = moves;
  
      drawMaze();
  
      if (player.x === exit.x && player.y === exit.y) {
        completeLevel();
      }
    }
  
    function completeLevel() {
      finished = true;
      stopTimer();
  
      highestCleared = Math.max(highestCleared, level);
      saveProgress();
      updateProgress();
  
      statusEl.textContent = "Exit reached";
  
      document.getElementById("winTitle").textContent =
        level === LEVELS ? "YOU BEAT MAZE!" : "You escaped!";
  
      document.getElementById("winMessage").textContent =
        `Level ${level} (${difficultyName(level)}) completed ` +
        `in ${timerEl.textContent} with ${moves} moves.`;
  
      const nextButton = document.getElementById("nextLevel");
  
      if (level === LEVELS) {
        nextButton.textContent = "Play Level 100 Again";
      } else {
        nextButton.textContent = `Play Level ${level + 1}`;
      }
  
      winScreen.classList.remove("hidden");
    }
  
    function restartLevel() {
      // Same level, new maze layout.
      newLevel(level);
    }
  
    document.addEventListener("keydown", event => {
      const keys = {
        ArrowUp: [0, -1],
        w: [0, -1],
        W: [0, -1],
        ArrowDown: [0, 1],
        s: [0, 1],
        S: [0, 1],
        ArrowLeft: [-1, 0],
        a: [-1, 0],
        A: [-1, 0],
        ArrowRight: [1, 0],
        d: [1, 0],
        D: [1, 0]
      };
  
      if (keys[event.key]) {
        event.preventDefault();
        movePlayer(...keys[event.key]);
      }
    });
  
    document.querySelectorAll("[data-move]").forEach(button => {
      button.addEventListener("click", () => {
        const directions = {
          up: [0, -1],
          down: [0, 1],
          left: [-1, 0],
          right: [1, 0]
        };
  
        movePlayer(...directions[button.dataset.move]);
      });
    });
  
    document.getElementById("newMaze").addEventListener("click", () => {
      newLevel(level);
    });
  
    document.getElementById("restart").addEventListener("click", restartLevel);
  
    document.getElementById("goLevel").addEventListener("click", () => {
      newLevel(Number(levelSelect.value));
    });
  
    levelSelect.addEventListener("change", () => {
      newLevel(Number(levelSelect.value));
    });
  
    document.getElementById("nextLevel").addEventListener("click", () => {
      newLevel(level === LEVELS ? LEVELS : level + 1);
    });
  
    window.addEventListener("resize", drawMaze);
  
    loadProgress();
    fillLevelOptions();
    newLevel(Math.min(LEVELS, highestCleared + 1));
  })();  