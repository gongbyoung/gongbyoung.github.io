import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Layers,
  MessageSquare,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { DataLoaderScreen } from './components/DataLoaderScreen';
import { DeliveriesScreen } from './components/DeliveriesScreen';
import { DeliveryDetailSheet } from './components/DeliveryDetailSheet';
import { KakaoAlertsScreen } from './components/KakaoAlertsScreen';
import { UpgradePreviewScreen } from './components/UpgradePreviewScreen';
import {
  DEFAULT_CLIENTS,
  DEFAULT_VEHICLES,
  INITIAL_KAKAO_ALERTS,
  INITIAL_STOCK_TEXT,
  SAMPLE_KAKAO_CHAT_TEXT,
} from './data/defaultClients';
import {
  ClientRecord,
  DeliveryStop,
  DeliveryStopState,
  DeliveryTab,
  KakaoDeliveryAlert,
  ParsedChatItem,
  TimeFilterMode,
} from './types/logistics';
import {
  buildDeliveryStopsFromOrders,
  classifyChatItem,
  computeOrderAggregation,
  decodeCsvBuffer,
  getFilteredOrderList,
  getNextDeliveryDateStr,
  getRecommendedTargetDate,
  inferDeliveryDatesForAllItems,
  parseClientCsvText,
  parseSingleKakaoText,
  parseStockText,
} from './utils/meatParser';

const KEY_CHATS = 'mf_saved_chat_items';
const KEY_STOCK = 'mf_saved_stock_text';
const KEY_SETTINGS = 'mf_saved_settings';
const KEY_DISPATCH = 'mf_dispatch';
const KEY_MANUAL_DELIV = 'mf_manual_deliv_dates';
const KEY_DELIVERY_STATES = 'mf_delivery_states';
const KEY_ALERTS = 'mf_kakao_alerts';
const KEY_CLIENTS = 'mf_saved_clients';

interface MinimalChatRecord {
  dateFull: string;
  dateShort: string;
  timeStr: string;
  timeMins: number;
  sender: string;
  content: string;
}

interface SavedSettings {
  targetDate: string;
  timeMode: TimeFilterMode;
  showOnlyOrder: boolean;
  showOnlyKnownClient: boolean;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function minimalToParsed(
  records: MinimalChatRecord[],
  clientDB: ClientRecord[]
): ParsedChatItem[] {
  return records.map((r, idx) =>
    classifyChatItem(
      {
        idx,
        dateFull: r.dateFull,
        dateShort: r.dateShort,
        timeStr: r.timeStr,
        timeMins: r.timeMins,
        sender: r.sender,
        content: r.content,
        clientName: '',
        officialName: '',
        isKnownClient: false,
        clientObj: null,
        itemKey: '',
        type: '기타',
        targetDeliveryDate: r.dateFull,
        delivShort: r.dateShort,
        delivReason: '-',
        isManualDeliv: false,
      },
      clientDB
    )
  );
}

function toMinimalRecords(items: ParsedChatItem[]): MinimalChatRecord[] {
  return items.map((x) => ({
    dateFull: x.dateFull,
    dateShort: x.dateShort,
    timeStr: x.timeStr,
    timeMins: x.timeMins,
    sender: x.sender,
    content: x.content,
  }));
}

export default function App() {
  const initialClients = useMemo(
    () => loadJson<ClientRecord[]>(KEY_CLIENTS, DEFAULT_CLIENTS),
    []
  );

  const initialChats = useMemo<ParsedChatItem[]>(() => {
    try {
      const raw = localStorage.getItem(KEY_CHATS);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as MinimalChatRecord[];
        if (Array.isArray(parsed)) {
          return minimalToParsed(parsed, initialClients);
        }
      }
    } catch {
      // Fallback to sample chats below
    }
    return parseSingleKakaoText(SAMPLE_KAKAO_CHAT_TEXT, initialClients);
  }, [initialClients]);

  const initialSettings = useMemo<SavedSettings>(() => {
    const inferred = inferDeliveryDatesForAllItems(initialChats, {});
    const defDate = getRecommendedTargetDate(inferred);
    return loadJson<SavedSettings>(KEY_SETTINGS, {
      targetDate: defDate,
      timeMode: 'smart',
      showOnlyOrder: true,
      showOnlyKnownClient: false,
    });
  }, [initialChats]);

  const initialStockText = useMemo(() => {
    try {
      const s = localStorage.getItem(KEY_STOCK);
      return s !== null ? s : INITIAL_STOCK_TEXT;
    } catch {
      return INITIAL_STOCK_TEXT;
    }
  }, []);

  const [activeTab, setActiveTab] = useState<DeliveryTab>('deliveries');
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [cleanedCsvRows, setCleanedCsvRows] = useState<string[][]>(() =>
    initialClients.map((c) => [
      c.name,
      c.ceo,
      c.phone,
      c.addr,
      c.alias.join('|'),
      c.note,
    ])
  );

  const [rawChatItems, setRawChatItems] =
    useState<ParsedChatItem[]>(initialChats);
  const [stockDraftText, setStockDraftText] = useState<string>(initialStockText);
  const [appliedStockText, setAppliedStockText] =
    useState<string>(initialStockText);

  const [targetDate, setTargetDate] = useState<string>(
    initialSettings.targetDate
  );
  const [timeMode, setTimeMode] = useState<TimeFilterMode>(
    initialSettings.timeMode
  );
  const [showOnlyOrder, setShowOnlyOrder] = useState<boolean>(
    initialSettings.showOnlyOrder
  );
  const [showOnlyKnownClient, setShowOnlyKnownClient] = useState<boolean>(
    initialSettings.showOnlyKnownClient
  );

  const [manualDelivMap, setManualDelivMap] = useState<Record<string, string>>(
    () => loadJson<Record<string, string>>(KEY_MANUAL_DELIV, {})
  );
  const [dispatchMap, setDispatchMap] = useState<Record<string, string>>(() =>
    loadJson<Record<string, string>>(KEY_DISPATCH, {
      전라도연탄구이: 'V0',
      삼사오: 'V1',
      삼겹연구소: 'V3',
    })
  );
  const [deliveryStateMap, setDeliveryStateMap] = useState<
    Record<string, DeliveryStopState>
  >(() =>
    loadJson<Record<string, DeliveryStopState>>(KEY_DELIVERY_STATES, {
      전라도연탄구이: {
        status: 'delivered',
        completedTime: '08:50',
        dropOffMethod: '문 앞 배송',
      },
      삼사오: {
        status: 'in_transit',
      },
    })
  );
  const [alerts, setAlerts] = useState<KakaoDeliveryAlert[]>(() =>
    loadJson<KakaoDeliveryAlert[]>(KEY_ALERTS, INITIAL_KAKAO_ALERTS)
  );

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [kakaoDraftStop, setKakaoDraftStop] = useState<DeliveryStop | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

  // Silent ./clients.csv auto-load on mount if present in public root
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('./clients.csv');
        if (!res.ok) return;
        const buf = await res.arrayBuffer();
        const csvText = decodeCsvBuffer(buf);
        const { clients: loaded, cleanedRows } = parseClientCsvText(csvText);
        if (!cancelled && loaded.length > 0) {
          setClients(loaded);
          setCleanedCsvRows(cleanedRows);
          setRawChatItems((prev) =>
            prev.map((item) => classifyChatItem({ ...item }, loaded))
          );
        }
      } catch {
        // Built-in 123 DEFAULT_CLIENTS already active
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY_CHATS,
        JSON.stringify(toMinimalRecords(rawChatItems))
      );
    } catch {
      // Ignore storage write errors
    }
  }, [rawChatItems]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_STOCK, appliedStockText);
    } catch {
      // Ignore storage write errors
    }
  }, [appliedStockText]);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY_SETTINGS,
        JSON.stringify({
          targetDate,
          timeMode,
          showOnlyOrder,
          showOnlyKnownClient,
        })
      );
    } catch {
      // Ignore storage write errors
    }
  }, [targetDate, timeMode, showOnlyOrder, showOnlyKnownClient]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_MANUAL_DELIV, JSON.stringify(manualDelivMap));
    } catch {
      // Ignore storage write errors
    }
  }, [manualDelivMap]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_DISPATCH, JSON.stringify(dispatchMap));
    } catch {
      // Ignore storage write errors
    }
  }, [dispatchMap]);

  useEffect(() => {
    try {
      localStorage.setItem(
        KEY_DELIVERY_STATES,
        JSON.stringify(deliveryStateMap)
      );
    } catch {
      // Ignore storage write errors
    }
  }, [deliveryStateMap]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY_ALERTS, JSON.stringify(alerts));
    } catch {
      // Ignore storage write errors
    }
  }, [alerts]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  // Derived pipeline: 5-stage date inference -> filter -> stock -> order aggregation -> delivery stops
  const allChatItems = useMemo(
    () => inferDeliveryDatesForAllItems(rawChatItems, manualDelivMap),
    [rawChatItems, manualDelivMap]
  );

  const filteredChatItems = useMemo(
    () =>
      getFilteredOrderList(allChatItems, {
        targetDate,
        timeMode,
        showOnlyOrder,
        showOnlyKnownClient,
      }),
    [allChatItems, targetDate, timeMode, showOnlyOrder, showOnlyKnownClient]
  );

  const deliveryOrders = useMemo(
    () =>
      getFilteredOrderList(allChatItems, {
        targetDate,
        timeMode,
        showOnlyOrder: true,
        showOnlyKnownClient,
        forceOnlyOrder: true,
      }),
    [allChatItems, targetDate, timeMode, showOnlyKnownClient]
  );

  const { title: stockTitle, items: stockItems } = useMemo(
    () => parseStockText(appliedStockText),
    [appliedStockText]
  );

  const orderSummary = useMemo(
    () => computeOrderAggregation(deliveryOrders, stockItems),
    [deliveryOrders, stockItems]
  );

  const stops = useMemo(
    () =>
      buildDeliveryStopsFromOrders(
        deliveryOrders,
        dispatchMap,
        deliveryStateMap,
        targetDate
      ),
    [deliveryOrders, dispatchMap, deliveryStateMap, targetDate]
  );

  const selectedStop = useMemo(
    () => stops.find((s) => s.id === selectedStopId) ?? null,
    [stops, selectedStopId]
  );

  const issueCount = useMemo(
    () => stops.filter((s) => s.status === 'issue').length,
    [stops]
  );

  // Handlers
  const handleUploadKakaoFiles = async (files: FileList) => {
    const collected: ParsedChatItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const buf = await files[i].arrayBuffer();
      const text = decodeCsvBuffer(buf);
      collected.push(...parseSingleKakaoText(text, clients));
    }

    collected.sort((a, b) => {
      if (a.dateFull !== b.dateFull) return a.dateFull.localeCompare(b.dateFull);
      return a.timeMins - b.timeMins;
    });

    setRawChatItems(collected);
    const inferred = inferDeliveryDatesForAllItems(collected, manualDelivMap);
    if (inferred.length > 0) {
      setTargetDate(getRecommendedTargetDate(inferred));
    }
    const orderCnt = collected.filter((x) => x.type === '발주').length;
    setToast(
      `카톡 대화 ${collected.length}건 분석 완료 (순수 발주 ${orderCnt}건 추출)`
    );
  };

  const handleLoadSampleKakao = () => {
    const parsed = parseSingleKakaoText(SAMPLE_KAKAO_CHAT_TEXT, clients);
    setRawChatItems(parsed);
    const inferred = inferDeliveryDatesForAllItems(parsed, manualDelivMap);
    if (inferred.length > 0) {
      setTargetDate(getRecommendedTargetDate(inferred));
    }
    setToast(`샘플 카톡 발주 ${parsed.length}건을 불러왔습니다.`);
  };

  const handleToggleItemDeliveryDate = (idx: number) => {
    const item = allChatItems[idx];
    if (!item) return;
    const isCurrentlySameDay = item.targetDeliveryDate === item.dateFull;
    const nextBusinessDay = getNextDeliveryDateStr(item.dateFull);
    const nextDate = isCurrentlySameDay ? nextBusinessDay : item.dateFull;
    setManualDelivMap((prev) => ({
      ...prev,
      [item.itemKey]: nextDate,
    }));
    setToast(
      `${item.clientName} · 납품 기준일을 ${nextDate.slice(5).replace('-', '/')}(${
        isCurrentlySameDay ? '차기영업일' : '작성당일'
      })로 변경했습니다.`
    );
  };

  const handleApplyStockText = () => {
    setAppliedStockText(stockDraftText);
    const parsed = parseStockText(stockDraftText);
    setToast(`일일 재고현황 ${parsed.items.length}개 품목을 적용했습니다.`);
  };

  const handleLoadClientCsvText = (csvText: string) => {
    const { clients: loaded, cleanedRows } = parseClientCsvText(csvText);
    if (loaded.length === 0) {
      setToast('유효한 거래처 데이터를 찾지 못했습니다. CSV 형식을 확인하세요.');
      return;
    }
    setClients(loaded);
    setCleanedCsvRows(cleanedRows);
    try {
      localStorage.setItem(KEY_CLIENTS, JSON.stringify(loaded));
    } catch {
      // Ignore storage quota error
    }
    setRawChatItems((prev) =>
      prev.map((item) => classifyChatItem({ ...item }, loaded))
    );
    setToast(`거래처 주소록 ${loaded.length}곳을 불러오고 발주 매칭을 갱신했습니다.`);
  };

  const handleLoadClientCsvUrl = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = await res.arrayBuffer();
      const csvText = decodeCsvBuffer(buf);
      handleLoadClientCsvText(csvText);
    } catch (err) {
      setToast(
        `URL 로드 실패: ${err instanceof Error ? err.message : '네트워크 오류'}`
      );
    }
  };

  const handleClearAllStorage = () => {
    setRawChatItems([]);
    setManualDelivMap({});
    setDispatchMap({});
    setDeliveryStateMap({});
    try {
      localStorage.setItem(KEY_CHATS, JSON.stringify([]));
      localStorage.removeItem(KEY_MANUAL_DELIV);
      localStorage.removeItem(KEY_DISPATCH);
      localStorage.removeItem(KEY_DELIVERY_STATES);
    } catch {
      // Ignore storage errors
    }
    setToast('저장된 카톡 발주 및 배차 내역을 초기화했습니다.');
  };

  const handleResetToSample = () => {
    const parsed = parseSingleKakaoText(SAMPLE_KAKAO_CHAT_TEXT, clients);
    setClients(DEFAULT_CLIENTS);
    setCleanedCsvRows(
      DEFAULT_CLIENTS.map((c) => [
        c.name,
        c.ceo,
        c.phone,
        c.addr,
        c.alias.join('|'),
        c.note,
      ])
    );
    const inferred = inferDeliveryDatesForAllItems(parsed, {});
    setRawChatItems(parsed);
    setStockDraftText(INITIAL_STOCK_TEXT);
    setAppliedStockText(INITIAL_STOCK_TEXT);
    setTargetDate(getRecommendedTargetDate(inferred));
    setTimeMode('smart');
    setShowOnlyOrder(true);
    setShowOnlyKnownClient(false);
    setManualDelivMap({});
    setDispatchMap({
      전라도연탄구이: 'V0',
      삼사오: 'V1',
      삼겹연구소: 'V3',
    });
    setDeliveryStateMap({
      전라도연탄구이: {
        status: 'delivered',
        completedTime: '08:50',
        dropOffMethod: '문 앞 배송',
      },
      삼사오: {
        status: 'in_transit',
      },
    });
    setAlerts(INITIAL_KAKAO_ALERTS);
    setKakaoDraftStop(null);
    [
      KEY_CHATS,
      KEY_STOCK,
      KEY_SETTINGS,
      KEY_DISPATCH,
      KEY_MANUAL_DELIV,
      KEY_DELIVERY_STATES,
      KEY_ALERTS,
      KEY_CLIENTS,
    ].forEach((k) => localStorage.removeItem(k));
    setToast('샘플 카톡 발주 및 기본 123개 거래처 상태로 복원했습니다.');
  };

  const handleAssignVehicle = (clientName: string, vehicleCode: string) => {
    setDispatchMap((prev) => ({
      ...prev,
      [clientName]: vehicleCode,
    }));
  };

  const handleUpdateStop = (updated: DeliveryStop) => {
    setDeliveryStateMap((prev) => ({
      ...prev,
      [updated.clientName]: {
        status: updated.status,
        completedTime: updated.completedTime,
        dropOffMethod: updated.dropOffMethod,
        issueReason: updated.issueReason,
      },
    }));
    const labelMap: Record<DeliveryStop['status'], string> = {
      delivered: '배송 완료 처리되었습니다.',
      in_transit: '배송 출발 상태로 변경되었습니다.',
      issue: '배송 보류(이슈)로 등록되었습니다.',
      pending: '배송 대기 상태로 변경되었습니다.',
    };
    setToast(`${updated.clientName} · ${labelMap[updated.status]}`);
  };

  const handleQuickAdvance = (stopId: string) => {
    const target = stops.find((s) => s.id === stopId);
    if (!target) return;

    const now = new Date().toTimeString().slice(0, 5);
    if (target.status === 'pending') {
      handleUpdateStop({
        ...target,
        status: 'in_transit',
      });
    } else if (target.status === 'in_transit') {
      handleUpdateStop({
        ...target,
        status: 'delivered',
        completedTime: now,
        dropOffMethod: target.dropOffMethod ?? '직접 전달',
      });
    }
  };

  const handleSendKakaoForStop = (stop: DeliveryStop) => {
    setSelectedStopId(null);
    setKakaoDraftStop(stop);
    setActiveTab('kakao');
  };

  const handleSendAlert = (payload: {
    recipientLabel: string;
    waybillNo?: string;
    templateType: string;
    messageText: string;
  }) => {
    const newAlert: KakaoDeliveryAlert = {
      id: `ka-${Date.now()}`,
      recipientLabel: payload.recipientLabel,
      waybillNo: payload.waybillNo,
      templateType: payload.templateType,
      messageText: payload.messageText,
      sentAt: new Date().toTimeString().slice(0, 5),
      status: 'delivered',
    };
    setAlerts((prev) => [newAlert, ...prev]);
    setToast(`${payload.recipientLabel}님께 카카오톡 알림을 발송했습니다.`);
  };

  const tabMeta: Record<DeliveryTab, { title: string; desc: string }> = {
    deliveries: {
      title: '오늘의 배송 및 배차 목록',
      desc: `(주)미트포앤 · 등록 거래처 ${clients.length}곳 · 추출 ${stops.length}곳`,
    },
    loader: {
      title: '카톡 발주·재고·거래처 추출',
      desc: '카톡(.txt) 자동 판별 · 일일 재고 차감 · 거래처 CSV 로딩',
    },
    kakao: {
      title: '카카오톡 배송 알림',
      desc: '추출된 거래처별 출발·도착·부재 안내 발송',
    },
    upgrades: {
      title: '확장 예정 기능',
      desc: '추후 바코드 스캔 및 모바일 감열 전표 출력 연동',
    },
  };

  const bottomTabs: {
    id: DeliveryTab;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'deliveries', label: '배송목록', Icon: Truck },
    { id: 'loader', label: '발주·거래처', Icon: FileText },
    { id: 'kakao', label: '카톡알림', Icon: MessageSquare },
    { id: 'upgrades', label: '확장예정', Icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-[#E2E8F0] flex justify-center">
      {/* Smartphone-Dedicated Handheld Frame (full width on mobile, 460px mobile shell on larger screens) */}
      <div className="w-full sm:max-w-[460px] min-h-screen bg-[#F8FAFC] sm:border-x sm:border-[#CBD5E1] flex flex-col relative">
        {/* Compact Sticky Top App Bar (48px) */}
        <header className="sticky top-0 z-30 h-12 bg-[#1E3A8A] text-white px-4 flex items-center justify-between gap-4 border-b border-[#172E6E]">
          <button
            type="button"
            onClick={() => setActiveTab('deliveries')}
            className="text-base font-bold tracking-tight whitespace-nowrap shrink-0 cursor-pointer"
          >
            K-Hub 모바일 배송
          </button>

          <button
            type="button"
            onClick={handleResetToSample}
            title="샘플 카톡·거래처 상태로 복원"
            className="min-h-[36px] px-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-sm inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>샘플복원</span>
          </button>
        </header>

        {/* Scrollable Content Area (16px lateral margin, bottom space for 56px nav) */}
        <main className="flex-1 px-4 pt-3 pb-20 space-y-3">
          <div className="pb-2 border-b border-[#E2E8F0]">
            <h1 className="text-lg font-bold text-[#0F172A] leading-snug">
              {tabMeta[activeTab].title}
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              {tabMeta[activeTab].desc}
            </p>
          </div>

          {activeTab === 'deliveries' && (
            <DeliveriesScreen
              stops={stops}
              targetDate={targetDate}
              timeMode={timeMode}
              vehicleNames={DEFAULT_VEHICLES}
              onChangeTargetDate={setTargetDate}
              onChangeTimeMode={setTimeMode}
              onAssignVehicle={handleAssignVehicle}
              onSelectStop={(stop) => setSelectedStopId(stop.id)}
              onQuickAdvance={handleQuickAdvance}
              onSendKakaoForStop={handleSendKakaoForStop}
              onGoLoader={() => setActiveTab('loader')}
              onNotify={setToast}
            />
          )}

          {activeTab === 'loader' && (
            <DataLoaderScreen
              allChatItems={allChatItems}
              filteredChatItems={filteredChatItems}
              stockItems={stockItems}
              stockTitle={stockTitle}
              stockText={stockDraftText}
              orderSummary={orderSummary}
              clients={clients}
              cleanedCsvRows={cleanedCsvRows}
              targetDate={targetDate}
              timeMode={timeMode}
              showOnlyOrder={showOnlyOrder}
              showOnlyKnownClient={showOnlyKnownClient}
              onChangeTargetDate={setTargetDate}
              onChangeTimeMode={setTimeMode}
              onToggleOnlyOrder={() => setShowOnlyOrder((v) => !v)}
              onToggleKnownClient={() => setShowOnlyKnownClient((v) => !v)}
              onUploadKakaoFiles={handleUploadKakaoFiles}
              onLoadSampleKakao={handleLoadSampleKakao}
              onToggleItemDeliveryDate={handleToggleItemDeliveryDate}
              onChangeStockText={setStockDraftText}
              onApplyStockText={handleApplyStockText}
              onLoadClientCsvText={handleLoadClientCsvText}
              onLoadClientCsvUrl={handleLoadClientCsvUrl}
              onClearAllStorage={handleClearAllStorage}
              onGoDeliveries={() => setActiveTab('deliveries')}
              onNotify={setToast}
            />
          )}

          {activeTab === 'kakao' && (
            <KakaoAlertsScreen
              stops={stops}
              alerts={alerts}
              draftStop={kakaoDraftStop}
              onSendAlert={handleSendAlert}
            />
          )}

          {activeTab === 'upgrades' && (
            <UpgradePreviewScreen
              stops={stops}
              vehicleNames={DEFAULT_VEHICLES}
            />
          )}
        </main>

        {/* Fixed Bottom Thumb Navigation Bar (56px; top+bottom = 104px <= 15% mobile height) */}
        <nav
          aria-label="스마트폰 하단 메뉴"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:max-w-[460px] z-30 h-14 bg-white border-t border-[#CBD5E1] grid grid-cols-4 items-center"
        >
          {bottomTabs.map((tab) => {
            const Icon = tab.Icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-full flex flex-col items-center justify-center gap-0.5 cursor-pointer relative transition-colors ${
                  active ? 'text-[#1E3A8A] font-bold' : 'text-[#64748B] font-medium'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] leading-none whitespace-nowrap">
                  {tab.label}
                </span>
                {tab.id === 'deliveries' && issueCount > 0 && (
                  <span className="absolute top-1.5 right-4 min-w-[16px] h-4 px-1 bg-[#DC2626] text-white font-mono text-[10px] font-bold rounded-sm flex items-center justify-center">
                    {issueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Delivery Action Bottom Sheet */}
        <DeliveryDetailSheet
          stop={selectedStop}
          vehicleNames={DEFAULT_VEHICLES}
          onAssignVehicle={handleAssignVehicle}
          onClose={() => setSelectedStopId(null)}
          onUpdateStop={handleUpdateStop}
          onSendKakaoForStop={handleSendKakaoForStop}
        />

        {/* Operational Feedback Toast */}
        {toast && (
          <div
            role="status"
            className="fixed bottom-16 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] sm:max-w-[428px] z-50 px-3.5 py-2.5 bg-[#1E3A8A] text-white rounded-sm shadow-[0_4px_6px_-1px_rgba(15,23,42,0.16)] flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#FEE500]" />
            <span className="truncate">{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
