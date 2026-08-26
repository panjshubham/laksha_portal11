import * as THREE from 'three';

export function initThreeScene() {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  // Clear existing canvas if any
  container.innerHTML = '';

  const scene = new THREE.Scene();
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  // Cap pixel ratio for performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0x00f0ff, 2, 50);
  pointLight.position.set(0, 2, 0);
  scene.add(pointLight);

  // Igloo Monolith structure
  const group = new THREE.Group();

  const stoneMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x111111, 
      flatShading: true,
      shininess: 40
  });

  const glowMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8
  });

  // Create an icy monolithic igloo
  for (let i = 0; i < 70; i++) {
      const size = 0.4 + Math.random() * 0.3;
      const geo = new THREE.BoxGeometry(size, size * 0.8, size);
      const mesh = new THREE.Mesh(geo, stoneMaterial);
      
      const angle = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3.5;
      
      // Dome shape logic
      const x = radius * Math.sin(phi) * Math.cos(angle);
      const y = Math.abs(radius * Math.cos(phi));
      const z = radius * Math.sin(phi) * Math.sin(angle);

      mesh.position.set(x, y, z);
      mesh.lookAt(0, 0, 0);
      group.add(mesh);
      
      // Add glow through cracks
      if (i % 2 === 0) {
          const glowGeo = new THREE.BoxGeometry(size * 1.1, size * 0.1, size * 1.1);
          const glowMesh = new THREE.Mesh(glowGeo, glowMaterial);
          glowMesh.position.copy(mesh.position).multiplyScalar(0.98);
          glowMesh.lookAt(0, 0, 0);
          group.add(glowMesh);
      }
  }

  scene.add(group);

  camera.position.z = 10;
  camera.position.y = 4;
  camera.lookAt(0, 2, 0);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animate() {
      requestAnimationFrame(animate);
      
      if (!prefersReducedMotion) {
          group.rotation.y += 0.002;
          
          const time = Date.now() * 0.001;
          glowMaterial.opacity = 0.4 + Math.sin(time * 2) * 0.4;
          pointLight.intensity = 1.5 + Math.sin(time * 3) * 1;
      } else {
          // Static glow if reduced motion
          glowMaterial.opacity = 0.6;
          pointLight.intensity = 1.5;
      }
      
      renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      
      // Graceful degradation on mobile - adjust camera distance based on width
      if (w < 768) {
          camera.position.z = 14;
      } else {
          camera.position.z = 10;
      }
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
  });

  // Initial call to set mobile sizing if needed
  if (window.innerWidth < 768) {
      camera.position.z = 14;
  }

  animate();
}
