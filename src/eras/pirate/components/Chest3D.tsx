'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Float, PerspectiveCamera, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

function ChestModel({ isOpen, goldAmount = 0 }: { isOpen: boolean, goldAmount?: number }) {
  const lidRef = useRef<THREE.Group>(null);
  const coinsCount = Math.min(Math.floor(goldAmount / 50), 40); // Max 40 coins for performance

  useFrame((state) => {
    if (lidRef.current) {
      const targetRotation = isOpen ? -Math.PI / 2.5 : 0;
      lidRef.current.rotation.x = THREE.MathUtils.lerp(lidRef.current.rotation.x, targetRotation, 0.1);
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Base of the chest */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1, 0.5, 0.6]} />
        <meshStandardMaterial color="#5d3f2e" roughness={0.8} />
      </mesh>

      {/* Gold or magic glow inside if open */}
      {isOpen && (
        <group position={[0, 0.4, 0]}>
          <pointLight intensity={2} color="#fbbf24" distance={3} />
          <Sparkles count={20} scale={0.8} size={2} speed={1} color="#fbbf24" />
          
          {/* Visual Gold Coins */}
          {Array.from({ length: coinsCount }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                (Math.random() - 0.5) * 0.7,
                (Math.random() * 0.1),
                (Math.random() - 0.5) * 0.4
              ]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
            >
              <cylinderGeometry args={[0.04, 0.04, 0.01, 8]} />
              <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      )}

      {/* Lid of the chest */}
      <group ref={lidRef} position={[0, 0.5, -0.3]}>
        <mesh position={[0, 0.1, 0.3]}>
          <boxGeometry args={[1.02, 0.2, 0.62]} />
          <meshStandardMaterial color="#3e2718" roughness={0.9} />
        </mesh>
        {/* Lock or latch */}
        <mesh position={[0, 0, 0.6]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.05]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Metal bands around the chest */}
      <mesh position={[-0.4, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.52, 0.62]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
      <mesh position={[0.4, 0.25, 0]}>
        <boxGeometry args={[0.05, 0.52, 0.62]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
    </group>
  );
}

export default function Chest3D({ isOpen = false, goldAmount = 0 }: { isOpen?: boolean, goldAmount?: number }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [2, 2, 2], fov: 40 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} color="#0ea5e9" />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <ChestModel isOpen={isOpen} goldAmount={goldAmount} />
        </Float>
      </Canvas>
    </div>
  );
}
