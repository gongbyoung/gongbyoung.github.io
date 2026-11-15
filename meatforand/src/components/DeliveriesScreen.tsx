import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FilePlus2,
  KeyRound,
  MapPin,
  Phone,
  Search,
  Truck,
} from 'lucide-react';
import { DEFAULT_VEHICLES } from '../data/defaultClients';
import {
  DeliveryStatus,
  DeliveryStop,
  TimeFilterMode,
} from '../types/logistics';
import { downloadCsvBlob, getWeekdayKo } from '../utils/meatParser';
import { LinearProgressBar } from './SparklineChart';
import { KakaoButton, StatusBadge } from './StatusBadge';

interface DeliveriesScreenProps {
  stops: DeliveryStop[];
  targetDate: string;
  timeMode: TimeFilterMode;
  vehicleNames: string[];
  onChangeTargetDate: (d: string) => void;
  onChangeTimeMode: (m: TimeFilterMode) => void;
  onAssignVehicle: (clientName: string, vehicleCode: string) => void;
  onSelectStop: (stop: DeliveryStop) => void;
  onQuickAdvance: (stopId: string) => void;
  onSendKakaoForStop: (stop: DeliveryStop) => void;
  onGoLoader: () => void;
  onNotify: (msg: string) => void;
}

export const DeliveriesScreen: React.FC<DeliveriesScreenProps> = ({
  stops,
  targetDate,
  timeMode,
  vehicleNames,
  onChangeTargetDate,
  onChangeTimeMode,
  onAssignVehicle,
  onSelectStop,
  onQuickAdvance,
  onSendKakaoForStop,
  onGoLoader,
  onNotify,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | DeliveryStatus>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const summary = useMemo(() => {
    const total = stops.length;
    const delivered = stops.filter((s) => s.status === 'delivered').length;
    const inTransit = stops.filter((s) => s.status === 'in_transit').length;
    const pending = stops.filter((s) => s.status === 'pending').length;
    const issue = stops.filter((s) => s.status === 'issue').length;

    const totalBoxes = stops.reduce((sum, s) => sum + s.boxCount, 0);
    const totalLoose = stops.reduce((sum, s) => sum + s.looseCount, 0);
    const remainingBoxes = stops
      .filter((s) => s.status !== 'delivered')
      .reduce((sum, s) => sum + s.boxCount, 0);
    const pct = total > 0 ? Math.round((delivered / total) * 100) : 0;

    return {
      total,
      delivered,
      inTransit,
      pending,
      issue,
      totalBoxes,
      totalLoose,
      remainingBoxes,
      pct,
    };
  }, [stops]);

  const vehicleCounts = useMemo(() => {
    const map: Record<string, number> = {
      ALL: stops.length,
      UNASSIGNED: 0,
      PICKUP: 0,
    };
    for (let i = 0; i < 6; i++) map[`V${i}`] = 0;
    stops.forEach((s) => {
      const code = s.vehicleCode || 'UNASSIGNED';
      map[code] = (map[code] ?? 0) + 1;
    });
    return map;
  }, [stops]);

  const filteredStops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stops.filter((s) => {
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesVehicle =
        vehicleFilter === 'ALL' || s.vehicleCode === vehicleFilter;
      const matchesQuery =
        !q ||
        s.waybillNo.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.officialName.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.orderLines.some((l) => l.toLowerCase().includes(q));
      return matchesStatus && matchesVehicle && matchesQuery;
    });
  }, [stops, statusFilter, vehicleFilter, query]);

  const handleExportDispatchCsv = () => {
    let csv =
      '\uFEFF순번,납품거래처명,정식상호,배차차량,배송상태,주소,연락처,출입비번/비고,박스수,낱개수\n';
    stops.forEach((s) => {
      let vLabel = '미배차';
      if (s.vehicleCode.startsWith('V')) {
        const idx = parseInt(s.vehicleCode.substring(1), 10);
        vLabel = vehicleNames[idx] ?? DEFAULT_VEHICLES[idx] ?? s.vehicleCode;
      } else if (s.vehicleCode === 'PICKUP') {
        vLabel = '직접방문/택배';
      }
      csv += `${s.stopOrder},"${s.clientName}","${s.officialName}","${vLabel}","${s.status}","${s.address}","${s.phone}","${s.doorNote}",${s.boxCount},${s.looseCount}\n`;
    });
    downloadCsvBlob(csv, '미트포앤_당일배송처_배차목록.csv');
    onNotify('당일 배송처 배차 목록 CSV를 저장했습니다.');
  };

  return (
    <div className="space-y-3">
      {/* Date + Smart Mode Controls */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => onChangeTargetDate(e.target.value)}
            aria-label="납품 기준 날짜"
            className="h-10 px-2.5 bg-white border border-[#CBD5E1] rounded-sm font-mono text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <select
            value={timeMode}
            onChange={(e) => onChangeTimeMode(e.target.value as TimeFilterMode)}
            aria-label="납품일 판별 방식"
            className="h-10 px-2 bg-white border border-[#CBD5E1] rounded-sm text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="smart">스마트 납품일 (추천)</option>
            <option value="prev10_to_16">전영업일10시~당일16시 (월:금~월)</option>
            <option value="prev22_to_16">전영업일22시~당일16시 (월:금~월)</option>
            <option value="fullday">작성일 당일전체</option>
            <option value="all">전체 날짜</option>
          </select>
        </div>
        {getWeekdayKo(targetDate) === '월' && (
          <p className="text-[11px] font-semibold text-[#1E3A8A] bg-[#EFF6FF] border border-[#BFDBFE] rounded-sm px-2.5 py-1">
            월요일 배송 집계: 금요일 오후 · 토 · 일 · 월요일 카톡 발주 포함
          </p>
        )}

        {/* 6-Vehicle Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {[
            { code: 'ALL', label: `전체 (${vehicleCounts.ALL})` },
            { code: 'UNASSIGNED', label: `미배차 (${vehicleCounts.UNASSIGNED})` },
            ...vehicleNames.map((vName, idx) => ({
              code: `V${idx}`,
              label: `${vName.split(' ')[0]} (${vehicleCounts[`V${idx}`] ?? 0})`,
            })),
            { code: 'PICKUP', label: `직접/택배 (${vehicleCounts.PICKUP})` },
          ].map((ch) => {
            const active = vehicleFilter === ch.code;
            return (
              <button
                key={ch.code}
                type="button"
                onClick={() => setVehicleFilter(ch.code)}
                className={`min-h-[36px] px-2.5 text-xs font-semibold rounded-sm border whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2-Column Summary KPI Strip */}
      <section aria-label="오늘의 배송 요약" className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">배송 완료</span>
            <span className="font-mono tabular-nums font-bold text-[#16A34A]">
              {summary.pct}%
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
              {summary.delivered}
            </span>
            <span className="text-xs font-mono tabular-nums text-[#64748B]">
              / {summary.total}곳
            </span>
          </div>
          <LinearProgressBar
            value={summary.delivered}
            max={Math.max(summary.total, 1)}
            tone="green"
          />
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-medium">당일 총 물량</span>
            <span
              className={`font-mono tabular-nums font-bold ${
                summary.issue > 0 ? 'text-[#DC2626]' : 'text-[#1E3A8A]'
              }`}
            >
              {summary.issue > 0 ? `이슈 ${summary.issue}건` : `잔여 ${summary.remainingBoxes}박`}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-[#0F172A]">
              {summary.totalBoxes}
            </span>
            <span className="text-xs font-mono tabular-nums text-[#64748B]">
              박스 · 낱개 {summary.totalLoose}
            </span>
          </div>
          <LinearProgressBar
            value={summary.totalBoxes - summary.remainingBoxes}
            max={Math.max(summary.totalBoxes, 1)}
            tone={summary.issue > 0 ? 'orange' : 'cobalt'}
          />
        </div>
      </section>

      {/* Search + Status Filters */}
      <section className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2.5">
        <div className="flex gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="거래처명, 주소, 발주품목 검색..."
              aria-label="배송지 검색"
              className="w-full h-11 pl-9 pr-3 bg-white border border-[#CBD5E1] rounded-sm text-sm text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
          {stops.length > 0 && (
            <button
              type="button"
              onClick={handleExportDispatchCsv}
              title="당일 배차 목록 CSV 저장"
              className="h-11 px-3 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm inline-flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {(
            [
              { key: 'all', label: `전체 (${summary.total})` },
              { key: 'pending', label: `대기 (${summary.pending})` },
              { key: 'in_transit', label: `배송중 (${summary.inTransit})` },
              { key: 'issue', label: `이슈 (${summary.issue})` },
              { key: 'delivered', label: `완료 (${summary.delivered})` },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-sm border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Delivery Stop Cards */}
      <section aria-label="배송처 목록" className="space-y-3">
        {stops.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 text-center space-y-3">
            <FilePlus2 className="w-8 h-8 text-[#1E3A8A] mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                해당 날짜에 추출된 발주 배송처가 없습니다
              </h3>
              <p className="text-xs text-[#64748B] mt-1">
                [발주·거래처] 탭에서 카카오톡 대화(.txt) 파일을 불러오거나
                날짜를 변경하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={onGoLoader}
              className="h-11 px-4 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-sm cursor-pointer"
            >
              카톡 발주 로딩하러 가기
            </button>
          </div>
        ) : filteredStops.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-6 text-center space-y-2">
            <Truck className="w-7 h-7 text-[#64748B] mx-auto" />
            <p className="text-sm font-semibold text-[#0F172A]">
              필터 조건에 맞는 배송처가 없습니다
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setVehicleFilter('ALL');
                setQuery('');
              }}
              className="h-10 px-4 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm cursor-pointer"
            >
              필터 초기화
            </button>
          </div>
        ) : (
          filteredStops.map((stop) => (
            <article
              key={stop.id}
              className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2.5"
            >
              {/* 1. Top metadata + Vehicle Assignment */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-[11px] min-w-0 truncate">
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
                </div>

                <select
                  value={stop.vehicleCode}
                  onChange={(e) =>
                    onAssignVehicle(stop.clientName, e.target.value)
                  }
                  aria-label={`${stop.clientName} 차량 배차`}
                  className={`h-8 px-2 text-[11px] font-bold rounded-sm border cursor-pointer shrink-0 ${
                    stop.vehicleCode !== 'UNASSIGNED'
                      ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                  }`}
                >
                  <option value="UNASSIGNED">미배차</option>
                  {vehicleNames.map((vName, idx) => (
                    <option key={idx} value={`V${idx}`}>
                      {vName.split(' ')[0]} ({vName.replace(/^\d+호차\s*/, '')})
                    </option>
                  ))}
                  <option value="PICKUP">직접/택배</option>
                </select>
              </div>

              {/* 2. Main Client Info + Address + Door Code + Extracted Order Lines */}
              <button
                type="button"
                onClick={() => onSelectStop(stop)}
                className="w-full text-left space-y-1.5 cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-[#0F172A] leading-snug">
                        {stop.clientName}
                      </h3>
                      {stop.isKnownClient && (
                        <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] text-[10px] font-bold rounded-sm">
                          인증
                        </span>
                      )}
                    </div>
                    {stop.officialName !== stop.clientName && (
                      <p className="text-[11px] text-[#64748B]">
                        {stop.officialName}
                      </p>
                    )}
                  </div>

                  <div className="text-right font-mono tabular-nums shrink-0">
                    <span className="text-base font-bold text-[#1E3A8A]">
                      {stop.boxCount}박스
                    </span>
                    {stop.looseCount > 0 && (
                      <span className="block text-[11px] font-bold text-[#C2410C]">
                        낱개 {stop.looseCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-[#334155]">
                  <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" />
                  <span className="leading-snug">{stop.address}</span>
                </div>

                {stop.doorNote && (
                  <div className="flex items-start gap-1.5 text-xs font-semibold text-[#B45309] bg-[#FEFCE8] border border-[#FEF08A] rounded-sm px-2 py-1">
                    <KeyRound className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{stop.doorNote}</span>
                  </div>
                )}

                {stop.orderLines.length > 0 && (
                  <p className="text-xs text-[#334155] bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm px-2.5 py-1.5 line-clamp-2 whitespace-pre-line">
                    {stop.orderLines.join('\n')}
                  </p>
                )}

                {stop.issueReason && (
                  <p className="text-xs font-medium text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA] rounded-sm px-2.5 py-1.5">
                    보류 사유: {stop.issueReason}
                  </p>
                )}
              </button>

              {/* 3. Bottom Operational Tray */}
              <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                <StatusBadge status={stop.status} />

                <div className="flex items-center gap-1.5">
                  {stop.phone && (
                    <a
                      href={`tel:${stop.phone.replace(/[^0-9]/g, '')}`}
                      aria-label={`${stop.clientName} 전화걸기`}
                      className="min-h-[40px] min-w-[40px] px-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] rounded-sm inline-flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}

                  <KakaoButton
                    label="카톡"
                    size="sm"
                    onClick={() => onSendKakaoForStop(stop)}
                  />

                  {stop.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => onQuickAdvance(stop.id)}
                      className="min-h-[40px] px-3 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>출발</span>
                    </button>
                  )}

                  {stop.status === 'in_transit' && (
                    <button
                      type="button"
                      onClick={() => onQuickAdvance(stop.id)}
                      className="min-h-[40px] px-3 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-sm inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>완료</span>
                    </button>
                  )}

                  {(stop.status === 'delivered' || stop.status === 'issue') && (
                    <button
                      type="button"
                      onClick={() => onSelectStop(stop)}
                      className="min-h-[40px] px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] text-xs font-semibold rounded-sm cursor-pointer whitespace-nowrap"
                    >
                      상세
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};
