# Two-Window Scene Visualization

This project creates a synchronized two-window scene where planets are dynamically rendered and updated based on window positions.

## Features
- Real-time visualization across two browser windows.
- Dynamic synchronization of planetary positions.
- Cross-window communication using `WindowManager.js`.
- Interactive 3D rendering with Three.js.

## Technologies Used
- **Three.js**: 3D rendering and visualization.
- **JavaScript**: Core logic for synchronization.
- **WindowManager.js**: Handles multi-window synchronization.
- **HTML5 Canvas/WebGL**: Used for rendering visual elements.

## How It Works
- **Scene Synchronization**:
  - Each browser window represents part of a larger synchronized scene.
  - `WindowManager.js` ensures both windows communicate and update positions in real time.
- **Rendering**:
  - Uses Three.js to create and render planets.
  - Positions adjust dynamically as windows move.

## Code Structure
```
/project-root
│── index.html          # Entry point
│── main.js             # Core logic for rendering and synchronization
│── WindowManager.js    # Handles multi-window synchronization
│── three.module.js     # Three.js library
│── assets/             # Any additional assets (if needed)
```

Inspired by : https://x.com/_nonfigurativ_/status/1727322594570027343?t=PnG1H3kcyTui8BiWAYnvWw&s=19 

## Known Issues & Limitations
- Supports only two windows for now.
- May require a stable internet connection for real-time synchronization in some environments.

## Future Enhancements
- Support for more than two windows.
- Enhanced visual effects (customizable themes, animations).
- Performance optimizations for smoother transitions.


