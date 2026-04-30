'use client';

import { Trash2 } from 'lucide-react';

interface Props {
  caseId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteCaseModal({ caseId, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-[300] flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="w-[380px] bg-f-surface rounded-xl shadow-2xl p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-f-danger" />
          </div>
          <div>
            <div className="text-sm font-semibold text-f-t1 mb-1">케이스 삭제</div>
            <div className="text-xs text-f-t3 leading-relaxed">
              <span className="font-mono text-f-t2">{caseId}</span> 케이스를 삭제하시겠습니까?<br />
              이 작업은 되돌릴 수 없습니다.
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="h-8 px-4 bg-f-surface2 border border-f-border2 rounded-[5px] text-f-t2 text-xs cursor-pointer hover:bg-f-border transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="h-8 px-4 bg-f-danger border-none rounded-[5px] text-white text-xs font-medium cursor-pointer flex items-center gap-1 hover:bg-red-700 transition-colors"
          >
            <Trash2 size={12} /> 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
