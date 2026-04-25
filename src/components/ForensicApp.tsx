'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { ChevronRight, Play, Pause, Plus } from 'lucide-react';

import NavRail from './NavRail';
import CaseListView from './CaseListView';
import AnalysisPanel from './AnalysisPanel';
import DeleteCaseModal from './modals/DeleteCaseModal';
import NewCaseModal from './modals/NewCaseModal';
import McpModal from './modals/McpModal';
import EdgeModal from './modals/EdgeModal';
import ReportViewerModal from './modals/ReportViewerModal';

import {
  detectDiskImageFormat, getBasename, recommendMcpForStrategyStep, nextCaseId,
} from '@/lib/utils';
import { DEFAULT_STRATEGY_STEPS, DEFAULT_PLAN } from '@/lib/constants';
import type {
  WorkflowState, ReportState, Case, ActiveCase, PlanStep, StrategyStep,
  RejectionRecord, SelectedEdge, McpModalState, CaseSort,
} from '@/types';

const WorkflowCanvas = dynamic(() => import('./WorkflowCanvas'), { ssr: false });

export default function ForensicApp() {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [diskImagePath, setDiskImagePath] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string } | null>(null);
  const [pathStepDone, setPathStepDone] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
  const [panelWidth, setPanelWidth] = useState(380);
  const isDraggingSplitterRef = useRef(false);

  const rejectionReasonRef = useRef('');
  const strategyEditReasonRef = useRef('');
  const strategyBackupRef = useRef<StrategyStep[]>(DEFAULT_STRATEGY_STEPS.map(s => ({ ...s })));
  const planBackupRef = useRef<PlanStep[]>(DEFAULT_PLAN.map(p => ({ ...p })));
  const runningRef = useRef(false);

  const [rejectionHistory, setRejectionHistory] = useState<RejectionRecord[]>([]);
  const [rejectedPlanSnapshot, setRejectedPlanSnapshot] = useState<PlanStep[] | null>(null);
  const [planRound, setPlanRound] = useState(1);
  const [strategySteps, setStrategySteps] = useState<StrategyStep[]>(DEFAULT_STRATEGY_STEPS.map(s => ({ ...s })));
  const [chatInputText, setChatInputText] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [reportState, setReportState] = useState<ReportState>('idle');
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdge | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [editablePlan, setEditablePlan] = useState<PlanStep[]>(DEFAULT_PLAN.map(p => ({ ...p })));
  const [mcpModal, setMcpModal] = useState<McpModalState>({ open: false, stepIdx: null });
  const [mcpSearch, setMcpSearch] = useState('');

  const [cases, setCases] = useState<Case[]>([
    { id: 'DF-2024-0327', title: 'USB 저장매체 삭제파일 복구', status: 'running', analyst: '김수사', media: 'NTFS', size: '2.3GB', date: '2024-03-27', progress: 45 },
    { id: 'DF-2024-0298', title: '랜섬웨어 감염 분석', status: 'done', analyst: '이포렌', media: 'NTFS', size: '500GB', date: '2024-03-25', progress: 100 },
    { id: 'DF-2024-0341', title: '이메일 피싱 계정 추적', status: 'idle', analyst: '박디지', media: 'Archive', size: '1.2GB', date: '2024-03-28', progress: 0 },
    { id: 'DF-2024-0345', title: '사내 기밀 유출 타임라인 분석', status: 'failed', analyst: '김수사', media: 'APFS', size: '256GB', date: '2024-03-28', progress: 12 },
  ]);
  const [activeCase, setActiveCase] = useState<ActiveCase>({ id: 'DF-2024-0327', title: 'USB 저장매체 삭제파일 복구' });
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState('all');
  const [caseAnalystFilter, setCaseAnalystFilter] = useState('all');
  const [caseSort, setCaseSort] = useState<CaseSort>('dateDesc');
  const [caseFilterMenu, setCaseFilterMenu] = useState<string | null>(null);

  // Splitter drag
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplitterRef.current) {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.max(280, Math.min(newWidth, 800)));
      }
    };
    const handleMouseUp = () => {
      if (isDraggingSplitterRef.current) {
        isDraggingSplitterRef.current = false;
        document.body.style.cursor = 'default';
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const diskImageCheck = detectDiskImageFormat(diskImagePath);
  const diskImageReady = diskImageCheck.ok;

  const navigateToBuilder = useCallback((caseInfo: ActiveCase) => {
    if (caseInfo?.id) setActiveCase({ id: caseInfo.id, title: caseInfo.title || '새 케이스' });
    setCurrentView('builder');
    setWorkflowState('idle');
    setDiskImagePath('');
    setAttachedFile(null);
    setPathStepDone(false);
    rejectionReasonRef.current = '';
    strategyEditReasonRef.current = '';
    setRejectionHistory([]);
    setRejectedPlanSnapshot(null);
    setPlanRound(1);
    setChatInputText('');
    setSubmittedPrompt('');
    setReportState('idle');
    setShowReportViewer(false);
    setEditablePlan(DEFAULT_PLAN.map(p => ({ ...p })));
    setStrategySteps(DEFAULT_STRATEGY_STEPS.map(s => ({ ...s })));
    setSelectedNode(null);
    setActiveStep(-1);
  }, []);

  const handleCreateNewCase = useCallback(() => {
    const title = newCaseTitle.trim();
    if (!title) return;
    const id = nextCaseId(cases);
    const today = new Date().toISOString().slice(0, 10);
    setCases(prev => [{ id, title, status: 'idle', analyst: '-', media: '-', size: '-', date: today, progress: 0 }, ...prev]);
    setNewCaseModalOpen(false);
    setNewCaseTitle('');
  }, [cases, newCaseTitle]);

  const buildPlanFromStrategySteps = useCallback((steps: StrategyStep[], prevPlan: PlanStep[] = []) =>
    steps.map((step, idx) => ({
      step: idx + 1,
      name: step.text,
      mcp: prevPlan[idx]?.mcp || recommendMcpForStrategyStep(step.text),
    })), []);

  const syncPlanWithStrategy = useCallback(() => {
    setEditablePlan(prev => buildPlanFromStrategySteps(strategySteps, prev));
  }, [buildPlanFromStrategySteps, strategySteps]);

  const handleIntakeSubmit = useCallback(() => {
    if (!pathStepDone || !diskImageReady || !chatInputText.trim()) return;
    setSubmittedPrompt(chatInputText.trim());
    setChatInputText('');
    setWorkflowState('plan_thinking');
    setShowReasoning(false);
    setTimeout(() => setWorkflowState('strategy_review'), 2000);
  }, [pathStepDone, diskImageReady, chatInputText]);

  const handleApproveStrategy = useCallback(() => {
    syncPlanWithStrategy();
    setWorkflowState('mcp_plan_thinking');
    setTimeout(() => setWorkflowState('plan_requested'), 1200);
  }, [syncPlanWithStrategy]);

  const handleStrategyEditRequest = useCallback(() => setWorkflowState('strategy_edit_request'), []);
  const handleStrategyDirectEdit = useCallback(() => setWorkflowState('strategy_editing'), []);
  const handleStrategyEditCancel = useCallback(() => {
    strategyEditReasonRef.current = '';
    setWorkflowState('strategy_review');
  }, []);
  const handleStrategyEditSubmit = useCallback(() => {
    setWorkflowState('plan_thinking');
    setShowReasoning(false);
    setTimeout(() => { strategyEditReasonRef.current = ''; setWorkflowState('strategy_review'); }, 1800);
  }, []);

  const handleApproveReport = useCallback(() => {
    setReportState('generating');
    setTimeout(() => setReportState('done'), 2500);
  }, []);

  const handleApprovePlan = useCallback(() => setWorkflowState('approved'), []);
  const handleRejectPlan = useCallback(() => { setRejectedPlanSnapshot([...editablePlan]); setWorkflowState('rejected'); }, [editablePlan]);
  const handleStartEdit = useCallback(() => {
    planBackupRef.current = editablePlan.map(p => ({ ...p }));
    setWorkflowState('editing');
  }, [editablePlan]);
  const handleCancelEdit = useCallback(() => {
    setEditablePlan(planBackupRef.current.map(p => ({ ...p })));
    setWorkflowState('plan_requested');
  }, []);
  const handleSubmitEdit = useCallback(() => setWorkflowState('plan_requested'), []);
  const handleCancelReject = useCallback(() => { setRejectedPlanSnapshot(null); setWorkflowState('plan_requested'); }, []);
  const handleRerequest = useCallback(() => {
    const reason = rejectionReasonRef.current.trim();
    if (!reason) return;
    setRejectionHistory(prev => [...prev, { round: planRound, reason, plan: rejectedPlanSnapshot! }]);
    setPlanRound(p => p + 1);
    rejectionReasonRef.current = '';
    setRejectedPlanSnapshot(null);
    setWorkflowState('mcp_plan_thinking');
    setTimeout(() => {
      if (reason.includes('타임라인') || reason.toLowerCase().includes('timeline') || reason.includes('추가')) {
        setEditablePlan(prev => {
          if (prev.find(p => p.name.includes('타임라인') || p.mcp === 'Plaso MCP')) return prev;
          const last = prev[prev.length - 1];
          return [...prev, { step: last.step + 1, name: '타임라인 분석', mcp: 'Plaso MCP' }];
        });
      }
      setWorkflowState('plan_requested');
    }, 1200);
  }, [planRound, rejectedPlanSnapshot]);

  const handleRunWorkflow = useCallback(async () => {
    if (workflowState !== 'approved') return;
    runningRef.current = true;
    setWorkflowState('running');
    const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));
    for (let i = 0; i < editablePlan.length; i++) {
      if (!runningRef.current) return;
      setActiveStep(i);
      await delay(2000);
    }
    if (!runningRef.current) return;
    setActiveStep(-1);
    await delay(1000);
    setWorkflowState('done');
  }, [workflowState, editablePlan]);

  const handlePauseWorkflow = useCallback(() => {
    runningRef.current = false;
    setWorkflowState('approved');
    setActiveStep(-1);
  }, []);

  const handleSelectNode = useCallback((idx: number) => {
    setSelectedNode(prev => prev === idx ? null : idx);
  }, []);

  const openMcpModal = useCallback((stepIdx: number) => { setMcpModal({ open: true, stepIdx }); setMcpSearch(''); }, []);
  const selectMcp = useCallback((toolName: string) => {
    setEditablePlan(prev => {
      const next = [...prev];
      if (mcpModal.stepIdx !== null) next[mcpModal.stepIdx] = { ...next[mcpModal.stepIdx], mcp: toolName };
      return next;
    });
    setMcpModal({ open: false, stepIdx: null });
  }, [mcpModal.stepIdx]);

  const handleDeleteCase = useCallback(() => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setCases(prev => {
      const remaining = prev.filter(c => c.id !== id);
      setActiveCase(ac => ac.id !== id ? ac : (remaining[0] ? { id: remaining[0].id, title: remaining[0].title } : { id: '', title: '케이스 없음' }));
      return remaining;
    });
    setConfirmDeleteId(null);
  }, [confirmDeleteId]);

  const isCanvasVisible = ['approved', 'running', 'done'].includes(workflowState);

  return (
    <div className="flex h-screen w-screen bg-f-bg text-f-t1 overflow-hidden font-sans text-[13px]">
      {/* Modals */}
      {confirmDeleteId && (
        <DeleteCaseModal
          caseId={confirmDeleteId}
          onConfirm={handleDeleteCase}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
      {newCaseModalOpen && (
        <NewCaseModal
          newCaseTitle={newCaseTitle}
          setNewCaseTitle={setNewCaseTitle}
          onCreate={handleCreateNewCase}
          onCancel={() => { setNewCaseModalOpen(false); setNewCaseTitle(''); }}
        />
      )}
      {mcpModal.open && mcpModal.stepIdx !== null && (
        <McpModal
          stepIdx={mcpModal.stepIdx}
          editablePlan={editablePlan}
          mcpSearch={mcpSearch}
          setMcpSearch={setMcpSearch}
          onSelect={selectMcp}
          onClose={() => setMcpModal({ open: false, stepIdx: null })}
        />
      )}
      {selectedEdge !== null && (
        <EdgeModal
          selectedEdge={selectedEdge}
          editablePlan={editablePlan}
          onClose={() => setSelectedEdge(null)}
        />
      )}
      {showReportViewer && (
        <ReportViewerModal
          editablePlan={editablePlan}
          submittedPrompt={submittedPrompt}
          onClose={() => setShowReportViewer(false)}
        />
      )}

      <NavRail currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-10 bg-f-surface border-b border-f-border flex items-center justify-between px-4 shrink-0 select-none">
          <div className="flex items-center text-xs">
            <span
              className="text-f-t3 cursor-pointer hover:text-f-t1 transition-colors"
              onClick={() => setCurrentView('list')}
            >
              케이스 목록
            </span>
            {currentView === 'builder' && (
              <>
                <ChevronRight size={13} className="text-f-border2 mx-1" />
                <span className="text-f-t3 font-mono text-[11px]">{activeCase.id}</span>
                <ChevronRight size={13} className="text-f-border2 mx-1" />
                <span className="text-f-t1 font-medium">{activeCase.title}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {currentView === 'list' && (
              <button
                type="button"
                onClick={() => { setNewCaseTitle(''); setNewCaseModalOpen(true); }}
                className="h-7 px-3 bg-f-accent border-none rounded-[5px] text-white text-xs font-medium cursor-pointer flex items-center gap-1 hover:bg-blue-700 transition-colors"
              >
                <Plus size={13} /> 새 케이스
              </button>
            )}
            {currentView === 'builder' && workflowState === 'approved' && (
              <button
                onClick={handleRunWorkflow}
                className="h-7 px-3 bg-f-accent border-none rounded-[5px] text-white text-xs font-medium cursor-pointer flex items-center gap-1 hover:bg-blue-700 transition-colors"
              >
                <Play size={12} fill="currentColor" /> 워크플로 실행
              </button>
            )}
            {currentView === 'builder' && workflowState === 'running' && (
              <button onClick={handlePauseWorkflow} className="h-7 px-3 bg-f-warn border-none rounded-[5px] text-white text-xs font-medium cursor-pointer flex items-center gap-1">
                <Pause size={12} fill="currentColor" /> 일시정지
              </button>
            )}
          </div>
        </div>

        {/* Main content */}
        {currentView === 'list' ? (
          <CaseListView
            cases={cases}
            caseSearchQuery={caseSearchQuery}
            setCaseSearchQuery={setCaseSearchQuery}
            caseStatusFilter={caseStatusFilter}
            setCaseStatusFilter={setCaseStatusFilter}
            caseAnalystFilter={caseAnalystFilter}
            setCaseAnalystFilter={setCaseAnalystFilter}
            caseSort={caseSort}
            setCaseSort={setCaseSort}
            caseFilterMenu={caseFilterMenu}
            setCaseFilterMenu={setCaseFilterMenu}
            onRowClick={navigateToBuilder}
            onDelete={setConfirmDeleteId}
          />
        ) : (
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Canvas area */}
            <div className="flex-1 relative overflow-hidden bg-f-canvas-bg">
              {isCanvasVisible ? (
                <WorkflowCanvas
                  editablePlan={editablePlan}
                  workflowState={workflowState}
                  activeStep={activeStep}
                  selectedNode={selectedNode}
                  onSelectNode={handleSelectNode}
                  onEdgeClick={setSelectedEdge}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-f-t4 text-xs mb-1">워크플로 캔버스</div>
                    <div className="text-f-t4 text-[11px]">분석 계획을 승인하면 노드 그래프가 표시됩니다.</div>
                  </div>
                </div>
              )}
            </div>

            {/* Splitter */}
            <div
              className="w-[3px] bg-f-border hover:bg-f-accent cursor-col-resize shrink-0 z-10 transition-colors"
              onMouseDown={e => {
                e.preventDefault();
                isDraggingSplitterRef.current = true;
                document.body.style.cursor = 'col-resize';
              }}
            />

            {/* Analysis panel */}
            <div
              className="border-l border-f-border flex flex-col min-h-0 shrink-0"
              style={{ width: panelWidth }}
            >
              <AnalysisPanel
                workflowState={workflowState}
                diskImagePath={diskImagePath}
                diskImageReady={diskImageReady}
                diskImageCheck={diskImageCheck}
                pathStepDone={pathStepDone}
                setPathStepDone={setPathStepDone}
                setDiskImagePath={setDiskImagePath}
                attachedFile={attachedFile}
                chatInputText={chatInputText}
                setChatInputText={setChatInputText}
                submittedPrompt={submittedPrompt}
                strategySteps={strategySteps}
                setStrategySteps={setStrategySteps}
                editablePlan={editablePlan}
                setEditablePlan={setEditablePlan}
                planRound={planRound}
                rejectionHistory={rejectionHistory}
                showReasoning={showReasoning}
                setShowReasoning={setShowReasoning}
                reportState={reportState}
                setShowReportViewer={setShowReportViewer}
                rejectionReasonRef={rejectionReasonRef}
                strategyEditReasonRef={strategyEditReasonRef}
                strategyBackupRef={strategyBackupRef}
                onIntakeSubmit={handleIntakeSubmit}
                onApproveStrategy={handleApproveStrategy}
                onStrategyEditRequest={handleStrategyEditRequest}
                onStrategyEditCancel={handleStrategyEditCancel}
                onStrategyEditSubmit={handleStrategyEditSubmit}
                onSyncPlanWithStrategy={syncPlanWithStrategy}
                onStrategyDirectEdit={handleStrategyDirectEdit}
                onApprovePlan={handleApprovePlan}
                onRejectPlan={handleRejectPlan}
                onStartEdit={handleStartEdit}
                onCancelEdit={handleCancelEdit}
                onSubmitEdit={handleSubmitEdit}
                onCancelReject={handleCancelReject}
                onRerequest={handleRerequest}
                onApproveReport={handleApproveReport}
                onOpenMcpModal={openMcpModal}
                onEvidenceFilePick={e => {
                  const file = e.target.files?.[0];
                  if (file) setAttachedFile({ name: file.name });
                  e.target.value = '';
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
