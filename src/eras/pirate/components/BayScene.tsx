'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useState, useEffect, useRef } from 'react';
import { Float, OrbitControls, Sparkles } from '@react-three/drei';
import { Save, Lock, Unlock, Settings2 } from 'lucide-react';
import * as THREE from 'three';

export default function BayScene() {
  const [isLocked, setIsLocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pirate_bay_locked') === 'true';
    }
    return false;
  });
  const [isEditing, setIsEditing] = useState(false);
  const orbitRef = useRef<any>(null);
  const [cameraConfig, setCameraConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pirate_bay_camera');
      if (saved) return JSON.parse(saved);
    }
    return {
      position: [5, 4, 5],
      target: [0, 0, 0]
    };
  });

  useEffect(() => {
    // Синхронизация при первом рендере если нужно
  }, []);

  const handleSave = () => {
    if (orbitRef.current) {
      const pos = orbitRef.current.object.position;
      const tar = orbitRef.current.target;
      const config = {
        position: [pos.x, pos.y, pos.z] as [number, number, number],
        target: [tar.x, tar.y, tar.z] as [number, number, number]
      };
      
      localStorage.setItem('pirate_bay_camera', JSON.stringify(config));
      localStorage.setItem('pirate_bay_locked', 'true');
      setCameraConfig(config);
      setIsLocked(true);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full h-full relative group">
      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: cameraConfig.position, fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* Soft magical lighting */}
        <ambientLight intensity={0.5} color="#cce6ff" />
        
        {/* Moon/Golden Hour Sunlight */}
        <directionalLight 
          position={[5, 10, -5]} 
          intensity={1.2} 
          color="#ffd1a3" // Cozy warm sunlight sunset glow
          castShadow
        />
        
        {/* Fill light representing water reflection */}
        <pointLight position={[-5, -2, -5]} intensity={0.5} color="#00ffcc" />

        {/* Orbit controls with zoom/pan limits to keep it centered and looking perfect */}
        <OrbitControls 
          ref={orbitRef}
          enableZoom={false} 
          enableRotate={false}
          enablePan={false}
          minDistance={3}
          maxDistance={12}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={cameraConfig.target}
        />

        {/* Floating warm magical fireflies - MORE SPARKLES AS REQUESTED */}
        <Sparkles count={150} scale={6} size={4} speed={0.4} color="#ffaa00" />
        <Sparkles count={100} scale={8} size={2} speed={0.2} color="#00ffd2" />
        <Sparkles count={80} scale={10} size={1.5} speed={0.1} color="#ffffff" />

        {/* The dioramas of the safe bay */}
        <SafeBayDiorama />
      </Canvas>

      {/* Controls UI REMOVED */}

      {/* Floating indicator controls REMOVED */}
    </div>
  );
}

function SafeBayDiorama() {
  const waterRef = useRef<THREE.Mesh>(null);
  const campfireLightRef = useRef<THREE.PointLight>(null);
  const flagRef = useRef<THREE.Mesh>(null);

  // Animate waves and lights
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    // Subtle wave rotation
    if (waterRef.current) {
      waterRef.current.rotation.z = Math.sin(elapsed * 0.4) * 0.02;
    }

    // Cozy flickering campfire light
    if (campfireLightRef.current) {
      campfireLightRef.current.intensity = 1.8 + Math.sin(elapsed * 18) * 0.5;
    }

    // Flag waving
    if (flagRef.current) {
      flagRef.current.rotation.y = Math.sin(elapsed * 4) * 0.15;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      
      {/* 1. THE CALM WATER PLANE */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[3.2, 3.2, 0.1, 64]} />
        <meshStandardMaterial 
          color="#00a3a3" 
          roughness={0.1} 
          metalness={0.8}
          transparent 
          opacity={0.85}
        />
      </mesh>

      {/* 2. MAIN COZY SANDY ISLAND */}
      <mesh position={[-0.4, 0.05, 0.4]} castShadow receiveShadow>
        <cylinderGeometry args={[1.3, 1.4, 0.25, 32]} />
        <meshStandardMaterial color="#eed5ab" roughness={0.9} />
      </mesh>

      {/* Green lush center on the island */}
      <mesh position={[-0.4, 0.19, 0.4]}>
        <cylinderGeometry args={[1.1, 1.2, 0.05, 32]} />
        <meshStandardMaterial color="#477e38" roughness={0.95} />
      </mesh>

      {/* 3. COZY PIRATE CAMPFIRE (Safe spot) */}
      <group position={[-0.3, 0.22, 0.3]}>
        {/* Firewood logs */}
        <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI/4, 0]}>
          <boxGeometry args={[0.15, 0.05, 0.05]} />
          <meshStandardMaterial color="#3a1e05" />
        </mesh>
        <mesh position={[0, 0.02, 0]} rotation={[0, -Math.PI/4, 0]}>
          <boxGeometry args={[0.15, 0.05, 0.05]} />
          <meshStandardMaterial color="#3a1e05" />
        </mesh>
        
        {/* Glowing Fire Core */}
        <mesh position={[0, 0.08, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#ff5500" />
        </mesh>

        {/* Campfire flicker light */}
        <pointLight 
          ref={campfireLightRef}
          position={[0, 0.2, 0]} 
          distance={3} 
          decay={2}
          color="#ff7700" 
          castShadow
        />
      </group>

      {/* 4. PALM TREES ON MAIN ISLAND */}
      {/* Palm 1 */}
      <group position={[-0.8, 0.2, 0.2]}>
        {/* Trunk */}
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0.1]}>
          <cylinderGeometry args={[0.04, 0.06, 0.6, 8]} />
          <meshStandardMaterial color="#704e30" roughness={0.9} />
        </mesh>
        {/* Leaves */}
        <group position={[0.06, 0.58, 0]}>
          <mesh rotation={[0, 0, 0]}>
            <coneGeometry args={[0.25, 0.15, 5]} />
            <meshStandardMaterial color="#2d5e18" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI/3, 0]}>
            <coneGeometry args={[0.22, 0.15, 5]} />
            <meshStandardMaterial color="#387520" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Palm 2 */}
      <group position={[-0.1, 0.2, 0.8]}>
        <mesh position={[0, 0.25, 0]} rotation={[-0.1, 0, -0.1]}>
          <cylinderGeometry args={[0.035, 0.05, 0.5, 8]} />
          <meshStandardMaterial color="#704e30" roughness={0.9} />
        </mesh>
        <group position={[-0.03, 0.48, 0.03]}>
          <mesh rotation={[0, 0, 0]}>
            <coneGeometry args={[0.22, 0.12, 5]} />
            <meshStandardMaterial color="#387520" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 5. COZY SMALL LIGHTHOUSE ISLAND (Safe haven indicator) */}
      <group position={[1.4, 0.05, -1.2]}>
        {/* Sandy base */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.2, 16]} />
          <meshStandardMaterial color="#eed5ab" roughness={0.9} />
        </mesh>
        
        {/* Stone block */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.25, 0.4]} />
          <meshStandardMaterial color="#555555" roughness={0.8} />
        </mesh>

        {/* Lighthouse Tower */}
        <group position={[0, 0.5, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.1, 0.15, 0.6, 12]} />
            <meshStandardMaterial color="#d94b36" roughness={0.7} /> {/* Cute safe red */}
          </mesh>
          
          {/* White stripes */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.11, 0.12, 0.12, 12]} />
            <meshStandardMaterial color="#ffffff" roughness={0.7} />
          </mesh>

          {/* Golden Lantern room */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.12, 8]} />
            <meshStandardMaterial color="#ffd54f" metalness={0.8} roughness={0.1} />
          </mesh>

          {/* Yellow Light Cone pointing out */}
          <pointLight position={[0, 0.35, 0]} intensity={1.5} distance={2.5} color="#ffee55" />
          
          {/* Roof */}
          <mesh position={[0, 0.45, 0]}>
            <coneGeometry args={[0.11, 0.1, 8]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      </group>

      {/* 6. GENTLY BOBBING COZY ANCHORED PIRATE SHIP */}
      <Float speed={1.5} floatIntensity={0.3} rotationIntensity={0.1}>
        <group position={[0.7, 0.15, 0.6]} rotation={[0, -Math.PI / 6, 0]}>
          
          {/* Main Hull */}
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.16, 0.28]} />
            <meshStandardMaterial color="#4d2f1d" roughness={0.85} />
          </mesh>

          {/* Bow / Front cone shape */}
          <mesh position={[0.34, 0.04, 0]} rotation={[0, 0, Math.PI / 2 - Math.PI / 8]}>
            <coneGeometry args={[0.14, 0.15, 4]} />
            <meshStandardMaterial color="#4d2f1d" roughness={0.85} />
          </mesh>

          {/* Stern / Back cabin castle */}
          <mesh position={[-0.22, 0.12, 0]} castShadow>
            <boxGeometry args={[0.22, 0.16, 0.24]} />
            <meshStandardMaterial color="#3d2314" roughness={0.8} />
          </mesh>

          {/* Deck overlay */}
          <mesh position={[0.05, 0.09, 0]}>
            <boxGeometry args={[0.38, 0.02, 0.25]} />
            <meshStandardMaterial color="#e5c298" roughness={0.9} />
          </mesh>

          {/* Main Mast */}
          <group position={[0.05, 0.45, 0]}>
            <mesh>
              <cylinderGeometry args={[0.015, 0.015, 0.75, 8]} />
              <meshStandardMaterial color="#593b23" />
            </mesh>

            {/* Sails (Cozy white curved sails) */}
            <mesh position={[0, 0.12, 0.02]} rotation={[0, 0, 0]}>
              <boxGeometry args={[0.02, 0.25, 0.38]} />
              <meshStandardMaterial color="#fcf8f2" roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.15, 0.02]}>
              <boxGeometry args={[0.02, 0.2, 0.44]} />
              <meshStandardMaterial color="#fcf8f2" roughness={0.8} />
            </mesh>

            {/* Pirate Flag */}
            <mesh ref={flagRef} position={[-0.14, 0.35, 0]}>
              <boxGeometry args={[0.12, 0.08, 0.015]} />
              <meshStandardMaterial color="#111111" />
            </mesh>
          </group>
          
        </group>
      </Float>

    </group>
  );
}
