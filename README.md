# HELIOS // 3D Solar System Dynamics & Telemetry

A minimalist, high-precision 3D Solar System simulation web application powered by Three.js and Keplerian orbital mechanics. Built as a zero-build, vanilla ES module application deployed automatically to GitHub Pages.

## ✨ Features

- **Keplerian Orbital Physics**: Real-time orbital mechanics taking into account semi-major axes, orbital periods, orbital eccentricities, and axial rotations.
- **Scale Mode Toggle**:
  - **Exploration Scale** (Default): Logarithmically compressed distances with amplified planetary radii for clear viewing and exploration.
  - **True Relative Orbit Scale**: Demonstrates true interplanetary scale and the vast expanse of the solar system.
- **Procedural Surface Generation**: 100% canvas-generated procedural textures for the Sun, terrestrial planets, gas giants, ice giants, Moon, and Saturn's rings (zero external image assets or HTTP 404s).
- **Interactive Observatory Telemetry**:
  - Click any celestial body or quick-chip to smoothly tween the camera into tracking orbit.
  - Real-world telemetry drawer: Equatorial diameter, scale vs Earth, mass, surface gravity, surface temperature, mean distance, and natural satellites.
- **Simulation Time Controls**:
  - Time warp presets: `-1000x`, `-100x`, `-10x`, `Pause`, `1x`, `10x`, `100x`, `1000x`.
  - Continuous logarithmic warp slider.
  - Play / Pause toggle with keyboard shortcut (`Space`).
- **Aerospace Vector Aesthetic**:
  - High-end dark observatory HUD with glassmorphism (`#030306`).
  - Subtle vector orbit paths that highlight on hover.
  - Procedural 3D starfield with stellar classification color temperatures.

## 🕹️ Controls

| Action | Control |
|---|---|
| **Rotate Orbit** | Left Click + Drag |
| **Pan Camera** | Right Click + Drag / Two-finger Drag |
| **Zoom In / Out** | Mouse Wheel / Pinch Gesture |
| **Select / Focus Planet** | Click Body or Select from Bottom Dock |
| **Play / Pause** | Spacebar or Pause Button |
| **Reset Solar Overview** | `Esc` or Reset View Button |

## 🛠️ Architecture

- `index.html`: Semantic layout, Three.js import maps, HUD container.
- `css/main.css`: Aerospace telemetry HUD, glassmorphism, responsive design.
- `js/config.js`: Astronomical constants, orbital parameters, physical properties, telemetry metadata.
- `js/physics.js`: Keplerian trajectories, scale interpolation, coordinate transforms.
- `js/textures.js`: Procedural canvas surface and ring generator.
- `js/engine.js`: Three.js scene, lighting, camera tweening, raycasting, render loop.
- `js/ui.js`: Telemetry drawer, time dock, event handlers.
- `.github/workflows/deploy.yml`: Automated GitHub Pages OIDC CI/CD deployment.

## 🚀 Local Development

To run locally without any build steps or npm installations:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in any modern web browser.
