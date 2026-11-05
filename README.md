# HELIOS // 3D Solar System Dynamics & Telemetry

A minimalist, high-precision 3D Solar System simulation web application powered by Three.js, Keplerian orbital mechanics, and realistic NASA photographic imagery. Built as a zero-build, vanilla ES module application deployed automatically to GitHub Pages.

🌐 **Live Application**: [https://stephenford.org/solar-system/](https://stephenford.org/solar-system/)

---

## ✨ Features

- **Realistic NASA Photographic Textures**: High-resolution equirectangular texture maps derived from NASA, JPL, USGS, and Solar System Scope data:
  - **Sun**: NASA Solar Dynamics Observatory (SDO) solar granulations and active regions.
  - **Mercury**: NASA MESSENGER orbital mosaic.
  - **Venus**: NASA Pioneer Venus / Akatsuki atmospheric cloud layer.
  - **Earth**: NASA Earth Observatory "Blue Marble" elevation and ocean surface map.
  - **Earth Clouds**: Dynamic rotating atmospheric cloud layer.
  - **Moon**: NASA Lunar Reconnaissance Orbiter (LRO) mosaic + Earth orbital path.
  - **Mars**: NASA Mars Global Surveyor (MGS) & Viking mosaic with polar caps.
  - **Jupiter**: NASA Cassini / Juno spacecraft mosaic with the Great Red Spot.
  - **Saturn & Rings**: NASA Cassini atmosphere mosaic + high-resolution Cassini ring transmission alpha map (with authentic Cassini Division).
  - **Uranus & Neptune**: NASA Voyager 2 spacecraft imagery.
  - **Milky Way**: NASA / ESO deep space panorama backdrop.
  - **Procedural Fallback**: Offline-resilient procedural canvas texture generator if network access is restricted.
- **Full Solar System Zoomed-out Perspective**: Initial camera view is framed to present the entire solar system (from the Sun out through Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, to Neptune's orbit) immediately on load.
- **Clearly Drawn Planetary Orbits**: Anti-aliased 256-segment vector orbit paths with distinct spectral accent colors and dynamic hover/selection brightening.
- **Keplerian Orbital Mechanics**: Real-time orbital transforms accounting for semi-major axes, orbital periods, orbital eccentricities, and sidereal axial rotations.
- **Scale Mode Toggle**:
  - **Exploration Scale** (Default): Logarithmically compressed distances with amplified planetary radii for clear viewing and exploration.
  - **True Relative Orbit Scale**: Demonstrates true interplanetary scale and the vast emptiness of the solar system.
- **Interactive Telemetry HUD**:
  - Click any celestial body or quick-chip to smoothly tween the camera into tracking orbit.
  - Real-world telemetry drawer: Equatorial diameter, scale vs Earth, mass, surface gravity, surface temperature, mean distance, and natural satellites.
- **Simulation Time Controls**:
  - Time warp presets: `-1000x`, `-100x`, `-10x`, `Pause`, `1x`, `10x`, `100x`, `1000x`.
  - Continuous logarithmic warp slider.
  - Play / Pause toggle with keyboard shortcut (`Space`).
- **Aerospace Vector Aesthetic**:
  - High-end dark observatory HUD with glassmorphism (`#020204`).
  - 4,500-star temperature-tinted 3D starfield.

## 🕹️ Controls

| Action | Control |
|---|---|
| **Rotate Orbit** | Left Click + Drag |
| **Pan Camera** | Right Click + Drag / Two-finger Drag |
| **Zoom In / Out** | Mouse Wheel / Pinch Gesture |
| **Select / Focus Planet** | Click Celestial Body or Select from Bottom Dock |
| **Play / Pause** | Spacebar or Pause Button |
| **Reset Solar Overview** | `Esc` or Reset View Button |

## 🛠️ Architecture

- `index.html`: Semantic layout, Three.js import maps, HUD container.
- `css/main.css`: Aerospace telemetry HUD, glassmorphism, responsive design.
- `js/config.js`: Astronomical constants, orbital parameters, physical properties, telemetry metadata.
- `js/physics.js`: Keplerian trajectories, scale interpolation, coordinate transforms.
- `js/textures.js`: NASA photo texture loader with procedural canvas fallback engine.
- `js/engine.js`: Three.js scene, lighting, camera tweening, raycasting, render loop.
- `js/ui.js`: Telemetry drawer, time dock, event handlers.
- `assets/textures/`: NASA/JPL/USGS/Solar System Scope photographic textures.
- `.github/workflows/deploy.yml`: Automated GitHub Pages OIDC CI/CD deployment.

## 📜 Credits & Imagery Attribution

- **Planetary Imagery & Textures**: Derived from public-domain datasets by [NASA](https://www.nasa.gov/), [NASA Jet Propulsion Laboratory (JPL)](https://www.jpl.nasa.gov/), and the [United States Geological Survey (USGS)](https://www.usgs.gov/), with cartographic composite projections distributed under CC-BY 4.0 by [Solar System Scope](https://www.solarsystemscope.com/textures/).

## 🚀 Local Development

To run locally without any build steps or npm installations:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in any modern web browser.
