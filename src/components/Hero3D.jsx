import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

function IglooShard() {
  const groupRef = useRef();

  // Procedural geometry for the igloo (similar to previous threeScene.js but in R3F)
  const blocks = useMemo(() => {
    const radius = 4;
    const numLayers = 12;
    const blockHeight = (radius * Math.PI / 2) / numLayers;
    const arr = [];
    
    // Dome
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
          if (Math.abs(normalizedAngle - Math.PI / 2) < 0.6) continue;
        }

        arr.push({
          position: [rCenter * Math.cos(angle), yCenter, rCenter * Math.sin(angle)],
          lookAt: [0, 0, 0],
          args: [actualBlockWidth - 0.05, blockHeight - 0.05, blockThickness],
          type: 'dome'
        });
      }
    }

    // Archway
    const archDepth = 4;
    const archRadius = 1.8;
    const numArchBlocks = 10;
    for (let z = 0; z < archDepth; z++) {
      for (let i = 0; i < numArchBlocks; i++) {
        const angle = (i / (numArchBlocks - 1)) * Math.PI;
        const actualBlockWidth = (Math.PI * archRadius) / numArchBlocks;
        arr.push({
          position: [archRadius * Math.cos(angle), archRadius * Math.sin(angle), radius - 0.5 + z * 0.65],
          rotation: [0, 0, angle],
          args: [actualBlockWidth - 0.05, 0.4, 0.6],
          type: 'arch'
        });
      }
    }
    return arr;
  }, []);

  useFrame((state) => {
    // We will let GSAP scroll trigger rotate the parent, but we can add a slight floating/breathing animation here
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef} rotation={[0, -Math.PI / 5, 0]}>
      {blocks.map((block, i) => (
        <mesh 
          key={i} 
          position={block.position} 
          rotation={block.rotation} 
          onUpdate={(self) => {
            if (block.type === 'dome') self.lookAt(0, 0, 0);
          }}
        >
          <boxGeometry args={block.args} />
          <MeshTransmissionMaterial 
            color="#B8D4E3" 
            transmission={0.9} 
            thickness={0.5}
            roughness={0.2}
            ior={1.2}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
          />
        </mesh>
      ))}
      <pointLight position={[0, 1.5, 0]} color="#44aaff" intensity={5} distance={20} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 3, 14], fov: 60 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
        <fog attach="fog" args={['#0A0B0D', 10, 35]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <Environment preset="night" />
        
        {/* We use name instead of id because THREE.Object3D.id is read-only */}
        <group name="igloo-scene-group">
          <IglooShard />
          
          {/* Simple Snowy Terrain */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <planeGeometry args={[60, 60, 32, 32]} />
            <meshStandardMaterial color="#0A0B0D" roughness={0.9} metalness={0.1} wireframe={true} />
          </mesh>
        </group>
      </Canvas>
    </div>
  );
}
