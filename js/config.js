/**
 * HELIOS Planetary Configuration & Astronomical Metadata
 * Accurate physical and telemetry constants for 3D Solar System simulation.
 */

export const CELESTIAL_BODIES = {
  sun: {
    id: 'sun',
    name: 'Sun',
    type: 'Yellow Dwarf (G2V)',
    color: '#ffaa33',
    emissive: '#ff7700',
    rotationHours: 648.0, // 27 Earth days
    // Exploration scale parameters
    exploration: {
      radius: 8.5,
      orbitDistance: 0,
      rotationPeriod: 27.0 // Earth days
    },
    // True relative astronomical scale
    trueScale: {
      radius: 8.5,
      orbitDistance: 0,
      rotationPeriod: 27.0
    },
    axialTilt: 7.25, // degrees
    telemetry: {
      diameter: '1,392,700 km',
      relativeSize: '109.2 × Earth',
      mass: '1.989 × 10³⁰ kg (333,000 Earths)',
      surfaceTemp: '5,505 °C (5,778 K)',
      coreTemp: '15,000,000 °C',
      surfaceGravity: '274.0 m/s² (27.9 g)',
      distanceFromSun: '0 km (Center)',
      orbitalPeriod: 'N/A (Solar Barycenter)',
      rotationPeriod: '27.0 Earth days',
      composition: '73.4% H, 25.0% He, 1.6% C/N/O/Fe',
      classification: 'G-type Main-Sequence Star'
    }
  },

  mercury: {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    color: '#cbd5e1',
    rotationHours: 1407.6, // 58.65 Earth days
    exploration: {
      radius: 2.0,
      orbitDistance: 30,
      orbitPeriod: 87.97, // Earth days
      rotationPeriod: 58.65
    },
    trueScale: {
      radius: 0.38,
      orbitDistance: 46.4, // 0.387 AU * 120
      orbitPeriod: 87.97,
      rotationPeriod: 58.65
    },
    eccentricity: 0.2056,
    axialTilt: 0.034,
    orbitColor: '#cbd5e1',
    telemetry: {
      diameter: '4,879 km',
      relativeSize: '0.383 × Earth',
      mass: '3.301 × 10²³ kg (0.055 Earths)',
      surfaceTemp: '-180 °C to 430 °C',
      surfaceGravity: '3.70 m/s² (0.38 g)',
      distanceFromSun: '57.9 million km (0.387 AU)',
      orbitalPeriod: '87.97 days',
      rotationPeriod: '58.65 days',
      moons: '0',
      classification: 'Silicate terrestrial planet'
    }
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet',
    color: '#fde047',
    rotationHours: -5832.5, // -243 days, retrograde rotation
    exploration: {
      radius: 3.2,
      orbitDistance: 46,
      orbitPeriod: 224.7,
      rotationPeriod: -243.02
    },
    trueScale: {
      radius: 0.95,
      orbitDistance: 86.8, // 0.723 AU * 120
      orbitPeriod: 224.7,
      rotationPeriod: -243.02
    },
    eccentricity: 0.0067,
    axialTilt: 177.36,
    orbitColor: '#fde047',
    telemetry: {
      diameter: '12,104 km',
      relativeSize: '0.949 × Earth',
      mass: '4.867 × 10²⁴ kg (0.815 Earths)',
      surfaceTemp: '464 °C (Runaway greenhouse)',
      surfaceGravity: '8.87 m/s² (0.90 g)',
      distanceFromSun: '108.2 million km (0.723 AU)',
      orbitalPeriod: '224.70 days',
      rotationPeriod: '-243.02 days (Retrograde)',
      moons: '0',
      classification: 'Dense atmosphere greenhouse terrestrial'
    }
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial (Habitable)',
    color: '#60a5fa',
    rotationHours: 24.0, // 24 hours
    exploration: {
      radius: 3.6,
      orbitDistance: 66,
      orbitPeriod: 365.256,
      rotationPeriod: 1.0
    },
    trueScale: {
      radius: 1.0,
      orbitDistance: 120.0, // 1.0 AU * 120
      orbitPeriod: 365.256,
      rotationPeriod: 1.0
    },
    eccentricity: 0.0167,
    axialTilt: 23.44,
    orbitColor: '#60a5fa',
    hasClouds: true,
    hasMoon: true,
    moon: {
      name: 'Moon (Luna)',
      rotationHours: 655.7, // 27.32 days
      radiusMultiplier: 0.3,
      orbitDistance: 5.8,
      orbitPeriod: 27.32,
      rotationPeriod: 27.32,
      color: '#cbd5e1'
    },
    telemetry: {
      diameter: '12,742 km',
      relativeSize: '1.000 (Reference)',
      mass: '5.972 × 10²⁴ kg (1.00 Earth)',
      surfaceTemp: '15 °C (-89 °C to 57 °C)',
      surfaceGravity: '9.81 m/s² (1.00 g)',
      distanceFromSun: '149.6 million km (1.000 AU)',
      orbitalPeriod: '365.26 days (1.00 year)',
      rotationPeriod: '23h 56m 04s (1.00 day)',
      moons: '1 (Luna)',
      classification: 'Active hydrosphere & biosphere terrestrial'
    }
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet',
    color: '#fb923c',
    rotationHours: 24.62, // 24.62 hours
    exploration: {
      radius: 2.6,
      orbitDistance: 88,
      orbitPeriod: 686.98,
      rotationPeriod: 1.026
    },
    trueScale: {
      radius: 0.53,
      orbitDistance: 182.9, // 1.524 AU * 120
      orbitPeriod: 686.98,
      rotationPeriod: 1.026
    },
    eccentricity: 0.0934,
    axialTilt: 25.19,
    orbitColor: '#fb923c',
    telemetry: {
      diameter: '6,779 km',
      relativeSize: '0.532 × Earth',
      mass: '6.417 × 10²³ kg (0.107 Earths)',
      surfaceTemp: '-65 °C (-125 °C to 20 °C)',
      surfaceGravity: '3.72 m/s² (0.38 g)',
      distanceFromSun: '227.9 million km (1.524 AU)',
      orbitalPeriod: '686.98 days (1.88 years)',
      rotationPeriod: '24h 37m 22s',
      moons: '2 (Phobos, Deimos)',
      classification: 'Oxidized iron desert terrestrial'
    }
  },

  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant',
    color: '#fcd34d',
    rotationHours: 9.925, // 9.925 hours (Rapid rotation)
    exploration: {
      radius: 8.8,
      orbitDistance: 132,
      orbitPeriod: 4332.59, // 11.86 Earth years
      rotationPeriod: 0.414
    },
    trueScale: {
      radius: 3.5,
      orbitDistance: 624.0, // 5.20 AU * 120
      orbitPeriod: 4332.59,
      rotationPeriod: 0.414
    },
    eccentricity: 0.0484,
    axialTilt: 3.13,
    orbitColor: '#fcd34d',
    telemetry: {
      diameter: '139,820 km',
      relativeSize: '10.97 × Earth',
      mass: '1.898 × 10²⁷ kg (317.8 Earths)',
      surfaceTemp: '-110 °C (1 bar level)',
      surfaceGravity: '24.79 m/s² (2.53 g)',
      distanceFromSun: '778.6 million km (5.204 AU)',
      orbitalPeriod: '4,332.6 days (11.86 years)',
      rotationPeriod: '9h 55m 30s',
      moons: '95 confirmed (Io, Europa, Ganymede, Callisto)',
      classification: 'Jovian hydrogen-helium gas giant'
    }
  },

  saturn: {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant (Ring System)',
    color: '#fef08a',
    rotationHours: 10.656, // 10.656 hours
    exploration: {
      radius: 7.5,
      orbitDistance: 180,
      orbitPeriod: 10759.22, // 29.46 Earth years
      rotationPeriod: 0.444
    },
    trueScale: {
      radius: 3.0,
      orbitDistance: 1150.0, // 9.58 AU * 120
      orbitPeriod: 10759.22,
      rotationPeriod: 0.444
    },
    eccentricity: 0.0541,
    axialTilt: 26.73,
    hasRings: true,
    ringConfig: {
      innerRadiusMultiplier: 1.3,
      outerRadiusMultiplier: 2.4
    },
    orbitColor: '#fef08a',
    telemetry: {
      diameter: '116,460 km (Equatorial)',
      relativeSize: '9.14 × Earth',
      mass: '5.683 × 10²⁶ kg (95.2 Earths)',
      surfaceTemp: '-140 °C (1 bar level)',
      surfaceGravity: '10.44 m/s² (1.06 g)',
      distanceFromSun: '1,433.5 million km (9.582 AU)',
      orbitalPeriod: '10,759.2 days (29.46 years)',
      rotationPeriod: '10h 33m 38s',
      moons: '146 confirmed (Titan, Enceladus, Mimas)',
      classification: 'Prominent ring-system gas giant'
    }
  },

  uranus: {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant',
    color: '#6ee7b7',
    rotationHours: -17.24, // -17.24 hours (Retrograde, sideways tilt)
    exploration: {
      radius: 5.2,
      orbitDistance: 230,
      orbitPeriod: 30685.4, // 84.0 Earth years
      rotationPeriod: -0.718
    },
    trueScale: {
      radius: 1.8,
      orbitDistance: 2304.0, // 19.2 AU * 120
      orbitPeriod: 30685.4,
      rotationPeriod: -0.718
    },
    eccentricity: 0.0472,
    axialTilt: 97.77, // Extreme sideways tilt
    hasRings: true,
    ringConfig: {
      innerRadiusMultiplier: 1.35,
      outerRadiusMultiplier: 1.75,
      subtle: true
    },
    orbitColor: '#6ee7b7',
    telemetry: {
      diameter: '50,724 km',
      relativeSize: '3.98 × Earth',
      mass: '8.681 × 10²⁵ kg (14.5 Earths)',
      surfaceTemp: '-195 °C (Coldest atmosphere: -224 °C)',
      surfaceGravity: '8.69 m/s² (0.89 g)',
      distanceFromSun: '2,872.5 million km (19.20 AU)',
      orbitalPeriod: '30,685.4 days (84.01 years)',
      rotationPeriod: '-17h 14m 24s (Sideways tilt)',
      moons: '28 confirmed (Titania, Oberon, Miranda)',
      classification: 'Methane-rich ice giant'
    }
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant',
    color: '#93c5fd',
    rotationHours: 16.11, // 16.11 hours
    exploration: {
      radius: 5.0,
      orbitDistance: 280,
      orbitPeriod: 60189.0, // 164.8 Earth years
      rotationPeriod: 0.671
    },
    trueScale: {
      radius: 1.75,
      orbitDistance: 3612.0, // 30.1 AU * 120
      orbitPeriod: 60189.0,
      rotationPeriod: 0.671
    },
    eccentricity: 0.0086,
    axialTilt: 28.32,
    orbitColor: '#93c5fd',
    telemetry: {
      diameter: '49,244 km',
      relativeSize: '3.86 × Earth',
      mass: '1.024 × 10²⁶ kg (17.1 Earths)',
      surfaceTemp: '-200 °C (Extremely high wind speeds: 2,100 km/h)',
      surfaceGravity: '11.15 m/s² (1.14 g)',
      distanceFromSun: '4,495.1 million km (30.07 AU)',
      orbitalPeriod: '60,189 days (164.79 years)',
      rotationPeriod: '16h 06m 36s',
      moons: '16 confirmed (Triton retrograde capture)',
      classification: 'Active dynamic weather ice giant'
    }
  }
};

export const TIME_PRESETS = [
  { label: 'Pause', value: 0 },
  { label: '0.25x', value: 0.25 },
  { label: '0.5x', value: 0.5 },
  { label: '1x (Normal)', value: 1.0 },
  { label: '2x', value: 2.0 },
  { label: '5x', value: 5.0 },
  { label: '10x', value: 10.0 },
  { label: '20x', value: 20.0 }
];

export const APP_CONFIG = {
  defaultScaleMode: 'exploration',
  baseTimeScaleDaysPerSecond: 2.5, // 2.5 Earth days pass per real-time second at 1x multiplier
  starfieldCount: 4500,
  defaultCameraPos: { x: 0, y: 440, z: 530 },
  defaultCameraTarget: { x: 0, y: 0, z: 0 }
};
