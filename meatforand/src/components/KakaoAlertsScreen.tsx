import React, { useEffect, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { DeliveryStop, KakaoDeliveryAlert } from '../types/logistics';
import { KakaoButton, KakaoIcon } from './StatusBadge';

interface KakaoAlertsScreenProps {
  stops: DeliveryStop[];
  alerts: KakaoDeliveryAlert[];
  draftStop: DeliveryStop | null;
  onSendAlert: (payload: {
    recipientLabel: string;
    waybillNo?: string;
    templateType: string;
    messageText: string;
  }) => void;
}

const TEMPLATES = [
  { key: '출발 안내', label: '배송 출발' },
  { key: '도착 예정 안내', label: '10분 전 도착' },
  { key: '배송 완료 안내', label: '배송 완료' },
  { key: '부재/보류 안내', label: '부재/보류' },
] as const;

function formatQtySummary(stop: DeliveryStop): string {
  const parts: string[] = [];
  if (stop.boxCount > 0) parts.push(`${stop.boxCount}박스`);
  if (stop.looseCount > 0) parts.push(`낱개 ${stop.looseCount}`);
  return parts.length > 0 ? parts.join(' · ') : '발주 물량';
}

function buildTemplateText(stop: DeliveryStop, templateType: string): string {
  const qty = formatQtySummary(stop);
  switch (templateType) {
    case '출발 안내':
      return `[미트포앤 배송출발] ${stop.clientName}님(송장 ${stop.waybillNo}), ${qty} 배송을 출발했습니다. 도착지: ${stop.address}`;
    case '도착 예정 안내':
      return `[미트포앤 도착예정] ${stop.clientName}님(송장 ${stop.waybillNo}), 약 10분 후 도착 예정입니다. (${qty}) 현장 수령 준비 부탁드립니다.`;
    case '배송 완료 안내':
      return `[미트포앤 배송완료] ${stop.clientName}님(송장 ${stop.waybillNo}), ${stop.dropOffMethod ?? '지정 위치'}에 ${qty} 배송이 정상 완료되었습니다.`;
    case '부재/보류 안내':
      return `[미트포앤 배송보류] ${stop.clientName}님(송장 ${stop.waybillNo}), ${stop.issueReason || '현장 수취인 부재'}로 잠시 보관 이동합니다. 재방문 희망 시간 회신 부탁드립니다.`;
    default:
      return `[미트포앤 배송안내] ${stop.clientName}님 송장 ${stop.waybillNo} 관련 안내드립니다.`;
  }
}

export const KakaoAlertsScreen: React.FC<KakaoAlertsScreenProps> = ({
  stops,
  alerts,
  draftStop,
  onSendAlert,
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string>(
    draftStop?.id ?? stops[0]?.id ?? ''
  );
  const [templateType, setTemplateType] = useState<string>('도착 예정 안내');
  const [messageText, setMessageText] = useState<string>('');

  const activeStop = stops.find((s) => s.id === selectedStopId) ?? stops[0];

  useEffect(() => {
    if (draftStop) {
      setSelectedStopId(draftStop.id);
      const nextTpl =
        draftStop.status === 'delivered'
          ? '배송 완료 안내'
          : draftStop.status === 'issue'
          ? '부재/보류 안내'
          : '도착 예정 안내';
      setTemplateType(nextTpl);
      setMessageText(buildTemplateText(draftStop, nextTpl));
    }
  }, [draftStop]);

  useEffect(() => {
    if (activeStop && !draftStop) {
      if (!selectedStopId) setSelectedStopId(activeStop.id);
      setMessageText(buildTemplateText(activeStop, templateType));
    } else if (!activeStop) {
      setMessageText('');
    }
  }, [activeStop?.id, templateType]);

  const handleSelectTemplate = (tpl: string) => {
    setTemplateType(tpl);
    if (activeStop) {
      setMessageText(buildTemplateText(activeStop, tpl));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeStop) return;
    onSendAlert({
      recipientLabel:
        activeStop.officialName !== activeStop.clientName
          ? `${activeStop.clientName} (${activeStop.officialName})`
          : activeStop.clientName,
      waybillNo: activeStop.waybillNo,
      templateType,
      messageText: messageText.trim(),
    });
  };

  return (
    <div className="space-y-3">
      {/* Composer Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#E2E8F0] rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] overflow-hidden"
      >
        <div className="px-3.5 py-2.5 bg-[#FEE500] border-b border-[#EBD300] flex items-center justify-between text-[#3C1E1E]">
          <div className="flex items-center gap-2">
            <KakaoIcon className="w-4 h-4" />
            <h2 className="text-xs font-bold tracking-wide">
              카카오톡 배송 안내 발송
            </h2>
          </div>
          <span className="font-mono text-[11px] font-bold">거래처 알림톡</span>
        </div>

        <div className="p-3.5 space-y-3">
          {/* Target Delivery Stop */}
          <div className="space-y-1.5">
            <label
              htmlFor="kakao-stop-select"
              className="block text-xs font-semibold text-[#334155]"
            >
              수신 거래처 선택
            </label>
            <select
              id="kakao-stop-select"
              value={activeStop?.id ?? ''}
              disabled={stops.length === 0}
              onChange={(e) => {
                setSelectedStopId(e.target.value);
                const next = stops.find((s) => s.id === e.target.value);
                if (next) {
                  setMessageText(buildTemplateText(next, templateType));
                }
              }}
              className="w-full h-11 px-3 bg-white border border-[#CBD5E1] rounded-sm text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:bg-[#F1F5F9]"
            >
              {stops.length === 0 ? (
                <option value="">추출된 배송처가 없습니다</option>
              ) : (
                stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    #{String(s.stopOrder).padStart(2, '0')} {s.clientName} ·{' '}
                    {formatQtySummary(s)}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 1-Tap Message Templates */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-[#334155]">
              빠른 안내 문구
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {TEMPLATES.map((tpl) => {
                const active = templateType === tpl.key;
                return (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.key)}
                    className={`min-h-[40px] px-2.5 text-xs font-semibold rounded-sm border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                        : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    {tpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Text */}
          <div className="space-y-1.5">
            <label
              htmlFor="kakao-msg-input"
              className="block text-xs font-semibold text-[#334155]"
            >
              발송 내용
            </label>
            <textarea
              id="kakao-msg-input"
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="배송처를 선택하거나 안내 문구를 입력하세요..."
              className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-sm text-xs text-[#0F172A] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <KakaoButton
            type="submit"
            label="카카오톡 알림 보내기"
            size="lg"
            disabled={!activeStop || !messageText.trim()}
            className="w-full"
          />
        </div>
      </form>

      {/* Sent History */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] overflow-hidden">
        <div className="px-3.5 py-2.5 bg-[#F1F5F9] border-b border-[#CBD5E1] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#444651]">
            최근 발송 내역
          </h3>
          <span className="font-mono text-xs text-[#64748B]">{alerts.length}건</span>
        </div>
        <div className="divide-y divide-[#E2E8F0]">
          {alerts.map((al) => (
            <div key={al.id} className="p-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#0F172A] truncate">
                  {al.recipientLabel}
                </span>
                <span className="font-mono tabular-nums text-[11px] text-[#64748B] shrink-0">
                  {al.sentAt}
                </span>
              </div>
              <p className="text-xs text-[#334155] bg-[#FEFCE8] border border-[#FEF08A] rounded-sm p-2.5 leading-relaxed">
                {al.messageText}
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B]">
                <span>
                  {al.waybillNo} · {al.templateType}
                </span>
                <span className="inline-flex items-center gap-1 text-[#16A34A] font-semibold">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{al.status === 'read' ? '읽음' : '전송됨'}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
