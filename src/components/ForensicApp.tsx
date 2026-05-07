'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  detectDiskImageFormat, recommendMcpForStrategyStep,
} from '@/lib/utils';
import { api } from '@/lib/api';
import { useAnalysisWebSocket, WsEvent } from '@/hooks/useAnalysisWebSocket';
import { useSplitter } from '@/hooks/useSplitter';
import { useCases } from '@/hooks/useCases';
import { DEFAULT_STRATEGY_STEPS, DEFAULT_PLAN } from '@/lib/constants';
import type {
  WorkflowState, ReportState, ActiveCase, PlanStep, StrategyStep,
  RejectionRecord, SelectedEdge, McpModalState, CaseSort,
} from '@/types';

const WorkflowCanvas = dynamic(() => import('./WorkflowCanvas'), { ssr: false });

export default function ForensicApp() {
  const [currentView, setCurrentView] = useState<'list' | 'builder'>('list');
  const [diskImagePath, setDiskImagePath] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string } | null>(null);
  const [pathStepDone, setPathStepDone] = useState(false);
  const [workflowState, setWorkflowState] = useState<WorkflowState>('idle');
  const { width: panelWidth, startDragging: startSplitterDrag } = useSplitter();

  const rejectionReasonRef = useRef('');
  const strategyEditReasonRef = useRef('');
  const strategyBackupRef = useRef<StrategyStep[]>(DEFAULT_STRATEGY_STEPS.map(s => ({ ...s })));
  const planBackupRef = useRef<PlanStep[]>(DEFAULT_PLAN.map(p => ({ ...p })));
  const runningRef = useRef(false);
  const runStartTimeRef = useRef<number | null>(null);

  const [rejectionHistory, setRejectionHistory] = useState<RejectionRecord[]>([]);
  const [rejectedPlanSnapshot, setRejectedPlanSnapshot] = useState<PlanStep[] | null>(null);
  const [planRound, setPlanRound] = useState(1);
  const [strategySteps, setStrategySteps] = useState<StrategyStep[]>(DEFAULT_STRATEGY_STEPS.map(s => ({ ...s })));
  const [chatInputText, setChatInputText] = useState('');
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const [reportState, setReportState] = useState<ReportState>('idle');
  const [elapsedTime, setElapsedTime] = useState('');
  const [showReportViewer, setShowReportViewer] = useState(false);
  const [reportData, setReportData] = useState<{ summary: string; report: string; dfxml: string } | null>(null);
  const [taskResults, setTaskResults] = useState<Array<{ task_id?: string; agent_name?: string; status?: string; output?: string }>>([]);
  const [nodeDfxmlFragments, setNodeDfxmlFragments] = useState<Record<number, string>>({});
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdge | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [editablePlan, setEditablePlan] = useState<PlanStep[]>(DEFAULT_PLAN.map(p => ({ ...p })));
  const [mcpModal, setMcpModal] = useState<McpModalState>({ open: false, stepIdx: null });
  const [mcpSearch, setMcpSearch] = useState('');

  const { cases, activeCase, setActiveCase, createCase, deleteCase } = useCases();
  const [newCaseModalOpen, setNewCaseModalOpen] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState('');
  const [caseSearchQuery, setCaseSearchQuery] = useState('');
  const [caseStatusFilter, setCaseStatusFilter] = useState('all');
  const [caseAnalystFilter, setCaseAnalystFilter] = useState('all');
  const [caseSort, setCaseSort] = useState<CaseSort>('dateDesc');
  const [caseFilterMenu, setCaseFilterMenu] = useState<string | null>(null);

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
    setElapsedTime('');
    setShowReportViewer(false);
    setEditablePlan(DEFAULT_PLAN.map(p => ({ ...p })));
    setStrategySteps(DEFAULT_STRATEGY_STEPS.map(s => ({ ...s })));
    setSelectedNode(null);
    setActiveStep(-1);
  }, []);

  const handleCreateNewCase = useCallback(() => {
    if (!createCase(newCaseTitle)) return;
    setNewCaseModalOpen(false);
    setNewCaseTitle('');
  }, [createCase, newCaseTitle]);

  const buildPlanFromStrategySteps = useCallback((steps: StrategyStep[], prevPlan: PlanStep[] = []) =>
    steps.map((step, idx) => ({
      step: idx + 1,
      name: step.text,
      mcp: prevPlan[idx]?.mcp || recommendMcpForStrategyStep(step.text),
    })), []);

  const syncPlanWithStrategy = useCallback(() => {
    setEditablePlan(prev => buildPlanFromStrategySteps(strategySteps, prev));
  }, [buildPlanFromStrategySteps, strategySteps]);

  const handleIntakeSubmit = useCallback(async () => {
    if (!pathStepDone || !diskImageReady || !chatInputText.trim()) return;
    const prompt = chatInputText.trim();
    setSubmittedPrompt(prompt);
    setChatInputText('');
    setWorkflowState('plan_thinking');
    setShowReasoning(false);
    try {
      const result = await api.startAnalysis({
        case_id: activeCase.id,
        disk_image_path: diskImagePath,
        prompt,
      });
      const lines = result.strategy.split('\n').filter(l => l.trim().startsWith('-'));
      setStrategySteps(lines.map((l, i) => ({ id: i + 1, text: l.replace(/^-\s*/, '').trim() })));
      setWorkflowState('strategy_review');
    } catch (e) {
      console.error('startAnalysis failed:', e);
      setWorkflowState('idle');
    }
  }, [pathStepDone, diskImageReady, chatInputText, activeCase.id, diskImagePath]);

  const handleApproveStrategy = useCallback(async () => {
    setWorkflowState('mcp_plan_thinking');
    try {
      const result = await api.approveStrategy(activeCase.id, { approved: true });
      if (result.plan_ready && result.steps) {
        setEditablePlan(result.steps.map((s: any, i: number) => ({
          step: i + 1,
          name: s.name || s.purpose || '',
          mcp: (s.mcp_server && s.mcp_server.toLowerCase() !== 'none') ? s.mcp_server : 'Dissect MCP',
        })));
        setWorkflowState('plan_requested');
      }
    } catch (e) {
      console.error('approveStrategy failed:', e);
      setWorkflowState('strategy_review');
    }
  }, [activeCase.id]);

  const handleStrategyEditRequest = useCallback(() => setWorkflowState('strategy_edit_request'), []);
  const handleStrategyDirectEdit = useCallback(() => setWorkflowState('strategy_editing'), []);
  const handleStrategyEditCancel = useCallback(() => {
    strategyEditReasonRef.current = '';
    setWorkflowState('strategy_review');
  }, []);
  const handleStrategyEditSubmit = useCallback(async () => {
    const feedback = strategyEditReasonRef.current.trim();
    setWorkflowState('plan_thinking');
    setShowReasoning(false);
    try {
      const result = await api.approveStrategy(activeCase.id, { approved: false, feedback });
      if (result.strategy) {
        const lines = result.strategy.split('\n').filter((l: string) => l.trim().startsWith('-'));
        setStrategySteps(lines.map((l: string, i: number) => ({ id: i + 1, text: l.replace(/^-\s*/, '').trim() })));
      }
      strategyEditReasonRef.current = '';
      setWorkflowState('strategy_review');
    } catch (e) {
      console.error('strategyEditSubmit failed:', e);
      strategyEditReasonRef.current = '';
      setWorkflowState('strategy_review');
    }
  }, [activeCase.id]);

  const handleApproveReport = useCallback(async () => {
    setReportState('generating');
    try {
      await api.generateReport(activeCase.id);
      setReportState('done');
    } catch (e) {
      console.error('generateReport failed:', e);
      setReportState('idle');
    }
  }, [activeCase.id]);

  const handleDownloadReport = useCallback(() => {
    const lines = [
      '디지털 포렌식 분석 보고서',
      '='.repeat(50),
      `생성일: ${new Date().toISOString().slice(0, 10)}`,
      `케이스: ${activeCase.id} — ${activeCase.title}`,
      '',
      '1. 사건 개요',
      '-'.repeat(30),
      submittedPrompt || '(없음)',
      '',
    ];
    if (reportData?.summary) {
      lines.push('2. 분석 요약', '-'.repeat(30), reportData.summary, '');
    }
    if (reportData?.report) {
      lines.push(`${reportData?.summary ? '3' : '2'}. 상세 보고서`, '-'.repeat(30), reportData.report);
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCase.id}_forensic_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reportData, activeCase, submittedPrompt]);

  const handleApprovePlan = useCallback(async () => {
    try {
      await api.approvePlan(activeCase.id, { approved: true });
      setWorkflowState('approved');
    } catch (e) {
      console.error('approvePlan failed:', e);
      setWorkflowState('plan_requested');
    }
  }, [activeCase.id]);
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
  const handleRerequest = useCallback(async () => {
    const reason = rejectionReasonRef.current.trim();
    if (!reason) return;
    setRejectionHistory(prev => [...prev, { round: planRound, reason, plan: rejectedPlanSnapshot! }]);
    setPlanRound(p => p + 1);
    rejectionReasonRef.current = '';
    setRejectedPlanSnapshot(null);
    setWorkflowState('mcp_plan_thinking');

    try {
      const result = await api.approvePlan(activeCase.id, { approved: false, feedback: reason });
      if ('steps' in result && result.steps) {
        setEditablePlan((result as any).steps.map((s: any, i: number) => ({
          step: i + 1,
          name: s.name || s.purpose || '',
          mcp: (s.mcp_server && s.mcp_server.toLowerCase() !== 'none') ? s.mcp_server : 'Dissect MCP',
        })));
      }
      setWorkflowState('plan_requested');
    } catch (e) {
      console.error('rerequest failed:', e);
      setWorkflowState('plan_requested');
    }
  }, [planRound, rejectedPlanSnapshot, activeCase.id]);

  const handleWsEvent = useCallback((event: WsEvent) => {
    switch (event.type) {
      case 'step_started':
        setActiveStep(event.step_index);
        break;
      case 'step_completed':
        if ('dfxml_fragment' in event && event.dfxml_fragment) {
          setNodeDfxmlFragments(prev => ({ ...prev, [event.step_index]: event.dfxml_fragment as string }));
        }
        break;
      case 'execution_done':
        setActiveStep(-1);
        setWorkflowState('done');
        runningRef.current = false;
        if (runStartTimeRef.current) {
          const ms = Date.now() - runStartTimeRef.current;
          const s = Math.round(ms / 1000);
          setElapsedTime(s < 60 ? `${s}초` : `${Math.floor(s / 60)}분 ${s % 60}초`);
          runStartTimeRef.current = null;
        }
        if ('task_results' in event) {
          setTaskResults(event.task_results as any[]);
        }
        break;
      case 'report_ready':
        setReportState('done');
        if ('summary' in event) {
          setReportData({ summary: event.summary, report: event.report, dfxml: event.dfxml });
        }
        break;
      case 'error':
        console.error('WS error:', (event as any).message);
        break;
    }
  }, []);

  useAnalysisWebSocket({
    caseId: activeCase.id || null,
    onEvent: handleWsEvent,
  });

  const handleRunWorkflow = useCallback(async () => {
    if (workflowState !== 'approved') return;
    runningRef.current = true;
    runStartTimeRef.current = Date.now();
    setWorkflowState('running');
    try {
      await api.executeAnalysis(activeCase.id);
    } catch (e) {
      console.error('executeAnalysis failed:', e);
      runningRef.current = false;
      setWorkflowState('approved');
      setActiveStep(-1);
    }
  }, [workflowState, activeCase.id]);

  const handlePauseWorkflow = useCallback(async () => {
    runningRef.current = false;
    setWorkflowState('approved');
    setActiveStep(-1);
    try {
      await api.pauseAnalysis(activeCase.id);
    } catch (e) {
      console.error('pauseAnalysis failed:', e);
    }
  }, [activeCase.id]);

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
    deleteCase(confirmDeleteId);
    setConfirmDeleteId(null);
  }, [confirmDeleteId, deleteCase]);

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
          reportData={reportData}
          taskResults={taskResults}
          diskImagePath={diskImagePath}
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
                  dfxmlFragments={nodeDfxmlFragments}
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
              onMouseDown={startSplitterDrag}
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
                taskResults={taskResults}
                elapsedTime={elapsedTime}
                onDownloadReport={handleDownloadReport}
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
