/**
 * HELIOS 3D Graphics & Simulation Engine
 * Three.js scene, NASA photographic textures, dual illumination, starfield, meshes, prominent orbits,
 * fast responsive zooming, and screen-space aerospace planetary locator markers.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CELESTIAL_BODIES, APP_CONFIG, ASTEROID_BELTS } from './config.js';
import { PhysicsEngine } from './physics.js';
import { TextureManager } from './textures.js';

export class SimulationEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.physics = new PhysicsEngine(CELESTIAL_BODIES);

    this.bodies = {};
    this.moons = {};
    this.belts = {};
    this.beltsVisible = true;
    this.orbitLines = {};
    this.planetMarkers = {};
    this.moonOrbitLine = null;
    this.hoveredBodyId = null;
    this.selectedBodyId = null;

    // Camera tweening state
    this.isTransitioningCamera = false;
    this.cameraStartPos = new THREE.Vector3();
    this.cameraTargetPos = new THREE.Vector3();
    this.controlsStartTarget = new THREE.Vector3();
    this.controlsEndTarget = new THREE.Vector3();
    this.tweenProgress = 1.0;
    this.tweenDuration = 1.2; // seconds

    // Smooth adaptive zooming state
    this.targetZoomDist = null;

    // Mouse & Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    // Callbacks
    this.onSelectBody = null;
    this.onHoverBody = null;
    this.onFpsUpdate = null;

    // Performance telemetry
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsTimer = 0;

    this.initScene();
    this.initLighting();
    this.initCelestialBodies();
    this.initAsteroidBelts();
    this.initStarfield();
    this.initPlanetMarkers();
    this.initEvents();

    // Expose THREE on window for developer console inspection
    if (typeof window !== 'undefined') {
      window.THREE = THREE;
    }
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020204);
    // Note: No fog in the vacuum of space. Prevents distance darkening.
    this.scene.fog = null;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Camera initialized to panoramic view showing all planetary orbits out to Neptune
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 45000);
    this.camera.position.set(APP_CONFIG.defaultCameraPos.x, APP_CONFIG.defaultCameraPos.y, APP_CONFIG.defaultCameraPos.z);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // Fast, responsive orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.zoomSpeed = 2.4; // Fast, snappy, effortless zoom in/out
    this.controls.rotateSpeed = 1.0;
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 30000;
    this.controls.maxPolarAngle = Math.PI * 0.88; // Don't flip under
  }

  initLighting() {
    // 1. Primary central point light emitted from Sun (infinite range, no falloff attenuation)
    this.sunLight = new THREE.PointLight(0xffffff, 5.0, 0, 0.0);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // 2. Camera Headlight (Directional light following the camera viewpoint)
    // Ensures the side of the planet facing the camera is ALWAYS illuminated, bright, and colorful!
    this.cameraLight = new THREE.DirectionalLight(0xffffff, 0.95);
    this.cameraLight.position.set(0, 0, 1);
    this.camera.add(this.cameraLight);
    this.scene.add(this.camera);

    // 3. Deep-space ambient fill
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);
  }

  initStarfield() {
    // 1. Deep space celestial background sphere with NASA Milky Way panorama
    if (this.textures && this.textures.milkyway) {
      const skyGeo = new THREE.SphereGeometry(18000, 32, 32);
      const skyMat = new THREE.MeshBasicMaterial({
        map: this.textures.milkyway,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
        fog: false
      });
      this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
      this.scene.add(this.skyMesh);
    }

    // 2. High-precision 3D starfield particles
    const starCount = APP_CONFIG.starfieldCount;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#9bb0ff'), // Blue-white (O/B type)
      new THREE.Color('#ffcc6f'), // Warm yellow (G/K type)
      new THREE.Color('#ff8866')  // Cool reddish (M type)
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 3500 + Math.random() * 6000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2.2 + 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Star particle texture
    const starCanvas = document.createElement('canvas');
    starCanvas.width = 32;
    starCanvas.height = 32;
    const sCtx = starCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 32, 32);

    const starTexture = new THREE.CanvasTexture(starCanvas);
    const material = new THREE.PointsMaterial({
      size: 3.0,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });

    const stars = new THREE.Points(geometry, material);
    this.scene.add(stars);
  }

  initCelestialBodies() {
    // Load realistic NASA photographic textures with automatic procedural fallbacks
    this.textures = TextureManager.loadAllTextures((key, tex) => {
      if (key === 'milkyway' && this.skyMesh) {
        this.skyMesh.material.map = tex;
        this.skyMesh.material.needsUpdate = true;
      }
      if (key.includes('Rings')) {
        const bodyKey = key.replace('Rings', '');
        if (this.bodies[bodyKey]?.shadowUniforms) {
          this.bodies[bodyKey].shadowUniforms.uRingTexture.value = tex;
        }
      }
    });

    // 1. Build Sun
    this.buildSun();

    // 2. Build Planets & Orbits
    for (const [key, config] of Object.entries(CELESTIAL_BODIES)) {
      if (key === 'sun') continue;
      this.buildPlanet(key, config);
    }
  }

  buildSun() {
    const config = CELESTIAL_BODIES.sun;
    const { radius } = this.physics.getBodyDimensions('sun');

    const group = new THREE.Group();
    group.name = 'sun_group';

    // Core emissive sphere with NASA SDO realistic photo texture
    // Unit geometry (radius 1) so scaling by radius sets the exact intended physical size
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      map: this.textures.sun,
      color: 0xffffff,
      fog: false
    });
    const coreMesh = new THREE.Mesh(sphereGeo, sphereMat);
    coreMesh.scale.set(radius, radius, radius);
    coreMesh.userData = { bodyId: 'sun' };
    group.add(coreMesh);

    this.scene.add(group);
    this.bodies['sun'] = {
      group,
      mesh: coreMesh,
      config
    };
  }

  buildPlanet(key, config) {
    const group = new THREE.Group();
    group.name = `${key}_group`;

    const { radius } = this.physics.getBodyDimensions(key);

    // Planet body mesh with realistic NASA surface texture
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      map: this.textures[key],
      roughness: key === 'earth' ? 0.35 : (key === 'venus' ? 0.8 : 0.6),
      metalness: 0.05
    });

    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.scale.set(radius, radius, radius);
    mesh.rotation.z = THREE.MathUtils.degToRad(config.axialTilt || 0);
    mesh.userData = { bodyId: key };
    group.add(mesh);

    // 3D Glowing Locator Halo Ring (ensures immediate visibility from any zoom angle)
    const haloGeo = new THREE.RingGeometry(1.35, 1.55, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(config.color || 0x38bdf8),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      fog: false
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 2;
    mesh.add(haloMesh);

    // Earth specific: Atmospheric cloud layer
    let cloudsMesh = null;
    if (key === 'earth') {
      const cloudGeo = new THREE.SphereGeometry(1.025, 64, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: this.textures.earthClouds,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        roughness: 1.0,
        depthWrite: false
      });
      cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      mesh.add(cloudsMesh);
    }

    // Atmospheric Fresnel Rim Glow
    let atmosphereMesh = null;
    if (config.atmosphere) {
      atmosphereMesh = this.buildAtmosphereMesh(config.atmosphere);
      mesh.add(atmosphereMesh);
    }

    // Natural Satellites / Major Moons
    const moonsList = [];
    let moonGroup = null;
    let moonMesh = null;

    if (config.moons && Array.isArray(config.moons)) {
      for (const moonConfig of config.moons) {
        const moonObj = this.buildMoon(key, moonConfig);
        moonsList.push(moonObj);
        this.moons[moonConfig.id] = moonObj;

        // Backward compatibility for Earth's primary moon
        if (moonConfig.id === 'moon') {
          moonGroup = moonObj.group;
          moonMesh = moonObj.mesh;
          this.moonOrbitLine = moonObj.orbitLine;
        }
      }
    }

    // Saturn / Uranus Rings & Realistic Solar Shadows
    let ringMesh = null;
    let shadowUniforms = null;
    if (config.hasRings) {
      haloMesh.visible = false;
      ringMesh = this.buildRings(key, config);
      mesh.add(ringMesh); // Added directly to mesh so it scales and tilts automatically
      shadowUniforms = this.setupRingShadows(key, mesh, ringMesh, config);
    }

    // Vector Planetary Orbit Line (vivid, anti-aliased, and clearly drawn)
    const orbitLine = this.buildOrbitLine(key, config);
    this.scene.add(orbitLine);
    this.orbitLines[key] = orbitLine;

    this.scene.add(group);

    this.bodies[key] = {
      group,
      mesh,
      haloMesh,
      cloudsMesh,
      atmosphereMesh,
      moonGroup,
      moonMesh,
      moons: moonsList,
      ringMesh,
      shadowUniforms,
      config
    };
  }

  /**
   * Build celestial mesh and thin orbit vector line for a natural satellite
   */
  buildMoon(parentKey, moonConfig) {
    const group = new THREE.Group();
    group.name = `${moonConfig.id}_group`;

    const { radius } = this.physics.getMoonDimensions(moonConfig);

    // Unit geometry (radius 1) so mesh.scale.set(radius, radius, radius) sets exact physical size
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    let material;
    if (moonConfig.id === 'moon' && this.textures.moon) {
      material = new THREE.MeshStandardMaterial({
        map: this.textures.moon,
        roughness: 0.85,
        metalness: 0.05
      });
    } else if (this.textures[moonConfig.id]) {
      material = new THREE.MeshStandardMaterial({
        map: this.textures[moonConfig.id],
        roughness: 0.75,
        metalness: 0.05
      });
    } else {
      material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(moonConfig.color || 0x94a3b8),
        roughness: 0.75,
        metalness: 0.05
      });
    }

    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.scale.set(radius, radius, radius);
    mesh.userData = { bodyId: moonConfig.id, parentId: parentKey, isMoon: true };
    group.add(mesh);

    // Atmospheric Fresnel Rim Glow (e.g. Titan's dense photochemical haze)
    let atmosphereMesh = null;
    if (moonConfig.atmosphere) {
      atmosphereMesh = this.buildAtmosphereMesh(moonConfig.atmosphere);
      mesh.add(atmosphereMesh);
    }

    this.scene.add(group);

    // Vector Thin Moon Orbit Line around host planet
    const orbitPts = this.physics.generateMoonOrbitPath(moonConfig, 96);
    const positions = new Float32Array(orbitPts.length * 3);
    for (let i = 0; i < orbitPts.length; i++) {
      positions[i * 3] = orbitPts[i].x;
      positions[i * 3 + 1] = orbitPts[i].y;
      positions[i * 3 + 2] = orbitPts[i].z;
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const orbitMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(moonConfig.color || 0x94a3b8),
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      fog: false
    });
    const orbitLine = new THREE.LineLoop(orbitGeo, orbitMat);
    orbitLine.userData = { bodyId: moonConfig.id, parentId: parentKey, isMoon: true };
    this.scene.add(orbitLine);

    return {
      id: moonConfig.id,
      parentId: parentKey,
      config: moonConfig,
      group,
      mesh,
      atmosphereMesh,
      orbitLine
    };
  }

  /**
   * Build atmospheric shell mesh with custom GLSL Fresnel glow shader
   * Features physically credible solar day/night limb modulation
   */
  buildAtmosphereMesh(atmConfig) {
    const scale = atmConfig.scale || 1.025;
    const geometry = new THREE.SphereGeometry(scale, 64, 64);

    const colorVec = Array.isArray(atmConfig.color)
      ? new THREE.Vector3(atmConfig.color[0], atmConfig.color[1], atmConfig.color[2])
      : new THREE.Vector3(0.22, 0.74, 0.97);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: colorVec },
        uSunDirection: { value: new THREE.Vector3(1, 0, 0) },
        uPower: { value: atmConfig.power !== undefined ? atmConfig.power : 3.0 },
        uIntensity: { value: atmConfig.intensity !== undefined ? atmConfig.intensity : 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormal = normalize(mat3(modelMatrix) * normal);
          vViewDir = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uSunDirection;
        uniform float uPower;
        uniform float uIntensity;

        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDir = normalize(vViewDir);

          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDir)), uPower);
          float sunDot = dot(normal, uSunDirection);
          float dayFactor = smoothstep(-0.25, 0.45, sunDot);

          gl_FragColor = vec4(uColor, fresnel * dayFactor * uIntensity);
        }
      `,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'atmosphereMesh';
    mesh.renderOrder = 2;
    mesh.raycast = () => {}; // Prevent intercepting raycaster clicks/hovers
    return mesh;
  }

  buildRings(key, config) {
    const ringCfg = config.ringConfig;
    const inner = ringCfg.innerRadiusMultiplier;
    const outer = ringCfg.outerRadiusMultiplier;

    // Use custom mapped RingGeometry with 96 segments for high circular fidelity
    const ringGeo = new THREE.RingGeometry(inner, outer, 96);
    
    // Remap UVs so radius maps from 0 to 1 along U
    const pos = ringGeo.attributes.position;
    const uvs = ringGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const d = Math.sqrt(x * x + y * y);
      const u = (d - inner) / (outer - inner);
      uvs.setXY(i, u, 0.5);
    }

    const ringMat = new THREE.MeshStandardMaterial({
      map: this.textures[`${key}Rings`] || this.textures.saturnRings,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: ringCfg.subtle ? 0.45 : 0.95,
      roughness: 0.55
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    return ringMesh;
  }

  /**
   * Set up photorealistic solar shadow casting for planetary ring systems:
   * 1. Planet globe casts an authentic elliptical dark shadow across its rings
   * 2. Rings cast an authentic shadow band across the planet's cloud tops
   */
  setupRingShadows(key, bodyMesh, ringMesh, config) {
    const ringCfg = config.ringConfig;
    const inner = ringCfg.innerRadiusMultiplier;
    const outer = ringCfg.outerRadiusMultiplier;
    const ringTex = ringMesh.material.map || this.textures[`${key}Rings`] || this.textures.saturnRings;

    const shadowUniforms = {
      uSunDirLocal: { value: new THREE.Vector3(1, 0, 0) },
      uRingTexture: { value: ringTex },
      uRingInner: { value: inner },
      uRingOuter: { value: outer }
    };

    // 1. Globe Material: Rings cast shadow onto planet atmosphere
    bodyMesh.material.onBeforeCompile = (shader) => {
      shader.uniforms.uSunDirLocal = shadowUniforms.uSunDirLocal;
      shader.uniforms.uRingTexture = shadowUniforms.uRingTexture;
      shader.uniforms.uRingInner = shadowUniforms.uRingInner;
      shader.uniforms.uRingOuter = shadowUniforms.uRingOuter;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPlanetLocalPos;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vPlanetLocalPos = position;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPlanetLocalPos;
        uniform vec3 uSunDirLocal;
        uniform sampler2D uRingTexture;
        uniform float uRingInner;
        uniform float uRingOuter;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
        // Realistic solar shadow of rings cast onto the planet atmosphere
        float ringShadowFactor = 1.0;
        if (abs(uSunDirLocal.y) > 0.0005) {
          // Ray from surface point towards the Sun: P + t * L.
          // Intersects ring equatorial plane y = 0 at t = -P.y / L.y
          float tRing = -vPlanetLocalPos.y / uSunDirLocal.y;
          // Shadow is cast if ray crosses the ring plane between the surface and the Sun
          if (tRing > 0.0 && dot(vPlanetLocalPos, uSunDirLocal) > -0.05) {
            vec3 pHit = vPlanetLocalPos + tRing * uSunDirLocal;
            float rHit = length(pHit.xz);
            if (rHit >= uRingInner && rHit <= uRingOuter) {
              float uCoord = clamp((rHit - uRingInner) / (uRingOuter - uRingInner), 0.0, 1.0);
              vec4 ringSample = texture2D(uRingTexture, vec2(uCoord, 0.5));
              float opticalDensity = ringSample.a;
              float edgeSoftness = 0.02;
              float edgeBlend = smoothstep(uRingInner, uRingInner + edgeSoftness, rHit) *
                                (1.0 - smoothstep(uRingOuter - edgeSoftness, uRingOuter, rHit));
              float shadowBlock = clamp(opticalDensity * edgeBlend * 0.82, 0.0, 0.88);
              ringShadowFactor = 1.0 - shadowBlock;
            }
          }
        }
        reflectedLight.directDiffuse *= ringShadowFactor;
        reflectedLight.directSpecular *= ringShadowFactor;`
      );
    };
    bodyMesh.material.customProgramCacheKey = () => `${key}_globe_shadow`;

    // 2. Ring Material: Planet globe casts shadow across rings
    ringMesh.material.onBeforeCompile = (shader) => {
      shader.uniforms.uSunDirLocal = shadowUniforms.uSunDirLocal;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vRingEquatorialPos;`
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        // Ring mesh is rotated PI/2 around X, so in planet equatorial local coordinates: (x, 0, y)
        vRingEquatorialPos = vec3(position.x, 0.0, position.y);`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vRingEquatorialPos;
        uniform vec3 uSunDirLocal;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <lights_fragment_end>',
        `#include <lights_fragment_end>
        // Realistic solar shadow of planet globe cast onto its ring plane
        float globeShadowFactor = 1.0;
        float projSun = dot(vRingEquatorialPos, uSunDirLocal);
        // Fragment is behind the globe relative to the Sun (night side)
        if (projSun < 0.0) {
          float dPerpSq = dot(vRingEquatorialPos, vRingEquatorialPos) - projSun * projSun;
          float dPerp = sqrt(max(0.0, dPerpSq));
          // Planet globe radius is 1.0 in local mesh coordinates
          float penumbra = 0.035;
          float tShadow = smoothstep(1.0 - penumbra, 1.0 + penumbra, dPerp);
          globeShadowFactor = mix(0.04, 1.0, tShadow);
        }
        reflectedLight.directDiffuse *= globeShadowFactor;
        reflectedLight.directSpecular *= globeShadowFactor;
        reflectedLight.indirectDiffuse *= mix(0.35, 1.0, globeShadowFactor);`
      );
    };
    ringMesh.material.customProgramCacheKey = () => `${key}_ring_shadow`;

    return shadowUniforms;
  }

  /**
   * Draw crisp, vivid, anti-aliased vector orbit lines for each planet
   */
  buildOrbitLine(key, config) {
    const pathPoints = this.physics.generateOrbitPath(key, 256);
    const positions = new Float32Array(pathPoints.length * 3);
    for (let i = 0; i < pathPoints.length; i++) {
      positions[i * 3] = pathPoints[i].x;
      positions[i * 3 + 1] = pathPoints[i].y;
      positions[i * 3 + 2] = pathPoints[i].z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(config.orbitColor || 0x666666),
      transparent: true,
      opacity: 0.75, // High visibility across entire solar system
      depthWrite: false,
      fog: false
    });

    const line = new THREE.LineLoop(geometry, material);
    line.userData = { bodyId: key };
    return line;
  }

  updateOrbitLines() {
    for (const [key, line] of Object.entries(this.orbitLines)) {
      const pathPoints = this.physics.generateOrbitPath(key, 256);
      const positions = line.geometry.attributes.position.array;
      for (let i = 0; i < pathPoints.length; i++) {
        positions[i * 3] = pathPoints[i].x;
        positions[i * 3 + 1] = pathPoints[i].y;
        positions[i * 3 + 2] = pathPoints[i].z;
      }
      line.geometry.attributes.position.needsUpdate = true;
    }

    // Update natural satellite orbit lines as scale interpolates
    for (const moon of Object.values(this.moons)) {
      if (!moon.orbitLine) continue;
      const pathPoints = this.physics.generateMoonOrbitPath(moon.config, 96);
      const positions = moon.orbitLine.geometry.attributes.position.array;
      for (let i = 0; i < pathPoints.length; i++) {
        positions[i * 3] = pathPoints[i].x;
        positions[i * 3 + 1] = pathPoints[i].y;
        positions[i * 3 + 2] = pathPoints[i].z;
      }
      moon.orbitLine.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Initialize 3D Main Asteroid Belt and Kuiper Belt with instanced low-poly meshes
   */
  initAsteroidBelts() {
    this.belts = {};
    this.beltsVisible = true;

    for (const [beltKey, beltConfig] of Object.entries(ASTEROID_BELTS)) {
      const count = beltConfig.count;
      // Low-poly dodecahedron geometry for irregular, faceted space rocks
      const baseGeo = new THREE.DodecahedronGeometry(1, 0);

      // MeshStandardMaterial with flatShading and emissive boost for high-visibility from overview zoom
      const material = new THREE.MeshStandardMaterial({
        roughness: beltKey === 'kuiperBelt' ? 0.65 : 0.82,
        metalness: beltKey === 'kuiperBelt' ? 0.08 : 0.14,
        flatShading: true,
        emissive: new THREE.Color(0x222222)
      });

      const instancedMesh = new THREE.InstancedMesh(baseGeo, material, count);
      instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      instancedMesh.name = `${beltKey}_mesh`;
      instancedMesh.userData = { beltId: beltKey };

      // Pre-allocate typed arrays for maximum performance and zero GC overhead
      const rExp = new Float32Array(count);
      const rTrue = new Float32Array(count);
      const yExp = new Float32Array(count);
      const yTrue = new Float32Array(count);
      const sExp = new Float32Array(count);
      const sTrue = new Float32Array(count);
      const theta0 = new Float32Array(count);
      const omega = new Float32Array(count);
      const ecc = new Float32Array(count);
      const rot = new Float32Array(count * 9); // 3x3 orientation & shape matrix

      const palette = beltConfig.colorPalette;
      const dummyColor = new THREE.Color();
      const dummyObj = new THREE.Object3D();

      for (let i = 0; i < count; i++) {
        // Triangular distribution centered around 0.5 for denser core
        const u = (Math.random() + Math.random()) * 0.5;

        // Radii in exploration scale and true scale
        const minRExp = beltConfig.exploration.minRadius;
        const maxRExp = beltConfig.exploration.maxRadius;
        rExp[i] = minRExp + u * (maxRExp - minRExp);

        const minAU = beltConfig.minAU;
        const maxAU = beltConfig.maxAU;
        const aAU = minAU + u * (maxAU - minAU);
        // In true scale: 1.0 AU = 120 units
        rTrue[i] = aAU * 120.0;

        // Vertical spread Y
        const ySpreadExp = beltConfig.exploration.ySpread;
        const ySpreadTrue = beltConfig.trueScale.ySpread;
        // Natural bell-shaped vertical distribution
        const vSpread = (Math.random() + Math.random() - 1.0);
        yExp[i] = vSpread * ySpreadExp;
        yTrue[i] = vSpread * ySpreadTrue;

        // Size / scale
        const minSExp = beltConfig.exploration.minScale;
        const maxSExp = beltConfig.exploration.maxScale;
        sExp[i] = minSExp + Math.random() * (maxSExp - minSExp);

        const minSTrue = beltConfig.trueScale.minScale;
        const maxSTrue = beltConfig.trueScale.maxScale;
        sTrue[i] = minSTrue + Math.random() * (maxSTrue - minSTrue);

        // Initial orbital phase angle
        theta0[i] = Math.random() * Math.PI * 2;

        // Keplerian angular velocity: proportional to a^(-3/2) (r^-3/2)
        omega[i] = this.physics.calculateBeltKeplerianVelocity(aAU);

        // Small orbital eccentricity (0.01 to 0.08)
        ecc[i] = 0.01 + Math.random() * 0.07;

        // Randomized non-uniform shape scaling and 3D orientation for unique rocky asteroid shapes
        dummyObj.rotation.set(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        );
        // Potato aspect ratio distortion
        dummyObj.scale.set(
          0.75 + Math.random() * 0.5,
          0.75 + Math.random() * 0.5,
          0.75 + Math.random() * 0.5
        );
        dummyObj.updateMatrix();

        // Extract 3x3 rotation/shape matrix into rot array
        const me = dummyObj.matrix.elements;
        const rIdx = i * 9;
        rot[rIdx]     = me[0];
        rot[rIdx + 1] = me[1];
        rot[rIdx + 2] = me[2];
        rot[rIdx + 3] = me[4];
        rot[rIdx + 4] = me[5];
        rot[rIdx + 5] = me[6];
        rot[rIdx + 6] = me[8];
        rot[rIdx + 7] = me[9];
        rot[rIdx + 8] = me[10];

        // Instance Color: picked from palette with subtle lightness variation
        dummyColor.set(palette[Math.floor(Math.random() * palette.length)]);
        const hsl = {};
        dummyColor.getHSL(hsl);
        hsl.l = Math.max(0.08, Math.min(0.92, hsl.l * (0.85 + Math.random() * 0.3)));
        dummyColor.setHSL(hsl.h, hsl.s, hsl.l);
        instancedMesh.setColorAt(i, dummyColor);
      }

      if (instancedMesh.instanceColor) {
        instancedMesh.instanceColor.needsUpdate = true;
      }

      this.scene.add(instancedMesh);

      this.belts[beltKey] = {
        id: beltKey,
        config: beltConfig,
        mesh: instancedMesh,
        count,
        data: {
          rExp,
          rTrue,
          yExp,
          yTrue,
          sExp,
          sTrue,
          theta0,
          omega,
          ecc,
          rot
        }
      };
    }

    // Initial positioning
    this.updateAsteroidBelts();
  }

  /**
   * Update asteroid belt particle positions using Keplerian orbital dynamics (omega ~ r^-3/2)
   * and smooth scale interpolation between Exploration Scale and True Scale.
   */
  updateAsteroidBelts() {
    if (!this.belts) return;

    for (const belt of Object.values(this.belts)) {
      if (!this.beltsVisible) {
        if (belt.mesh.visible) belt.mesh.visible = false;
        continue;
      } else {
        if (!belt.mesh.visible) belt.mesh.visible = true;
      }

      const count = belt.count;
      const data = belt.data;
      const array = belt.mesh.instanceMatrix.array;
      const elapsedDays = this.physics.elapsedDays;
      const t = this.physics.getEffectiveScaleInterpolation();

      const rExp = data.rExp;
      const rTrue = data.rTrue;
      const yExp = data.yExp;
      const yTrue = data.yTrue;
      const sExp = data.sExp;
      const sTrue = data.sTrue;
      const theta0 = data.theta0;
      const omega = data.omega;
      const ecc = data.ecc;
      const rot = data.rot;

      for (let i = 0; i < count; i++) {
        // Radius, vertical offset, and scale blended between exploration and true scale
        const r = rExp[i] * (1 - t) + rTrue[i] * t;
        const y = yExp[i] * (1 - t) + yTrue[i] * t;
        const s = sExp[i] * (1 - t) + sTrue[i] * t;

        // Keplerian orbital revolution: omega is proportional to r^(-3/2)
        const angle = theta0[i] + omega[i] * elapsedDays;
        const e = ecc[i];

        // Elliptical coordinates with focal offset
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const a = r;
        const b = a * Math.sqrt(Math.max(0.001, 1 - e * e));
        const c = a * e;

        const x = a * cos - c;
        const z = b * sin;

        // Apply scale to precomputed 3x3 rotation/shape matrix
        const idx = i * 16;
        const rIdx = i * 9;

        array[idx]      = rot[rIdx]     * s;
        array[idx + 1]  = rot[rIdx + 1] * s;
        array[idx + 2]  = rot[rIdx + 2] * s;
        array[idx + 3]  = 0;

        array[idx + 4]  = rot[rIdx + 3] * s;
        array[idx + 5]  = rot[rIdx + 4] * s;
        array[idx + 6]  = rot[rIdx + 5] * s;
        array[idx + 7]  = 0;

        array[idx + 8]  = rot[rIdx + 6] * s;
        array[idx + 9]  = rot[rIdx + 7] * s;
        array[idx + 10] = rot[rIdx + 8] * s;
        array[idx + 11] = 0;

        // Position coordinates
        array[idx + 12] = x;
        array[idx + 13] = y;
        array[idx + 14] = z;
        array[idx + 15] = 1.0;
      }

      belt.mesh.instanceMatrix.needsUpdate = true;
    }
  }

  /**
   * Toggle visibility of asteroid belts
   */
  toggleBelts() {
    this.beltsVisible = !this.beltsVisible;
    for (const belt of Object.values(this.belts)) {
      belt.mesh.visible = this.beltsVisible;
    }
    return this.beltsVisible;
  }

  /**
   * Set visibility of asteroid belts
   */
  setBeltsVisible(visible) {
    this.beltsVisible = Boolean(visible);
    for (const belt of Object.values(this.belts)) {
      belt.mesh.visible = this.beltsVisible;
    }
    return this.beltsVisible;
  }

  /**
   * Update atmospheric Fresnel glow solar illumination vectors
   * Direction points from body/moon towards Sun at origin (0, 0, 0)
   */
  updateAtmospheres() {
    const worldPos = new THREE.Vector3();

    for (const body of Object.values(this.bodies)) {
      if (body.atmosphereMesh && body.group) {
        body.group.getWorldPosition(worldPos);
        if (worldPos.lengthSq() > 0.0001) {
          const sunDir = worldPos.clone().negate().normalize();
          body.atmosphereMesh.material.uniforms.uSunDirection.value.copy(sunDir);
        }
      }
    }

    for (const moon of Object.values(this.moons)) {
      if (moon.atmosphereMesh && moon.group) {
        moon.group.getWorldPosition(worldPos);
        if (worldPos.lengthSq() > 0.0001) {
          const sunDir = worldPos.clone().negate().normalize();
          moon.atmosphereMesh.material.uniforms.uSunDirection.value.copy(sunDir);
        }
      }
    }
  }

  /**
   * General engine update step for external callers or tests
   */
  update(deltaSeconds) {
    this.updateAtmospheres();
  }

  /**
   * Initialize screen-space planetary locator markers & name badges
   */
  initPlanetMarkers() {
    const container = document.getElementById('planet-labels-layer');
    if (!container) return;
    container.innerHTML = '';

    for (const [key, config] of Object.entries(CELESTIAL_BODIES)) {
      // Create DOM locator badge for each planet
      const marker = document.createElement('div');
      marker.className = 'planet-marker';
      marker.dataset.bodyId = key;

      const dot = document.createElement('span');
      dot.className = 'marker-dot';
      dot.style.color = config.color;
      dot.style.backgroundColor = config.color;

      const name = document.createElement('span');
      name.className = 'marker-name';
      name.textContent = config.name.toUpperCase();

      marker.appendChild(dot);
      marker.appendChild(name);

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.focusBody(key);
      });

      marker.addEventListener('mouseenter', () => {
        this.setHoveredBody(key);
      });

      marker.addEventListener('mouseleave', () => {
        if (this.hoveredBodyId === key) {
          this.setHoveredBody(null);
        }
      });

      container.appendChild(marker);
      this.planetMarkers[key] = marker;
    }
  }

  /**
   * Update 2D screen positions of all planetary locator markers
   */
  updatePlanetMarkers() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const wp = new THREE.Vector3();

    for (const [key, marker] of Object.entries(this.planetMarkers)) {
      const body = this.bodies[key];
      if (!body) continue;

      body.mesh.getWorldPosition(wp);
      const dist = this.camera.position.distanceTo(wp);

      wp.project(this.camera);

      // Check if planet is in front of camera
      const inFront = wp.z < 1.0;
      if (inFront) {
        const x = (wp.x * 0.5 + 0.5) * width;
        const y = (-wp.y * 0.5 + 0.5) * height;

        marker.style.transform = `translate(${x}px, ${y}px)`;
        marker.style.display = 'flex';

        // When focused very close on a specific planet, fade out its label so it doesn't obstruct close inspection
        const { radius } = this.physics.getBodyDimensions(key);
        const isTooClose = this.selectedBodyId === key && dist < radius * 5;
        marker.style.opacity = isTooClose ? '0' : '1';
        marker.classList.toggle('active', this.selectedBodyId === key);
      } else {
        marker.style.display = 'none';
      }
    }
  }

  initEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Raycast hover & click
    const dom = this.renderer.domElement;
    dom.addEventListener('mousemove', (e) => this.onMouseMove(e));
    dom.addEventListener('click', (e) => this.onClick(e));

    // High-performance adaptive wheel zoom (Mac trackpad & mouse wheel calibrated)
    dom.addEventListener('wheel', (e) => this.onWheel(e), { passive: false, capture: true });

    // Keyboard ESC to reset view
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.resetCameraView();
      }
    });
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.checkHover();
  }

  /**
   * High-performance adaptive wheel zooming calibrated for Mac trackpads & discrete wheels
   */
  onWheel(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Cancel any camera transition tween if user scrolls manually
    if (this.isTransitioningCamera) {
      this.isTransitioningCamera = false;
    }

    let dy = e.deltaY;
    if (e.deltaMode === 1) {
      dy *= 28; // Lines to pixels
    } else if (e.deltaMode === 2) {
      dy *= 350; // Pages to pixels
    }

    const currentOffset = this.camera.position.clone().sub(this.controls.target);
    const currentDist = currentOffset.length();

    if (this.targetZoomDist === null || isNaN(this.targetZoomDist)) {
      this.targetZoomDist = currentDist;
    }

    // Clamp single-step dy to prevent sudden extreme leaps on rapid multi-finger gestures
    const clampedDy = Math.max(-140, Math.min(140, dy));

    // Smooth exponential scaling: calibrated for both Mac trackpads (dy ~1-20) and mouse wheels (dy ~100)
    const zoomFactor = Math.exp(clampedDy * 0.0032);

    this.targetZoomDist = Math.max(
      this.controls.minDistance,
      Math.min(this.controls.maxDistance, this.targetZoomDist * zoomFactor)
    );
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hitTargets = [];
    for (const body of Object.values(this.bodies)) {
      hitTargets.push(body.mesh);
    }
    for (const moon of Object.values(this.moons)) {
      hitTargets.push(moon.mesh);
    }

    const intersects = this.raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const bodyId = hit.userData.bodyId;

      if (this.hoveredBodyId !== bodyId) {
        this.setHoveredBody(bodyId);
      }
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      if (this.hoveredBodyId) {
        this.setHoveredBody(null);
      }
      this.renderer.domElement.style.cursor = 'grab';
    }
  }

  setHoveredBody(bodyId) {
    // Reset previous hovered line (planet or moon)
    if (this.hoveredBodyId) {
      const prevLine = this.orbitLines[this.hoveredBodyId] || this.moons[this.hoveredBodyId]?.orbitLine;
      if (prevLine) {
        const isSelected = this.selectedBodyId === this.hoveredBodyId;
        const origColor = this.bodies[this.hoveredBodyId]?.config?.orbitColor || this.moons[this.hoveredBodyId]?.config?.color || 0x666666;
        const origOpacity = this.moons[this.hoveredBodyId] ? 0.38 : 0.75;
        prevLine.material.opacity = isSelected ? 1.0 : origOpacity;
        prevLine.material.color.set(isSelected ? 0xffffff : origColor);
      }
    }

    this.hoveredBodyId = bodyId;

    // Highlight new hovered line
    if (bodyId) {
      const newLine = this.orbitLines[bodyId] || this.moons[bodyId]?.orbitLine;
      if (newLine) {
        newLine.material.opacity = 1.0;
        newLine.material.color.set(0xffffff);
      }
    }

    if (this.onHoverBody) {
      this.onHoverBody(bodyId);
    }
  }

  onClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hitTargets = [];
    for (const body of Object.values(this.bodies)) {
      hitTargets.push(body.mesh);
    }
    for (const moon of Object.values(this.moons)) {
      hitTargets.push(moon.mesh);
    }

    const intersects = this.raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const targetId = hit.userData.bodyId;
      this.focusBody(targetId);
    } else {
      // If clicked empty space while focusing a body, reset
      if (this.selectedBodyId) {
        this.resetCameraView();
      }
    }
  }

  /**
   * Programmatic smooth camera tween towards celestial body, moon, or asteroid belt
   */
  focusBody(bodyId) {
    if (!this.bodies[bodyId] && !this.moons[bodyId] && !this.belts[bodyId]) return;

    // Reset previous selected orbit line
    if (this.selectedBodyId) {
      const prevLine = this.orbitLines[this.selectedBodyId] || this.moons[this.selectedBodyId]?.orbitLine;
      if (prevLine) {
        const origColor = this.bodies[this.selectedBodyId]?.config?.orbitColor || this.moons[this.selectedBodyId]?.config?.color || 0x666666;
        const origOpacity = this.moons[this.selectedBodyId] ? 0.38 : 0.75;
        prevLine.material.opacity = origOpacity;
        prevLine.material.color.set(origColor);
      }
    }

    this.selectedBodyId = bodyId;

    // Highlight selected body/moon orbit line
    const activeLine = this.orbitLines[bodyId] || this.moons[bodyId]?.orbitLine;
    if (activeLine) {
      activeLine.material.opacity = 1.0;
      activeLine.material.color.set(0xffffff);
    }

    let targetPos, cameraEnd;
    if (this.belts[bodyId]) {
      // Focus on the entire belt from an elevated panoramic viewpoint
      targetPos = new THREE.Vector3(0, 0, 0);
      const t = this.physics.getEffectiveScaleInterpolation();
      if (bodyId === 'mainBelt') {
        const dist = 160 * (1 - t) + 520 * t;
        cameraEnd = new THREE.Vector3(0, dist * 0.72, dist * 0.95);
      } else {
        const dist = 480 * (1 - t) + 6800 * t;
        cameraEnd = new THREE.Vector3(0, dist * 0.65, dist * 0.85);
      }
    } else if (this.bodies[bodyId]) {
      const body = this.bodies[bodyId];
      targetPos = body.group.position.clone();
      const { radius } = this.physics.getBodyDimensions(bodyId);
      const viewDist = Math.max(radius * 4.5, 9.0);
      cameraEnd = new THREE.Vector3(
        targetPos.x + viewDist * 0.7,
        targetPos.y + viewDist * 0.45,
        targetPos.z + viewDist * 0.8
      );
    } else {
      const moon = this.moons[bodyId];
      targetPos = moon.group.position.clone();
      const { radius } = this.physics.getMoonDimensions(moon.config);
      const viewDist = Math.max(radius * 5.0, 3.2);
      cameraEnd = new THREE.Vector3(
        targetPos.x + viewDist * 0.7,
        targetPos.y + viewDist * 0.45,
        targetPos.z + viewDist * 0.8
      );
    }

    this.startCameraTween(cameraEnd, targetPos);

    if (this.onSelectBody) {
      this.onSelectBody(bodyId);
    }
  }

  /**
   * Reset camera to zoomed-out solar top-down / isometric perspective
   */
  resetCameraView() {
    if (this.selectedBodyId) {
      const prevLine = this.orbitLines[this.selectedBodyId] || this.moons[this.selectedBodyId]?.orbitLine;
      if (prevLine) {
        const origColor = this.bodies[this.selectedBodyId]?.config?.orbitColor || this.moons[this.selectedBodyId]?.config?.color || 0x666666;
        const origOpacity = this.moons[this.selectedBodyId] ? 0.38 : 0.75;
        prevLine.material.opacity = origOpacity;
        prevLine.material.color.set(origColor);
      }
    }

    this.selectedBodyId = null;

    const defaultTarget = new THREE.Vector3(
      APP_CONFIG.defaultCameraTarget.x,
      APP_CONFIG.defaultCameraTarget.y,
      APP_CONFIG.defaultCameraTarget.z
    );

    const t = this.physics.getEffectiveScaleInterpolation();
    const scaleFactor = 1.0 + t * 6.5;
    const defaultCamera = new THREE.Vector3(
      APP_CONFIG.defaultCameraPos.x * scaleFactor,
      APP_CONFIG.defaultCameraPos.y * scaleFactor,
      APP_CONFIG.defaultCameraPos.z * scaleFactor
    );

    this.startCameraTween(defaultCamera, defaultTarget);

    if (this.onSelectBody) {
      this.onSelectBody(null);
    }
  }

  startCameraTween(endCameraPos, endTargetPos) {
    this.targetZoomDist = null;
    this.cameraStartPos.copy(this.camera.position);
    this.cameraTargetPos.copy(endCameraPos);

    this.controlsStartTarget.copy(this.controls.target);
    this.controlsEndTarget.copy(endTargetPos);

    this.tweenProgress = 0.0;
    this.isTransitioningCamera = true;
  }

  updateCameraTween(deltaSeconds) {
    if (!this.isTransitioningCamera) return;

    this.tweenProgress += deltaSeconds / this.tweenDuration;
    if (this.tweenProgress >= 1.0) {
      this.tweenProgress = 1.0;
      this.isTransitioningCamera = false;
    }

    // Smooth cubic ease-out
    const t = this.tweenProgress;
    const ease = 1 - Math.pow(1 - t, 3);

    this.camera.position.lerpVectors(this.cameraStartPos, this.cameraTargetPos, ease);
    this.controls.target.lerpVectors(this.controlsStartTarget, this.controlsEndTarget, ease);
  }

  /**
   * Main render loop
   */
  render() {
    requestAnimationFrame(() => this.render());

    const now = performance.now();
    const deltaSeconds = Math.min((now - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = now;

    // Performance FPS calculation
    this.frameCount++;
    this.fpsTimer += deltaSeconds;
    if (this.fpsTimer >= 0.5) {
      const currentFps = Math.round(this.frameCount / this.fpsTimer);
      if (this.onFpsUpdate) this.onFpsUpdate(currentFps);
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // 1. Advance physics epoch & scale transitions
    this.physics.update(deltaSeconds, APP_CONFIG.baseTimeScaleDaysPerSecond);

    // 2. Update dynamic orbit line geometry if scale changed
    this.updateOrbitLines();

    // 3. Keep background celestial sphere centered on camera so it never clips or obscures
    if (this.skyMesh) {
      this.skyMesh.position.copy(this.camera.position);
    }

    // 4. Update planetary positions, axial spins, and dynamic scales
    for (const [key, body] of Object.entries(this.bodies)) {
      const { radius } = this.physics.getBodyDimensions(key);

      if (key === 'sun') {
        body.mesh.scale.set(radius, radius, radius);
        // Sun axial spin
        body.mesh.rotation.y = this.physics.calculateAxialRotation('sun');
        continue;
      }

      // Dynamic scale update for planet mesh
      body.mesh.scale.set(radius, radius, radius);

      // Orbital position
      const pos = this.physics.calculatePosition(key);
      body.group.position.set(pos.x, pos.y, pos.z);

      // Axial spin
      body.mesh.rotation.y = this.physics.calculateAxialRotation(key);

      // Clouds rotation on Earth
      if (body.cloudsMesh) {
        body.cloudsMesh.rotation.y = this.physics.calculateAxialRotation('earth') * 1.15;
      }

      // Update solar shadow projection for ring systems
      if (body.ringMesh && body.shadowUniforms) {
        body.mesh.updateWorldMatrix(true, false);
        const sunWorld = new THREE.Vector3(0, 0, 0);
        const sunLocal = body.mesh.worldToLocal(sunWorld);
        body.shadowUniforms.uSunDirLocal.value.copy(sunLocal).normalize();
      }

      // Moon position and orbit line relative to Earth (legacy fallback)
      if (body.moonGroup && body.config.moon && !this.moons[body.config.moon.id || 'moon']) {
        const moonPos = this.physics.calculateMoonPosition(pos, body.config.moon);
        body.moonGroup.position.set(moonPos.x, moonPos.y, moonPos.z);
        body.moonMesh.rotation.y = this.physics.calculateAxialRotation('earth') * 0.3;

        if (this.moonOrbitLine) {
          this.moonOrbitLine.position.set(pos.x, pos.y, pos.z);
        }
      }
    }

    // 4b. Update all natural satellites (orbital position, dynamic scale, synchronous spin)
    for (const moon of Object.values(this.moons)) {
      const parentBody = this.bodies[moon.parentId];
      if (!parentBody) continue;
      const parentPos = parentBody.group.position;

      // Keplerian orbit position relative to parent planet
      const moonPos = this.physics.calculateMoonPosition(parentPos, moon.config);
      moon.group.position.set(moonPos.x, moonPos.y, moonPos.z);

      // Orbit path line follows parent planet coordinates
      if (moon.orbitLine) {
        moon.orbitLine.position.set(parentPos.x, parentPos.y, parentPos.z);
      }

      // Smooth scale interpolation between exploration and true scale
      const { radius: moonRadius } = this.physics.getMoonDimensions(moon.config);
      moon.mesh.scale.set(moonRadius, moonRadius, moonRadius);

      // Synchronous tidal axial rotation
      moon.mesh.rotation.y = this.physics.calculateMoonAxialRotation(moon.config);
    }

    // 4c. Update atmospheric Fresnel solar illumination vectors
    this.updateAtmospheres();

    // 4d. Update 3D Asteroid Belts (Main Belt & Kuiper Belt) with Keplerian revolution and dynamic scale
    this.updateAsteroidBelts();

    // 5. Update 2D screen positions of all planetary locator markers
    this.updatePlanetMarkers();

    // 6. Camera target tracking if a body or moon is selected
    if (this.selectedBodyId && !this.isTransitioningCamera) {
      const targetBody = this.bodies[this.selectedBodyId] || this.moons[this.selectedBodyId];
      if (targetBody) {
        const targetPos = targetBody.group.position;
        // Keep camera offset relative to the moving planet or moon
        const offset = this.camera.position.clone().sub(this.controls.target);
        this.controls.target.copy(targetPos);
        this.camera.position.copy(targetPos).add(offset);
      }
    }

    // 7. Smooth adaptive zoom interpolation
    if (this.targetZoomDist !== null && !this.isTransitioningCamera) {
      const currentOffset = this.camera.position.clone().sub(this.controls.target);
      const currentDist = currentOffset.length();
      const diff = this.targetZoomDist - currentDist;

      if (Math.abs(diff) > 0.01) {
        const alpha = 1.0 - Math.exp(-18.0 * deltaSeconds);
        const newDist = currentDist + diff * alpha;
        currentOffset.setLength(newDist);
        this.camera.position.copy(this.controls.target).add(currentOffset);
      } else {
        currentOffset.setLength(this.targetZoomDist);
        this.camera.position.copy(this.controls.target).add(currentOffset);
        this.targetZoomDist = null;
      }
    }

    // 8. Camera transition interpolation
    this.updateCameraTween(deltaSeconds);

    // 9. Update orbit controls and render
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
