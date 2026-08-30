import * as THREE from 'three';

export function initThreeScene() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Clear existing canvas if any
  container.innerHTML = '';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0f16); // Dark icy void
  scene.fog = new THREE.Fog(0x0a0f16, 10, 35);

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(0, 3, 14);
  
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 10, 5);
  scene.add(dirLight);

  const internalLight = new THREE.PointLight(0x44aaff, 6, 20); // Bright icy blue glow
  internalLight.position.set(0, 1.5, 0);
  scene.add(internalLight);

  // Group for the Igloo and Terrain to rotate together
  const sceneGroup = new THREE.Group();
  scene.add(sceneGroup);

  const iglooGroup = new THREE.Group();
  sceneGroup.add(iglooGroup);

  // Materials
  const iceMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xccffff,
    transmission: 0.9,
    opacity: 1,
    metalness: 0.1,
    roughness: 0.2,
    ior: 1.3,
    thickness: 0.5,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  });

  const snowMaterial = new THREE.MeshStandardMaterial({
    color: 0xeeeeff,
    roughness: 0.9,
    metalness: 0.1,
  });

  // Terrain
  const terrainGeo = new THREE.PlaneGeometry(60, 60, 64, 64);
  const pos = terrainGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Smooth rolling snow dunes
    const z = (Math.sin(x * 0.3) * Math.cos(y * 0.3)) * 0.8 + 
              (Math.sin(x * 0.1) * Math.cos(y * 0.1)) * 1.5;
    pos.setZ(i, z - 0.2);
  }
  terrainGeo.computeVertexNormals();
  const terrain = new THREE.Mesh(terrainGeo, snowMaterial);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.5;
  sceneGroup.add(terrain);

  // Build the Igloo Dome
  const radius = 4;
  const numLayers = 12;
  const blockHeight = (radius * Math.PI / 2) / numLayers;
  
  for (let layer = 0; layer < numLayers; layer++) {
    const phi = Math.PI / 2 - (layer / numLayers) * (Math.PI / 2);
    
    const yCenter = radius * Math.cos(phi);
    const rCenter = radius * Math.sin(phi);
    const blockThickness = 0.6;

    const circumference = 2 * Math.PI * rCenter;
    const blockWidth = 1.2;
    const numBlocks = Math.max(1, Math.floor(circumference / blockWidth));
    
    const actualBlockWidth = circumference / numBlocks;

    for (let i = 0; i < numBlocks; i++) {
      const angle = (i / numBlocks) * Math.PI * 2 + (layer % 2 === 0 ? 0 : Math.PI / numBlocks);
      
      if (layer < 4) {
        let normalizedAngle = angle;
        while (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
        if (Math.abs(normalizedAngle - Math.PI / 2) < 0.6) {
          continue; // Door gap
        }
      }

      const blockGeo = new THREE.BoxGeometry(actualBlockWidth - 0.05, blockHeight - 0.05, blockThickness);
      const block = new THREE.Mesh(blockGeo, iceMaterial);
      
      block.position.x = rCenter * Math.cos(angle);
      block.position.y = yCenter;
      block.position.z = rCenter * Math.sin(angle);
      
      block.lookAt(0, 0, 0); // Tilt inward towards the center
      iglooGroup.add(block);
    }
  }

  // Build Entrance Archway
  const archDepth = 4;
  const archRadius = 1.8;
  const numArchBlocks = 10;
  for (let z = 0; z < archDepth; z++) {
    for (let i = 0; i < numArchBlocks; i++) {
      const angle = (i / (numArchBlocks - 1)) * Math.PI; 
      
      const actualBlockWidth = (Math.PI * archRadius) / numArchBlocks;
      const blockGeo = new THREE.BoxGeometry(actualBlockWidth - 0.05, 0.4, 0.6);
      const block = new THREE.Mesh(blockGeo, iceMaterial);
      
      block.position.x = archRadius * Math.cos(angle);
      block.position.y = archRadius * Math.sin(angle);
      block.position.z = radius - 0.5 + z * 0.65;
      
      block.rotation.z = angle;
      iglooGroup.add(block);
    }
  }
  
  // Rotate group initially to show entrance at an angle
  sceneGroup.rotation.y = -Math.PI / 5;

  // Mouse Interaction Setup
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.0005;
    mouseY = (event.clientY - windowHalfY) * 0.0005;
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      targetX = mouseX;
      targetY = mouseY;
      
      // Smooth interpolation for rotation
      sceneGroup.rotation.y += 0.002 + (targetX - (sceneGroup.rotation.y + Math.PI/5)) * 0.03;
      camera.position.y += (-targetY * 10 + 4 - camera.position.y) * 0.05;
      camera.lookAt(0, 2.5, 0);
      
      // Pulsing internal light
      internalLight.intensity = 6 + Math.sin(time * 1.5) * 2;
    } else {
      camera.lookAt(0, 2.5, 0);
      internalLight.intensity = 6;
    }
    
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    
    if (w < 768) {
      camera.position.z = 18;
    } else {
      camera.position.z = 14;
    }
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  if (window.innerWidth < 768) {
    camera.position.z = 18;
  }

  animate();
}
