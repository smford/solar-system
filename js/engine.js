/**
 * HELIOS 3D Graphics & Simulation Engine
 * Three.js scene, NASA photographic textures, dual illumination, starfield, meshes, prominent orbits,
 * fast responsive zooming, and screen-space aerospace planetary locator markers.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CELESTIAL_BODIES, APP_CONFIG } from './config.js';
import { PhysicsEngine } from './physics.js';
import { TextureManager } from './textures.js';

export class SimulationEngine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.physics = new PhysicsEngine(CELESTIAL_BODIES);

    this.bodies = {};
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
    this.initStarfield();
    this.initPlanetMarkers();
    this.initEvents();
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

    // Inner Coronal Glow
    const innerGlowGeo = new THREE.SphereGeometry(1.12, 48, 48);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffb733,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    innerGlow.scale.set(radius, radius, radius);
    group.add(innerGlow);

    // Outer Coronal Atmosphere Haze
    const outerGlowGeo = new THREE.SphereGeometry(1.3, 48, 48);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff7700,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false
    });
    const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    outerGlow.scale.set(radius, radius, radius);
    group.add(outerGlow);

    // Radiant Solar Flare Sprite (maintains brilliant solar visibility at any zoom level)
    const sunGlowCanvas = document.createElement('canvas');
    sunGlowCanvas.width = 128;
    sunGlowCanvas.height = 128;
    const gCtx = sunGlowCanvas.getContext('2d');
    const sunGrad = gCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sunGrad.addColorStop(0, 'rgba(255, 235, 180, 0.95)');
    sunGrad.addColorStop(0.2, 'rgba(255, 180, 60, 0.6)');
    sunGrad.addColorStop(0.5, 'rgba(255, 110, 20, 0.2)');
    sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    gCtx.fillStyle = sunGrad;
    gCtx.fillRect(0, 0, 128, 128);

    const sunGlowTex = new THREE.CanvasTexture(sunGlowCanvas);
    const sunSpriteMat = new THREE.SpriteMaterial({
      map: sunGlowTex,
      color: 0xffeedd,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false
    });
    const sunSprite = new THREE.Sprite(sunSpriteMat);
    sunSprite.scale.set(radius * 3.8, radius * 3.8, 1);
    group.add(sunSprite);

    this.scene.add(group);
    this.bodies['sun'] = {
      group,
      mesh: coreMesh,
      innerGlow,
      outerGlow,
      sunSprite,
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

    // Earth specific: Atmospheric cloud layer & Moon
    let cloudsMesh = null;
    let moonGroup = null;
    let moonMesh = null;

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

      // Moon with realistic NASA Lunar Reconnaissance Orbiter texture
      moonGroup = new THREE.Group();
      moonGroup.name = 'moon_group';
      const moonGeo = new THREE.SphereGeometry(radius * config.moon.radiusMultiplier, 32, 32);
      const moonMat = new THREE.MeshStandardMaterial({
        map: this.textures.moon,
        roughness: 0.85,
        metalness: 0.05
      });
      moonMesh = new THREE.Mesh(moonGeo, moonMat);
      moonMesh.userData = { bodyId: 'moon', parentId: 'earth' };
      moonGroup.add(moonMesh);
      this.scene.add(moonGroup);

      // Moon orbital path around Earth
      const moonOrbitPts = [];
      const mDist = config.moon.orbitDistance;
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2;
        moonOrbitPts.push(new THREE.Vector3(mDist * Math.cos(a), 0, mDist * Math.sin(a)));
      }
      const moonOrbitGeo = new THREE.BufferGeometry().setFromPoints(moonOrbitPts);
      const moonOrbitMat = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        fog: false
      });
      this.moonOrbitLine = new THREE.LineLoop(moonOrbitGeo, moonOrbitMat);
      this.scene.add(this.moonOrbitLine);
    }

    // Saturn / Uranus Rings
    let ringMesh = null;
    if (config.hasRings) {
      ringMesh = this.buildRings(key, config);
      mesh.add(ringMesh); // Added directly to mesh so it scales and tilts automatically
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
      moonGroup,
      moonMesh,
      ringMesh,
      config
    };
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

    // Zoom-to-cursor bias when zooming IN and no specific body is locked
    if (clampedDy < 0 && !this.selectedBodyId) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersection = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(plane, intersection)) {
        // Nudge controls target toward cursor intersection point
        const pull = 0.06;
        this.controls.target.lerp(intersection, pull);
      }
    } else if (clampedDy > 0 && !this.selectedBodyId && this.targetZoomDist > 300) {
      // Gently bias back toward Sun center (0, 0, 0) as user zooms out to overview
      this.controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
    }
  }

  checkHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hitTargets = [];
    for (const body of Object.values(this.bodies)) {
      hitTargets.push(body.mesh);
      if (body.moonMesh) hitTargets.push(body.moonMesh);
    }

    const intersects = this.raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const bodyId = hit.userData.bodyId === 'moon' ? 'earth' : hit.userData.bodyId;

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
    // Reset previous hovered line
    if (this.hoveredBodyId && this.orbitLines[this.hoveredBodyId]) {
      const isSelected = this.selectedBodyId === this.hoveredBodyId;
      this.orbitLines[this.hoveredBodyId].material.opacity = isSelected ? 1.0 : 0.75;
      this.orbitLines[this.hoveredBodyId].material.color.set(isSelected ? 0xffffff : (this.bodies[this.hoveredBodyId].config.orbitColor || 0x666666));
    }

    this.hoveredBodyId = bodyId;

    // Highlight new hovered line
    if (bodyId && this.orbitLines[bodyId]) {
      this.orbitLines[bodyId].material.opacity = 1.0;
      this.orbitLines[bodyId].material.color.set(0xffffff);
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
      if (body.moonMesh) hitTargets.push(body.moonMesh);
    }

    const intersects = this.raycaster.intersectObjects(hitTargets, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const targetId = hit.userData.bodyId === 'moon' ? 'earth' : hit.userData.bodyId;
      this.focusBody(targetId);
    } else {
      // If clicked empty space while focusing a body, reset
      if (this.selectedBodyId) {
        this.resetCameraView();
      }
    }
  }

  /**
   * Programmatic smooth camera tween towards celestial body
   */
  focusBody(bodyId) {
    if (!this.bodies[bodyId]) return;

    // Reset previous selected orbit line
    if (this.selectedBodyId && this.orbitLines[this.selectedBodyId]) {
      this.orbitLines[this.selectedBodyId].material.opacity = 0.75;
      this.orbitLines[this.selectedBodyId].material.color.set(this.bodies[this.selectedBodyId].config.orbitColor || 0x666666);
    }

    this.selectedBodyId = bodyId;

    // Highlight selected body orbit
    if (this.orbitLines[bodyId]) {
      this.orbitLines[bodyId].material.opacity = 1.0;
      this.orbitLines[bodyId].material.color.set(0xffffff);
    }

    const body = this.bodies[bodyId];
    const targetPos = body.group.position.clone();
    const { radius } = this.physics.getBodyDimensions(bodyId);

    // Calculate ideal camera viewing offset
    const viewDist = Math.max(radius * 4.5, 9.0);
    const cameraEnd = new THREE.Vector3(
      targetPos.x + viewDist * 0.7,
      targetPos.y + viewDist * 0.45,
      targetPos.z + viewDist * 0.8
    );

    this.startCameraTween(cameraEnd, targetPos);

    if (this.onSelectBody) {
      this.onSelectBody(bodyId);
    }
  }

  /**
   * Reset camera to zoomed-out solar top-down / isometric perspective
   */
  resetCameraView() {
    if (this.selectedBodyId && this.orbitLines[this.selectedBodyId]) {
      this.orbitLines[this.selectedBodyId].material.opacity = 0.75;
      this.orbitLines[this.selectedBodyId].material.color.set(this.bodies[this.selectedBodyId].config.orbitColor || 0x666666);
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
        // Sun dynamic coronal pulse and radiant lens flare
        const pulse = 1.0 + Math.sin(now * 0.002) * 0.02;
        body.innerGlow.scale.set(radius * 1.12 * pulse, radius * 1.12 * pulse, radius * 1.12 * pulse);
        const outerPulse = 1.0 + Math.cos(now * 0.0015) * 0.035;
        body.outerGlow.scale.set(radius * 1.3 * outerPulse, radius * 1.3 * outerPulse, radius * 1.3 * outerPulse);
        body.mesh.scale.set(radius, radius, radius);
        if (body.sunSprite) {
          body.sunSprite.scale.set(radius * 3.8 * pulse, radius * 3.8 * pulse, 1);
        }

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

      // Moon position and orbit line relative to Earth
      if (body.moonGroup && body.config.moon) {
        const moonPos = this.physics.calculateMoonPosition(pos, body.config.moon);
        body.moonGroup.position.set(moonPos.x, moonPos.y, moonPos.z);
        body.moonMesh.rotation.y = this.physics.calculateAxialRotation('earth') * 0.3;

        if (this.moonOrbitLine) {
          this.moonOrbitLine.position.set(pos.x, pos.y, pos.z);
        }
      }
    }

    // 5. Update 2D screen positions of all planetary locator markers
    this.updatePlanetMarkers();

    // 6. Camera target tracking if a body is selected
    if (this.selectedBodyId && !this.isTransitioningCamera) {
      const targetBody = this.bodies[this.selectedBodyId];
      if (targetBody) {
        const targetPos = targetBody.group.position;
        // Keep camera offset relative to the moving planet
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
