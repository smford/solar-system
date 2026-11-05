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
      this.elapsedDays += deltaSeconds * baseDaysPerSecond * this.warpMultiplier;
    }
  }

  getSimulatedDate() {
    const timeMs = this.referenceDate.getTime() + this.elapsedDays * 86400000;
    return new Date(timeMs);
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
   * Calculate 3D orbital position at current epoch
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
   * Calculate Moon position relative to Earth
   */
  calculateMoonPosition(earthPos, moonConfig) {
    const moonPeriod = moonConfig.orbitPeriod; // 27.32 days
    const angularSpeed = (2 * Math.PI) / moonPeriod;
    const angle = angularSpeed * this.elapsedDays;
    
    // Scale moon orbit distance slightly in trueScale to keep it visible
    const t = this.scaleInterpolation;
    const moonDist = moonConfig.orbitDistance * (1 - t * 0.4);

    return {
      x: earthPos.x + moonDist * Math.cos(angle),
      y: 0.2 * Math.sin(angle * 0.8), // slight inclination
      z: earthPos.z + moonDist * Math.sin(angle)
    };
  }

  /**
   * Calculate axial rotation angle for planetary mesh
   */
  calculateAxialRotation(bodyId) {
    const config = this.bodies[bodyId];
    if (!config) return 0;
    const rotPeriod = config.exploration.rotationPeriod || 1.0;
    const rotSpeed = (2 * Math.PI) / rotPeriod;
    return rotSpeed * this.elapsedDays;
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
