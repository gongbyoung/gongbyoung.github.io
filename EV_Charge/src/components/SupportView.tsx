/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Plus, CreditCard, ChevronDown, CheckCircle2, RefreshCw, AlertCircle, PhoneCall, Mail } from 'lucide-react';
import { RegisteredCard } from '../types';
import { FAQS } from '../data';

interface SupportViewProps {
  cards: RegisteredCard[];
  setCards: React.Dispatch<React.SetStateAction<RegisteredCard[]>>;
  lang: 'ko' | 'en';
  showNotificationToast: (msg: string) => void;
  setActiveTab: (tab: 'dashboard' | 'history' | 'support') => void;
}

export default function SupportView({
  cards,
  setCards,
  lang,
  showNotificationToast,
  setActiveTab
}: SupportViewProps) {
  const [formCategory, setFormCategory] = useState('Billing & Payments');
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(0); // Default open first FAQ

  // Simulated state for Adding Cards
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardType, setNewCardType] = useState<'visa' | 'mastercard' | 'shinhan' | 'hyundai'>('visa');

  // Direct Inquiry Form Submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMessage.trim()) {
      showNotificationToast(
        lang === 'ko' ? '문의 내용을 작성해 주세요.' : 'Please write your message first.'
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormMessage('');
      showNotificationToast(
        lang === 'ko'
          ? '문의 사항이 성공적으로 한전 고객 지원단에 전송되었습니다.'
          : 'Your inquiry has been successfully transmitted to KEPCO Support.'
      );

      // Reset success status after a brief duration
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4000);
    }, 1500);
  };

  // Dynamic Card addition
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCardNumber.length < 16 || !newCardExpiry) {
      showNotificationToast(
        lang === 'ko' ? '카드 정보가 올바르지 않습니다.' : 'Invalid credit card information.'
      );
      return;
    }

    // Format number to have dots
    const formattedNum = `•••• •••• •••• ${newCardNumber.slice(-4)}`;
    const newCard: RegisteredCard = {
      id: `card-${Date.now()}`,
      isPrimary: cards.length === 0,
      type: newCardType,
      number: formattedNum,
      name: `${newCardType.toUpperCase()} PERSONAL`,
      expiry: newCardExpiry
    };

    setCards((prev) => [...prev, newCard]);
    setNewCardNumber('');
    setNewCardExpiry('');
    setShowAddCard(false);
    showNotificationToast(
      lang === 'ko' ? '신규 결제 카드가 등록되었습니다.' : 'New payment card has been registered.'
    );
  };

  // Remove card
  const handleRemoveCard = (id: string) => {
    setCards((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      // Ensure there's still a primary card if any cards left
      if (remaining.length > 0 && !remaining.some((c) => c.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
    showNotificationToast(
      lang === 'ko' ? '등록된 결제 카드가 삭제되었습니다.' : 'Payment card removed.'
    );
  };

  // Set card as primary
  const handleSetPrimary = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === id
      }))
    );
    showNotificationToast(
      lang === 'ko' ? '주 결제 카드가 변경되었습니다.' : 'Primary payment card updated.'
    );
  };

  return (
    <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gray-50/50">
      {/* Upper header segment */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-[#002e60]">
              {lang === 'ko' ? '고객 센터 및 제어' : 'Support & Management'}
            </h1>
            <p className="font-sans text-sm text-[#424751] max-w-2xl mt-1.5">
              {lang === 'ko'
                ? '긴급 지원을 요청하고 멤버십, 결제 카드를 관리하며 전력 네트워크 현황을 한눈에 살펴보실 수 있습니다.'
                : 'Access assistance, manage your membership, and view real-time network status all in one place.'}
            </p>
          </div>

          {/* Membership Tier badge */}
          <div className="bg-[#c9e7f7] p-4 rounded-xl border border-[#002e60]/10 flex items-center gap-4 shadow-sm">
            <div className="bg-[#002e60] p-2.5 rounded-lg text-white font-bold text-lg">
              🏅
            </div>
            <div>
              <p className="text-[10px] text-[#424751] font-bold uppercase tracking-wider">
                {lang === 'ko' ? '회원 멤버십 등급' : 'Your Status'}
              </p>
              <p className="font-display text-lg font-bold text-[#002e60]">
                {lang === 'ko' ? '프리미엄 최우수 고객' : 'Premium Member'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Network Status section (Col 1-8) */}
        <div className="col-span-12 lg:col-span-8 bg-white border border-[#c3c6d2] rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#006e1c]" />

          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 bg-[#006e1c] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-[#006e1c] uppercase tracking-wider">
                  {lang === 'ko' ? '실시간 상태 모니터' : 'Live Status'}
                </span>
              </div>
              <h3 className="font-display font-bold text-xl text-[#001f2a]">
                {lang === 'ko' ? '한전 전력망 실시간 상태지수' : 'KEPCO Charging Network'}
              </h3>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-extrabold text-[#006e1c]">98.4%</p>
              <p className="text-[10px] text-[#424751] font-bold">
                {lang === 'ko' ? '전국 종합 가동율' : 'Global Uptime'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#e6f6ff] p-4 rounded-xl border border-[#c3c6d2]/40">
              <p className="text-xs font-bold text-[#424751] mb-1">
                {lang === 'ko' ? '초급속 충전소 (350kW)' : 'Fast Chargers'}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#002e60] text-sm">Active</span>
                <span className="bg-[#91f78e] text-[#00731e] px-2 py-0.5 rounded text-[10px] font-extrabold">
                  NORMAL
                </span>
              </div>
            </div>

            <div className="bg-[#e6f6ff] p-4 rounded-xl border border-[#c3c6d2]/40">
              <p className="text-xs font-bold text-[#424751] mb-1">
                {lang === 'ko' ? '도심 충전 허브 (100kW)' : 'Urban Hubs'}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#002e60] text-sm">Active</span>
                <span className="bg-[#91f78e] text-[#00731e] px-2 py-0.5 rounded text-[10px] font-extrabold">
                  NORMAL
                </span>
              </div>
            </div>

            <div className="bg-[#e6f6ff] p-4 rounded-xl border border-[#c3c6d2]/40">
              <p className="text-xs font-bold text-[#424751] mb-1">
                {lang === 'ko' ? '순차 예방 정검소' : 'Maintenance'}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#002e60] text-sm">
                  {lang === 'ko' ? '12개 초소' : '12 Stations'}
                </span>
                <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-extrabold">
                  SCHEDULED
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center text-xs">
            <p className="text-[#424751] italic font-medium">
              Last updated: {new Date().toLocaleDateString()} 14:22 PM
            </p>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-[#002e60] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              {lang === 'ko' ? '상세 지도 관제소 이동' : 'View Detailed Map'} &rarr;
            </button>
          </div>
        </div>

        {/* Registered Cards section (Col 9-12) */}
        <div className="col-span-12 lg:col-span-4 bg-white border border-[#c3c6d2] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-display font-bold text-lg text-[#001f2a]">
              {lang === 'ko' ? '등록 결제 카드' : 'Registered Cards'}
            </h3>
            <button
              onClick={() => setShowAddCard(!showAddCard)}
              className="text-[#002e60] hover:bg-[#d9f2ff] p-1.5 rounded-lg transition-all cursor-pointer"
              title={lang === 'ko' ? '새 결제수단 등록' : 'Add Card'}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add card small form toggle */}
          {showAddCard && (
            <form onSubmit={handleAddCard} className="mb-4 p-3 bg-gray-50 border border-[#c3c6d2] rounded-xl space-y-2">
              <div>
                <label className="block text-[10px] font-bold text-[#424751] mb-0.5">Card Number</label>
                <input
                  type="text"
                  maxLength={16}
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="16-digit card number"
                  className="w-full bg-white border border-[#c3c6d2] rounded-lg p-1.5 text-xs outline-none focus:ring-1 focus:ring-[#002e60]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-[#424751] mb-0.5">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="MM/YY"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full bg-white border border-[#c3c6d2] rounded-lg p-1.5 text-xs outline-none focus:ring-1 focus:ring-[#002e60]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#424751] mb-0.5">Card Brand</label>
                  <select
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value as any)}
                    className="w-full bg-white border border-[#c3c6d2] rounded-lg p-1.5 text-xs outline-none"
                  >
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                    <option value="shinhan">Shinhan</option>
                    <option value="hyundai">Hyundai</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCard(false)}
                  className="px-2 py-1 bg-white border border-[#c3c6d2] text-[#424751] text-[10px] font-bold rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-[#002e60] text-white text-[10px] font-bold rounded-lg hover:bg-[#004488]"
                >
                  Register
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`relative rounded-xl p-4 overflow-hidden border transition-all ${
                  card.isPrimary
                    ? 'bg-gradient-to-br from-[#002e60] to-[#004488] text-white border-[#002e60]'
                    : 'bg-white text-[#001f2a] border-[#c3c6d2] hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold ${card.isPrimary ? 'opacity-80' : 'text-[#424751]'}`}>
                    {card.isPrimary ? (lang === 'ko' ? '기본(주) 결제 수단' : 'Primary Card') : (lang === 'ko' ? '보조 결제 수단' : 'Backup Card')}
                  </span>
                  <CreditCard size={18} className={card.isPrimary ? 'opacity-90' : 'text-[#424751]'} />
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className={`font-mono text-sm tracking-widest ${card.isPrimary ? 'text-white' : 'text-[#002e60] font-bold'}`}>
                      {card.number}
                    </p>
                    <p className={`text-[9px] font-bold uppercase mt-1 ${card.isPrimary ? 'opacity-70' : 'text-[#424751]'}`}>
                      {card.name} ({card.expiry})
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!card.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(card.id)}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                          card.isPrimary
                            ? 'hidden'
                            : 'border-[#c3c6d2] hover:bg-[#ceedfd] hover:text-[#002e60] text-[#424751]'
                        }`}
                      >
                        {lang === 'ko' ? '기본설정' : 'Set Main'}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveCard(card.id)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                        card.isPrimary
                          ? 'border-white/30 hover:bg-white/10 text-white'
                          : 'border-red-200 hover:bg-red-50 text-red-600'
                      }`}
                    >
                      {lang === 'ko' ? '삭제' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cards.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-[#c3c6d2] rounded-xl text-xs text-[#424751]">
                {lang === 'ko' ? '등록된 결제 카드가 없습니다.' : 'No registered payment cards.'}
              </div>
            )}
          </div>
        </div>

        {/* FAQ section (Col 1-7) */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <h3 className="font-display font-bold text-xl text-[#002e60]">
            {lang === 'ko' ? '자주 묻는 질문 (FAQ)' : 'Frequently Asked Questions'}
          </h3>

          <div className="space-y-2">
            {FAQS.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div key={index} className="bg-white border border-[#c3c6d2] rounded-xl overflow-hidden transition-all">
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50/50 transition-all font-sans text-xs sm:text-sm font-bold text-[#001f2a] cursor-pointer"
                  >
                    <span>{lang === 'ko' ? faq.questionKo : faq.question}</span>
                    <ChevronDown size={16} className={`text-[#424751] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs sm:text-sm text-[#424751] font-medium leading-relaxed">
                      {lang === 'ko' ? faq.answerKo : faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inquiry form section (Col 8-12) */}
        <div className="col-span-12 lg:col-span-5 bg-white border border-[#c3c6d2] rounded-2xl p-6 shadow-sm">
          <h3 className="font-display font-bold text-lg text-[#001f2a] mb-1">
            {lang === 'ko' ? '고객의 소리 (상담 일기)' : 'Direct Inquiry'}
          </h3>
          <p className="text-xs text-[#424751] mb-5">
            {lang === 'ko'
              ? '민원 사항을 접수해주시면 2시간 이내에 담당 기술 요원이 직접 연락을 드립니다.'
              : 'Send us a message and our support team will get back to you within 2 hours.'}
          </p>

          {submitSuccess ? (
            <div className="bg-[#91f78e]/30 border border-[#006e1c]/20 rounded-xl p-6 text-center text-[#00731e] flex flex-col items-center justify-center space-y-2 animate-fade-in">
              <CheckCircle2 size={36} className="text-[#006e1c]" />
              <h4 className="font-display font-bold text-base">
                {lang === 'ko' ? '상담 접수 성공!' : 'Submitted Successfully!'}
              </h4>
              <p className="text-xs font-semibold">
                {lang === 'ko'
                  ? '답변은 마이페이지 또는 이메일로 발송됩니다.'
                  : 'We will contact you via email as soon as possible.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#001f2a] mb-1">
                  {lang === 'ko' ? '문의 분류' : 'Category'}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-[#e6f6ff] border border-[#c3c6d2] rounded-lg p-2.5 text-xs sm:text-sm font-semibold text-[#001f2a] focus:ring-1 focus:ring-[#002e60] outline-none"
                >
                  <option value="Billing & Payments">{lang === 'ko' ? '요금 및 청구 결제' : 'Billing & Payments'}</option>
                  <option value="Technical Issue">{lang === 'ko' ? '충전기 고장 및 기술 문제' : 'Technical Issue'}</option>
                  <option value="Membership Inquiry">{lang === 'ko' ? '회원 정보 및 멤버십' : 'Membership Inquiry'}</option>
                  <option value="General Feedback">{lang === 'ko' ? '제안 및 서비스 피드백' : 'General Feedback'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#001f2a] mb-1">
                  {lang === 'ko' ? '문의 사항 내용' : 'Message'}
                </label>
                <textarea
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={
                    lang === 'ko'
                      ? '기기 번호 또는 고장 상세 내용을 입력해 주세요...'
                      : 'Describe your issue or question in detail...'
                  }
                  className="w-full bg-[#e6f6ff] border border-[#c3c6d2] rounded-lg p-3 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-[#002e60] resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#002e60] hover:bg-[#004488] text-white rounded-xl font-display font-bold text-sm hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    <span>{lang === 'ko' ? '전송 접수 중...' : 'Sending...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'ko' ? '상담 신청서 제출' : 'Submit Request'}</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Support footer info block */}
      <footer className="mt-10 pt-8 border-t border-[#c3c6d2] flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex items-center gap-2 text-xs text-[#424751] font-semibold">
            <PhoneCall size={16} className="text-[#002e60]" />
            <span>1588-XXXX ({lang === 'ko' ? '24시간 무휴 고객센터' : '24/7 Support'})</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#424751] font-semibold">
            <Mail size={16} className="text-[#002e60]" />
            <span>support@kepcocharge.co.kr</span>
          </div>
        </div>
        <div className="flex gap-4 text-xs text-[#424751] font-bold">
          <button className="hover:text-[#002e60]">{lang === 'ko' ? '이용약관' : 'Terms of Service'}</button>
          <button className="hover:text-[#002e60]">{lang === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}</button>
        </div>
      </footer>
    </div>
  );
}
