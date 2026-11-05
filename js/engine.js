/**
 * HELIOS 3D Graphics & Simulation Engine
 * Three.js scene, NASA photographic textures, lighting, starfield, meshes, orbits, and render loop.
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
    this.initEvents();
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020204);
    this.scene.fog = new THREE.FogExp2(0x020204, 0.00018);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Camera initialized to zoomed-out view showing all planetary orbits out to Neptune
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 30000);
    this.camera.position.set(APP_CONFIG.defaultCameraPos.x, APP_CONFIG.defaultCameraPos.y, APP_CONFIG.defaultCameraPos.z);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 3.0;
    this.controls.maxDistance = 15000;
    this.controls.maxPolarAngle = Math.PI * 0.88; // Don't flip under
  }

  initLighting() {
    // Primary central point light emitted from Sun
    this.sunLight = new THREE.PointLight(0xfff8ee, 4.2, 0, 0.035);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // Deep-space subtle ambient fill so dark sides of planets remain distinct and readable
    const ambientLight = new THREE.AmbientLight(0x182030, 0.55);
    this.scene.add(ambientLight);
  }

  initStarfield() {
    // 1. Deep space celestial background sphere with NASA Milky Way panorama
    if (this.textures && this.textures.milkyway) {
      const skyGeo = new THREE.SphereGeometry(7500, 32, 32);
      const skyMat = new THREE.MeshBasicMaterial({
        map: this.textures.milkyway,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.42,
        depthWrite: false
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
      const radius = 2800 + Math.random() * 4500;
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
      depthWrite: false
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
    const sphereGeo = new THREE.SphereGeometry(radius, 64, 64);
    const sphereMat = new THREE.MeshBasicMaterial({
      map: this.textures.sun,
      color: 0xfff6dd
    });
    const coreMesh = new THREE.Mesh(sphereGeo, sphereMat);
    coreMesh.userData = { bodyId: 'sun' };
    group.add(coreMesh);

    // Inner Coronal Glow
    const innerGlowGeo = new THREE.SphereGeometry(radius * 1.08, 48, 48);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xffaa22,
      transparent: true,
      opacity: 0.38,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    const innerGlow = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    group.add(innerGlow);

    // Outer Coronal Atmosphere Haze
    const outerGlowGeo = new THREE.SphereGeometry(radius * 1.25, 48, 48);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    const outerGlow = new THREE.Mesh(outerGlowGeo, outerGlowMat);
    group.add(outerGlow);

    this.scene.add(group);
    this.bodies['sun'] = {
      group,
      mesh: coreMesh,
      innerGlow,
      outerGlow,
      config
    };
  }

  buildPlanet(key, config) {
    const group = new THREE.Group();
    group.name = `${key}_group`;

    const { radius } = this.physics.getBodyDimensions(key);

    // Planet body mesh with realistic NASA surface texture
    const sphereGeo = new THREE.SphereGeometry(1, 64, 64); // Scaled dynamically in update
    const material = new THREE.MeshStandardMaterial({
      map: this.textures[key],
      roughness: key === 'earth' ? 0.38 : (key === 'venus' ? 0.85 : 0.72),
      metalness: 0.05
    });

    const mesh = new THREE.Mesh(sphereGeo, material);
    mesh.scale.set(radius, radius, radius);
    mesh.rotation.z = THREE.MathUtils.degToRad(config.axialTilt || 0);
    mesh.userData = { bodyId: key };
    group.add(mesh);

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
        roughness: 0.88,
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
        color: 0x90a4ae,
        transparent: true,
        opacity: 0.35,
        depthWrite: false
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

    // Vector Planetary Orbit Line (clearly drawn and visible)
    const orbitLine = this.buildOrbitLine(key, config);
    this.scene.add(orbitLine);
    this.orbitLines[key] = orbitLine;

    this.scene.add(group);

    this.bodies[key] = {
      group,
      mesh,
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
      opacity: ringCfg.subtle ? 0.4 : 0.95,
      roughness: 0.55
    });

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    return ringMesh;
  }

  /**
   * Draw crisp, clearly visible vector orbit lines for each planet
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
      opacity: 0.48, // Clearly visible across entire solar system
      depthWrite: false
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

  initEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Raycast hover & click
    const dom = this.renderer.domElement;
    dom.addEventListener('mousemove', (e) => this.onMouseMove(e));
    dom.addEventListener('click', (e) => this.onClick(e));

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
      this.orbitLines[this.hoveredBodyId].material.opacity = isSelected ? 0.95 : 0.48;
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
      this.orbitLines[this.selectedBodyId].material.opacity = 0.48;
      this.orbitLines[this.selectedBodyId].material.color.set(this.bodies[this.selectedBodyId].config.orbitColor || 0x666666);
    }

    this.selectedBodyId = bodyId;

    // Highlight selected body orbit
    if (this.orbitLines[bodyId]) {
      this.orbitLines[bodyId].material.opacity = 0.95;
      this.orbitLines[bodyId].material.color.set(0xffffff);
    }

    const body = this.bodies[bodyId];
    const targetPos = body.group.position.clone();
    const { radius } = this.physics.getBodyDimensions(bodyId);

    // Calculate ideal camera viewing offset
    const viewDist = Math.max(radius * 4.2, 8.0);
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
      this.orbitLines[this.selectedBodyId].material.opacity = 0.48;
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

    // 3. Update planetary positions, axial spins, and dynamic scales
    for (const [key, body] of Object.entries(this.bodies)) {
      const { radius } = this.physics.getBodyDimensions(key);

      // Dynamic scale update for Exploration vs True scale transition
      body.mesh.scale.set(radius, radius, radius);

      if (key === 'sun') {
        // Sun dynamic coronal pulse
        const pulse = 1.0 + Math.sin(now * 0.002) * 0.02;
        body.innerGlow.scale.set(pulse, pulse, pulse);
        const outerPulse = 1.0 + Math.cos(now * 0.0015) * 0.035;
        body.outerGlow.scale.set(outerPulse, outerPulse, outerPulse);

        // Sun axial spin
        body.mesh.rotation.y = this.physics.calculateAxialRotation('sun');
        continue;
      }

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

    // 4. Camera target tracking if a body is selected
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

    // 5. Camera transition interpolation
    this.updateCameraTween(deltaSeconds);

    // 6. Update orbit controls and render
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
