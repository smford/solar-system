# Helios - 3D Solar System Simulation

Helios is an interactive 3D model of the solar system running directly in the browser. It combines Keplerian orbital mechanics with NASA imagery to show planetary orbits, sizes, and axial rotations.

Live site: https://stephenford.org/solar-system/

---

## Overview

The simulation models the Sun, the eight major planets, and major natural satellites (Earth's Moon, the Galilean moons of Jupiter, Saturn's Titan and Enceladus, and Neptune's retrograde moon Triton). It runs entirely on client-side JavaScript using Three.js and vanilla ES modules, with no build tools, bundlers, or external package installations required.

### Key Capabilities

- Real Planetary Textures: High-resolution surface maps sourced from NASA, JPL, and USGS missions (SDO for the Sun, MESSENGER for Mercury, Blue Marble for Earth, Cassini for Jupiter and Saturn, and Voyager 2 for Uranus and Neptune).
- Two Scale Modes:
  - Exploration Scale: Radii and distances are balanced for interactive viewing so all planets and orbits can be inspected without getting lost in empty space.
  - True Scale: Shows true proportional distances and sizes, illustrating how vast and empty the solar system really is.
- Keplerian Orbital Mechanics: Planets follow elliptical paths calculated from their semi-major axes, eccentricities, and orbital periods.
- Calibrated Planetary Rotation: Axial spin rates preserve each body's relative sidereal rotation period without spinning too fast to see surface features.
- Dynamic Epoch & Time Controls:
  - Jump to today's date with a single click.
  - Pick any specific date (past or future) to inspect planetary alignments.
  - Forward and reverse simulation time.
  - Linear speed adjustment from 0x (pause) to 20x.
- Smooth Navigation:
  - Exponential zoom scaling calibrated for both mouse wheels and Mac trackpads.
  - Click on any planet or locator marker to smoothly fly the camera into tracking orbit.
  - Telemetry drawer showing equatorial diameter, gravity, temperature, and orbital period for each body.

---

## Controls

| Action | Input |
|---|---|
| Rotate View | Left click and drag |
| Pan Camera | Right click and drag |
| Zoom In / Out | Scroll wheel or two-finger trackpad swipe |
| Focus Planet | Click on a planet, label, or bottom bar chip |
| Reset Overview | Escape key or Reset View button |
| Play / Pause | Spacebar or Play/Pause button |
| Reverse Time | Reverse toggle button |

---

## Project Structure

- `index.html`: Main page layout, Three.js import map, and HUD overlay.
- `css/main.css`: Styling for the interface, HUD panels, and responsive layout.
- `js/engine.js`: Three.js scene setup, camera transitions, lighting, and animation loop.
- `js/physics.js`: Keplerian orbit math, date conversions, and planetary positioning.
- `js/config.js`: Astronomical constants, orbital elements, physical dimensions, and telemetry stats.
- `js/ui.js`: DOM event handling, speed controls, telemetry drawer, and HUD updates.
- `js/textures.js`: Asset loader for photographic planet textures with a procedural fallback.
- `assets/textures/`: Planetary texture maps.

---

## Local Development

Because this project uses native browser ES modules, it runs directly from any local static file server:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser to run the application.

---

## Data & Imagery Attribution

Planetary surface maps and photography are derived from public domain imagery published by NASA, the Jet Propulsion Laboratory (JPL), and the United States Geological Survey (USGS). Map projections and composite textures are distributed under CC-BY 4.0 by Solar System Scope.
