'use client';
import { useState } from 'react';
import type { Case } from '@/types/Case';
import {
  FolderOpen,
  Plus,
  Clock,
  HardDrive,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import CaseCreateModal from './CaseCreateModal';

interface CaseListProps {
  cases: Case[];
}

export default function CaseList({ cases }: CaseListProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <div className='mb-8 flex items-end justify-between'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <ShieldCheck size={18} className='text-blue-600' />
            <span className='text-xs font-semibold tracking-widest text-blue-500 uppercase'>
              Digital Forensic
            </span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            포렌식 케이스
          </h1>
          <p className='mt-1.5 text-sm text-slate-500'>
            {cases.length > 0
              ? `총${cases.length}개의 수사 케이스`
              : '새 케이스를 생성해 분석을 시작하세요'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='blue-500/25 hover:-tanslate-y-0.5 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition-all hover:bg-blue-500 hover:shadow-blue-500/40'
        >
          <Plus size={18} />새 케이스 생성
        </button>
      </div>

      <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24'>
        <div className='mb-4 rounded-2xl bg-slate-100 p-4'>
          <FolderOpen size={32} className='text-slate-400' />
        </div>
        <p className='text-base font-semibold text-slate-700'>
          케이스가 없습니다
        </p>
        <p className='mt-1.5 mb-5 text-sm text-slate-400'>
          새 케이스를 생성하여 포렌식 분석을 시작하세요
        </p>
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500'
        >
          <Plus size={14} />
          케이스 생성
        </button>
      </div>

      {showModal && <CaseCreateModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
