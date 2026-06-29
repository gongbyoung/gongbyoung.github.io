/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, SlidersHorizontal, Heart, MapPin, History, Info, ShieldAlert, Plus } from 'lucide-react';

interface SidebarProps {
  sidebarFilter: 'all' | 'favorites' | 'nearby' | 'recent';
  setSidebarFilter: (filter: 'all' | 'favorites' | 'nearby' | 'recent') => void;
  lang: 'ko' | 'en';
  onAddStationClick: () => void;
  onHelpClick: () => void;
}

export default function Sidebar({
  sidebarFilter,
  setSidebarFilter,
  lang,
  onAddStationClick,
  onHelpClick
}: SidebarProps) {
  const menuItems = [
    {
      id: 'all',
      labelKo: '전체 충전소',
      labelEn: 'All Stations',
      icon: Search,
    },
    {
      id: 'favorites',
      labelKo: '즐겨찾기',
      labelEn: 'Favorites',
      icon: Heart,
    },
    {
      id: 'nearby',
      labelKo: '주변 충전소',
      labelEn: 'Nearby (5km)',
      icon: MapPin,
    },
    {
      id: 'recent',
      labelKo: '최근 방문지',
      labelEn: 'Recent Stops',
      icon: History,
    }
  ] as const;

  return (
    <aside className="hidden md:flex flex-col gap-4 p-4 w-72 bg-[#d9f2ff] border-r border-[#c3c6d2] sticky top-16 h-[calc(100vh-64px)] overflow-y-auto">
      {/* Title */}
      <div className="px-2 py-1">
        <h2 className="font-display font-bold text-xl text-[#001f2a]">
          {lang === 'ko' ? '충전소 찾기' : 'Station Finder'}
        </h2>
        <p className="text-xs text-[#424751] font-semibold tracking-wider uppercase mt-1">
          {lang === 'ko' ? '관리대상 1,240개 소' : 'Managing 1,240 stations'}
        </p>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onAddStationClick}
        className="w-full mt-2 bg-[#002e60] hover:bg-[#004488] active:scale-[0.98] text-white py-3 px-4 rounded-xl font-display font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Plus size={16} />
        {lang === 'ko' ? '새 충전소 건의' : 'Suggest New Station'}
      </button>

      {/* Sidebar Filters */}
      <div className="flex flex-col gap-1.5 mt-4 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = sidebarFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSidebarFilter(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-sm text-left cursor-pointer ${
                isActive
                  ? 'bg-[#002e60] text-white font-bold shadow-sm'
                  : 'text-[#424751] hover:bg-[#ceedfd] hover:text-[#002e60]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-[#424751]'} />
              <span>{lang === 'ko' ? item.labelKo : item.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom info rail */}
      <div className="mt-auto border-t border-[#c3c6d2] pt-4 flex flex-col gap-1">
        <button
          onClick={onHelpClick}
          className="flex items-center gap-3 px-4 py-3 bg-[#e6f6ff] text-[#002e60] font-bold rounded-xl text-sm transition-all hover:bg-[#ceedfd] text-left cursor-pointer"
        >
          <Info size={18} className="text-[#002e60]" />
          <span>{lang === 'ko' ? '도움말 센터' : 'Help Center'}</span>
        </button>
        <button
          onClick={() => {
            alert(
              lang === 'ko'
                ? '한전 충전 24시 긴급고객센터: 1588-XXXX (실제 긴급 신고 가능)'
                : 'KEPCO 24h Hotline: 1588-XXXX'
            );
          }}
          className="flex items-center gap-3 px-4 py-3 text-[#424751] hover:bg-[#ceedfd] hover:text-[#002e60] rounded-xl text-sm transition-all text-left cursor-pointer"
        >
          <ShieldAlert size={18} className="text-[#424751]" />
          <span>{lang === 'ko' ? '한전 민원신고' : 'Contact KEPCO'}</span>
        </button>
      </div>
    </aside>
  );
}
