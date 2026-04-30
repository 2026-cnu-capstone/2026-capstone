'use client';

import { Scale, Folder, Settings, User } from 'lucide-react';

interface Props {
  currentView: string;
  onViewChange: (v: 'list' | 'builder') => void;
}

function NavItem({
  icon,
  active,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <div
      title={title}
      onClick={onClick}
      className={`relative w-full h-10 flex items-center justify-center
        ${onClick ? 'cursor-pointer' : ''}
        ${active ? 'text-f-accent' : 'text-f-t4 hover:text-f-t3'}
        transition-colors`}
    >
      {active && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-f-accent rounded-r-sm" />
      )}
      <div className="p-1.5">{icon}</div>
    </div>
  );
}

export default function NavRail({ currentView, onViewChange }: Props) {
  return (
    <div className="w-12 bg-f-surface border-r border-f-border flex flex-col items-center py-3 select-none z-20 shrink-0">
      <NavItem
        icon={<Scale size={18} />}
        title="작업 화면"
        active={currentView === 'builder'}
        onClick={() => onViewChange('builder')}
      />
      <div className="h-2" />
      <NavItem
        icon={<Folder size={18} />}
        title="케이스 목록"
        active={currentView === 'list'}
        onClick={() => onViewChange('list')}
      />
      <div className="mt-auto w-full flex flex-col pt-3 border-t border-f-border">
        <NavItem icon={<Settings size={18} />} />
        <NavItem icon={<User size={18} />} />
      </div>
    </div>
  );
}
