'use client';

import { X, ChevronRight } from 'lucide-react';
import { NODE_IO } from '@/lib/constants';
import type { SelectedEdge, PlanStep, IORow } from '@/types';

interface Props {
  selectedEdge: SelectedEdge;
  editablePlan: PlanStep[];
  onClose: () => void;
}

function IORows({ rows }: { rows: IORow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((row, i) => (
        <div key={`${row.name}-${i}`} className={`py-1.5 ${i < rows.length - 1 ? 'border-b border-f-border' : ''}`}>
          <div className="text-[10px] font-mono font-medium text-f-t1">{row.name}</div>
          <div className="text-[9px] text-f-t3 mt-0.5">
            {row.type}{row.note ? ` · ${row.note}` : ''}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EdgeModal({ selectedEdge, editablePlan, onClose }: Props) {
  const { idx, clientX, clientY } = selectedEdge;
  const srcIo = NODE_IO[idx] ?? NODE_IO[0];
  const dstIo = NODE_IO[idx + 1] ?? NODE_IO[1];
  const srcName = editablePlan[idx]?.name;
  const dstName = editablePlan[idx + 1]?.name;

  const mw = 520, mh = 340;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const top = Math.min(clientY + 14, vh - mh - 10);
  const left = Math.min(clientX - mw / 2, vw - mw - 10);

  return (
    <div className="fixed inset-0 z-[200]" onClick={onClose}>
      <div
        className="absolute bg-f-surface border border-f-border rounded-lg shadow-2xl overflow-hidden"
        style={{ top, left, width: mw }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-3 py-2 border-b border-f-border flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-f-t1">{srcName}</span>
            <ChevronRight size={12} className="text-f-t4" />
            <span className="font-semibold text-f-t1">{dstName}</span>
            <span className="text-[9px] text-f-t4 ml-1">데이터 흐름</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 border-none bg-f-surface2 rounded cursor-pointer flex items-center justify-center text-f-t4 hover:text-f-t2 p-0 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 max-h-[280px]">
          <div className="px-3 py-2.5 border-r border-f-border overflow-y-auto cp-scroll">
            <div className="text-[9px] font-bold text-f-t4 tracking-wider mb-1.5">
              OUTPUT · {srcName}
            </div>
            <IORows rows={srcIo.output} />
          </div>
          <div className="px-3 py-2.5 overflow-y-auto cp-scroll">
            <div className="text-[9px] font-bold text-f-t4 tracking-wider mb-1.5">
              INPUT · {dstName}
            </div>
            <IORows rows={dstIo.input} />
          </div>
        </div>
      </div>
    </div>
  );
}
