import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Bomb, Heart, Coins, Play, RefreshCw, Skull, Crosshair, Zap, Flame, Wind, Navigation, Ship, Users, Sword } from 'lucide-react';
import { cn } from "@/lib/utils";

interface FortDefenseProps {
  onResult: (newGold: number, result: 'win' | 'lose' | 'push') => void;
  gold: number;
}

type TowerType = 'cannon' | 'gatling' | 'sniper';
type UnitType = 'sailor' | 'warrior';

interface Tower {
  id: number;
  type: TowerType;
  x: number; // grid x
  y: number; // grid y
  lastShot: number;
}

interface FriendlyUnit {
  id: number;
  x: number;
  y: number;
  hp: number;
  type: UnitType;
  speed: number;
}

interface Enemy {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  hp: number;
  maxHp: number;
  speed: number;
  type: 'ship' | 'frigate' | 'boss';
  isHit?: boolean;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: TowerType;
}

const TOWER_DATA: Record<TowerType, { name: string, cost: number, damage: number, range: number, cooldown: number, icon: any, color: string }> = {
  cannon: { name: 'Пушка', cost: 200, damage: 20, range: 30, cooldown: 1000, icon: Bomb, color: 'text-amber-600' },
  gatling: { name: 'Картечь', cost: 400, damage: 5, range: 20, cooldown: 200, icon: Zap, color: 'text-amber-500' },
  sniper: { name: 'Мортира', cost: 600, damage: 100, range: 60, cooldown: 3000, icon: Crosshair, color: 'text-rose-600' }
};

const UNIT_DATA: Record<UnitType, { name: string, cost: number, damage: number, hp: number, speed: number, icon: any, color: string }> = {
  sailor: { name: 'Матрос', cost: 150, damage: 5, hp: 50, speed: 0.2, icon: Users, color: 'text-amber-400' },
  warrior: { name: 'Пират-воин', cost: 300, damage: 15, hp: 150, speed: 0.15, icon: Sword, color: 'text-red-500' }
};

export function FortDefenseGame({ onResult, gold }: FortDefenseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [fortHp, setFortHp] = useState(100);
  const [score, setScore] = useState(0);
  const [gameGold, setGameGold] = useState(500); 
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [friendlyUnits, setFriendlyUnits] = useState<FriendlyUnit[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [wave, setWave] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType | null>(null);
  const [isWaveActive, setIsWaveActive] = useState(false);
  const [waveCountdown, setWaveCountdown] = useState(0);
  const [enemiesLeftToSpawn, setEnemiesLeftToSpawn] = useState(0);
  const [ownedUnits, setOwnedUnits] = useState<Record<UnitType, number>>({ sailor: 0, warrior: 0 });

  const startGame = () => {
    setIsPlaying(true);
    setFortHp(100);
    setScore(0);
    setGameGold(800);
    setWave(1);
    setEnemies([]);
    setTowers([]);
    setFriendlyUnits([]);
    setProjectiles([]);
    setGameOver(false);
    setIsWaveActive(false);
    setWaveCountdown(5);
    setEnemiesLeftToSpawn(5);
    setOwnedUnits({ sailor: 0, warrior: 0 });
  };

  const spawnEnemy = useCallback(() => {
    if (!isWaveActive || gameOver || !isPlaying || enemiesLeftToSpawn <= 0) return;
    
    const isBoss = wave % 5 === 0 && Math.random() > 0.8;
    const newEnemy: Enemy = {
      id: Math.random(),
      x: 100,
      y: Math.random() * 70 + 15,
      hp: (isBoss ? 500 : 30) + (wave * 15),
      maxHp: (isBoss ? 500 : 30) + (wave * 15),
      speed: (isBoss ? 0.12 : 0.25) + (wave * 0.02),
      type: isBoss ? 'boss' : (Math.random() > 0.7 ? 'frigate' : 'ship')
    };
    
    setEnemies(prev => [...prev, newEnemy]);
    setEnemiesLeftToSpawn(prev => prev - 1);
  }, [wave, isWaveActive, gameOver, isPlaying, enemiesLeftToSpawn]);

  const deployUnit = (y: number) => {
    if (!selectedUnitType) return;
    
    if (ownedUnits[selectedUnitType] <= 0) {
      // Auto-buy if possible? No, let's just show feedback
      return;
    }

    const data = UNIT_DATA[selectedUnitType];
    const newUnit: FriendlyUnit = {
      id: Math.random(),
      x: 12, // Starting from the fort
      y: y,
      hp: data.hp,
      type: selectedUnitType,
      speed: data.speed
    };

    setFriendlyUnits(prev => [...prev, newUnit]);
    setOwnedUnits(prev => ({ ...prev, [selectedUnitType]: prev[selectedUnitType] - 1 }));
  };

  const buyUnit = (type: UnitType) => {
    const data = UNIT_DATA[type];
    if (gameGold < data.cost) return;
    setGameGold(g => g - data.cost);
    setOwnedUnits(prev => ({ ...prev, [type]: prev[type] + 1 }));
    
    // Select automatically after buying if nothing is selected
    if (!selectedUnitType && !selectedTowerType) {
      setSelectedUnitType(type);
    }
  };

  const handleEnemyClick = (enemyId: number) => {
    setEnemies(prev => prev.map(e => {
      if (e.id === enemyId) {
        const newHp = e.hp - 10;
        if (newHp <= 0) {
          setScore(s => s + (e.type === 'boss' ? 500 : 50));
          setGameGold(g => g + (e.type === 'boss' ? 200 : 25));
        }
        return { ...e, hp: newHp, isHit: true };
      }
      return e;
    }).filter(e => e.hp > 0));

    // Reset hit state after animation
    setTimeout(() => {
      setEnemies(prev => prev.map(e => e.id === enemyId ? { ...e, isHit: false } : e));
    }, 100);
  };

  // Wave Manager
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    
    if (!isWaveActive && enemies.length === 0 && enemiesLeftToSpawn > 0) {
      if (waveCountdown > 0) {
        const timer = setTimeout(() => setWaveCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else if (waveCountdown === 0) {
        setIsWaveActive(true);
      }
    }
  }, [isPlaying, gameOver, isWaveActive, enemies.length, waveCountdown, enemiesLeftToSpawn]);

  const enemiesRef = useRef<Enemy[]>([]);
  const waveActiveRef = useRef(false);
  const enemiesLeftToSpawnRef = useRef(0);

  useEffect(() => {
    enemiesRef.current = enemies;
    waveActiveRef.current = isWaveActive;
    enemiesLeftToSpawnRef.current = enemiesLeftToSpawn;
  }, [enemies, isWaveActive, enemiesLeftToSpawn]);

  // Main Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameInterval = setInterval(() => {
      // 1. Move Enemies
      setEnemies(prev => {
        const next = prev.map(e => ({ ...e, x: e.x - e.speed }));
        const hitEnemies = next.filter(e => e.x <= 5);
        if (hitEnemies.length > 0) {
          setFortHp(hp => {
            const newHp = Math.max(0, hp - hitEnemies.length * 10);
            if (newHp <= 0) {
               setGameOver(true);
               return 0;
            }
            return newHp;
          });
        }
        return next.filter(e => e.x > 5);
      });

      // 2. Move Friendly Units and Combat
      setFriendlyUnits(prevUnits => {
        const nextUnits = prevUnits.map(u => ({ ...u, x: u.x + u.speed }));
        
        // Simple combat: if unit is close to enemy, both take damage
        setEnemies(prevEnemies => {
          let enemiesChanged = false;
          const nextEnemies = prevEnemies.map(e => {
            let enemyHp = e.hp;
            let enemyDamaged = false;
            nextUnits.forEach(u => {
              const dist = Math.sqrt(Math.pow(e.x - u.x, 2) + Math.pow(e.y - u.y, 2));
              if (dist < 5) {
                const unitData = UNIT_DATA[u.type];
                enemyHp -= unitData.damage / 10; // Per tick damage
                u.hp -= 1; // Unit takes damage too
                enemyDamaged = true;
              }
            });
            if (enemyHp <= 0) {
              setScore(s => s + (e.type === 'boss' ? 500 : 50));
              setGameGold(g => g + (e.type === 'boss' ? 200 : 25));
              enemiesChanged = true;
              return null;
            }
            if (enemyDamaged) enemiesChanged = true;
            return { ...e, hp: enemyHp };
          }).filter((e): e is Enemy => e !== null);

          return enemiesChanged ? nextEnemies : prevEnemies;
        });

        return nextUnits.filter(u => u.hp > 0 && u.x < 100);
      });

      // 3. Tower Shooting
      const now = Date.now();
      setTowers(prevTowers => {
        const newProjectiles: Projectile[] = [];
        const nextTowers = prevTowers.map(tower => {
          const data = TOWER_DATA[tower.type];
          if (now - tower.lastShot >= data.cooldown) {
            const towerX = tower.x * 10 + 20;
            const towerY = tower.y * 15 + 10;
            
            // Find target from current enemies ref to avoid dependency
            const target = enemiesRef.current.find(e => {
              const dx = e.x - towerX;
              const dy = e.y - towerY;
              const dist = Math.sqrt(dx*dx + dy*dy);
              return dist <= data.range;
            });

            if (target) {
              newProjectiles.push({
                id: Math.random(),
                x: towerX,
                y: towerY,
                targetX: target.x,
                targetY: target.y,
                type: tower.type
              });
              
              setEnemies(prevEnemies => prevEnemies.map(e => {
                if (e.id === target.id) {
                  const newHp = e.hp - data.damage;
                  if (newHp <= 0) {
                    setScore(s => s + (e.type === 'boss' ? 500 : 50));
                    setGameGold(g => g + (e.type === 'boss' ? 200 : 25));
                  }
                  return { ...e, hp: newHp };
                }
                return e;
              }).filter(e => e.hp > 0));

              return { ...tower, lastShot: now };
            }
          }
          return tower;
        });

        if (newProjectiles.length > 0) {
          setProjectiles(prev => [...prev, ...newProjectiles]);
          setTimeout(() => setProjectiles(prev => prev.filter(p => !newProjectiles.includes(p))), 200);
        }
        return nextTowers;
      });

      // 4. Wave Progression
      if (enemiesRef.current.length === 0 && waveActiveRef.current && enemiesLeftToSpawnRef.current === 0) {
        setIsWaveActive(false);
        setWave(w => {
          const nextWave = w + 1;
          setWaveCountdown(7);
          setEnemiesLeftToSpawn(5 + nextWave * 2);
          return nextWave;
        });
      }
    }, 100);

    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver]);

  // Separate Spawning Logic
  useEffect(() => {
    if (!isPlaying || gameOver || !isWaveActive) return;

    const intervalTime = Math.max(1000, 4000 - wave * 300);
    const spawnInterval = setInterval(() => {
      spawnEnemy();
    }, intervalTime);

    return () => clearInterval(spawnInterval);
  }, [isPlaying, gameOver, isWaveActive, wave, spawnEnemy]);

  const placeTower = (gridX: number, gridY: number) => {
    if (!selectedTowerType) return;
    const data = TOWER_DATA[selectedTowerType];
    if (gameGold < data.cost) return;
    if (towers.some(t => t.x === gridX && t.y === gridY)) return;

    setTowers(prev => [...prev, {
      id: Date.now(),
      type: selectedTowerType,
      x: gridX,
      y: gridY,
      lastShot: 0
    }]);
    setGameGold(g => g - data.cost);
  };

  useEffect(() => {
    if (gameOver) {
      onResult(gold + score, score > 500 ? 'win' : 'lose');
    }
  }, [gameOver, score, gold, onResult]);

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#f8f5f0] font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10 p-8"
          >
            <div className="relative">
              <div className="absolute -inset-16 bg-amber-500/10 blur-[80px] rounded-full animate-pulse" />
              <div className="w-56 h-56 rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center relative transform rotate-3 hover:rotate-0 transition-transform duration-500 border border-white">
                <Shield size={100} className="text-amber-500" />
              </div>
            </div>
            <div className="space-y-4 max-w-lg">
              <h3 className="text-6xl font-black uppercase tracking-tighter text-amber-950">Защита <span className="text-amber-500">Форта</span></h3>
              <p className="text-amber-900/60 font-serif italic text-2xl leading-relaxed">«Королевский флот на горизонте! Расставь пушки и защити сокровища Тортуги от захватчиков.»</p>
            </div>
            <button 
              onClick={startGame}
              className="px-20 py-6 bg-amber-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-900 transition-all active:scale-95 flex items-center gap-4"
            >
              К Обороне! <Shield size={24} />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col w-full h-full z-10 p-6 lg:p-10"
          >
            {/* Stats Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 ml-16">
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white shadow-xl flex items-center gap-3">
                   <Heart className="text-red-500 fill-red-500" size={20} />
                   <span className="font-black text-amber-950 text-xl">{fortHp}%</span>
                </div>
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white shadow-xl flex items-center gap-3">
                   <Coins className="text-amber-500" size={20} />
                   <span className="font-black text-amber-950 text-xl">{gameGold}G</span>
                </div>
                <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white shadow-xl flex items-center gap-3">
                   <Target className="text-amber-500" size={20} />
                   <span className="font-black text-amber-950 text-xl">{score}</span>
                </div>
              </div>
              <div className="bg-amber-950 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-2xl mr-16">
                 Волна {wave}
              </div>
            </div>

            {/* Game Field Grid */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div 
                className="w-full h-full bg-[#fdfaf6] rounded-[3.5rem] border-8 border-amber-900/10 shadow-xl relative overflow-hidden flex"
              >
                {/* Fort Left Side - Clickable to deploy units */}
                <div 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const y = ((e.clientY - rect.top) / rect.height) * 70 + 15;
                    deployUnit(y);
                  }}
                  className={cn(
                    "w-32 bg-amber-950 flex flex-col justify-around py-12 relative z-20 shadow-xl cursor-pointer transition-all group",
                    selectedUnitType && ownedUnits[selectedUnitType] > 0 ? "hover:bg-amber-900 scale-[1.02]" : "hover:bg-amber-900"
                  )}
                >
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10" />
                   {[1,2,3,4,5].map(i => <Shield key={i} size={32} className="text-amber-600/30 mx-auto" />)}
                   
                   {/* Deployment Zone Overlay */}
                   <div className={cn(
                     "absolute inset-0 flex flex-col items-center justify-center transition-all duration-300",
                     selectedUnitType && ownedUnits[selectedUnitType] > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                   )}>
                      <div className="bg-amber-500/20 w-full h-full absolute inset-0 animate-pulse" />
                      <p className="text-[10px] font-black text-white uppercase -rotate-90 tracking-[0.3em] relative z-10">
                        {selectedUnitType ? `ВЫСАДИТЬ ${UNIT_DATA[selectedUnitType].name}` : 'ВЫСАДКА'}
                      </p>
                      {selectedUnitType && (
                        <div className="mt-4 bg-white text-amber-950 px-3 py-1 rounded-full text-[10px] font-black relative z-10">
                           {ownedUnits[selectedUnitType]} шт.
                        </div>
                      )}
                   </div>
                </div>

                {/* Grid for Towers */}
                <div className="flex-1 relative grid grid-cols-8 grid-rows-6 p-4 gap-2">
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                      <div className="h-full w-full bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:32px_32px]" />
                   </div>

                   {Array.from({ length: 48 }).map((_, i) => {
                     const x = i % 8;
                     const y = Math.floor(i / 8);
                     const tower = towers.find(t => t.x === x && t.y === y);
                     
                     return (
                       <button
                         key={i}
                         onClick={() => placeTower(x, y)}
                         className={cn(
                           "rounded-2xl transition-all flex items-center justify-center relative group",
                           tower ? "bg-white shadow-md border-2 border-amber-900/10" : "bg-black/5 hover:bg-black/10 border border-transparent hover:border-amber-500/20"
                         )}
                       >
                          {tower ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                               {(() => {
                                 const Icon = TOWER_DATA[tower.type].icon;
                                 return <Icon className={cn("w-8 h-8", TOWER_DATA[tower.type].color)} />;
                               })()}
                            </motion.div>
                          ) : selectedTowerType && (
                            <div className="opacity-0 group-hover:opacity-30">
                               {(() => {
                                 const Icon = TOWER_DATA[selectedTowerType].icon;
                                 return <Icon className="w-6 h-6 text-amber-500" />;
                               })()}
                            </div>
                          )}
                       </button>
                     );
                   })}

                   {/* Wave Countdown Overlay */}
                   {!isWaveActive && waveCountdown > 0 && !gameOver && (
                     <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                        <motion.p 
                          key={waveCountdown}
                          initial={{ scale: 2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-9xl font-black text-amber-950"
                        >
                           {waveCountdown}
                        </motion.p>
                        <p className="text-xl font-black text-amber-950/40 uppercase tracking-[0.4em] mt-4">Готовься к атаке!</p>
                     </div>
                   )}

                   {/* Friendly Units Rendering */}
                   <AnimatePresence>
                     {friendlyUnits.map(unit => (
                       <motion.div
                         key={unit.id}
                         className="absolute -translate-x-1/2 -translate-y-1/2 z-25"
                         animate={{ left: `${unit.x}%`, top: `${unit.y}%` }}
                         exit={{ scale: 0, opacity: 0 }}
                       >
                          <div className={cn(
                            "flex items-center justify-center bg-white text-amber-950 rounded-full w-8 h-8 shadow-md border-2",
                            unit.type === 'sailor' ? "border-amber-400" : "border-red-500"
                          )}>
                             {(() => {
                               const Icon = UNIT_DATA[unit.type].icon;
                               return <Icon size={16} className={UNIT_DATA[unit.type].color} />;
                             })()}
                          </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>

                   {/* Enemies Rendering */}
                   <AnimatePresence>
                     {enemies.map(enemy => (
                       <motion.div
                         key={enemy.id}
                         className="absolute -translate-x-1/2 -translate-y-1/2 z-30"
                         animate={{ left: `${enemy.x}%`, top: `${enemy.y}%` }}
                         exit={{ scale: 0, opacity: 0 }}
                       >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ 
                              scale: enemy.isHit ? 1.2 : 1,
                              filter: enemy.isHit ? 'brightness(1.5)' : 'brightness(1)'
                            }}
                            onClick={() => handleEnemyClick(enemy.id)}
                            className="relative group cursor-crosshair"
                          >
                             <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-200 rounded-full overflow-hidden border border-white shadow-sm">
                                <div 
                                  className="h-full bg-red-500 transition-all duration-300" 
                                  style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                                />
                             </div>
                             <div className={cn(
                               "flex items-center justify-center bg-amber-950 text-white rounded-xl shadow-xl transition-all border-2 border-amber-900/50",
                               enemy.type === 'boss' ? "w-16 h-16 bg-red-950 border-red-500" : enemy.type === 'frigate' ? "w-12 h-12" : "w-10 h-10"
                             )}>
                                {enemy.type === 'boss' ? <Skull size={32} className="text-red-500" /> : enemy.type === 'frigate' ? <Ship size={24} className="text-amber-500" /> : <Navigation size={20} className="rotate-[-90deg] text-amber-400" />}
                             </div>
                          </motion.button>
                       </motion.div>
                     ))}
                   </AnimatePresence>

                   {/* Projectiles Rendering */}
                   {projectiles.map(p => (
                     <motion.div
                       key={p.id}
                       initial={{ left: `${p.x}%`, top: `${p.y}%` }}
                       animate={{ left: `${p.targetX}%`, top: `${p.targetY}%` }}
                       className={cn(
                         "absolute rounded-full z-40 shadow-lg",
                         p.type === 'cannon' ? "bg-amber-600 w-3 h-3" : p.type === 'gatling' ? "bg-amber-400 w-2 h-2" : "bg-rose-600 w-4 h-4"
                       )}
                     />
                   ))}
                </div>
              </div>

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-amber-950/60 backdrop-blur-md z-[100] flex items-center justify-center p-12">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-12 rounded-[3.5rem] shadow-2xl text-center max-w-lg w-full border border-white"
                  >
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Skull size={48} className="text-red-500" />
                    </div>
                    <h3 className="text-4xl font-black text-amber-950 uppercase mb-4 tracking-tighter">Оборона Прорвана!</h3>
                    <p className="text-amber-900/60 font-serif italic text-xl mb-10">
                      Форт пал, но твоя отвага войдет в легенды. Собрано трофеев: {score}G.
                    </p>
                    <button 
                      onClick={startGame}
                      className="w-full py-6 bg-amber-950 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-amber-900 transition-all"
                    >
                      <RefreshCw /> Реванш!
                    </button>
                  </motion.div>
                </div>
              )}
            </div>

            {/* Shop - Towers & Units */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
               {/* Towers Column */}
               <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/50 shadow-inner">
                  <div className="flex items-center gap-3 mb-4 px-2">
                     <Target className="text-amber-950" size={18} />
                     <h4 className="text-sm font-black uppercase tracking-widest text-amber-950/60">Бастионы и Орудия</h4>
                  </div>
                  <div className="flex gap-4 justify-around">
                    {(Object.keys(TOWER_DATA) as TowerType[]).map(type => {
                      const data = TOWER_DATA[type];
                      const isSelected = selectedTowerType === type;
                      const canAfford = gameGold >= data.cost;
                      
                      return (
                        <button
                          key={type}
                          onClick={() => { setSelectedTowerType(isSelected ? null : type); setSelectedUnitType(null); }}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-[2rem] border-2 transition-all min-w-[110px] flex-1 relative group",
                            isSelected ? "bg-amber-600 border-amber-600 text-white shadow-2xl -translate-y-2" : "bg-white border-white text-amber-950 shadow-sm hover:border-amber-500/20",
                            !canAfford && !isSelected && "opacity-50 grayscale cursor-not-allowed"
                          )}
                        >
                           <data.icon size={28} className={cn("mb-2 transition-transform group-hover:scale-110", isSelected ? "text-amber-500" : data.color)} />
                           <p className="text-[10px] font-black uppercase tracking-widest mb-2">{data.name}</p>
                           <div className="flex items-center gap-1.5 font-black text-xs bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-100 group-hover:bg-amber-100 transition-colors">
                              <Coins size={12} className="text-amber-500" /> {data.cost}
                           </div>
                        </button>
                      );
                    })}
                  </div>
               </div>

               {/* Units Column */}
               <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 border border-white/50 shadow-inner">
                  <div className="flex items-center gap-3 mb-4 px-2">
                     <Users className="text-amber-950" size={18} />
                     <h4 className="text-sm font-black uppercase tracking-widest text-amber-950/60">Вербовка Команды</h4>
                  </div>
                  <div className="flex gap-4 justify-around">
                    {(Object.keys(UNIT_DATA) as UnitType[]).map(type => {
                      const data = UNIT_DATA[type];
                      const isSelected = selectedUnitType === type;
                      const canAfford = gameGold >= data.cost;
                      
                      return (
                        <div key={type} className="flex flex-col gap-2 flex-1 min-w-[110px]">
                          <button
                            onClick={() => { setSelectedUnitType(isSelected ? null : type); setSelectedTowerType(null); }}
                            className={cn(
                              "flex flex-col items-center p-4 rounded-[2rem] border-2 transition-all w-full relative group",
                              isSelected ? "bg-amber-600 border-amber-600 text-white shadow-2xl -translate-y-2" : "bg-white border-white text-amber-950 shadow-sm hover:border-amber-500/20",
                              ownedUnits[type] === 0 && !isSelected && "opacity-80"
                            )}
                          >
                             <data.icon size={28} className={cn("mb-2 transition-transform group-hover:scale-110", isSelected ? "text-white" : data.color)} />
                             <p className="text-[10px] font-black uppercase tracking-widest mb-1">{data.name}</p>
                             <div className="text-[10px] font-bold opacity-60 mb-1">{ownedUnits[type]} в резерве</div>
                          </button>
                          
                          <button 
                             onClick={(e) => { e.stopPropagation(); buyUnit(type); }}
                             disabled={!canAfford}
                             className={cn(
                               "w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-tighter flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg",
                               canAfford ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                             )}
                          >
                             Нанять за {data.cost} <Coins size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
