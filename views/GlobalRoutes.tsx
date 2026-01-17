
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  ShieldCheck, MapPin, CloudRain, 
  Sun, Radar, Cpu, Activity, Database, Search,
  Navigation, Wind, AlertTriangle, ShieldAlert,
  ArrowRight, Globe as GlobeIcon,
  Thermometer, Waves, Zap, Check, X,
  // Added missing RefreshCw icon import
  RefreshCw
} from 'lucide-react';

const GlobalRoutes: React.FC = () => {
  const [isStormActive, setIsStormActive] = useState(false);
  const [activeWeather, setActiveWeather] = useState({ temp: '24°C', cond: 'Clear', location: 'Atlantic Transit' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReRouting, setIsReRouting] = useState(false);
  
  const mountRef = useRef<HTMLDivElement>(null);
  const tacticalMountRef = useRef<HTMLDivElement>(null);
  
  // Three.js Scene Helpers
  const createGlobe = (mount: HTMLDivElement, textureUrl: string, size: number = 1) => {
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.5;
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const earthMap = loader.load(textureUrl);
    const geometry = new THREE.SphereGeometry(size, 64, 64);
    const material = new THREE.MeshPhongMaterial({ map: earthMap, shininess: 15 });
    const earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    return { scene, camera, renderer, earthMesh };
  };

  // Main Hero Globe
  useEffect(() => {
    if (!mountRef.current) return;
    const { renderer, earthMesh, scene, camera } = createGlobe(
      mountRef.current, 
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'
    );
    
    // Add Glow Layer
    const glowGeom = new THREE.SphereGeometry(1.02, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, wireframe: true });
    scene.add(new THREE.Mesh(glowGeom, glowMat));

    const animate = () => {
      requestAnimationFrame(animate);
      earthMesh.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();
    return () => { 
      renderer.dispose();
      mountRef.current?.innerHTML && (mountRef.current.innerHTML = '');
    };
  }, []);

  // Tactical Globe (Lower Section)
  useEffect(() => {
    if (!tacticalMountRef.current) return;
    const { renderer, earthMesh, scene, camera } = createGlobe(
      tacticalMountRef.current, 
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png',
      1.2
    );
    camera.position.set(0, 0, 4);
    earthMesh.material.color = new THREE.Color(0x1e293b);
    earthMesh.material.transparent = true;
    earthMesh.material.opacity = 0.9;

    const globeGroup = new THREE.Group();
    globeGroup.add(earthMesh);
    scene.add(globeGroup);

    // Grid Overlay
    const gridGeom = new THREE.SphereGeometry(1.21, 32, 32);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.1 });
    globeGroup.add(new THREE.Mesh(gridGeom, gridMat));

    // Path Visualizers
    const createPath = (points: THREE.Vector3[], color: number) => {
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const material = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.8 });
      return new THREE.Line(geometry, material);
    };

    const start = new THREE.Vector3(0.5, 0.5, 0.8).normalize().multiplyScalar(1.22);
    const end = new THREE.Vector3(-0.5, 0.6, -0.6).normalize().multiplyScalar(1.22);
    const midOriginal = new THREE.Vector3(0, 0, 1.25).normalize().multiplyScalar(1.25);
    const midAlt = new THREE.Vector3(0, 1.25, 0).normalize().multiplyScalar(1.4);

    const originalRoute = createPath([start, midOriginal, end], 0xf43f5e);
    const altRoute = createPath([start, midAlt, end], 0x10b981);
    
    globeGroup.add(originalRoute);
    globeGroup.add(altRoute);

    const animate = () => {
      requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();
    return () => { 
      renderer.dispose();
      tacticalMountRef.current?.innerHTML && (tacticalMountRef.current.innerHTML = '');
    };
  }, []);

  useEffect(() => {
    const stormTrigger = setTimeout(() => {
      setIsStormActive(true);
      setActiveWeather({ temp: '14°C', cond: 'Severe Storm', location: 'North Sea Vector' });
    }, 3000);
    return () => clearTimeout(stormTrigger);
  }, []);

  const handleOverride = () => setShowConfirm(true);

  const confirmReRoute = () => {
    setIsReRouting(true);
    setTimeout(() => {
      setIsReRouting(false);
      setShowConfirm(false);
      setIsStormActive(false);
      setActiveWeather({ temp: '22°C', cond: 'Clear', location: 'Optimized Channel' });
    }, 2000);
  };

  return (
    <div className="h-full w-full flex flex-col p-6 gap-6 overflow-y-auto overflow-x-hidden scrollbar-hide bg-slate-950">
      
      {/* Realistic Hero Globe */}
      <div className="relative min-h-[400px] w-full glass rounded-[3rem] overflow-hidden border-white/5 bg-slate-950/40 shadow-2xl">
        <div ref={mountRef} className="absolute inset-0 z-0" />
        
        <div className="absolute top-8 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
           <div className="glass p-5 rounded-3xl border-cyan-500/20 pointer-events-auto backdrop-blur-xl animate-in slide-in-from-top duration-700">
              <h1 className="text-2xl font-orbitron font-black tracking-tighter text-white uppercase italic">Orbital <span className="text-cyan-400">Insight</span></h1>
              <div className="flex items-center gap-3 mt-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pigeon Scout Link: ACTIVE</p>
              </div>
           </div>

           <div className="flex flex-col gap-3 pointer-events-auto items-end">
              <div className="glass p-4 rounded-2xl border-white/10 flex items-center gap-4 bg-slate-950/60 backdrop-blur-xl">
                 <div className={`p-3 rounded-xl ${isStormActive ? 'bg-rose-500/20 text-rose-500' : 'bg-cyan-500/20 text-cyan-500'}`}>
                    {isStormActive ? <CloudRain size={20} className="animate-bounce" /> : <Sun size={20} />}
                 </div>
                 <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">Local Feed</p>
                    <p className="text-sm font-orbitron font-bold">{activeWeather.location}</p>
                 </div>
              </div>
           </div>
        </div>

        {isStormActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
             <div className="text-rose-500 flex flex-col items-center gap-4 animate-in zoom-in duration-500">
                <div className="p-6 rounded-full bg-rose-500/10 border border-rose-500/30 animate-pulse">
                  <ShieldAlert size={64} />
                </div>
                <div className="text-center">
                  <p className="font-orbitron font-black text-xl tracking-[0.2em] uppercase">Anomaly Warning</p>
                  <p className="text-[10px] font-bold text-rose-400/70 uppercase tracking-widest mt-1">Hazard Mitigation Protocol Triggered</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Re-Route Tactical Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <div className="lg:col-span-2 glass rounded-[3rem] p-8 border-white/5 bg-slate-950/20 flex flex-col relative overflow-hidden min-h-[500px]">
           <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="p-3 glass rounded-xl text-cyan-400 border-cyan-500/20 bg-cyan-500/5"><Navigation size={24} /></div>
                 <div>
                    <h3 className="text-lg font-orbitron font-black text-white uppercase italic">3D Tactical Map</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Holographic Route Reconciliation</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-rose-500 rounded-full" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Original Path</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                   <span className="text-[9px] font-bold text-slate-400 uppercase">Pigeon Path</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 relative rounded-[2rem] bg-slate-900/50 border border-white/5 overflow-hidden shadow-inner">
              <div ref={tacticalMountRef} className="absolute inset-0" />
              <div className="absolute inset-0 pointer-events-none p-6">
                <div className="absolute top-6 left-6 glass px-4 py-2 rounded-xl border-white/10 flex flex-col gap-1">
                  <p className="text-[9px] text-slate-500 font-black uppercase">Asset ID</p>
                  <p className="text-xs font-orbitron font-bold text-white tracking-widest">PGN-LOG-882</p>
                </div>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-6">
           <div className={`glass rounded-[3rem] p-8 border-white/5 transition-all duration-700 h-full flex flex-col justify-between ${isStormActive ? 'bg-rose-500/5 border-rose-500/20' : 'bg-slate-950/20'}`}>
              <div>
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-sm font-orbitron font-black text-white flex items-center gap-3 tracking-widest uppercase italic">
                       <Zap className={isStormActive ? 'text-rose-500 animate-pulse' : 'text-cyan-500'} size={20} />
                       SCM Analytics
                    </h3>
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isStormActive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                 </div>

                 <div className="space-y-6">
                    <div className="p-5 glass rounded-2xl border-white/5 bg-slate-900/40">
                       <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Risk Profile</p>
                       <p className={`text-lg font-orbitron font-bold ${isStormActive ? 'text-rose-500' : 'text-emerald-500'}`}>
                         {isStormActive ? 'CRITICAL DISRUPTION' : 'STABLE VECTOR'}
                       </p>
                    </div>

                    <div className="p-5 glass rounded-2xl border-emerald-500/20 bg-emerald-500/5">
                       <p className="text-[10px] text-emerald-500 uppercase font-black mb-1">Optimized Solution</p>
                       <p className="text-xl font-orbitron font-black text-white mt-1 uppercase italic">Grid-88 Override</p>
                       <div className="flex justify-between mt-4 text-[10px] font-bold">
                          <span className="text-slate-500 uppercase">Latency Reduction</span>
                          <span className="text-emerald-500">+22% Efficiency</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-8">
                 <button 
                  onClick={handleOverride}
                  disabled={!isStormActive}
                  className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-xl ${isStormActive ? 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-[1.02] active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                    <ShieldAlert size={18} />
                    OVERRIDE & RE-ROUTE
                 </button>
              </div>
           </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="glass w-full max-w-lg rounded-[3rem] border-cyan-500/30 bg-slate-900/90 p-12 flex flex-col items-center text-center shadow-[0_0_100px_rgba(34,211,238,0.2)]">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-2 ${isReRouting ? 'border-cyan-500 animate-spin' : 'border-rose-500 animate-pulse'}`}>
                 {isReRouting ? <RefreshCw size={48} className="text-cyan-500" /> : <AlertTriangle className="text-rose-500" size={48} />}
              </div>

              <h2 className="text-3xl font-orbitron font-black text-white uppercase italic tracking-tighter mb-4">
                Confirm <span className="text-cyan-400">Re-Route</span>
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-10">
                You are about to authorize an orbital override for <span className="text-white font-bold">BATCH_88-AX</span>. This will deviate from the standard shipping lane to mitigate environmental hazards.
              </p>

              <div className="flex gap-4 w-full">
                 <button 
                  onClick={() => setShowConfirm(false)}
                  disabled={isReRouting}
                  className="flex-1 py-4 glass rounded-2xl border-white/10 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest disabled:opacity-50">
                   ABORT
                 </button>
                 <button 
                  onClick={confirmReRoute}
                  disabled={isReRouting}
                  className="flex-1 py-4 bg-cyan-500 text-slate-950 rounded-2xl hover:bg-cyan-400 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 disabled:opacity-50">
                   {isReRouting ? 'ENGAGING...' : 'OKAY CONFIRM'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalRoutes;
