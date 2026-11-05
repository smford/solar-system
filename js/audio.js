/**
 * CosmicAudioEngine
 * Procedural Web Audio API celestial soundscape synthesizer.
 * 100% self-contained code - zero external audio assets, zero bandwidth, zero loading latency.
 *
 * Synthesizes:
 * - Central Cosmic Background Drone (sub-harmonic sub-bass drone with resonant LFO lowpass filter sweep)
 * - Sun: Solar acoustic oscillations / roaring thermonuclear rumble (resonant brownian noise & deep sub-oscillator)
 * - Jupiter: Jovian decametric radio whistlers & magnetospheric chorus (swept FM carrier modulation & chorus flutter)
 * - Saturn: Saturn Kilometric Radiation (SKR) eerie high-harmonic whistle & highpass ring dust hiss
 * - Earth: Terrestrial auroral kilometric radiation (AKR) & Schumann / geomagnetic field harmonics
 * - Mars: Faint dusty Martian wind breeze (resonant bandpass noise modulated by gentle slow gust LFOs)
 *
 * Implements smooth proximity & selection crossfading based on 3D camera coordinates and focused body.
 */

// Target maximum mix volumes for each celestial body
const PLANET_MAX_GAINS = {
  sun: 0.50,
  jupiter: 0.46,
  saturn: 0.44,
  earth: 0.40,
  mars: 0.42
};

// Moon to parent planet mapping for audio focus
const MOON_PARENT_MAP = {
  moon: 'earth',
  phobos: 'mars',
  deimos: 'mars',
  io: 'jupiter',
  europa: 'jupiter',
  ganymede: 'jupiter',
  callisto: 'jupiter',
  mimas: 'saturn',
  enceladus: 'saturn',
  titan: 'saturn'
};

export class CosmicAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.droneGain = null;
    this.planetGains = {};
    this.activeNodes = [];

    this.isEnabled = false;
    this.targetMasterVolume = 0.38;
    this.baseDroneGain = 0.62;

    this.currentPlanetWeights = {
      sun: 0,
      jupiter: 0,
      saturn: 0,
      earth: 0,
      mars: 0
    };

    // State change callback
    this.onStateChange = null;
  }

  /**
   * Browser autoplay policy compliant: Start/resume AudioContext only upon explicit user gesture
   */
  async toggleAudio() {
    if (!this.isEnabled) {
      return await this.enableAudio();
    } else {
      return this.disableAudio();
    }
  }

  /**
   * Initializes audio graph and smoothly fades master volume up
   */
  async enableAudio() {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) {
          console.warn('[CosmicAudioEngine] Web Audio API is not supported in this browser.');
          return false;
        }
        this.ctx = new AudioContextClass();
        this.setupAudioGraph();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isEnabled = true;

      // Exponential smoothing to avoid clicks
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
      this.masterGain.gain.setTargetAtTime(this.targetMasterVolume, now, 0.15);

      if (this.onStateChange) this.onStateChange(true);
      return true;
    } catch (err) {
      console.warn('[CosmicAudioEngine] Failed to enable audio:', err);
      this.isEnabled = false;
      if (this.onStateChange) this.onStateChange(false);
      return false;
    }
  }

  /**
   * Smoothly fades master volume down to 0
   */
  disableAudio() {
    this.isEnabled = false;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(Math.max(this.masterGain.gain.value, 0.0001), now);
      this.masterGain.gain.setTargetAtTime(0.00001, now, 0.08);

      setTimeout(() => {
        if (!this.isEnabled && this.masterGain && this.ctx) {
          this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        }
      }, 250);
    }

    if (this.onStateChange) this.onStateChange(false);
    return false;
  }

  /**
   * Constructs the complete procedural Web Audio graph
   */
  setupAudioGraph() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // 1. Master Output Gain
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.connect(ctx.destination);

    // 2. Procedural Noise Buffers (brownian, pink, and white noise for textures)
    const brownNoiseBuffer = this.createBrownianNoiseBuffer(ctx, 4);
    const pinkNoiseBuffer = this.createPinkNoiseBuffer(ctx, 4);

    // 3. Central Cosmic Background Drone
    this.setupCosmicDrone();

    // 4. Procedural Planetary Plasma Wave & Radio Synthesizers
    this.setupSunSynthesizer(brownNoiseBuffer);
    this.setupJupiterSynthesizer();
    this.setupSaturnSynthesizer(pinkNoiseBuffer);
    this.setupEarthSynthesizer(pinkNoiseBuffer);
    this.setupMarsSynthesizer(pinkNoiseBuffer);
  }

  /**
   * Central Cosmic Background Drone
   * Multi-oscillator sub-bass drone (sub-harmonic frequencies ~55Hz, 110Hz, 165Hz with subtle detune)
   * Slow periodic LFO modulating a low-pass BiquadFilterNode (cutoff sweeping between 120Hz and 400Hz over 15-20 seconds)
   */
  setupCosmicDrone() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    this.droneGain = ctx.createGain();
    this.droneGain.gain.setValueAtTime(this.baseDroneGain, now);
    this.droneGain.connect(this.masterGain);

    // Dynamic Low-Pass Filter
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(260, now); // Center frequency
    droneFilter.Q.setValueAtTime(2.8, now);
    droneFilter.connect(this.droneGain);

    // Filter LFO: Sweeps cutoff between 120Hz and 400Hz over ~18 seconds (period = 18s -> freq = 0.055Hz)
    const droneLfo = ctx.createOscillator();
    droneLfo.type = 'sine';
    droneLfo.frequency.setValueAtTime(1 / 18, now);

    const droneLfoGain = ctx.createGain();
    droneLfoGain.gain.setValueAtTime(140, now); // Sweeps 260 - 140 = 120Hz to 260 + 140 = 400Hz
    droneLfo.connect(droneLfoGain);
    droneLfoGain.connect(droneFilter.frequency);
    droneLfo.start(now);
    this.activeNodes.push(droneLfo, droneLfoGain);

    // Multi-oscillator sub-bass cluster:
    // Sub-harmonic frequencies around 55Hz, 110Hz, 165Hz with subtle detunes
    const oscConfigs = [
      { freq: 55.0, type: 'sine', detune: -4, gain: 0.32 },
      { freq: 55.4, type: 'sine', detune: +2, gain: 0.28 }, // Subtle binaural beat
      { freq: 110.0, type: 'triangle', detune: +3, gain: 0.22 }, // Warm overtone
      { freq: 165.0, type: 'sine', detune: -2, gain: 0.14 } // Harmonic fifth
    ];

    oscConfigs.forEach(cfg => {
      const osc = ctx.createOscillator();
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.freq, now);
      osc.detune.setValueAtTime(cfg.detune, now);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(cfg.gain, now);

      osc.connect(oscGain);
      oscGain.connect(droneFilter);
      osc.start(now);
      this.activeNodes.push(osc, oscGain);
    });
  }

  /**
   * Sun: Solar acoustic oscillations / roaring thermonuclear rumble
   * Filtered brownian noise oscillator + resonant low-frequency sub-rumble
   */
  setupSunSynthesizer(brownNoiseBuffer) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const sunGain = ctx.createGain();
    sunGain.gain.setValueAtTime(0, now);
    sunGain.connect(this.masterGain);
    this.planetGains.sun = sunGain;

    // Looped brownian noise buffer
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = brownNoiseBuffer;
    noiseSource.loop = true;

    // Deep resonant low-pass filter (cutoff ~70Hz with resonant peak)
    const sunFilter = ctx.createBiquadFilter();
    sunFilter.type = 'lowpass';
    sunFilter.frequency.setValueAtTime(70, now);
    sunFilter.Q.setValueAtTime(3.8, now);

    // Slow convection LFO modulating filter cutoff between 45Hz and 95Hz
    const sunLfo = ctx.createOscillator();
    sunLfo.type = 'sine';
    sunLfo.frequency.setValueAtTime(0.2, now); // ~5 second cycle
    const sunLfoGain = ctx.createGain();
    sunLfoGain.gain.setValueAtTime(25, now);
    sunLfo.connect(sunLfoGain);
    sunLfoGain.connect(sunFilter.frequency);
    sunLfo.start(now);
    this.activeNodes.push(sunLfo, sunLfoGain);

    noiseSource.connect(sunFilter);
    sunFilter.connect(sunGain);
    noiseSource.start(now);
    this.activeNodes.push(noiseSource);

    // Deep sub-bass thermonuclear core oscillation (38Hz)
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(38, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.35, now);
    subOsc.connect(subGain);
    subGain.connect(sunGain);
    subOsc.start(now);
    this.activeNodes.push(subOsc, subGain);
  }

  /**
   * Jupiter: Jovian decametric radio whistlers and magnetic chorus
   * Slight frequency sweeping tones between 400Hz and 1100Hz with subtle FM modulation
   */
  setupJupiterSynthesizer() {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const jupGain = ctx.createGain();
    jupGain.gain.setValueAtTime(0, now);
    jupGain.connect(this.masterGain);
    this.planetGains.jupiter = jupGain;

    // Carrier Oscillator 1 (Primary Whistler Tone)
    const carrier1 = ctx.createOscillator();
    carrier1.type = 'sine';
    carrier1.frequency.setValueAtTime(750, now);

    // Sweep LFO: Sweeps carrier between ~400Hz and ~1100Hz (750 +/- 350Hz)
    const sweepLfo1 = ctx.createOscillator();
    sweepLfo1.type = 'sine';
    sweepLfo1.frequency.setValueAtTime(0.14, now); // ~7.1s sweep cycle
    const sweepLfoGain1 = ctx.createGain();
    sweepLfoGain1.gain.setValueAtTime(350, now);
    sweepLfo1.connect(sweepLfoGain1);
    sweepLfoGain1.connect(carrier1.frequency);
    sweepLfo1.start(now);
    this.activeNodes.push(sweepLfo1, sweepLfoGain1);

    // Fast Chorus FM Modulation (Magnetic Chorus Wave flutter)
    const chorusMod = ctx.createOscillator();
    chorusMod.type = 'sine';
    chorusMod.frequency.setValueAtTime(14.5, now); // Chorus flutter
    const chorusModGain = ctx.createGain();
    chorusModGain.gain.setValueAtTime(28, now);
    chorusMod.connect(chorusModGain);
    chorusModGain.connect(carrier1.frequency);
    chorusMod.start(now);
    this.activeNodes.push(chorusMod, chorusModGain);

    // Secondary Harmonics Whistler (Triangle wave)
    const carrier2 = ctx.createOscillator();
    carrier2.type = 'triangle';
    carrier2.frequency.setValueAtTime(560, now);

    const sweepLfo2 = ctx.createOscillator();
    sweepLfo2.type = 'sine';
    sweepLfo2.frequency.setValueAtTime(0.21, now);
    const sweepLfoGain2 = ctx.createGain();
    sweepLfoGain2.gain.setValueAtTime(220, now);
    sweepLfo2.connect(sweepLfoGain2);
    sweepLfoGain2.connect(carrier2.frequency);
    sweepLfo2.start(now);
    this.activeNodes.push(sweepLfo2, sweepLfoGain2);

    // Resonant Bandpass Filter shaping the Jovian ionospheric whistler spectrum
    const jupFilter = ctx.createBiquadFilter();
    jupFilter.type = 'bandpass';
    jupFilter.frequency.setValueAtTime(750, now);
    jupFilter.Q.setValueAtTime(2.4, now);

    // Tremolo chorus pulse
    const tremolo = ctx.createOscillator();
    tremolo.type = 'sine';
    tremolo.frequency.setValueAtTime(3.2, now);
    const tremoloGain = ctx.createGain();
    tremoloGain.gain.setValueAtTime(0.2, now);
    const jupVoiceGain = ctx.createGain();
    jupVoiceGain.gain.setValueAtTime(0.45, now);
    tremolo.connect(tremoloGain);
    tremoloGain.connect(jupVoiceGain.gain);
    tremolo.start(now);
    this.activeNodes.push(tremolo, tremoloGain, jupVoiceGain);

    carrier1.connect(jupFilter);
    carrier2.connect(jupFilter);
    jupFilter.connect(jupVoiceGain);
    jupVoiceGain.connect(jupGain);

    carrier1.start(now);
    carrier2.start(now);
    this.activeNodes.push(carrier1, carrier2);
  }

  /**
   * Saturn: Saturn Kilometric Radiation (SKR) eerie high-harmonic ethereal whistle & ring noise
   * Dual detuned high-harmonic sirens drifting slowly, accompanied by highpass micrometeorite ring hiss
   */
  setupSaturnSynthesizer(pinkNoiseBuffer) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const satGain = ctx.createGain();
    satGain.gain.setValueAtTime(0, now);
    satGain.connect(this.masterGain);
    this.planetGains.saturn = satGain;

    // Dual high-harmonic ethereal sine whistles with subtle 7Hz beating
    const skr1 = ctx.createOscillator();
    skr1.type = 'sine';
    skr1.frequency.setValueAtTime(1180, now);

    const skr2 = ctx.createOscillator();
    skr2.type = 'sine';
    skr2.frequency.setValueAtTime(1187, now); // 7Hz eerie shimmering beat

    // Slow SKR Siren drift LFO (frequency sweeps 800Hz - 1600Hz)
    const skrLfo = ctx.createOscillator();
    skrLfo.type = 'sine';
    skrLfo.frequency.setValueAtTime(0.075, now); // ~13.3s period
    const skrLfoGain = ctx.createGain();
    skrLfoGain.gain.setValueAtTime(400, now);
    skrLfo.connect(skrLfoGain);
    skrLfoGain.connect(skr1.frequency);
    skrLfoGain.connect(skr2.frequency);
    skrLfo.start(now);
    this.activeNodes.push(skrLfo, skrLfoGain);

    const skrVoiceGain = ctx.createGain();
    skrVoiceGain.gain.setValueAtTime(0.3, now);
    skr1.connect(skrVoiceGain);
    skr2.connect(skrVoiceGain);
    skrVoiceGain.connect(satGain);
    skr1.start(now);
    skr2.start(now);
    this.activeNodes.push(skr1, skr2, skrVoiceGain);

    // Subtle Ring Particle Dust & Electrostatic Discharge Noise
    const ringNoise = ctx.createBufferSource();
    ringNoise.buffer = pinkNoiseBuffer;
    ringNoise.loop = true;

    const ringFilter = ctx.createBiquadFilter();
    ringFilter.type = 'highpass';
    ringFilter.frequency.setValueAtTime(2400, now);
    ringFilter.Q.setValueAtTime(1.5, now);

    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0.14, now);

    ringNoise.connect(ringFilter);
    ringFilter.connect(ringGain);
    ringGain.connect(satGain);
    ringNoise.start(now);
    this.activeNodes.push(ringNoise, ringFilter, ringGain);
  }

  /**
   * Earth: Terrestrial auroral kilometric radiation and subtle magnetic field harmonics
   * Schumann/geomagnetic field harmonics (156Hz, 312Hz) + ionospheric auroral chorus whistlers
   */
  setupEarthSynthesizer(pinkNoiseBuffer) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const earthGain = ctx.createGain();
    earthGain.gain.setValueAtTime(0, now);
    earthGain.connect(this.masterGain);
    this.planetGains.earth = earthGain;

    // Harmonic geomagnetic field tones
    const magHarmonics = [
      { freq: 156.0, gain: 0.28 },
      { freq: 312.0, gain: 0.16 }
    ];

    magHarmonics.forEach(h => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.freq, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(h.gain, now);

      osc.connect(g);
      g.connect(earthGain);
      osc.start(now);
      this.activeNodes.push(osc, g);
    });

    // Auroral Kilometric Radiation (AKR) / Ionospheric Chorus
    const akrNoise = ctx.createBufferSource();
    akrNoise.buffer = pinkNoiseBuffer;
    akrNoise.loop = true;

    const akrFilter = ctx.createBiquadFilter();
    akrFilter.type = 'bandpass';
    akrFilter.frequency.setValueAtTime(880, now);
    akrFilter.Q.setValueAtTime(4.2, now);

    // Chorus sweep LFO
    const akrLfo = ctx.createOscillator();
    akrLfo.type = 'sine';
    akrLfo.frequency.setValueAtTime(0.24, now);
    const akrLfoGain = ctx.createGain();
    akrLfoGain.gain.setValueAtTime(240, now);
    akrLfo.connect(akrLfoGain);
    akrLfoGain.connect(akrFilter.frequency);
    akrLfo.start(now);
    this.activeNodes.push(akrLfo, akrLfoGain);

    const akrGain = ctx.createGain();
    akrGain.gain.setValueAtTime(0.22, now);

    akrNoise.connect(akrFilter);
    akrFilter.connect(akrGain);
    akrGain.connect(earthGain);
    akrNoise.start(now);
    this.activeNodes.push(akrNoise, akrFilter, akrGain);
  }

  /**
   * Mars: Faint dusty Martian wind breeze (InSight & Perseverance acoustic profile)
   * Resonant bandpass pink noise modulated by gentle slow gust LFOs
   */
  setupMarsSynthesizer(pinkNoiseBuffer) {
    const ctx = this.ctx;
    const now = ctx.currentTime;

    const marsGain = ctx.createGain();
    marsGain.gain.setValueAtTime(0, now);
    marsGain.connect(this.masterGain);
    this.planetGains.mars = marsGain;

    // Looped pink noise
    const windNoise = ctx.createBufferSource();
    windNoise.buffer = pinkNoiseBuffer;
    windNoise.loop = true;

    // Resonant bandpass filter tuned to Martian atmospheric thin pressure acoustic spectrum
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(230, now);
    windFilter.Q.setValueAtTime(1.9, now);

    // Wind gust frequency sweep LFO
    const gustLfo = ctx.createOscillator();
    gustLfo.type = 'sine';
    gustLfo.frequency.setValueAtTime(0.10, now); // ~10s gust cycle
    const gustLfoGain = ctx.createGain();
    gustLfoGain.gain.setValueAtTime(75, now); // Sweeps 155Hz to 305Hz
    gustLfo.connect(gustLfoGain);
    gustLfoGain.connect(windFilter.frequency);
    gustLfo.start(now);
    this.activeNodes.push(gustLfo, gustLfoGain);

    // Amplitude breathing gust LFO (modulating wind volume)
    const ampLfo = ctx.createOscillator();
    ampLfo.type = 'sine';
    ampLfo.frequency.setValueAtTime(0.065, now);
    const ampLfoGain = ctx.createGain();
    ampLfoGain.gain.setValueAtTime(0.12, now);
    const windSubGain = ctx.createGain();
    windSubGain.gain.setValueAtTime(0.32, now);

    ampLfo.connect(ampLfoGain);
    ampLfoGain.connect(windSubGain.gain);
    ampLfo.start(now);
    this.activeNodes.push(ampLfo, ampLfoGain, windSubGain);

    windNoise.connect(windFilter);
    windFilter.connect(windSubGain);
    windSubGain.connect(marsGain);
    windNoise.start(now);
    this.activeNodes.push(windNoise, windFilter);
  }

  /**
   * Generates a smooth seamless brownian (1/f^2) noise AudioBuffer
   */
  createBrownianNoiseBuffer(ctx, duration = 4) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  /**
   * Generates a smooth seamless pink (1/f) noise AudioBuffer via Voss-McCartney filter
   */
  createPinkNoiseBuffer(ctx, duration = 4) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  /**
   * Main audio frame update called from SimulationEngine.update()
   * Smoothly cross-fades planetary plasma characteristics based on focused body or camera distance to each planet.
   * When zoomed out to the entire solar system, the deep cosmic drone dominates;
   * when orbiting Jupiter, Jupiter's eerie magnetospheric chorus swells up!
   */
  update(cameraPosition, selectedBodyId, bodies, scaleMode = 'exploration', moons = {}) {
    if (!this.isEnabled || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const isTrueScale = scaleMode === 'trueScale';

    // Resolve moon selection to parent planet
    const targetBodyId = MOON_PARENT_MAP[selectedBodyId] || selectedBodyId;

    // Track highest proximity factor among planets to duck cosmic drone
    let maxPlanetFactor = 0;

    const planets = ['sun', 'jupiter', 'saturn', 'earth', 'mars'];

    for (const key of planets) {
      const gainNode = this.planetGains[key];
      if (!gainNode) continue;

      let worldPos = null;
      if (key === 'sun') {
        worldPos = { x: 0, y: 0, z: 0 };
      } else if (bodies && bodies[key] && bodies[key].group) {
        worldPos = bodies[key].group.position;
      }

      let distFactor = 0;

      if (worldPos && cameraPosition) {
        const dx = cameraPosition.x - worldPos.x;
        const dy = cameraPosition.y - worldPos.y;
        const dz = cameraPosition.z - worldPos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Proximity radius thresholds
        const innerRadius = (isTrueScale ? 80 : 20) * (key === 'sun' || key === 'jupiter' ? 1.5 : 1.0);
        const outerRadius = (isTrueScale ? 450 : 85) * (key === 'sun' || key === 'jupiter' ? 1.4 : 1.0);

        if (dist <= innerRadius) {
          distFactor = 1.0;
        } else if (dist < outerRadius) {
          const ratio = 1.0 - (dist - innerRadius) / (outerRadius - innerRadius);
          distFactor = Math.sin(ratio * Math.PI * 0.5); // Smooth sinusoidal ease
        }
      }

      // Explicit selection boost
      if (targetBodyId === key) {
        distFactor = Math.max(distFactor, 0.95);
      }

      this.currentPlanetWeights[key] = distFactor;
      if (distFactor > maxPlanetFactor) {
        maxPlanetFactor = distFactor;
      }

      // Smoothly crossfade individual planet plasma synthesizer gain
      const maxGain = PLANET_MAX_GAINS[key] || 0.45;
      const targetGain = distFactor * maxGain;
      gainNode.gain.setTargetAtTime(targetGain, now, 0.12);
    }

    // Dynamic Cosmic Drone Ducking:
    // When deep in interplanetary space, the deep cosmic drone dominates (up to 0.62).
    // When orbiting close to a planet, the drone ducks down to ~0.24 to give space for plasma waves.
    if (this.droneGain) {
      const targetDroneGain = this.baseDroneGain * (1.0 - maxPlanetFactor * 0.62);
      this.droneGain.gain.setTargetAtTime(targetDroneGain, now, 0.15);
    }
  }

  /**
   * Cleanup and resource disposal
   */
  dispose() {
    this.disableAudio();
    this.activeNodes.forEach(node => {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (e) {
        // Ignore already disconnected nodes
      }
    });
    this.activeNodes = [];

    if (this.ctx && typeof this.ctx.close === 'function') {
      try {
        this.ctx.close();
      } catch (e) {
        // Ignore close errors
      }
      this.ctx = null;
    }
  }
}
