'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Float, Sparkles, PerspectiveCamera, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

function Sea() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.02;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100, 32, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          roughness={0.1} 
          metalness={0.8} 
          transparent 
          opacity={0.8}
          emissive="#075985"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Underwater depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0c4a6e" />
      </mesh>
    </group>
  );
}

function Cloud({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group position={position}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 16, 16]} scale={[1.5, 0.8, 1]} />
          <meshStandardMaterial color="white" transparent opacity={0.4} />
        </mesh>
        <mesh position={[0.4, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="white" transparent opacity={0.4} />
        </mesh>
        <mesh position={[-0.4, 0.1, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="white" transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  );
}

function Island() {
  return (
    <group position={[0, -0.6, 0]}>
      {/* Sandy base */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[5, 6, 1, 32]} />
        <meshStandardMaterial color="#eab308" roughness={1} />
      </mesh>
      {/* Rocks */}
      <mesh position={[-2, 0.2, 1]} rotation={[0.5, 0.2, 0.1]}>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[1, 0.3, 2]} rotation={[0.1, 0.8, 0.4]}>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Palm Tree */}
      <group position={[2.5, 0.5, -1.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.12, 0.2, 3, 8]} />
          <meshStandardMaterial color="#451a03" />
        </mesh>
        <group position={[0, 1.5, 0]}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh key={i} rotation={[0.4, (i * Math.PI * 2) / 6, 0]} position={[0, 0.2, 0]}>
              <boxGeometry args={[0.15, 0.02, 1.8]} />
              <meshStandardMaterial color="#14532d" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

function Boat() {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group position={[0, -0.1, 3.5]}>
        {/* Hull */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 0.5, 2.5]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        {/* Sides */}
        <mesh position={[0.6, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.4, 2.5]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[-0.6, 0.3, 0]}>
          <boxGeometry args={[0.1, 0.4, 2.5]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        {/* Lantern */}
        <group position={[0, 0.6, -1]}>
          <mesh>
            <boxGeometry args={[0.15, 0.25, 0.15]} />
            <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2} />
          </mesh>
          <pointLight color="#f59e0b" intensity={0.5} distance={3} />
        </group>
      </group>
    </Float>
  );
}

function Fish3D({ position, color = "#ff7700", speed = 1, size = 1 }: { position: [number, number, number], color?: string, speed?: number, size?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  const initialX = position[0];
  const initialZ = position[2];
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * speed;
      meshRef.current.position.x = initialX + Math.sin(time * 0.5) * 4;
      meshRef.current.position.z = initialZ + Math.cos(time * 0.5) * 4;
      meshRef.current.rotation.y = time * 0.5 + Math.PI / 2;
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={size}>
      <mesh castShadow>
        <sphereGeometry args={[0.12, 16, 16]} scale={[2, 1, 0.5]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* Fins */}
      <mesh position={[0, 0.1, 0]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.04, 0.12, 0.01]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.22, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.08, 0.25, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eye */}
      <mesh position={[0.15, 0.05, 0.04]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

function FishingRod({ fishingState }: { fishingState: string }) {
  const rodRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (rodRef.current) {
      if (fishingState === 'waiting') {
        rodRef.current.rotation.x = -0.4 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      } else if (fishingState === 'bite') {
        rodRef.current.rotation.x = -0.6 + Math.sin(state.clock.elapsedTime * 25) * 0.1;
      } else {
        rodRef.current.rotation.x = -0.4;
      }
    }
  });

  return (
    <group ref={rodRef} position={[0, 0.2, 4.2]}>
      {/* Handle */}
      <mesh position={[0, 1.2, 0]} rotation={[0.4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 3.5, 8]} />
        <meshStandardMaterial color="#2d1a12" />
      </mesh>
      {/* Line */}
      <mesh position={[0, 2.6, -1.8]} rotation={[1.1, 0, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 4.5, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
      {/* Float (bobber) */}
      <Float speed={5} floatIntensity={0.5} rotationIntensity={0}>
        <mesh position={[0, 0, -3.8]}>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color={fishingState === 'bite' ? "#ef4444" : "#f8fafc"} emissive={fishingState === 'bite' ? "#ef4444" : "#f8fafc"} emissiveIntensity={fishingState === 'bite' ? 2 : 0.2} />
        </mesh>
      </Float>
    </group>
  );
}

export default function FishingScene3D({ fishingState }: { fishingState: string }) {
  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0c4a6e] to-[#075985]">
      <Canvas shadows camera={{ position: [8, 6, 12], fov: 35 }}>
        <fog attach="fog" args={['#0c4a6e', 8, 25]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
        <spotLight position={[-5, 20, 5]} angle={0.2} penumbra={1} intensity={1.2} castShadow />
        
        {/* Stars/Dust in the air */}
        <Sparkles count={80} scale={15} size={2} speed={0.4} color="#bae6fd" />
        
        <Sea />
        <Island />
        <Boat />
        <FishingRod fishingState={fishingState} />
        
        {/* Background Clouds */}
        <Cloud position={[-10, 8, -10]} />
        <Cloud position={[5, 10, -12]} />
        <Cloud position={[-5, 12, -15]} />
        
        {/* Animated Fish Schools */}
        <Fish3D position={[-4, -0.1, -2]} color="#38bdf8" speed={0.7} size={1.2} />
        <Fish3D position={[4, -0.2, 1]} color="#fbbf24" speed={1.1} size={0.8} />
        <Fish3D position={[-2, -0.3, -5]} color="#f472b6" speed={0.6} size={1.5} />
        <Fish3D position={[6, -0.1, -3]} color="#4ade80" speed={1.4} size={0.9} />
        <Fish3D position={[0, -0.4, -6]} color="#a78bfa" speed={0.5} size={2} />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 8}
          minAzimuthAngle={-Math.PI / 4}
          maxAzimuthAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  );
}
