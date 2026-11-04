/**
 * HELIOS User Interface & Telemetry HUD Controller
 * Minimalist dark glassmorphic control dock, side telemetry drawer, timeline scrubbers, and selectors.
 */
import { CELESTIAL_BODIES, TIME_PRESETS } from './config.js';

export class UIController {
  constructor(engine) {
    this.engine = engine;

    // DOM Elements
    this.epochDisplay = document.getElementById('epoch-display');
    this.fpsDisplay = document.getElementById('fps-display');
    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.warpPresetsContainer = document.getElementById('warp-presets');
    this.warpSlider = document.getElementById('warp-slider');
    this.warpValueText = document.getElementById('warp-value-text');
    this.scaleModeToggle = document.getElementById('scale-toggle');
    this.bodyQuickBar = document.getElementById('body-quick-bar');
    this.resetViewBtn = document.getElementById('btn-reset-view');

    // Telemetry Drawer Elements
    this.telemetryDrawer = document.getElementById('telemetry-drawer');
    this.telemetryCloseBtn = document.getElementById('telemetry-close');
    this.telemetryTitle = document.getElementById('telemetry-title');
    this.telemetryType = document.getElementById('telemetry-type');
    this.telemetryStats = document.getElementById('telemetry-stats');
    this.telemetryFocusBtn = document.getElementById('btn-telemetry-focus');

    // Tooltip Element
    this.hoverTooltip = document.getElementById('hover-tooltip');

    this.activePresetValue = 1;

    this.init();
  }

  init() {
    this.buildWarpPresets();
    this.buildBodyQuickBar();
    this.bindEvents();

    // Hook engine callbacks
    this.engine.onSelectBody = (bodyId) => this.handleBodySelected(bodyId);
    this.engine.onHoverBody = (bodyId) => this.handleBodyHovered(bodyId);
    this.engine.onFpsUpdate = (fps) => {
      if (this.fpsDisplay) {
        this.fpsDisplay.textContent = `${fps} FPS`;
      }
    };

    // Start UI update loop for epoch timer
    this.startEpochUpdater();
  }

  buildWarpPresets() {
    if (!this.warpPresetsContainer) return;
    this.warpPresetsContainer.innerHTML = '';

    TIME_PRESETS.forEach(preset => {
      const btn = document.createElement('button');
      btn.className = `preset-btn ${preset.value === 1 ? 'active' : ''}`;
      btn.textContent = preset.label;
      btn.dataset.warp = preset.value;

      btn.addEventListener('click', () => {
        this.setWarp(preset.value);
      });

      this.warpPresetsContainer.appendChild(btn);
    });
  }

  buildBodyQuickBar() {
    if (!this.bodyQuickBar) return;
    this.bodyQuickBar.innerHTML = '';

    for (const [key, config] of Object.entries(CELESTIAL_BODIES)) {
      const btn = document.createElement('button');
      btn.className = 'body-chip';
      btn.dataset.bodyId = key;

      // Color indicator dot
      const dot = document.createElement('span');
      dot.className = 'body-dot';
      dot.style.backgroundColor = config.color;

      const label = document.createElement('span');
      label.textContent = config.name;

      btn.appendChild(dot);
      btn.appendChild(label);

      btn.addEventListener('click', () => {
        this.engine.focusBody(key);
      });

      this.bodyQuickBar.appendChild(btn);
    }
  }

  bindEvents() {
    // Play/Pause
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => {
        const isPaused = this.engine.physics.togglePause();
        this.updatePlayPauseUI(isPaused);
      });
    }

    // Warp Slider
    if (this.warpSlider) {
      this.warpSlider.addEventListener('input', (e) => {
        const exponent = parseFloat(e.target.value);
        // Exponent maps -3..3 to -1000..1000 with 0 at center
        let val = 0;
        if (Math.abs(exponent) < 0.1) {
          val = 0;
        } else if (exponent > 0) {
          val = Math.pow(10, exponent);
        } else {
          val = -Math.pow(10, -exponent);
        }

        val = Math.round(val);
        this.setWarp(val, false);
      });
    }

    // Scale Mode Toggle
    if (this.scaleModeToggle) {
      this.scaleModeToggle.addEventListener('click', () => {
        const currentMode = this.engine.physics.scaleMode;
        const newMode = currentMode === 'exploration' ? 'trueScale' : 'exploration';
        this.engine.physics.setScaleMode(newMode);

        const btnText = this.scaleModeToggle.querySelector('.toggle-label');
        if (btnText) {
          btnText.textContent = newMode === 'exploration' ? 'EXPLORATION SCALE' : 'TRUE ORBIT SCALE';
        }
        this.scaleModeToggle.classList.toggle('true-scale-active', newMode === 'trueScale');
      });
    }

    // Reset View
    if (this.resetViewBtn) {
      this.resetViewBtn.addEventListener('click', () => {
        this.engine.resetCameraView();
      });
    }

    // Telemetry Drawer Close
    if (this.telemetryCloseBtn) {
      this.telemetryCloseBtn.addEventListener('click', () => {
        this.engine.resetCameraView();
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Space for Play/Pause
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const isPaused = this.engine.physics.togglePause();
        this.updatePlayPauseUI(isPaused);
      }
    });
  }

  setWarp(multiplier, updateSlider = true) {
    this.activePresetValue = multiplier;
    this.engine.physics.setWarpMultiplier(multiplier);

    // Update preset buttons UI
    const presetBtns = this.warpPresetsContainer.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.classList.toggle('active', parseFloat(btn.dataset.warp) === multiplier);
    });

    if (this.warpValueText) {
      this.warpValueText.textContent = `${multiplier}x`;
    }

    if (updateSlider && this.warpSlider) {
      if (multiplier === 0) {
        this.warpSlider.value = 0;
      } else if (multiplier > 0) {
        this.warpSlider.value = Math.log10(multiplier);
      } else {
        this.warpSlider.value = -Math.log10(-multiplier);
      }
    }

    this.updatePlayPauseUI(multiplier === 0);
  }

  updatePlayPauseUI(isPaused) {
    if (!this.playPauseBtn) return;
    const icon = this.playPauseBtn.querySelector('.play-pause-icon');
    if (icon) {
      icon.innerHTML = isPaused
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    }
  }

  handleBodySelected(bodyId) {
    // Update quick bar active state
    const chips = this.bodyQuickBar.querySelectorAll('.body-chip');
    chips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.bodyId === bodyId);
    });

    if (!bodyId) {
      this.closeTelemetry();
      return;
    }

    this.openTelemetry(bodyId);
  }

  openTelemetry(bodyId) {
    const config = CELESTIAL_BODIES[bodyId];
    if (!config || !this.telemetryDrawer) return;

    this.telemetryTitle.textContent = config.name.toUpperCase();
    this.telemetryType.textContent = config.type;

    // Render Telemetry data grid
    const stats = config.telemetry;
    this.telemetryStats.innerHTML = '';

    for (const [key, value] of Object.entries(stats)) {
      const row = document.createElement('div');
      row.className = 'telemetry-row';

      const label = document.createElement('div');
      label.className = 'telemetry-label';
      label.textContent = this.formatTelemetryKey(key);

      const val = document.createElement('div');
      val.className = 'telemetry-value';
      val.textContent = value;

      row.appendChild(label);
      row.appendChild(val);
      this.telemetryStats.appendChild(row);
    }

    this.telemetryDrawer.classList.add('open');
  }

  closeTelemetry() {
    if (this.telemetryDrawer) {
      this.telemetryDrawer.classList.remove('open');
    }
  }

  formatTelemetryKey(key) {
    const map = {
      diameter: 'EQUATORIAL DIAMETER',
      relativeSize: 'SCALE VS EARTH',
      mass: 'TOTAL MASS',
      surfaceTemp: 'SURFACE TEMPERATURE',
      coreTemp: 'CORE TEMPERATURE',
      surfaceGravity: 'SURFACE GRAVITY',
      distanceFromSun: 'MEAN SOLAR DISTANCE',
      orbitalPeriod: 'ORBITAL PERIOD (YEAR)',
      rotationPeriod: 'SIDEREAL ROTATION (DAY)',
      moons: 'NATURAL SATELLITES',
      composition: 'CORE COMPOSITION',
      classification: 'PLANETARY CLASS'
    };
    return map[key] || key.toUpperCase();
  }

  handleBodyHovered(bodyId) {
    if (!this.hoverTooltip) return;

    if (!bodyId) {
      this.hoverTooltip.style.opacity = '0';
      return;
    }

    const config = CELESTIAL_BODIES[bodyId];
    if (config) {
      this.hoverTooltip.textContent = `${config.name} (${config.type})`;
      this.hoverTooltip.style.opacity = '1';
    }
  }

  startEpochUpdater() {
    const update = () => {
      if (this.epochDisplay) {
        const date = this.engine.physics.getSimulatedDate();
        const dateStr = date.toISOString().split('T')[0];
        const elapsed = this.engine.physics.elapsedDays.toFixed(1);
        this.epochDisplay.innerHTML = `<span class="epoch-label">SIMULATION EPOCH:</span> <span class="epoch-val">${dateStr}</span> <span class="epoch-elapsed">(T+ ${elapsed}d)</span>`;
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
}
