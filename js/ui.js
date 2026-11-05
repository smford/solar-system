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
    this.epochDatePicker = document.getElementById('epoch-date-picker');
    this.epochTodayBtn = document.getElementById('btn-epoch-today');
    this.epochElapsed = document.getElementById('epoch-elapsed');
    this.fpsDisplay = document.getElementById('fps-display');
    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.reverseBtn = document.getElementById('btn-reverse');
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

    this.currentSpeedMagnitude = 1.0;
    this.isReversed = false;

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
      btn.className = `preset-btn ${preset.value === 1.0 ? 'active' : ''}`;
      btn.textContent = preset.label;
      btn.dataset.speed = preset.value;

      btn.addEventListener('click', () => {
        this.setSpeed(preset.value, true);
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
        const currentlyPaused = this.engine.physics.isPaused;
        if (currentlyPaused) {
          // If paused at 0 speed, resume to 1.0x
          if (this.currentSpeedMagnitude === 0) {
            this.setSpeed(1.0, true);
          } else {
            this.engine.physics.isPaused = false;
            this.updatePlayPauseUI(false);
          }
        } else {
          this.engine.physics.isPaused = true;
          this.updatePlayPauseUI(true);
        }
      });
    }

    // Reverse Direction Toggle
    if (this.reverseBtn) {
      this.reverseBtn.addEventListener('click', () => {
        this.toggleReverse();
      });
    }

    // Speed Slider (Direct linear speed control)
    if (this.warpSlider) {
      this.warpSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.setSpeed(val, false);
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

    // Epoch Date Controls
    if (this.epochDatePicker) {
      this.epochDatePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          this.engine.physics.setDate(e.target.value);
        }
      });
      this.epochDatePicker.addEventListener('keydown', (e) => {
        e.stopPropagation();
      });
    }

    if (this.epochTodayBtn) {
      this.epochTodayBtn.addEventListener('click', () => {
        this.engine.physics.setCurrentDate();
        if (this.epochDatePicker) {
          const nowStr = this.engine.physics.getSimulatedDate().toISOString().split('T')[0];
          this.epochDatePicker.value = nowStr;
        }
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      // Space for Play/Pause
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const currentlyPaused = this.engine.physics.isPaused;
        if (currentlyPaused) {
          if (this.currentSpeedMagnitude === 0) {
            this.setSpeed(1.0, true);
          } else {
            this.engine.physics.isPaused = false;
            this.updatePlayPauseUI(false);
          }
        } else {
          this.engine.physics.isPaused = true;
          this.updatePlayPauseUI(true);
        }
      }
    });
  }

  /**
   * Set simulation speed multiplier accurately and update all HUD elements
   */
  setSpeed(magnitude, updateSlider = true) {
    this.currentSpeedMagnitude = magnitude;

    // Apply signed multiplier to physics
    const signedMultiplier = (this.isReversed ? -1 : 1) * magnitude;
    this.engine.physics.setWarpMultiplier(signedMultiplier);

    // Update Speed Badge Text
    if (this.warpValueText) {
      const signStr = (this.isReversed && magnitude > 0) ? '-' : '';
      this.warpValueText.textContent = `${signStr}${magnitude.toFixed(1)}x`;
    }

    // Update Slider Position
    if (updateSlider && this.warpSlider) {
      this.warpSlider.value = magnitude;
    }

    // Highlight matching preset button
    const presetBtns = this.warpPresetsContainer.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      const presetVal = parseFloat(btn.dataset.speed);
      btn.classList.toggle('active', Math.abs(presetVal - magnitude) < 0.05);
    });

    this.updatePlayPauseUI(magnitude === 0);
  }

  /**
   * Toggle forward vs reverse orbital simulation direction
   */
  toggleReverse() {
    this.isReversed = !this.isReversed;
    if (this.reverseBtn) {
      this.reverseBtn.classList.toggle('active', this.isReversed);
    }
    // Re-apply current speed with new sign
    this.setSpeed(this.currentSpeedMagnitude, false);
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
      const date = this.engine.physics.getSimulatedDate();
      const dateStr = date.toISOString().split('T')[0];
      const elapsed = this.engine.physics.elapsedDays;
      const sign = elapsed >= 0 ? '+' : '-';
      const absDays = Math.abs(elapsed).toFixed(1);

      // Only update input value when user is not actively editing it
      if (this.epochDatePicker && document.activeElement !== this.epochDatePicker) {
        if (this.epochDatePicker.value !== dateStr) {
          this.epochDatePicker.value = dateStr;
        }
      }

      if (this.epochElapsed) {
        this.epochElapsed.textContent = `(T${sign} ${absDays}d)`;
      }

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }
}
