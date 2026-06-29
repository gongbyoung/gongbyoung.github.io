/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Download, Calendar, Filter, Star, Car, CloudLightning, ChevronLeft, ChevronRight, TrendingUp, RefreshCw, MoreHorizontal } from 'lucide-react';
import { ChargingSession } from '../types';

interface HistoryViewProps {
  history: ChargingSession[];
  lang: 'ko' | 'en';
  showNotificationToast: (msg: string) => void;
}

export default function HistoryView({
  history,
  lang,
  showNotificationToast
}: HistoryViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<'all' | 'Completed' | 'Failed'>('all');
  const itemsPerPage = 4;

  // Filter history based on status selector
  const filteredHistory = history.filter((session) => {
    if (filterType === 'all') return true;
    return session.status === filterType;
  });

  // Paginated elements
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + itemsPerPage);

  // Download Statement Simulation
  const handleExportCSV = () => {
    // Generate headers and simulated CSV content
    const headers = 'ID,Date,Time,Station,EnergyUsed(kWh),Cost(KRW),Status,PlugType\n';
    const rows = history
      .map(
        (s) =>
          `"${s.id}","${s.date}","${s.time}","${s.stationName}","${s.energyUsed}","${s.cost}","${s.status}","${s.plugType}"`
      )
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'kepco_charging_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotificationToast(
      lang === 'ko'
        ? '충전 내역 CSV 파일이 성곡적으로 내보내졌습니다.'
        : 'Charging history CSV file exported successfully.'
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gray-50/50">
      {/* Header section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#002e60]">
              {lang === 'ko' ? '충전 내역 서비스' : 'Charging History'}
            </h1>
            <p className="font-sans text-sm text-[#424751] max-w-2xl mt-1.5">
              {lang === 'ko'
                ? '회원님의 전기차 충전 세션, 전력 소비량 및 탄소 배출 절감량 공헌도를 종합적으로 기록한 상세 대장입니다.'
                : 'A comprehensive record of your electric vehicle charging sessions, energy consumption, and environmental impact contributions.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#424751] uppercase font-bold tracking-wider">
                {lang === 'ko' ? '활성화 요금제' : 'Active Plan'}
              </span>
              <span className="text-sm text-[#006e1c] font-extrabold uppercase">
                {lang === 'ko' ? '에코 프리미엄 플러스' : 'ECO-PREMIUM PLUS'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#91f78e] flex items-center justify-center text-[#00731e]">
              🌿
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards Bento (Total Points, Sessions, CO2 Saved) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Points */}
        <div className="bg-white border border-[#c3c6d2] p-6 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#424751] uppercase tracking-wider">
              {lang === 'ko' ? '누적 보너스 포인트' : 'Total Points'}
            </span>
            <Star className="text-[#002e60] fill-current" size={18} />
          </div>
          <div>
            <div className="font-display text-3xl font-extrabold text-[#002e60]">
              42,850 <span className="text-xs font-normal text-[#424751]">pts</span>
            </div>
            <div className="flex items-center gap-1 text-[#006e1c] font-bold text-xs mt-1">
              <TrendingUp size={14} />
              <span>+1,200 this week</span>
            </div>
          </div>
        </div>

        {/* Sessions this Month */}
        <div className="bg-[#002e60] text-white p-6 rounded-2xl flex flex-col justify-between h-40 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            ⚡
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              {lang === 'ko' ? '당월 충전 횟수' : 'Sessions this Month'}
            </span>
            <Car size={18} className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="font-display text-3xl font-extrabold">
              28 <span className="text-xs font-normal opacity-70">{lang === 'ko' ? '회 충전' : 'Charges'}</span>
            </div>
            <div className="text-xs opacity-80 mt-1 font-semibold">
              {lang === 'ko' ? '회당 평균 45분 충전 소요' : 'Average 45min per session'}
            </div>
          </div>
        </div>

        {/* CO2 Saved */}
        <div className="bg-white border border-[#c3c6d2] p-6 rounded-2xl flex flex-col justify-between h-40 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-[#424751] uppercase tracking-wider">
              {lang === 'ko' ? '온실가스 절감 기여' : 'CO2 Saved'}
            </span>
            <CloudLightning className="text-[#006e1c]" size={18} />
          </div>
          <div>
            <div className="font-display text-3xl font-extrabold text-[#001f2a]">
              1,420 <span className="text-xs font-normal text-[#424751]">kg</span>
            </div>
            <div className="bg-[#91f78e]/30 px-2.5 py-1 rounded text-[#00731e] font-extrabold text-[10px] inline-block mt-2">
              {lang === 'ko' ? '🌲 소나무 12그루 식재 효과와 동일' : 'Equivalent to 12 trees planted'}
            </div>
          </div>
        </div>
      </section>

      {/* Activity Log Grid */}
      <section className="bg-white border border-[#c3c6d2] rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-[#c3c6d2] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-lg text-[#002e60]">
              {lang === 'ko' ? '활동 이력 대장' : 'Activity Log'}
            </h3>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-50 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-[#006e1c] animate-pulse"></span>
              <span className="text-[10px] font-bold text-[#00731e] uppercase">
                {lang === 'ko' ? '실시간 동기화 상태' : 'Real-time Syncing'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status quick switch */}
            <div className="flex border border-[#c3c6d2] rounded-lg p-1 bg-white">
              <button
                onClick={() => {
                  setFilterType('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'all' ? 'bg-[#ceedfd] text-[#002e60] font-bold' : 'text-[#424751] hover:text-[#002e60]'
                }`}
              >
                {lang === 'ko' ? '전체' : 'All'}
              </button>
              <button
                onClick={() => {
                  setFilterType('Completed');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'Completed' ? 'bg-[#91f78e]/30 text-[#00731e] font-bold' : 'text-[#424751] hover:text-[#006e1c]'
                }`}
              >
                {lang === 'ko' ? '성공' : 'Completed'}
              </button>
              <button
                onClick={() => {
                  setFilterType('Failed');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  filterType === 'Failed' ? 'bg-red-50 text-[#ba1a1a] font-bold' : 'text-[#424751] hover:text-red-600'
                }`}
              >
                {lang === 'ko' ? '실패' : 'Failed'}
              </button>
            </div>

            <div className="h-6 w-[1px] bg-[#c3c6d2] mx-1 hidden sm:block"></div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-[#002e60] hover:bg-[#004488] text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Download size={14} />
              <span>{lang === 'ko' ? '대장 다운로드 (CSV)' : 'Statement (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-3.5 text-xs font-bold text-[#424751] uppercase tracking-wider border-b border-[#c3c6d2]">
                  {lang === 'ko' ? '충전 일시' : 'Date & Time'}
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#424751] uppercase tracking-wider border-b border-[#c3c6d2]">
                  {lang === 'ko' ? '충전소 명칭' : 'Station Name'}
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#424751] uppercase tracking-wider border-b border-[#c3c6d2]">
                  {lang === 'ko' ? '충전 전력량' : 'Energy Used'}
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#424751] uppercase tracking-wider border-b border-[#c3c6d2]">
                  {lang === 'ko' ? '결제 요금' : 'Total Cost'}
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#424751] uppercase tracking-wider border-b border-[#c3c6d2]">
                  {lang === 'ko' ? '진행 상태' : 'Status'}
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#424751] uppercase tracking-wider border-b border-[#c3c6d2] text-right">
                  {lang === 'ko' ? '상세 작업' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#001f2a] divide-y divide-gray-100">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#002e60]">
                          {new Date(session.date).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-[10px] text-[#424751] font-semibold">{session.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#d9f2ff] flex items-center justify-center text-[#002e60] border border-[#c3c6d2]">
                          ⚡
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[#001f2a]">
                            {lang === 'ko' ? session.stationNameKo : session.stationName}
                          </span>
                          <span className="text-[10px] text-[#424751] line-clamp-1">{session.address}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-bold text-[#002e60]">{session.energyUsed}</span>
                        <span className="text-[10px] text-[#424751] font-bold">kWh</span>
                        <span className="text-[10px] text-gray-400 ml-1.5 font-semibold">({session.plugType})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#001f2a]">
                      ₩ {session.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          session.status === 'Completed'
                            ? 'bg-green-100 text-[#00731e]'
                            : 'bg-red-100 text-[#ba1a1a]'
                        }`}
                      >
                        {lang === 'ko' ? (session.status === 'Completed' ? '성공' : '실패') : session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          showNotificationToast(
                            lang === 'ko'
                              ? `거래 ID: ${session.id} 영수증 발급 완료`
                              : `Receipt generated for trans ID: ${session.id}`
                          );
                        }}
                        className="p-1.5 hover:bg-[#d9f2ff] rounded-lg text-[#424751] hover:text-[#002e60] transition-all cursor-pointer"
                        title={lang === 'ko' ? '영수증 보기' : 'View receipt'}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-xs text-[#424751] font-semibold">
                    {lang === 'ko' ? '조회된 결과가 없습니다.' : 'No sessions found in history.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50 border-t border-gray-100">
            <span className="text-xs text-[#424751] font-semibold">
              {lang === 'ko'
                ? `전체 ${filteredHistory.length} 세션 중 ${startIndex + 1}-${Math.min(
                    startIndex + itemsPerPage,
                    filteredHistory.length
                  )}번째 내역`
                : `Showing ${startIndex + 1} to ${Math.min(
                    startIndex + itemsPerPage,
                    filteredHistory.length
                  )} of ${filteredHistory.length} sessions`}
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-1.5 border border-[#c3c6d2] rounded-lg hover:bg-white text-[#424751] disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-xs border rounded-lg font-bold transition-all cursor-pointer ${
                    page === currentPage
                      ? 'bg-[#002e60] text-white border-[#002e60] shadow-sm'
                      : 'border-[#c3c6d2] hover:bg-white text-[#424751]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 border border-[#c3c6d2] rounded-lg hover:bg-white text-[#424751] disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Consumption Trend & Station Affinity (Lower layout matching Screen 2) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Consumption Trend Column Bar Chart */}
        <div className="bg-white border border-[#c3c6d2] rounded-2xl p-6 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-display font-bold text-base text-[#002e60]">
              {lang === 'ko' ? '요일별 전력 소모 트렌드' : 'Consumption Trends'}
            </h4>
            <span className="text-xs font-bold text-[#424751] uppercase flex items-center gap-1">
              📊 {lang === 'ko' ? '이번주 (kWh)' : 'This Week (kWh)'}
            </span>
          </div>

          {/* Bar Charts Representation */}
          <div className="h-44 w-full flex items-end justify-between gap-3 px-2">
            {[
              { label: 'MON', val: 60, color: 'bg-[#d9f2ff]' },
              { label: 'TUE', val: 40, color: 'bg-[#ceedfd]' },
              { label: 'WED', val: 80, color: 'bg-[#002e60]' },
              { label: 'THU', val: 30, color: 'bg-[#d9f2ff]' },
              { label: 'FRI', val: 55, color: 'bg-[#ceedfd]' },
              { label: 'SAT', val: 70, color: 'bg-[#004488]' },
              { label: 'SUN', val: 95, color: 'bg-[#006e1c]' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-gray-100 rounded-t-lg h-36 flex items-end overflow-hidden relative">
                  <div
                    style={{ height: `${bar.val}%` }}
                    className={`w-full ${bar.color} rounded-t-lg group-hover:brightness-95 transition-all duration-500`}
                  />
                  {/* Tooltip value */}
                  <div className="absolute top-[-24px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#001f2a] text-white text-[9px] px-1 py-0.5 rounded transition-opacity pointer-events-none font-bold">
                    {Math.round(bar.val * 0.8)}kWh
                  </div>
                </div>
                <span className="text-[10px] text-[#424751] font-bold tracking-tight">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Station Affinity horizontal gauge bars */}
        <div className="bg-white border border-[#c3c6d2] rounded-2xl p-6 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-display font-bold text-base text-[#002e60]">
              {lang === 'ko' ? '최선호 충전 거점지 비율' : 'Station Affinity'}
            </h4>
            <span className="text-xs font-bold text-[#424751] uppercase">📈 {lang === 'ko' ? '이용 점유율' : 'Usage share'}</span>
          </div>

          <div className="space-y-4">
            {[
              { name: lang === 'ko' ? '광화문 빌딩 급속충전소' : 'Gwanghwamun Building', pct: 42, color: 'bg-[#002e60]' },
              { name: lang === 'ko' ? '양재역 공영주차장' : 'Yangjae-yeok Station', pct: 35, color: 'bg-[#004488]' },
              { name: lang === 'ko' ? '여의도 한강공원 EV' : 'Yeouido Hangang Park', pct: 15, color: 'bg-[#002e60]' },
              { name: lang === 'ko' ? '기타 거점 충전기' : 'Others', pct: 8, color: 'bg-[#ceedfd]' }
            ].map((station, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex justify-between font-sans text-xs font-bold text-[#001f2a]">
                  <span className="truncate max-w-[80%]">{station.name}</span>
                  <span className="text-[#002e60]">{station.pct}%</span>
                </div>
                <div className="w-full bg-[#e6f6ff] rounded-full h-2.5 overflow-hidden">
                  <div
                    style={{ width: `${station.pct}%` }}
                    className={`h-full ${station.color} rounded-full transition-all duration-700`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
