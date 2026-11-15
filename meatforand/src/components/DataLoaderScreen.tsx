import React, { useMemo, useState } from 'react';
import {
  Building2,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  FileText,
  Globe,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  ClientRecord,
  OrderSummaryMap,
  ParsedChatItem,
  StockItem,
  TimeFilterMode,
} from '../types/logistics';
import {
  buildKakaoOrderCheckText,
  decodeCsvBuffer,
  downloadCsvBlob,
  toShortDate,
} from '../utils/meatParser';

interface DataLoaderScreenProps {
  allChatItems: ParsedChatItem[];
  filteredChatItems: ParsedChatItem[];
  stockItems: StockItem[];
  stockTitle: string;
  stockText: string;
  orderSummary: OrderSummaryMap;
  clients: ClientRecord[];
  cleanedCsvRows: string[][];
  targetDate: string;
  timeMode: TimeFilterMode;
  showOnlyOrder: boolean;
  showOnlyKnownClient: boolean;
  onChangeTargetDate: (d: string) => void;
  onChangeTimeMode: (m: TimeFilterMode) => void;
  onToggleOnlyOrder: () => void;
  onToggleKnownClient: () => void;
  onUploadKakaoFiles: (files: FileList) => void;
  onLoadSampleKakao: () => void;
  onToggleItemDeliveryDate: (idx: number) => void;
  onChangeStockText: (txt: string) => void;
  onApplyStockText: () => void;
  onLoadClientCsvText: (text: string) => void;
  onLoadClientCsvUrl: (url: string) => Promise<void>;
  onClearAllStorage: () => void;
  onGoDeliveries: () => void;
  onNotify: (msg: string) => void;
}

type LoaderSubTab = 'kakao' | 'stock' | 'clients';

export const DataLoaderScreen: React.FC<DataLoaderScreenProps> = ({
  allChatItems,
  filteredChatItems,
  stockItems,
  stockTitle,
  stockText,
  orderSummary,
  clients,
  cleanedCsvRows,
  targetDate,
  timeMode,
  showOnlyOrder,
  showOnlyKnownClient,
  onChangeTargetDate,
  onChangeTimeMode,
  onToggleOnlyOrder,
  onToggleKnownClient,
  onUploadKakaoFiles,
  onLoadSampleKakao,
  onToggleItemDeliveryDate,
  onChangeStockText,
  onApplyStockText,
  onLoadClientCsvText,
  onLoadClientCsvUrl,
  onClearAllStorage,
  onGoDeliveries,
  onNotify,
}) => {
  const [subTab, setSubTab] = useState<LoaderSubTab>('kakao');
  const [githubUrl, setGithubUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const chatCounts = useMemo(() => {
    const orderCnt = allChatItems.filter((x) => x.type === '발주').length;
    const weightCnt = allChatItems.filter((x) => x.type === '계근').length;
    const otherCnt = allChatItems.length - orderCnt - weightCnt;
    return { total: allChatItems.length, orderCnt, weightCnt, otherCnt };
  }, [allChatItems]);

  const diffRows = useMemo(() => {
    const rows: {
      itemName: string;
      brand: string;
      stock: number;
      orderBox: number;
      orderPack: number;
      remain: number;
      clients: string[];
    }[] = [];

    Object.keys(orderSummary).forEach((itemName) => {
      const bGroup = orderSummary[itemName];
      (['대산', '포크', '기타'] as const).forEach((br) => {
        const d = bGroup[br];
        if (d.stock === 0 && d.orderBox === 0 && d.orderPack === 0) return;
        rows.push({
          itemName,
          brand: br,
          stock: d.stock,
          orderBox: d.orderBox,
          orderPack: d.orderPack,
          remain: d.stock - d.orderBox,
          clients: d.clients,
        });
      });
    });

    return rows;
  }, [orderSummary]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return clients.slice(0, 40);
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.addr.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.note.toLowerCase().includes(q) ||
        c.alias.some((a) => a.toLowerCase().includes(q))
    );
  }, [clients, clientSearch]);

  const handleClientFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buf = await file.arrayBuffer();
    const decoded = decodeCsvBuffer(buf);
    onLoadClientCsvText(decoded);
    e.target.value = '';
  };

  const handleGithubFetch = async () => {
    if (!githubUrl.trim()) {
      onNotify('GitHub Raw CSV URL을 입력해주세요.');
      return;
    }
    setLoadingUrl(true);
    try {
      await onLoadClientCsvUrl(githubUrl.trim());
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleExportOrdersCsv = () => {
    let csv =
      '\uFEFF작성날짜,작성시간,납품기준일,판별사유,거래처,발신자,판별구분,발주내용\n';
    filteredChatItems.forEach((o) => {
      const clean = o.content.replace(/"/g, '""').replace(/\n/g, ' ');
      csv += `"${o.dateShort}","${o.timeStr}","${o.delivShort || ''}","${
        o.delivReason || ''
      }","${o.clientName}","${o.sender}","${o.type}","${clean}"\n`;
    });
    downloadCsvBlob(csv, '미트포앤_추출발주목록.csv');
    onNotify('발주목록 CSV를 저장했습니다.');
  };

  const handleExportCleanClients = () => {
    let csv = '\uFEFF거래처,대표자,전화번호,주소,별명,비고\n';
    cleanedCsvRows.forEach((r) => {
      csv +=
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
    });
    downloadCsvBlob(csv, 'clients.csv');
    onNotify('정리된 6열 거래처 CSV를 저장했습니다.');
  };

  const handleCopyKakaoCheck = async () => {
    const text = buildKakaoOrderCheckText(orderSummary);
    try {
      await navigator.clipboard.writeText(text);
      onNotify("카톡용 '발주체크' 요약 텍스트가 복사되었습니다.");
    } catch {
      onNotify('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Sub-tab Segmented Bar */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#E2E8F0] p-1 rounded-sm">
        <button
          type="button"
          onClick={() => setSubTab('kakao')}
          className={`min-h-[40px] px-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'kakao'
              ? 'bg-[#1E3A8A] text-white'
              : 'text-[#334155] hover:bg-white/60'
          }`}
        >
          카톡 발주추출
        </button>
        <button
          type="button"
          onClick={() => setSubTab('stock')}
          className={`min-h-[40px] px-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'stock'
              ? 'bg-[#1E3A8A] text-white'
              : 'text-[#334155] hover:bg-white/60'
          }`}
        >
          재고·발주차감
        </button>
        <button
          type="button"
          onClick={() => setSubTab('clients')}
          className={`min-h-[40px] px-2 text-xs font-semibold rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
            subTab === 'clients'
              ? 'bg-[#1E3A8A] text-white'
              : 'text-[#334155] hover:bg-white/60'
          }`}
        >
          거래처 ({clients.length})
        </button>
      </div>

      {/* ==================== 1. 카톡 발주 추출 ==================== */}
      {subTab === 'kakao' && (
        <div className="space-y-3">
          {/* Upload Zone */}
          <section className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="text-sm font-bold text-[#0F172A]">
                  카카오톡 대화 파일(.txt) 로딩
                </h2>
              </div>
              <button
                type="button"
                onClick={onClearAllStorage}
                className="min-h-[34px] px-2 text-[11px] font-semibold text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA] rounded-sm inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>저장초기화</span>
              </button>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              PC·모바일 카톡 내보내기(.txt)를 올리면 5단계 스마트 납품일 엔진이
              순수 발주·계근·기타를 자동 분리하고 배송처 목록을 생성합니다.
            </p>

            <label className="block border-2 border-dashed border-[#93C5FD] bg-[#EFF6FF] hover:bg-[#DBEAFE] rounded-lg p-4 text-center cursor-pointer transition-colors">
              <Upload className="w-6 h-6 text-[#1E3A8A] mx-auto mb-1.5" />
              <span className="block text-xs font-bold text-[#1E3A8A]">
                터치하여 카톡 대화 파일(.txt) 선택 (복수 선택 가능)
              </span>
              <input
                type="file"
                accept=".txt"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onUploadKakaoFiles(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onLoadSampleKakao}
                className="flex-1 h-11 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] text-xs font-semibold rounded-sm inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>샘플 카톡 발주 넣기</span>
              </button>
              <button
                type="button"
                onClick={onGoDeliveries}
                className="h-11 px-4 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-sm cursor-pointer whitespace-nowrap"
              >
                배송목록 보기
              </button>
            </div>

            {chatCounts.total > 0 && (
              <div className="p-2.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-sm text-xs text-[#16A34A] font-semibold font-mono tabular-nums">
                총 {chatCounts.total}건 분석 · 발주 {chatCounts.orderCnt}건 / 계근{' '}
                {chatCounts.weightCnt}건 / 기타 {chatCounts.otherCnt}건
              </div>
            )}
          </section>

          {/* Filter & Delivery Date Controls */}
          <section className="bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="loader-target-date"
                  className="block text-[11px] font-semibold text-[#64748B] mb-1"
                >
                  납품 기준 날짜
                </label>
                <input
                  id="loader-target-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => onChangeTargetDate(e.target.value)}
                  className="w-full h-11 px-2.5 bg-white border border-[#CBD5E1] rounded-sm font-mono text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
              <div>
                <label
                  htmlFor="loader-time-mode"
                  className="block text-[11px] font-semibold text-[#64748B] mb-1"
                >
                  납품일 판별 방식
                </label>
                <select
                  id="loader-time-mode"
                  value={timeMode}
                  onChange={(e) =>
                    onChangeTimeMode(e.target.value as TimeFilterMode)
                  }
                  className="w-full h-11 px-2 bg-white border border-[#CBD5E1] rounded-sm text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="smart">스마트 자동판별 (추천)</option>
                  <option value="prev10_to_16">전날10시~당일16시</option>
                  <option value="prev22_to_16">전날22시~당일16시</option>
                  <option value="fullday">작성일 당일전체</option>
                  <option value="all">전체 날짜</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onToggleOnlyOrder}
                  className={`min-h-[38px] px-2.5 text-xs font-semibold rounded-sm border cursor-pointer ${
                    showOnlyOrder
                      ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]'
                      : 'bg-[#FFEDD5] border-[#FED7AA] text-[#C2410C]'
                  }`}
                >
                  {showOnlyOrder ? '발주만 보기: ON' : '전체 대화: ON'}
                </button>
                <button
                  type="button"
                  onClick={onToggleKnownClient}
                  className={`min-h-[38px] px-2.5 text-xs font-semibold rounded-sm border cursor-pointer ${
                    showOnlyKnownClient
                      ? 'bg-[#1E3A8A] border-[#1E3A8A] text-white'
                      : 'bg-[#F8FAFC] border-[#CBD5E1] text-[#334155]'
                  }`}
                >
                  {showOnlyKnownClient ? '등록거래처만: ON' : '미등록 포함'}
                </button>
              </div>

              {filteredChatItems.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportOrdersCsv}
                  className="min-h-[38px] px-2.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>
              )}
            </div>
          </section>

          {/* Extracted Order List */}
          <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-[#F1F5F9] border-b border-[#CBD5E1] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#444651]">
                추출 발주 내역 ({toShortDate(targetDate)} 기준)
              </h3>
              <span className="font-mono text-xs font-bold text-[#1E3A8A]">
                {filteredChatItems.length}건
              </span>
            </div>

            {filteredChatItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                위에서 카톡 대화 파일(.txt)을 업로드하거나 샘플 발주를 불러오세요.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {filteredChatItems.map((item) => {
                  const isNextDay = item.targetDeliveryDate !== item.dateFull;
                  return (
                    <div key={`${item.idx}-${item.itemKey}`} className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-bold text-[#1E3A8A]">
                              {item.clientName}
                            </span>
                            {item.isKnownClient && (
                              <span className="px-1.5 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E3A8A] text-[10px] font-bold rounded-sm">
                                인증
                              </span>
                            )}
                            <span
                              className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm border ${
                                item.type === '발주'
                                  ? 'bg-[#DCFCE7] border-[#BBF7D0] text-[#16A34A]'
                                  : item.type === '계근'
                                  ? 'bg-[#FFEDD5] border-[#FED7AA] text-[#C2410C]'
                                  : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#64748B]'
                              }`}
                            >
                              {item.type}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-[#64748B] mt-0.5">
                            작성 {item.dateShort} {item.timeStr} · {item.sender}
                          </p>
                        </div>

                        {item.type === '발주' && (
                          <button
                            type="button"
                            onClick={() => onToggleItemDeliveryDate(item.idx)}
                            title="터치하면 당일 ↔ 익일 납품일을 전환합니다"
                            className={`min-h-[34px] px-2 py-1 text-[11px] font-semibold rounded-sm border inline-flex items-center gap-1 shrink-0 cursor-pointer ${
                              item.isManualDeliv
                                ? 'bg-[#FAE8FF] border-[#D946EF] text-[#86198F]'
                                : isNextDay
                                ? 'bg-[#FFEDD5] border-[#FED7AA] text-[#C2410C]'
                                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]'
                            }`}
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>
                              납품 {item.delivShort} ({item.delivReason})
                            </span>
                          </button>
                        )}
                      </div>

                      <pre className="whitespace-pre-wrap font-sans text-xs text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-sm p-2.5 leading-relaxed">
                        {item.content}
                      </pre>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ==================== 2. 재고·발주 차감 ==================== */}
      {subTab === 'stock' && (
        <div className="space-y-3">
          <section className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="text-sm font-bold text-[#0F172A]">
                  일일 재고현황 텍스트 입력
                </h2>
              </div>
              <span className="font-mono text-xs font-semibold text-[#16A34A]">
                {stockItems.length}품목 파싱됨
              </span>
            </div>

            <textarea
              rows={7}
              value={stockText}
              onChange={(e) => onChangeStockText(e.target.value)}
              placeholder="카톡방의 '일일 재고현황' 텍스트를 붙여넣으세요..."
              className="w-full p-2.5 bg-white border border-[#CBD5E1] rounded-sm font-mono text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onApplyStockText}
                className="flex-1 h-11 px-3 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-semibold rounded-sm cursor-pointer"
              >
                재고표 적용 및 발주 차감 계산
              </button>
              <button
                type="button"
                onClick={handleCopyKakaoCheck}
                className="h-11 px-3 bg-[#FEE500] hover:bg-[#F5DC00] text-[#3C1E1E] text-xs font-semibold rounded-sm inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ClipboardCopy className="w-3.5 h-3.5" />
                <span>발주체크 복사</span>
              </button>
            </div>
          </section>

          {/* Stock vs Order Deduction Summary */}
          <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-[#F1F5F9] border-b border-[#CBD5E1] flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#444651]">
                {stockTitle} · 발주 차감 잔여
              </h3>
              <span className="font-mono text-[11px] text-[#64748B]">
                기준 {toShortDate(targetDate)}
              </span>
            </div>

            {diffRows.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#64748B]">
                표시할 재고 및 발주 항목이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0]">
                {diffRows.map((row) => {
                  const isShortage = row.remain < 0;
                  return (
                    <div
                      key={`${row.itemName}-${row.brand}`}
                      className={`p-3 flex items-start justify-between gap-3 ${
                        isShortage ? 'bg-[#FEE2E2]/40' : 'bg-white'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-[#0F172A]">
                            {row.itemName}
                          </span>
                          <span className="px-1.5 py-0.5 bg-[#F1F5F9] text-[#334155] font-mono text-[10px] font-bold rounded-sm">
                            {row.brand}
                          </span>
                        </div>
                        {row.clients.length > 0 && (
                          <p className="text-[11px] text-[#444651] leading-snug">
                            발주: {row.clients.join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="text-right font-mono tabular-nums text-xs shrink-0 space-y-0.5">
                        <div className="text-[#64748B]">
                          재고 {row.stock} / 발주 {row.orderBox}
                          {row.orderPack > 0 ? `+${row.orderPack}팩` : ''}
                        </div>
                        <div
                          className={`font-bold ${
                            isShortage
                              ? 'text-[#DC2626]'
                              : row.remain > 0
                              ? 'text-[#16A34A]'
                              : 'text-[#64748B]'
                          }`}
                        >
                          잔여 {row.remain}박{isShortage ? ' (부족!)' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* ==================== 3. 거래처 주소록 로딩 ==================== */}
      {subTab === 'clients' && (
        <div className="space-y-3">
          <section className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="text-sm font-bold text-[#0F172A]">
                  거래처 주소록 CSV 로딩
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-[#16A34A]">
                총 {clients.length}곳 활성
              </span>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              내장 123개 거래처 DB에 더해 GitHub Raw CSV URL 또는 로컬
              회계원본(2줄)·정리본(6열) CSV를 추가 로드할 수 있습니다.
            </p>

            {/* GitHub Raw CSV URL */}
            <div className="flex gap-2">
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://raw.githubusercontent.com/.../clients.csv"
                aria-label="GitHub Raw CSV URL"
                className="flex-1 h-11 px-3 bg-white border border-[#CBD5E1] rounded-sm text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                type="button"
                onClick={handleGithubFetch}
                disabled={loadingUrl}
                className="h-11 px-3 bg-[#1E3A8A] hover:bg-[#172E6E] text-white text-xs font-semibold rounded-sm inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{loadingUrl ? '로딩...' : 'URL 로드'}</span>
              </button>
            </div>

            {/* Local CSV File Picker + Export */}
            <div className="flex flex-wrap gap-2">
              <label className="flex-1 h-11 px-3 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] text-[#1E3A8A] text-xs font-semibold rounded-sm inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                <FileSpreadsheet className="w-4 h-4" />
                <span>로컬 거래처 CSV 파일 선택</span>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleClientFile}
                />
              </label>

              {cleanedCsvRows.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportCleanClients}
                  className="h-11 px-3 bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-[#BBF7D0] text-[#16A34A] text-xs font-semibold rounded-sm inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  <span>6열 CSV 저장</span>
                </button>
              )}
            </div>
          </section>

          {/* Searchable Client Directory */}
          <section className="bg-white border border-[#E2E8F0] rounded-lg shadow-[0_1px_2px_0_rgba(15,23,42,0.05)] overflow-hidden">
            <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="거래처명, 별명, 주소, 전화, 비번 검색..."
                  className="w-full h-10 pl-9 pr-3 bg-white border border-[#CBD5E1] rounded-sm text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="divide-y divide-[#E2E8F0] max-h-[420px] overflow-y-auto">
              {filteredClients.map((c, idx) => (
                <div key={`${c.name}-${idx}`} className="p-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#0F172A]">
                      {c.name}
                    </span>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone.replace(/[^0-9]/g, '')}`}
                        className="font-mono tabular-nums text-xs font-semibold text-[#2563EB]"
                      >
                        {c.phone}
                      </a>
                    )}
                  </div>
                  {c.addr && (
                    <p className="text-xs text-[#334155] leading-snug">
                      {c.addr}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B]">
                    <span>별명: {c.alias.join(', ')}</span>
                    {c.note && (
                      <span className="font-semibold text-[#B45309]">
                        · {c.note}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
