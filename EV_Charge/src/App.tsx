/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, X, PlusCircle, HelpCircle } from 'lucide-react';
import { ChargingStation, ChargingSession, RegisteredCard } from './types';
import { INITIAL_STATIONS, INITIAL_HISTORY, INITIAL_CARDS } from './data';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import HistoryView from './components/HistoryView';
import SupportView from './components/SupportView';
import ChargingModal from './components/ChargingModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'support'>('dashboard');
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'favorites' | 'nearby' | 'recent'>('all');
  const [stations, setStations] = useState<ChargingStation[]>(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(INITIAL_STATIONS[0]); // Select first by default
  const [history, setHistory] = useState<ChargingSession[]>(INITIAL_HISTORY);
  const [cards, setCards] = useState<RegisteredCard[]>(INITIAL_CARDS);
  const [favorites, setFavorites] = useState<string[]>(['st-01', 'st-04']); // Default favorites (Yangjae, Gwanghwamun)
  const [lang, setLang] = useState<'ko' | 'en'>('ko'); // Default to Korean as requested
  const [activeChargingStation, setActiveChargingStation] = useState<ChargingStation | null>(null);

  // Suggested Station Modal state
  const [showAddStationModal, setShowAddStationModal] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationSpeed, setNewStationSpeed] = useState(100);
  const [newStationOperator, setNewStationOperator] = useState('KEPCO');

  // Help Desk dialog state
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Toast notifications array
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  // Function to show toast
  const showNotificationToast = (message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Toggle favorite helper
  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      if (isFav) {
        showNotificationToast(lang === 'ko' ? '즐겨찾기에서 해제되었습니다.' : 'Removed from favorites.');
        return prev.filter((favId) => favId !== id);
      } else {
        showNotificationToast(lang === 'ko' ? '즐겨찾기에 등록되었습니다!' : 'Added to favorites!');
        return [...prev, id];
      }
    });
  };

  // Handle dynamic addition of custom station suggestion
  const handleSuggestStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim() || !newStationAddress.trim()) {
      showNotificationToast(lang === 'ko' ? '빈 칸을 모두 작성해 주세요.' : 'Please fill all fields.');
      return;
    }

    const newId = `st-custom-${Date.now()}`;
    const newStation: ChargingStation = {
      id: newId,
      name: `Custom suggested: ${newStationName}`,
      nameKo: `[건의된 거점] ${newStationName}`,
      address: newStationAddress,
      addressKo: newStationAddress,
      lat: 37.52 + (Math.random() - 0.5) * 0.1, // Random near Seoul center
      lng: 126.98 + (Math.random() - 0.5) * 0.1,
      speed: newStationSpeed,
      status: 'available',
      distance: parseFloat((Math.random() * 8 + 0.5).toFixed(1)),
      operator: newStationOperator,
      pricePerKwh: 310,
      connectors: [
        { type: 'CCS1', power: newStationSpeed, status: 'available' }
      ]
    };

    setStations((prev) => [newStation, ...prev]);
    setSelectedStation(newStation);
    setNewStationName('');
    setNewStationAddress('');
    setShowAddStationModal(false);
    showNotificationToast(
      lang === 'ko'
        ? '한전 충전망에 임시 등록 및 지도 배치가 완료되었습니다.'
        : 'Station added to offline database and map successfully.'
    );
  };

  // Appending charging histories from simulator
  const handleChargingComplete = (newSession: ChargingSession) => {
    setHistory((prev) => [newSession, ...prev]);
    setActiveChargingStation(null);
    showNotificationToast(
      lang === 'ko'
        ? '새로운 충전 거래 원장이 성공적으로 대장에 영구 기록되었습니다.'
        : 'New charging invoice written to permanent history.'
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4faff] text-[#001f2a] font-sans antialiased overflow-x-hidden pb-16 md:pb-0">
      
      {/* Dynamic Toasts Area */}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-[#002e60] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-white/10 animate-fade-in transition-all text-xs font-semibold"
          >
            <Sparkles size={16} className="text-[#91f78e] shrink-0" />
            <span>{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-white/60 hover:text-white ml-2 shrink-0 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Shared Upper TopAppBar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        showNotificationToast={showNotificationToast}
      />

      {/* Main Structural Layout */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Side Navigation (Desktop only) */}
        <Sidebar
          sidebarFilter={sidebarFilter}
          setSidebarFilter={setSidebarFilter}
          lang={lang}
          onAddStationClick={() => setShowAddStationModal(true)}
          onHelpClick={() => setShowHelpModal(true)}
        />

        {/* Dynamic View container */}
        <main className="flex-1 flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              stations={stations}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
              lang={lang}
              onStartCharging={(station) => setActiveChargingStation(station)}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              sidebarFilter={sidebarFilter}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              lang={lang}
              showNotificationToast={showNotificationToast}
            />
          )}

          {activeTab === 'support' && (
            <SupportView
              cards={cards}
              setCards={setCards}
              lang={lang}
              showNotificationToast={showNotificationToast}
              setActiveTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on small devices) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#c3c6d2] flex items-center justify-around z-40 shadow-lg">
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setSidebarFilter('all');
          }}
          className={`flex flex-col items-center justify-center p-2 transition-all ${
            activeTab === 'dashboard' ? 'text-[#002e60] font-bold' : 'text-[#424751]'
          }`}
        >
          <span className="text-xl">🗺️</span>
          <span className="text-[10px] mt-0.5">{lang === 'ko' ? '지도대시보드' : 'Dashboard'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('dashboard');
            setSidebarFilter('favorites');
          }}
          className={`flex flex-col items-center justify-center p-2 transition-all ${
            activeTab === 'dashboard' && sidebarFilter === 'favorites' ? 'text-[#002e60] font-bold' : 'text-[#424751]'
          }`}
        >
          <span className="text-xl">❤️</span>
          <span className="text-[10px] mt-0.5">{lang === 'ko' ? '즐겨찾기' : 'Favorites'}</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center p-2 transition-all ${
            activeTab === 'history' ? 'text-[#002e60] font-bold' : 'text-[#424751]'
          }`}
        >
          <span className="text-xl">📋</span>
          <span className="text-[10px] mt-0.5">{lang === 'ko' ? '충전기록' : 'History'}</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex flex-col items-center justify-center p-2 transition-all ${
            activeTab === 'support' ? 'text-[#002e60] font-bold' : 'text-[#424751]'
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px] mt-0.5">{lang === 'ko' ? '고객지원' : 'Support'}</span>
        </button>
      </nav>

      {/* SIMULATOR MODAL OVERLAY */}
      {activeChargingStation && (
        <ChargingModal
          station={activeChargingStation}
          selectedCard={cards.find((c) => c.isPrimary) || cards[0] || null}
          lang={lang}
          onClose={() => setActiveChargingStation(null)}
          onChargingComplete={handleChargingComplete}
        />
      )}

      {/* SUGGEST STATION MODAL OVERLAY */}
      {showAddStationModal && (
        <div className="fixed inset-0 bg-[#001f2a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#c3c6d2] animate-scale-up">
            <div className="bg-[#002e60] text-white p-5 flex justify-between items-center">
              <h3 className="font-display font-bold text-base">
                {lang === 'ko' ? '새 전기충전소 제보 및 설치 건의' : 'Suggest New Station'}
              </h3>
              <button
                onClick={() => setShowAddStationModal(false)}
                className="text-white hover:bg-white/10 p-1 rounded text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSuggestStation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001f2a] mb-1">
                  {lang === 'ko' ? '충전 거점지 후보 명칭' : 'Station Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  placeholder={lang === 'ko' ? '예: 양재시민의숲 야외 주차장' : 'e.g. Civic Forest Park'}
                  className="w-full bg-gray-50 border border-[#c3c6d2] rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-[#002e60]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#001f2a] mb-1">
                  {lang === 'ko' ? '거점지 상세 도로명 주소' : 'Detailed Address'}
                </label>
                <input
                  type="text"
                  required
                  value={newStationAddress}
                  onChange={(e) => setNewStationAddress(e.target.value)}
                  placeholder={lang === 'ko' ? '예: 서울특별시 서초구 매헌로 99' : 'e.g. 99 Maeheon-ro, Seocho-gu'}
                  className="w-full bg-gray-50 border border-[#c3c6d2] rounded-lg p-2.5 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-[#002e60]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#001f2a] mb-1">
                    {lang === 'ko' ? '원하는 기기 출력 속도' : 'Requested Speed'}
                  </label>
                  <select
                    value={newStationSpeed}
                    onChange={(e) => setNewStationSpeed(parseInt(e.target.value))}
                    className="w-full bg-gray-50 border border-[#c3c6d2] rounded-lg p-2.5 text-xs"
                  >
                    <option value={350}>350kW (Ultra Rapid)</option>
                    <option value={200}>200kW (Rapid)</option>
                    <option value={100}>100kW (Standard Fast)</option>
                    <option value={50}>50kW (Urban Fast)</option>
                    <option value={7}>7kW (Slow Wallbox)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#001f2a] mb-1">
                    {lang === 'ko' ? '충전 운영 희망 기관' : 'Operator'}
                  </label>
                  <select
                    value={newStationOperator}
                    onChange={(e) => setNewStationOperator(e.target.value)}
                    className="w-full bg-gray-50 border border-[#c3c6d2] rounded-lg p-2.5 text-xs"
                  >
                    <option value="KEPCO">KEPCO (한국전력)</option>
                    <option value="Environment Ministry">Environment Ministry (환경부)</option>
                    <option value="Daeyoung Chaevi">Daeyoung Chaevi (대영채비)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#002e60] hover:bg-[#004488] text-white rounded-xl font-display font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle size={16} />
                <span>{lang === 'ko' ? '설치 건의서 접수제출' : 'Submit Proposal'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HELP MODAL OVERLAY */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-[#001f2a]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-[#c3c6d2] animate-scale-up">
            <div className="bg-[#002e60] text-white p-5 flex justify-between items-center">
              <h3 className="font-display font-bold text-base flex items-center gap-2">
                <HelpCircle size={18} />
                <span>{lang === 'ko' ? 'KEPCO Charge 이용 길라잡이' : 'KEPCO Charge Guide'}</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-white hover:bg-white/10 p-1 rounded text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-[#424751] leading-relaxed">
              <p>
                {lang === 'ko'
                  ? '반갑습니다! 본 애플리케이션은 한전 전기차 관제 전력 네트워크를 탐색하고 직접 충전 과정을 체감할 수 있는 첨단 시뮬레이터 플랫폼입니다.'
                  : 'Welcome! This application is a high-fidelity simulator that models KEPCO’s nationwide EV charging grid.'}
              </p>
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <p className="font-bold text-[#002e60]">🧭 {lang === 'ko' ? '충전소 탐색 및 길 안내' : 'Find Stations'}</p>
                <p>
                  {lang === 'ko'
                    ? '지도 화면에서 마커를 드래그하거나 왼쪽 검색창을 이용해 전국의 충전소를 선별합니다. 즐겨찾기(❤️)나 5km 주변 필터링도 유기적으로 작동합니다.'
                    : 'Search, filter, or pan the map. Toggle favorites (❤️) or filter within 5km from simulated location.'}
                </p>

                <p className="font-bold text-[#002e60]">🔋 {lang === 'ko' ? '지능형 가상 충전 인가' : 'Interactive Charging simulation'}</p>
                <p>
                  {lang === 'ko'
                    ? '원하는 충전소를 선택하고 "즉시 충전" 버튼을 눌러보세요. 요금 충전 속도, 타겟 배터리 제한을 가상으로 컨트롤하며 안전한 결제를 체험할 수 있습니다.'
                    : 'Choose a station, select a primary card in the Support panel, and click "Start Charging". Control limits, watch values increment, and generate real history invoices.'}
                </p>

                <p className="font-bold text-[#002e60]">💳 {lang === 'ko' ? '결제 카드 및 이력 원장 대장' : 'History & Card Management'}</p>
                <p>
                  {lang === 'ko'
                    ? '충전이 끝나면 대장에 영구적인 영수증이 기록됩니다. [충전기록] 탭에서 누적된 포인트와 요일별 에너지 소비 도표 차트를 분석하고, [지원 및 관리] 탭에서 결제 카드를 추가하세요.'
                    : 'Analyze consumption graphs, download history to CSV, and manage payment cards seamlessly.'}
                </p>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full mt-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#002e60] rounded-xl font-bold text-xs"
              >
                {lang === 'ko' ? '길라잡이 닫기' : 'Understand & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
