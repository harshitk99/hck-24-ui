"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDatabase, FaPlus, FaTimes, FaLink, FaArrowRight } from 'react-icons/fa';

type Connection = {
  id: number;
  value: string;
  type: 'mongodb' | 'postgresql' | 'mysql' | 'redis' | string;
};

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{
      x: number;
      y: number;
      dx: number;
      dy: number;
      size: number;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2,
      };
    };

    const initParticles = () => {
      for (let i = 0; i < 50; i++) {
        particles.push(createParticle());
      }
    };

    const drawParticle = (p: typeof particles[0]) => {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
    };

    const updateParticle = (p: typeof particles[0]) => {
      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        drawParticle(p);
        updateParticle(p);
      });

      // Draw connections between nearby particles
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 100)})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
    />
  );
};

const GradientBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default function ConnectPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [nextId, setNextId] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);

  const addConnection = () => {
    setConnections(prev => [...prev, { id: nextId, value: '', type: 'mongodb' }]);
    setNextId(prev => prev + 1);
  };

  const updateConnection = (id: number, value: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === id ? { ...conn, value } : conn
      )
    );
  };

  const updateType = (id: number, type: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === id ? { ...conn, type } : conn
      )
    );
  };

  const removeConnection = (id: number) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
  };  

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/schema');
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black p-4 text-white">
      <Particles />
      <GradientBackground />

      <div className="relative w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl"
        >
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <FaDatabase className="text-xl text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold">Database Connections</h2>
            </div>
            <motion.button
              onClick={addConnection}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
              <FaPlus className="text-xs" />
              Add Connection
            </motion.button>
          </div>

          <AnimatePresence mode="popLayout">
            {connections.length > 0 ? (
              <motion.div className="space-y-4">
                {connections.map((conn) => (
                  <motion.div
                    key={conn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                  >
                    <div className="flex gap-3">
                      <select
                        value={conn.type}
                        onChange={(e) => updateType(conn.id, e.target.value)}
                        className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm backdrop-blur-sm"
                      >
                        <option value="mongodb">MongoDB</option>
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="redis">Redis</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Connection string..."
                        value={conn.value}
                        onChange={(e) => updateConnection(conn.id, e.target.value)}
                        className="flex-1 rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-sm backdrop-blur-sm placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      />
                      <motion.button
                        onClick={() => removeConnection(conn.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-full bg-white/5 p-2 hover:bg-white/10"
                      >
                        <FaTimes className="text-white/60" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-white/10 py-12"
              >
                <div className="rounded-full bg-white/5 p-4">
                  <FaLink className="text-2xl text-white/40" />
                </div>
                <div className="text-center">
                  <p className="text-white/60">No connections added yet</p>
                  <p className="text-sm text-white/40">Click "Add Connection" to begin</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {connections.length > 0 && (
            <motion.button
              onClick={handleConnect}
              disabled={isConnecting}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600 ${
                isConnecting ? 'opacity-50' : ''
              }`}
            >
              {isConnecting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  Connect <FaArrowRight className="text-sm" />
                </>
              )}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}