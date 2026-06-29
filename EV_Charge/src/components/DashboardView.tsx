/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, Heart, Zap, Cable, BatteryCharging, X } from 'lucide-react';
import { ChargingStation } from '../types';
import MapArea from './MapArea';

interface DashboardViewProps {
  stations: ChargingStation[];
  selectedStation: ChargingStation | null;
  setSelectedStation: (station: ChargingStation | null) => void;
  lang: 'ko' | 'en';
  onStartCharging: (station: ChargingStation) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  sidebarFilter: 'all' | 'favorites' | 'nearby' | 'recent';
}

export default function DashboardView({
  stations,
  selectedStation,
  setSelectedStation,
  lang,
  onStartCharging,
  favorites,
  toggleFavorite,
  sidebarFilter
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [plugFilter, setPlugFilter] = useState<'All' | 'CCS1' | 'CHAdeMO' | 'AC_3Phase'>('All');

  // Filter stations based on:
  // 1. Sidebar filter (All, Favorites, Nearby [<= 5km], Recent [mocked as top 3 or distance])
  // 2. Text Search query (name or address matching)
  // 3. Plug filter chips (CCS1, CHAdeMO, AC 3-Phase)
  const filteredStations = stations.filter((station) => {
    // 1. Sidebar category constraint
    if (sidebarFilter === 'favorites' && !favorites.includes(station.id)) {
      return false;
    }
    if (sidebarFilter === 'nearby' && station.distance > 5) {
      return false;
    }
    if (sidebarFilter === 'recent' && station.id !== 'st-01' && station.id !== 'st-03' && station.id !== 'st-04') {
      return false; // Show Yangjae, Gangnam & Gwanghwamun as recent stops
    }

    // 2. Search query constraint
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      station.name.toLowerCase().includes(query) ||
      station.nameKo.includes(query) ||
      station.address.toLowerCase().includes(query) ||
      station.addressKo.includes(query);

    if (!matchesSearch) return false;

    // 3. Plug filter chip constraint
    if (plugFilter !== 'All') {
      const hasPlug = station.connectors.some(
        (connector) => connector.type === plugFilter
      );
      if (!hasPlug) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Stations Side List Panel (Matches Screen 3 design) */}
      <section className="w-full md:max-w-sm bg-white border-r border-[#c3c6d2] flex flex-col h-1/2 md:h-full shadow-lg z-10">
        {/* Search header & connector filter chips */}
        <div className="p-4 bg-[#f4faff] border-b border-[#c3c6d2]">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ko' ? '충전소 이름 또는 주소 검색...' : 'Search by location...'}
              className="w-full bg-white border border-[#c3c6d2] rounded-xl py-2.5 pl-10 pr-8 text-sm focus:ring-2 focus:ring-[#002e60] focus:border-transparent outline-none transition-all"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#424751]" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#424751] hover:text-[#002e60]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Plug Type Selection Chips */}
          <div className="flex gap-1.5 mt-3.5 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'CCS1', 'CHAdeMO', 'AC_3Phase'] as const).map((plug) => {
              const isActive = plugFilter === plug;
              return (
                <button
                  key={plug}
                  onClick={() => setPlugFilter(plug)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#002e60] text-white border-[#002e60] shadow-sm'
                      : 'bg-white text-[#424751] border-[#c3c6d2] hover:bg-[#e6f6ff]'
                  }`}
                >
                  {plug === 'All' ? (lang === 'ko' ? '전체 타입' : 'All Plugs') : plug.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable list of stations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#424751] uppercase tracking-wider">
              {lang === 'ko'
                ? `검색 결과: ${filteredStations.length}개 소`
                : `Found ${filteredStations.length} stations`}
            </span>
            {sidebarFilter !== 'all' && (
              <span className="text-[10px] font-bold bg-[#ceedfd] text-[#002e60] px-2 py-0.5 rounded-md uppercase">
                Filter: {sidebarFilter}
              </span>
            )}
          </div>

          {filteredStations.length > 0 ? (
            filteredStations.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              const isFav = favorites.includes(station.id);

              // Status badge coloring
              let statusText = lang === 'ko' ? '충전 가능' : 'Available';
              let statusStyle = 'bg-[#91f78e] text-[#00731e]';
              if (station.status === 'in_use') {
                statusText = lang === 'ko' ? '충전 중' : 'In Use';
                statusStyle = 'bg-red-100 text-[#ba1a1a]';
              } else if (station.status === 'maintenance') {
                statusText = lang === 'ko' ? '점검 예정' : 'Maintenance';
                statusStyle = 'bg-[#ffdad6] text-[#93000a]';
              } else if (station.status === 'offline') {
                statusText = lang === 'ko' ? '운영 중단' : 'Offline';
                statusStyle = 'bg-gray-200 text-[#737782]';
              }

              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`p-4 bg-white border rounded-2xl cursor-pointer hover:shadow-md active:scale-[0.99] transition-all relative ${
                    isSelected
                      ? 'border-l-4 border-l-[#002e60] bg-[#e6f6ff] border-[#002e60] shadow-sm'
                      : 'border-[#c3c6d2] hover:bg-gray-50'
                  }`}
                >
                  {/* Title & Status */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display font-bold text-base text-[#002e60]">
                      {lang === 'ko' ? station.nameKo : station.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                        {statusText}
                      </span>
                    </div>
                  </div>

                  {/* Address */}
                  <p className="text-xs text-[#424751] mt-1.5 flex items-start gap-1">
                    <span className="mt-0.5">📍</span>
                    <span className="line-clamp-2">
                      {lang === 'ko' ? station.addressKo : station.address}
                    </span>
                  </p>

                  {/* Connectors & Speed */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-dashed border-[#c3c6d2]">
                    <div className="flex gap-1">
                      {station.connectors.map((conn, idx) => (
                        <div
                          key={idx}
                          title={`${conn.type} (${conn.power}kW)`}
                          className="flex flex-col items-center p-1 bg-[#e6f6ff] rounded border border-[#c3c6d2] w-12"
                        >
                          <Cable size={14} className="text-[#002e60]" />
                          <span className="text-[8px] font-extrabold text-[#002e60] mt-0.5">
                            {conn.type.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-right">
                      <p className="text-[#002e60] font-bold text-sm tracking-tight flex items-center justify-end gap-0.5">
                        <Zap size={14} className="text-[#002e60]" />
                        {station.speed}kW
                      </p>
                      <p className="text-[#424751] text-[10px] font-semibold">
                        {station.distance} km {lang === 'ko' ? '남음' : 'away'}
                      </p>
                    </div>
                  </div>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(station.id);
                    }}
                    className={`absolute right-4 top-14 p-1.5 rounded-full transition-all border ${
                      isFav
                        ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                        : 'bg-white text-[#c3c6d2] border-[#c3c6d2] hover:text-[#ba1a1a] hover:border-[#ffdad6]'
                    }`}
                    title={lang === 'ko' ? '즐겨찾기 토글' : 'Toggle Favorite'}
                  >
                    <Heart size={14} className={isFav ? 'fill-current' : ''} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-[#424751] flex flex-col items-center justify-center">
              <span className="text-3xl mb-2">🔍</span>
              <p className="font-semibold text-sm">
                {lang === 'ko' ? '조건에 맞는 충전소가 없습니다.' : 'No charging stations match your filters.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPlugFilter('All');
                }}
                className="mt-3 text-xs font-bold text-[#002e60] underline"
              >
                {lang === 'ko' ? '필터 초기화' : 'Reset Search filters'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Map Area */}
      <MapArea
        stations={filteredStations}
        selectedStation={selectedStation}
        setSelectedStation={setSelectedStation}
        lang={lang}
        onStartCharging={onStartCharging}
        favorites={favorites}
      />
    </div>
  );
}
