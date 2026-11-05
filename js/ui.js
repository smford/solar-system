/**
 * HELIOS User Interface & Telemetry HUD Controller
 * Minimalist dark glassmorphic control dock, side telemetry drawer, timeline scrubbers, and selectors.
 */
import { CELESTIAL_BODIES, TIME_PRESETS, findMoonById, ASTEROID_BELTS, findBeltById, HISTORICAL_EVENTS, findHistoricalEventById } from './config.js';

export class UIController {
  constructor(engine) {
    this.engine = engine;

    // DOM Elements
    this.epochDisplay = document.getElementById('epoch-display');
    this.epochDatePicker = document.getElementById('epoch-date-picker');
    this.epochTodayBtn = document.getElementById('btn-epoch-today');
    this.epochElapsed = document.getElementById('epoch-elapsed');
    this.historicalEventsSelect = document.getElementById('historical-events-select');
    this.fpsDisplay = document.getElementById('fps-display');
    this.playPauseBtn = document.getElementById('btn-play-pause');
    this.reverseBtn = document.getElementById('btn-reverse');
    this.warpPresetsContainer = document.getElementById('warp-presets');
    this.warpSlider = document.getElementById('warp-slider');
    this.warpValueText = document.getElementById('warp-value-text');
    this.scaleModeToggle = document.getElementById('scale-toggle');
    this.btnToggleBelts = document.getElementById('btn-toggle-belts');
    this.btnToggleGrid = document.getElementById('btn-toggle-grid');
    this.btnSurfaceView = document.getElementById('btn-surface-view');
    this.bodyQuickBar = document.getElementById('body-quick-bar');
    this.resetViewBtn = document.getElementById('btn-reset-view');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnToggleAudio = document.getElementById('btn-toggle-audio');
    this.toggleUiBtn = document.getElementById('btn-toggle-ui');

    // Surface View HUD Banner Elements
    this.surfaceViewBanner = document.getElementById('surface-view-banner');
    this.surfaceViewBannerText = document.getElementById('surface-view-banner-text');
    this.btnExitSurfaceView = document.getElementById('btn-exit-surface-view');

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
    this.isUiHidden = false;
    this.activeHistoricalEvent = null;

    this.init();
  }

  init() {
    this.buildWarpPresets();
    this.buildBodyQuickBar();
    this.buildHistoricalEventsSelect();
    this.bindEvents();
    this.bindHistoricalEvents();

    // Hook engine callbacks
    this.engine.onSelectBody = (bodyId) => this.handleBodySelected(bodyId);
    this.engine.onHoverBody = (bodyId) => this.handleBodyHovered(bodyId);
    this.engine.onFpsUpdate = (fps) => {
      if (this.fpsDisplay) {
        this.fpsDisplay.textContent = `${fps} FPS`;
      }
    };
    this.engine.onSurfaceViewChange = (isActive, bodyId) => {
      this.updateSurfaceButtonUI(isActive);
      this.updateSurfaceBannerUI(isActive, bodyId);
      this.updateTelemetrySurfaceBtnUI(isActive, bodyId);
    };
    if (this.engine.audio) {
      this.engine.audio.onStateChange = (enabled) => {
        this.updateAudioButtonUI(enabled);
      };
    }

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

    // Add Asteroid & Kuiper Belt quick selector chips
    for (const [beltKey, beltConfig] of Object.entries(ASTEROID_BELTS)) {
      const btn = document.createElement('button');
      btn.className = 'body-chip belt-chip';
      btn.dataset.bodyId = beltKey;
      btn.title = `Inspect ${beltConfig.name}`;

      const dot = document.createElement('span');
      dot.className = 'body-dot belt-dot';
      dot.style.backgroundColor = beltConfig.color;

      const label = document.createElement('span');
      label.textContent = beltConfig.name;

      btn.appendChild(dot);
      btn.appendChild(label);

      btn.addEventListener('click', () => {
        this.engine.focusBody(beltKey);
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

    // Toggle Asteroid Belts (Main Belt & Kuiper Belt)
    if (this.btnToggleBelts) {
      this.btnToggleBelts.addEventListener('click', () => {
        const visible = this.engine.toggleBelts();
        this.updateBeltsButtonUI(visible);
      });
    }

    // Toggle Astronomical Distance Grid (AU Circles)
    if (this.btnToggleGrid) {
      this.btnToggleGrid.addEventListener('click', () => {
        const visible = this.engine.toggleGrid();
        this.updateGridButtonUI(visible);
      });
    }

    // Toggle Planetarium Surface Sky View
    if (this.btnSurfaceView) {
      this.btnSurfaceView.addEventListener('click', () => {
        this.engine.toggleSurfaceView();
      });
    }

    // Exit Planetarium Surface Sky View from Banner
    if (this.btnExitSurfaceView) {
      this.btnExitSurfaceView.addEventListener('click', () => {
        this.engine.exitSurfaceView();
      });
    }

    // Reset View
    if (this.resetViewBtn) {
      this.resetViewBtn.addEventListener('click', () => {
        this.activeHistoricalEvent = null;
        if (this.historicalEventsSelect) {
          this.historicalEventsSelect.value = '';
        }
        this.engine.resetCameraView();
      });
    }

    // Telemetry Drawer Close
    if (this.telemetryCloseBtn) {
      this.telemetryCloseBtn.addEventListener('click', () => {
        this.activeHistoricalEvent = null;
        if (this.historicalEventsSelect) {
          this.historicalEventsSelect.value = '';
        }
        this.engine.resetCameraView();
      });
    }

    // Epoch Date Controls
    if (this.epochDatePicker) {
      this.epochDatePicker.addEventListener('change', (e) => {
        if (e.target.value) {
          this.activeHistoricalEvent = null;
          if (this.historicalEventsSelect) {
            this.historicalEventsSelect.value = '';
          }
          this.engine.physics.setDate(e.target.value);
        }
      });
      this.epochDatePicker.addEventListener('keydown', (e) => {
        e.stopPropagation();
      });
    }

    if (this.epochTodayBtn) {
      this.epochTodayBtn.addEventListener('click', () => {
        this.activeHistoricalEvent = null;
        if (this.historicalEventsSelect) {
          this.historicalEventsSelect.value = '';
        }
        this.engine.physics.setCurrentDate();
        if (this.epochDatePicker) {
          const nowStr = this.engine.physics.getSimulatedDate().toISOString().split('T')[0];
          this.epochDatePicker.value = nowStr;
        }
      });
    }

    // Toggle Fullscreen Button
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        this.toggleFullscreen();
      });
    }

    // Toggle Cosmic Audio Button
    if (this.btnToggleAudio) {
      this.btnToggleAudio.addEventListener('click', async () => {
        const enabled = await this.engine.toggleAudio();
        this.updateAudioButtonUI(enabled);
      });
    }

    // Native Fullscreen Change Listeners
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
      document.addEventListener(evt, () => {
        this.updateFullscreenUI();
        if (this.engine) {
          if (typeof this.engine.onWindowResize === 'function') {
            this.engine.onWindowResize();
          } else if (typeof this.engine.onResize === 'function') {
            this.engine.onResize();
          }
        }
      });
    });

    // Toggle All Controls (Cinema Mode)
    if (this.toggleUiBtn) {
      this.toggleUiBtn.addEventListener('click', () => {
        this.toggleUIVisibility();
      });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle global keyboard navigation shortcuts
   */
  handleKeyDown(e) {
    const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;

    // Toggle Fullscreen with 'F' key
    if ((e.code === 'KeyF' || e.key === 'f' || e.key === 'F') && !isInput) {
      e.preventDefault();
      this.toggleFullscreen();
      return;
    }

    // Toggle Cosmic Audio with 'M' key
    if ((e.code === 'KeyM' || e.key === 'm' || e.key === 'M') && !isInput) {
      e.preventDefault();
      this.engine.toggleAudio().then((enabled) => {
        this.updateAudioButtonUI(enabled);
      });
      return;
    }

    // Toggle UI visibility with 'H' key
    if ((e.key === 'h' || e.key === 'H') && !isInput) {
      this.toggleUIVisibility();
      return;
    }

    // Toggle Asteroid Belts visibility with 'B' key
    if ((e.key === 'b' || e.key === 'B') && !isInput) {
      const visible = this.engine.toggleBelts();
      this.updateBeltsButtonUI(visible);
      return;
    }

    // Toggle Astronomical Distance Grid visibility with 'G' key
    if ((e.key === 'g' || e.key === 'G') && !isInput) {
      const visible = this.engine.toggleGrid();
      this.updateGridButtonUI(visible);
      return;
    }

    // Toggle Planetarium Surface Sky View with 'V' key
    if ((e.key === 'v' || e.key === 'V') && !isInput) {
      this.engine.toggleSurfaceView();
      return;
    }

    // Space for Play/Pause
    if (e.code === 'Space' && !isInput) {
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
  }

  /**
   * Cross-browser native Fullscreen API toggle
   */
  toggleFullscreen() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFull) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.warn('Fullscreen request denied:', err));
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => console.warn('Exit fullscreen error:', err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }

  /**
   * Synchronize Fullscreen HUD button state, icon, and tooltip
   */
  updateFullscreenUI(isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
    if (!this.btnFullscreen) return;
    this.btnFullscreen.classList.toggle('active', isFull);
    this.btnFullscreen.title = isFull ? 'Exit Fullscreen (F)' : 'Toggle Fullscreen (F)';
    const label = this.btnFullscreen.querySelector('.toggle-fullscreen-label');
    if (label) {
      label.textContent = isFull ? 'EXIT FULL' : 'FULLSCREEN';
    }
    const icon = this.btnFullscreen.querySelector('svg');
    if (icon) {
      if (isFull) {
        // Collapsing 4-corner arrows SVG icon for exiting fullscreen
        icon.innerHTML = `<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>`;
      } else {
        // Expanding 4-corner arrows SVG icon for entering fullscreen
        icon.innerHTML = `<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>`;
      }
    }
  }

  buildHistoricalEventsSelect() {
    if (!this.historicalEventsSelect) return;
    this.historicalEventsSelect.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'HISTORICAL EVENTS & FLYBYS...';
    this.historicalEventsSelect.appendChild(defaultOpt);

    // Group events cleanly by category
    const categories = {};
    for (const event of HISTORICAL_EVENTS) {
      const cat = event.category || 'Curated Events';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(event);
    }

    for (const [categoryName, events] of Object.entries(categories)) {
      const group = document.createElement('optgroup');
      group.label = categoryName.toUpperCase();

      for (const ev of events) {
        const opt = document.createElement('option');
        opt.value = ev.id;
        opt.textContent = `${ev.name} (${ev.date})`;
        group.appendChild(opt);
      }
      this.historicalEventsSelect.appendChild(group);
    }
  }

  bindHistoricalEvents() {
    if (!this.historicalEventsSelect) return;

    this.historicalEventsSelect.addEventListener('change', (e) => {
      const eventId = e.target.value;
      if (!eventId) {
        this.activeHistoricalEvent = null;
        return;
      }
      this.triggerHistoricalEvent(eventId);
    });

    this.historicalEventsSelect.addEventListener('keydown', (e) => {
      e.stopPropagation();
    });
  }

  triggerHistoricalEvent(eventId) {
    const event = findHistoricalEventById(eventId);
    if (!event) return;

    this.activeHistoricalEvent = event;

    // 1. Update simulation date
    if (typeof this.engine.setSimulationDate === 'function') {
      this.engine.setSimulationDate(event.date);
    } else if (this.engine.physics?.setEpochDate) {
      this.engine.physics.setEpochDate(event.date);
    } else {
      this.engine.physics.setDate(event.date);
    }

    // 2. Synchronize epoch date picker & elapsed counter immediately
    this.syncEpochUI();

    // 3. Smoothly focus the camera on the target body
    this.engine.focusBody(event.target);

    // 4. Open telemetry drawer with curated historical event details
    this.openHistoricalEventTelemetry(event);
  }

  syncEpochUI() {
    const date = this.engine.physics.getSimulatedDate();
    const dateStr = date.toISOString().split('T')[0];
    const elapsed = this.engine.physics.elapsedDays;
    const sign = elapsed >= 0 ? '+' : '-';
    const absDays = Math.abs(elapsed).toFixed(1);

    if (this.epochDatePicker) {
      this.epochDatePicker.value = dateStr;
    }
    if (this.epochElapsed) {
      this.epochElapsed.textContent = `(T${sign} ${absDays}d)`;
    }
  }

  /**
   * Toggle visibility of all HUD telemetry, docks, labels, and action buttons
   */
  toggleUIVisibility() {
    this.isUiHidden = !this.isUiHidden;
    document.body.classList.toggle('ui-hidden', this.isUiHidden);

    if (this.toggleUiBtn) {
      const label = this.toggleUiBtn.querySelector('.toggle-ui-label');
      const icon = this.toggleUiBtn.querySelector('svg');

      if (this.isUiHidden) {
        if (label) label.textContent = 'SHOW UI';
        this.toggleUiBtn.title = 'Show All Controls (H)';
        if (icon) {
          icon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          `;
        }
      } else {
        if (label) label.textContent = 'HIDE UI';
        this.toggleUiBtn.title = 'Hide All Controls (H)';
        if (icon) {
          icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          `;
        }
      }
    }
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

  updateBeltsButtonUI(visible) {
    if (!this.btnToggleBelts) return;
    const label = this.btnToggleBelts.querySelector('.toggle-belts-label');
    if (label) {
      label.textContent = visible ? 'BELTS: ON' : 'BELTS: OFF';
    }
    this.btnToggleBelts.classList.toggle('active', visible);
    this.btnToggleBelts.classList.toggle('belts-off', !visible);
    this.btnToggleBelts.title = visible ? 'Toggle Asteroid & Kuiper Belts (B)' : 'Show Asteroid & Kuiper Belts (B)';
  }

  updateGridButtonUI(visible) {
    if (!this.btnToggleGrid) return;
    const label = this.btnToggleGrid.querySelector('.toggle-grid-label');
    if (label) {
      label.textContent = visible ? 'GRID: ON' : 'GRID: OFF';
    }
    this.btnToggleGrid.classList.toggle('active', visible);
    this.btnToggleGrid.classList.toggle('grid-off', !visible);
    this.btnToggleGrid.title = visible ? 'Toggle Astronomical AU Distance Grid (G)' : 'Show Astronomical AU Distance Grid (G)';
  }

  updateSurfaceButtonUI(active) {
    if (!this.btnSurfaceView) return;
    const label = this.btnSurfaceView.querySelector('.toggle-surface-label');
    if (label) {
      label.textContent = active ? 'SURFACE: ON' : 'SURFACE: OFF';
    }
    this.btnSurfaceView.classList.toggle('active', active);
    this.btnSurfaceView.classList.toggle('surface-off', !active);
    this.btnSurfaceView.title = active ? 'Exit Planetarium Surface Sky View (V)' : 'Toggle Planetarium Surface Sky View (V)';
  }

  updateAudioButtonUI(enabled) {
    if (!this.btnToggleAudio) return;
    const label = this.btnToggleAudio.querySelector('.toggle-audio-label');
    if (label) {
      label.textContent = enabled ? 'AUDIO: ON' : 'AUDIO: OFF';
    }
    this.btnToggleAudio.classList.toggle('active', !!enabled);
    this.btnToggleAudio.classList.toggle('audio-off', !enabled);
    this.btnToggleAudio.title = enabled ? 'Mute Cosmic Audio (M)' : 'Toggle Cosmic Audio (M)';

    const iconSvg = this.btnToggleAudio.querySelector('svg');
    if (iconSvg) {
      if (enabled) {
        // Speaker with soundwaves icon for Audio ON
        iconSvg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        `;
      } else {
        // Speaker with diagonal mute slash for Audio OFF
        iconSvg.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        `;
      }
    }
  }

  updateSurfaceBannerUI(active, bodyId) {
    if (!this.surfaceViewBanner || !this.surfaceViewBannerText) return;
    if (active && bodyId) {
      const config = CELESTIAL_BODIES[bodyId] || findMoonById(bodyId);
      const name = config ? config.name.toUpperCase() : bodyId.toUpperCase();
      this.surfaceViewBannerText.textContent = `SURFACE VIEW — LOOKING OUT FROM ${name} (ESC OR V TO EXIT)`;
      this.surfaceViewBanner.style.display = 'flex';
    } else {
      this.surfaceViewBanner.style.display = 'none';
    }
  }

  updateTelemetrySurfaceBtnUI(active, bodyId) {
    const btn = document.getElementById('btn-telemetry-surface');
    if (!btn) return;
    const label = btn.querySelector('.drawer-surface-label');
    const isCurrentSurface = active && this.engine.surfaceBodyId === bodyId;
    btn.classList.toggle('active', isCurrentSurface);
    if (label) {
      label.textContent = isCurrentSurface ? 'EXIT SURFACE VIEW' : 'VIEW FROM SURFACE';
    }
  }

  handleBodySelected(bodyId) {
    // Update quick bar active state
    const chips = this.bodyQuickBar.querySelectorAll('.body-chip');
    const moon = findMoonById(bodyId);
    const activePlanetId = moon ? moon.parentId : bodyId;

    chips.forEach(chip => {
      chip.classList.toggle('active', chip.dataset.bodyId === activePlanetId);
    });

    if (!bodyId) {
      this.activeHistoricalEvent = null;
      if (this.historicalEventsSelect) {
        this.historicalEventsSelect.value = '';
      }
      this.closeTelemetry();
      return;
    }

    // If body selection matches active historical event target, open historical telemetry
    if (this.activeHistoricalEvent && (this.activeHistoricalEvent.target === bodyId || (moon && this.activeHistoricalEvent.target === moon.id))) {
      this.openHistoricalEventTelemetry(this.activeHistoricalEvent);
    } else {
      this.activeHistoricalEvent = null;
      if (this.historicalEventsSelect) {
        this.historicalEventsSelect.value = '';
      }
      this.openTelemetry(bodyId);
    }
  }

  openTelemetry(bodyId) {
    const config = CELESTIAL_BODIES[bodyId] || findMoonById(bodyId) || findBeltById(bodyId);
    if (!config || !this.telemetryDrawer) return;

    this.telemetryTitle.textContent = config.name.toUpperCase();
    this.telemetryType.textContent = config.type || (config.parentId ? `NATURAL SATELLITE (${config.parentId.toUpperCase()})` : 'CELESTIAL SYSTEM');

    // Render Telemetry data grid
    this.telemetryStats.innerHTML = '';

    // Moon, planet, or asteroid belt descriptive overview
    if (config.description) {
      const descEl = document.createElement('div');
      descEl.className = 'telemetry-description';
      descEl.style.padding = '0.65rem 0 0.85rem 0';
      descEl.style.fontSize = '0.82rem';
      descEl.style.color = '#94a3b8';
      descEl.style.lineHeight = '1.45';
      descEl.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
      descEl.style.marginBottom = '0.75rem';
      descEl.textContent = config.description;
      this.telemetryStats.appendChild(descEl);
    }

    // Planetarium Surface View Quick Action Button
    if (bodyId !== 'sun' && bodyId !== 'mainBelt' && bodyId !== 'kuiperBelt') {
      const surfaceBtn = document.createElement('button');
      surfaceBtn.id = 'btn-telemetry-surface';
      const isCurrentSurface = this.engine.isSurfaceView && this.engine.surfaceBodyId === bodyId;
      surfaceBtn.className = `drawer-surface-btn ${isCurrentSurface ? 'active' : ''}`;
      surfaceBtn.title = isCurrentSurface ? 'Return to orbital view (V)' : 'Place camera on surface looking outward into the sky (V)';
      surfaceBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M3 20h18"/>
        </svg>
        <span class="drawer-surface-label">${isCurrentSurface ? 'EXIT SURFACE VIEW' : 'VIEW FROM SURFACE'}</span>
      `;
      surfaceBtn.addEventListener('click', () => {
        this.engine.toggleSurfaceView(bodyId);
        this.closeTelemetry();
      });
      this.telemetryStats.appendChild(surfaceBtn);
    }

    const stats = config.telemetry || {};
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

  openHistoricalEventTelemetry(event) {
    if (!this.telemetryDrawer || !event) return;

    this.telemetryTitle.textContent = event.name.toUpperCase();
    this.telemetryType.textContent = (event.category || 'HISTORICAL EVENT').toUpperCase();

    this.telemetryStats.innerHTML = '';

    // Meta Badge (Epoch Date & Category)
    const badgeRow = document.createElement('div');
    badgeRow.className = 'telemetry-event-badge';
    badgeRow.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>EPOCH: ${event.date}</span>
    `;
    this.telemetryStats.appendChild(badgeRow);

    // Event Description
    if (event.description) {
      const descEl = document.createElement('div');
      descEl.className = 'telemetry-description';
      descEl.style.padding = '0.65rem 0 0.85rem 0';
      descEl.style.fontSize = '0.84rem';
      descEl.style.color = '#cbd5e1';
      descEl.style.lineHeight = '1.5';
      descEl.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
      descEl.textContent = event.description;
      this.telemetryStats.appendChild(descEl);
    }

    // Planetarium Surface View Quick Action Button for Historical Event Target
    if (event.target && event.target !== 'sun' && event.target !== 'mainBelt' && event.target !== 'kuiperBelt') {
      const surfaceBtn = document.createElement('button');
      surfaceBtn.id = 'btn-telemetry-surface';
      const isCurrentSurface = this.engine.isSurfaceView && this.engine.surfaceBodyId === event.target;
      surfaceBtn.className = `drawer-surface-btn ${isCurrentSurface ? 'active' : ''}`;
      surfaceBtn.title = isCurrentSurface ? 'Return to orbital view (V)' : 'Place camera on surface looking outward into the sky (V)';
      surfaceBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M3 20h18"/>
        </svg>
        <span class="drawer-surface-label">${isCurrentSurface ? 'EXIT SURFACE VIEW' : 'VIEW FROM SURFACE'}</span>
      `;
      surfaceBtn.addEventListener('click', () => {
        this.engine.toggleSurfaceView(event.target);
        this.closeTelemetry();
      });
      this.telemetryStats.appendChild(surfaceBtn);
    }

    // Historical Significance Callout
    if (event.significance) {
      const sigEl = document.createElement('div');
      sigEl.className = 'telemetry-event-significance';
      sigEl.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 9px; font-weight: 700; color: #facc15; letter-spacing: 0.08em; margin-bottom: 4px;">HISTORICAL SIGNIFICANCE</div>
        <div style="color: #fef08a; font-size: 0.82rem; line-height: 1.45;">${event.significance}</div>
      `;
      this.telemetryStats.appendChild(sigEl);
    }

    // Spacecraft / Mission Row
    if (event.spacecraft) {
      const craftRow = document.createElement('div');
      craftRow.className = 'telemetry-row';
      craftRow.innerHTML = `
        <div class="telemetry-label">SPACECRAFT / MISSION</div>
        <div class="telemetry-value">${event.spacecraft}</div>
      `;
      this.telemetryStats.appendChild(craftRow);
    }

    // Target Celestial Body Row
    const targetBodyConfig = CELESTIAL_BODIES[event.target] || findMoonById(event.target) || findBeltById(event.target);
    const targetName = targetBodyConfig ? targetBodyConfig.name : (event.target.charAt(0).toUpperCase() + event.target.slice(1));
    const targetRow = document.createElement('div');
    targetRow.className = 'telemetry-row';
    targetRow.innerHTML = `
      <div class="telemetry-label">TARGET CELESTIAL BODY</div>
      <div class="telemetry-value">${targetName}</div>
    `;
    this.telemetryStats.appendChild(targetRow);

    // Detailed Telemetry Rows
    if (event.telemetry) {
      for (const [key, value] of Object.entries(event.telemetry)) {
        if (key === 'significance' && event.significance) continue;

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
      semiMajorAxis: 'SEMI-MAJOR AXIS',
      orbitalPeriod: 'ORBITAL PERIOD',
      rotationPeriod: 'SIDEREAL ROTATION',
      moons: 'NATURAL SATELLITES',
      largestBodies: 'NOTABLE OBJECTS',
      largestBody: 'LARGEST OBJECT',
      estimatedCount: 'ESTIMATED POPULATION',
      location: 'SOLAR LOCATION',
      parentPlanet: 'HOST PLANET',
      composition: 'CORE COMPOSITION',
      classification: 'CLASSIFICATION',
      eventDate: 'HISTORICAL DATE & TIME',
      targetBody: 'OBSERVATORY TARGET',
      spacecraft: 'SPACECRAFT / MISSION',
      crew: 'MISSION CREW',
      coordinates: 'SURFACE COORDINATES',
      surfaceDuration: 'SURFACE EVA DURATION',
      flybyAltitude: 'FLYBY ALTITUDE',
      flybyDistance: 'CLOSEST APPROACH DISTANCE',
      flybyVelocity: 'RELATIVE VELOCITY',
      discoveries: 'NOTABLE DISCOVERIES',
      heliocentricDistance: 'HELIOCENTRIC DISTANCE',
      angularSeparation: 'ANGULAR SEPARATION',
      historicalInterval: 'HISTORICAL INTERVAL',
      jupiterDistance: 'JUPITER-EARTH DISTANCE',
      saturnDistance: 'SATURN-EARTH DISTANCE',
      totalityDuration: 'MAX TOTALITY DURATION',
      shadowPathWidth: 'UMBRAL PATH WIDTH',
      alignmentType: 'ALIGNMENT TYPE',
      solarCyclePhase: 'SOLAR CYCLE STATUS',
      mainEngineBurn: 'MAIN ENGINE BURN',
      tourDuration: 'TOUR DURATION',
      majorDiscoveries: 'MAJOR DISCOVERIES',
      landingSite: 'LANDING SITE',
      landingMethod: 'ENTRY & DESCENT METHOD',
      boundary: 'HELIOSPHERIC BOUNDARY',
      velocity: 'HELIOCENTRIC VELOCITY',
      solarDistance: 'DISTANCE FROM SUN'
    };
    return map[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase();
  }

  handleBodyHovered(bodyId) {
    if (!this.hoverTooltip) return;

    if (!bodyId) {
      this.hoverTooltip.style.opacity = '0';
      return;
    }

    const config = CELESTIAL_BODIES[bodyId] || findMoonById(bodyId) || findBeltById(bodyId);
    if (config) {
      if (config.parentId) {
        const parentName = config.parentId.charAt(0).toUpperCase() + config.parentId.slice(1);
        this.hoverTooltip.textContent = `${config.name} (Moon of ${parentName})`;
      } else if (config.type) {
        this.hoverTooltip.textContent = `${config.name} (${config.type})`;
      } else {
        this.hoverTooltip.textContent = config.name;
      }
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
