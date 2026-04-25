'use client';

import { Handle, Position, NodeToolbar } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import { X } from 'lucide-react';
import type { WorkflowNodeData } from '@/types';

export type WorkflowNodeType = Node<WorkflowNodeData, 'workflowNode'>;

function DFXMLView({ xml, maxH = 'max-h-28' }: { xml: string; maxH?: string }) {
  const lines = (xml || '').split('\n');
  const renderLine = (line: string) => {
    const tokens: { text: string; isTag: boolean }[] = [];
    const re = /(<[^>]+>)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) tokens.push({ text: line.slice(last, m.index), isTag: false });
      tokens.push({ text: m[0], isTag: true });
      last = m.index + m[0].length;
    }
    if (last < line.length) tokens.push({ text: line.slice(last), isTag: false });
    return tokens;
  };
  return (
    <div className={`bg-slate-900 rounded px-3 py-2 font-mono text-[10.5px] leading-7 overflow-y-auto cp-scroll ${maxH}`}>
      {lines.map((line, i) => (
        <div key={i} className="whitespace-pre">
          {renderLine(line).map((tok, j) => (
            <span key={j} className={tok.isTag ? 'text-sky-300' : 'text-slate-200'}>{tok.text}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function WorkflowNode({ data }: NodeProps<WorkflowNodeType>) {
  const { title, tool, nodeStatus, nodeIdx, isSelected, dfxml, onSelect } = data;

  const statusStyles = {
    approved: { dot: 'bg-amber-500', border: 'border-amber-500 border-dashed', badgeBg: 'bg-amber-50 text-amber-600', label: '승인됨' },
    running: { dot: 'bg-blue-600 animate-pulse', border: 'border-blue-600', badgeBg: 'bg-blue-50 text-blue-700', label: '실행중' },
    done: { dot: 'bg-green-600', border: 'border-green-600', badgeBg: 'bg-green-50 text-green-700', label: '완료' },
    idle: { dot: 'bg-gray-400', border: 'border-gray-200', badgeBg: 'bg-gray-100 text-gray-500', label: '대기' },
  } as const;
  const s = statusStyles[nodeStatus as keyof typeof statusStyles] ?? statusStyles.idle;

  return (
    <div
      className={`bg-white rounded-md overflow-visible shadow-sm cursor-pointer transition-shadow w-[180px]
        ${isSelected ? 'ring-2 ring-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.13)] border-2 border-blue-600' : `border ${s.border}`}`}
    >
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <div className="px-2.5 py-2 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
          <span className="text-[12px] font-medium text-gray-900">{title}</span>
        </div>
        <span className={`px-1.5 py-[2px] rounded text-[9px] font-semibold ${s.badgeBg}`}>{s.label}</span>
      </div>
      <div className="px-2.5 py-[7px]">
        <span className="text-[10px] font-mono text-gray-400">{tool}</span>
      </div>
      {nodeStatus === 'running' && (
        <div className="h-0.5 bg-gray-100">
          <div className="h-full w-3/5 bg-blue-600" />
        </div>
      )}

      {/* NodeToolbar: 노드 외부에 렌더링되어 노드 크기·핸들에 영향 없음 */}
      {dfxml && (
        <NodeToolbar isVisible={isSelected} position={Position.Bottom} offset={8}>
          <div className="w-[220px] bg-white border border-slate-700 rounded-md shadow-xl overflow-hidden">
            <div className="px-2 py-1.5 bg-slate-900 flex justify-between items-center">
              <span className="text-[10px] font-bold text-sky-300 tracking-wider">DFXML</span>
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); onSelect(nodeIdx); }}
                className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-300 border-none bg-transparent cursor-pointer p-0"
              >
                <X size={11} />
              </button>
            </div>
            <div className="p-2 bg-slate-900 flex flex-col gap-1.5">
              <DFXMLView xml={dfxml.input_xml} maxH="max-h-[110px]" />
              <div className="h-px bg-slate-800" />
              <DFXMLView xml={dfxml.output_xml} maxH="max-h-[130px]" />
            </div>
          </div>
        </NodeToolbar>
      )}
    </div>
  );
}
