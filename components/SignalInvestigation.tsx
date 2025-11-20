
import React, { useEffect, useRef, useState } from 'react';
import type { MeshNode, MeshLink, TelemetryError } from '../types';

interface SignalInvestigationProps {
    targetError: TelemetryError | null;
    onClose: () => void;
}

const generateSHA256 = () => {
    const chars = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < 64; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

// Basic IPv4 Validation Regex for educational purposes
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const SignalInvestigation: React.FC<SignalInvestigationProps> = ({ targetError, onClose }) => {
    const [nodes, setNodes] = useState<MeshNode[]>([]);
    const [links, setLinks] = useState<MeshLink[]>([]);
    const [securityHash, setSecurityHash] = useState(generateSHA256());
    const [logEntries, setLogEntries] = useState<string[]>([]);
    const [isReseting, setIsReseting] = useState(false);
    const requestRef = useRef<number | undefined>(undefined);
    const [activeSignalIndex, setActiveSignalIndex] = useState(0);
    
    // Selection State
    const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<MeshNode | null>(null);

    // Diagnostics State
    const [pingLatency, setPingLatency] = useState<number>(0);
    const [tracerouteHops, setTracerouteHops] = useState<string[]>([]);
    const [isTracingRoute, setIsTracingRoute] = useState(false);
    
    // Deployment Modal State
    const [showDeployModal, setShowDeployModal] = useState(false);
    const [deployIp, setDeployIp] = useState('');
    const [deployType, setDeployType] = useState<'GATEWAY' | 'PORT' | 'DEVICE'>('DEVICE');

    // Initialize Mesh
    useEffect(() => {
        // Create a hexagonal mesh structure
        const newNodes: MeshNode[] = [
            { id: 'TOWER_MAIN', x: 400, y: 300, type: 'TOWER', status: 'ACTIVE', label: 'BROADCAST_TWR_01' },
            { id: 'GW_01', x: 250, y: 150, type: 'GATEWAY', status: 'IDLE', label: 'MESH_GW_ALPHA' },
            { id: 'GW_02', x: 550, y: 150, type: 'GATEWAY', status: 'IDLE', label: 'MESH_GW_BETA' },
            { id: 'GW_03', x: 250, y: 450, type: 'GATEWAY', status: 'IDLE', label: 'MESH_GW_GAMMA' },
            { id: 'GW_04', x: 550, y: 450, type: 'GATEWAY', status: 'IDLE', label: 'MESH_GW_DELTA' },
            { id: 'PORT_80', x: 100, y: 300, type: 'PORT', status: 'LOCKED', label: 'SECURE_PORT_80' },
            { id: 'PORT_443', x: 700, y: 300, type: 'PORT', status: 'LOCKED', label: 'SECURE_PORT_443' },
            { id: 'DEV_TARGET', x: 400, y: 100, type: 'DEVICE', status: 'TRACING', label: targetError?.metadata.deviceId || 'UNKNOWN_DEVICE' }
        ];

        const newLinks: MeshLink[] = [
            { source: 'TOWER_MAIN', target: 'GW_01', active: true, signalStrength: 85 },
            { source: 'TOWER_MAIN', target: 'GW_02', active: true, signalStrength: 92 },
            { source: 'TOWER_MAIN', target: 'GW_03', active: true, signalStrength: 78 },
            { source: 'TOWER_MAIN', target: 'GW_04', active: true, signalStrength: 65 },
            { source: 'GW_01', target: 'DEV_TARGET', active: true, signalStrength: 45 },
            { source: 'GW_02', target: 'DEV_TARGET', active: true, signalStrength: 55 },
            { source: 'GW_01', target: 'PORT_80', active: false, signalStrength: 0 },
            { source: 'GW_04', target: 'PORT_443', active: false, signalStrength: 0 },
        ];

        setNodes(newNodes);
        setLinks(newLinks);
        setSelectedNode(newNodes.find(n => n.type === 'DEVICE') || null);

        // Initial Log
        setLogEntries([
            `[INFO] SIGNAL TRACE INITIATED: ${targetError?.id}`,
            `[INFO] MESH PROTOCOL: V.17.4 ACTIVE`,
            `[WARN] ANOMALY DETECTED AT VECTOR 144.22`,
            `[SYS] DEPLOYING THREADING WIFI ANALYZER...`
        ]);
    }, [targetError]);

    // Animation Loop
    const animate = () => {
        setSecurityHash(generateSHA256());
        setActiveSignalIndex(prev => (prev + 1) % 100);
        
        // Simulated Latency Jitter for selected node
        setPingLatency(prev => {
            const jitter = Math.random() * 10 - 5;
            const newValue = prev + jitter;
            return Math.max(12, Math.min(150, newValue));
        });

        // Randomly trigger "reset" visual
        if (Math.random() > 0.92) {
            setIsReseting(true);
            setTimeout(() => setIsReseting(false), 80);
        }

        if (Math.random() > 0.98) {
             setLogEntries(prev => [
                 `[SEC] INVALID USER RESET: HASH_MISMATCH_RETRY`,
                 ...prev.slice(0, 6)
             ]);
        }

        // Fluctuate signal strengths
        setLinks(currentLinks => currentLinks.map(link => {
            if (!link.active) return link;
            let newStrength = (link.signalStrength || 50) + (Math.random() * 6 - 3); 
            newStrength = Math.max(20, Math.min(100, newStrength));
            return { ...link, signalStrength: newStrength };
        }));

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleNodeClick = (node: MeshNode) => {
        setSelectedNode(node);
        setTracerouteHops([]); // Clear previous trace
        
        // Gateway Linking Logic
        if (node.type === 'GATEWAY') {
            if (node.status !== 'ACTIVE') {
                setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'ACTIVE' } : n));
                setLogEntries(prev => [`[OPS] GATEWAY ${node.label} ACTIVATED`, ...prev]);
            }
            
            if (selectedGatewayId === node.id) {
                setSelectedGatewayId(null);
                setLogEntries(prev => [`[OPS] GATEWAY ${node.label} DESELECTED`, ...prev]);
            } else {
                setSelectedGatewayId(node.id);
                setLogEntries(prev => [`[OPS] GATEWAY ${node.label} SELECTED FOR LINKING`, ...prev]);
            }
            return;
        }

        // Port Linking Logic
        if (node.type === 'PORT') {
            if (selectedGatewayId) {
                const gateway = nodes.find(n => n.id === selectedGatewayId);
                if (gateway && gateway.status === 'ACTIVE') {
                    const linkExists = links.some(l => 
                        (l.source === selectedGatewayId && l.target === node.id) ||
                        (l.source === node.id && l.target === selectedGatewayId)
                    );

                    if (!linkExists) {
                        setLinks(prev => [...prev, { source: selectedGatewayId, target: node.id, active: true, signalStrength: 100 }]);
                        setLogEntries(prev => [
                            `[OPS] MESH LINK ESTABLISHED: ${gateway.label} <-> ${node.label}`,
                            `[NET] TRAFFIC REROUTED THROUGH NEW NODE`,
                             ...prev
                        ]);
                        setSelectedGatewayId(null);
                        return;
                    }
                }
            }

            // Access Denied Simulation
            if (node.status === 'LOCKED') {
                setLogEntries(prev => [
                    `[CRIT] ACCESS DENIED: PORT ${node.label} LOCKED`,
                    `[SEC] UNAUTHORIZED SIGNAL DETECTED`,
                    `[HASH] FORCED RESET SEQUENCE INITIATED...`,
                    ...prev
                ]);
                setIsReseting(true);
                setTimeout(() => setIsReseting(false), 400);
            }
        }
    };

    const handleDeploySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!IP_REGEX.test(deployIp)) {
             setLogEntries(prev => [`[ERR] INVALID IP FORMAT: ${deployIp}`, ...prev]);
             return;
        }

        const randomX = Math.floor(Math.random() * 600) + 100;
        const randomY = Math.floor(Math.random() * 400) + 100;

        const newNode: MeshNode = {
            id: `NODE_${Date.now()}`,
            x: randomX,
            y: randomY,
            type: deployType,
            status: 'IDLE',
            label: deployIp
        };

        setNodes(prev => [...prev, newNode]);
        setLogEntries(prev => [
            `[SYS] DEPLOYING SENSOR NODE TO GRID...`,
            `[NET] NODE ESTABLISHED AT ${deployIp.toUpperCase()}`,
            `[MESH] MESH RECALIBRATION IN PROGRESS...`,
            ...prev
        ]);
        
        setLinks(prev => [...prev, {
            source: 'TOWER_MAIN',
            target: newNode.id,
            active: true,
            signalStrength: 50
        }]);

        setShowDeployModal(false);
        setDeployIp('');
        setSelectedNode(newNode);
    };

    const runSimulatedTraceroute = () => {
        if (!selectedNode) return;
        setIsTracingRoute(true);
        setTracerouteHops([]);
        setLogEntries(prev => [`[NET] INITIATING TRACEROUTE TO ${selectedNode.label}...`, ...prev]);

        const hops = [
            '192.168.1.1 (Local Gateway)',
            '10.24.0.1 (Private Network)',
            'ISP-BACKBONE-04',
            'MESH-RELAY-77',
            selectedNode.label
        ];

        hops.forEach((hop, index) => {
            setTimeout(() => {
                setTracerouteHops(prev => [...prev, `${index + 1}  ${hop}  ${Math.floor(Math.random() * 10) + 2}ms`]);
                if (index === hops.length - 1) {
                    setIsTracingRoute(false);
                    setLogEntries(prev => [`[NET] TRACE COMPLETE: HOST REACHABLE`, ...prev]);
                }
            }, (index + 1) * 600);
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="relative w-full max-w-6xl h-[80vh] bg-slate-900 border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)] flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 bg-slate-800 border-b border-cyan-900">
                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                             <h2 className="text-xl font-bold text-cyan-400 tracking-widest uppercase">Signal Investigation // Mesh V.17</h2>
                             <span className="text-[10px] font-mono text-cyan-700">SECURE CONNECTION ESTABLISHED</span>
                        </div>
                        <button 
                            onClick={() => setShowDeployModal(true)}
                            className="bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-1 rounded font-mono flex items-center gap-2 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            DEPLOY SENSOR
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                         <div className="flex flex-col items-end">
                             <span className="text-[10px] text-red-400 font-mono animate-pulse">LIVE THREAT MONITORING</span>
                             <span className="text-xs font-mono text-slate-400 font-bold">{securityHash.substring(0, 16)}...</span>
                         </div>
                        <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg group transition-colors">
                            <svg className="w-6 h-6 text-red-500 group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* SVG Visualization */}
                    <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-slate-950">
                        <svg className="w-full h-full" viewBox="0 0 800 600">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34, 211, 238, 0.05)" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* Links */}
                            {links.map((link, i) => {
                                const source = nodes.find(n => n.id === link.source);
                                const target = nodes.find(n => n.id === link.target);
                                if (!source || !target) return null;
                                
                                const strength = link.signalStrength || 50;
                                const opacity = 0.1 + (strength / 120);
                                const width = 0.5 + (strength / 20);

                                return (
                                    <g key={i}>
                                        <line 
                                            x1={source.x} y1={source.y} 
                                            x2={target.x} y2={target.y} 
                                            stroke="#22d3ee" 
                                            strokeWidth={width} 
                                            strokeOpacity={opacity}
                                        />
                                        {link.active && (
                                            <circle r={2 + (strength/40)} fill="#22d3ee" fillOpacity={0.8}>
                                                <animateMotion 
                                                    dur={`${Math.max(0.5, 3 - (strength/40))}s`} 
                                                    repeatCount="indefinite" 
                                                    path={`M${source.x},${source.y} L${target.x},${target.y}`} 
                                                />
                                            </circle>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Nodes */}
                            {nodes.map(node => {
                                const isSelected = selectedNode?.id === node.id;
                                const isGatewaySelected = selectedGatewayId === node.id;
                                
                                return (
                                    <g 
                                        key={node.id} 
                                        transform={`translate(${node.x}, ${node.y})`}
                                        onClick={() => handleNodeClick(node)}
                                        className="cursor-pointer hover:opacity-80"
                                    >
                                        {/* Selection Ring */}
                                        {(isSelected || isGatewaySelected) && (
                                             <circle r={22} fill="none" stroke="#facc15" strokeWidth="1" strokeDasharray="4 2" className="animate-spin-slow opacity-60" />
                                        )}

                                        {node.type === 'TOWER' && (
                                            <path d="M0,-20 L15,10 L-15,10 Z" fill="none" stroke={isSelected ? '#facc15' : '#22d3ee'} strokeWidth="2" />
                                        )}
                                        {node.type === 'DEVICE' && (
                                            <rect x="-10" y="-10" width="20" height="20" fill="none" stroke={isSelected ? '#facc15' : '#f472b6'} strokeWidth="2" />
                                        )}
                                        {node.type === 'GATEWAY' && (
                                            <circle 
                                                r="8" 
                                                fill={node.status === 'ACTIVE' ? '#0f172a' : '#1e293b'} 
                                                stroke={isGatewaySelected ? '#facc15' : (node.status === 'ACTIVE' ? '#22d3ee' : '#94a3b8')} 
                                                strokeWidth="2" 
                                            />
                                        )}
                                        {node.type === 'PORT' && (
                                            <path d="M-8,-8 L8,8 M-8,8 L8,-8" stroke={node.status === 'LOCKED' ? '#ef4444' : '#22d3ee'} strokeWidth="2" />
                                        )}
                                        <text y="30" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="monospace">{node.label}</text>
                                    </g>
                                );
                            })}
                            
                            <line x1="0" y1={activeSignalIndex * 6} x2="800" y2={activeSignalIndex * 6} stroke="rgba(34, 211, 238, 0.1)" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Side Panel: Logs & Security */}
                    <div className="w-80 bg-slate-900 border-l border-slate-800 p-4 flex flex-col space-y-4">
                        
                        {/* Node Diagnostics Panel (Dynamic) */}
                        <div className="p-3 bg-slate-800 rounded border border-slate-700 min-h-[180px]">
                            {selectedNode ? (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                                        <h3 className="text-xs font-bold text-cyan-400 uppercase">Node Diagnostics</h3>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedNode.status === 'LOCKED' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
                                            {selectedNode.status}
                                        </span>
                                    </div>
                                    
                                    <div className="text-xs font-mono text-slate-300 space-y-1">
                                        <div className="flex justify-between"><span>ID:</span> <span className="text-slate-500">{selectedNode.id.substring(0,12)}</span></div>
                                        <div className="flex justify-between"><span>IP/LABEL:</span> <span className="text-slate-500 truncate max-w-[120px]">{selectedNode.label}</span></div>
                                    </div>

                                    <div className="bg-slate-900 p-2 rounded border border-slate-700/50">
                                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                            <span>LATENCY</span>
                                            <span>{pingLatency.toFixed(0)} ms</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-cyan-500 transition-all duration-300 ease-out"
                                                style={{ width: `${Math.min(100, (pingLatency / 200) * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <button 
                                            onClick={runSimulatedTraceroute}
                                            disabled={isTracingRoute}
                                            className="w-full text-[10px] bg-slate-700 hover:bg-slate-600 text-cyan-300 py-1.5 rounded border border-slate-600 transition-colors disabled:opacity-50"
                                        >
                                            {isTracingRoute ? 'TRACING ROUTE...' : 'EXECUTE TRACEROUTE'}
                                        </button>
                                        
                                        {tracerouteHops.length > 0 && (
                                            <div className="bg-black/30 p-2 rounded text-[9px] font-mono text-slate-400 h-20 overflow-y-auto custom-scrollbar">
                                                {tracerouteHops.map((hop, i) => (
                                                    <div key={i} className="animate-fade-in">{hop}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <p className="text-xs text-center">SELECT A NODE TO<br/>VIEW DIAGNOSTICS</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-800 rounded border border-slate-700 flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">System Log</h3>
                            <div className="flex-1 overflow-hidden relative">
                                <div className="absolute bottom-0 left-0 w-full max-h-full overflow-y-auto custom-scrollbar">
                                    {logEntries.map((log, i) => (
                                        <div key={i} className="text-[10px] font-mono text-slate-400 mb-1 break-all border-l-2 border-cyan-900 pl-2">
                                            <span className="text-cyan-700">[{new Date().toLocaleTimeString()}]</span> {log}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`p-3 rounded border transition-all duration-75 relative overflow-hidden ${isReseting ? 'bg-red-500/20 border-red-400 shadow-[0_0_15px_rgba(248,113,113,0.4)]' : 'bg-red-900/20 border-red-900/50'}`}>
                             {isReseting && (
                                <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between opacity-30">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="h-[1px] w-full bg-red-300" style={{transform: `translateY(${Math.random() * 10}px)`}}></div>
                                    ))}
                                </div>
                             )}

                            <div className="flex justify-between items-center mb-2 z-20 relative">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                                    Industrial SHA256
                                    {isReseting && <span className="text-[8px] bg-red-500 text-black px-1 font-black">RESET</span>}
                                </h3>
                                <div className="flex space-x-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isReseting ? 'bg-red-200' : 'bg-red-600'}`}></div>
                                    <div className={`w-1.5 h-1.5 rounded-full ${isReseting ? 'bg-red-200' : 'bg-red-800'}`}></div>
                                </div>
                            </div>

                            <div className={`text-[9px] font-mono break-all leading-tight transition-colors duration-75 ${isReseting ? 'text-white font-bold blur-[0.5px]' : 'text-red-300/70'}`}>
                                {securityHash}
                            </div>
                            
                            <div className="mt-3 space-y-1">
                                <div className="flex justify-between text-[8px] text-red-400 font-mono uppercase">
                                    <span>Washability Status</span>
                                    <span className="text-red-200 animate-pulse">IMMUTABLE</span>
                                </div>
                                <div className="h-1 w-full bg-red-950 rounded-full overflow-hidden border border-red-900/30 relative">
                                     <style>{`
                                        @keyframes rapidStitch {
                                            0% { transform: translateX(-100%); }
                                            50% { transform: translateX(100%); }
                                            100% { transform: translateX(-100%); }
                                        }
                                    `}</style>
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-red-500 to-transparent" style={{animation: 'rapidStitch 0.2s linear infinite'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Deploy Modal Overlay */}
                 {showDeployModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
                        <div className="bg-slate-800 border border-cyan-500/50 p-6 rounded-lg w-96 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                            <h3 className="text-lg font-bold text-cyan-400 mb-4 tracking-wider">DEPLOY NEW SENSOR NODE</h3>
                            <form onSubmit={handleDeploySubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">SIMULATION IP (IPv4)</label>
                                    <input 
                                        type="text" 
                                        value={deployIp}
                                        onChange={(e) => setDeployIp(e.target.value)}
                                        placeholder="192.168.100.50"
                                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded p-2 focus:border-cyan-500 outline-none font-mono"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">NODE TYPE</label>
                                    <select 
                                        value={deployType}
                                        onChange={(e) => setDeployType(e.target.value as any)}
                                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded p-2 focus:border-cyan-500 outline-none"
                                    >
                                        <option value="DEVICE">Device (Target)</option>
                                        <option value="GATEWAY">Gateway</option>
                                        <option value="PORT">Port</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setShowDeployModal(false)}
                                        className="flex-1 px-4 py-2 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 rounded"
                                    >
                                        CANCEL
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                                    >
                                        INITIALIZE NODE
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SignalInvestigation;
