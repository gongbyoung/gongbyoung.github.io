import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  MapPin,
  Phone,
  Truck,
  X,
} from 'lucide-react';
import {
  DeliveryStatus,
  DeliveryStop,
  DropOffMethod,
} from '../types/logistics';
import { KakaoButton, StatusBadge } from './StatusBadge';

interface DeliveryDetailSheetProps {
  stop: DeliveryStop | null;
  vehicleNames: string[];
  onAssignVehicle: (clientName: string, vehicleCode: string) => void;
  onClose: () => void;
  onUpdateStop: (updated: DeliveryStop) => void;
  onSendKakaoForStop: (stop: DeliveryStop) => void;
}

const DROP_OFF_OPTIONS: DropOffMethod[] = [
  '직접 전달',
  '문 앞 배송',
  '경비실 위탁',
  '하역장 인계',
];

const ISSUE_PRESETS = [
  '수취인 부재',
  '매장/사무실 문 닫힘',
  '하역장 대기 지연',
  '주소/호수 확인 필요',
];

export const DeliveryDetailSheet: React.FC<DeliveryDetailSheetProps> = ({
  stop,
  vehicleNames,
  onAssignVehicle,
  onClose,
  onUpdateStop,
  onSendKakaoForStop,
}) => {
  const [dropOff, setDropOff] = useState<DropOffMethod>('직접 전달');
  const [issueNote, setIssueNote] = useState('');

  useEffect(() => {
    if (stop) {
      setDropOff(stop.dropOffMethod ?? '직접 전달');
      setIssueNote(stop.issueReason ?? '');
    }
  }, [stop]);

  if (!stop) return null;

  const nowTime = () => new Date().toTimeString().slice(0, 5);

  const handleSetStatus = (nextStatus: DeliveryStatus) => {
    onUpdateStop({
      ...stop,
      status: nextStatus,
      dropOffMethod: nextStatus === 'delivered' ? dropOff : stop.dropOffMethod,
      completedTime: nextStatus === 'delivered' ? nowTime() : undefined,
      issueReason:
        nextStatus === 'issue'
          ? issueNote.trim() || '현장 배송 보류'
          : undefined,
    });
    if (nextStatus === 'delivered' || nextStatus === 'in_transit') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0F172A]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-sheet-title"
    >
      <div className="w-full sm:max-w-[460px] max-h-[90vh] bg-white border-t border-x border-[#CBD5E1] rounded-t-xl shadow-[0_10px_15px_-3px_rgba(15,23,42,0.12)] flex flex-col overflow-hidden">
        {/* Grab handle */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 bg-[#CBD5E1] rounded-sm" />
        </div>

        {/* Header */}
        <div className="px-4 py-2.5 border-b border-[#E2E8F0] flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#64748B] flex-wrap">
              <span className="px-1.5 py-0.5 bg-[#1E3A8A] text-white font-bold rounded-sm">
                #{String(stop.stopOrder).padStart(2, '0')}
              </span>
              <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#0F172A] font-bold rounded-sm">
                {stop.waybillNo}
              </span>
              {stop.isUrgent && (
                <span className="px-1.5 py-0.5 bg-[#FEE2E2] text-[#DC2626] font-sans font-bold rounded-sm">
                  급/오전
                </span>
              )}
              <span>·</span>
              <span className="tabular-nums">{stop.scheduledTime} 발주</span>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <h2
                id="delivery-sheet-title"
                className="text-lg font-bold text-[#0F172A] leading-snug"
              >
                {stop.clientName}
              </h2>
              {stop.isKnownClient && (
                <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] text-[10px] font-bold rounded-sm">
                  인증
                </span>
              )}
            </div>

            <p className="text-xs text-[#64748B]">
              {stop.officialName !== stop.clientName ? `${stop.officialName} · ` : ''}
              {stop.ceo ? `대표: ${stop.ceo}` : '등록 대표자 정보 없음'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Status + Contact Call */}
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={stop.status} />
            {stop.phone ? (
              <a
                href={`tel:${stop.phone.replace(/[^0-9]/g, '')}`}
                className="min-h-[40px] px-3 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="font-mono tabular-nums">{stop.phone}</span>
              </a>
            ) : (
              <span className="text-xs text-[#64748B]">연락처 미등록</span>
            )}
          </div>

          {/* Vehicle Dispatch Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="sheet-vehicle-select"
              className="block text-xs font-semibold text-[#334155]"
            >
              배차 차량 지정
            </label>
            <select
              id="sheet-vehicle-select"
              value={stop.vehicleCode}
              onChange={(e) => onAssignVehicle(stop.clientName, e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#CBD5E1] rounded-sm text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="UNASSIGNED">미배차</option>
              {vehicleNames.map((vName, idx) => (
                <option key={idx} value={`V${idx}`}>
                  {vName}
                </option>
              ))}
              <option value="PICKUP">직접방문 / 택배</option>
            </select>
          </div>

          {/* Address, Door Code & Extracted Order Lines */}
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
              <p className="font-semibold text-[#0F172A] leading-snug">
                {stop.address}
              </p>
            </div>

            {stop.doorNote && (
              <div className="flex items-start gap-2 p-2 bg-[#FEFCE8] border border-[#FEF08A] rounded-sm text-[#B45309] font-semibold">
                <KeyRound className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{stop.doorNote}</span>
              </div>
            )}

            <div className="pt-2 border-t border-[#E2E8F0] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B] font-semibold">추출 발주 내역</span>
                <span className="font-mono tabular-nums font-bold text-[#1E3A8A]">
                  {stop.boxCount}박스
                  {stop.looseCount > 0 ? ` · 낱개 ${stop.looseCount}` : ''}
                </span>
              </div>
              <pre className="whitespace-pre-line font-sans text-xs text-[#0F172A] bg-white border border-[#E2E8F0] rounded-sm p-2.5 leading-relaxed">
                {stop.orderLines.join('\n\n')}
              </pre>
            </div>
          </div>

          {/* Drop-off Method Selector (for Delivery Completion) */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-[#334155]">
              인계 / 수령 위치 선택
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DROP_OFF_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDropOff(opt)}
                  className={`min-h-[44px] px-3 text-xs font-semibold rounded-sm border transition-colors cursor-pointer ${
                    dropOff === opt
                      ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                      : 'bg-white border-[#CBD5E1] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Issue / Hold Note */}
          <div className="space-y-2">
            <label
              htmlFor="delivery-issue-note"
              className="block text-xs font-semibold text-[#334155]"
            >
              배송 보류 / 특이사항 사유
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ISSUE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIssueNote(preset)}
                  className="min-h-[34px] px-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] text-[11px] font-medium rounded-sm cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              id="delivery-issue-note"
              type="text"
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              placeholder="보류 사유 입력 (예: 수취인 부재, 14시 이후 재방문)"
              className="w-full h-11 px-3 bg-white border border-[#CBD5E1] rounded-sm text-xs text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Sticky Bottom Thumb Actions */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSetStatus('in_transit')}
              className="h-12 px-3 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E3A8A] text-sm font-semibold rounded-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>배송 출발</span>
            </button>
            <button
              type="button"
              onClick={() => handleSetStatus('issue')}
              className="h-12 px-3 bg-[#FEE2E2] hover:bg-[#FECACA] border border-[#FECACA] text-[#DC2626] text-sm font-semibold rounded-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>이슈/보류</span>
            </button>
          </div>

          <div className="flex gap-2">
            <KakaoButton
              label="카톡 알림"
              size="lg"
              onClick={() => onSendKakaoForStop(stop)}
            />
            <button
              type="button"
              onClick={() => handleSetStatus('delivered')}
              className="flex-1 h-12 px-4 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-sm font-semibold rounded-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>배송 완료 처리</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
