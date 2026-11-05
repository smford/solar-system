/**
 * HELIOS Orbital Physics Engine
 * Computes Keplerian trajectories, epoch progression, scale interpolation, and coordinate transforms.
 */

export class PhysicsEngine {
  constructor(bodiesConfig) {
    this.bodies = bodiesConfig;
    // Epoch begins at reference date
    this.referenceDate = new Date('2026-01-01T00:00:00Z');
    this.elapsedDays = 0;
    this.elapsedVisualSeconds = 0;
    this.isPaused = false;
    this.warpMultiplier = 1.0;
    this.scaleMode = 'exploration'; // 'exploration' | 'trueScale'
    this.scaleInterpolation = 0.0; // 0 = exploration, 1 = trueScale
    this.targetInterpolation = 0.0;

    // Initial phase angles for realistic staggered distribution across orbits
    this.initialAngles = {
      mercury: 0.5,
      venus: 2.1,
      earth: 4.2,
      mars: 1.1,
      jupiter: 5.7,
      saturn: 3.4,
      uranus: 0.9,
      neptune: 2.8
    };
  }

  setWarpMultiplier(multiplier) {
    this.warpMultiplier = multiplier;
    if (multiplier === 0) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  setScaleMode(mode) {
    this.scaleMode = mode;
    this.targetInterpolation = mode === 'trueScale' ? 1.0 : 0.0;
  }

  getEffectiveScaleInterpolation() {
    return this.scaleInterpolation;
  }

  update(deltaSeconds, baseDaysPerSecond) {
    // Smooth lerp of scale mode interpolation
    const lerpSpeed = 3.5;
    this.scaleInterpolation += (this.targetInterpolation - this.scaleInterpolation) * Math.min(deltaSeconds * lerpSpeed, 1.0);

    if (!this.isPaused) {
      // Orbital progression in Earth days
      this.elapsedDays += deltaSeconds * baseDaysPerSecond * this.warpMultiplier;
      // Axial rotation progression in visual seconds
      this.elapsedVisualSeconds += deltaSeconds * this.warpMultiplier;
    }
  }

  getSimulatedDate() {
    const timeMs = this.referenceDate.getTime() + this.elapsedDays * 86400000;
    return new Date(timeMs);
  }

  /**
   * Set simulation epoch to a specific date
   */
  setDate(date) {
    let targetMs;
    if (date instanceof Date) {
      targetMs = date.getTime();
    } else if (typeof date === 'string') {
      const parts = date.split('-');
      if (parts.length === 3) {
        // Parse UTC YYYY-MM-DD
        targetMs = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        targetMs = new Date(date).getTime();
      }
    } else {
      targetMs = Number(date);
    }

    if (isNaN(targetMs)) return;
    this.elapsedDays = (targetMs - this.referenceDate.getTime()) / 86400000;
  }

  /**
   * Jump simulation epoch to real-world current date/time
   */
  setCurrentDate() {
    this.setDate(new Date());
  }

  /**
   * Get body distance and radius smoothly blended between exploration and true scale
   */
  getBodyDimensions(bodyId) {
    const config = this.bodies[bodyId];
    if (!config) return { radius: 1, distance: 0 };

    const t = this.scaleInterpolation;
    const expRadius = config.exploration.radius;
    const trueRadius = config.trueScale.radius;
    const radius = expRadius * (1 - t) + trueRadius * t;

    const expDist = config.exploration.orbitDistance;
    const trueDist = config.trueScale.orbitDistance;
    const distance = expDist * (1 - t) + trueDist * t;

    return { radius, distance };
  }

  /**
   * Calculate 3D orbital position at current epoch (Keplerian orbit)
   */
  calculatePosition(bodyId) {
    const config = this.bodies[bodyId];
    if (!config || bodyId === 'sun') {
      return { x: 0, y: 0, z: 0 };
    }

    const { distance } = this.getBodyDimensions(bodyId);
    const period = config.exploration.orbitPeriod; // in Earth days
    const eccentricity = config.eccentricity || 0;

    // Angular velocity (radians/day)
    const angularSpeed = (2 * Math.PI) / period;
    const initial = this.initialAngles[bodyId] || 0;
    const currentAngle = initial + angularSpeed * this.elapsedDays;

    // Keplerian elliptical semi-minor axis
    const a = distance;
    const b = a * Math.sqrt(Math.max(0.001, 1 - eccentricity * eccentricity));

    // Focus offset for eccentricity
    const c = a * eccentricity;

    const x = a * Math.cos(currentAngle) - c;
    const z = b * Math.sin(currentAngle);

    return { x, y: 0, z };
  }

  /**
   * Get moon dimensions (radius and orbit distance) blended between exploration and true scale
   */
  getMoonDimensions(moonConfig) {
    if (!moonConfig) return { radius: 0.5, distance: 5 };

    const t = this.scaleInterpolation;
    const expRadius = moonConfig.exploration ? moonConfig.exploration.radius : (moonConfig.radiusMultiplier ? 3.6 * moonConfig.radiusMultiplier : (moonConfig.radius || 0.5));
    const trueRadius = moonConfig.trueScale ? moonConfig.trueScale.radius : (moonConfig.radiusMultiplier ? 1.0 * moonConfig.radiusMultiplier : (moonConfig.radius || 0.2));
    const radius = expRadius * (1 - t) + trueRadius * t;

    const expDist = moonConfig.exploration ? moonConfig.exploration.orbitDistance : moonConfig.orbitDistance;
    const trueDist = moonConfig.trueScale ? moonConfig.trueScale.orbitDistance : (moonConfig.orbitDistance * 0.6);
    const distance = expDist * (1 - t) + trueDist * t;

    return { radius, distance };
  }

  /**
   * Calculate Moon position relative to its host planet
   */
  calculateMoonPosition(parentPos, moonConfig) {
    if (!moonConfig) return parentPos || { x: 0, y: 0, z: 0 };

    const { distance } = this.getMoonDimensions(moonConfig);
    const moonPeriod = moonConfig.orbitPeriod || 27.32;
    const angularSpeed = (2 * Math.PI) / moonPeriod;
    const initial = moonConfig.initialAngle || 0;
    const angle = initial + angularSpeed * this.elapsedDays;

    const inclination = moonConfig.inclination || 0;
    const incRad = (inclination * Math.PI) / 180;

    const xOrb = distance * Math.cos(angle);
    let yOrb, zOrb;

    if (moonConfig.inclination !== undefined) {
      yOrb = distance * Math.sin(angle) * Math.sin(incRad);
      zOrb = distance * Math.sin(angle) * Math.cos(incRad);
    } else {
      yOrb = 0.2 * Math.sin(angle * 0.8);
      zOrb = distance * Math.sin(angle);
    }

    const px = parentPos ? parentPos.x : 0;
    const py = parentPos ? parentPos.y : 0;
    const pz = parentPos ? parentPos.z : 0;

    return {
      x: px + xOrb,
      y: py + yOrb,
      z: pz + zOrb
    };
  }

  /**
   * Generate vector orbit points for a moon around its parent origin
   */
  generateMoonOrbitPath(moonConfig, segments = 96) {
    const { distance } = this.getMoonDimensions(moonConfig);
    const inclination = moonConfig.inclination || 0;
    const incRad = (inclination * Math.PI) / 180;

    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = distance * Math.cos(theta);
      let y, z;
      if (moonConfig.inclination !== undefined) {
        y = distance * Math.sin(theta) * Math.sin(incRad);
        z = distance * Math.sin(theta) * Math.cos(incRad);
      } else {
        y = 0.2 * Math.sin(theta * 0.8);
        z = distance * Math.sin(theta);
      }
      points.push({ x, y, z });
    }
    return points;
  }

  /**
   * Calculate synchronous rotation angle for tidally locked natural satellites
   */
  calculateMoonAxialRotation(moonConfig) {
    const period = moonConfig.rotationPeriod || moonConfig.orbitPeriod || 27.32;
    const sign = Math.sign(period) || 1;
    const absPeriod = Math.abs(period);
    const visualSec = sign * Math.max(8.0, Math.min(60.0, absPeriod * 3.5));
    const angularVelocity = (2 * Math.PI) / visualSec;
    return angularVelocity * this.elapsedVisualSeconds;
  }

  /**
   * Calculate axial rotation angle for planetary mesh
   * Calibrated so Earth rotates once every 24 seconds at 1x speed,
   * with all other planets matching their exact relative sidereal rotation ratios.
   */
  calculateAxialRotation(bodyId) {
    const config = this.bodies[bodyId];
    if (!config) return 0;

    const hours = config.rotationHours || 24.0;
    const sign = Math.sign(hours);
    const absHours = Math.abs(hours);

    // Visual rotation period in seconds:
    // Earth (24h) takes 24.0s
    // Jupiter (9.92h) takes 9.92s
    // Saturn (10.66h) takes 10.66s
    // Mars (24.62h) takes 24.62s
    // Uranus (-17.24h) takes -17.24s (retrograde)
    // Neptune (16.11h) takes 16.11s
    // Ultra-slow rotators (Mercury, Venus, Sun) are clamped smoothly to 60-90s for comfortable observation
    const visualSecondsPerRev = sign * Math.max(9.0, Math.min(90.0, absHours));
    const angularVelocity = (2 * Math.PI) / visualSecondsPerRev;

    return angularVelocity * this.elapsedVisualSeconds;
  }

  /**
   * Generate vector orbit points for Line geometry
   */
  generateOrbitPath(bodyId, segments = 256) {
    const config = this.bodies[bodyId];
    if (!config || bodyId === 'sun') return [];

    const { distance } = this.getBodyDimensions(bodyId);
    const eccentricity = config.eccentricity || 0;
    const a = distance;
    const b = a * Math.sqrt(Math.max(0.001, 1 - eccentricity * eccentricity));
    const c = a * eccentricity;

    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = a * Math.cos(theta) - c;
      const z = b * Math.sin(theta);
      points.push({ x, y: 0, z });
    }
    return points;
  }
}
