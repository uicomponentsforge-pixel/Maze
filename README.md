# MAZE — 100 Levels

A responsive, web-based 2D maze game featuring 100 procedurally generated levels with increasing difficulty and size.

## Features

- **100 Levels of Escalating Difficulty**: Progress from 9×9 Easy mazes up to massive, complex Nightmare and Impossible levels.
- **Procedural Maze Generation**: Built using iterative depth-first search to ensure every level layout is solvable and unique on restart.
- **Progress Persistence**: Automatically saves your highest cleared level and progress in browser `localStorage`.
- **Timer & Move Tracking**: Track your completion time and total move count for each level.
- **Responsive Controls**: Play seamlessly using desktop keyboard arrow keys/WASD or on-screen mobile navigation buttons.

## Controls

- **Desktop Keyboard**:
  - `Up` / `W`: Move Up
  - `Down` / `S`: Move Down
  - `Left` / `A`: Move Left
  - `Right` / `D`: Move Right
- **Mobile / Touch**:
  - Tap the direction arrow buttons below the maze board.

## Tech Stack

- **HTML5 Canvas** for maze rendering
- **Vanilla JavaScript** (ES6+) for procedural generation, game loop, and event handling
- **CSS3** with CSS Variables and Flexbox/Grid for styling

## Local Development

No build steps or dependencies required.

1. Clone or download the repository.
2. Open `index.html` in any modern web browser, or serve it locally using a simple HTTP server (e.g., `npx serve` or Python's `python -m http.server`).
