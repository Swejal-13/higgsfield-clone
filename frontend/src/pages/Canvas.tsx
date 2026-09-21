import { useCallback, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
  Connection, Edge, Node, BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

const NODE_TYPES = [
  { type: "prompt", label: "Prompt" },
  { type: "image", label: "Image" },
  { type: "video", label: "Video" },
  { type: "audio", label: "Audio" },
  { type: "model", label: "Model" },
  { type: "generation", label: "Generation" },
  { type: "output", label: "Output" },
];

let idCounter = 7;

const initialNodes: Node[] = [
  { id: "1", position: { x: 40, y: 120 }, data: { label: "Prompt" }, style: nodeStyle("#DFFF00") },
  { id: "2", position: { x: 280, y: 120 }, data: { label: "Image Generation" }, style: nodeStyle("#60a5fa") },
  { id: "3", position: { x: 520, y: 120 }, data: { label: "Image" }, style: nodeStyle("#34d399") },
  { id: "4", position: { x: 760, y: 120 }, data: { label: "Video Generation" }, style: nodeStyle("#60a5fa") },
  { id: "5", position: { x: 1000, y: 120 }, data: { label: "Video" }, style: nodeStyle("#34d399") },
  { id: "6", position: { x: 1240, y: 120 }, data: { label: "Export" }, style: nodeStyle("#f472b6") },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e5-6", source: "5", target: "6", animated: true },
];

function nodeStyle(color: string) {
  return {
    background: "#151719",
    color: "#FFFFFF",
    border: `1px solid ${color}55`,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    padding: "10px 14px",
  };
}

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { toast } = useToast();

  const onConnect = useCallback((connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)), [setEdges]);

  function addNode(type: string, label: string) {
    idCounter += 1;
    const id = String(idCounter);
    setNodes((nds) => [
      ...nds,
      {
        id,
        position: { x: 200 + Math.random() * 400, y: 250 + Math.random() * 200 },
        data: { label },
        style: nodeStyle("#DFFF00"),
      },
    ]);
  }

  function clearCanvas() {
    setNodes([]);
    setEdges([]);
    toast("Canvas cleared", "info");
  }

  function save() {
    localStorage.setItem("hf_canvas_workflow", JSON.stringify({ nodes, edges }));
    toast("Workflow saved locally", "success");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto">
        <span className="text-sm font-semibold mr-2 shrink-0">Canvas</span>
        {NODE_TYPES.map((n) => (
          <button
            key={n.type}
            onClick={() => addNode(n.type, n.label)}
            className="shrink-0 flex items-center gap-1 text-xs font-medium bg-panel border border-border rounded-full px-3 py-1.5 hover:border-accent/40 transition-colors"
          >
            <Plus size={12} /> {n.label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={save} className="shrink-0 flex items-center gap-1.5 text-xs font-medium bg-accent text-black rounded-full px-3 py-1.5">
          <Save size={12} /> Save
        </button>
        <button onClick={clearCanvas} className="shrink-0 flex items-center gap-1.5 text-xs font-medium bg-panel border border-border rounded-full px-3 py-1.5 text-red-400">
          <Trash2 size={12} /> Clear
        </button>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} color="#26292c" gap={20} />
          <Controls />
          <MiniMap style={{ background: "#151719" }} maskColor="rgba(9,10,11,0.7)" nodeColor="#DFFF00" />
        </ReactFlow>
      </div>
    </div>
  );
}
