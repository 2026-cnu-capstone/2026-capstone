'use client';

interface Props {
  newCaseTitle: string;
  setNewCaseTitle: (v: string) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export default function NewCaseModal({ newCaseTitle, setNewCaseTitle, onCreate, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-[301] flex items-center justify-center"
      onClick={onCancel}
    >
      <div
        className="w-[400px] bg-f-surface rounded-xl shadow-2xl p-6 flex flex-col gap-3.5"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-[15px] font-semibold text-f-t1">새 케이스</div>
        <p className="text-xs text-f-t3 leading-relaxed">케이스 ID는 생성 시 자동 부여됩니다.</p>
        <div>
          <label className="text-[10px] font-semibold text-f-t4 tracking-wider block mb-1.5">제목</label>
          <input
            type="text"
            value={newCaseTitle}
            onChange={e => setNewCaseTitle(e.target.value)}
            placeholder="예) USB 유출 의심 건"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') onCreate(); }}
            className="w-full h-9 bg-f-surface2 border border-f-border rounded-md px-2.5 text-[13px] text-f-t1 outline-none focus:border-f-accent"
          />
        </div>
        <div className="flex gap-2 justify-end mt-1">
          <button
            type="button"
            onClick={onCancel}
            className="h-[34px] px-3.5 bg-f-surface2 border border-f-border2 rounded-md text-f-t2 text-xs cursor-pointer hover:bg-f-border transition-colors"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!newCaseTitle.trim()}
            className={`h-[34px] px-4 rounded-md text-white text-xs font-medium transition-colors
              ${newCaseTitle.trim() ? 'bg-f-accent cursor-pointer hover:bg-blue-700' : 'bg-f-border2 cursor-default'}`}
          >
            생성
          </button>
        </div>
      </div>
    </div>
  );
}
