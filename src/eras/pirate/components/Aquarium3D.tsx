'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Float, Sparkles, PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Fish3D({ position, color = "#ff7700", speed = 1, size = 1 }: { position: [number, number, number], color?: string, speed?: number, size?: number }) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Create a unique random path for each fish
  const randomFactor = useMemo(() => ({
    x: Math.random() * 10,
    y: Math.random() * 10,
    z: Math.random() * 10,
    speed: 0.5 + Math.random() * 0.5
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime * randomFactor.speed * speed;
      
      // Swimming logic: smooth curves within a box
      meshRef.current.position.x = position[0] + Math.sin(time + randomFactor.x) * 3;
      meshRef.current.position.y = position[1] + Math.cos(time * 0.8 + randomFactor.y) * 1.5;
      meshRef.current.position.z = position[2] + Math.sin(time * 0.5 + randomFactor.z) * 2;
      
      // Rotation to look where it's going (simplified)
      meshRef.current.rotation.y = Math.atan2(Math.cos(time + randomFactor.x), 1) + Math.PI / 2;
      meshRef.current.rotation.z = Math.sin(time * 2) * 0.1; // tail wagging
    }
  });

  return (
    <group ref={meshRef} position={position} scale={size}>
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} scale={[2, 1, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.3, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Fins */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.05, 0.15, 0.01]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.2, 0.05, 0.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[0.2, 0.05, -0.06]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

function Decoration() {
  return (
    <group position={[0, -2.5, 0]}>
      {/* Sand */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial color="#fef3c7" roughness={1} />
      </mesh>
      
      {/* Seaweed */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={[Math.cos(i) * 3, 0.8, Math.sin(i) * 2]}>
            <cylinderGeometry args={[0.05, 0.1, 1.5, 8]} />
            <meshStandardMaterial color="#166534" />
          </mesh>
        </Float>
      ))}

      {/* Bubbles */}
      <Sparkles count={40} scale={[10, 5, 10]} size={2} speed={0.5} color="#bae6fd" />
    </group>
  );
}

export default function Aquarium3D({ fishList = [] }: { fishList: any[] }) {
  // Map fish types to colors for 3D
  const getFishColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return '#a855f7';
      case 'epic': return '#f59e0b';
      case 'rare': return '#3b82f6';
      default: return '#f97316';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#0c4a6e] to-[#082f49]">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
        <fog attach="fog" args={['#082f49', 5, 20]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} castShadow />
        <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.5} />

        <Decoration />
        
        {fishList.slice(-15).map((fish, i) => (
          <Fish3D 
            key={i} 
            position={[
              (Math.random() - 0.5) * 6,
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 4
            ]} 
            color={getFishColor(fish.rarity)}
            speed={0.8 + Math.random() * 0.4}
            size={0.8 + Math.random() * 0.5}
          />
        ))}

        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
