'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, FolderOpen, Plus, Home, Trash2 } from 'lucide-react';
import { useCaseStore } from '@/stores/caseStore';
import { useState } from 'react';
import CaseCreateModal from '@/components/case/CaseCreateModal';
import clsx from 'clsx';

export default function Sidebar() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  return (
    <aside className='flex h-screen w-56 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm'>
      {/* Logo */}
      <div className='border-b border-slate-200 px-4 py-4'>
        <div className='flex items-center gap-2.5'>
          <div className='rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 shadow-lg shadow-blue-500/20'>
            <ShieldCheck size={15} className='text-white' />
          </div>
          <div>
            <p className='text-sm leading-tight font-bold tracking-tight text-slate-900'>
              DFIR
            </p>
            <p className='text-[10px] font-medium tracking-wider text-blue-500/80'>
              ORCHESTRATOR
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex-1 overflow-y-auto px-2 py-3'>
        <Link
          href='/'
          className={clsx(
            'mb-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all',
            pathname === '/'
              ? 'border border-blue-200 bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          )}
        >
          <Home size={14} />
          <span>대시보드</span>
        </Link>

        <div className='mt-4'>
          <div className='mb-2 flex items-center justify-between px-1'>
            <p className='text-[10px] font-semibold tracking-widest text-slate-400 uppercase'>
              케이스
            </p>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className='border-t border-slate-200 px-4 py-3'>
        <div className='flex items-center gap-1.5'>
          <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500' />
          <p className='text-[10px] text-slate-400'>LLM 포렌식 플랫폼 v0.1</p>
        </div>
      </div>

      {showModal && <CaseCreateModal onClose={() => setShowModal(false)} />}
    </aside>
  );
}
