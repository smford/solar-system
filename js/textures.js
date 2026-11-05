/**
 * HELIOS Procedural Celestial Texture Generators
 * Pure HTML5 Canvas-driven procedural surface generators.
 * Zero external asset dependencies, zero HTTP 404s, high resolution, crisp vectors.
 */
import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Helper to create an offscreen canvas
   */
  static createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  /**
   * Sun Texture
   */
  static createSunTexture(width = 1024, height = 512) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Base fiery gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#ff9922');
    grad.addColorStop(0.3, '#ffcc44');
    grad.addColorStop(0.5, '#ffee88');
    grad.addColorStop(0.7, '#ffaa22');
    grad.addColorStop(1, '#ff7700');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Procedural solar granules & flares
    ctx.fillStyle = 'rgba(255, 240, 180, 0.15)';
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 8 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Solar prominence streaks
    ctx.strokeStyle = 'rgba(255, 120, 20, 0.2)';
    ctx.lineWidth = 4;
    for (let i = 0; i < 100; i++) {
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.3, y + (Math.random() - 0.5) * 50, width * 0.7, y + (Math.random() - 0.5) * 50, width, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Mercury Texture (Basalt, craters, silicate highlands)
   */
  static createMercuryTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#7a7672';
    ctx.fillRect(0, 0, width, height);

    // Darker maria patches
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 40 + 10;
      ctx.fillStyle = 'rgba(70, 68, 66, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Craters with rims
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 6 + 1.5;

      ctx.fillStyle = 'rgba(40, 39, 38, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(180, 178, 175, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Venus Texture (Swirling dense sulfuric atmosphere)
   */
  static createVenusTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#caa36c');
    grad.addColorStop(0.3, '#dfc18b');
    grad.addColorStop(0.5, '#e8cd9c');
    grad.addColorStop(0.8, '#d4ae75');
    grad.addColorStop(1, '#b58c55');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Swirling atmospheric bands
    ctx.fillStyle = 'rgba(245, 230, 195, 0.15)';
    for (let i = 0; i < 35; i++) {
      const y = (i / 35) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(width * 0.25, y + Math.sin(i) * 15, width * 0.75, y - Math.sin(i) * 15, width, y);
      ctx.lineTo(width, y + 10);
      ctx.lineTo(0, y + 10);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Earth Texture (Continents, oceans, shallow shelves)
   */
  static createEarthTexture(width = 1024, height = 512) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Deep ocean base
    ctx.fillStyle = '#153258';
    ctx.fillRect(0, 0, width, height);

    // Shallow ocean shelves
    ctx.fillStyle = 'rgba(30, 85, 130, 0.4)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = height * 0.2 + Math.random() * (height * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 80 + 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Continents
    const landColors = ['#2d572c', '#3e6b34', '#667744', '#7d6b49', '#91825d'];
    const drawLandmass = (cx, cy, rx, ry, seedCount) => {
      ctx.fillStyle = landColors[Math.floor(Math.random() * landColors.length)];
      for (let i = 0; i < seedCount; i++) {
        const ox = cx + (Math.random() - 0.5) * rx * 2;
        const oy = cy + (Math.random() - 0.5) * ry * 2;
        const r = Math.random() * (rx * 0.4) + 10;
        ctx.beginPath();
        ctx.arc(ox, oy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Major continental approximations
    drawLandmass(width * 0.25, height * 0.35, width * 0.12, height * 0.18, 50); // North America
    drawLandmass(width * 0.32, height * 0.68, width * 0.08, height * 0.20, 40); // South America
    drawLandmass(width * 0.55, height * 0.32, width * 0.14, height * 0.16, 55); // Europe/West Asia
    drawLandmass(width * 0.54, height * 0.58, width * 0.10, height * 0.22, 45); // Africa
    drawLandmass(width * 0.75, height * 0.38, width * 0.16, height * 0.20, 60); // East Asia
    drawLandmass(width * 0.82, height * 0.72, width * 0.08, height * 0.12, 30); // Australia

    // Polar ice caps
    ctx.fillStyle = '#edf2f7';
    // North pole
    ctx.beginPath();
    ctx.ellipse(width * 0.5, 0, width * 0.5, height * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();
    // South pole (Antarctica)
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height, width * 0.5, height * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Earth Cloud Overlay Texture (Transparent alpha)
   */
  static createEarthCloudsTexture(width = 1024, height = 512) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    // Wispy swirling cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    for (let i = 0; i < 70; i++) {
      const y = (i / 70) * height;
      const wave = Math.sin(i * 0.3) * 20;
      ctx.beginPath();
      ctx.ellipse(Math.random() * width, y + wave, Math.random() * 90 + 30, Math.random() * 20 + 8, Math.random() * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cyclone vortexes
    for (let i = 0; i < 4; i++) {
      const cx = Math.random() * width;
      const cy = height * 0.25 + Math.random() * (height * 0.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 1.5);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Moon Texture (Craters, maria)
   */
  static createMoonTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#9e9e9e';
    ctx.fillRect(0, 0, width, height);

    // Lunar Maria (Dark basaltic plains)
    ctx.fillStyle = 'rgba(80, 80, 80, 0.35)';
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 50 + 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 5 + 1;
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(220, 220, 220, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Mars Texture (Rust-red, basalt volcanic plains, polar caps)
   */
  static createMarsTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#c75a2d');
    grad.addColorStop(0.5, '#b94921');
    grad.addColorStop(1, '#a63815');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Dark volcanic provinces (Syrtis Major, Acidalia Planitia)
    ctx.fillStyle = 'rgba(65, 30, 20, 0.35)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = height * 0.25 + Math.random() * (height * 0.5);
      ctx.beginPath();
      ctx.ellipse(x, y, Math.random() * 60 + 20, Math.random() * 30 + 10, Math.random() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 4 + 1;
      ctx.fillStyle = 'rgba(50, 20, 10, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Polar caps (CO2 and water ice)
    ctx.fillStyle = '#f0f3f6';
    ctx.beginPath();
    ctx.ellipse(width * 0.5, 0, width * 0.25, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width * 0.5, height, width * 0.2, height * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Jupiter Texture (Atmospheric bands, turbulent ripples, Great Red Spot)
   */
  static createJupiterTexture(width = 1024, height = 512) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bands = [
      '#d4b38d', '#a87850', '#edd3b1', '#9e623c', '#e6cfaf',
      '#b6835d', '#d9b897', '#8e5230', '#eed9be', '#a6724b'
    ];

    const sliceHeight = height / bands.length;
    for (let i = 0; i < bands.length; i++) {
      ctx.fillStyle = bands[i];
      ctx.fillRect(0, i * sliceHeight, width, sliceHeight);

      // Micro-bands & turbulent eddies
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      for (let j = 0; j < 6; j++) {
        const y = i * sliceHeight + (j / 6) * sliceHeight;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < width; x += 40) {
          ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 3);
        }
        ctx.lineTo(width, y);
        ctx.lineTo(width, y + 4);
        ctx.lineTo(0, y + 4);
        ctx.fill();
      }
    }

    // The Great Red Spot (Southern hemisphere)
    const grsX = width * 0.65;
    const grsY = height * 0.64;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 5, grsX, grsY, 35);
    grsGrad.addColorStop(0, '#c34125');
    grsGrad.addColorStop(0.7, '#a9321b');
    grsGrad.addColorStop(1, 'rgba(169, 50, 27, 0)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 48, 26, -0.05, 0, Math.PI * 2);
    ctx.fill();

    // Red spot internal counter-swirl
    ctx.strokeStyle = 'rgba(240, 200, 180, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 30, 16, 0, 0, Math.PI * 1.7);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Saturn Texture (Subtle golden-amber gas bands)
   */
  static createSaturnTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#a59374');
    grad.addColorStop(0.2, '#c9b794');
    grad.addColorStop(0.4, '#e2d4b6');
    grad.addColorStop(0.5, '#eddcb9');
    grad.addColorStop(0.7, '#d6be95');
    grad.addColorStop(0.9, '#baa37e');
    grad.addColorStop(1, '#968465');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle atmospheric stripes
    for (let i = 0; i < 40; i++) {
      const y = (i / 40) * height;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(100, 80, 50, 0.08)';
      ctx.fillRect(0, y, width, height / 40);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Saturn Rings Texture (Radial gradient with Cassini Division & translucency)
   */
  static createSaturnRingTexture(size = 512) {
    const canvas = this.createCanvas(size, 1);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, size, 0);
    // Inner C Ring (Faint)
    grad.addColorStop(0.0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.08, 'rgba(160, 140, 110, 0.25)');
    // B Ring (Dense, brightest)
    grad.addColorStop(0.25, 'rgba(215, 195, 160, 0.85)');
    grad.addColorStop(0.55, 'rgba(230, 210, 175, 0.95)');
    // Cassini Division (Clear gap!)
    grad.addColorStop(0.58, 'rgba(0, 0, 0, 0.02)');
    grad.addColorStop(0.64, 'rgba(0, 0, 0, 0.02)');
    // A Ring (Medium brightness)
    grad.addColorStop(0.67, 'rgba(195, 175, 140, 0.75)');
    grad.addColorStop(0.85, 'rgba(180, 160, 130, 0.65)');
    // Encke gap and outer edge
    grad.addColorStop(0.92, 'rgba(150, 130, 105, 0.2)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Uranus Texture (Soft aquamarine cyan)
   */
  static createUranusTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#5ea8ad');
    grad.addColorStop(0.3, '#75bec3');
    grad.addColorStop(0.5, '#84cbcf');
    grad.addColorStop(0.8, '#6fb5ba');
    grad.addColorStop(1, '#50959a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle faint bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let i = 0; i < 20; i++) {
      ctx.fillRect(0, (i / 20) * height, width, 5);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Neptune Texture (Deep azure blue with cirrus methane bands)
   */
  static createNeptuneTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#1c3468');
    grad.addColorStop(0.3, '#244585');
    grad.addColorStop(0.5, '#2e55a3');
    grad.addColorStop(0.8, '#22407d');
    grad.addColorStop(1, '#152750');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // High altitude methane clouds (Cirrus streaks)
    ctx.fillStyle = 'rgba(180, 220, 255, 0.25)';
    for (let i = 0; i < 15; i++) {
      const y = (i / 15) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width * 0.4, y + 6);
      ctx.lineTo(width * 0.8, y - 4);
      ctx.lineTo(width, y + 2);
      ctx.lineTo(width, y + 5);
      ctx.lineTo(0, y + 5);
      ctx.fill();
    }

    // Great Dark Spot
    ctx.fillStyle = 'rgba(10, 20, 45, 0.4)';
    ctx.beginPath();
    ctx.ellipse(width * 0.4, height * 0.55, 30, 15, 0.1, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Io Texture (Vivid sulfur yellows, oranges, and volcanic calderas)
   */
  static createIoTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Base mottled sulfur field
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#eab308');
    grad.addColorStop(0.3, '#f59e0b');
    grad.addColorStop(0.7, '#d97706');
    grad.addColorStop(1, '#ca8a04');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Sulfur patches & silicate plains
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 35 + 10;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.35)' : 'rgba(234, 88, 12, 0.25)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Volcanic calderas (dark pits with red/black halos like Pele & Loki)
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 8 + 3;

      // Sulfur fallout ring
      ctx.strokeStyle = 'rgba(185, 28, 28, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
      ctx.stroke();

      // Dark volcanic pit
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Europa Texture (Icy white-blue with reddish linear fractures)
   */
  static createEuropaTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Pristine water-ice crust
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.5, '#f0f9ff');
    grad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle mottled ice plains
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = 'rgba(186, 230, 253, 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 50 + 15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Global crisscrossing tectonic lineae (fractures)
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
    for (let i = 0; i < 35; i++) {
      ctx.lineWidth = Math.random() * 2.5 + 0.8;
      ctx.beginPath();
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + (Math.random() - 0.5) * 150,
        startY + (Math.random() - 0.5) * 100,
        startX + (Math.random() - 0.5) * 200,
        startY + (Math.random() - 0.5) * 120,
        (startX + Math.random() * 300) % width,
        (startY + Math.random() * 200) % height
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Ganymede Texture (Grooved slate-grey terrain and bright crater rays)
   */
  static createGanymedeTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Ancient dark furrowed terrain
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 0, width, height);

    // Lighter grooved terrain patches
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 45 + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact craters and bright ray systems
    for (let i = 0; i < 50; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const cr = Math.random() * 6 + 1.5;

      // White crater rays
      if (i < 8) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 6; r++) {
          const ang = (r / 6) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * 45, cy + Math.sin(ang) * 45);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Callisto Texture (Dark heavily cratered ice-rock surface)
   */
  static createCallistoTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Ancient dark carbonaceous ice-rock
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, width, height);

    // Heavy cratering with bright ice rims
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 5 + 1;

      ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Bright frost-rimmed edge
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x + 0.3, y + 0.3, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Titan Texture (Dense golden-orange smog atmosphere)
   */
  static createTitanTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Deep hydrocarbon atmospheric gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#b45309');
    grad.addColorStop(0.25, '#d97706');
    grad.addColorStop(0.5, '#f59e0b');
    grad.addColorStop(0.75, '#d97706');
    grad.addColorStop(1, '#92400e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle atmospheric haze bands
    ctx.fillStyle = 'rgba(254, 215, 170, 0.15)';
    for (let i = 0; i < 16; i++) {
      ctx.fillRect(0, (i / 16) * height, width, 6);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Enceladus Texture (Reflective brilliant white ice with cyan tiger stripes)
   */
  static createEnceladusTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 99% albedo pure fresh ice
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle soft ice shadows
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      ctx.fillStyle = 'rgba(224, 242, 254, 0.35)';
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 30 + 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // South polar "Tiger Stripe" cryovolcanic fissures
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const sy = height * 0.82 + i * 5;
      ctx.beginPath();
      ctx.moveTo(width * 0.3, sy);
      ctx.bezierCurveTo(width * 0.45, sy - 4, width * 0.55, sy + 4, width * 0.7, sy);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  /**
   * Triton Texture (Pastel nitrogen blue-pink cantaloupe terrain)
   */
  static createTritonTexture(width = 512, height = 256) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Frozen nitrogen and methane ice gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#c4b5fd');
    grad.addColorStop(0.3, '#ddd6fe');
    grad.addColorStop(0.6, '#fce7f3');
    grad.addColorStop(1, '#e0e7ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Cantaloupe terrain dimples
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = Math.random() * 12 + 4;
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cryogeyser dark plumes
    ctx.fillStyle = 'rgba(76, 29, 149, 0.3)';
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * width;
      const y = height * 0.65 + Math.random() * (height * 0.25);
      ctx.fillRect(x, y, 2, 8);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
}

export class TextureManager {
  static loadAllTextures(onProgress, onError) {
    const loader = new THREE.TextureLoader();

    const paths = {
      sun: 'assets/textures/sun.jpg',
      mercury: 'assets/textures/mercury.jpg',
      venus: 'assets/textures/venus.jpg',
      earth: 'assets/textures/earth.jpg',
      earthClouds: 'assets/textures/earth_clouds.jpg',
      moon: 'assets/textures/moon.jpg',
      mars: 'assets/textures/mars.jpg',
      jupiter: 'assets/textures/jupiter.jpg',
      saturn: 'assets/textures/saturn.jpg',
      saturnRings: 'assets/textures/saturn_ring.png',
      uranus: 'assets/textures/uranus.jpg',
      neptune: 'assets/textures/neptune.jpg',
      milkyway: 'assets/textures/milkyway.jpg'
    };

    const fallbacks = {
      sun: () => TextureGenerator.createSunTexture(),
      mercury: () => TextureGenerator.createMercuryTexture(),
      venus: () => TextureGenerator.createVenusTexture(),
      earth: () => TextureGenerator.createEarthTexture(),
      earthClouds: () => TextureGenerator.createEarthCloudsTexture(),
      moon: () => TextureGenerator.createMoonTexture(),
      mars: () => TextureGenerator.createMarsTexture(),
      jupiter: () => TextureGenerator.createJupiterTexture(),
      saturn: () => TextureGenerator.createSaturnTexture(),
      saturnRings: () => TextureGenerator.createSaturnRingTexture(),
      uranus: () => TextureGenerator.createUranusTexture(),
      neptune: () => TextureGenerator.createNeptuneTexture(),
      milkyway: () => null
    };

    const textures = {
      io: TextureGenerator.createIoTexture(),
      europa: TextureGenerator.createEuropaTexture(),
      ganymede: TextureGenerator.createGanymedeTexture(),
      callisto: TextureGenerator.createCallistoTexture(),
      titan: TextureGenerator.createTitanTexture(),
      enceladus: TextureGenerator.createEnceladusTexture(),
      triton: TextureGenerator.createTritonTexture()
    };

    for (const [key, path] of Object.entries(paths)) {
      textures[key] = loader.load(
        path,
        (loadedTex) => {
          loadedTex.colorSpace = THREE.SRGBColorSpace;
          loadedTex.needsUpdate = true;
          if (onProgress) onProgress(key, loadedTex);
        },
        undefined,
        (err) => {
          console.warn(`NASA texture ${path} not loaded. Using procedural fallback.`);
          if (fallbacks[key]) {
            textures[key] = fallbacks[key]();
          }
          if (onError) onError(key, err);
        }
      );
      textures[key].colorSpace = THREE.SRGBColorSpace;
    }

    return textures;
  }
}
