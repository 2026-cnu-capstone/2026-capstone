'use client';
import { useEffect } from 'react';
import Sidebar from '@/components/common/Sidebar';
import CaseList from '@/components/case/CaseList';
import { useCaseStore } from '@/stores/caseStore';

export default function Home() {
  const { cases, fetchCases, isLoading } = useCaseStore();

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className='flex h-screen bg-slate-50'>
      <Sidebar />
      <main className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-6xl px-6 py-8'>
          <CaseList cases={cases} />
        </div>
      </main>
    </div>
  );
}
