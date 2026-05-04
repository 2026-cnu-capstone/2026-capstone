'use client';

import { X, FileText, Download } from 'lucide-react';
import type { PlanStep } from '@/types';

interface Props {
  editablePlan: PlanStep[];
  submittedPrompt: string;
  onClose: () => void;
}

export default function ReportViewerModal({ editablePlan, submittedPrompt, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-[640px] max-h-[85vh] bg-f-surface rounded-xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-f-border flex justify-between items-center shrink-0 bg-slate-800">
          <span className="text-[13px] font-semibold text-slate-100 flex items-center gap-1.5">
            <FileText size={14} className="text-sky-300" /> 디지털 포렌식 분석 보고서
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 border-none bg-white/10 rounded cursor-pointer flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto cp-scroll px-7 py-6 flex flex-col gap-5 bg-slate-50">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-bold text-f-t1 mb-1">디지털 포렌식 분석 보고서</div>
              <div className="text-xs text-f-t3">사건번호: DF-2026-0425 · 생성일: 2026-04-25</div>
            </div>
            <span className="px-2.5 py-1 bg-green-50 border border-green-200 rounded text-[11px] text-f-success font-semibold">최종본</span>
          </div>

          <div className="h-px bg-f-border" />

          <div>
            <div className="text-[13px] font-semibold text-f-t1 mb-2.5">1. 사건 개요</div>
            <div className="text-xs text-f-t2 leading-7 bg-f-surface border border-f-border rounded-md px-3.5 py-3">
              {submittedPrompt || '2023 KDFS 디스크 이미지에서 랜섬웨어 감염 경로를 추적하고, 피해 범위 및 데이터 유출 여부를 확인해 주세요.'}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-f-t1 mb-2.5">2. 분석 환경</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['증거물', '2023_KDFS.E01 (50 GB)'],
                ['저장 경로', '/Volumes/T7 Shield/2023_KDFS.E01'],
                ['파일시스템', 'NTFS'],
                ['분석 도구', editablePlan.map(p => p.mcp).join(', ')],
                ['SHA-256', '7c4a...f2e1 (검증 완료)'],
              ].map(([k, v]) => (
                <div key={k} className="bg-f-surface border border-f-border rounded-[5px] px-3 py-2">
                  <div className="text-[10px] text-f-t4 mb-0.5">{k}</div>
                  <div className="text-[11px] font-mono text-f-t2">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-f-t1 mb-2.5">3. 주요 발견 사항</div>
            <div className="flex flex-col gap-2">
              {[
                { flag: '위험', label: '랜섬웨어 실행 확인 — svchost32.exe, encrypt_tool.exe', sub: 'Registry UserAssist · Prefetch 교차 검증 · 2023-09-15T02:31 최초 실행', color: 'border-f-danger', badgeCls: 'text-f-danger bg-red-50 border-red-200' },
                { flag: '주의', label: '파일 암호화 142건 · $SI↔$FN 타임스탬프 불일치 5건', sub: 'MFT 타임라인 분석 결과 · .locked 확장자 변경 패턴 감지', color: 'border-f-danger', badgeCls: 'text-f-danger bg-red-50 border-red-200' },
                { flag: '추적', label: 'C2 서버 통신 12건 · 외부 데이터 유출 의심 4건', sub: '45.33.32.156:443 (beacon) · 185.220.101.34:8443 (exfil 524KB)', color: 'border-f-warn', badgeCls: 'text-f-warn bg-amber-50 border-amber-200' },
                { flag: '감염경로', label: '피싱 이메일 → 악성 첨부 파일 → 랜섬웨어 설치', sub: 'support@ms-security-alert.com · security_patch.zip → optimizer.zip → svchost32.exe', color: 'border-f-accent', badgeCls: 'text-f-accent bg-blue-50 border-blue-200' },
              ].map(item => (
                <div key={item.label} className={`bg-f-surface border border-f-border rounded-md px-3.5 py-2.5 border-l-[3px] ${item.color}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[9px] font-bold border rounded px-1 py-[1px] ${item.badgeCls}`}>{item.flag}</span>
                    <span className="text-xs font-medium text-f-t1">{item.label}</span>
                  </div>
                  <div className="text-[11px] text-f-t3">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-f-t1 mb-2.5">4. 분석 단계별 결과</div>
            {editablePlan.map((item, i) => (
              <div key={item.step} className="flex gap-3 mb-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-[10px] font-bold text-f-success shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div className="flex-1 bg-f-surface border border-f-border rounded-[5px] px-3 py-2.5">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold text-f-t1">{item.name}</span>
                    <span className="text-[10px] font-mono text-f-accent bg-blue-50 px-1.5 py-[2px] rounded">{item.mcp}</span>
                  </div>
                  <span className="text-[11px] text-f-t3">
                    {i === 0 && 'UserAssist · RunMRU 분석 · 랜섬웨어 실행 흔적 3건'}
                    {i === 1 && 'Security.evtx 분석 · 비정상 로그인 8건 탐지'}
                    {i === 2 && 'Prefetch 파싱 · 의심 실행 파일 3건 식별'}
                    {i === 3 && 'MFT 타임라인 재구성 · 암호화 이벤트 142건'}
                    {i === 4 && 'VSS 스냅샷 2건 확인 · 삭제된 섀도 복사본 3건'}
                    {i === 5 && 'C2 서버 통신 12건 · 외부 전송 의심 4건'}
                    {i === 6 && '예약 작업 분석 · 악성 자동실행 1건 감지'}
                    {i === 7 && '브라우저 방문기록 2,341건 · 다운로드 URL 1건'}
                    {i === 8 && '피싱 이메일 2건 · 악성 첨부 파일 1건'}
                    {i === 9 && '설치 프로그램 87건 · 의심 프로그램 2건'}
                    {i > 9 && '실행 완료'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-f-t4 text-center pt-2 border-t border-f-border">
            본 보고서는 Forensic AI Agent v1.2.0에 의해 자동 생성되었습니다.
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-f-border flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="h-[30px] px-3.5 bg-f-surface2 border border-f-border2 rounded text-f-t2 text-[11px] cursor-pointer hover:bg-f-border transition-colors"
          >
            닫기
          </button>
          <button className="h-[30px] px-3.5 bg-f-accent border-none rounded text-white text-[11px] font-medium cursor-pointer flex items-center gap-1 hover:bg-blue-700 transition-colors">
            <Download size={12} /> 보고서 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}
