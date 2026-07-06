'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Float, Sparkles, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function CampfireModel() {
  const campfireLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (campfireLightRef.current) {
      campfireLightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime * 15) * 0.8;
    }
  });

  return (
    <group>
      {/* Logs */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.1, 0]} rotation={[0, (i * Math.PI) / 2, 0.2]}>
          <boxGeometry args={[0.8, 0.15, 0.15]} />
          <meshStandardMaterial color="#451a03" roughness={1} />
        </mesh>
      ))}
      
      {/* Stones around fire */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <mesh key={i} position={[Math.cos(i * Math.PI / 4) * 0.8, 0, Math.sin(i * Math.PI / 4) * 0.8]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}
      
      {/* Fire Particles (Flame) */}
      <Float speed={5} rotationIntensity={2} floatIntensity={1}>
        <group position={[0, 0.4, 0]}>
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} scale={[1, 1.5, 1]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.15, 16, 16]} scale={[1, 1.8, 1]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} scale={[1, 2, 1]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      </Float>

      {/* Campfire flicker light */}
      <pointLight 
        ref={campfireLightRef}
        position={[0, 0.8, 0]} 
        distance={10} 
        decay={2}
        color="#f59e0b" 
        intensity={3}
        castShadow
      />

      <Sparkles count={30} scale={4} size={3} speed={1.5} color="#f59e0b" />
    </group>
  );
}

export default function Campfire3D() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#020617] to-[#0f172a] relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)] animate-pulse" />
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]" />
      
      <Canvas shadows camera={{ position: [4, 3, 6], fov: 40 }}>
        <fog attach="fog" args={['#020617', 5, 15]} />
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 5, 0]} intensity={0.3} />
        <CampfireModel />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.3}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
