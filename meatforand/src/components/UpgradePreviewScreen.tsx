import React, { useState } from 'react';
import { Printer, ScanBarcode } from 'lucide-react';
import { DEFAULT_VEHICLES } from '../data/defaultClients';
import { DeliveryStop } from '../types/logistics';

interface UpgradePreviewScreenProps {
  stops: DeliveryStop[];
  vehicleNames?: string[];
}

export const UpgradePreviewScreen: React.FC<UpgradePreviewScreenProps> = ({
  stops,
  vehicleNames = DEFAULT_VEHICLES,
}) => {
  const [previewStopId, setPreviewStopId] = useState(stops[0]?.id ?? '');
  const [showSlipPreview, setShowSlipPreview] = useState(true);

  const selectedStop = stops.find((s) => s.id === previewStopId) ?? stops[0];

  const getVehicleLabel = (code: string) => {
    if (code.startsWith('V')) {
      const idx = parseInt(code.substring(1), 10);
      return vehicleNames[idx] ?? code;
    }
    if (code === 'PICKUP') return '직접방문 / 택배';
    return '미배차 (현장 배정 대기)';
  };

  return (
    <div className="space-y-3">
      {/* Phase 2 Roadmap Notice */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#0F172A]">
            업그레이드 확장 모듈 안내
          </h2>
          <span className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-[11px] font-semibold rounded-sm">
            2단계 연동 예정
          </span>
        </div>
        <p className="text-xs text-[#334155] leading-relaxed">
          현재 웹 버전은 스마트폰 현장 배송·카톡 발주 추출 및 배차에 최적화되어 있습니다.
          추후 하드웨어/앱 업그레이드 시 아래 두 기능이 추출된 송장 데이터와 바로 연결됩니다.
        </p>
      </section>

      {/* Module 1: Barcode Scan (Planned) */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-sm flex items-center justify-center shrink-0">
              <ScanBarcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                01. 모바일 카메라 / PDA 바코드 스캔
              </h3>
              <p className="text-xs text-[#64748B]">
                운송장 및 축산 이력 바코드 스캔 후 자동 수량 검증 및 배송완료 처리
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#FFEDD5] border border-[#FED7AA] text-[#C2410C] text-[11px] font-semibold rounded-sm shrink-0">
            준비중
          </span>
        </div>
        <div className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm text-xs text-[#334155] font-mono">
          연동 규격: EAN-13 / CODE-128 송장번호 ({selectedStop?.waybillNo ?? 'AWB-대기'}) 자동 매칭 지원 예정
        </div>
      </section>

      {/* Module 2: Mobile Receipt / Slip Print Preview */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] rounded-sm flex items-center justify-center shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                02. 블루투스 모바일 전표 / 인수증 출력
              </h3>
              <p className="text-xs text-[#64748B]">
                현장 배송 완료 시 감열지 인수증·거래명세 전표 즉시 인쇄
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#FFEDD5] border border-[#FED7AA] text-[#C2410C] text-[11px] font-semibold rounded-sm shrink-0">
            준비중
          </span>
        </div>

        {/* Select stop to preview thermal slip */}
        <div className="flex items-center gap-2">
          <select
            value={selectedStop?.id ?? ''}
            disabled={stops.length === 0}
            onChange={(e) => setPreviewStopId(e.target.value)}
            aria-label="전표 미리보기 배송지 선택"
            className="flex-1 h-11 px-3 bg-white border border-[#CBD5E1] rounded-sm text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:bg-[#F1F5F9]"
          >
            {stops.length === 0 ? (
              <option value="">추출된 배송처가 없습니다</option>
            ) : (
              stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.waybillNo} · {s.clientName}
                </option>
              ))
            )}
          </select>
          <button
            type="button"
            onClick={() => setShowSlipPreview((p) => !p)}
            className="h-11 px-3 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm whitespace-nowrap cursor-pointer"
          >
            {showSlipPreview ? '전표 접기' : '전표 보기'}
          </button>
        </div>

        {/* Thermal Receipt / Waybill Slip Preview */}
        {showSlipPreview && selectedStop && (
          <div className="border border-dashed border-[#94A3B8] bg-[#F8FAFC] rounded-sm p-3.5 font-mono text-xs text-[#0F172A] space-y-2">
            <div className="flex items-center justify-between border-b border-dashed border-[#CBD5E1] pb-2">
              <span className="font-bold">(주)미트포앤 배송 전표 (미리보기)</span>
              <span className="text-[11px] text-[#64748B]">80mm 감열지</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">송장번호</span>
                <span className="font-bold">{selectedStop.waybillNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">거래처</span>
                <span className="font-sans font-semibold">{selectedStop.clientName}</span>
              </div>
              {selectedStop.officialName !== selectedStop.clientName && (
                <div className="flex justify-between">
                  <span className="text-[#64748B]">정식상호</span>
                  <span className="font-sans">{selectedStop.officialName}</span>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B] shrink-0">배송지</span>
                <span className="font-sans text-right">{selectedStop.address}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#64748B] shrink-0">품목 / 수량</span>
                <span className="font-sans font-semibold text-right">
                  {selectedStop.boxCount}박스
                  {selectedStop.looseCount > 0 ? ` · 낱개 ${selectedStop.looseCount}` : ''}
                </span>
              </div>
              {selectedStop.orderLines.length > 0 && (
                <div className="pt-1 border-t border-dashed border-[#CBD5E1] font-sans text-[11px] text-[#334155] whitespace-pre-line">
                  {selectedStop.orderLines.join('\n')}
                </div>
              )}
              <div className="flex justify-between pt-1">
                <span className="text-[#64748B]">배차차량</span>
                <span className="font-sans">
                  {getVehicleLabel(selectedStop.vehicleCode)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-[#CBD5E1] flex items-center justify-between text-[11px] text-[#64748B]">
              <span>인수자 서명: ( ________________ )</span>
              <span>{selectedStop.completedTime ?? selectedStop.scheduledTime}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
