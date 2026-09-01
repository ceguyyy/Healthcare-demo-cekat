import React, { useState, useEffect } from 'react';
import { LoadBalancerNode } from '../types/scenario';
import { Activity, Server, Cpu, CheckCircle2, Zap } from 'lucide-react';

interface LoadBalancerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoadBalancerModal: React.FC<LoadBalancerModalProps> = ({ isOpen, onClose }) => {
  const [nodes, setNodes] = useState<LoadBalancerNode[]>([
    { id: 'node_alpha', name: 'Node Alpha — n8n Workflow Router', endpoint: '10.0.1.20:8080', status: 'ONLINE', latencyMs: 14, activeRequests: 42, trafficPercent: 40 },
    { id: 'node_beta', name: 'Node Beta — SIMRS HIS Gateway', endpoint: '10.0.1.21:8080', status: 'ONLINE', latencyMs: 22, activeRequests: 35, trafficPercent: 35 },
    { id: 'node_gamma', name: 'Node Gamma — Medical Vision OCR', endpoint: '10.0.1.22:8080', status: 'ONLINE', latencyMs: 45, activeRequests: 25, trafficPercent: 25 }
  ]);

  const [totalRps, setTotalRps] = useState(148);
  const [algorithm, setAlgorithm] = useState<'WEIGHTED' | 'ROUND_ROBIN' | 'LEAST_LATENCY'>('WEIGHTED');

  // Simulate live load balancing updates
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        latencyMs: Math.max(10, node.latencyMs + Math.floor(Math.random() * 7) - 3),
        activeRequests: Math.max(15, node.activeRequests + Math.floor(Math.random() * 5) - 2)
      })));
      setTotalRps(prev => prev + Math.floor(Math.random() * 9) - 4);
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              LB
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Cekat AI Intelligent Load Balancer</h3>
              <p className="text-[11px] text-slate-400">High Availability & Dynamic Routing Monitor</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Dashboard Stats */}
        <div className="p-6 space-y-5 text-xs text-slate-800">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Total Traffic Rate</span>
                <Activity size={14} className="text-blue-600" />
              </div>
              <div className="text-xl font-black text-slate-900">{totalRps} <span className="text-xs font-semibold text-slate-500">req/sec</span></div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={11} /> 100% Request Delivery Rate
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Active Nodes</span>
                <Server size={14} className="text-emerald-600" />
              </div>
              <div className="text-xl font-black text-slate-900">3 / 3 <span className="text-xs font-semibold text-slate-500">Healthy</span></div>
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Zap size={11} /> Zero Failover Downtime
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Routing Algorithm</span>
                <Cpu size={14} className="text-indigo-600" />
              </div>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value as any)}
                className="w-full mt-1 bg-white border border-slate-300 rounded-md text-xs font-bold text-blue-700 px-2 py-1 focus:outline-none"
              >
                <option value="WEIGHTED">Weighted Dynamic Ratio</option>
                <option value="ROUND_ROBIN">Round Robin Distribution</option>
                <option value="LEAST_LATENCY">Least Latency Optimization</option>
              </select>
            </div>
          </div>

          {/* Active Nodes List */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
              <Server size={15} className="text-blue-600" /> Infrastructure Server Node Pool
            </h4>

            {nodes.map(node => (
              <div key={node.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {node.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">{node.endpoint}</div>
                </div>

                <div className="flex items-center gap-4 text-[11px]">
                  <div className="text-right">
                    <div className="text-slate-500">Latency</div>
                    <div className="font-mono font-bold text-slate-900">{node.latencyMs} ms</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">Active Conns</div>
                    <div className="font-mono font-bold text-blue-600">{node.activeRequests}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">Traffic Share</div>
                    <div className="font-mono font-bold text-emerald-600">{node.trafficPercent}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
