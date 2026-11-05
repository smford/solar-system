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
    atmosphere: {
      color: [0.98, 0.75, 0.14],
      power: 2.2,
      intensity: 1.3,
      scale: 1.035
    },
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
    atmosphere: {
      color: [0.22, 0.74, 0.97],
      power: 3.2,
      intensity: 1.1,
      scale: 1.028
    },
    hasClouds: true,
    hasMoon: true,
    moon: {
      id: 'moon',
      name: 'Moon (Luna)',
      parentId: 'earth',
      rotationHours: 655.7, // 27.32 days
      radiusMultiplier: 0.3,
      orbitDistance: 5.8,
      orbitPeriod: 27.32,
      rotationPeriod: 27.32,
      color: '#cbd5e1'
    },
    hasMoons: true,
    moons: [
      {
        id: 'moon',
        name: 'Moon (Luna)',
        parentId: 'earth',
        color: '#cbd5e1',
        orbitPeriod: 27.32,
        rotationHours: 655.7,
        rotationPeriod: 27.32,
        inclination: 5.14,
        initialAngle: 0.8,
        exploration: {
          radius: 1.08,
          orbitDistance: 6.8
        },
        trueScale: {
          radius: 0.27,
          orbitDistance: 3.6
        },
        orbitDistance: 6.8,
        description: "Earth's only natural satellite, tidally locked with ancient cratered highlands and basaltic lunar maria.",
        telemetry: {
          diameter: '3,474 km',
          relativeSize: '0.272 × Earth',
          mass: '7.342 × 10²² kg (0.0123 Earths)',
          surfaceTemp: '-130 °C to 120 °C',
          surfaceGravity: '1.62 m/s² (0.165 g)',
          orbitalPeriod: '27.32 days',
          parentPlanet: 'Earth',
          classification: 'Major silicate natural satellite'
        }
      }
    ],
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
    atmosphere: {
      color: [0.98, 0.45, 0.09],
      power: 4.5,
      intensity: 0.55,
      scale: 1.018
    },
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
    hasMoons: true,
    moons: [
      {
        id: 'io',
        name: 'Io',
        parentId: 'jupiter',
        color: '#f59e0b',
        orbitPeriod: 1.77,
        rotationHours: 42.48,
        rotationPeriod: 1.77,
        inclination: 0.05,
        initialAngle: 0.5,
        exploration: {
          radius: 0.85,
          orbitDistance: 13.0
        },
        trueScale: {
          radius: 0.26,
          orbitDistance: 5.5
        },
        orbitDistance: 13.0,
        description: 'The most volcanically active body in the Solar System, with hundreds of sulfur-spewing volcanoes powered by Jovian tidal flexing.',
        telemetry: {
          diameter: '3,643 km',
          relativeSize: '0.286 × Earth',
          mass: '8.932 × 10²² kg',
          surfaceTemp: '-143 °C (Volcanic peaks: 1,300 °C)',
          surfaceGravity: '1.80 m/s² (0.183 g)',
          orbitalPeriod: '1.77 days',
          parentPlanet: 'Jupiter',
          classification: 'Galilean volcanic satellite'
        }
      },
      {
        id: 'europa',
        name: 'Europa',
        parentId: 'jupiter',
        color: '#bae6fd',
        orbitPeriod: 3.55,
        rotationHours: 85.2,
        rotationPeriod: 3.55,
        inclination: 0.47,
        initialAngle: 2.1,
        exploration: {
          radius: 0.78,
          orbitDistance: 16.5
        },
        trueScale: {
          radius: 0.23,
          orbitDistance: 7.2
        },
        orbitDistance: 16.5,
        description: 'Smooth, brilliant water-ice shell crisscrossed by dark fractures, concealing a global subsurface liquid ocean.',
        telemetry: {
          diameter: '3,122 km',
          relativeSize: '0.245 × Earth',
          mass: '4.800 × 10²² kg',
          surfaceTemp: '-160 °C (Cryogenic ice sheet)',
          surfaceGravity: '1.32 m/s² (0.134 g)',
          orbitalPeriod: '3.55 days',
          parentPlanet: 'Jupiter',
          classification: 'Galilean icy ocean satellite'
        }
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        parentId: 'jupiter',
        color: '#94a3b8',
        orbitPeriod: 7.15,
        rotationHours: 171.6,
        rotationPeriod: 7.15,
        inclination: 0.20,
        initialAngle: 3.8,
        exploration: {
          radius: 1.25,
          orbitDistance: 21.0
        },
        trueScale: {
          radius: 0.38,
          orbitDistance: 9.6
        },
        orbitDistance: 21.0,
        description: 'Largest natural satellite in the Solar System—larger than Mercury—and the only moon possessing an intrinsic magnetic dipole field.',
        telemetry: {
          diameter: '5,268 km',
          relativeSize: '0.413 × Earth (Largest moon)',
          mass: '1.482 × 10²³ kg',
          surfaceTemp: '-163 °C',
          surfaceGravity: '1.43 m/s² (0.146 g)',
          orbitalPeriod: '7.15 days',
          parentPlanet: 'Jupiter',
          classification: 'Galilean magnetic giant satellite'
        }
      },
      {
        id: 'callisto',
        name: 'Callisto',
        parentId: 'jupiter',
        color: '#64748b',
        orbitPeriod: 16.69,
        rotationHours: 400.56,
        rotationPeriod: 16.69,
        inclination: 0.28,
        initialAngle: 5.4,
        exploration: {
          radius: 1.15,
          orbitDistance: 26.5
        },
        trueScale: {
          radius: 0.35,
          orbitDistance: 12.8
        },
        orbitDistance: 26.5,
        description: 'Heavily cratered, ancient frozen surface with the highest impact crater density in the Solar System, showing almost no geologic activity.',
        telemetry: {
          diameter: '4,821 km',
          relativeSize: '0.378 × Earth',
          mass: '1.076 × 10²³ kg',
          surfaceTemp: '-139 °C',
          surfaceGravity: '1.24 m/s² (0.126 g)',
          orbitalPeriod: '16.69 days',
          parentPlanet: 'Jupiter',
          classification: 'Galilean ancient cratered satellite'
        }
      }
    ],
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
    hasMoons: true,
    moons: [
      {
        id: 'enceladus',
        name: 'Enceladus',
        parentId: 'saturn',
        color: '#f8fafc',
        orbitPeriod: 1.37,
        rotationHours: 32.88,
        rotationPeriod: 1.37,
        inclination: 0.01,
        initialAngle: 1.1,
        exploration: {
          radius: 0.52,
          orbitDistance: 21.0
        },
        trueScale: {
          radius: 0.15,
          orbitDistance: 8.5
        },
        orbitDistance: 21.0,
        description: "Dazzling ultra-reflective ice world whose active south polar cryovolcanoes spew water vapor and organics directly into Saturn's E ring.",
        telemetry: {
          diameter: '504 km',
          relativeSize: '0.040 × Earth',
          mass: '1.080 × 10²⁰ kg',
          surfaceTemp: '-198 °C (99% albedo reflection)',
          surfaceGravity: '0.11 m/s² (0.012 g)',
          orbitalPeriod: '1.37 days',
          parentPlanet: 'Saturn',
          classification: 'Saturnian cryovolcanic ice satellite'
        }
      },
      {
        id: 'titan',
        name: 'Titan',
        parentId: 'saturn',
        color: '#f59e0b',
        orbitPeriod: 15.95,
        rotationHours: 382.8,
        rotationPeriod: 15.95,
        inclination: 0.35,
        initialAngle: 4.2,
        exploration: {
          radius: 1.20,
          orbitDistance: 27.5
        },
        trueScale: {
          radius: 0.37,
          orbitDistance: 13.5
        },
        orbitDistance: 27.5,
        atmosphere: {
          color: [0.92, 0.35, 0.05],
          power: 2.0,
          intensity: 1.2,
          scale: 1.08
        },
        description: "Saturn's largest moon, veiled in a dense golden nitrogen-methane haze with stable hydrocarbon lakes, rivers, and rain.",
        telemetry: {
          diameter: '5,149 km',
          relativeSize: '0.404 × Earth',
          mass: '1.345 × 10²³ kg',
          surfaceTemp: '-179 °C (1.45 bar dense atmosphere)',
          surfaceGravity: '1.35 m/s² (0.138 g)',
          orbitalPeriod: '15.95 days',
          parentPlanet: 'Saturn',
          classification: 'Saturnian hydrocarbon atmosphere satellite'
        }
      }
    ],
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
    hasMoons: true,
    moons: [
      {
        id: 'triton',
        name: 'Triton',
        parentId: 'neptune',
        color: '#c4b5fd',
        orbitPeriod: -5.88, // retrograde orbit!
        rotationHours: -141.12,
        rotationPeriod: -5.88,
        inclination: 25.0,
        initialAngle: 2.7,
        exploration: {
          radius: 0.82,
          orbitDistance: 11.5
        },
        trueScale: {
          radius: 0.25,
          orbitDistance: 4.8
        },
        orbitDistance: 11.5,
        description: 'A captured Kuiper Belt dwarf planet orbiting Neptune in reverse (retrograde), boasting active nitrogen cryogeysers and cantaloupe terrain.',
        telemetry: {
          diameter: '2,707 km',
          relativeSize: '0.212 × Earth',
          mass: '2.140 × 10²² kg',
          surfaceTemp: '-235 °C (38 K, one of the coldest bodies in the Solar System)',
          surfaceGravity: '0.78 m/s² (0.079 g)',
          orbitalPeriod: '-5.88 days (Retrograde)',
          parentPlanet: 'Neptune',
          classification: 'Captured Kuiper belt retrograde satellite'
        }
      }
    ],
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
  { label: '1x', value: 1.0 },
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

export const ASTEROID_BELTS = {
  mainBelt: {
    id: 'mainBelt',
    name: 'Main Asteroid Belt',
    type: 'Circumstellar Asteroid Disc',
    color: '#a8a29e',
    count: 6000,
    exploration: {
      minRadius: 78,
      maxRadius: 132,
      ySpread: 4.0,
      minScale: 0.35,
      maxScale: 0.85
    },
    trueScale: {
      minRadius: 252, // 2.1 AU * 120 (comfortably between Mars at 182.9 and Jupiter at 624.0)
      maxRadius: 396, // 3.3 AU * 120
      ySpread: 14.0,
      minScale: 0.08,
      maxScale: 0.22
    },
    minAU: 2.1,
    maxAU: 3.3,
    colorPalette: [
      '#38383a', // C-type: Carbonaceous chondrite (dark grey / charcoal)
      '#48484a',
      '#58585c',
      '#636366',
      '#8c8275', // S-type: Silicate stone (grey-brown / stony)
      '#9a8f80',
      '#a89f91',
      '#b8ad9e',
      '#d4d4d8', // M-type: Metallic nickel-iron (reflective light grey)
      '#a1a1aa',
      '#b0b0b8'
    ],
    description: "A vast toroidal collection of irregular rocky and metallic planetesimals orbiting between Mars and Jupiter, shaped by Jovian orbital resonances and Kirkwood gaps.",
    telemetry: {
      location: 'Between Mars (~1.52 AU) and Jupiter (~5.20 AU)',
      semiMajorAxis: '2.1–3.3 AU (314–494 million km)',
      orbitalPeriod: '3.0–6.0 Earth years (Keplerian)',
      totalMass: '~2.4 × 10²¹ kg (~4% of Earth\'s Moon)',
      largestBodies: 'Ceres (d=939 km), Vesta (d=525 km), Pallas (d=512 km), Hygiea (d=434 km)',
      composition: '75% C-type (Carbonaceous), 17% S-type (Silicate), 8% M-type (Metallic)',
      estimatedCount: '1.1–1.9 million asteroids > 1 km; millions of boulders & pebbles',
      classification: 'Circumstellar planetary debris disc'
    }
  },

  kuiperBelt: {
    id: 'kuiperBelt',
    name: 'Kuiper Belt',
    type: 'Trans-Neptunian Circumstellar Disc',
    color: '#93c5fd',
    count: 4500,
    exploration: {
      minRadius: 330,
      maxRadius: 450,
      ySpread: 12.0,
      minScale: 0.45,
      maxScale: 1.10
    },
    trueScale: {
      minRadius: 3660, // 30.5 AU * 120 (proportional beyond Neptune at 3612.0)
      maxRadius: 6000, // 50.0 AU * 120
      ySpread: 160.0,
      minScale: 0.14,
      maxScale: 0.38
    },
    minAU: 30.5,
    maxAU: 50.0,
    colorPalette: [
      '#a5c8e4', // Pale icy blue / volatile nitrogen & water ice
      '#cbe5ff',
      '#88b4d8',
      '#bfdbfe',
      '#b86d4b', // Tholin reddish-brown / organic refractory mantle
      '#9e5338',
      '#cf7e59',
      '#8f462e',
      '#64748b', // Muted icy slate / dark silicate-ice mix
      '#475569',
      '#5a687a'
    ],
    description: "A colossal, frozen circumstellar disc of ancient icy remnants, cometary nuclei, and dwarf planets orbiting beyond Neptune in the cold outer frontier of our Solar System.",
    telemetry: {
      location: 'Beyond Neptune (30.1 AU to ~50 AU)',
      semiMajorAxis: '30.5–50.0 AU (4.5–7.5 billion km)',
      orbitalPeriod: '165–354 Earth years (Keplerian)',
      totalMass: '~1.8 × 10²³ kg (1/10 to 1/30 of Earth)',
      largestBodies: 'Pluto (d=2,377 km), Eris (d=2,326 km), Haumea, Makemake, Gonggong, Quaoar',
      composition: 'Volatile ices (nitrogen, methane, carbon monoxide, water), complex tholins, silicates',
      estimatedCount: '> 100,000 objects > 100 km; hundreds of millions of icy bodies',
      classification: 'Trans-Neptunian icy planetesimal disc'
    }
  }
};

/**
 * Helper to locate an asteroid belt by id
 */
export function findBeltById(beltId) {
  if (!beltId) return null;
  return ASTEROID_BELTS[beltId] || null;
}

/**
 * Helper to retrieve a flat array of all registered asteroid belts
 */
export function getAllBelts() {
  return Object.values(ASTEROID_BELTS);
}

/**
 * Helper to locate any natural satellite across parent planets by id
 */
export function findMoonById(moonId) {
  if (!moonId) return null;
  for (const body of Object.values(CELESTIAL_BODIES)) {
    if (body.moons && Array.isArray(body.moons)) {
      const found = body.moons.find(m => m.id === moonId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Helper to retrieve a flat array of all registered natural satellites
 */
export function getAllMoons() {
  const allMoons = [];
  for (const body of Object.values(CELESTIAL_BODIES)) {
    if (body.moons && Array.isArray(body.moons)) {
      allMoons.push(...body.moons);
    }
  }
  return allMoons;
}
