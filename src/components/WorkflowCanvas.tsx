'use client';

import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Edge,
  type NodeTypes,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import WorkflowNode, { type WorkflowNodeType } from './nodes/WorkflowNode';
import type { PlanStep, WorkflowNodeData, SelectedEdge } from '@/types';

const nodeTypes: NodeTypes = { workflowNode: WorkflowNode };

interface Props {
  editablePlan: PlanStep[];
  workflowState: string;
  activeStep: number;
  selectedNode: number | null;
  onSelectNode: (idx: number) => void;
  onEdgeClick: (edge: SelectedEdge) => void;
  dfxmlFragments?: Record<number, string>;
}

export default function WorkflowCanvas({
  editablePlan, workflowState, activeStep, selectedNode, onSelectNode, onEdgeClick, dfxmlFragments,
}: Props) {
  const getNodeStatus = useCallback(
    (i: number): WorkflowNodeData['nodeStatus'] => {
      if (workflowState === 'done') return 'done';
      if (workflowState === 'running' && i < activeStep) return 'done';
      if (workflowState === 'running' && i === activeStep) return 'running';
      return 'approved';
    },
    [workflowState, activeStep]
  );

  const buildNodeData = useCallback(
    (item: PlanStep, i: number): WorkflowNodeData => ({
      title: item.name,
      tool: item.mcp,
      nodeStatus: getNodeStatus(i),
      nodeIdx: i,
      isSelected: selectedNode === i,
      dfxml: { name: item.name, xml: dfxmlFragments?.[i] ?? '' },
      onSelect: onSelectNode,
    }),
    [getNodeStatus, selectedNode, onSelectNode, dfxmlFragments]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNodeType>([]);

  const [edges, setEdges] = useEdgesState<Edge>([]);

  // editablePlan이 변경되면 노드 수가 달라질 수 있으므로 위치 포함 재생성
  useEffect(() => {
    setNodes(prev => {
      if (prev.length !== editablePlan.length) {
        // 노드 수 변경 → 기본 위치로 새로 생성
        return editablePlan.map((item, i) => ({
          id: `node-${i}`,
          type: 'workflowNode' as const,
          position: { x: 60 + i * 270, y: 80 },
          data: buildNodeData(item, i),
        }));
      }
      // 노드 수 동일 → 기존 위치(드래그 위치)를 유지하면서 data만 갱신
      return prev.map((node, i) => ({
        ...node,
        data: buildNodeData(editablePlan[i], i),
      }));
    });
  }, [editablePlan, buildNodeData, setNodes]);

  // 상태/선택 변경 시 data만 갱신 (위치 유지)
  useEffect(() => {
    setNodes(prev =>
      prev.map((node, i) => ({
        ...node,
        data: buildNodeData(editablePlan[i] ?? editablePlan[0], i),
      }))
    );
  }, [workflowState, activeStep, selectedNode, buildNodeData, setNodes, editablePlan]);

  // 엣지 갱신
  useEffect(() => {
    setEdges(
      editablePlan.slice(0, -1).map((step, i) => {
        const isActive = workflowState === 'running' && i <= activeStep;
        return {
          id: `edge-${i}`,
          source: `node-${i}`,
          target: `node-${i + 1}`,
          type: 'smoothstep',
          animated: isActive,
          label: step.edgeLabel ?? '',
          labelStyle: { fontSize: 9, fill: '#9ca3af' },
          style: { stroke: isActive ? '#2563eb' : '#d1d5db', strokeWidth: 1.5 },
          markerEnd: { type: 'arrowclosed' as const, color: isActive ? '#2563eb' : '#d1d5db' },
          data: { idx: i },
        };
      })
    );
  }, [editablePlan, workflowState, activeStep, setEdges]);

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.stopPropagation();
      onEdgeClick({
        idx: (edge.data as { idx: number }).idx,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [onEdgeClick]
  );

  const handleNodeClick: NodeMouseHandler<WorkflowNodeType> = useCallback(
    (_, node) => {
      onSelectNode(node.data.nodeIdx);
    },
    [onSelectNode]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgeClick={handleEdgeClick}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      minZoom={0.3}
      maxZoom={2}
      nodesDraggable
      nodesConnectable={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d4d4d8" />
      <MiniMap
        style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 4 }}
        nodeColor="#e0e7ff"
        maskColor="rgba(0,0,0,0.04)"
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}
