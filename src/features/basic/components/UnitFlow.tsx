"use client";

import { useMemo } from "react";
import { Background, BackgroundVariant, Handle, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { Flag } from "lucide-react";
import "@xyflow/react/dist/base.css";
import { PILLAR_LABELS, type Pillar } from "@/src/models/basic";
import { PILLAR_STYLE } from "../constants";

/*
 * Urutan unit di dalam sebuah level digambar sebagai alur: tiap unit satu node,
 * dihubungkan garis putus-putus yang bergerak ke bawah. Node digeser sedikit
 * berselang-seling supaya garisnya melengkung — terbaca sebagai alur, bukan
 * daftar biasa.
 */

export interface FlowUnit {
  id: number;
  title: string;
  pillar: Pillar;
  lessons: number;
}

const NODE_WIDTH = 230;
const NODE_GAP = 80;
const ZIGZAG = 14;

function UnitNode({ data }: { data: { title: string; lessons: number; pillar: Pillar; index: number } }) {
  const style = PILLAR_STYLE[data.pillar];
  const Icon = style.icon;

  return (
    <div
      className="flex items-center gap-2.5 rounded-2xl bg-white/95 px-3 py-2.5 shadow-[0_1px_2px_rgba(24,27,52,0.06)] ring-1 ring-slate-900/5 backdrop-blur-sm"
      style={{ width: NODE_WIDTH }}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className="!size-1 !border-0 !bg-transparent" />
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: style.tint, color: style.accent }}
      >
        <Icon size={15} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 block text-[14px] font-medium leading-tight text-slate-900">{data.title}</span>
        <span className="block text-[11px] leading-tight text-slate-500">{PILLAR_LABELS[data.pillar]}</span>
      </span>
      <span className="tabular flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
        {data.lessons}
      </span>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        className="!size-1 !border-0 !bg-transparent"
      />
    </div>
  );
}

/** Penutup level: setiap level diakhiri satu checkpoint. */
function CheckpointNode() {
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-dashed border-slate-900/25 px-3 py-1.5 text-[12px] font-medium text-slate-600"
      style={{ width: NODE_WIDTH }}
    >
      <Handle type="target" position={Position.Top} isConnectable={false} className="!size-1 !border-0 !bg-transparent" />
      <Flag size={13} aria-hidden="true" />
      Level checkpoint
    </div>
  );
}

const nodeTypes = { unit: UnitNode, checkpoint: CheckpointNode };

export function UnitFlow({ units, accent, levelName }: { units: FlowUnit[]; accent: string; levelName: string }) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = units.map((unit, index) => ({
      id: String(unit.id),
      type: "unit",
      position: { x: index % 2 === 0 ? 0 : ZIGZAG, y: index * NODE_GAP },
      data: { title: unit.title, lessons: unit.lessons, pillar: unit.pillar, index },
      draggable: false,
      selectable: false,
      connectable: false,
    }));

    nodes.push({
      id: "checkpoint",
      type: "checkpoint",
      position: { x: units.length % 2 === 0 ? 0 : ZIGZAG, y: units.length * NODE_GAP },
      data: {},
      draggable: false,
      selectable: false,
      connectable: false,
    });

    const chain = [...units.map((unit) => String(unit.id)), "checkpoint"];
    const edges: Edge[] = chain.slice(1).map((target, index) => ({
      id: `${chain[index]}-${target}`,
      source: chain[index],
      target,
      type: "smoothstep",
      // `animated` membuat garis putus-putusnya berjalan.
      animated: true,
      focusable: false,
      style: { stroke: accent, strokeWidth: 2, strokeDasharray: "5 5" },
    }));

    return { nodes, edges };
  }, [units, accent]);

  if (units.length === 0) return null;

  return (
    <>
      {/* Alurnya dekoratif; daftar teks di bawah yang dibaca pembaca layar. */}
      <div
        aria-hidden="true"
        className="[&_.react-flow__pane]:cursor-default"
        style={{ height: units.length * NODE_GAP + 52 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.06, maxZoom: 1, minZoom: 0.5 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          className="!bg-transparent"
        >
          <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="rgba(24,27,52,0.10)" />
        </ReactFlow>
      </div>

      <ul className="sr-only">
        {units.map((unit) => (
          <li key={unit.id}>
            {levelName}: {unit.title} — {PILLAR_LABELS[unit.pillar]}, {unit.lessons} lessons
          </li>
        ))}
      </ul>
    </>
  );
}
