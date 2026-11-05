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
   * Earth Night-side City Lights (NASA Black Marble Effect)
   * High-fidelity planetary night map with authentic global city light concentrations
   * and glowing transportation corridors.
   */
  static createEarthNightTexture(width = 1024, height = 512) {
    const canvas = this.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Deep space-black base (oceans, polar ice, unpopulated expanses)
    ctx.fillStyle = '#020306';
    ctx.fillRect(0, 0, width, height);

    // Geographic coordinate mapper (equirectangular projection)
    const toX = (lon) => ((lon + 180) / 360) * width;
    const toY = (lat) => ((90 - lat) / 180) * height;

    // 1. Glowing city hub (incandescent core + warm golden-amber halo)
    const drawCityHub = (lon, lat, coreR, haloR, intensity = 1.0) => {
      const cx = toX(lon);
      const cy = toY(lat);

      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
      halo.addColorStop(0, `rgba(255, 195, 95, ${0.55 * intensity})`);
      halo.addColorStop(0.35, `rgba(235, 155, 60, ${0.3 * intensity})`);
      halo.addColorStop(0.7, `rgba(200, 115, 30, ${0.12 * intensity})`);
      halo.addColorStop(1, 'rgba(160, 80, 20, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, `rgba(255, 252, 230, ${0.98 * intensity})`);
      core.addColorStop(0.3, `rgba(255, 230, 160, ${0.88 * intensity})`);
      core.addColorStop(0.7, `rgba(255, 190, 95, ${0.65 * intensity})`);
      core.addColorStop(1, 'rgba(255, 160, 60, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
    };

    // 2. Suburban & regional point-cluster noise
    const drawCluster = (lon, lat, spreadLon, spreadLat, count, intensity = 0.8) => {
      for (let i = 0; i < count; i++) {
        const u1 = Math.random();
        const u2 = Math.random();
        const rNorm = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * 0.45;
        const theta = 2.0 * Math.PI * u2;
        const dLon = rNorm * Math.cos(theta) * spreadLon;
        const dLat = rNorm * Math.sin(theta) * spreadLat;
        const cx = toX(lon + dLon);
        const cy = toY(lat + dLat);
        const r = Math.random() * 1.5 + 0.4;
        const alpha = (Math.random() * 0.45 + 0.35) * intensity;
        ctx.fillStyle = Math.random() > 0.35
          ? `rgba(255, 230, 160, ${alpha})`
          : `rgba(255, 190, 95, ${alpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // 3. Network branching / highway corridor
    const drawArtery = (lon1, lat1, lon2, lat2, segments = 6, jitter = 0.2, alpha = 0.4) => {
      const x1 = toX(lon1);
      const y1 = toY(lat1);
      const x2 = toX(lon2);
      const y2 = toY(lat2);

      ctx.strokeStyle = `rgba(255, 205, 120, ${alpha * 0.5})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x1, y1);

      for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const jx = Math.sin(i * 1.8) * jitter * (width / 360);
        const jy = Math.cos(i * 2.2) * jitter * (height / 180);
        const nx = x1 + (x2 - x1) * t + jx;
        const ny = y1 + (y2 - y1) * t + jy;
        ctx.lineTo(nx, ny);
        if (Math.random() > 0.4) {
          ctx.fillStyle = `rgba(255, 220, 140, ${alpha * 0.75})`;
          ctx.fillRect(nx - 0.5, ny - 0.5, 1.2, 1.2);
        }
      }
      ctx.stroke();
    };

    // 4. Ribbon strip (Nile river, coastlines)
    const drawRibbon = (points, widthPx = 1.6, alpha = 0.75) => {
      ctx.strokeStyle = `rgba(255, 225, 140, ${alpha})`;
      ctx.lineWidth = widthPx;
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const px = toX(points[i][0]);
        const py = toY(points[i][1]);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };

    // --- NORTH AMERICA ---
    // US Northeast Corridor (Bos-Wash Megalopolis)
    drawCluster(-74.0, 40.7, 4.5, 3.0, 320, 1.0);
    drawCityHub(-74.0, 40.71, 3.8, 11.0, 1.0); // NYC
    drawCityHub(-71.06, 42.36, 2.6, 7.5, 0.9); // Boston
    drawCityHub(-75.16, 39.95, 2.8, 8.0, 0.9); // Philadelphia
    drawCityHub(-76.61, 39.29, 2.3, 6.5, 0.85); // Baltimore
    drawCityHub(-77.04, 38.90, 2.7, 8.0, 0.95); // Washington DC
    drawArtery(-71.06, 42.36, -74.0, 40.71, 5, 0.1, 0.6);
    drawArtery(-74.0, 40.71, -75.16, 39.95, 4, 0.1, 0.6);
    drawArtery(-75.16, 39.95, -76.61, 39.29, 4, 0.1, 0.6);
    drawArtery(-76.61, 39.29, -77.04, 38.90, 3, 0.1, 0.6);

    // Chicago & Great Lakes / Midwest
    drawCluster(-87.6, 41.88, 5.0, 3.5, 280, 0.95);
    drawCityHub(-87.63, 41.88, 3.5, 10.0, 1.0); // Chicago
    drawCityHub(-83.05, 42.33, 2.5, 7.0, 0.85); // Detroit
    drawCityHub(-81.69, 41.50, 2.3, 6.5, 0.8); // Cleveland
    drawCityHub(-86.16, 39.77, 2.2, 6.0, 0.8); // Indianapolis
    drawCityHub(-83.00, 39.96, 2.1, 5.5, 0.8); // Columbus
    drawCityHub(-90.20, 38.63, 2.2, 6.0, 0.8); // St. Louis
    drawCityHub(-93.26, 44.98, 2.3, 6.5, 0.85); // Minneapolis
    drawCityHub(-80.00, 40.44, 2.2, 6.0, 0.8); // Pittsburgh
    drawCityHub(-79.38, 43.65, 2.8, 8.0, 0.9); // Toronto
    drawCityHub(-73.57, 45.50, 2.5, 7.0, 0.85); // Montreal
    drawArtery(-87.63, 41.88, -83.05, 42.33, 6, 0.2, 0.5);
    drawArtery(-83.05, 42.33, -81.69, 41.50, 4, 0.15, 0.5);
    drawArtery(-81.69, 41.50, -80.00, 40.44, 4, 0.15, 0.5);
    drawArtery(-80.00, 40.44, -75.16, 39.95, 6, 0.2, 0.5);
    drawArtery(-87.63, 41.88, -86.16, 39.77, 4, 0.15, 0.5);
    drawArtery(-87.63, 41.88, -90.20, 38.63, 5, 0.2, 0.5);

    // Texas Triangle
    drawCluster(-96.8, 31.0, 3.5, 3.0, 190, 0.9);
    drawCityHub(-96.80, 32.78, 3.0, 8.5, 0.95); // Dallas-Fort Worth
    drawCityHub(-95.37, 29.76, 3.1, 9.0, 0.95); // Houston
    drawCityHub(-97.74, 30.27, 2.2, 6.0, 0.85); // Austin
    drawCityHub(-98.49, 29.42, 2.3, 6.5, 0.85); // San Antonio
    drawArtery(-96.80, 32.78, -95.37, 29.76, 5, 0.15, 0.5);
    drawArtery(-96.80, 32.78, -97.74, 30.27, 4, 0.15, 0.5);
    drawArtery(-97.74, 30.27, -98.49, 29.42, 3, 0.1, 0.5);
    drawArtery(-98.49, 29.42, -95.37, 29.76, 4, 0.15, 0.5);

    // US West Coast California Corridor & Pacific Northwest
    drawCluster(-118.24, 34.05, 2.5, 2.0, 240, 1.0);
    drawCityHub(-118.24, 34.05, 3.8, 11.5, 1.0); // Los Angeles
    drawCityHub(-117.16, 32.72, 2.5, 7.0, 0.9); // San Diego
    drawCityHub(-122.42, 37.77, 3.2, 9.5, 0.95); // San Francisco / Bay Area
    drawCityHub(-121.49, 38.58, 2.0, 5.5, 0.8); // Sacramento
    drawCityHub(-122.33, 47.61, 2.7, 7.5, 0.9); // Seattle
    drawCityHub(-122.68, 45.52, 2.2, 6.0, 0.85); // Portland
    drawCityHub(-112.07, 33.45, 2.6, 7.5, 0.9); // Phoenix
    drawCityHub(-115.14, 36.17, 2.4, 7.0, 0.95); // Las Vegas
    drawCityHub(-104.99, 39.74, 2.4, 7.0, 0.85); // Denver
    drawCityHub(-111.89, 40.76, 2.0, 5.5, 0.8); // Salt Lake City
    drawArtery(-118.24, 34.05, -117.16, 32.72, 3, 0.1, 0.6);
    drawArtery(-118.24, 34.05, -122.42, 37.77, 6, 0.2, 0.5);
    drawArtery(-122.42, 37.77, -121.49, 38.58, 3, 0.1, 0.5);
    drawArtery(-122.68, 45.52, -122.33, 47.61, 4, 0.1, 0.55);

    // US Southeast & Florida
    drawCluster(-84.39, 33.75, 3.0, 2.5, 140, 0.85);
    drawCityHub(-84.39, 33.75, 2.8, 8.0, 0.9); // Atlanta
    drawCityHub(-80.84, 35.23, 2.2, 6.0, 0.8); // Charlotte
    drawCityHub(-80.19, 25.76, 2.9, 8.5, 0.95); // Miami
    drawCityHub(-82.45, 27.95, 2.4, 7.0, 0.85); // Tampa
    drawCityHub(-81.38, 28.54, 2.3, 6.5, 0.85); // Orlando
    drawArtery(-82.45, 27.95, -81.38, 28.54, 3, 0.1, 0.5);
    drawArtery(-81.38, 28.54, -80.19, 25.76, 5, 0.1, 0.55);

    // Mexico
    drawCluster(-99.13, 19.43, 3.0, 2.5, 200, 0.9);
    drawCityHub(-99.13, 19.43, 3.4, 10.0, 1.0); // Mexico City
    drawCityHub(-103.35, 20.66, 2.3, 6.5, 0.8); // Guadalajara
    drawCityHub(-100.31, 25.69, 2.4, 7.0, 0.85); // Monterrey

    // --- WESTERN EUROPE & BRITISH ISLES ---
    // Dense glittering European web
    drawCluster(5.0, 50.5, 9.0, 5.0, 600, 1.0);
    drawCityHub(-0.12, 51.51, 3.8, 12.0, 1.0); // London
    drawCityHub(-1.90, 52.48, 2.3, 6.5, 0.85); // Birmingham
    drawCityHub(-2.24, 53.48, 2.5, 7.0, 0.85); // Manchester
    drawCityHub(-1.55, 53.80, 2.1, 5.5, 0.8); // Leeds
    drawCityHub(-4.25, 55.86, 2.1, 5.5, 0.8); // Glasgow
    drawCityHub(-3.19, 55.95, 1.9, 5.0, 0.75); // Edinburgh
    drawCityHub(-6.26, 53.35, 2.2, 6.0, 0.8); // Dublin

    drawCityHub(2.35, 48.86, 3.8, 12.0, 1.0); // Paris
    drawCityHub(4.83, 45.76, 2.2, 6.0, 0.8); // Lyon
    drawCityHub(5.37, 43.30, 2.2, 6.0, 0.8); // Marseille

    // Rhine-Ruhr & Benelux
    drawCityHub(4.35, 50.85, 2.8, 8.0, 0.9); // Brussels
    drawCityHub(4.40, 51.22, 2.3, 6.5, 0.85); // Antwerp
    drawCityHub(4.90, 52.37, 2.7, 7.5, 0.9); // Amsterdam
    drawCityHub(4.48, 51.92, 2.4, 6.8, 0.85); // Rotterdam
    drawCityHub(6.96, 50.94, 2.9, 8.5, 0.95); // Cologne
    drawCityHub(8.68, 50.11, 2.6, 7.5, 0.9); // Frankfurt
    drawCityHub(9.18, 48.78, 2.3, 6.5, 0.85); // Stuttgart
    drawCityHub(11.58, 48.14, 2.6, 7.5, 0.9); // Munich
    drawCityHub(13.40, 52.52, 2.9, 8.5, 0.95); // Berlin
    drawCityHub(10.00, 53.55, 2.5, 7.0, 0.85); // Hamburg

    // Po Valley & Italy
    drawCluster(10.5, 45.0, 4.0, 1.5, 240, 0.95);
    drawCityHub(9.19, 45.46, 3.2, 9.5, 0.95); // Milan
    drawCityHub(7.68, 45.07, 2.3, 6.5, 0.85); // Turin
    drawCityHub(12.33, 45.44, 2.2, 6.0, 0.8); // Venice
    drawCityHub(11.34, 44.49, 2.1, 5.5, 0.8); // Bologna
    drawCityHub(12.50, 41.90, 2.9, 8.5, 0.9); // Rome
    drawCityHub(14.26, 40.85, 2.5, 7.0, 0.85); // Naples

    // Spain & Portugal
    drawCityHub(-3.70, 40.42, 3.1, 9.0, 0.95); // Madrid
    drawCityHub(2.17, 41.39, 2.8, 8.0, 0.9); // Barcelona
    drawCityHub(-0.38, 39.47, 2.2, 6.0, 0.8); // Valencia
    drawCityHub(-9.14, 38.72, 2.5, 7.0, 0.85); // Lisbon

    // Central & Eastern Europe
    drawCityHub(16.37, 48.21, 2.6, 7.5, 0.85); // Vienna
    drawCityHub(14.42, 50.08, 2.3, 6.5, 0.8); // Prague
    drawCityHub(21.01, 52.23, 2.5, 7.0, 0.85); // Warsaw
    drawCityHub(19.04, 47.50, 2.3, 6.5, 0.8); // Budapest
    drawCityHub(37.62, 55.75, 3.3, 10.0, 0.95); // Moscow
    drawCityHub(30.33, 59.93, 2.6, 7.5, 0.85); // St Petersburg

    // Interconnecting European arteries
    drawArtery(-0.12, 51.51, -1.90, 52.48, 4, 0.1, 0.55);
    drawArtery(-1.90, 52.48, -2.24, 53.48, 3, 0.1, 0.55);
    drawArtery(2.35, 48.86, 4.35, 50.85, 5, 0.15, 0.6);
    drawArtery(4.35, 50.85, 4.90, 52.37, 4, 0.1, 0.6);
    drawArtery(4.35, 50.85, 6.96, 50.94, 4, 0.1, 0.6);
    drawArtery(6.96, 50.94, 8.68, 50.11, 4, 0.1, 0.6);
    drawArtery(8.68, 50.11, 9.18, 48.78, 3, 0.1, 0.55);
    drawArtery(9.18, 48.78, 11.58, 48.14, 4, 0.1, 0.55);
    drawArtery(7.68, 45.07, 9.19, 45.46, 3, 0.1, 0.6);
    drawArtery(9.19, 45.46, 12.33, 45.44, 4, 0.1, 0.6);

    // --- EAST ASIA ---
    // Japan (Dense glittering ribbon)
    drawCluster(139.69, 35.69, 4.0, 2.5, 360, 1.0);
    drawCityHub(139.69, 35.69, 4.5, 14.0, 1.0); // Tokyo-Yokohama
    drawCityHub(136.91, 35.18, 2.8, 8.0, 0.9); // Nagoya
    drawCityHub(135.50, 34.69, 3.6, 11.0, 1.0); // Osaka-Kyoto-Kobe
    drawCityHub(130.40, 33.59, 2.4, 7.0, 0.85); // Fukuoka
    drawCityHub(141.35, 43.06, 2.3, 6.5, 0.8); // Sapporo
    drawArtery(139.69, 35.69, 136.91, 35.18, 5, 0.1, 0.7);
    drawArtery(136.91, 35.18, 135.50, 34.69, 4, 0.1, 0.7);

    // South Korea (Seoul area blazing bright)
    drawCluster(126.98, 37.57, 2.0, 1.5, 260, 1.0);
    drawCityHub(126.98, 37.57, 3.9, 12.0, 1.0); // Seoul capital area
    drawCityHub(129.07, 35.18, 2.6, 7.5, 0.9); // Busan
    drawCityHub(128.60, 35.87, 2.2, 6.0, 0.85); // Daegu
    drawArtery(126.98, 37.57, 128.60, 35.87, 4, 0.1, 0.6);
    drawArtery(128.60, 35.87, 129.07, 35.18, 3, 0.1, 0.6);

    // Eastern China Coast & Megalopolises
    drawCluster(120.0, 31.5, 7.0, 8.0, 650, 1.0);
    drawCityHub(116.40, 39.90, 4.0, 12.5, 1.0); // Beijing
    drawCityHub(117.20, 39.12, 3.0, 9.0, 0.95); // Tianjin
    drawCityHub(121.47, 31.23, 4.2, 13.0, 1.0); // Shanghai
    drawCityHub(120.58, 31.30, 2.6, 7.5, 0.9); // Suzhou
    drawCityHub(120.15, 30.27, 2.8, 8.0, 0.9); // Hangzhou
    drawCityHub(118.80, 32.06, 2.8, 8.0, 0.9); // Nanjing
    drawCityHub(114.31, 30.59, 2.9, 8.5, 0.9); // Wuhan
    drawCityHub(113.26, 23.13, 3.8, 11.5, 1.0); // Guangzhou (Pearl River Delta)
    drawCityHub(114.06, 22.54, 3.6, 11.0, 1.0); // Shenzhen
    drawCityHub(114.17, 22.32, 3.4, 10.0, 1.0); // Hong Kong
    drawCityHub(104.07, 30.66, 3.0, 9.0, 0.9); // Chengdu
    drawCityHub(106.55, 29.56, 3.0, 9.0, 0.9); // Chongqing
    drawCityHub(108.94, 34.26, 2.7, 7.5, 0.85); // Xi'an

    // Taiwan
    drawCluster(120.8, 24.0, 1.5, 2.0, 130, 0.95);
    drawCityHub(121.56, 25.03, 2.9, 8.5, 0.95); // Taipei
    drawCityHub(120.31, 22.62, 2.4, 7.0, 0.85); // Kaohsiung

    // --- SOUTH ASIA ---
    // Indo-Gangetic Plain & Indian Metros
    drawCluster(80.0, 26.5, 10.0, 3.0, 500, 0.95);
    drawCluster(75.0, 16.0, 8.0, 6.0, 350, 0.9);
    drawCityHub(77.21, 28.61, 3.8, 12.0, 1.0); // New Delhi
    drawCityHub(80.95, 26.85, 2.6, 7.5, 0.85); // Lucknow
    drawCityHub(82.97, 25.32, 2.2, 6.0, 0.8); // Varanasi
    drawCityHub(85.14, 25.61, 2.3, 6.5, 0.8); // Patna
    drawCityHub(88.36, 22.57, 3.4, 10.0, 0.95); // Kolkata
    drawCityHub(72.88, 19.08, 3.7, 11.5, 1.0); // Mumbai
    drawCityHub(73.85, 18.52, 2.7, 7.5, 0.85); // Pune
    drawCityHub(77.59, 12.97, 3.2, 9.5, 0.95); // Bengaluru
    drawCityHub(80.27, 13.08, 3.0, 9.0, 0.9); // Chennai
    drawCityHub(78.49, 17.39, 2.9, 8.5, 0.9); // Hyderabad
    drawCityHub(72.57, 23.02, 2.8, 8.0, 0.85); // Ahmedabad
    drawCityHub(67.00, 24.86, 3.2, 9.5, 0.9); // Karachi
    drawCityHub(74.35, 31.52, 2.9, 8.5, 0.85); // Lahore
    drawCityHub(90.41, 23.81, 3.1, 9.0, 0.9); // Dhaka

    // Indo-Gangetic Artery
    drawArtery(77.21, 28.61, 80.95, 26.85, 6, 0.2, 0.6);
    drawArtery(80.95, 26.85, 82.97, 25.32, 4, 0.15, 0.6);
    drawArtery(82.97, 25.32, 85.14, 25.61, 4, 0.15, 0.6);
    drawArtery(85.14, 25.61, 88.36, 22.57, 6, 0.2, 0.6);
    drawArtery(72.88, 19.08, 73.85, 18.52, 3, 0.1, 0.6);

    // --- NILE RIVER & DELTA (EGYPT) ---
    const nilePoints = [
      [32.90, 24.09], // Aswan
      [32.85, 24.60],
      [32.70, 25.30],
      [32.64, 25.69], // Luxor
      [32.30, 26.15],
      [31.80, 26.56],
      [31.18, 27.18], // Asyut
      [30.85, 28.10],
      [31.10, 29.07],
      [31.25, 29.85],
      [31.24, 30.04]  // Cairo
    ];
    drawRibbon(nilePoints, 2.0, 0.9);
    drawCluster(31.2, 30.8, 1.8, 0.8, 180, 0.95);
    drawCityHub(31.24, 30.04, 3.6, 11.0, 1.0); // Cairo
    drawCityHub(29.92, 31.20, 2.8, 8.5, 0.9); // Alexandria
    drawCityHub(32.30, 31.26, 2.2, 6.0, 0.8); // Port Said

    // Persian Gulf & Middle East
    drawCluster(53.0, 25.0, 4.0, 2.0, 160, 0.9);
    drawCityHub(55.27, 25.20, 3.4, 10.5, 1.0); // Dubai
    drawCityHub(54.37, 24.45, 2.8, 8.0, 0.9); // Abu Dhabi
    drawCityHub(51.53, 25.29, 2.6, 7.5, 0.9); // Doha
    drawCityHub(47.98, 29.38, 2.7, 7.5, 0.9); // Kuwait City
    drawCityHub(46.72, 24.71, 3.1, 9.0, 0.9); // Riyadh
    drawCityHub(50.10, 26.43, 2.6, 7.5, 0.85); // Dammam
    drawCityHub(34.78, 32.08, 2.8, 8.0, 0.9); // Tel Aviv
    drawCityHub(35.50, 33.89, 2.3, 6.5, 0.85); // Beirut
    drawCityHub(35.93, 31.95, 2.4, 7.0, 0.85); // Amman
    drawCityHub(28.98, 41.01, 3.4, 10.5, 0.95); // Istanbul
    drawCityHub(32.85, 39.93, 2.6, 7.5, 0.85); // Ankara
    drawCityHub(51.39, 35.69, 3.2, 9.5, 0.9); // Tehran

    // --- SOUTHEAST ASIA ---
    drawCityHub(103.82, 1.35, 3.2, 9.5, 1.0); // Singapore
    drawCityHub(101.69, 3.14, 2.7, 8.0, 0.9); // Kuala Lumpur
    drawCityHub(100.50, 13.76, 3.4, 10.0, 0.95); // Bangkok
    drawCityHub(106.85, -6.21, 3.6, 11.0, 0.95); // Jakarta
    drawCityHub(120.98, 14.60, 3.4, 10.0, 0.95); // Manila
    drawCityHub(106.63, 10.82, 2.8, 8.0, 0.9); // Ho Chi Minh City

    // --- SOUTH AMERICA ---
    // Brazilian Coast Megalopolis
    drawCluster(-45.0, -23.0, 3.5, 2.5, 200, 0.95);
    drawCityHub(-46.63, -23.55, 3.8, 11.5, 1.0); // São Paulo
    drawCityHub(-43.17, -22.91, 3.4, 10.0, 0.95); // Rio de Janeiro
    drawCityHub(-43.94, -19.92, 2.6, 7.5, 0.85); // Belo Horizonte
    drawCityHub(-47.88, -15.79, 2.5, 7.0, 0.85); // Brasília
    drawArtery(-46.63, -23.55, -43.17, -22.91, 5, 0.15, 0.6);

    // Argentina & Chile
    drawCluster(-58.38, -34.60, 2.5, 2.0, 150, 0.9);
    drawCityHub(-58.38, -34.60, 3.4, 10.0, 0.95); // Buenos Aires
    drawCityHub(-64.19, -31.42, 2.2, 6.0, 0.8); // Córdoba
    drawCityHub(-70.67, -33.45, 3.0, 9.0, 0.9); // Santiago
    drawCityHub(-77.04, -12.05, 3.0, 9.0, 0.9); // Lima
    drawCityHub(-74.07, 4.71, 3.0, 9.0, 0.9); // Bogotá

    // --- AUSTRALIA & NEW ZEALAND ---
    // Coastal fringe only (Outback remains pitch dark)
    drawCityHub(151.21, -33.87, 3.2, 9.5, 0.95); // Sydney
    drawCityHub(144.96, -37.81, 3.0, 9.0, 0.9); // Melbourne
    drawCityHub(153.03, -27.47, 2.6, 7.5, 0.85); // Brisbane
    drawCityHub(115.86, -31.95, 2.5, 7.0, 0.85); // Perth
    drawCityHub(138.60, -34.93, 2.2, 6.0, 0.8); // Adelaide
    drawCityHub(174.76, -36.85, 2.3, 6.5, 0.85); // Auckland
    drawArtery(151.21, -33.87, 144.96, -37.81, 6, 0.15, 0.5);
    drawArtery(151.21, -33.87, 153.03, -27.47, 5, 0.15, 0.5);

    // --- AFRICA ---
    // South Africa & Key population hubs (Sahara and Congo basin dark)
    drawCluster(28.1, -26.0, 2.0, 1.5, 140, 0.9);
    drawCityHub(28.04, -26.20, 3.2, 9.5, 0.95); // Johannesburg
    drawCityHub(28.23, -25.75, 2.3, 6.5, 0.85); // Pretoria
    drawCityHub(18.42, -33.92, 2.6, 7.5, 0.85); // Cape Town
    drawCityHub(31.02, -29.86, 2.4, 7.0, 0.8); // Durban
    drawCityHub(3.38, 6.52, 3.2, 9.5, 0.9); // Lagos
    drawCityHub(36.82, -1.29, 2.6, 7.5, 0.85); // Nairobi
    drawCityHub(-7.59, 33.57, 2.5, 7.0, 0.85); // Casablanca
    drawCityHub(3.06, 36.75, 2.3, 6.5, 0.8); // Algiers

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
  static loadTextures(onProgress, onError) {
    return this.loadAllTextures(onProgress, onError);
  }

  static loadAllTextures(onProgress, onError) {
    const loader = new THREE.TextureLoader();

    const paths = {
      sun: 'assets/textures/sun.jpg',
      mercury: 'assets/textures/mercury.jpg',
      venus: 'assets/textures/venus.jpg',
      earth: 'assets/textures/earth.jpg',
      earthNight: 'assets/textures/earth_night.jpg',
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
      earthNight: () => TextureGenerator.createEarthNightTexture(),
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
      earthNight: TextureGenerator.createEarthNightTexture(),
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
          if (key !== 'earthNight') {
            console.warn(`NASA texture ${path} not loaded. Using procedural fallback.`);
          }
          if (fallbacks[key]) {
            textures[key] = fallbacks[key]();
            textures[key].colorSpace = THREE.SRGBColorSpace;
            textures[key].needsUpdate = true;
          }
          if (onError && key !== 'earthNight') onError(key, err);
        }
      );
      textures[key].colorSpace = THREE.SRGBColorSpace;
    }

    return textures;
  }
}
