/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'history' | 'support';
  setActiveTab: (tab: 'dashboard' | 'history' | 'support') => void;
  lang: 'ko' | 'en';
  setLang: (lang: 'ko' | 'en') => void;
  showNotificationToast: (msg: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  showNotificationToast
}: HeaderProps) {
  return (
    <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-[#c3c6d2] shadow-sm">
      <div className="flex justify-between items-center h-16 px-6 max-w-[1280px] mx-auto md:px-12">
        {/* Brand & Language Cluster */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            {/* Elegant EV lightning logo */}
            <div className="w-8 h-8 rounded-lg bg-[#002e60] flex items-center justify-center text-white font-bold text-lg">
              ⚡
            </div>
            <span className="font-display font-bold text-xl md:text-2xl text-[#002e60] tracking-tight">
              KEPCO Charge
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-[#e6f6ff] p-1 rounded-lg border border-[#c3c6d2]">
            <button
              onClick={() => {
                setLang('ko');
                showNotificationToast('한국어로 변경되었습니다.');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === 'ko'
                  ? 'bg-[#002e60] text-white shadow-sm'
                  : 'text-[#424751] hover:text-[#002e60]'
              }`}
            >
              KR
            </button>
            <button
              onClick={() => {
                setLang('en');
                showNotificationToast('Language changed to English.');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                lang === 'en'
                  ? 'bg-[#002e60] text-white shadow-sm'
                  : 'text-[#424751] hover:text-[#002e60]'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`text-sm font-semibold transition-all pb-1 border-b-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-[#002e60] border-[#002e60]'
                : 'text-[#424751] border-transparent hover:text-[#002e60]'
            }`}
          >
            {lang === 'ko' ? '대시보드 (지도)' : 'Dashboard (Map)'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`text-sm font-semibold transition-all pb-1 border-b-2 cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#002e60] border-[#002e60]'
                : 'text-[#424751] border-transparent hover:text-[#002e60]'
            }`}
          >
            {lang === 'ko' ? '충전 내역' : 'Charging History'}
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`text-sm font-semibold transition-all pb-1 border-b-2 cursor-pointer ${
              activeTab === 'support'
                ? 'text-[#002e60] border-[#002e60]'
                : 'text-[#424751] border-transparent hover:text-[#002e60]'
            }`}
          >
            {lang === 'ko' ? '지원 및 관리' : 'Support & Admin'}
          </button>
        </nav>

        {/* Action icons & Profile */}
        <div className="flex items-center gap-3">
          {/* Lang selector for mobile */}
          <button
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')}
            className="sm:hidden text-xs font-bold px-2 py-1 bg-[#e6f6ff] border border-[#c3c6d2] rounded-md text-[#002e60]"
          >
            {lang === 'ko' ? 'EN' : 'KR'}
          </button>

          <button
            onClick={() => showNotificationToast(lang === 'ko' ? '새로운 알림이 없습니다.' : 'No new notifications.')}
            className="p-2 text-[#424751] hover:bg-[#d9f2ff] rounded-full transition-all cursor-pointer"
            title={lang === 'ko' ? '알림' : 'Notifications'}
          >
            <Bell size={20} />
          </button>
          <button
            onClick={() => showNotificationToast(lang === 'ko' ? '시스템 설정 페이지로 이동합니다.' : 'Redirecting to system settings.')}
            className="p-2 text-[#424751] hover:bg-[#d9f2ff] rounded-full transition-all cursor-pointer"
            title={lang === 'ko' ? '설정' : 'Settings'}
          >
            <Settings size={20} />
          </button>

          {/* Profile pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#ceedfd] hover:bg-[#c9e7f7] rounded-full border border-[#c3c6d2] cursor-pointer transition-all">
            <div className="w-6 h-6 rounded-full bg-[#002e60] flex items-center justify-center text-white">
              <User size={14} className="fill-current" />
            </div>
            <span className="font-sans text-xs font-semibold text-[#002e60] hidden sm:inline">
              {lang === 'ko' ? '홍길동 회장님' : 'Gildong Hong'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
