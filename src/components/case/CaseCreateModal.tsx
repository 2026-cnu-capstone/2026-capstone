'use client';
import { useState } from 'react';
import { X, FolderPlus, Brain } from 'lucide-react';
import { useCaseStore } from '@/stores/caseStore';
import { useRouter } from 'next/navigation';

interface Props {
  onClose: () => void;
}

export default function CaseCreateModal({ onClose }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createCase } = useCaseStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      const newCase = await createCase(name.trim(), description.trim());
      onClose();
      router.push(`/case/${newCase.id}`);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 px-5 py-4'>
          <div className='flex items-center gap-2.5'>
            <div className='rounded-lg border border-blue-200 bg-blue-100 p-1.5'>
              <FolderPlus size={15} className='text-blue-600' />
            </div>
            <h2 className='font-semibold text-slate-900'>새 케이스 생성</h2>
          </div>
          <button
            onClick={onClose}
            aria-label='닫기'
            className='flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none'
          >
            <X size={15} aria-hidden='true' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4 p-5'>
          <div>
            <label className='mb-1.5 block text-xs font-semibold tracking-wide text-slate-600 uppercase'>
              케이스명 <span className='text-blue-500'>*</span>
            </label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='예: USB 유출 조사 사건'
              name='case-name'
              autoComplete='off'
              className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none'
              autoFocus
              required
            />
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold tracking-wide text-slate-600 uppercase'>
              사건 개요
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='사건 배경, 혐의 내용, 수사 목표 등을 입력하세요'
              rows={4}
              name='case-description'
              className='w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 focus:outline-none'
            />
            {/* LLM 힌트 */}
            <div className='mt-2 flex items-start gap-1.5 px-1'>
              <Brain size={11} className='mt-0.5 shrink-0 text-purple-500' />
              <p className='text-[10px] leading-relaxed text-slate-400'>
                사건 개요는 LLM 종합 분석 시 수사 맥락으로 활용됩니다.
                자세할수록 정확한 분석 결과를 얻을 수 있습니다.
              </p>
            </div>
          </div>

          <div className='flex gap-2.5 pt-1'>
            <button
              type='button'
              onClick={onClose}
              className='flex-1 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200'
            >
              취소
            </button>
            <button
              type='submit'
              disabled={!name.trim() || isLoading}
              className='flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none'
            >
              {isLoading ? '생성 중…' : '케이스 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
