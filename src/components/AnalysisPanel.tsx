'use client';

import { useRef } from 'react';
import {
  ChevronRight, ChevronLeft, Check, X, AlertTriangle, RotateCcw, HardDrive,
  ChevronDown, Cpu, BookOpen, Edit2, Save, FileText, FileSearch, Clock, Download,
} from 'lucide-react';
import type {
  WorkflowState, ReportState, PlanStep, StrategyStep, RejectionRecord,
} from '@/types';
import { getDiskImageMetaRows, getBasename } from '@/lib/utils';

interface Props {
  workflowState: WorkflowState;
  diskImagePath: string;
  diskImageReady: boolean;
  diskImageCheck: { ok: boolean; format: string; error: string };
  pathStepDone: boolean;
  setPathStepDone: (v: boolean) => void;
  setDiskImagePath: (v: string) => void;
  attachedFile: { name: string } | null;
  chatInputText: string;
  setChatInputText: (v: string) => void;
  submittedPrompt: string;
  strategySteps: StrategyStep[];
  setStrategySteps: (fn: (prev: StrategyStep[]) => StrategyStep[]) => void;
  editablePlan: PlanStep[];
  setEditablePlan: (fn: (prev: PlanStep[]) => PlanStep[]) => void;
  planRound: number;
  rejectionHistory: RejectionRecord[];
  showReasoning: boolean;
  setShowReasoning: (fn: (v: boolean) => boolean) => void;
  reportState: ReportState;
  setShowReportViewer: (v: boolean) => void;
  rejectionReasonRef: React.MutableRefObject<string>;
  strategyEditReasonRef: React.MutableRefObject<string>;
  strategyBackupRef: React.MutableRefObject<StrategyStep[]>;
  onIntakeSubmit: () => void;
  onApproveStrategy: () => void;
  onStrategyEditRequest: () => void;
  onStrategyEditCancel: () => void;
  onStrategyEditSubmit: () => void;
  onSyncPlanWithStrategy: () => void;
  onStrategyDirectEdit: () => void;
  onApprovePlan: () => void;
  onRejectPlan: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: () => void;
  onCancelReject: () => void;
  onRerequest: () => void;
  onApproveReport: () => void;
  onOpenMcpModal: (idx: number) => void;
  onEvidenceFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  taskResults?: Array<{ task_id?: string; agent_name?: string; status?: string; output?: string }>;
  elapsedTime?: string;
  onDownloadReport?: () => void;
}

const PROMPT_VISIBLE_STATES: WorkflowState[] = [
  'strategy_review', 'strategy_edit_request', 'strategy_editing',
  'mcp_plan_thinking', 'plan_requested', 'rejected', 'editing', 'approved', 'running', 'done',
];

const MCP_PLAN_HIDDEN_STATES: WorkflowState[] = [
  'idle', 'plan_thinking', 'strategy_review', 'strategy_edit_request',
  'strategy_editing', 'mcp_plan_thinking',
];

function PulseLoader({ label }: { label: string }) {
  return (
    <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-purple rounded-r-md p-3 flex items-center gap-2">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full bg-f-purple ${i === 0 ? 'animate-pulse2' : i === 1 ? 'animate-pulse2d' : 'animate-pulse2e'}`} />
        ))}
      </div>
      <span className="text-xs text-f-t3">{label}</span>
    </div>
  );
}

function MetaBlock({ path, check }: { path: string; check: { ok: boolean; format: string } }) {
  const rows = getDiskImageMetaRows(path, check);
  if (!rows.length) return null;
  return (
    <div className="mt-2.5 bg-f-surface border border-f-border rounded-md px-3 py-2.5">
      <div className="text-[9px] font-bold tracking-widest uppercase text-f-t4 mb-2">디스크 이미지 메타데이터</div>
      <dl className="flex flex-col gap-1.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="grid gap-2 text-[11px] items-start" style={{ gridTemplateColumns: '118px 1fr' }}>
            <dt className="text-f-t4 font-medium">{label}</dt>
            <dd className="text-f-t2 leading-snug break-words" title={value}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function AnalysisPanel({
  workflowState, diskImagePath, diskImageReady, diskImageCheck, pathStepDone,
  setPathStepDone, setDiskImagePath, attachedFile, chatInputText, setChatInputText,
  submittedPrompt, strategySteps, setStrategySteps, editablePlan, setEditablePlan,
  planRound, rejectionHistory, showReasoning, setShowReasoning, reportState,
  setShowReportViewer, rejectionReasonRef, strategyEditReasonRef, strategyBackupRef,
  onIntakeSubmit, onApproveStrategy, onStrategyEditRequest, onStrategyEditCancel,
  onStrategyEditSubmit, onSyncPlanWithStrategy, onStrategyDirectEdit, onApprovePlan, onRejectPlan,
  onStartEdit, onCancelEdit, onSubmitEdit, onCancelReject, onRerequest, onApproveReport,
  onOpenMcpModal, onEvidenceFilePick, taskResults, elapsedTime, onDownloadReport,
}: Props) {
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);
  const evidenceName = getBasename(diskImagePath) || attachedFile?.name || '증거물';

  const isPromptVisible = PROMPT_VISIBLE_STATES.includes(workflowState);
  const isMcpPlanVisible = !MCP_PLAN_HIDDEN_STATES.includes(workflowState);

  return (
    <div className="bg-f-surface flex flex-col min-h-0 shrink-0" style={{ width: '100%', height: '100%' }}>
      <div className="h-10 border-b border-f-border shrink-0 flex items-center px-3.5">
        <span className="text-xs font-semibold text-f-t2">분석 패널</span>
      </div>

      <div className="flex-1 overflow-y-auto pb-16 cp-scroll">
        {/* Disk image section */}
        <div className="px-3.5 pt-3.5">
          <p className="text-[10px] font-bold tracking-widest uppercase text-f-t4 mb-2">디스크 이미지</p>

          {workflowState === 'idle' && !pathStepDone && (
            <div className="bg-f-surface2 border border-f-border rounded-md px-3 py-2.5 mb-3">
              <input
                type="text"
                value={diskImagePath}
                onChange={e => setDiskImagePath(e.target.value)}
                placeholder="/evidence/case01/disk.E01"
                className={`w-full h-8 bg-f-surface border rounded-[5px] px-2 text-[11px] text-f-t1 outline-none font-mono focus:border-f-accent
                  ${diskImagePath && !diskImageReady ? 'border-f-danger' : 'border-f-border'}`}
              />
              {diskImagePath.trim() && (
                <div className={`mt-1.5 text-[10px] flex items-center gap-1 ${diskImageReady ? 'text-f-success' : 'text-f-danger'}`}>
                  {diskImageReady ? <Check size={11} /> : <AlertTriangle size={11} />}
                  {diskImageReady ? diskImageCheck.format : diskImageCheck.error}
                </div>
              )}
              <MetaBlock path={diskImagePath} check={diskImageCheck} />
              <button
                type="button"
                disabled={!diskImageReady}
                onClick={() => setPathStepDone(true)}
                className={`mt-2.5 w-full h-[30px] border-none rounded-[5px] text-white text-[11px] font-medium flex items-center justify-center gap-1.5
                  ${diskImageReady ? 'bg-f-accent cursor-pointer hover:bg-blue-700' : 'bg-f-border2 cursor-default'}`}
              >
                <ChevronRight size={14} /> 다음
              </button>
            </div>
          )}

          {workflowState === 'idle' && pathStepDone && (
            <div className="mb-3">
              <div className="bg-f-surface2 border border-f-border rounded-md px-2.5 py-2 flex items-center gap-2">
                <span className="flex-1 text-[11px] font-mono text-f-t2 overflow-hidden text-ellipsis whitespace-nowrap" title={diskImagePath}>
                  {diskImagePath}
                </span>
                <span className="text-[10px] text-f-t4 font-mono">{diskImageCheck.format}</span>
                <button
                  type="button"
                  onClick={() => setPathStepDone(false)}
                  className="shrink-0 h-[26px] px-2 bg-f-surface border border-f-border2 rounded text-[10px] text-f-t3 cursor-pointer hover:bg-f-surface2 transition-colors"
                >
                  변경
                </button>
              </div>
              <MetaBlock path={diskImagePath} check={diskImageCheck} />
            </div>
          )}

          {workflowState !== 'idle' && (
            <div className="mb-3">
              <div className="bg-f-surface2 border border-f-border rounded-md px-2.5 py-2 text-[11px] font-mono text-f-t2 overflow-hidden text-ellipsis whitespace-nowrap" title={diskImagePath}>
                {diskImagePath}
              </div>
              {diskImageReady && <MetaBlock path={diskImagePath} check={diskImageCheck} />}
            </div>
          )}
        </div>

        {/* plan_thinking */}
        {workflowState === 'plan_thinking' && (
          <div className="px-3.5 pt-4">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="flex-1 h-px bg-f-border" />
              <span className="text-[10px] text-f-t4 whitespace-nowrap">전송됨</span>
              <div className="flex-1 h-px bg-f-border" />
            </div>
            <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
            <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-purple rounded-r-md p-3 flex flex-col gap-2.5">
              {[
                { icon: <BookOpen size={11} />, text: '유사 사례 검색 중...' },
                { icon: <Cpu size={11} />, text: 'AI 분석 전략 도출 중...' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-f-t3">
                  <span className="text-f-purple">{item.icon}</span>
                  {item.text}
                  <div className="ml-auto flex gap-0.5">
                    {[0, 1, 2].map(j => <div key={j} className="w-0.5 h-0.5 rounded-full bg-f-purple opacity-50" />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* submitted prompt thread */}
        {isPromptVisible && submittedPrompt && (
          <div className="px-3.5 pt-4">
            <div className="flex items-center gap-2 mb-3.5">
              <div className="flex-1 h-px bg-f-border" />
              <span className="text-[10px] text-f-t4 whitespace-nowrap">전송됨</span>
              <div className="flex-1 h-px bg-f-border" />
            </div>

            {/* evidence chip */}
            <div className="flex justify-end mb-2.5">
              <div className="bg-f-surface2 border border-f-border rounded-md px-2.5 py-1.5 flex items-center gap-2 text-[11px]">
                <HardDrive size={12} className="text-f-accent" />
                <span className="font-mono text-f-t2">{evidenceName}</span>
                <span className="text-f-border2">·</span>
                <span className="font-mono text-f-t4">{diskImageCheck.format}</span>
              </div>
            </div>

            {/* user message bubble */}
            <div className="flex justify-end mb-3">
              <div className="max-w-[86%] bg-f-accent-light border border-blue-100 rounded-lg rounded-br-sm px-3 py-2 text-xs text-f-t1 leading-snug">
                {submittedPrompt}
              </div>
            </div>

            {/* strategy card */}
            {['strategy_review', 'plan_requested', 'rejected', 'editing', 'approved', 'running', 'done'].includes(workflowState) && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-purple rounded-r-md p-3 flex flex-col gap-2.5">
                  <div className="bg-f-surface2 border border-f-border rounded-md px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Cpu size={11} className="text-f-purple" />
                      <span className="text-[10px] font-bold text-f-purple tracking-wider uppercase">분석 전략</span>
                      {workflowState !== 'strategy_review' && (
                        <span className="ml-1.5 text-[9px] font-semibold text-f-success bg-green-50 px-1.5 py-0.5 rounded">확정</span>
                      )}
                    </div>
                    <div className="bg-f-surface border border-f-border rounded-[5px] overflow-hidden">
                      {strategySteps.map((step, idx) => (
                        <div key={step.id} className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] ${idx < strategySteps.length - 1 ? 'border-b border-f-border' : ''}`}>
                          <span className="text-f-t4 min-w-[18px]">{idx + 1}.</span>
                          <span className="flex-1 text-f-t2">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* reasoning toggle */}
                  <div>
                    <div
                      onClick={() => setShowReasoning(v => !v)}
                      className="flex items-center gap-1 text-[11px] text-f-purple cursor-pointer select-none"
                    >
                      <ChevronDown size={12} style={{ transform: showReasoning ? 'none' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                      AI 판단 근거
                    </div>
                    {showReasoning && (
                      <div className="mt-2 bg-f-surface2 border border-f-border rounded-md px-3 py-2.5">
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'DF-2023-1124', title: 'USB 삭제파일 복구', sim: 94 },
                            { id: 'DF-2023-0867', title: 'NTFS 타임스탬프 분석', sim: 87 },
                          ].map(c => (
                            <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 bg-f-surface border border-f-border rounded">
                              <div className="w-7 h-7 rounded bg-blue-50 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-f-accent">{c.sim}%</span>
                              </div>
                              <div className="min-w-0">
                                <div className="text-[10px] font-mono text-f-accent">{c.id}</div>
                                <div className="text-[11px] text-f-t2 overflow-hidden text-ellipsis whitespace-nowrap">{c.title}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {workflowState === 'strategy_review' && (
                    <div className="flex gap-1.5 pt-2 border-t border-f-border">
                      <button
                        type="button"
                        onClick={onApproveStrategy}
                        className="flex-1 h-[30px] bg-f-success border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-green-700 transition-colors"
                      >
                        <Check size={12} /> 승인
                      </button>
                      <button
                        type="button"
                        onClick={onStrategyEditRequest}
                        className="flex-1 h-[30px] bg-f-danger border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-red-700 transition-colors"
                      >
                        <X size={12} /> 수정 요청
                      </button>
                      <button
                        type="button"
                        onClick={() => { strategyBackupRef.current = strategySteps.map(s => ({ ...s })); onStrategyDirectEdit(); }}
                        className="flex-1 h-[30px] bg-transparent border border-f-border2 rounded text-f-t2 text-[11px] cursor-pointer flex items-center justify-center gap-1 hover:bg-f-surface2 transition-colors"
                      >
                        <Edit2 size={12} /> 직접 수정
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* strategy_edit_request */}
            {workflowState === 'strategy_edit_request' && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-f-danger block mb-1">시스템</span>
                <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-warn rounded-r-md p-3 flex flex-col gap-2.5">
                  <p className="text-[11px] text-f-t3 leading-relaxed">전략에 반영할 수정 사항을 입력하세요.</p>
                  <textarea
                    defaultValue=""
                    onChange={e => { strategyEditReasonRef.current = e.target.value; }}
                    placeholder="예) 메모리 덤프 분석을 전략에 포함해 주세요."
                    className="w-full h-[72px] bg-f-surface2 border border-f-border rounded-[5px] px-2.5 py-2 text-xs text-f-t1 resize-none outline-none focus:border-f-warn leading-relaxed"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={onStrategyEditSubmit}
                      className="flex-[2] h-[30px] bg-f-accent border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                    >
                      <RotateCcw size={12} /> 재요청
                    </button>
                    <button
                      type="button"
                      onClick={onStrategyEditCancel}
                      className="flex-1 h-[30px] bg-transparent border border-f-border2 rounded text-f-t3 text-[11px] cursor-pointer flex items-center justify-center gap-1 hover:bg-f-surface2 transition-colors"
                    >
                      <ChevronLeft size={12} /> 이전
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* strategy_editing */}
            {workflowState === 'strategy_editing' && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-purple rounded-r-md p-3 flex flex-col gap-2.5">
                  <p className="text-[11px] text-f-t3 leading-relaxed">
                    내용을 고친 뒤 <strong className="text-f-t2">수정 완료</strong>로 반영하고,
                    아래 전략 카드에서 <strong className="text-f-t2">승인</strong>을 누르면 MCP 계획 단계로 진행합니다.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {strategySteps.map((step, idx) => (
                      <div key={step.id} className="flex items-center gap-1.5 px-2 py-1.5 bg-f-surface2 border border-f-border rounded-[5px]">
                        <span className="text-[11px] text-f-t4 min-w-[18px]">{idx + 1}.</span>
                        <input
                          value={step.text}
                          onChange={e => setStrategySteps(prev => prev.map((it, pi) => pi === idx ? { ...it, text: e.target.value } : it))}
                          className="flex-1 h-[30px] bg-f-surface border border-f-border rounded px-2 text-[11px] text-f-t1 outline-none focus:border-f-accent"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => { onSyncPlanWithStrategy(); onStrategyEditCancel(); }}
                      className="flex-[2] h-[30px] bg-f-accent border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                    >
                      <Save size={12} /> 수정 완료
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStrategySteps(() => strategyBackupRef.current.map(s => ({ ...s }))); onStrategyEditCancel(); }}
                      className="flex-1 h-[30px] bg-transparent border border-f-border2 rounded text-f-t3 text-[11px] cursor-pointer flex items-center justify-center gap-1 hover:bg-f-surface2 transition-colors"
                    >
                      <ChevronLeft size={12} /> 취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* mcp_plan_thinking */}
            {workflowState === 'mcp_plan_thinking' && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                <PulseLoader label="MCP 계획 구성 중" />
              </div>
            )}
          </div>
        )}

        {/* MCP plan + rejection section */}
        {isMcpPlanVisible && (
          <div className="px-3.5 pt-2">
            {/* rejection history */}
            {rejectionHistory.map((item, i) => (
              <div key={i}>
                <div className="mb-3">
                  <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                  <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-warn rounded-r-md p-3 flex flex-col gap-2">
                    <span className="text-xs text-f-t1">분석 계획{item.round > 1 ? ` (수정안 #${item.round})` : ''}</span>
                    {item.plan && (
                      <div className="bg-f-surface2 border border-f-border rounded-[5px] overflow-hidden">
                        {item.plan.map((step, si, arr) => (
                          <div key={step.step} className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] ${si < arr.length - 1 ? 'border-b border-f-border' : ''}`}>
                            <span className="text-f-t4 min-w-[14px]">{step.step}.</span>
                            <span className="flex-1 text-f-t2">{step.name}</span>
                            <span className="font-mono text-[10px] text-f-accent bg-blue-50 px-1.5 py-[2px] rounded">→ {step.mcp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mb-3">
                  <div className="max-w-[86%] bg-red-50 border border-red-100 rounded-lg rounded-br-sm px-3 py-2 text-xs text-f-t1 leading-snug">
                    <span className="block text-[10px] text-f-danger font-semibold mb-1">수정 요청</span>
                    {item.reason || '(반려 사유 없음)'}
                  </div>
                </div>
              </div>
            ))}

            {/* HITL plan card */}
            <div className="mb-3">
              <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
              <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-warn rounded-r-md p-3 flex flex-col gap-2.5">
                <span className="text-xs text-f-t1">
                  MCP 분석 계획{planRound > 1 ? ` (수정안 #${planRound})` : ''}
                </span>

                {/* normal list */}
                {workflowState !== 'editing' && (
                  <div className="bg-f-surface2 border border-f-border rounded-[5px] overflow-hidden">
                    <div className="flex items-center px-2.5 py-1 border-b border-f-border bg-f-surface">
                      <span className="flex-1 text-[9px] font-bold text-f-t4 tracking-wider uppercase">단계</span>
                      <span className="text-[9px] font-bold text-f-t4 tracking-wider uppercase">MCP</span>
                    </div>
                    {editablePlan.map((item, idx, arr) => (
                      <div key={item.step} className={`flex items-center gap-2 px-2.5 py-1.5 text-[11px] ${idx < arr.length - 1 ? 'border-b border-f-border' : ''}`}>
                        <span className="text-f-t4 min-w-[14px]">{item.step}.</span>
                        <span className="flex-1 text-f-t2">{item.name}</span>
                        <button
                          onClick={() => onOpenMcpModal(idx)}
                          className="h-6 px-2 bg-f-accent-light border border-blue-200 rounded text-[10px] font-mono text-f-accent cursor-pointer whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis hover:bg-blue-100 transition-colors"
                          title={item.mcp}
                        >
                          {item.mcp}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* editing mode */}
                {workflowState === 'editing' && (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] text-f-warn font-medium">
                      단계명과 MCP를 고친 뒤 <strong className="text-f-t2">수정 완료</strong>로 반영한 다음, 아래 <strong className="text-f-t2">승인</strong>을 눌러 주세요.
                    </p>
                    {editablePlan.map((item, idx) => (
                      <div key={item.step} className="flex gap-1.5 items-center px-2 py-1.5 bg-f-surface2 border border-f-border rounded-[5px]">
                        <span className="text-[11px] text-f-t4 min-w-[16px]">{item.step}.</span>
                        <input
                          value={item.name}
                          onChange={e => { setEditablePlan(prev => { const next = [...prev]; next[idx] = { ...item, name: e.target.value }; return next; }); }}
                          className="flex-1 h-7 bg-f-surface border border-f-border rounded px-2 text-[11px] text-f-t1 outline-none focus:border-f-accent"
                        />
                        <button
                          onClick={() => onOpenMcpModal(idx)}
                          className="h-7 px-2 bg-f-accent-light border border-blue-200 rounded text-[10px] font-mono text-f-accent cursor-pointer whitespace-nowrap max-w-[120px] overflow-hidden text-ellipsis hover:bg-blue-100 transition-colors"
                          title={item.mcp}
                        >
                          {item.mcp}
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-1.5 mt-0.5">
                      <button
                        onClick={onSubmitEdit}
                        className="flex-[2] h-[30px] bg-f-accent border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                      >
                        <Save size={12} /> 수정 완료
                      </button>
                      <button
                        onClick={onCancelEdit}
                        className="flex-1 h-[30px] bg-transparent border border-f-border2 rounded text-f-t3 text-[11px] cursor-pointer flex items-center justify-center gap-1 hover:bg-f-surface2 transition-colors"
                      >
                        <RotateCcw size={12} /> 취소
                      </button>
                    </div>
                  </div>
                )}

                {/* plan_requested actions */}
                {workflowState === 'plan_requested' && (
                  <div className="flex gap-1.5 pt-2 border-t border-f-border">
                    <button
                      onClick={onApprovePlan}
                      className="flex-1 h-[30px] bg-f-success border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-green-700 transition-colors"
                    >
                      <Check size={12} /> 승인
                    </button>
                    <button
                      onClick={onRejectPlan}
                      className="flex-1 h-[30px] bg-f-danger border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-red-700 transition-colors"
                    >
                      <X size={12} /> 수정 요청
                    </button>
                    <button
                      onClick={onStartEdit}
                      className="flex-1 h-[30px] bg-transparent border border-f-border2 rounded text-f-t2 text-[11px] cursor-pointer flex items-center justify-center gap-1 hover:bg-f-surface2 transition-colors"
                    >
                      <Edit2 size={12} /> 직접 수정
                    </button>
                  </div>
                )}

                {['approved', 'running', 'done'].includes(workflowState) && (
                  <div className="pt-2 border-t border-f-border text-[11px] text-f-success flex items-center gap-1">
                    <Check size={12} /> 분석관 승인 완료
                  </div>
                )}
              </div>
            </div>

            {/* rejection card */}
            {workflowState === 'rejected' && (
              <div className="mb-3">
                <span className="text-[10px] font-semibold text-f-danger block mb-1">시스템</span>
                <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-danger rounded-r-md p-3 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-f-danger shrink-0" />
                    <span className="text-xs font-medium text-f-danger">MCP 계획 수정을 요청했습니다.</span>
                  </div>
                  <p className="text-[11px] text-f-t3 leading-relaxed">사유를 입력한 뒤 재요청하세요.</p>
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[11px] text-f-t4">반려 사유 (선택)</p>
                    <textarea
                      defaultValue=""
                      onChange={e => { rejectionReasonRef.current = e.target.value; }}
                      placeholder="예) 타임라인 분석 단계를 추가해주세요."
                      className="w-full h-[68px] bg-f-surface2 border border-f-border rounded-[5px] px-2.5 py-2 text-xs text-f-t1 resize-none outline-none focus:border-f-danger leading-relaxed"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={onRerequest}
                      className="flex-[2] h-[30px] bg-f-surface2 border border-f-border2 rounded text-f-t2 text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-f-border transition-colors"
                    >
                      <RotateCcw size={12} /> 새 분석 계획 재요청
                    </button>
                    <button
                      onClick={onCancelReject}
                      className="flex-1 h-[30px] bg-transparent border border-f-border2 rounded text-f-t3 text-[11px] cursor-pointer flex items-center justify-center gap-1 hover:bg-f-surface2 transition-colors"
                    >
                      <X size={12} /> 취소
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* done results */}
            {workflowState === 'done' && (
              <>
                {/* 인라인 결과 요약 */}
                <div className="mb-3">
                  <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                  <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-success rounded-r-md overflow-hidden">
                    {/* 헤더 */}
                    <div className="px-3 py-2.5 bg-slate-800 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-slate-100 flex items-center gap-1.5">
                        <FileText size={13} className="text-sky-300" /> 분석 완료 — 결과 요약
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <Clock size={10} /> {elapsedTime || '-'}
                      </div>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                      {/* 사건 개요 */}
                      <div>
                        <div className="text-[9px] font-bold tracking-widest uppercase text-f-t4 mb-1.5">사건 개요</div>
                        <div className="text-[11px] text-f-t2 leading-relaxed bg-f-surface2 border border-f-border rounded px-2.5 py-2">
                          {submittedPrompt || 'USB 저장매체에서 삭제된 한글(hwp) 문서를 복구하고, 타임스탬프 변조 여부를 확인해 주세요.'}
                        </div>
                      </div>

                      {/* 분석 결과 요약 */}
                      <div>
                        <div className="text-[9px] font-bold tracking-widest uppercase text-f-t4 mb-1.5">분석 결과 요약</div>
                        {taskResults && taskResults.length > 0 ? (() => {
                          const successCount = taskResults.filter(r => r.status === 'success').length;
                          const errorCount = taskResults.filter(r => r.status === 'error').length;
                          const items = [
                            {
                              flag: successCount > 0 ? '완료' : '정상',
                              label: successCount > 0 ? `${successCount}개 단계 성공` : '분석 완료',
                              sub: `총 ${taskResults.length}개 단계 실행`,
                              color: 'border-f-success',
                              badge: 'text-f-success bg-green-50',
                            },
                            ...(errorCount > 0 ? [{
                              flag: '오류',
                              label: `${errorCount}개 단계 오류`,
                              sub: '보고서에서 상세 내용을 확인하세요',
                              color: 'border-f-danger',
                              badge: 'text-f-danger bg-red-50',
                            }] : []),
                          ];
                          return (
                            <div className="flex flex-col gap-1.5">
                              {items.map(item => (
                                <div key={item.flag} className={`bg-f-surface border border-f-border rounded px-2.5 py-1.5 border-l-[3px] ${item.color}`}>
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className={`text-[9px] font-bold px-1 py-[1px] rounded ${item.badge}`}>{item.flag}</span>
                                    <span className="text-[11px] font-medium text-f-t1">{item.label}</span>
                                  </div>
                                  <div className="text-[10px] text-f-t3">{item.sub}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })() : (
                          <div className="text-[11px] text-f-t3 bg-f-surface2 border border-f-border rounded px-2.5 py-2">
                            분석이 완료되었습니다. 아래에서 보고서를 생성하세요.
                          </div>
                        )}
                      </div>

                      {/* 분석 단계별 결과 */}
                      <div>
                        <div className="text-[9px] font-bold tracking-widest uppercase text-f-t4 mb-1.5">단계별 결과</div>
                        <div className="flex flex-col gap-1.5">
                          {editablePlan.map((item, i) => (
                            <div key={item.step} className="flex gap-2 items-start">
                              <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-[9px] font-bold text-f-success shrink-0 mt-px">
                                {item.step}
                              </div>
                              <div className="flex-1 bg-f-surface2 border border-f-border rounded px-2 py-1.5">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-[11px] font-medium text-f-t1">{item.name}</span>
                                  <span className="text-[9px] font-mono text-f-accent bg-blue-50 px-1 py-[1px] rounded">{item.mcp}</span>
                                </div>
                                <span className="text-[10px] text-f-t3">
                                  {(() => {
                                    const out = taskResults?.[i]?.output;
                                    return out ? (out.length > 80 ? out.slice(0, 80) + '…' : out) : '실행 완료';
                                  })()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 분석 환경 */}
                      <div>
                        <div className="text-[9px] font-bold tracking-widest uppercase text-f-t4 mb-1.5">분석 환경</div>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            ['증거물', getBasename(diskImagePath) || '(미지정)'],
                            ['컨테이너 포맷', (diskImageCheck.format || '-').toUpperCase()],
                            ['분석 단계', `${editablePlan.length}개 단계`],
                            ['MCP 서버', `${editablePlan.length}개 도구`],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-f-surface2 border border-f-border rounded px-2 py-1.5">
                              <div className="text-[9px] text-f-t4 mb-0.5">{k}</div>
                              <div className="text-[10px] font-mono text-f-t2 truncate">{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* report gate */}
                {reportState === 'idle' && (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                    <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-accent rounded-r-md p-3 flex flex-col gap-2.5">
                      <span className="text-xs text-f-t1">이 결과를 토대로 보고서를 생성하시겠습니까?</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={onApproveReport}
                          className="flex-1 h-[30px] bg-f-accent border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors"
                        >
                          <Check size={12} /> 보고서 생성
                        </button>
                        <button
                          onClick={() => setShowReportViewer(true)}
                          className="flex-1 h-[30px] bg-f-surface2 border border-f-border2 rounded text-f-t2 text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-f-border transition-colors"
                        >
                          <FileSearch size={12} /> 결과 요약보기
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {reportState === 'generating' && (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                    <PulseLoader label="보고서 생성 중..." />
                  </div>
                )}

                {reportState === 'done' && (
                  <div className="mb-3">
                    <span className="text-[10px] font-semibold text-f-purple block mb-1">Agent</span>
                    <div className="bg-f-surface border border-f-border border-l-[3px] border-l-f-success rounded-r-md p-3 flex flex-col gap-2">
                      <span className="text-xs text-f-t1 flex items-center gap-1.5">
                        <Check size={13} className="text-f-success" /> 보고서가 생성되었습니다.
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setShowReportViewer(true)}
                          className="flex-1 h-[30px] bg-f-surface2 border border-f-border2 rounded text-f-t2 text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-f-border transition-colors"
                        >
                          <FileSearch size={12} /> 결과 요약보기
                        </button>
                        <button
                          onClick={onDownloadReport}
                          disabled={!onDownloadReport}
                          className="flex-1 h-[30px] bg-f-accent border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-default"
                        >
                          <Download size={12} /> 보고서 다운로드
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* hidden file input */}
      <input
        ref={evidenceFileInputRef}
        type="file"
        accept=".e01,.dd,.raw,.img,.001"
        className="hidden"
        onChange={onEvidenceFilePick}
      />

      {/* Chat input */}
      <div className="px-3.5 py-2 border-t border-f-border bg-f-surface shrink-0">
        <div
          className={`flex items-center bg-f-surface2 border border-f-border rounded-md p-1 transition-opacity
            ${(workflowState !== 'idle' || (pathStepDone && diskImageReady)) ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}
        >
          <button
            type="button"
            onClick={() => evidenceFileInputRef.current?.click()}
            className="px-1.5 py-1 text-f-t4 bg-none border-none cursor-pointer flex items-center hover:text-f-t2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          </button>
          <input
            type="text"
            value={chatInputText}
            onChange={e => setChatInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (workflowState === 'idle' && pathStepDone && diskImageReady) onIntakeSubmit();
              }
            }}
            placeholder="메시지"
            className="flex-1 bg-transparent border-none outline-none text-xs text-f-t1 px-1.5"
          />
          <button
            onClick={() => { if (workflowState === 'idle' && pathStepDone && diskImageReady) onIntakeSubmit(); }}
            className={`w-[26px] h-[26px] rounded-full border-none flex items-center justify-center text-white shrink-0 transition-colors
              ${chatInputText.trim() && pathStepDone && diskImageReady ? 'bg-f-accent cursor-pointer hover:bg-blue-700' : 'bg-f-border cursor-default'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 1 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
