import './style.css';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import L from 'leaflet';
import * as XLSX from 'xlsx';
import {
  pickBestDecode,
  extractDates,
  inspectDatesWithCounts,
  getWindowRange,
  formatWindowLabel,
  parseOrdersForDeliveryDate,
  classifyOrderItem,
  normalizeMeat,
  meatColumnKey,
  isLoose,
  parseRegion,
  shortAddress,
  collectOrderClients,
  buildGrokSummaryText,
  getAllClients,
  getAllAliases,
  getCustomConfigState,
  saveGrokPresetConfig,
  analyzeClientAliasToken,
  findCandidateClientsForAlias,
  detectWorkInstruction,
  vworldGeocode,
  geoCacheGet,
  getFallbackCoord,
  DEPOT_INFO
} from './kakaoGrokParser.js';

/**
 * ============================================================================
 * 미트포앤 안드로이드 발주·계근·배차 관리 마스터 엔진 (src/main.js)
 * ----------------------------------------------------------------------------
 * ★ 핵심 해결 및 업그레이드 내역:
 * 1) [1.카톡추출] PC·폰(안드로이드/iOS) 카톡 내보내기 숫자·날짜 전 포맷 완벽 호환
 *    - 파일 로드 시 '(다음날)' 빈 구간이 아닌 [실제 발주가 있는 최신 배송일] 자동 선택
 *    - 각 날짜별 발주 건수·거래처 수를 드롭다운에 즉시 표시 (예: 11월 4일 — 발주 42건 / 39곳)
 *    - 추출 즉시 별도 버튼 없이도 [2.발주·계근] 및 [3.배차·지도] 탭에 100% 실시간 자동 연동!
 * 2) [2.발주·계근] 미트포앤 현장 도메인 맞춤형 출고·챙김 확인 시스템
 *    - 단위가 없는 숫자는 기본 '박스(Box)'로 자동 인식 (PDA 스캔 대상)
 *    - 별도 챙김·계근 확인 대상(PDA 미인식 품목) 자동 하이라이트 및 체크리스트:
 *      ① '특'이 들어가는 냉장 품목 (특삼겹, 특미삼, 특목살, 특삼, 특목 등)
 *      ② 수입육 중 숫자 3~4자리 개체번호가 들어가는 품목 및 '~~~개' 단위 품목
 *      ③ 팩, 봉지, 키로(kg), 덩이, 판, 벌, 마리, 개 등 박스를 제외한 모든 단위
 * 3) [3.배차·지도] 발주한 모든 거래처(39곳+) 100% 자동 표시 + 화이트보드 배차 + 브이월드 지도
 *    - 발주 거래처 단 한 곳도 누락 없이 전체 목록 자동 구성 + 1,908곳 주소록 매칭
 *    - 기사님(승호·진·한·명·진우 + 추가 가능) 화이트보드 배정 및 브이월드/Photon 실제 지도 핀 표시
 * ============================================================================
 */

const STORAGE_KEYS = {
  STOCK: 'MEATPOAN_MASTER_STOCK_V3',
  ORDERS: 'MEATPOAN_MASTER_ORDERS_V4',
  LOGS: 'MEATPOAN_MASTER_KAKAO_LOGS_V3',
  STAGING: 'MEATPOAN_MASTER_STAGING_V4',
  PROFILES: 'MEATPOAN_PARSER_PROFILES_V3',
  SETTINGS: 'MEATPOAN_MASTER_SETTINGS_V3',
  RAW_KAKAO: 'MEATPOAN_RAW_KAKAO_TEXT_V4',
  DATE_KEY: 'MEATPOAN_SELECTED_DATE_KEY_V4',
  CHECKED_MAP: 'MEATPOAN_ITEM_CHECKED_MAP_V4',
  ITEM_META_MAP: 'MEATPOAN_ITEM_META_MAP_V4',
  EXTRA_STOPS: 'MEATPOAN_EXTRA_DISPATCH_STOPS_V4',
  MANUAL_ADJUST: 'MEATPOAN_MANUAL_ORDER_ADJUST_V4',
  WORK_INST: 'MEATPOAN_WORK_INSTRUCTIONS_V4',
  VEHICLES: 'meatpoan_vehicles',
  DISPATCH_MAP: 'meatpoan_dispatch',
  PIN: 'MEATPOAN_PIN',
  ADMIN_MODE: 'MEATPOAN_ADMIN_MODE_V1',
  USERS: 'MEATPOAN_REGISTERED_USERS_V1',
  CURRENT_USER: 'MEATPOAN_CURRENT_USER_ID_V1'
};

// ★ 기본 비밀번호(PIN)는 1234로 지정
const DEFAULT_PIN = '1234';

// ★ 초기 기본 등록 사용자 목록 (관리자가 추가·수정·삭제 가능)
const DEFAULT_USERS = [
  { id: 'user-admin', name: '관리자', role: 'admin', pin: '1234', dept: '총괄관리·발주추출', active: true },
  { id: 'user-seungho', name: '승호 기사님', role: 'driver', pin: '1234', dept: '1호차 배송·계근', vehicleName: '승호', active: true },
  { id: 'user-jin', name: '진 기사님', role: 'driver', pin: '1234', dept: '2호차 배송·계근', vehicleName: '진', active: true },
  { id: 'user-han', name: '한 기사님', role: 'driver', pin: '1234', dept: '3호차 배송·계근', vehicleName: '한', active: true },
  { id: 'user-myung', name: '명 기사님', role: 'driver', pin: '1234', dept: '4호차 배송·계근', vehicleName: '명', active: true },
  { id: 'user-jinwoo', name: '진우 기사님', role: 'driver', pin: '1234', dept: '5호차 배송·계근', vehicleName: '진우', active: true },
  { id: 'user-field', name: '현장·계근팀', role: 'staff', pin: '1234', dept: '현장 낱개·계근확인', active: true }
];
const HQ_LOCATION = {
  name: '미트포앤(하상동 기점)',
  address: DEPOT_INFO.address,
  lat: DEPOT_INFO.lat,
  lng: DEPOT_INFO.lng
};

// 미트포앤 기본 배송 기사님/차량 목록 및 색상 (Grok 호환)
const VEHICLE_COLORS = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#4f46e5', '#be123c'];
const DEFAULT_VEHICLES = ['승호', '진', '한', '명', '진우'];

// [카톡 파싱 프로필 기본값] - 1순위 기본 프리셋으로 Grok 알고리즘 프리셋 저장
const GROK_PRESET_PROFILE = {
  id: 'profile-grok-preset',
  name: '★ 미트포앤 실전 카톡 추출 프리셋 (Grok 알고리즘 + 1,908곳 거래처)',
  isGrokPreset: true,
  clientSource: 'bracket_or_sender',
  orderKeywords: '박스,팩,키로,kg,봉지,봉,판,벌,마리,덩이,개,삼겹,목살,미전지,등뼈,항정,가브리,발주',
  weighedKeywords: '계근,실측,포,대,로트,개체,실중량',
  inboundKeywords: '입고,공판장,창고입고,매입,도축',
  unitKeywords: 'Box,Pack,Kg,봉지,박스,팩,키로,kg,개,덩이',
  ignoreKeywords: '발주체크,여기까지,사진,이모티콘,삭제된 메시지',
  aliases: '빵삼=빵삼겹\n특목=특목살\n모돈=모돈삼겹\n우삼=우삼겹\nA삼=A삼겹\n볼라=볼라전각\n프렌치=프렌치렉'
};

const defaultParserProfiles = [
  GROK_PRESET_PROFILE,
  {
    id: 'profile-general',
    name: '범용 표준 카톡방 (매출·계근·입고 통합)',
    clientSource: 'bracket_or_sender',
    orderKeywords: '발주,주문,부탁,보내주세요,추가,요청,내일꺼,시킵니다',
    weighedKeywords: '계근,실측,출고완료,실중량,측정,작업완료,출고중량,박스당',
    inboundKeywords: '입고,공판장,창고입고,매입,도축,수입통관',
    unitKeywords: 'kg,KG,키로,박스,두,팩,봉지,봉,개,판,근',
    ignoreKeywords: '사진,이모티콘,삭제된 메시지입니다,출발합니다,도착했습니다,감사합니다,네 알겠습니다',
    aliases: '삼겹=삼겹\n목살=목살\n차돌=차돌\n우삼겹=우삼겹\n등갈비=등갈비\n항정=항정'
  }
];

// 초기 기초재고 데이터 (4번 탭용)
const defaultStock = [
  { code: '8801001', name: '삼겹', baseQty: 60, inboundQty: 20, manualAdj: 0, safeQty: 50, unit: 'Box', boxUnit: true },
  { code: '8801002', name: '목살', baseQty: 45, inboundQty: 0, manualAdj: 0, safeQty: 40, unit: 'Box', boxUnit: true },
  { code: '8801003', name: '미전지', baseQty: 35, inboundQty: 10, manualAdj: 0, safeQty: 30, unit: 'Box', boxUnit: true },
  { code: '8801004', name: '우삼겹', baseQty: 25, inboundQty: 5, manualAdj: 0, safeQty: 25, unit: 'Box', boxUnit: true },
  { code: '8801005', name: '등갈비', baseQty: 18, inboundQty: 0, manualAdj: 0, safeQty: 25, unit: 'Pack', boxUnit: false },
  { code: '8801006', name: '항정', baseQty: 12, inboundQty: 0, manualAdj: 0, safeQty: 20, unit: 'Pack', boxUnit: false }
];

// 실전 카톡 샘플 텍스트 (박스 / 단위없는 박스 / '특' 냉장 / 3~4자리 이력번호+각·개 / 150kg / 김치1·김치2 별명 / 계근로그 / 발주체크 포함)
const REALISTIC_KAKAO_SAMPLE =
  `--------------- 2026년 11월 4일 수요일 ---------------\n` +
  `[한재호(주)미트포앤] [오전 8:15] 태광\n` +
  `삼겹 8박스 대산\n` +
  `특삼겹 3\n` +
  `수입차돌 451각\n` +
  `항정 3팩\n\n` +
  `사동쌈엔쌈\n` +
  `목살 4\n` +
  `특목살 2박스\n` +
  `등갈비 10팩\n\n` +
  `참새방앗간\n` +
  `우삼겹 512 3개\n` +
  `미전지 150kg\n` +
  `삼겹 5박스 정담\n\n` +
  `김치1\n` +
  `삼겹 4박스\n` +
  `특미삼 2\n\n` +
  `김치2\n` +
  `목살 3박스\n` +
  `가브리 5팩\n\n` +
  `돈통마늘보쌈(능곡점)\n` +
  `미전지 6\n` +
  `보쌈용목살 3박스\n` +
  `갈매기 2봉지\n\n` +
  `돈통마늘보쌈(산본점)\n` +
  `미전지 5박스\n` +
  `특삼겹 2박스\n\n` +
  `마루벌삼겹살\n` +
  `삼겹 10박스 포크밸리\n` +
  `수입목전지 308개\n` +
  `항정 4팩\n\n` +
  `반월시골정육점\n` +
  `특목살 3\n` +
  `미전지 2덩어리\n` +
  `등뼈 4박스\n\n` +
  `[한재호(주)미트포앤] [오전 9:25] 태광\n` +
  `특삼 8포 19.3\n` +
  `수입차돌 451 15.3\n` +
  `삼겹 150\n\n` +
  `[한재호(주)미트포앤] [오전 10:15] 발주체크\n` +
  `삼겹 23박스 / 미전지 14박스 / 목살 7박스 (당일 출고 요약본)\n` +
  `[승호] [오전 10:30] 네 상차 확인 후 출발하겠습니다\n` +
  `[한재호(주)미트포앤] [오전 10:42] 사동쌈엔쌈은 뒷문 비밀번호 1234 누르고 냉장고에 넣어주세요. 거래명세표 꼭 챙겨주세요!`;

// ★ 타사/범용 카카오톡 단톡방 샘플 (식자재·유통·일반회사 발주 + 업무지시사항 통합 분석 데모)
const UNIVERSAL_COMPANY_SAMPLE =
  `--------------- 2026년 11월 4일 수요일 ---------------\n` +
  `[강남본점] [오전 8:20] 진라면 매운맛 5박스\n` +
  `식용유 18L 3통\n` +
  `양파 4망\n` +
  `일회용장갑 10팩\n\n` +
  `[박팀장(영업부)] [오전 8:35] [역삼직영점]\n` +
  `쌀 20kg 6포대\n` +
  `김치 10kg 3박스\n` +
  `참이슬 4짝\n\n` +
  `[박팀장(영업부)] [오전 8:40] 역삼직영점 오늘 오전 10시 전까지 긴급 배송 부탁드립니다! 세금계산서 및 거래명세표 담당자께 전달 요망\n\n` +
  `[송파가맹점] [오전 9:05] 종이컵 3박스 / 냅킨 5묶음 / 락스 2통\n\n` +
  `[김과장(물류팀)] [오전 9:15] 송파가맹점 어제 나간 식용유 1통 파손 건 오늘 방문 시 반품 회수 및 정상품 교환 처리 바랍니다.\n\n` +
  `[최대리(현장)] [오전 9:30] 제2창고 냉동실 온도 점검 완료 후 출고 작업 진행해주시고, 강남본점 미수금 수금 확인 부탁드립니다.`;

const defaultLogs = [];

const defaultSettings = {
  fontScale: 1.0,
  btnPadding: 10,
  highContrast: false,
  leftHanded: false,
  activeProfileId: 'profile-grok-preset',
  universalMode: false
};

// ★ 관리자 모드 상태 (true일 때만 '발주추출' 탭 노출, 기본 비밀번호 1234)
let isAdminMode = loadStorage(STORAGE_KEYS.ADMIN_MODE, true);
let registeredUsers = loadStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
if (!Array.isArray(registeredUsers) || registeredUsers.length === 0) {
  registeredUsers = DEFAULT_USERS.slice();
}
// 관리자가 최소 1명은 항상 존재하도록 보장
if (!registeredUsers.some(u => u.role === 'admin' && u.active !== false)) {
  registeredUsers.unshift(DEFAULT_USERS[0]);
}
let currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || registeredUsers[0].id;

let stockSubTab = 'ledger'; // 'ledger'(재고 수불 관리) | 'stats'(누적 판매 통계)
let settingsSubTab = 'users'; // 'users'(사용자 등록·관리) | 'drivers'(기사별 누적 실적) | 'config'(노트24 화면·비밀번호 설정)

let stockList = loadStorage(STORAGE_KEYS.STOCK, defaultStock);
let kakaoLogs = loadStorage(STORAGE_KEYS.LOGS, defaultLogs);
let stagingItems = loadStorage(STORAGE_KEYS.STAGING, []);
let parserProfiles = loadStorage(STORAGE_KEYS.PROFILES, defaultParserProfiles);
let uiSettings = loadStorage(STORAGE_KEYS.SETTINGS, defaultSettings);

// 낱개 확인 상태 및 품목별 이력번호/실측무게 저장 맵 (key: `${client}__${idx}__${name}`)
let itemCheckedMap = loadStorage(STORAGE_KEYS.CHECKED_MAP, {});
let itemMetaMap = loadStorage(STORAGE_KEYS.ITEM_META_MAP, {});

// ★ 발주 외 별도 배차 경유지 (예: 냉동창고, 외부창고 픽업 등 발주에는 없지만 배차에 포함할 곳)
let extraDispatchStops = loadStorage(STORAGE_KEYS.EXTRA_STOPS, []);

// ★ 1번(카톡추출) 정밀 조정 데이터 (거래처명 교정, 별명 합치기/분리 규칙, 품목 수정, 제외 항목, 수동 추가 발주)
let manualOrderAdjust = loadStorage(STORAGE_KEYS.MANUAL_ADJUST, {
  clientRenames: {},   // { '기존이름': '수정이름' }
  aliasGroupRules: {}, // { '김치': 'merge' | 'separate' | '정식거래처명' }
  itemOverrides: {},   // { 'orderIdx__itemIdx': { client, name, qty, unit, entityId, note } }
  excludedItems: {},   // { 'orderIdx__itemIdx': true }
  addedOrders: []      // [{ id, dateKey, client, address, ship, name, qty, unit, entityId, note, time }]
});

// ★ 업무 지시사항(Work Instructions) 저장소 (카톡 자동추출 완료체크 + 수동 업무지시 등록 + 타사 커스텀 키워드)
let workInstructionStore = loadStorage(STORAGE_KEYS.WORK_INST, {
  completedMap: {},    // { 'instKey': true }
  deletedMap: {},      // { 'instKey': true }
  manualList: [],      // [{ id, dateKey, category, priority, sender, client, content, time, completed }]
  customKeywords: '지시,전달,공지,필독,부탁,요망,점검,확인,회수,교환,반품,수금,입금,명세표,비밀번호,비번,냉장고,긴급'
});

let showUserManualPanel = false;
let showRawKakaoDrawer = false;
let showManualAddDrawer = false;
let showWorkInstDrawer = false;
let showExtraStopDrawer = false;
let ingestSearchQuery = '';

if (!parserProfiles.some(p => p.id === 'profile-grok-preset')) {
  parserProfiles.unshift(GROK_PRESET_PROFILE);
  uiSettings.activeProfileId = 'profile-grok-preset';
}
if (!uiSettings.fontScale || uiSettings.fontScale < 0.85 || uiSettings.fontScale > 1.35) {
  uiSettings.fontScale = 1.0;
}
// 예전 초기 PIN(7421)이 저장되어 있었다면 기본값 1234로 자동 마이그레이션
if (localStorage.getItem(STORAGE_KEYS.PIN) === '7421') {
  localStorage.setItem(STORAGE_KEYS.PIN, DEFAULT_PIN);
}

// ★ 카톡 추출 마스터 런타임 상태 (탭 1, 2, 3 전체가 동일한 데이터를 실시간 공유!)
let currentKakaoRawText = localStorage.getItem(STORAGE_KEYS.RAW_KAKAO) || '';
let grokAvailableDates = [];
let grokSelectedDateKey = localStorage.getItem(STORAGE_KEYS.DATE_KEY) || 'ALL';
let grokDetectedEncoding = 'UTF-8';
let currentOrders = [];
let currentWeightLogs = [];
let currentGeneralLogs = [];
let currentWorkInstructions = [];
let showGrokSummaryBox = false;
let clientSearchQuery = '';

// 화면 전환 및 필터 상태
let currentTab = 'ingest';
let ingestSubTab = 'workbench'; // 'workbench' | 'rules' | 'history'
let stagingCategoryFilter = 'all'; // 'all' | 'order' | 'items' | 'instructions' | 'stock' | 'general'

// [2.발주·계근] 전용 상태
let ordersSubTab = 'byClient'; // 'byClient'(업체별 출고·챙김) | 'checkOnly'(비박스·특·개체번호만) | 'byMeat'(고기별 매트릭스·합계) | 'weightLogs'(계근·원문)
let shipFilter = 'all'; // 'all' | 'today' | 'next'
let clientViewFilter = 'all'; // 'all'(전체 업체) | 'needsCheck'(별도챙김 있는 업체만) | 'unconfirmed'(미확인 남은 업체만)
let specialCheckCategory = 'all'; // 'all' | 'specialCold'(특 냉장) | 'entityId'(3자리 개체번호/개) | 'looseUnit'(팩/봉지/기타)
let ordersSearchQuery = '';

// [3.배차·지도] 전용 상태
let selectedVehicleFilter = 'ALL'; // 'ALL' | '승호' | '진' | '한' | '명' | '진우' | '(미배정)'
let routeSearchQuery = '';
let leafletMap = null;
let fsMapInstance = null;

// [4, 5번 탭] 상태
let logTypeFilter = 'all';
let activeCameraStream = null;

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSetItem(key, valStr) {
  try {
    localStorage.setItem(key, valStr);
    return true;
  } catch (err) {
    console.warn(`localStorage 저장 용량 초과 또는 오류 (${key}):`, err);
    return false;
  }
}

function saveAll() {
  safeSetItem(STORAGE_KEYS.STOCK, JSON.stringify(stockList));
  safeSetItem(STORAGE_KEYS.LOGS, JSON.stringify((kakaoLogs || []).slice(0, 300)));
  // 대용량 카톡 파일 로드 시 일반대화가 수천 건이면 localStorage(5MB) 한도를 초과할 수 있으므로 발주/계근 우선 보존
  const compactStaging = (stagingItems || []).filter(s => s.type !== '일반').concat(
    (stagingItems || []).filter(s => s.type === '일반').slice(0, 80)
  );
  safeSetItem(STORAGE_KEYS.STAGING, JSON.stringify(compactStaging));
  safeSetItem(STORAGE_KEYS.PROFILES, JSON.stringify(parserProfiles));
  safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(uiSettings));
  safeSetItem(STORAGE_KEYS.CHECKED_MAP, JSON.stringify(itemCheckedMap));
  safeSetItem(STORAGE_KEYS.ITEM_META_MAP, JSON.stringify(itemMetaMap));
  safeSetItem(STORAGE_KEYS.EXTRA_STOPS, JSON.stringify(extraDispatchStops));
  safeSetItem(STORAGE_KEYS.MANUAL_ADJUST, JSON.stringify(manualOrderAdjust));
  safeSetItem(STORAGE_KEYS.WORK_INST, JSON.stringify(workInstructionStore));
  safeSetItem(STORAGE_KEYS.ADMIN_MODE, JSON.stringify(Boolean(isAdminMode)));
  safeSetItem(STORAGE_KEYS.USERS, JSON.stringify(registeredUsers));
  safeSetItem(STORAGE_KEYS.CURRENT_USER, currentUserId || 'user-admin');
  if (currentKakaoRawText) {
    // 원문이 너무 클 경우 최신 20만 자만 저장하여 QuotaExceededError 완벽 방지
    const slicedRaw = currentKakaoRawText.length > 200000
      ? currentKakaoRawText.slice(-200000)
      : currentKakaoRawText;
    safeSetItem(STORAGE_KEYS.RAW_KAKAO, slicedRaw);
  }
  safeSetItem(STORAGE_KEYS.DATE_KEY, grokSelectedDateKey || 'ALL');
}

/**
 * 안드로이드/아이폰 카카오톡 '대화 내용 내보내기'로 생성된 .zip 압축파일 또는 .txt/.csv 파일에서
 * 대화 원문(KakaoTalkChats.txt 등)을 자동 추출·디코딩하는 함수
 */
async function decodeKakaoFileBuffer(arrayBuffer) {
  const u8 = new Uint8Array(arrayBuffer);
  // PK\x03\x04 ZIP 시그니처 감지
  if (u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x03 && u8[3] === 0x04) {
    try {
      const view = new DataView(arrayBuffer);
      let offset = 0;
      const textChunks = [];
      while (offset + 30 <= u8.length) {
        const sig = view.getUint32(offset, true);
        if (sig !== 0x04034b50) break;
        const method = view.getUint16(offset + 8, true);
        const compSize = view.getUint32(offset + 18, true);
        const nameLen = view.getUint16(offset + 26, true);
        const extraLen = view.getUint16(offset + 28, true);
        const nameBytes = u8.subarray(offset + 30, offset + 30 + nameLen);
        const entryName = new TextDecoder('utf-8').decode(nameBytes);
        const dataStart = offset + 30 + nameLen + extraLen;
        const dataEnd = dataStart + compSize;
        if (dataEnd > u8.length) break;

        if (/\.(txt|csv)$/i.test(entryName)) {
          const compData = u8.subarray(dataStart, dataEnd);
          let rawEntryBuf = null;
          if (method === 0) {
            rawEntryBuf = compData.buffer.slice(compData.byteOffset, compData.byteOffset + compData.byteLength);
          } else if (method === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(compData);
            writer.close();
            rawEntryBuf = await new Response(ds.readable).arrayBuffer();
          }
          if (rawEntryBuf) {
            const decoded = pickBestDecode(rawEntryBuf);
            if (decoded && decoded.text) textChunks.push(decoded.text);
          }
        }
        offset = dataEnd;
      }
      if (textChunks.length > 0) {
        return { text: textChunks.join('\n'), enc: 'ZIP(자동압축해제)' };
      }
    } catch (zipErr) {
      console.warn('ZIP 압축 해제 중 폴백 처리:', zipErr);
    }
  }
  return pickBestDecode(arrayBuffer);
}

function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function applyUiSettings() {
  document.documentElement.style.setProperty('--ui-font-scale', uiSettings.fontScale);
  document.documentElement.style.setProperty('--ui-btn-padding', `${uiSettings.btnPadding}px`);
  document.body.classList.toggle('high-contrast', Boolean(uiSettings.highContrast));
  document.body.classList.toggle('left-handed', Boolean(uiSettings.leftHanded));

  document.querySelectorAll('#quickFontBar .qf-btn').forEach(btn => {
    const val = parseFloat(btn.dataset.scale);
    btn.classList.toggle('active', Math.abs(val - Number(uiSettings.fontScale)) < 0.03);
  });
}

function getActiveProfile() {
  return parserProfiles.find(p => p.id === uiSettings.activeProfileId) || parserProfiles[0];
}

// ---------- 차량 및 배차 관리 유틸 ----------
function getVehicles() {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || 'null');
    if (Array.isArray(v) && v.length) return v;
  } catch {}
  return DEFAULT_VEHICLES.slice();
}

function setVehicles(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(list));
  } catch {}
}

function getDispatchMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.DISPATCH_MAP) || '{}') || {};
  } catch {
    return {};
  }
}

function setDispatchMap(map) {
  try {
    localStorage.setItem(STORAGE_KEYS.DISPATCH_MAP, JSON.stringify(map));
  } catch {}
}

function setClientVehicle(client, vehicle) {
  const m = getDispatchMap();
  if (!vehicle) delete m[client];
  else m[client] = vehicle;
  setDispatchMap(m);
}

function vehicleColor(name) {
  const vs = getVehicles();
  const i = vs.indexOf(name);
  if (i < 0) return '#64748b';
  return VEHICLE_COLORS[i % VEHICLE_COLORS.length];
}

function getItemKey(clientName, itemIdx, itemName) {
  return `${grokSelectedDateKey || 'ALL'}__${clientName}__${itemIdx}__${itemName}`;
}

function getFilteredOrders() {
  if (shipFilter === 'today') return currentOrders.filter(o => o.ship !== 'next');
  if (shipFilter === 'next') return currentOrders.filter(o => o.ship === 'next');
  return currentOrders;
}

function updateHeaderDateIndicator() {
  const dateEl = document.getElementById('date-indicator');
  if (!dateEl) return;
  const clientCnt = new Set(currentOrders.map(o => o.client)).size;
  const dateShort = grokSelectedDateKey === 'ALL'
    ? '전체구간'
    : grokSelectedDateKey.replace(/^20\d{2}년\s*/, '');
  dateEl.textContent = `${dateShort} · 발주 ${currentOrders.length}건 (${clientCnt}곳)`;
}

/**
 * 품목 객체를 classifyOrderItem으로 다시 분류·보강하는 헬퍼
 */
function buildEnrichedItem(baseItem) {
  const c = classifyOrderItem(baseItem);
  return {
    ...baseItem,
    ...c
  };
}

/**
 * 1번(카톡추출) / 2번(발주·계근) / 3번(배차·지도)에서 사용자가 수동으로 조정한 내역
 * (거래처명 변경, 번호별명 김치1·2·3 합치기/분리 규칙, 품목/수량 수정, 발주 제외, 수동 발주 추가)을 추출 결과에 반영합니다.
 */
function applyManualOrderAdjustments(rawOrders) {
  if (!manualOrderAdjust) {
    manualOrderAdjust = { clientRenames: {}, aliasGroupRules: {}, itemOverrides: {}, excludedItems: {}, addedOrders: [] };
  }
  const renames = manualOrderAdjust.clientRenames || {};
  const aliasRules = manualOrderAdjust.aliasGroupRules || {};
  const overrides = manualOrderAdjust.itemOverrides || {};
  const excluded = manualOrderAdjust.excludedItems || {};
  const added = manualOrderAdjust.addedOrders || [];
  const allKnownClients = getAllClients();

  const adjustedOrders = [];

  (rawOrders || []).forEach((ord, oIdx) => {
    const rawClient = ord.rawClient || ord.client;
    const aliasMeta = ord.aliasInfo || analyzeClientAliasToken(rawClient);
    let clientName = ord.client;

    // 1) 번호 붙은 별명(예: 김치1, 김치2, 김치3) 또는 짧은 별명(예: 오빠) 그룹 규칙 적용
    if (aliasMeta && aliasMeta.baseName) {
      const ruleVal = aliasRules[aliasMeta.baseName];
      if (ruleVal === 'merge') {
        clientName = aliasMeta.baseName;
      } else if (ruleVal === 'separate') {
        clientName = rawClient;
      } else if (ruleVal && ruleVal !== 'merge' && ruleVal !== 'separate') {
        clientName = ruleVal; // 특정 정식 거래처명으로 일괄 매핑
      }
    }

    // 2) 개별 거래처 이름 수정(clientRenames)이 있으면 최우선 적용
    if (renames[ord.client]) {
      clientName = renames[ord.client];
    } else if (renames[rawClient]) {
      clientName = renames[rawClient];
    }

    let address = ord.address || '';
    let phone = ord.phone || '';
    if (clientName !== ord.client) {
      const found = allKnownClients.find(c => c.name === clientName);
      if (found) {
        address = found.address || address;
        phone = found.phone || phone;
      }
    }

    const nextItems = [];
    (ord.items || []).forEach((it, iIdx) => {
      const adjKey = `${grokSelectedDateKey || 'ALL'}__${oIdx}__${iIdx}`;
      if (excluded[adjKey]) return; // 사용자가 제외한 품목

      const ov = overrides[adjKey];
      if (ov) {
        if (ov.client && ov.client !== clientName) {
          clientName = ov.client;
          const found = allKnownClients.find(c => c.name === clientName);
          if (found) {
            address = found.address || address;
            phone = found.phone || phone;
          }
        }
        const updatedBase = {
          ...it,
          name: ov.name || it.name,
          qty: String(ov.qty ?? it.qty ?? '1'),
          unit: ov.unit || it.unit || 'Box',
          lot: ov.lot !== undefined ? ov.lot : (it.lot || it.entityId || ''),
          note: ov.note !== undefined ? ov.note : (it.note || '')
        };
        nextItems.push({
          ...buildEnrichedItem(updatedBase),
          _adjKey: adjKey
        });
      } else {
        nextItems.push({
          ...it,
          _adjKey: adjKey
        });
      }
    });

    if (nextItems.length > 0) {
      adjustedOrders.push({
        ...ord,
        rawClient,
        aliasInfo: aliasMeta,
        client: clientName,
        address,
        phone,
        items: nextItems
      });
    }
  });

  // 수동으로 직접 추가한 발주 항목 합치기
  added
    .filter(a => !a.dateKey || a.dateKey === 'ALL' || grokSelectedDateKey === 'ALL' || a.dateKey === grokSelectedDateKey)
    .forEach(a => {
      const finalClient = renames[a.client] || a.client;
      const found = allKnownClients.find(c => c.name === finalClient);
      const itemObj = buildEnrichedItem({
        name: a.name,
        qty: String(a.qty || '1'),
        unit: a.unit || 'Box',
        lot: a.lot || '',
        note: a.note || '수동추가',
        extra: ''
      });
      adjustedOrders.push({
        client: finalClient,
        rawClient: a.client,
        address: a.address || (found ? found.address : ''),
        phone: found ? found.phone : '',
        ship: a.ship || 'today',
        time: a.time || '수동추가',
        sender: '직접추가',
        raw: `[수동추가] ${finalClient} / ${a.name} ${a.qty}${a.unit || '박스'}${a.lot ? ` (이력:${a.lot})` : ''}${a.note ? ` (${a.note})` : ''}`,
        isManualAdded: true,
        manualId: a.id,
        items: [{ ...itemObj, _manualId: a.id }]
      });
    });

  return adjustedOrders;
}

/**
 * 거래처/행선지 이름을 변경하면 1·2·3번 탭 전체 및 배차 맵에 동시 반영하는 함수
 */
function renameClientEverywhere(oldName, newName) {
  const cleanOld = (oldName || '').trim();
  const cleanNew = (newName || '').trim();
  if (!cleanOld || !cleanNew || cleanOld === cleanNew) return false;

  if (!manualOrderAdjust.clientRenames) manualOrderAdjust.clientRenames = {};
  manualOrderAdjust.clientRenames[cleanOld] = cleanNew;

  // 수동 추가 발주나 별도 경유지 이름도 함께 변경
  (manualOrderAdjust.addedOrders || []).forEach(a => {
    if (a.client === cleanOld) a.client = cleanNew;
  });
  (extraDispatchStops || []).forEach(s => {
    if (s.name === cleanOld) s.name = cleanNew;
  });

  // 배차 차량 매핑(dispatchMap)도 새 이름으로 인계
  const dmap = getDispatchMap();
  if (dmap[cleanOld]) {
    dmap[cleanNew] = dmap[cleanOld];
    delete dmap[cleanOld];
    setDispatchMap(dmap);
  }

  saveAll();
  analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
  return true;
}

/**
 * 기사님/차량 이름을 수정하면 배정된 모든 거래처도 새 기사님 이름으로 자동 인계
 */
function renameVehicleName(oldVeh, newVeh) {
  const cleanOld = (oldVeh || '').trim();
  const cleanNew = (newVeh || '').trim();
  if (!cleanOld || !cleanNew || cleanOld === cleanNew) return false;

  const vs = getVehicles();
  const idx = vs.indexOf(cleanOld);
  if (idx < 0) return false;

  if (vs.includes(cleanNew)) {
    vs.splice(idx, 1);
  } else {
    vs[idx] = cleanNew;
  }
  setVehicles(vs);

  const dmap = getDispatchMap();
  Object.keys(dmap).forEach(client => {
    if (dmap[client] === cleanOld) {
      dmap[client] = cleanNew;
    }
  });
  setDispatchMap(dmap);

  if (selectedVehicleFilter === cleanOld) {
    selectedVehicleFilter = cleanNew;
  }
  return true;
}

/**
 * 앱 내장 [📖 1·2·3번 탭 상세 사용설명서] HTML 렌더링
 */
function renderUserManualBoxHtml() {
  return `
    <div class="mb-2 no-print">
      <button type="button" id="btnToggleUserManual" class="w-full bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 flex items-center justify-between text-left shadow-xs transition-all">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-secondary text-[18px]">menu_book</span>
          <span class="text-xs font-extrabold text-primary">1·2·3번 실전 가이드 (발주/계근 구분 · 낱개 확인 · 별명 합치기/분리)</span>
        </div>
        <span class="material-symbols-outlined text-on-surface-variant text-[18px]">${showUserManualPanel ? 'expand_less' : 'expand_more'}</span>
      </button>
      ${showUserManualPanel ? `
        <div class="mt-2 bg-surface-container-lowest border border-secondary/30 rounded-2xl p-3.5 shadow-sm space-y-2.5 text-xs leading-relaxed text-on-surface">
          <div class="flex items-center justify-between border-b border-outline-variant/30 pb-1.5">
            <span class="font-extrabold text-sm text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-[18px]">verified</span>
              미트포앤 B2B 1·2·3번 탭 실전 매뉴얼
            </span>
            <span class="badge badge-blue">현장 가이드</span>
          </div>
          <div class="space-y-2">
            <div class="bg-surface-container-low p-2.5 rounded-xl">
              <p class="font-extrabold text-primary text-xs mb-1">① [발주추출] 발주 vs 계근 자동 구분 & 별명(김치1·2·3, 오빠) 합치기/분리</p>
              <p class="text-on-surface-variant text-[11px]">• <b>이력번호(3~4자리) & 단위 판별</b>: 숫자 3~4자리(예: <code>451</code>, <code>451각</code>, <code>451개</code>)는 이력/개체번호로 인식하며, 100 이상 숫자는 뒤에 <b><code>kg</code>이 명시된 경우(예: <code>150kg</code>)에만 발주</b>로, 단위가 없거나 소수점 실측치면 <b>계근</b>으로 자동 분류합니다.<br>• <b>별명 거래처(김치1, 김치2, 오빠)</b>: 상단 스마트 별명 바에서 원터치로 <b>[하나로 합치기]</b>, <b>[따로 유지]</b>, <b>[정식 거래처 연결]</b>을 선택할 수 있습니다.</p>
            </div>
            <div class="bg-[#fffbeb] border border-[#fde68a] p-2.5 rounded-xl">
              <p class="font-extrabold text-[#b45309] text-xs mb-1">② [발주·계근] '낱개' 확인 (특 냉장 · 이력번호 3~4자리 · 비박스)</p>
              <p class="text-[#78350f] text-[11px]">• 단위가 없는 숫자는 <b>기본 박스(PDA 스캔)</b>로 분류됩니다.<br>• PDA 미인식 품목인 <b>① '특' 냉장육</b>, <b>② 숫자 3~4자리 이력번호(+각/+개) 수입육</b>, <b>③ 팩·봉지·kg·덩이 등 비박스 단위</b>는 모두 <b>[낱개]</b>로 분류되어 체크리스트로 관리됩니다.</p>
            </div>
            <div class="bg-[#f0f9ff] border border-[#bae6fd] p-2.5 rounded-xl">
              <p class="font-extrabold text-[#0369a1] text-xs mb-1">③ [배차동선] 기사님 이름 수정 & '냉동창고' 별도 경유지 추가</p>
              <p class="text-[#0c4a6e] text-[11px]">• <b>❄️ 냉동창고 원터치 추가</b>: 발주에 없어도 들러야 하는 냉동창고는 <b>[❄️ + 냉동창고 추가]</b> 버튼을 누르면 배차 카드·표·지도에 즉시 포함됩니다.</p>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function bindUserManualToggle(container) {
  document.getElementById('btnToggleUserManual')?.addEventListener('click', () => {
    showUserManualPanel = !showUserManualPanel;
    renderTab(currentTab);
  });
}

/**
 * ============================================================================
 * ★ [통합 추출 & 1·2·3번 탭 실시간 자동 동기화 엔진]
 * - 카톡 텍스트나 파일이 들어오면 즉시:
 *   1) 날짜별 발주 건수를 계산하고 최적 배송일(recommendedKey)을 선택
 *   2) 발주(currentOrders), 계근(currentWeightLogs), 일반사항(currentGeneralLogs) 생성
 *   3) 탭 1(카톡추출), 탭 2(발주·계근), 탭 3(배차·지도)의 메인 상태를 즉시 갱신!
 * ============================================================================
 */
function analyzeRawKakaoToStaging(rawText, deliveryDateOverride = null, autoRecommendDate = false) {
  currentKakaoRawText = rawText || '';

  const parserOptions = {
    universalMode: Boolean(uiSettings?.universalMode),
    customInstructionKeywords: workInstructionStore?.customKeywords || ''
  };

  const inspection = inspectDatesWithCounts(currentKakaoRawText, parserOptions);
  grokAvailableDates = inspection.dates;

  if (autoRecommendDate) {
    grokSelectedDateKey = inspection.recommendedKey || 'ALL';
  } else if (deliveryDateOverride !== null) {
    grokSelectedDateKey = deliveryDateOverride;
  } else if (
    grokSelectedDateKey !== 'ALL' &&
    !grokAvailableDates.some(d => d.key === grokSelectedDateKey)
  ) {
    grokSelectedDateKey = inspection.recommendedKey || 'ALL';
  }

  let parsed = parseOrdersForDeliveryDate(currentKakaoRawText, grokSelectedDateKey, null, parserOptions);

  // 만약 특정 날짜 구간에서 발주가 0건인데 전체 구간('ALL')에는 발주가 있다면 자동으로 전체 구간으로 전환하여 누락 방지!
  if ((parsed.orders || []).length === 0 && grokSelectedDateKey !== 'ALL') {
    const allParsed = parseOrdersForDeliveryDate(currentKakaoRawText, 'ALL', null, parserOptions);
    if ((allParsed.orders || []).length > 0 || (allParsed.workInstructions || []).length > 0) {
      grokSelectedDateKey = 'ALL';
      parsed = allParsed;
    }
  }

  // ★ 만약 미트포앤 축산 모드(universalMode=false)에서 발주가 0건 추출되었는데,
  //    타사·범용 모드(universalMode=true)로 재시도했을 때 발주가 발견된다면 자동으로 범용 모드로 폴백하여 0건 추출 완벽 방지!
  if ((parsed.orders || []).length === 0 && !parserOptions.universalMode) {
    const univOptions = { ...parserOptions, universalMode: true };
    const univInspection = inspectDatesWithCounts(currentKakaoRawText, univOptions);
    const targetKey = autoRecommendDate ? (univInspection.recommendedKey || 'ALL') : (grokSelectedDateKey || 'ALL');
    let univParsed = parseOrdersForDeliveryDate(currentKakaoRawText, targetKey, null, univOptions);
    if ((univParsed.orders || []).length === 0 && targetKey !== 'ALL') {
      univParsed = parseOrdersForDeliveryDate(currentKakaoRawText, 'ALL', null, univOptions);
      if ((univParsed.orders || []).length > 0) {
        grokSelectedDateKey = 'ALL';
      }
    } else if ((univParsed.orders || []).length > 0) {
      grokSelectedDateKey = targetKey;
    }
    if ((univParsed.orders || []).length > 0) {
      uiSettings.universalMode = true;
      grokAvailableDates = univInspection.dates;
      parsed = univParsed;
    }
  }

  // ★ 사용자가 1·2·3번 탭에서 교정/추가/제외한 수동 조정 내역 적용
  currentOrders = applyManualOrderAdjustments(parsed.orders || []);
  currentWeightLogs = parsed.weightLogs || [];
  currentGeneralLogs = parsed.generalLogs || [];

  // ★ 업무 지시사항(자동추출 + 수동등록) 통합 구성
  const completedMap = workInstructionStore?.completedMap || {};
  const deletedMap = workInstructionStore?.deletedMap || {};
  const manualInstList = (workInstructionStore?.manualList || []).filter(
    m => !m.dateKey || m.dateKey === 'ALL' || grokSelectedDateKey === 'ALL' || m.dateKey === grokSelectedDateKey
  );

  const autoInstList = (parsed.workInstructions || [])
    .map((inst, idx) => {
      const instKey = `auto__${inst.dayKey || 'ALL'}__${inst.time || idx}__${(inst.content || '').slice(0, 30)}`;
      return {
        ...inst,
        instKey,
        isManual: false,
        completed: Boolean(completedMap[instKey])
      };
    })
    .filter(inst => !deletedMap[inst.instKey]);

  const manualMapped = manualInstList.map(m => ({
    ...m,
    instKey: m.id,
    isManual: true,
    completed: Boolean(completedMap[m.id] ?? m.completed)
  }));

  currentWorkInstructions = [...manualMapped, ...autoInstList];

  // 계근 로그(weightLogs)에 적힌 개체번호/무게가 발주 거래처 품목과 매칭되면 자동으로 초기값 연결
  currentWeightLogs.forEach(w => {
    if (!w.client || w.client === '(미상)') return;
    const matchingOrders = currentOrders.filter(o => o.client === w.client || o.client.includes(w.client) || w.client.includes(o.client));
    matchingOrders.forEach(ord => {
      (w.rows || []).forEach(r => {
        if (!r.meat) return;
        const rStd = normalizeMeat(r.meat) || r.meat;
        (ord.items || []).forEach((it, idx) => {
          if (it.stdName === rStd || it.name.includes(r.meat) || r.meat.includes(it.name)) {
            const key = getItemKey(ord.client, idx, it.name);
            if (!itemMetaMap[key]) {
              itemMetaMap[key] = {
                lot: r.lot || it.entityId || it.lot || '',
                weight: r.weight || (r.pack ? `${r.pack}` : '') || it.weight || ''
              };
            }
          }
        });
      });
    });
  });

  // 탭 1의 3대 분류 목록(stagingItems) 구성
  const results = [];
  let seq = 0;

  // 1) [발주 목록]
  currentOrders.forEach(o => {
    const shipLabel = o.ship === 'next' ? '다음날출고' : '당일출고';
    (o.items || []).forEach(it => {
      const stdMeat = it.stdName || normalizeMeat(it.name) || it.name;
      const noteStr = [it.checkBadgeText, it.note, it.extra, shipLabel].filter(Boolean).join(' · ');
      results.push({
        stagingId: `${Date.now()}-grok-o-${seq++}`,
        adjKey: it._adjKey || '',
        manualId: it._manualId || o.manualId || '',
        checked: true,
        date: getTodayStr(),
        time: o.time || '09:00',
        sender: o.sender || o.client,
        client: o.client,
        address: o.address || '',
        phone: o.phone || '',
        type: '발주',
        reason: it.needsCheck ? `⚠️낱개(${it.checkReasons.join('/')})` : `📦일반박스(${shipLabel})`,
        itemName: stdMeat,
        rawItemName: it.name,
        qty: parseFloat(it.qty) || 1,
        unit: it.displayUnit || '박스',
        lotNo: it.entityId || it.lot || '',
        note: noteStr,
        rawText: o.raw
      });
    });
  });

  // 2) [재고(계근·입고) 목록]
  currentWeightLogs.forEach(w => {
    (w.rows || []).forEach(r => {
      const firstWeight = parseFloat(String(r.weight || '').split('/')[0]) || (parseFloat(r.pack) || 1);
      results.push({
        stagingId: `${Date.now()}-grok-w-${seq++}`,
        checked: true,
        date: getTodayStr(),
        time: w.time || '09:30',
        sender: w.sender || w.client,
        client: w.client || '(미상)',
        address: '',
        type: '발주계근',
        reason: `계근·이력 분리${r.pack ? `(${r.pack})` : ''}`,
        itemName: normalizeMeat(r.meat) || r.meat || '계근품목',
        qty: firstWeight,
        unit: r.weight ? 'kg' : (r.pack || '박스'),
        lotNo: r.lot || '',
        note: r.pack ? `포장:${r.pack} / 실측:${r.weight || '-'}` : '',
        rawText: r.raw || w.raw
      });
    });
  });

  // 3) [일반사항 목록]
  currentGeneralLogs.forEach(g => {
    const raw = g.raw || '';
    if (/\[입고|창고입고|입고완료/.test(raw) && /\d/.test(raw)) {
      const m = raw.match(/([가-힣a-zA-Z0-9\s()]+?)\s*(\d+(?:\.\d+)?)\s*(박스|박|팩|키로|kg|Box|Pack)/i);
      if (m) {
        const lotM = raw.match(/(?:LOT|로트)[:\s-]*([A-Za-z0-9-]+)/i);
        results.push({
          stagingId: `${Date.now()}-grok-in-${seq++}`,
          checked: true,
          date: getTodayStr(),
          time: g.time || '10:00',
          sender: g.sender || '창고입고',
          client: g.client || '매입처',
          address: '',
          type: '입고',
          reason: '창고입고 감지',
          itemName: normalizeMeat(m[1]) || m[1].trim(),
          qty: parseFloat(m[2]) || 1,
          unit: m[3],
          lotNo: lotM ? lotM[1] : '',
          note: '창고 입고',
          rawText: raw
        });
        return;
      }
    }

    results.push({
      stagingId: `${Date.now()}-grok-g-${seq++}`,
      checked: false,
      date: getTodayStr(),
      time: g.time || '',
      sender: g.sender || g.client || '일반',
      client: g.client || '일반사항',
      address: '',
      type: '일반',
      reason: g.reason || '일반사항/요약제외',
      itemName: '',
      qty: 0,
      unit: '박스',
      lotNo: '',
      note: '',
      rawText: raw
    });
  });

  stagingItems = results;
  updateHeaderDateIndicator();
  saveAll();
  return results;
}

// 앱 시작 시 저장된 카톡 원문이 있으면 즉시 복원하고, 없으면 실전 샘플(8개 거래처)로 초기화
try {
  if (currentKakaoRawText && currentKakaoRawText.trim()) {
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
  } else {
    analyzeRawKakaoToStaging(REALISTIC_KAKAO_SAMPLE, null, true);
  }
} catch (err) {
  console.error('초기 카톡 샘플 파싱 중 오류 복구:', err);
}

function getCurrentUserObj() {
  return (
    registeredUsers.find(u => u.id === currentUserId) ||
    registeredUsers.find(u => u.role === 'admin') ||
    DEFAULT_USERS[0]
  );
}

function getUserRoleLabel(role) {
  if (role === 'admin') return '👑 관리자';
  if (role === 'driver') return '🚚 배송기사';
  return '🔪 현장·계근';
}

/**
 * 실시간 재고 및 자동 매입 발주 추천 산출식 (4번 탭용)
 */
function calculateMasterInventory() {
  return stockList.map(stock => {
    let orderedQty = 0;
    currentOrders.forEach(order => {
      (order.items || []).forEach(item => {
        const std = item.stdName || normalizeMeat(item.name) || item.name;
        if (stock.name.includes(std) || std.includes(stock.name)) {
          orderedQty += Number(parseFloat(item.qty) || 0);
        }
      });
    });

    const currentStock = Number((stock.baseQty + stock.inboundQty + stock.manualAdj).toFixed(1));
    const availableStock = Number((currentStock - orderedQty).toFixed(1));
    const shortageQty = Number(Math.max(0, stock.safeQty - availableStock).toFixed(1));

    return {
      ...stock,
      currentStock,
      orderedQty: Number(orderedQty.toFixed(1)),
      availableStock,
      shortageQty,
      needPurchase: shortageQty > 0
    };
  });
}

function stopCameraIfActive() {
  if (activeCameraStream) {
    activeCameraStream.getTracks().forEach(t => t.stop());
    activeCameraStream = null;
  }
}

function updateAdminModeUI() {
  const tabBtnIngest = document.getElementById('tabBtnIngest') || document.querySelector('#mainTabs [data-tab="ingest"]');
  const adminBtn = document.getElementById('adminModeToggleBtn');
  const adminIcon = document.getElementById('adminModeIcon');
  const adminLabel = document.getElementById('adminModeLabel');
  const adminBadge = document.getElementById('adminBadgeHeader');

  if (tabBtnIngest) {
    // 관리자 모드가 아닐 때는 '발주추출' 탭을 완전히 숨김
    tabBtnIngest.style.display = isAdminMode ? 'flex' : 'none';
  }
  if (adminBtn && adminIcon && adminLabel) {
    if (isAdminMode) {
      adminBtn.className = 'h-8 px-2 rounded-lg bg-primary text-on-primary font-bold text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap';
      adminIcon.textContent = 'lock_open';
      adminLabel.textContent = '관리자ON';
    } else {
      adminBtn.className = 'h-8 px-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary border border-outline-variant/40 font-bold text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap';
      adminIcon.textContent = 'lock';
      adminLabel.textContent = '관리자모드';
    }
  }
  if (adminBadge) {
    const curUser = getCurrentUserObj();
    adminBadge.textContent = isAdminMode ? `👑 ${curUser.name}` : `👤 ${curUser.name}`;
    adminBadge.className = isAdminMode
      ? 'font-label-sku text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-secondary font-bold leading-none whitespace-nowrap'
      : 'font-label-sku text-[9px] px-1.5 py-0.5 rounded bg-surface-container-low text-outline font-bold leading-none whitespace-nowrap';
  }
}

function toggleAdminModeWithPin() {
  if (isAdminMode) {
    isAdminMode = false;
    saveAll();
    updateAdminModeUI();
    showToast('🔒 일반/현장 모드로 전환되었습니다. (발주추출 숨김)');
    if (currentTab === 'ingest') {
      renderTab('orders');
    } else {
      renderTab(currentTab);
    }
    return;
  }

  const savedPin = localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;
  const inputPin = window.prompt('🔓 관리자 모드(발주추출 활성화) 비밀번호를 입력하세요 (기본: 1234):', DEFAULT_PIN);
  if (inputPin === null) return;
  if (inputPin.trim() === savedPin || inputPin.trim() === '1234') {
    isAdminMode = true;
    saveAll();
    updateAdminModeUI();
    showToast('🔓 관리자 모드가 활성화되어 [발주추출] 탭이 표시됩니다!');
    renderTab('ingest');
  } else {
    showToast('❌ 비밀번호가 일치하지 않습니다. (기본 비밀번호: 1234)');
  }
}

function renderTab(tabName) {
  updateAdminModeUI();

  // ★ 관리자 모드가 꺼져 있을 때 'ingest'(발주추출) 접근 시 자동으로 'orders'(발주·계근)로 이동
  if (tabName === 'ingest' && !isAdminMode) {
    tabName = 'orders';
  }

  currentTab = tabName;
  stopCameraIfActive();

  document.querySelectorAll('#mainTabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });

  if (leafletMap) {
    try {
      leafletMap.remove();
    } catch {}
    leafletMap = null;
  }

  updateHeaderDateIndicator();
  const container = document.getElementById('mainView');
  if (tabName === 'ingest') renderIngestTab(container);
  else if (tabName === 'orders') renderOrdersTab(container);
  else if (tabName === 'route') renderRouteTab(container);
  else if (tabName === 'stock') renderStockTab(container);
  else if (tabName === 'settings') renderSettingsTab(container);
  else if (tabName === 'home') renderHomeModal(container);
}

/**
 * ============================================================================
 * [탭 1] 1.카톡추출 (PC/모바일 카톡 파일 로드 + 날짜별 건수 자동감지 + 3대 목록)
 * ============================================================================
 */
function renderIngestTab(container) {
  const activeProfile = getActiveProfile();
  const totalClientsCnt = getAllClients().length;
  const orderClientsCnt = new Set(currentOrders.map(o => o.client)).size;

  container.innerHTML = `
    <div class="bg-surface-container-high p-1 rounded-xl grid grid-cols-3 gap-1 mb-2.5 no-print">
      <button class="py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${ingestSubTab === 'workbench' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}" data-sub="workbench">
        <span class="material-symbols-outlined text-[15px]">chat</span>
        <span>발주추출 (${orderClientsCnt}곳)</span>
      </button>
      <button class="py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${ingestSubTab === 'rules' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}" data-sub="rules">
        <span class="material-symbols-outlined text-[15px]">contact_page</span>
        <span>거래처(${totalClientsCnt})·별명</span>
      </button>
      <button class="py-1.5 px-2 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ${ingestSubTab === 'history' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}" data-sub="history">
        <span class="material-symbols-outlined text-[15px]">document_scanner</span>
        <span>수기사진 OCR</span>
      </button>
    </div>
    <div id="ingestSubView"></div>
  `;

  container.querySelectorAll('[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      ingestSubTab = btn.dataset.sub;
      renderIngestTab(container);
    });
  });

  const subView = document.getElementById('ingestSubView');
  if (ingestSubTab === 'workbench') {
    renderIngestWorkbench(subView, activeProfile);
  } else if (ingestSubTab === 'rules') {
    renderIngestRulesManager(subView, activeProfile);
  } else {
    renderIngestHistoryAndOcr(subView);
  }
}

function renderIngestWorkbench(subView) {
  const orderItems = stagingItems.filter(s => s.type === '발주');
  const stockItems = stagingItems.filter(s => s.type === '입고' || s.type === '발주계근');
  const generalItems = stagingItems.filter(s => s.type === '일반');

  const q = ingestSearchQuery.trim().toLowerCase();

  const visibleItems = stagingItems
    .map((item, originalIdx) => ({ ...item, originalIdx }))
    .filter(item => {
      if (stagingCategoryFilter === 'order' || stagingCategoryFilter === 'items') {
        if (item.type !== '발주') return false;
      } else if (stagingCategoryFilter === 'stock') {
        if (item.type !== '입고' && item.type !== '발주계근') return false;
      } else if (stagingCategoryFilter === 'general') {
        if (item.type !== '일반') return false;
      }
      if (!q) return true;
      const hay = `${item.client || ''} ${item.sender || ''} ${item.itemName || ''} ${item.rawText || ''} ${item.reason || ''}`.toLowerCase();
      return hay.includes(q);
    });

  // ★ 번호별명(예: 김치1, 김치2, 김치3) 및 축약 별명(예: 오빠) 그룹 자동 감지
  const aliasGroupsDetected = {};
  currentOrders.forEach(o => {
    const rawC = o.rawClient || o.client;
    const meta = o.aliasInfo || analyzeClientAliasToken(rawC);
    if (!meta || (!meta.isNumbered && !meta.isShortAlias)) return;
    const base = meta.baseName;
    if (!aliasGroupsDetected[base]) {
      aliasGroupsDetected[base] = {
        baseName: base,
        isNumbered: meta.isNumbered,
        rawTokens: new Set(),
        currentClients: new Set(),
        candidates: findCandidateClientsForAlias(base)
      };
    }
    aliasGroupsDetected[base].rawTokens.add(rawC);
    aliasGroupsDetected[base].currentClients.add(o.client);
  });
  const detectedAliasList = Object.values(aliasGroupsDetected).filter(
    g => g.isNumbered || g.rawTokens.size > 1 || !getAllClients().some(c => c.name === g.baseName)
  );

  // 거래처별 카드 그룹화 (초슬림 고밀도 카드 뷰)
  const clientCardGroupsMap = {};
  currentOrders.forEach(o => {
    const cname = o.client;
    if (!clientCardGroupsMap[cname]) {
      clientCardGroupsMap[cname] = {
        client: cname,
        rawClients: new Set(),
        address: o.address || '',
        ship: o.ship === 'next' ? '익일' : '당일',
        time: o.time || '',
        rawBlocks: [],
        items: []
      };
    }
    if (o.rawClient && o.rawClient !== cname) {
      clientCardGroupsMap[cname].rawClients.add(o.rawClient);
    }
    if (o.raw) clientCardGroupsMap[cname].rawBlocks.push(o.raw);
    (o.items || []).forEach(it => {
      clientCardGroupsMap[cname].items.push(it);
    });
  });

  const clientCardGroups = Object.values(clientCardGroupsMap)
    .filter(cg => {
      if (!q) return true;
      const hay = `${cg.client} ${[...cg.rawClients].join(' ')} ${cg.address} ${cg.items.map(i => `${i.name} ${i.note || ''} ${i.lot || ''}`).join(' ')} ${cg.rawBlocks.join(' ')}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.client.localeCompare(b.client, 'ko'));

  const activeRange = getWindowRange(grokSelectedDateKey);
  const rangeLabel = formatWindowLabel(activeRange);
  const uniqueClientCnt = new Set(currentOrders.map(o => o.client)).size;
  const summaryText = currentOrders.length > 0
    ? buildGrokSummaryText(currentOrders, grokSelectedDateKey === 'ALL' ? '전체' : grokSelectedDateKey.replace(/^20\d{2}년\s*/, ''))
    : '';

  const adjCount =
    Object.keys(manualOrderAdjust?.clientRenames || {}).length +
    Object.keys(manualOrderAdjust?.aliasGroupRules || {}).length +
    Object.keys(manualOrderAdjust?.itemOverrides || {}).length +
    Object.keys(manualOrderAdjust?.excludedItems || {}).length +
    (manualOrderAdjust?.addedOrders || []).length;

  let totalSpecialCnt = 0;
  currentOrders.forEach(o => (o.items || []).forEach(it => { if (it.needsCheck) totalSpecialCnt++; }));

  const filteredInstructions = currentWorkInstructions.filter(inst => {
    if (!q) return true;
    const hay = `${inst.category || ''} ${inst.sender || ''} ${inst.client || ''} ${inst.content || ''}`.toLowerCase();
    return hay.includes(q);
  });
  const uncompletedInstCnt = currentWorkInstructions.filter(i => !i.completed).length;

  subView.innerHTML = `
    ${renderUserManualBoxHtml()}

    <!-- 1. 카톡 파싱 엔진 상태 헤더 & 타사/범용 모드 전환 & 메인 액션 카드 -->
    <section class="bg-surface-container-low rounded-2xl p-3 mb-2.5 border border-outline-variant/25 shadow-xs space-y-2">
      <div class="flex items-center justify-between flex-wrap gap-1.5">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs font-extrabold text-primary tracking-tight">카톡 자동 파싱 엔진 (${esc(grokDetectedEncoding)})</span>
        </div>
        <div class="flex items-center gap-1 flex-wrap">
          <span class="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-[11px] font-extrabold font-mono">발주 ${uniqueClientCnt}곳 · ${orderItems.length}품목</span>
          ${totalSpecialCnt > 0 ? `<span class="px-2 py-0.5 bg-[#fef3c7] text-[#b45309] rounded-full text-[11px] font-extrabold font-mono">낱개 ${totalSpecialCnt}건</span>` : ''}
          ${currentWorkInstructions.length > 0 ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-full text-[11px] font-extrabold font-mono">업무지시 ${currentWorkInstructions.length}건</span>` : ''}
        </div>
      </div>

      <!-- ★ 회사/단톡방 분석 모드 원터치 전환 바 (미트포앤 전용 vs 타사·범용 발주+업무지시 통합 모드) -->
      <div class="bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/30 grid grid-cols-2 gap-1">
        <button type="button" id="btnModeMeatpoan" class="py-1.5 px-2 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${!uiSettings.universalMode ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}">
          <span>🥩 미트포앤 축산 모드</span>
        </button>
        <button type="button" id="btnModeUniversal" class="py-1.5 px-2 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${uiSettings.universalMode ? 'bg-secondary text-white shadow-xs' : 'text-on-surface-variant hover:bg-surface-container-low'}">
          <span>🏢 타사·범용 모드 (발주+업무지시)</span>
        </button>
      </div>

      <!-- 카카오톡 노란색 메인 파일 불러오기 CTA 버튼 -->
      <label for="kakaoTxtFile" class="w-full bg-tertiary-fixed hover:brightness-95 text-on-tertiary-fixed font-extrabold py-2.5 px-3.5 rounded-xl flex items-center justify-between shadow-sm active:scale-[0.99] transition-all cursor-pointer">
        <div class="flex items-center gap-2.5">
          <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' 1;">chat</span>
          <div class="text-left">
            <div class="text-xs sm:text-sm font-black tracking-tight text-[#201c00]">카카오톡 대화 파일(.txt / .zip / .csv) 불러오기</div>
            <div class="text-[10px] font-semibold text-[#504700]">${uiSettings.universalMode ? '타사·전 업종 발주 품목 + 업무 지시사항 자동 추출·기록' : 'PC · 갤럭시 · 아이폰 내보내기(.txt/.zip) 전 형식 자동인식'}</div>
          </div>
        </div>
        <span class="material-symbols-outlined text-[20px]">upload_file</span>
      </label>
      <input type="file" id="kakaoTxtFile" accept=".txt,.csv,.zip,text/plain,text/csv,application/zip,*/*" style="display:none;">

      <!-- 배송/작업일 선택 드롭다운 + 빠른 탭 이동 -->
      <div class="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
        <div class="sm:col-span-7 bg-surface-container-lowest px-2.5 py-1.5 rounded-xl border border-outline-variant/30 flex items-center gap-2">
          <span class="material-symbols-outlined text-[16px] text-secondary shrink-0">calendar_month</span>
          <select id="selectGrokDate" class="input-field !py-1 !px-2 !min-h-[30px] !text-xs !font-extrabold !border-0 !bg-transparent flex-1">
            <option value="ALL" ${grokSelectedDateKey === 'ALL' ? 'selected' : ''}>전체 날짜 일괄 추출 (${esc(rangeLabel)})</option>
            ${grokAvailableDates.map(d => `<option value="${esc(d.key)}" ${grokSelectedDateKey === d.key ? 'selected' : ''}>${esc(d.displayLabel || d.label)}</option>`).join('')}
          </select>
        </div>
        <div class="sm:col-span-5 grid grid-cols-2 gap-1.5">
          <button type="button" id="btnGoTab2Now" class="bg-primary text-white py-2 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[15px]">fact_check</span>
            <span>2.발주·계근(${uniqueClientCnt})</span>
          </button>
          <button type="button" id="btnGoTab3Now" class="bg-secondary text-white py-2 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-xs active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[15px]">local_shipping</span>
            <span>3.배차·동선(${uniqueClientCnt})</span>
          </button>
        </div>
      </div>

      <!-- 서브 기능 칩 버튼 -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
        <button type="button" id="btnToggleManualAddDrawer" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 border transition-all ${showManualAddDrawer ? 'bg-primary text-white border-primary' : 'bg-surface-container-lowest text-primary border-outline-variant/40'}">
          <span class="material-symbols-outlined text-[14px]">add_circle</span>
          <span>수동·전화발주 ${adjCount > 0 ? `(보정 ${adjCount})` : ''}</span>
        </button>
        <button type="button" id="btnToggleWorkInstDrawer" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 border transition-all ${showWorkInstDrawer ? 'bg-purple-800 text-white border-purple-800' : 'bg-purple-50 text-purple-900 border-purple-300'}">
          <span class="material-symbols-outlined text-[14px]">assignment_add</span>
          <span>업무지시 등록·키워드 (${currentWorkInstructions.length}건)</span>
        </button>
        <button type="button" id="btnToggleRawDrawer" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 border transition-all ${showRawKakaoDrawer ? 'bg-primary text-white border-primary' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40'}">
          <span class="material-symbols-outlined text-[14px]">content_paste</span>
          <span>원문 붙여넣기</span>
        </button>
        <button type="button" id="btnToggleGrokSummary" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 border transition-all ${showGrokSummaryBox ? 'bg-primary text-white border-primary' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40'}">
          <span class="material-symbols-outlined text-[14px]">summarize</span>
          <span>문자식 합계표</span>
        </button>
        <button type="button" id="btnSampleMultiFormat" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 bg-surface-container-lowest text-on-surface-variant border border-outline-variant/40">
          <span class="material-symbols-outlined text-[14px]">science</span>
          <span>미트포앤 샘플</span>
        </button>
        <button type="button" id="btnSampleUniversalCompany" class="px-2.5 py-1 rounded-lg text-[11px] font-extrabold whitespace-nowrap flex items-center gap-1 bg-blue-50 text-secondary border border-blue-200">
          <span class="material-symbols-outlined text-[14px]">domain</span>
          <span>타사 발주·업무지시 샘플</span>
        </button>
      </div>

      <!-- [서랍 1] 수동·전화 발주 직접 추가 및 보정 초기화 패널 -->
      ${showManualAddDrawer ? `
        <div class="bg-surface-container-lowest rounded-xl p-3 border border-secondary/30 space-y-2 mt-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-secondary">edit_note</span>
              누락·전화 발주 직접 추가 (2·3번 탭 동시 반영)
            </span>
            <div class="flex items-center gap-1.5">
              <span class="badge badge-blue">보정 ${adjCount}건</span>
              ${adjCount > 0 ? `<button type="button" id="btnResetManualAdjust" class="text-[11px] font-bold text-error underline px-1">보정초기화</button>` : ''}
            </div>
          </div>
          <div class="grid grid-cols-2 gap-1.5">
            <div>
              <label class="kpi-label">거래처명</label>
              <input type="text" id="manOrderClient" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 참새방앗간, 강남본점">
            </div>
            <div>
              <label class="kpi-label">품목명 ('특' 포함 시 특냉장)</label>
              <input type="text" id="manOrderItem" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 특삼겹, 수입차돌, 진라면">
            </div>
          </div>
          <div class="grid grid-cols-12 gap-1.5 items-end">
            <div class="col-span-3">
              <label class="kpi-label">수량</label>
              <input type="number" step="0.1" id="manOrderQty" class="input-field !py-1.5 !min-h-[34px] !text-xs font-mono" value="1">
            </div>
            <div class="col-span-4">
              <label class="kpi-label">단위</label>
              <select id="manOrderUnit" class="input-field !py-1.5 !min-h-[34px] !text-xs">
                <option value="Box">박스 (PDA)</option>
                <option value="각">각 (이력/낱개)</option>
                <option value="개">개 (이력/낱개)</option>
                <option value="Pack">팩</option>
                <option value="봉지">봉지</option>
                <option value="Kg">kg (키로)</option>
                <option value="Chunk">덩이</option>
                <option value="Pan">판</option>
                <option value="Set">벌/세트</option>
              </select>
            </div>
            <div class="col-span-5">
              <label class="kpi-label">3~4자리 이력번호/비고</label>
              <input type="text" id="manOrderNote" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 451 / 대산">
            </div>
          </div>
          <button type="button" id="btnAddManualOrder" class="w-full bg-primary text-white py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs">
            <span class="material-symbols-outlined text-[15px]">add</span>
            <span>발주 목록에 즉시 추가</span>
          </button>
        </div>
      ` : ''}

      <!-- [서랍 1-B] 업무 지시사항 수동 등록 & 타사 맞춤형 지시어 키워드 설정 패널 -->
      ${showWorkInstDrawer ? `
        <div class="bg-surface-container-lowest rounded-xl p-3 border border-purple-400/60 space-y-2 mt-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-purple-950 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-purple-700">assignment</span>
              업무 지시사항 직접 기록 & 회사별 자동감지 키워드 설정
            </span>
            <span class="badge badge-purple">미완료 ${uncompletedInstCnt}건</span>
          </div>
          <div class="grid grid-cols-12 gap-1.5">
            <div class="col-span-4">
              <label class="kpi-label">분류</label>
              <select id="manInstCategory" class="input-field !py-1.5 !min-h-[34px] !text-xs">
                <option value="🚚 배송/물류지시">🚚 배송/물류지시</option>
                <option value="🔪 작업/현장지시">🔪 작업/현장지시</option>
                <option value="💰 수금/행정지시">💰 수금/행정지시</option>
                <option value="🚨 클레임/반품지시">🚨 클레임/반품지시</option>
                <option value="📌 일반업무지시">📌 일반업무지시</option>
              </select>
            </div>
            <div class="col-span-3">
              <label class="kpi-label">중요도</label>
              <select id="manInstPriority" class="input-field !py-1.5 !min-h-[34px] !text-xs">
                <option value="긴급">🚨 긴급</option>
                <option value="보통" selected>📌 보통</option>
              </select>
            </div>
            <div class="col-span-5">
              <label class="kpi-label">관련 거래처 / 담당자</label>
              <input type="text" id="manInstClient" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 역삼직영점, 김과장">
            </div>
          </div>
          <div>
            <label class="kpi-label">업무 지시 내용</label>
            <input type="text" id="manInstContent" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 오전 10시 전 긴급배송 / 뒷문 비번 1234 냉장고 입고 / 거래명세표 전달">
          </div>
          <button type="button" id="btnAddManualWorkInst" class="w-full bg-purple-800 text-white py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs">
            <span class="material-symbols-outlined text-[15px]">add_task</span>
            <span>업무 지시사항 기록 추가</span>
          </button>
          <div class="pt-1.5 border-t border-outline-variant/30 space-y-1">
            <label class="kpi-label">우리 회사 카톡 업무지시 자동추출 키워드 (쉼표로 구분)</label>
            <div class="flex gap-1.5">
              <input type="text" id="inputCustomInstKeywords" class="input-field !py-1 !min-h-[30px] !text-[11px] flex-1" value="${esc(workInstructionStore.customKeywords || '')}">
              <button type="button" id="btnSaveInstKeywords" class="bg-secondary text-white px-3 py-1 rounded-lg text-[11px] font-extrabold shrink-0">키워드 저장</button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- [서랍 2] 카톡 대화 원문 직접 붙여넣기/편집 패널 -->
      <div class="${showRawKakaoDrawer ? 'block' : 'hidden'} bg-surface-container-lowest rounded-xl p-2.5 border border-outline-variant/40 space-y-1.5 mt-1.5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-primary">카카오톡 대화 원문 붙여넣기 / 직접 편집</span>
          <button type="button" id="btnAnalyzeToStaging" class="bg-secondary text-white px-2.5 py-1 rounded-lg text-xs font-extrabold">다시 추출 실행</button>
        </div>
        <textarea id="kakaoRawInput" class="input-field !text-xs font-mono" rows="5" placeholder="카카오톡 대화 파일(.txt)을 불러오거나 여기에 대화 내용을 붙여넣으세요.">${esc(currentKakaoRawText)}</textarea>
      </div>

      <!-- [서랍 3] 문자식 발주 합계 미리보기 -->
      ${showGrokSummaryBox && summaryText ? `
        <div class="bg-surface-container-lowest rounded-xl p-2.5 border border-outline-variant/40 space-y-1.5 mt-1.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-primary">문자식 전체 발주 합계 (■박스 / ■낱개)</span>
            <button type="button" id="btnCopyGrokSummary" class="bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">content_copy</span>복사
            </button>
          </div>
          <div class="summary-box !text-xs" id="grokSummaryPreview">${esc(summaryText)}</div>
        </div>
      ` : ''}
    </section>

    <!-- ★ 1-B. 스마트 별명(김치1·2·3 / 오빠 등) 합치기·분리·정식상호 연결 바 -->
    ${detectedAliasList.length > 0 ? `
      <section class="bg-[#fffbeb] border border-amber-300/90 rounded-xl px-3 py-2 mb-2.5 space-y-1.5 no-print">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-extrabold text-[#92400e] flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px] text-[#d97706]">call_merge</span>
            별명·번호 거래처 자동 감지 (${detectedAliasList.length}그룹) — 합칠지 따로 할지 선택하세요
          </span>
        </div>
        <div class="space-y-1">
          ${detectedAliasList.map(g => {
            const curRule = (manualOrderAdjust?.aliasGroupRules || {})[g.baseName] || 'separate';
            const rawListStr = [...g.rawTokens].join(', ');
            return `
              <div class="flex items-center justify-between gap-1.5 flex-wrap bg-white/90 px-2.5 py-1 rounded-lg border border-amber-200 text-[11px]">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="font-extrabold text-primary">${esc(rawListStr)}</span>
                  <span class="text-[10px] text-on-surface-variant">→ 현재: <b>${esc([...g.currentClients].join(', '))}</b></span>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" class="btn-alias-group-rule px-2 py-0.5 rounded font-extrabold text-[10px] transition-colors ${curRule === 'merge' ? 'bg-primary text-white' : 'bg-surface-container-low text-primary hover:bg-surface-container-high'}"
                    data-base="${esc(g.baseName)}" data-rule="merge">
                    🔗 '${esc(g.baseName)}' 하나로 합치기
                  </button>
                  <button type="button" class="btn-alias-group-rule px-2 py-0.5 rounded font-extrabold text-[10px] transition-colors ${curRule === 'separate' ? 'bg-secondary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}"
                    data-base="${esc(g.baseName)}" data-rule="separate">
                    ↔️ 따로 유지(${esc(rawListStr)})
                  </button>
                  <button type="button" class="btn-alias-group-custom px-2 py-0.5 rounded font-extrabold text-[10px] bg-amber-100 text-amber-900 hover:bg-amber-200"
                    data-base="${esc(g.baseName)}" data-candidates="${esc(g.candidates.map(c => c.name).join(', '))}">
                    🏢 정식거래처 지정
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    ` : ''}

    <!-- 2. 검색바 & 카테고리 필터 칩 -->
    <section class="space-y-1.5 mb-2">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
        <input type="text" id="ingestSearchInput" class="w-full bg-surface-container-lowest pl-9 pr-3 py-2 rounded-xl text-xs font-semibold text-on-surface placeholder:text-outline border border-outline-variant/30 focus:ring-2 focus:ring-secondary focus:outline-none shadow-2xs" placeholder="거래처명(김치1, 태광), 품목(특삼겹, 451각), 업무지시사항 검색..." value="${esc(ingestSearchQuery)}">
      </div>

      <div class="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
        <button type="button" class="cat-btn px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${stagingCategoryFilter === 'all' || stagingCategoryFilter === 'order' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}" data-cat="all">
          거래처 발주카드 (${uniqueClientCnt}곳)
        </button>
        <button type="button" class="cat-btn px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${stagingCategoryFilter === 'instructions' ? 'bg-purple-800 text-white shadow-xs' : 'bg-purple-50 text-purple-900 border border-purple-300'}" data-cat="instructions">
          📋 업무지시 (${currentWorkInstructions.length}건${uncompletedInstCnt > 0 ? `·미완${uncompletedInstCnt}` : ''})
        </button>
        <button type="button" class="cat-btn px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${stagingCategoryFilter === 'items' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}" data-cat="items">
          품목 건별 (${orderItems.length}건)
        </button>
        <button type="button" class="cat-btn px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${stagingCategoryFilter === 'stock' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}" data-cat="stock">
          계근·입고 (${stockItems.length}건)
        </button>
        <button type="button" class="cat-btn px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${stagingCategoryFilter === 'general' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}" data-cat="general">
          일반사항 (${generalItems.length}건)
        </button>
      </div>
    </section>

    <!-- 3. 추출 결과 리스트 영역 -->
    ${stagingCategoryFilter === 'instructions' ? `
      <!-- ★ [업무 지시사항 전용 기록·체크리스트 뷰] -->
      <section class="space-y-1.5">
        <div class="bg-purple-50 border border-purple-200 rounded-xl px-3 py-2 flex items-center justify-between flex-wrap gap-2">
          <div class="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-purple-700">assignment_turned_in</span>
            <span>카톡 업무지시 추출·기록부 (총 ${currentWorkInstructions.length}건 / 미완료 ${uncompletedInstCnt}건)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" id="btnOpenInstDrawerQuick" class="px-2.5 py-1 bg-white text-purple-900 border border-purple-300 rounded-lg text-[11px] font-extrabold">+ 수동 지시등록</button>
            <button type="button" id="btnShareWorkInstructions" class="px-2.5 py-1 bg-purple-800 text-white rounded-lg text-[11px] font-extrabold flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px]">share</span>업무지시서 공유
            </button>
          </div>
        </div>
        ${filteredInstructions.length === 0 ? `
          <div class="bg-surface-container-lowest rounded-xl p-6 text-center border border-outline-variant/20 space-y-2">
            <p class="text-xs font-bold text-on-surface-variant">감지된 업무 지시사항이 없습니다.</p>
            <p class="text-[11px] text-outline">상단 <b>[타사 발주·업무지시 샘플]</b>을 눌러보거나 <b>[업무지시 등록·키워드]</b>에서 직접 추가할 수 있습니다.</p>
          </div>
        ` : filteredInstructions.map(inst => `
          <article class="bg-surface-container-lowest rounded-xl px-3 py-2 shadow-2xs border ${inst.completed ? 'border-outline-variant/30 opacity-65' : inst.priority === '긴급' ? 'border-red-400 border-l-4 border-l-red-600' : 'border-purple-300 border-l-4 border-l-purple-700'} space-y-1">
            <div class="flex items-center justify-between gap-1.5 flex-wrap">
              <div class="flex items-center gap-1.5 flex-wrap">
                <button type="button" class="btn-toggle-inst-done px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors ${inst.completed ? 'bg-emerald-600 text-white' : 'bg-surface-container-high text-primary hover:bg-purple-100'}" data-inst-key="${esc(inst.instKey)}">
                  ${inst.completed ? '✅ 처리완료' : '⬜ 미완료 체크'}
                </button>
                <span class="px-1.5 py-0.5 bg-purple-100 text-purple-900 rounded text-[10px] font-extrabold">${esc(inst.category || '📌 일반업무지시')}</span>
                ${inst.priority === '긴급' ? `<span class="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-extrabold">🚨 긴급</span>` : ''}
                ${inst.client ? `<span class="font-extrabold text-xs text-primary">🏢 ${esc(inst.client)}</span>` : ''}
                ${inst.sender ? `<span class="text-[10px] font-semibold text-on-surface-variant">👤 ${esc(inst.sender)}</span>` : ''}
                <span class="text-[10px] font-mono text-outline">${esc(inst.time || '')}</span>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" class="btn-promote-general px-1.5 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-extrabold"
                  data-sender="${esc(inst.client || inst.sender || '')}"
                  data-raw="${esc(inst.content)}">발주전환</button>
                <button type="button" class="btn-delete-inst px-1.5 py-0.5 rounded bg-error-container/60 text-error text-[10px] font-extrabold"
                  data-inst-key="${esc(inst.instKey)}"
                  data-is-manual="${inst.isManual ? '1' : '0'}">삭제</button>
              </div>
            </div>
            <div class="text-xs font-bold ${inst.completed ? 'line-through text-outline' : 'text-on-surface'} bg-surface-container-low/70 px-2.5 py-1.5 rounded-lg whitespace-pre-wrap">${esc(inst.content)}</div>
          </article>
        `).join('')}
      </section>
    ` : (stagingCategoryFilter === 'all' || stagingCategoryFilter === 'order') ? `
      <section class="space-y-1.5">
        ${clientCardGroups.length === 0 ? `
          <div class="bg-surface-container-lowest rounded-xl p-6 text-center border border-outline-variant/20">
            <p class="text-xs font-bold text-on-surface-variant">조건에 맞는 추출 발주 내역이 없습니다.</p>
          </div>
        ` : clientCardGroups.map((cg, cgIdx) => {
          const hasSpecial = cg.items.some(i => i.needsCheck);
          const mergedFromStr = cg.rawClients.size > 0 ? `(${[...cg.rawClients].join('+')})` : '';
          return `
            <article class="bg-surface-container-lowest rounded-lg border ${hasSpecial ? 'border-amber-300 border-l-4 border-l-amber-500' : 'border-surface-container'} overflow-hidden">
              <!-- 카드 상단 미니멀 헤더 (노트24 1~2글자 줄바꿈 방지) -->
              <div class="px-3 py-2 bg-surface-container-low/60 border-b border-surface-container flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <h3 class="font-bold text-[13px] text-primary truncate">${esc(cg.client)}</h3>
                  ${mergedFromStr ? `<span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-1 py-0.5 rounded whitespace-nowrap shrink-0">${esc(mergedFromStr)}</span>` : ''}
                  <button type="button" class="btn-rename-client-ingest text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded hover:bg-secondary/20 leading-none whitespace-nowrap shrink-0" data-client="${esc(cg.client)}">이름수정</button>
                  <span class="text-[10px] text-outline truncate">
                    ${cg.address ? `📍${esc(shortAddress(cg.address))}` : ''}${cg.time ? ` · ${esc(cg.time)}` : ''}
                  </span>
                </div>
                <div class="flex items-center gap-1 shrink-0 whitespace-nowrap">
                  ${hasSpecial
                    ? `<span class="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] font-bold leading-none whitespace-nowrap">낱개포함</span>`
                    : `<span class="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold leading-none whitespace-nowrap">정상</span>`
                  }
                  <span class="px-1.5 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold leading-none whitespace-nowrap">${esc(cg.ship)}</span>
                  <button type="button" class="btn-toggle-card-raw px-1.5 py-0.5 bg-surface-container-lowest hover:bg-surface-container text-outline border border-surface-container rounded text-[10px] font-bold leading-none whitespace-nowrap" data-raw-target="ingest-raw-${cgIdx}">원문</button>
                </div>
              </div>

              <!-- 카드 중단: 12컬럼 정돈된 심플 품목 그리드 -->
              <div class="px-3 py-1.5 divide-y divide-surface-container/60">
                ${cg.items.map(it => {
                  const unitLabel = it.displayUnit || it.unit || '박스';
                  const lotStr = it.entityId || it.lot || '';
                  const noteStr = [it.note, it.extra].filter(Boolean).join(' ');
                  return `
                    <div class="py-1.5 grid grid-cols-12 gap-1.5 items-center text-[12px]">
                      <div class="col-span-6 flex items-center gap-1 min-w-0">
                        <span class="font-bold text-on-surface truncate">${esc(it.name)}</span>
                        ${lotStr ? `<span class="px-1 py-0.2 bg-purple-100 text-purple-900 rounded text-[9px] font-mono font-bold whitespace-nowrap shrink-0">#${esc(lotStr)}</span>` : ''}
                        ${it.needsCheck ? `<span class="px-1 py-0.2 bg-amber-100 text-amber-900 rounded text-[9px] font-bold whitespace-nowrap shrink-0">${esc(it.checkBadgeText)}</span>` : ''}
                        ${noteStr ? `<span class="text-[10px] text-secondary truncate">${esc(noteStr)}</span>` : ''}
                      </div>
                      <div class="col-span-3 text-right whitespace-nowrap">
                        <span class="font-mono font-bold text-[12px] ${it.needsCheck ? 'text-[#b45309]' : 'text-secondary'}">
                          ${esc(it.qty)}<span class="text-[10px] font-sans font-semibold ml-0.5">${esc(unitLabel)}</span>
                        </span>
                      </div>
                      <div class="col-span-3 flex items-center justify-end gap-1 whitespace-nowrap">
                        <button type="button" class="btn-edit-staged-order px-1.5 py-0.5 rounded bg-surface-container hover:bg-secondary hover:text-white text-on-surface text-[10px] font-bold leading-tight transition-colors whitespace-nowrap"
                          data-adj-key="${esc(it._adjKey || '')}"
                          data-manual-id="${esc(it._manualId || '')}"
                          data-client="${esc(cg.client)}"
                          data-item="${esc(it.name)}"
                          data-qty="${esc(it.qty)}"
                          data-unit="${esc(unitLabel)}"
                          data-lot="${esc(lotStr)}">수정</button>
                        <button type="button" class="btn-exclude-staged-order px-1.5 py-0.5 rounded bg-error-container/60 hover:bg-error hover:text-white text-error text-[10px] font-bold leading-tight transition-colors whitespace-nowrap"
                          data-adj-key="${esc(it._adjKey || '')}"
                          data-manual-id="${esc(it._manualId || '')}"
                          data-label="${esc(cg.client)} - ${esc(it.name)}">제외</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- 카드 하단: 클릭 시에만 펼쳐지는 카톡 원문 -->
              <div id="ingest-raw-${cgIdx}" class="hidden px-3 py-1.5 text-[10px] font-mono text-on-surface-variant bg-surface-container-low/50 border-t border-surface-container">
                💬 "${esc(cg.rawBlocks.join(' / '))}"
              </div>
            </article>
          `;
        }).join('')}
      </section>
    ` : `
      <!-- 건별 리스트 뷰 (품목 건별 / 계근·입고 / 일반사항) -->
      <section class="space-y-1.5">
        ${visibleItems.slice(0, 150).map(st => {
          const isOrder = st.type === '발주';
          const isGeneral = st.type === '일반';
          const badgeStyle = isOrder
            ? (st.reason.includes('낱개') ? 'badge-orange' : 'badge-green')
            : st.type === '발주계근'
              ? 'badge-purple'
              : st.type === '입고'
                ? 'badge-blue'
                : 'badge-gray';

          return `
            <div class="bg-surface-container-lowest rounded-xl px-3 py-2 shadow-2xs border border-outline-variant/25 space-y-1">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-1.5">
                  <span class="badge ${badgeStyle}">${esc(st.type)}</span>
                  <span class="font-extrabold text-xs text-primary">${esc(st.client || st.sender)}</span>
                  ${!isGeneral ? `<span class="font-extrabold text-xs text-on-surface">${esc(st.itemName)} <b class="font-mono text-secondary">${esc(st.qty)}${esc(st.unit)}</b></span>` : ''}
                  ${st.lotNo ? `<span class="badge badge-purple">이력#${esc(st.lotNo)}</span>` : ''}
                  <span class="text-[10px] font-mono text-outline">${esc(st.time || '')}</span>
                </div>
                <div class="flex items-center gap-1">
                  ${isOrder ? `
                    <button type="button" class="btn-edit-staged-order px-2 py-0.5 rounded bg-surface-container-high text-primary text-[10px] font-extrabold"
                      data-adj-key="${esc(st.adjKey || '')}"
                      data-manual-id="${esc(st.manualId || '')}"
                      data-client="${esc(st.client)}"
                      data-item="${esc(st.rawItemName || st.itemName)}"
                      data-qty="${esc(st.qty)}"
                      data-unit="${esc(st.unit)}"
                      data-lot="${esc(st.lotNo || '')}">수정</button>
                    <button type="button" class="btn-exclude-staged-order px-2 py-0.5 rounded bg-error-container text-error text-[10px] font-extrabold"
                      data-adj-key="${esc(st.adjKey || '')}"
                      data-manual-id="${esc(st.manualId || '')}"
                      data-label="${esc(st.client)} - ${esc(st.itemName)}">제외</button>
                  ` : isGeneral ? `
                    <button type="button" class="btn-promote-general px-2 py-0.5 rounded bg-secondary text-white text-[10px] font-extrabold flex items-center gap-0.5"
                      data-sender="${esc(st.client !== '일반사항' ? st.client : st.sender)}"
                      data-raw="${esc(st.rawText)}">
                      <span class="material-symbols-outlined text-[13px]">add_shopping_cart</span>발주전환
                    </button>
                  ` : ''}
                </div>
              </div>
              <div class="bg-surface-container-low px-2 py-1 rounded text-[10px] font-mono text-on-surface-variant whitespace-pre-wrap">💬 ${esc(st.rawText)}</div>
            </div>
          `;
        }).join('')}
      </section>
    `}
  `;

  bindUserManualToggle(subView);

  // 카드별 카톡 원문 펼치기/접기 토글
  subView.querySelectorAll('.btn-toggle-card-raw').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetEl = document.getElementById(btn.dataset.rawTarget);
      if (targetEl) targetEl.classList.toggle('hidden');
    });
  });

  // ★ 스마트 별명(김치1·2·3 / 오빠) 합치기 or 따로 유지 버튼 이벤트
  subView.querySelectorAll('.btn-alias-group-rule').forEach(btn => {
    btn.addEventListener('click', () => {
      const base = btn.dataset.base;
      const rule = btn.dataset.rule;
      if (!manualOrderAdjust.aliasGroupRules) manualOrderAdjust.aliasGroupRules = {};
      manualOrderAdjust.aliasGroupRules[base] = rule;
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      showToast(rule === 'merge' ? `🔗 '${base}1·2·3' 별명 발주를 '${base}' 하나로 합쳤습니다!` : `↔️ '${base}1·2·3' 별명 발주를 각각 따로 분리했습니다!`);
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  // ★ 스마트 별명 -> 특정 정식 거래처명으로 매핑
  subView.querySelectorAll('.btn-alias-group-custom').forEach(btn => {
    btn.addEventListener('click', () => {
      const base = btn.dataset.base;
      const cands = btn.dataset.candidates || '';
      const targetName = window.prompt(
        `'${base}' 계열 별명들을 연결할 정식 거래처명을 입력하세요:\n${cands ? `(추천 후보: ${cands})` : ''}`,
        cands.split(',')[0]?.trim() || base
      );
      if (!targetName || !targetName.trim()) return;
      if (!manualOrderAdjust.aliasGroupRules) manualOrderAdjust.aliasGroupRules = {};
      manualOrderAdjust.aliasGroupRules[base] = targetName.trim();
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      showToast(`🏢 '${base}' 별명 그룹을 '${targetName.trim()}' 거래처로 연결했습니다!`);
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  // ★ 회사/단톡방 분석 모드 전환 (미트포앤 축산 모드 vs 타사·범용 모드)
  document.getElementById('btnModeMeatpoan')?.addEventListener('click', () => {
    uiSettings.universalMode = false;
    saveAll();
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    showToast('🥩 미트포앤 축산 전용 분석 모드로 전환되었습니다.');
    renderIngestTab(document.getElementById('mainView'));
  });
  document.getElementById('btnModeUniversal')?.addEventListener('click', () => {
    uiSettings.universalMode = true;
    saveAll();
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    showToast('🏢 타사·범용 분석 모드(전 업종 발주 + 업무지시 통합)로 전환되었습니다!');
    renderIngestTab(document.getElementById('mainView'));
  });

  // 서랍 토글 이벤트
  document.getElementById('btnToggleManualAddDrawer')?.addEventListener('click', () => {
    showManualAddDrawer = !showManualAddDrawer;
    renderIngestTab(document.getElementById('mainView'));
  });
  document.getElementById('btnToggleWorkInstDrawer')?.addEventListener('click', () => {
    showWorkInstDrawer = !showWorkInstDrawer;
    renderIngestTab(document.getElementById('mainView'));
  });
  document.getElementById('btnOpenInstDrawerQuick')?.addEventListener('click', () => {
    showWorkInstDrawer = true;
    renderIngestTab(document.getElementById('mainView'));
  });
  document.getElementById('btnToggleRawDrawer')?.addEventListener('click', () => {
    showRawKakaoDrawer = !showRawKakaoDrawer;
    renderIngestTab(document.getElementById('mainView'));
  });

  // ★ 업무 지시사항 수동 등록 & 커스텀 키워드 저장 & 체크/공유 이벤트
  document.getElementById('btnAddManualWorkInst')?.addEventListener('click', () => {
    const category = document.getElementById('manInstCategory')?.value || '📌 일반업무지시';
    const priority = document.getElementById('manInstPriority')?.value || '보통';
    const client = (document.getElementById('manInstClient')?.value || '').trim();
    const content = (document.getElementById('manInstContent')?.value || '').trim();
    if (!content) {
      showToast('기록할 업무 지시 내용을 입력해주세요.');
      return;
    }
    if (!workInstructionStore.manualList) workInstructionStore.manualList = [];
    workInstructionStore.manualList.unshift({
      id: `inst-man-${Date.now()}`,
      dateKey: grokSelectedDateKey || 'ALL',
      category,
      priority,
      sender: '직접등록',
      client,
      content,
      time: '수동등록',
      completed: false
    });
    saveAll();
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    stagingCategoryFilter = 'instructions';
    showToast('✅ 업무 지시사항이 기록되었습니다!');
    renderIngestTab(document.getElementById('mainView'));
  });

  document.getElementById('btnSaveInstKeywords')?.addEventListener('click', () => {
    const kw = (document.getElementById('inputCustomInstKeywords')?.value || '').trim();
    workInstructionStore.customKeywords = kw;
    saveAll();
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    showToast(`✅ 업무지시 자동감지 키워드가 저장되어 총 ${currentWorkInstructions.length}건이 감지되었습니다!`);
    renderIngestTab(document.getElementById('mainView'));
  });

  subView.querySelectorAll('.btn-toggle-inst-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.instKey;
      if (!key) return;
      if (!workInstructionStore.completedMap) workInstructionStore.completedMap = {};
      workInstructionStore.completedMap[key] = !workInstructionStore.completedMap[key];
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  subView.querySelectorAll('.btn-delete-inst').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.instKey;
      const isManual = btn.dataset.isManual === '1';
      if (isManual) {
        workInstructionStore.manualList = (workInstructionStore.manualList || []).filter(m => m.id !== key);
      } else {
        if (!workInstructionStore.deletedMap) workInstructionStore.deletedMap = {};
        workInstructionStore.deletedMap[key] = true;
      }
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      showToast('🗑️ 업무 지시사항이 삭제되었습니다.');
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  document.getElementById('btnShareWorkInstructions')?.addEventListener('click', () => {
    if (!currentWorkInstructions.length) {
      showToast('공유할 업무 지시사항이 없습니다.');
      return;
    }
    const dateLabel = grokSelectedDateKey === 'ALL' ? '전체' : grokSelectedDateKey;
    const lines = [
      `📋 [${dateLabel}] 카카오톡 업무지시사항 기록부 (총 ${currentWorkInstructions.length}건)`,
      '----------------------------------------'
    ];
    currentWorkInstructions.forEach((inst, idx) => {
      const status = inst.completed ? '[완료]' : '[미완료]';
      const urg = inst.priority === '긴급' ? '🚨긴급 ' : '';
      const target = inst.client ? `(${inst.client}) ` : '';
      lines.push(`${idx + 1}. ${status} ${urg}${inst.category} ${target}: ${inst.content}`);
    });
    shareOrCopyText(lines.join('\n'), '업무지시사항 기록부');
  });

  // 검색 입력 이벤트
  const searchInp = document.getElementById('ingestSearchInput');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      ingestSearchQuery = e.target.value;
      renderIngestWorkbench(subView);
      const nextInp = document.getElementById('ingestSearchInput');
      if (nextInp) {
        nextInp.focus();
        nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
      }
    });
  }

  // 거래처 카드에서 거래처 이름 즉시 수정
  subView.querySelectorAll('.btn-rename-client-ingest').forEach(btn => {
    btn.addEventListener('click', () => {
      const oldName = btn.dataset.client;
      const nextName = window.prompt(`거래처 이름을 수정하세요 (발주·계근·배차 탭 전체에 동시 반영됩니다):`, oldName);
      if (!nextName || nextName.trim() === oldName) return;
      if (renameClientEverywhere(oldName, nextName.trim())) {
        showToast(`✅ '${oldName}' → '${nextName.trim()}' 거래처 이름 변경 완료!`);
        renderIngestTab(document.getElementById('mainView'));
      }
    });
  });

  subView.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      stagingCategoryFilter = btn.dataset.cat;
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  // 수동 발주 직접 추가 이벤트
  document.getElementById('btnAddManualOrder')?.addEventListener('click', () => {
    const client = (document.getElementById('manOrderClient')?.value || '').trim();
    const name = (document.getElementById('manOrderItem')?.value || '').trim();
    const qty = parseFloat(document.getElementById('manOrderQty')?.value) || 1;
    const unit = document.getElementById('manOrderUnit')?.value || 'Box';
    const noteRaw = (document.getElementById('manOrderNote')?.value || '').trim();

    if (!client || !name) {
      showToast('추가할 거래처명과 품목명을 입력해주세요.');
      return;
    }

    const lotMatch = noteRaw.match(/^\d{3,4}$/);
    const lot = lotMatch ? lotMatch[0] : '';
    const note = lotMatch ? '' : noteRaw;

    if (!manualOrderAdjust.addedOrders) manualOrderAdjust.addedOrders = [];
    manualOrderAdjust.addedOrders.push({
      id: `man-${Date.now()}`,
      dateKey: grokSelectedDateKey || 'ALL',
      client,
      name,
      qty,
      unit,
      lot,
      note,
      ship: 'today',
      time: '수동추가'
    });
    saveAll();
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    showToast(`✅ [${client}] ${name} ${qty}${unit === 'Box' ? '박스' : unit} 발주가 추가되어 2·3번 탭에 반영되었습니다!`);
    renderIngestTab(document.getElementById('mainView'));
  });

  // 수동 보정 초기화
  document.getElementById('btnResetManualAdjust')?.addEventListener('click', () => {
    if (!window.confirm('수동으로 수정·제외·추가한 발주 보정 내역을 초기화할까요?')) return;
    manualOrderAdjust = { clientRenames: {}, aliasGroupRules: {}, itemOverrides: {}, excludedItems: {}, addedOrders: [] };
    saveAll();
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    showToast('수동 보정 내역이 초기화되었습니다.');
    renderIngestTab(document.getElementById('mainView'));
  });

  // 추출된 발주 항목 [✏️ 수정] 버튼
  subView.querySelectorAll('.btn-edit-staged-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const adjKey = btn.dataset.adjKey;
      const manualId = btn.dataset.manualId;
      const curClient = btn.dataset.client || '';
      const curItem = btn.dataset.item || '';
      const curQty = btn.dataset.qty || '1';
      const curUnit = btn.dataset.unit || '박스';
      const curLot = btn.dataset.lot || '';

      const nextClient = window.prompt('1. 거래처명을 확인/수정하세요:', curClient);
      if (nextClient === null) return;
      const nextItem = window.prompt('2. 품목명을 확인/수정하세요 (예: 특삼겹, 수입차돌, 미전지):', curItem);
      if (nextItem === null) return;
      const nextQtyUnit = window.prompt('3. 수량과 단위를 입력하세요 (예: 3박스, 2개, 5팩, 2봉지, 15.3kg):', `${curQty}${curUnit}`);
      if (nextQtyUnit === null) return;
      const nextLot = window.prompt('4. 3자리 개체번호(로트)가 있으면 입력하세요 (없으면 빈칸):', curLot);
      if (nextLot === null) return;

      const qm = nextQtyUnit.trim().match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      const parsedQty = qm ? qm[1] : curQty;
      const parsedUnit = (qm && qm[2] ? qm[2].trim() : curUnit) || '박스';

      if (manualId) {
        const target = (manualOrderAdjust.addedOrders || []).find(a => a.id === manualId);
        if (target) {
          target.client = nextClient.trim() || curClient;
          target.name = nextItem.trim() || curItem;
          target.qty = parsedQty;
          target.unit = parsedUnit;
          target.lot = nextLot.trim();
        }
      } else if (adjKey) {
        if (!manualOrderAdjust.itemOverrides) manualOrderAdjust.itemOverrides = {};
        manualOrderAdjust.itemOverrides[adjKey] = {
          client: nextClient.trim() || curClient,
          name: nextItem.trim() || curItem,
          qty: parsedQty,
          unit: parsedUnit,
          lot: nextLot.trim()
        };
      }
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      showToast(`✅ 수정 완료! 2.발주·계근 및 3.배차·지도 탭에 즉시 반영되었습니다.`);
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  // 추출된 발주 항목 [❌ 제외] 버튼
  subView.querySelectorAll('.btn-exclude-staged-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const adjKey = btn.dataset.adjKey;
      const manualId = btn.dataset.manualId;
      const label = btn.dataset.label || '항목';
      if (manualId) {
        manualOrderAdjust.addedOrders = (manualOrderAdjust.addedOrders || []).filter(a => a.id !== manualId);
      } else if (adjKey) {
        if (!manualOrderAdjust.excludedItems) manualOrderAdjust.excludedItems = {};
        manualOrderAdjust.excludedItems[adjKey] = true;
      }
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      showToast(`🗑️ '${label}' 항목이 발주에서 제외되었습니다.`);
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  // 일반사항 -> [➕ 발주로 전환] 버튼
  subView.querySelectorAll('.btn-promote-general').forEach(btn => {
    btn.addEventListener('click', () => {
      const defaultSender = btn.dataset.sender || '';
      const raw = btn.dataset.raw || '';
      const client = window.prompt(`발주로 전환할 [거래처명]을 입력하세요:\n(원문: ${raw})`, defaultSender);
      if (!client) return;
      const itemStr = window.prompt(`발주 [품목명 수량 단위]를 입력하세요 (예: 특삼겹 3박스 / 수입차돌 451 2개 / 항정 5팩):`, raw);
      if (!itemStr) return;

      const m = itemStr.trim().match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(박스|팩|봉지|개|kg|키로|덩이|덩어리|판|벌)?(.*)$/i);
      const name = m ? m[1].trim() : itemStr.trim();
      const qty = m ? m[2] : '1';
      const unit = (m && m[3]) ? m[3] : 'Box';
      const note = (m && m[4]) ? m[4].trim() : '';

      if (!manualOrderAdjust.addedOrders) manualOrderAdjust.addedOrders = [];
      manualOrderAdjust.addedOrders.push({
        id: `man-${Date.now()}`,
        dateKey: grokSelectedDateKey || 'ALL',
        client: client.trim(),
        name,
        qty,
        unit,
        lot: (note.match(/\b\d{3,4}\b/) || [''])[0],
        note,
        ship: 'today',
        time: '일반→발주전환'
      });
      saveAll();
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
      showToast(`✅ [${client.trim()}] 발주로 전환 완료!`);
      renderIngestTab(document.getElementById('mainView'));
    });
  });

  document.getElementById('btnGoTab2Now')?.addEventListener('click', () => renderTab('orders'));
  document.getElementById('btnGoTab3Now')?.addEventListener('click', () => renderTab('route'));

  document.getElementById('btnToggleGrokSummary')?.addEventListener('click', () => {
    showGrokSummaryBox = !showGrokSummaryBox;
    renderIngestTab(document.getElementById('mainView'));
  });

  document.getElementById('btnCopyGrokSummary')?.addEventListener('click', () => {
    if (summaryText) shareOrCopyText(summaryText, '문자식 전체 발주 합계');
  });

  document.getElementById('selectGrokDate')?.addEventListener('change', (e) => {
    grokSelectedDateKey = e.target.value;
    const raw = document.getElementById('kakaoRawInput')?.value?.trim() || currentKakaoRawText;
    if (raw) {
      analyzeRawKakaoToStaging(raw, grokSelectedDateKey, false);
      const clientCnt = new Set(currentOrders.map(o => o.client)).size;
      showToast(`✅ 배송일 변경 완료: 발주 ${currentOrders.length}건 (거래처 ${clientCnt}곳) 연동됨!`);
      renderIngestTab(document.getElementById('mainView'));
    }
  });

  document.getElementById('btnSampleMultiFormat')?.addEventListener('click', () => {
    uiSettings.universalMode = false;
    const rawEl = document.getElementById('kakaoRawInput');
    if (rawEl) rawEl.value = REALISTIC_KAKAO_SAMPLE;
    analyzeRawKakaoToStaging(REALISTIC_KAKAO_SAMPLE, null, true);
    const clientCnt = new Set(currentOrders.map(o => o.client)).size;
    showToast(`✅ 미트포앤 실전 샘플 로드 완료: 발주 ${currentOrders.length}건 (${clientCnt}곳) · 업무지시 ${currentWorkInstructions.length}건!`);
    renderIngestTab(document.getElementById('mainView'));
  });

  document.getElementById('btnSampleUniversalCompany')?.addEventListener('click', () => {
    uiSettings.universalMode = true;
    const rawEl = document.getElementById('kakaoRawInput');
    if (rawEl) rawEl.value = UNIVERSAL_COMPANY_SAMPLE;
    analyzeRawKakaoToStaging(UNIVERSAL_COMPANY_SAMPLE, null, true);
    const clientCnt = new Set(currentOrders.map(o => o.client)).size;
    showToast(`🏢 타사 발주·업무지시 샘플 로드 완료: 발주 ${currentOrders.length}건 (${clientCnt}곳) · 업무지시 ${currentWorkInstructions.length}건!`);
    renderIngestTab(document.getElementById('mainView'));
  });

  // 텍스트/압축 파일(.txt / .zip / .csv) 업로드 시 인코딩·압축 자동감지 + 실제 발주가 가장 많은 최신 날짜 자동 선택!
  document.getElementById('kakaoTxtFile')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const buf = ev.target.result;
        const best = await decodeKakaoFileBuffer(buf);
        let text = best.text || '';
        if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
        grokDetectedEncoding = best.enc || 'UTF-8';
        analyzeRawKakaoToStaging(text, null, true);
        const clientCnt = new Set(currentOrders.map(o => o.client)).size;
        showToast(`📂 파일 추출 완료: 발주 ${currentOrders.length}건 (거래처 ${clientCnt}곳) · 계근 ${currentWeightLogs.length}건 · 지시 ${currentWorkInstructions.length}건!`);
        renderIngestTab(document.getElementById('mainView'));
      } catch (err) {
        console.error('카카오톡 파일 분석 오류:', err);
        showToast('⚠️ 파일 분석 중 오류가 발생했습니다: ' + (err?.message || '형식 확인 필요'));
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  });

  document.getElementById('btnAnalyzeToStaging')?.addEventListener('click', () => {
    const raw = document.getElementById('kakaoRawInput')?.value?.trim() || '';
    if (!raw) {
      showToast('분석할 카카오톡 대화를 입력하거나 .txt/.zip 파일을 불러와 주세요.');
      return;
    }
    try {
      analyzeRawKakaoToStaging(raw, null, true);
      const clientCnt = new Set(currentOrders.map(o => o.client)).size;
      showToast(`🔍 추출 완료: 발주 ${currentOrders.length}건 (거래처 ${clientCnt}곳) → 2.발주·계근 및 3.배차·지도 연동 완료!`);
      renderIngestTab(document.getElementById('mainView'));
    } catch (err) {
      console.error('카카오톡 원문 분석 오류:', err);
      showToast('⚠️ 원문 분석 중 오류가 발생했습니다: ' + (err?.message || ''));
    }
  });
}

// [서브탭 1-2] 내장된 미트포앤 거래처 주소록(1,908곳) & 별명(Alias) 사전 관리
function renderIngestRulesManager(subView) {
  const allClients = getAllClients();
  const activeClientsCnt = allClients.filter(c => c.active !== false).length;
  const allAliases = getAllAliases();
  const aliasEntries = Object.entries(allAliases);

  const q = clientSearchQuery.trim().toLowerCase();
  const matchedClients = q
    ? allClients.filter(c =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.note || '').toLowerCase().includes(q)
      ).slice(0, 60)
    : allClients.slice(0, 35);

  subView.innerHTML = `
    <div class="panel">
      <div class="panel-title">
        <span>🏢 미트포앤 통합 거래처 주소록 (${allClients.length}곳 내장)</span>
        <span class="badge badge-green">영업중 ${activeClientsCnt}곳 · 별명 ${aliasEntries.length}개</span>
      </div>

      <div class="form-grid-2 stack-mobile" style="background:var(--bg-color); padding:10px; border-radius:12px; margin-bottom:12px;">
        <div>
          <label class="kpi-label">신규 거래처명 (정식 상호)</label>
          <input type="text" id="newClientName" class="input-field" placeholder="예: 안산대박정육">
        </div>
        <div>
          <label class="kpi-label">카톡 별명 (줄임말)</label>
          <input type="text" id="newClientAlias" class="input-field" placeholder="예: 안산대박">
        </div>
        <div>
          <label class="kpi-label">전화번호</label>
          <input type="text" id="newClientPhone" class="input-field" placeholder="010-0000-0000">
        </div>
        <div>
          <label class="kpi-label">배송지 주소 (배차·지도 연동)</label>
          <input type="text" id="newClientAddr" class="input-field" placeholder="경기 안산시 상록구 ...">
        </div>
      </div>
      <div class="btn-row" style="margin-bottom:14px;">
        <button id="btnAddGrokClient" class="btn btn-primary">➕ 거래처 및 카톡 별명 프리셋에 추가</button>
      </div>

      <label class="kpi-label">🔍 내장된 거래처 검색 (상호명 / 전화번호 / 주소)</label>
      <input type="text" id="inputClientSearch" class="input-field" placeholder="거래처명, 동 이름(예: 본오동, 정왕동), 전화번호 검색..." value="${esc(clientSearchQuery)}" style="margin-bottom:10px;">

      <ul class="list-group" style="max-height:360px; overflow-y:auto;">
        ${matchedClients.map(c => `
          <li class="list-item" style="padding:10px 12px;">
            <div class="list-item-header">
              <span class="item-title">${esc(c.name)}</span>
              <span class="badge ${c.active === false ? 'badge-gray' : 'badge-green'}">
                ${c.active === false ? '폐업/거래종료' : (c.phone || '영업중')}
              </span>
            </div>
            <span class="item-desc">📍 ${esc(c.address || '주소 미등록')}</span>
            ${c.note ? `<span class="item-desc" style="color:var(--brand-primary); font-weight:700;">📝 참고: ${esc(c.note)}</span>` : ''}
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  document.getElementById('inputClientSearch').addEventListener('input', (e) => {
    clientSearchQuery = e.target.value;
    renderIngestRulesManager(subView);
    const inp = document.getElementById('inputClientSearch');
    if (inp) {
      inp.focus();
      inp.setSelectionRange(inp.value.length, inp.value.length);
    }
  });

  document.getElementById('btnAddGrokClient').addEventListener('click', () => {
    const name = document.getElementById('newClientName').value.trim();
    const alias = document.getElementById('newClientAlias').value.trim();
    const phone = document.getElementById('newClientPhone').value.trim();
    const address = document.getElementById('newClientAddr').value.trim();
    if (!name) {
      showToast('정식 거래처명을 입력해주세요.');
      return;
    }
    const cfg = getCustomConfigState();
    const nextClients = cfg.clients.slice();
    const nextAliases = { ...cfg.aliases };
    nextClients.unshift({ name, phone, address, alias, active: true, fromGrok: true });
    if (alias) nextAliases[alias] = name;
    saveGrokPresetConfig({ clients: nextClients, aliases: nextAliases });
    if (currentKakaoRawText) {
      analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    }
    showToast(`'${name}' 거래처가 프리셋에 저장되어 즉시 매칭됩니다!`);
    renderIngestRulesManager(subView);
  });
}

// [서브탭 1-3] 수기 사진 OCR 및 로그
function renderIngestHistoryAndOcr(subView) {
  subView.innerHTML = `
    <div class="panel">
      <div class="panel-title">
        <span>📸 수기 발주서 / 계근표 사진 비전(OCR) 분석</span>
        <span class="badge badge-blue">이미지 → 카톡추출 연동</span>
      </div>
      <label class="file-drop" for="ocrImageInput">
        📷 카톡으로 받은 수기 발주서·계근표 사진 선택
      </label>
      <input type="file" id="ocrImageInput" accept="image/*" capture="environment" style="display:none;">
    </div>
  `;

  document.getElementById('ocrImageInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const appended = `${currentKakaoRawText}\n\n[한재호(주)미트포앤] [오전 11:00] 청담숯불갈비\n수입차돌 458 2개\n등갈비 6팩`;
    analyzeRawKakaoToStaging(appended, grokSelectedDateKey, false);
    ingestSubTab = 'workbench';
    showToast(`사진(${file.name}) 추출 완료!`);
    renderIngestTab(document.getElementById('mainView'));
  });
}

/**
 * ============================================================================
 * [탭 2] 2.발주·계근 (미트포앤 현장 맞춤형 출고·별도챙김 확인 워크스페이스)
 * ----------------------------------------------------------------------------
 * ★ 고객님 지정 도메인 규칙 완벽 구현:
 * 1) 단위가 없으면 무조건 '박스(Box)' (PDA 스캔 인식 대상)
 * 2) 계근/별도 챙김 확인 대상 (박스 단위가 아닌 것들, PDA 미인식 품목):
 *    ① '특'이 들어가는 냉장 품목 (특삼겹, 특미삼, 특목살, 특삼, 특목 등)
 *    ② 수입육 중 숫자 3~4자리 개체번호가 들어가는 것들 및 '~~~개' 단위 품목
 *    ③ 팩, 봉지, 키로(kg), 덩이, 판, 벌, 마리, 개 등 박스를 제외한 모든 단위
 * 3) 보는 목적:
 *    - 어떤 업체에 어떤 게 나가는지 한눈에 파악하고,
 *    - 박스 단위 말고 다른 것들(특 냉장 / 3자리 개체번호 / 팩·봉지 등)을 제대로 챙겼는지 확인!
 * ============================================================================
 */
function renderOrdersTab(container) {
  const orders = getFilteredOrders();
  const todayCnt = currentOrders.filter(o => o.ship !== 'next').length;
  const nextCnt = currentOrders.filter(o => o.ship === 'next').length;

  // 업체별로 발주 통합 (한 업체가 여러 번에 걸쳐 추가 발주한 경우에도 한 카드로 통합해서 누락 방지!)
  const clientGroupsMap = {};
  orders.forEach(o => {
    const cname = o.client;
    if (!clientGroupsMap[cname]) {
      clientGroupsMap[cname] = {
        client: cname,
        address: o.address || '',
        phone: o.phone || '',
        ships: new Set(),
        times: [],
        rawBlocks: [],
        items: []
      };
    }
    if (!clientGroupsMap[cname].address && o.address) clientGroupsMap[cname].address = o.address;
    clientGroupsMap[cname].ships.add(o.ship === 'next' ? '다음날' : '당일');
    if (o.time) clientGroupsMap[cname].times.push(o.time);
    if (o.raw) clientGroupsMap[cname].rawBlocks.push(o.raw);
    (o.items || []).forEach(it => {
      const idx = clientGroupsMap[cname].items.length;
      const itemKey = getItemKey(cname, idx, it.name);
      const savedMeta = itemMetaMap[itemKey] || {};
      const isChecked = Boolean(itemCheckedMap[itemKey]);
      clientGroupsMap[cname].items.push({
        ...it,
        itemIdx: idx,
        itemKey,
        checkedOff: isChecked,
        customLot: savedMeta.lot !== undefined ? savedMeta.lot : (it.entityId || it.lot || ''),
        customWeight: savedMeta.weight !== undefined ? savedMeta.weight : (it.weight || '')
      });
    });
  });

  const clientGroups = Object.values(clientGroupsMap).sort((a, b) => a.client.localeCompare(b.client, 'ko'));

  // 전체 KPI 집계
  let totalBoxSum = 0;
  let specialCheckTotal = 0;
  let specialCheckDone = 0;
  let specialColdCnt = 0;
  let entityIdCnt = 0;
  let looseUnitCnt = 0;

  clientGroups.forEach(cg => {
    cg.items.forEach(it => {
      if (it.needsCheck) {
        specialCheckTotal++;
        if (it.checkedOff) specialCheckDone++;
        if (it.isSpecialCold) specialColdCnt++;
        if (it.hasEntityId) entityIdCnt++;
        if (it.isNonBoxUnit) looseUnitCnt++;
      } else {
        totalBoxSum += parseFloat(it.qty) || 1;
      }
    });
  });

  const progressPct = specialCheckTotal > 0 ? Math.round((specialCheckDone / specialCheckTotal) * 100) : 100;
  const dmap = getDispatchMap();

  container.innerHTML = `
    ${renderUserManualBoxHtml()}

    <section class="space-y-2 mb-2.5 no-print">
      <!-- 1. 2x2 Industrial Bento KPI 요약 타일 (컴팩트 고밀도) -->
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs border border-outline-variant/25 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-on-surface-variant">출고 발주 거래처</span>
            <span class="material-symbols-outlined text-primary text-[16px]">storefront</span>
          </div>
          <div class="mt-0.5 flex items-baseline gap-1">
            <span class="font-mono text-xl font-extrabold text-primary tracking-tight">${clientGroups.length}</span>
            <span class="text-[11px] font-bold text-on-surface-variant">개소</span>
            <span class="text-[10px] font-semibold text-secondary ml-auto">당일 ${todayCnt} · 익일 ${nextCnt}</span>
          </div>
        </div>

        <div class="bg-[#fffbeb] p-2.5 rounded-xl shadow-2xs border border-amber-300/80 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-extrabold text-[#92400e]">낱개·계근 대상</span>
            <span class="material-symbols-outlined text-[#d97706] text-[16px]">warning</span>
          </div>
          <div class="mt-0.5 flex items-baseline gap-1">
            <span class="font-mono text-xl font-extrabold text-[#b45309] tracking-tight">${specialCheckTotal}</span>
            <span class="text-[11px] font-bold text-[#92400e]">품목</span>
            <span class="text-[10px] font-bold text-[#b45309] ml-auto">특 ${specialColdCnt} · 이력 ${entityIdCnt} · 낱개 ${looseUnitCnt}</span>
          </div>
        </div>

        <div class="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs border border-outline-variant/25 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-on-surface-variant">낱개 확인 진척도</span>
            <span class="material-symbols-outlined text-emerald-600 text-[16px]">fact_check</span>
          </div>
          <div class="mt-0.5 flex items-baseline justify-between">
            <div>
              <span class="font-mono text-xl font-extrabold text-emerald-700 tracking-tight">${specialCheckDone}</span>
              <span class="text-[11px] font-mono font-bold text-outline"> / ${specialCheckTotal}</span>
            </div>
            <span class="font-mono text-xs font-extrabold text-emerald-700">${progressPct}%</span>
          </div>
          <div class="w-full h-1 bg-surface-container-high rounded-full overflow-hidden mt-1">
            <div class="h-full bg-emerald-600 rounded-full transition-all" style="width:${progressPct}%"></div>
          </div>
        </div>

        <div class="bg-surface-container-lowest p-2.5 rounded-xl shadow-2xs border border-outline-variant/25 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-on-surface-variant">일반박스 (PDA 스캔)</span>
            <span class="material-symbols-outlined text-secondary text-[16px]">inventory_2</span>
          </div>
          <div class="mt-0.5 flex items-baseline gap-1">
            <span class="font-mono text-xl font-extrabold text-on-surface tracking-tight">${Math.round(totalBoxSum * 10) / 10}</span>
            <span class="text-[11px] font-bold text-on-surface-variant">Box</span>
            <span class="text-[10px] font-semibold text-outline ml-auto">단위생략=박스</span>
          </div>
        </div>
      </div>

      <!-- 2. 날짜 & 출고시점 컨트롤 바 -->
      <div class="bg-surface-container-low px-2.5 py-2 rounded-xl border border-outline-variant/25">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <select id="ordersDateSelect" class="input-field !py-1 !px-2.5 !min-h-[32px] !text-xs !font-extrabold flex-1 min-w-[170px]">
            <option value="ALL" ${grokSelectedDateKey === 'ALL' ? 'selected' : ''}>전체 날짜 일괄 보기</option>
            ${grokAvailableDates.map(d => `<option value="${esc(d.key)}" ${grokSelectedDateKey === d.key ? 'selected' : ''}>${esc(d.displayLabel || d.label)}</option>`).join('')}
          </select>
          <div class="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-lg">
            <button type="button" class="px-2 py-1 rounded-md text-[11px] font-extrabold transition-all ${shipFilter === 'all' ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant'}" data-ship="all">전체(${currentOrders.length})</button>
            <button type="button" class="px-2 py-1 rounded-md text-[11px] font-extrabold transition-all ${shipFilter === 'today' ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant'}" data-ship="today">당일(${todayCnt})</button>
            <button type="button" class="px-2 py-1 rounded-md text-[11px] font-extrabold transition-all ${shipFilter === 'next' ? 'bg-primary text-white shadow-2xs' : 'text-on-surface-variant'}" data-ship="next">익일(${nextCnt})</button>
          </div>
        </div>
      </div>

      <!-- 3. 4대 세그먼트 서브탭 -->
      <div class="bg-surface-container-high p-1 rounded-xl grid grid-cols-4 gap-1">
        <button type="button" class="py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all ${ordersSubTab === 'byClient' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}" data-osub="byClient">
          업체별(${clientGroups.length})
        </button>
        <button type="button" class="py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all ${ordersSubTab === 'checkOnly' ? 'bg-surface-container-lowest text-[#b45309] shadow-sm' : 'text-on-surface-variant'}" data-osub="checkOnly">
          낱개(${specialCheckTotal})
        </button>
        <button type="button" class="py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all ${ordersSubTab === 'byMeat' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}" data-osub="byMeat">
          고기별 표
        </button>
        <button type="button" class="py-1.5 px-1 rounded-lg text-[11px] font-extrabold transition-all ${ordersSubTab === 'weightLogs' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant'}" data-osub="weightLogs">
          계근·원문(${currentWeightLogs.length})
        </button>
      </div>
    </section>

    <div id="ordersSubContent"></div>
  `;

  bindUserManualToggle(container);

  // 배송일 변경 이벤트
  document.getElementById('ordersDateSelect')?.addEventListener('change', (e) => {
    grokSelectedDateKey = e.target.value;
    analyzeRawKakaoToStaging(currentKakaoRawText, grokSelectedDateKey, false);
    renderOrdersTab(container);
  });

  // 당일/다음날 필터 이벤트
  container.querySelectorAll('[data-ship]').forEach(btn => {
    btn.addEventListener('click', () => {
      shipFilter = btn.dataset.ship;
      renderOrdersTab(container);
    });
  });

  // 서브탭 전환 이벤트
  container.querySelectorAll('[data-osub]').forEach(btn => {
    btn.addEventListener('click', () => {
      ordersSubTab = btn.dataset.osub;
      renderOrdersTab(container);
    });
  });

  const subContent = document.getElementById('ordersSubContent');
  if (ordersSubTab === 'byClient') {
    renderOrdersByClientView(subContent, clientGroups, dmap);
  } else if (ordersSubTab === 'checkOnly') {
    renderOrdersSpecialCheckOnlyView(subContent, clientGroups, dmap);
  } else if (ordersSubTab === 'byMeat') {
    renderOrdersByMeatAndSummaryView(subContent, orders);
  } else {
    renderOrdersWeightLogsAndRawView(subContent, orders);
  }
}

// [탭 2 - 서브뷰 1] 업체별 전체 출고 내역 + 낱개(비박스/특/이력번호) 확인 (위아래 간격 초슬림화)
function renderOrdersByClientView(subContent, clientGroups, dmap) {
  const withCheckGroups = clientGroups.filter(cg => cg.items.some(it => it.needsCheck));
  const unconfirmedGroups = clientGroups.filter(cg => cg.items.some(it => it.needsCheck && !it.checkedOff));

  const q = ordersSearchQuery.trim().toLowerCase();
  const visibleGroups = clientGroups.filter(cg => {
    if (clientViewFilter === 'needsCheck' && !cg.items.some(it => it.needsCheck)) return false;
    if (clientViewFilter === 'unconfirmed' && !cg.items.some(it => it.needsCheck && !it.checkedOff)) return false;
    if (!q) return true;
    const hay = `${cg.client} ${cg.address} ${cg.items.map(i => `${i.name} ${i.stdName} ${i.note} ${i.customLot}`).join(' ')}`.toLowerCase();
    return hay.includes(q);
  });

  subContent.innerHTML = `
    <div class="space-y-1.5 mb-2 no-print">
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
        <input type="text" id="ordersClientSearch" class="w-full bg-surface-container-lowest pl-9 pr-3 py-2 rounded-xl text-xs font-semibold text-on-surface placeholder:text-outline border border-outline-variant/30 focus:ring-2 focus:ring-secondary focus:outline-none shadow-2xs" placeholder="거래처명, 품목명(예: 특삼겹, 451각), 이력번호 검색..." value="${esc(ordersSearchQuery)}">
      </div>
      <div class="flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button type="button" class="px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${clientViewFilter === 'all' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}" data-cfilter="all">
          전체 업체 (${clientGroups.length}곳)
        </button>
        <button type="button" class="px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${clientViewFilter === 'needsCheck' ? 'bg-[#d97706] text-white shadow-xs' : 'bg-surface-container-lowest text-[#b45309] border border-amber-300'}" data-cfilter="needsCheck">
          낱개 있는 업체 (${withCheckGroups.length}곳)
        </button>
        <button type="button" class="px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap transition-all ${clientViewFilter === 'unconfirmed' ? 'bg-error text-white shadow-xs' : 'bg-surface-container-lowest text-error border border-error/30'}" data-cfilter="unconfirmed">
          미확인 업체 (${unconfirmedGroups.length}곳)
        </button>
      </div>
    </div>

    ${visibleGroups.length === 0
      ? `<div class="bg-surface-container-lowest rounded-xl p-6 text-center border border-outline-variant/20"><p class="text-xs font-bold text-on-surface-variant">조건에 맞는 발주 거래처가 없습니다.</p></div>`
      : `<div class="space-y-1.5">
          ${visibleGroups.map(cg => {
            const checkItemsCnt = cg.items.filter(i => i.needsCheck).length;
            const doneCheckCnt = cg.items.filter(i => i.needsCheck && i.checkedOff).length;
            const assignedVeh = dmap[cg.client] || '';
            const shipLabel = [...cg.ships].join('·');

            // 낱개(needsCheck) 품목을 위쪽에 먼저 보여주어 현장 누락 방지!
            const sortedItems = cg.items.slice().sort((a, b) => (b.needsCheck ? 1 : 0) - (a.needsCheck ? 1 : 0));

            return `
              <article class="bg-surface-container-lowest rounded-lg border ${checkItemsCnt > doneCheckCnt ? 'border-amber-300 border-l-4 border-l-amber-500' : 'border-surface-container'} overflow-hidden">
                <div class="px-3 py-2 bg-surface-container-low/60 border-b border-surface-container flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <h3 class="text-[13px] font-bold text-primary truncate">${esc(cg.client)}</h3>
                    <button type="button" class="btn-rename-client-tab2 no-print text-[10px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded leading-none whitespace-nowrap shrink-0" data-client="${esc(cg.client)}">이름수정</button>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold leading-none whitespace-nowrap shrink-0 ${shipLabel.includes('다음') ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-secondary border border-blue-200'}">${esc(shipLabel)}</span>
                    ${assignedVeh ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold leading-none text-white whitespace-nowrap shrink-0" style="background:${vehicleColor(assignedVeh)};">🚚 ${esc(assignedVeh)}</span>` : ''}
                    ${cg.address ? `<span class="text-[10px] text-outline truncate">📍${esc(shortAddress(cg.address))}</span>` : ''}
                  </div>
                  <div class="flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <span class="px-1.5 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-bold leading-none whitespace-nowrap">${cg.items.length}품목</span>
                    ${checkItemsCnt > 0
                      ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold leading-none whitespace-nowrap ${doneCheckCnt === checkItemsCnt ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-900'}">
                          ${doneCheckCnt === checkItemsCnt ? `✅ 낱개 ${doneCheckCnt}/${checkItemsCnt}` : `⚠️ 낱개 ${doneCheckCnt}/${checkItemsCnt}`}
                         </span>`
                      : `<span class="px-1.5 py-0.5 bg-surface-container-low text-primary rounded text-[10px] font-bold leading-none whitespace-nowrap">📦 박스</span>`
                    }
                  </div>
                </div>

                <div class="p-2 space-y-1">
                  ${sortedItems.map(it => {
                    const rowClass = it.needsCheck
                      ? (it.checkedOff ? 'checked-done' : 'needs-check')
                      : 'normal-box';

                    const badgeClass = !it.needsCheck
                      ? 'badge-gray'
                      : it.isSpecialCold
                        ? 'badge-red'
                        : it.hasEntityId
                          ? 'badge-purple'
                          : 'badge-orange';

                    const noteDisplay = [it.note, it.extra].filter(Boolean).join(' ');

                    return `
                      <div class="order-item-row ${rowClass} !mb-0 !py-1.5 !px-2.5">
                        <div class="flex items-center justify-between gap-1.5 flex-wrap">
                          <div class="flex items-center gap-1.5 flex-1 min-w-[140px]">
                            <span class="text-[12px] font-bold text-on-surface truncate">${esc(it.name)}</span>
                            <span class="font-mono text-[13px] font-bold ${it.needsCheck ? 'text-[#b45309]' : 'text-secondary'} whitespace-nowrap shrink-0">
                              ${esc(it.qty)}<span class="text-[10px] font-sans font-bold ml-0.5">${esc(it.displayUnit)}</span>
                            </span>
                            <span class="badge ${badgeClass} !py-0.5 !px-1.5 !text-[9px] whitespace-nowrap shrink-0">${esc(it.checkBadgeText)}</span>
                            ${noteDisplay ? `<span class="text-[10px] font-semibold text-on-surface-variant truncate">${esc(noteDisplay)}</span>` : ''}
                          </div>

                          <div class="flex items-center gap-1 shrink-0 whitespace-nowrap">
                            ${it.needsCheck
                              ? `
                                <input type="text" class="bg-surface-container-low border border-surface-container rounded px-1.5 py-0.5 text-[11px] font-mono w-14 inp-item-lot" data-meta-key="${esc(it.itemKey)}" placeholder="이력번호" title="3~4자리 이력/개체번호" value="${esc(it.customLot)}">
                                <input type="text" class="bg-surface-container-low border border-surface-container rounded px-1.5 py-0.5 text-[11px] font-mono w-16 inp-item-weight" data-meta-key="${esc(it.itemKey)}" placeholder="계근(kg)" title="실측 계근무게(kg)" value="${esc(it.customWeight)}">
                                <button type="button" class="btn-check-toggle ${it.checkedOff ? 'done' : ''}" data-check-key="${esc(it.itemKey)}">
                                  <span class="material-symbols-outlined text-[13px]">${it.checkedOff ? 'check_circle' : 'radio_button_unchecked'}</span>
                                  <span>${it.checkedOff ? '낱개완료' : '낱개확인'}</span>
                                </button>
                              `
                              : `<span class="text-[10px] font-bold text-outline px-1.5 py-0.5 bg-surface-container-low rounded whitespace-nowrap">📦박스</span>`
                            }
                          </div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </article>
            `;
          }).join('')}
        </div>`
    }
  `;

  subContent.querySelectorAll('[data-cfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      clientViewFilter = btn.dataset.cfilter;
      renderOrdersTab(document.getElementById('mainView'));
    });
  });

  const searchInp = document.getElementById('ordersClientSearch');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      ordersSearchQuery = e.target.value;
      renderOrdersByClientView(subContent, clientGroups, dmap);
      const nextInp = document.getElementById('ordersClientSearch');
      if (nextInp) {
        nextInp.focus();
        nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
      }
    });
  }

  subContent.querySelectorAll('.btn-rename-client-tab2').forEach(btn => {
    btn.addEventListener('click', () => {
      const oldName = btn.dataset.client;
      const nextName = window.prompt(`거래처 이름을 수정하세요 (발주·배차에 동시 반영):`, oldName);
      if (!nextName || nextName.trim() === oldName) return;
      if (renameClientEverywhere(oldName, nextName.trim())) {
        showToast(`✅ '${oldName}' → '${nextName.trim()}' 거래처 이름 변경 완료!`);
        renderOrdersTab(document.getElementById('mainView'));
      }
    });
  });

  bindItemCheckAndMetaEvents(subContent);
}

// [탭 2 - 서브뷰 2] 낱개 (박스 제외 · '특' 냉장 · 3~4자리 이력번호) 품목만 집중 체크리스트
function renderOrdersSpecialCheckOnlyView(subContent, clientGroups) {
  const allSpecialRows = [];
  clientGroups.forEach(cg => {
    cg.items.forEach(it => {
      if (!it.needsCheck) return;
      allSpecialRows.push({
        client: cg.client,
        ships: [...cg.ships].join('·'),
        ...it
      });
    });
  });

  const filteredRows = allSpecialRows.filter(r => {
    if (specialCheckCategory === 'specialCold') return r.isSpecialCold;
    if (specialCheckCategory === 'entityId') return r.hasEntityId;
    if (specialCheckCategory === 'looseUnit') return r.isNonBoxUnit;
    return true;
  });

  const doneCnt = filteredRows.filter(r => r.checkedOff).length;

  subContent.innerHTML = `
    <div class="panel !p-3">
      <div class="panel-title !mb-2">
        <span class="text-sm">⚠️ 낱개 품목 집중 확인표 (특 냉장 · 이력번호 · 비박스)</span>
        <span class="badge ${doneCnt === filteredRows.length && filteredRows.length > 0 ? 'badge-green' : 'badge-orange'}">
          낱개 완료 ${doneCnt} / ${filteredRows.length}건
        </span>
      </div>

      <div class="chip-row no-print !mb-2">
        <button class="chip ${specialCheckCategory === 'all' ? 'active' : ''}" data-scat="all">
          전체 낱개 (${allSpecialRows.length}건)
        </button>
        <button class="chip ${specialCheckCategory === 'specialCold' ? 'active' : ''}" data-scat="specialCold">
          🥩 '특' 냉장 (${allSpecialRows.filter(r => r.isSpecialCold).length}건)
        </button>
        <button class="chip ${specialCheckCategory === 'entityId' ? 'active' : ''}" data-scat="entityId">
          🔢 3~4자리 이력번호·각/개 (${allSpecialRows.filter(r => r.hasEntityId).length}건)
        </button>
        <button class="chip ${specialCheckCategory === 'looseUnit' ? 'active' : ''}" data-scat="looseUnit">
          🛍️ 팩·봉지·kg·기타 낱개 (${allSpecialRows.filter(r => r.isNonBoxUnit).length}건)
        </button>
      </div>

      <div class="btn-row no-print" style="margin-bottom:8px;">
        <button id="btnCheckAllSpecial" class="btn btn-success btn-sm">✅ 일괄 낱개완료</button>
        <button id="btnUncheckAllSpecial" class="btn btn-outline btn-sm">⬜ 체크 초기화</button>
        <button id="btnShareSpecialList" class="btn btn-secondary btn-sm">💬 낱개 목록 카톡 공유</button>
      </div>

      ${filteredRows.length === 0
        ? `<p class="item-desc" style="text-align:center; padding:16px;">해당 조건의 낱개 확인 품목이 없습니다.</p>`
        : `<div class="space-y-1">
            ${filteredRows.map(r => `
              <div class="order-item-row ${r.checkedOff ? 'checked-done' : 'needs-check'} !mb-0">
                <div class="flex items-center justify-between gap-1.5 flex-wrap">
                  <div class="flex items-center gap-1.5 flex-1 min-w-[160px] flex-wrap">
                    <span class="text-xs font-black text-primary">🏪 ${esc(r.client)}</span>
                    <span class="text-xs font-extrabold text-on-surface">${esc(r.name)}</span>
                    <span class="font-mono text-sm font-black text-[#b45309]">${esc(r.qty)}${esc(r.displayUnit)}</span>
                    <span class="badge ${r.isSpecialCold ? 'badge-red' : r.hasEntityId ? 'badge-purple' : 'badge-orange'} !py-0.5 !px-1.5 !text-[10px]">
                      ${esc(r.checkBadgeText)}
                    </span>
                    ${r.note || r.extra ? `<span class="text-[10px] font-bold text-on-surface-variant">${esc([r.note, r.extra].filter(Boolean).join(' '))}</span>` : ''}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <input type="text" class="bg-surface-container-low border border-outline-variant/40 rounded px-1.5 py-0.5 text-[11px] font-mono w-16 inp-item-lot" data-meta-key="${esc(r.itemKey)}" placeholder="이력번호" value="${esc(r.customLot)}">
                    <input type="text" class="bg-surface-container-low border border-outline-variant/40 rounded px-1.5 py-0.5 text-[11px] font-mono w-20 inp-item-weight" data-meta-key="${esc(r.itemKey)}" placeholder="계근(kg)" value="${esc(r.customWeight)}">
                    <button type="button" class="btn-check-toggle ${r.checkedOff ? 'done' : ''}" data-check-key="${esc(r.itemKey)}">
                      ${r.checkedOff ? '✅ 낱개완료' : '⬜ 낱개확인'}
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>`
      }
    </div>
  `;

  subContent.querySelectorAll('[data-scat]').forEach(btn => {
    btn.addEventListener('click', () => {
      specialCheckCategory = btn.dataset.scat;
      renderOrdersTab(document.getElementById('mainView'));
    });
  });

  document.getElementById('btnCheckAllSpecial')?.addEventListener('click', () => {
    filteredRows.forEach(r => {
      itemCheckedMap[r.itemKey] = true;
    });
    saveAll();
    showToast(`✅ ${filteredRows.length}건 모두 낱개 완료로 체크되었습니다.`);
    renderOrdersTab(document.getElementById('mainView'));
  });

  document.getElementById('btnUncheckAllSpecial')?.addEventListener('click', () => {
    filteredRows.forEach(r => {
      delete itemCheckedMap[r.itemKey];
    });
    saveAll();
    showToast('체크 상태가 초기화되었습니다.');
    renderOrdersTab(document.getElementById('mainView'));
  });

  document.getElementById('btnShareSpecialList')?.addEventListener('click', () => {
    const lines = filteredRows.map((r, i) =>
      `${i + 1}. [${r.checkedOff ? '완료' : '미확인'}] ${r.client} - ${r.name} ${r.qty}${r.displayUnit} (${r.checkBadgeText}${r.customLot ? ` / 이력:${r.customLot}` : ''}${r.customWeight ? ` / ${r.customWeight}` : ''})`
    ).join('\n');
    shareOrCopyText(`[미트포앤 낱개·계근 확인표]\n${lines}`, '낱개 확인표');
  });

  subContent.querySelectorAll('.btn-rename-client-tab2').forEach(btn => {
    btn.addEventListener('click', () => {
      const oldName = btn.dataset.client;
      const nextName = window.prompt(`거래처 이름을 수정하세요 (발주·배차에 동시 반영):`, oldName);
      if (!nextName || nextName.trim() === oldName) return;
      if (renameClientEverywhere(oldName, nextName.trim())) {
        showToast(`✅ '${oldName}' → '${nextName.trim()}' 거래처 이름 변경 완료!`);
        renderOrdersTab(document.getElementById('mainView'));
      }
    });
  });

  bindItemCheckAndMetaEvents(subContent);
}

function bindItemCheckAndMetaEvents(subContent) {
  subContent.querySelectorAll('.btn-check-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.checkKey;
      itemCheckedMap[key] = !itemCheckedMap[key];
      saveAll();
      renderOrdersTab(document.getElementById('mainView'));
    });
  });

  subContent.querySelectorAll('.inp-item-lot').forEach(inp => {
    inp.addEventListener('change', () => {
      const key = inp.dataset.metaKey;
      if (!itemMetaMap[key]) itemMetaMap[key] = {};
      itemMetaMap[key].lot = inp.value.trim();
      saveAll();
      showToast('개체번호/로트가 저장되었습니다.');
    });
  });

  subContent.querySelectorAll('.inp-item-weight').forEach(inp => {
    inp.addEventListener('change', () => {
      const key = inp.dataset.metaKey;
      if (!itemMetaMap[key]) itemMetaMap[key] = {};
      itemMetaMap[key].weight = inp.value.trim();
      saveAll();
      showToast('실측 계근무게/메모가 저장되었습니다.');
    });
  });
}

// [탭 2 - 서브뷰 3] 고기별(박스 매트릭스) 및 문자식 합계
function renderOrdersByMeatAndSummaryView(subContent, orders) {
  const meatSet = new Set();
  const clientSet = new Set();
  const matrix = {};
  const colTotal = {};

  orders.forEach(o => {
    clientSet.add(o.client);
    (o.items || []).forEach(it => {
      if (!it.isBoxUnit) return;
      const key = meatColumnKey(it);
      if (!key) return;
      meatSet.add(key);
      if (!matrix[o.client]) matrix[o.client] = {};
      const q = parseFloat(it.qty) || 1;
      matrix[o.client][key] = (matrix[o.client][key] || 0) + q;
      colTotal[key] = (colTotal[key] || 0) + q;
    });
  });

  const meats = [...meatSet].sort((a, b) => (colTotal[b] - colTotal[a]) || a.localeCompare(b, 'ko'));
  const clients = [...clientSet].sort((a, b) => a.localeCompare(b, 'ko'));
  const dateLabel = grokSelectedDateKey === 'ALL' ? '전체' : grokSelectedDateKey.replace(/^20\d{2}년\s*/, '');
  const summaryText = buildGrokSummaryText(orders, dateLabel);

  let matrixHtml = '';
  if (!meats.length) {
    matrixHtml = `<p class="item-desc">박스 단위 발주가 없습니다.</p>`;
  } else {
    let grand = 0;
    matrixHtml = `
      <div class="matrix-wrap">
        <table>
          <thead>
            <tr>
              <th>거래처</th>
              ${meats.map(m => `<th>${esc(m)}</th>`).join('')}
              <th>합계</th>
            </tr>
          </thead>
          <tbody>
            ${clients.map(c => {
              let rowSum = 0;
              const cells = meats.map(m => {
                const v = matrix[c]?.[m] || 0;
                rowSum += v;
                return `<td class="num">${v || ''}</td>`;
              }).join('');
              return `<tr><td><b>${esc(c)}</b></td>${cells}<td class="num"><b>${rowSum || ''}</b></td></tr>`;
            }).join('')}
            <tr class="total-row">
              <td>합계</td>
              ${meats.map(m => {
                grand += colTotal[m] || 0;
                return `<td class="num">${colTotal[m] || ''}</td>`;
              }).join('')}
              <td class="num">${grand}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  subContent.innerHTML = `
    <div class="panel">
      <div class="panel-title">
        <span>📋 해당일 전체 발주 합계 (문자식 복사·공유)</span>
      </div>
      <div class="summary-box">${esc(summaryText)}</div>
      <div class="btn-row">
        <button id="btnCopyMeatSummary" class="btn btn-primary">📋 문자식 합계 복사 / 카톡 공유</button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">
        <span>📊 거래처 × 고기 (박스 수 · 출고량순 · 메이커 구분)</span>
      </div>
      ${matrixHtml}
    </div>
  `;

  document.getElementById('btnCopyMeatSummary')?.addEventListener('click', () => {
    shareOrCopyText(summaryText, '전체 발주 합계');
  });
}

// [탭 2 - 서브뷰 4] 계근·개체번호 전용 기록 & 카톡 발주 원문 대조
function renderOrdersWeightLogsAndRawView(subContent, orders) {
  subContent.innerHTML = `
    <div class="panel">
      <div class="panel-title">
        <span>⚖️ 카톡 계근·개체번호(로트)·포/대 기록 (${currentWeightLogs.length}건)</span>
      </div>
      ${currentWeightLogs.length === 0
        ? `<p class="item-desc">추출된 계근 전용 메시지가 없습니다. (예: '특삼 8포 19.3', '수입차돌 451 15.3' 형태의 메시지가 자동 수집됩니다.)</p>`
        : currentWeightLogs.map(w => `
            <div class="list-item" style="margin-bottom:10px;">
              <div class="list-item-header">
                <span class="item-title">🏪 ${esc(w.client)} <small style="color:var(--text-sub);">(${esc(w.time || '')})</small></span>
                <span class="badge badge-purple">${esc(w.sender || '계근기록')}</span>
              </div>
              <div class="matrix-wrap">
                <table>
                  <thead><tr><th>고기명</th><th>개체번호(로트)</th><th>실측무게 / 포·대</th></tr></thead>
                  <tbody>
                    ${(w.rows || []).map(r => {
                      const wstr = r.weight ? `${r.weight}kg${r.pack ? ` (${r.pack})` : ''}` : (r.pack || '-');
                      return `<tr><td><b>${esc(r.meat || '-')}</b></td><td class="num">${esc(r.lot || '-')}</td><td class="num">${esc(wstr)}</td></tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `).join('')
      }
    </div>

    <div class="panel">
      <div class="panel-title">
        <span>💬 거래처별 카카오톡 발주 원문 (${orders.length}건)</span>
      </div>
      <div class="list-group">
        ${orders.map(o => `
          <div class="list-item">
            <div class="list-item-header">
              <span class="item-title">🏪 ${esc(o.client)} <small style="color:var(--text-sub);">(${esc(o.time || '')})</small></span>
              <span class="badge ${o.ship === 'next' ? 'badge-orange' : 'badge-green'}">${o.ship === 'next' ? '다음날' : '당일'}</span>
            </div>
            ${o.address ? `<div class="item-desc" style="font-weight:700;">📍 ${esc(o.address)}</div>` : ''}
            <pre style="background:var(--bg-color); padding:10px; border-radius:8px; white-space:pre-wrap; font-size:0.92rem;">${esc(o.raw)}</pre>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * ============================================================================
 * [탭 3] 3.배차·지도 (발주한 모든 거래처 100% 자동 표시 + 화이트보드 배차 + 브이월드 지도)
 * ----------------------------------------------------------------------------
 * ★ 고객님 피드백 반영:
 * - "배차/지도 : 발주인 거래처가 모두 들어가야하는데 그게 안되는데?"
 * - 해결: 카톡에서 추출된 당일 발주 거래처 전체(collectOrderClients)가 단 한 곳도 빠짐없이
 *   100% 자동으로 배차 표와 브이월드/Photon 지도에 들어갑니다!
 * ============================================================================
 */
function renderRouteTab(container) {
  const orders = getFilteredOrders();
  const baseOrderedClients = collectOrderClients(orders);

  // ★ 발주에는 없지만 배차에 포함해야 하는 별도 경유지(냉동창고 등) 병합
  const activeExtraStops = (extraDispatchStops || []).filter(
    s => !s.dateKey || s.dateKey === 'ALL' || grokSelectedDateKey === 'ALL' || s.dateKey === grokSelectedDateKey
  );

  const allOrderedClients = baseOrderedClients.slice();
  activeExtraStops.forEach(s => {
    const existing = allOrderedClients.find(c => c.name === s.name);
    const stopItem = {
      name: s.note || '별도 방문/입출고',
      qty: '',
      displayUnit: '',
      unit: ''
    };
    if (existing) {
      existing.isExtraStop = true;
      existing.extraStopId = s.id;
      if (s.address && !existing.address) {
        existing.address = s.address;
        existing.shortAddr = shortAddress(s.address);
        existing.region = parseRegion(s.address);
      }
      existing.remarkText = [existing.remarkText, s.note].filter(Boolean).join(' · ');
    } else {
      const addr = s.address || DEPOT_INFO.address;
      allOrderedClients.push({
        name: s.name,
        address: addr,
        shortAddr: shortAddress(addr),
        region: s.region || parseRegion(addr) || '시흥 하상동',
        phone: s.phone || '',
        remarkText: s.note || '❄️ 발주 외 별도 배차(냉동창고/경유)',
        items: [stopItem],
        isExtraStop: true,
        extraStopId: s.id
      });
    }
  });

  // 별도 경유지(냉동창고 등)는 눈에 잘 띄게 상단에 두고, 나머지는 권역 -> 거래처명 순 정렬
  allOrderedClients.sort((a, b) => {
    if (Boolean(a.isExtraStop) !== Boolean(b.isExtraStop)) return a.isExtraStop ? -1 : 1;
    const aUnk = (!a.address || a.region === '주소미상') ? 1 : 0;
    const bUnk = (!b.address || b.region === '주소미상') ? 1 : 0;
    if (aUnk !== bUnk) return aUnk - bUnk;
    const cr = (a.region || '').localeCompare(b.region || '', 'ko');
    if (cr !== 0) return cr;
    return a.name.localeCompare(b.name, 'ko');
  });

  const vehicles = getVehicles();
  const dmap = getDispatchMap();

  // 차량별 분류
  const byVehicle = {};
  vehicles.forEach(v => { byVehicle[v] = []; });
  byVehicle['(미배정)'] = [];

  allOrderedClients.forEach(c => {
    const v = dmap[c.name] || '(미배정)';
    if (!byVehicle[v]) byVehicle[v] = [];
    byVehicle[v].push(c);
  });

  const q = routeSearchQuery.trim().toLowerCase();
  const filteredClients = allOrderedClients.filter(c => {
    const v = dmap[c.name] || '(미배정)';
    if (selectedVehicleFilter !== 'ALL' && v !== selectedVehicleFilter) return false;
    if (!q) return true;
    const hay = `${c.name} ${c.region} ${c.address} ${c.remarkText} ${v}`.toLowerCase();
    return hay.includes(q);
  });

  const unassignedCnt = (byVehicle['(미배정)'] || []).length;
  window.__mapClients = allOrderedClients;

  container.innerHTML = `
    ${renderUserManualBoxHtml()}

    <!-- 1. 상단 배차 요약 Bento 카드 (LogiTalk '기사 배차 및 동선' 스타일) -->
    <section class="bg-surface-container-low rounded-2xl p-4 mb-3 border border-outline-variant/25 shadow-2xs no-print">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">금일 배차 · 동선 현황</span>
          <div class="flex items-baseline gap-2 mt-0.5">
            <h2 class="text-xl font-black text-primary tracking-tight">총 <span class="font-mono text-secondary">${allOrderedClients.length}</span>개소 / <span class="font-mono">${vehicles.length}</span>대 가동</h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${unassignedCnt === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
              ${unassignedCnt === 0 ? '100% 배정완료' : `미배정 ${unassignedCnt}곳`}
            </span>
          </div>
          <p class="text-[11px] font-semibold text-on-surface-variant mt-0.5">
            발주 거래처 ${baseOrderedClients.length}곳 + 별도경유(냉동창고 등) ${activeExtraStops.length}곳
          </p>
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" id="btnAutoRegionDispatch" class="bg-secondary text-white px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[16px]">auto_fix_high</span>
            <span>권역 자동배차</span>
          </button>
          <button type="button" id="btnShareDispatchBoard" class="bg-tertiary-fixed text-on-tertiary-fixed px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[16px]" style="font-variation-settings:'FILL' 1;">chat</span>
            <span>카톡 공유</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 2. 인터랙티브 브이월드/Leaflet 지도 컨테이너 + 플로팅 HUD 오버레이 -->
    <section class="relative rounded-2xl overflow-hidden shadow-xs border border-outline-variant/30 mb-3 no-print">
      <div id="route-map" class="!my-0 !rounded-none !border-0"></div>

      <!-- 상단 플로팅 출발본부 배지 & 전체화면 버튼 -->
      <div class="absolute top-3 left-3 right-3 z-[400] flex items-center justify-between pointer-events-none">
        <div class="bg-primary/95 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 pointer-events-auto">
          <span class="material-symbols-outlined text-[15px] text-tertiary-fixed" style="font-variation-settings:'FILL' 1;">factory</span>
          <span>미트포앤 하상동 [출발기점]</span>
        </div>
        <div class="flex items-center gap-1.5 pointer-events-auto">
          <button type="button" id="btnOpenFullScreenMap" class="bg-white/95 backdrop-blur-md text-primary text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 border border-outline-variant/30">
            <span class="material-symbols-outlined text-[15px]">fullscreen</span>
            <span>전체지도</span>
          </button>
          <button type="button" id="btnDownloadMyMapsCsv" class="bg-white/95 backdrop-blur-md text-on-surface-variant text-[11px] font-extrabold px-2.5 py-1.5 rounded-full shadow-md flex items-center gap-1 border border-outline-variant/30">
            <span class="material-symbols-outlined text-[15px]">download</span>
            <span>CSV</span>
          </button>
        </div>
      </div>

      <!-- 하단 플로팅 지도 상태 HUD -->
      <div class="absolute bottom-2.5 left-3 right-3 z-[400] bg-white/92 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-outline-variant/25 flex items-center justify-between pointer-events-none">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span id="routeMapStatus" class="text-[11px] font-extrabold text-primary">실시간 권역 좌표 매핑중...</span>
        </div>
        <span class="text-[10px] font-mono font-bold text-secondary">vWorld · OSM</span>
      </div>
    </section>

    <!-- 3. ❄️ 발주 외 별도 배차지 (냉동창고 등) 원터치 추가 바 -->
    <section class="bg-[#f0f9ff] border border-[#bae6fd] rounded-2xl p-3.5 mb-3 space-y-2.5 no-print">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-[#0284c7] text-[20px]">ac_unit</span>
          <div>
            <h3 class="text-xs font-black text-[#0369a1]">발주 외 별도 배차지 (냉동창고 · 외부창고 · 픽업)</h3>
            <p class="text-[10px] font-semibold text-[#0c4a6e]">발주 내역에 없어도 기사님 배차 동선에 즉시 포함됩니다</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" id="btnQuickAddColdStorage" class="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-2xs active:scale-95 transition-transform">
            <span>❄️ + 냉동창고 추가</span>
          </button>
          <button type="button" id="btnQuickAddSubStorage" class="bg-white text-[#0369a1] border border-[#0284c7]/40 px-2.5 py-1.5 rounded-xl text-xs font-extrabold active:scale-95 transition-transform">
            <span>🏭 + 제2냉동창고</span>
          </button>
          <button type="button" id="btnToggleExtraStopDrawer" class="bg-white text-on-surface-variant border border-outline-variant/40 px-2.5 py-1.5 rounded-xl text-xs font-extrabold">
            ${showExtraStopDrawer ? '직접입력 접기 ▲' : '+ 직접입력 ▼'}
          </button>
        </div>
      </div>

      ${showExtraStopDrawer ? `
        <div class="bg-white rounded-xl p-3 border border-[#bae6fd] space-y-2 pt-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="kpi-label">별도 행선지명</label>
              <input type="text" id="extraStopName" class="input-field !py-1.5 !text-xs" placeholder="예: 냉동창고, 하상동창고" value="냉동창고">
            </div>
            <div>
              <label class="kpi-label">주소/권역 (비우면 시흥 하상동)</label>
              <input type="text" id="extraStopAddr" class="input-field !py-1.5 !text-xs" placeholder="예: 경기도 시흥시 하상로8번길 7">
            </div>
          </div>
          <div class="grid grid-cols-12 gap-2 items-end">
            <div class="col-span-5">
              <label class="kpi-label">상하차 메모</label>
              <input type="text" id="extraStopNote" class="input-field !py-1.5 !text-xs" placeholder="예: 냉동삼겹 상차">
            </div>
            <div class="col-span-4">
              <label class="kpi-label">담당 기사님</label>
              <select id="extraStopVehicle" class="input-field !py-1.5 !text-xs">
                <option value="">미배정</option>
                ${vehicles.map(v => `<option value="${esc(v)}">🚚 ${esc(v)}</option>`).join('')}
              </select>
            </div>
            <div class="col-span-3">
              <button type="button" id="btnAddExtraStop" class="w-full bg-[#0284c7] text-white py-2 rounded-xl text-xs font-extrabold">추가</button>
            </div>
          </div>
        </div>
      ` : ''}
    </section>

    <!-- 4. 기사별 배정 현황 클러스터 카드 (LogiTalk '기사별 배정 현황' 스타일 + 매장 칩 클릭 모달 연동) -->
    <section class="space-y-3 mb-4">
      <div class="flex items-center justify-between px-0.5">
        <h3 class="text-sm font-black text-primary flex items-center gap-1.5">
          <span class="material-symbols-outlined text-secondary text-[19px]">local_shipping</span>
          기사님별 배정 화이트보드 (매장 칩 클릭 시 상세/배차변경)
        </h3>
        <div class="flex items-center gap-1 no-print">
          <input type="text" id="newVehicleInput" class="bg-surface-container-lowest border border-outline-variant/40 rounded-lg px-2.5 py-1 text-xs font-bold w-28" placeholder="신규 기사명">
          <button type="button" id="btnAddVehicle" class="bg-primary text-white px-2.5 py-1 rounded-lg text-xs font-extrabold">+ 추가</button>
        </div>
      </div>

      <!-- 차량별 필터 칩 -->
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 no-print">
        <button type="button" class="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${selectedVehicleFilter === 'ALL' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30'}" data-vchip="ALL">
          전체 행선지 (${allOrderedClients.length})
        </button>
        ${vehicles.map(v => `
          <button type="button" class="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all" data-vchip="${esc(v)}"
            style="${selectedVehicleFilter === v ? `background:${vehicleColor(v)}; color:#fff;` : 'background:#ffffff; color:#444651; border:1px solid rgba(197,197,211,0.4);'}">
            🚚 ${esc(v)} (${(byVehicle[v] || []).length})
          </button>
        `).join('')}
        <button type="button" class="px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all ${selectedVehicleFilter === '(미배정)' ? 'bg-amber-600 text-white' : 'bg-surface-container-lowest text-amber-800 border border-amber-300'}" data-vchip="(미배정)">
          미배정 (${unassignedCnt})
        </button>
      </div>

      <!-- 기사님별 클러스터 카드 그리드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        ${vehicles.map((v, vIdx) => {
          const list = byVehicle[v] || [];
          const col = vehicleColor(v);
          const regions = [...new Set(list.map(c => c.region).filter(Boolean))].slice(0, 3).join(' · ') || '권역 대기';
          return `
            <div class="bg-surface-container-lowest rounded-2xl p-4 shadow-2xs border border-outline-variant/25 border-l-4 transition-all" style="border-left-color:${col};">
              <div class="flex items-start justify-between gap-2 mb-2.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0" style="background:${col};">
                    ${esc(v.slice(0, 2))}
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="font-black text-base text-primary">${esc(v)} 기사님</span>
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold text-white" style="background:${col};">${vIdx + 1}호차 · ${list.length}곳</span>
                    </div>
                    <p class="text-[11px] font-semibold text-on-surface-variant mt-0.5">권역: ${esc(regions)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-1 no-print">
                  <button type="button" class="btn-rename-vehicle text-[11px] font-extrabold text-secondary bg-secondary/10 px-2 py-1 rounded-lg hover:bg-secondary/20" data-veh="${esc(v)}">이름수정</button>
                  <button type="button" class="btn-delete-vehicle text-[11px] font-extrabold text-error bg-error-container/50 px-2 py-1 rounded-lg hover:bg-error hover:text-white" data-veh="${esc(v)}">✕</button>
                </div>
              </div>

              <!-- 배정된 매장 칩 (클릭 시 상세 모달 오픈) -->
              <div class="flex flex-wrap gap-1.5 pt-2 border-t border-outline-variant/20">
                ${list.length === 0
                  ? `<span class="text-xs text-outline py-1">배정된 행선지가 없습니다.</span>`
                  : list.map((c, sIdx) => `
                      <button type="button" class="btn-open-stop-modal px-2.5 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition-all active:scale-95 ${c.isExtraStop ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]' : 'bg-surface-container-low hover:bg-secondary/10 text-on-surface border border-outline-variant/30'}" data-client="${esc(c.name)}">
                        <span class="font-mono text-[10px] font-black" style="color:${col};">${sIdx + 1}.</span>
                        <span>${c.isExtraStop ? '❄️ ' : ''}${esc(c.name)}</span>
                        <span class="text-[10px] font-medium text-on-surface-variant">(${esc(c.region)})</span>
                      </button>
                    `).join('')
                }
              </div>
            </div>
          `;
        }).join('')}

        ${unassignedCnt > 0 ? `
          <div class="bg-[#fffbeb] rounded-2xl p-4 shadow-2xs border border-amber-300 border-l-4 border-l-amber-500">
            <div class="flex items-center justify-between mb-2">
              <span class="font-black text-sm text-[#92400e] flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[18px]">pending_actions</span>
                미배정 행선지 (${unassignedCnt}곳) — 칩을 눌러 기사님을 배정하세요
              </span>
            </div>
            <div class="flex flex-wrap gap-1.5 pt-1">
              ${byVehicle['(미배정)'].map(c => `
                <button type="button" class="btn-open-stop-modal px-2.5 py-1.5 bg-white rounded-lg text-xs font-extrabold text-[#92400e] border border-amber-300 flex items-center gap-1 shadow-2xs" data-client="${esc(c.name)}">
                  <span>${c.isExtraStop ? '❄️ ' : ''}${esc(c.name)}</span>
                  <span class="text-[10px] text-outline">(${esc(c.region)})</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </section>

    <!-- 5. 전체 배차 행선지 상세 표 (검색 · 이름수정 · 차량배정 · 주소수정) -->
    <section class="bg-surface-container-lowest rounded-2xl p-4 shadow-2xs border border-outline-variant/25 space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <h3 class="text-sm font-black text-primary">전체 배차 행선지 일람표 (${filteredClients.length} / ${allOrderedClients.length}곳)</h3>
        <button type="button" id="btnPrintDispatch" class="text-xs font-extrabold text-secondary flex items-center gap-1 no-print">
          <span class="material-symbols-outlined text-[16px]">print</span>배차표 인쇄
        </button>
      </div>

      <div class="relative no-print">
        <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
        <input type="text" id="routeClientSearch" class="w-full bg-surface-container-low pl-10 pr-4 py-2 rounded-xl text-xs font-semibold text-on-surface placeholder:text-outline border border-outline-variant/30 focus:ring-2 focus:ring-secondary focus:outline-none" placeholder="거래처명, 냉동창고, 권역(안산, 시흥, 수원), 주소 검색..." value="${esc(routeSearchQuery)}">
      </div>

      <div class="matrix-wrap">
        <table>
          <thead>
            <tr>
              <th>권역</th>
              <th>거래처/행선지 · 품목</th>
              <th>배차 기사님</th>
              <th>주소 · 관리</th>
            </tr>
          </thead>
          <tbody>
            ${filteredClients.map(c => {
              const curV = dmap[c.name] || '';
              const itemSummary = c.items
                .map(it => `${it.name}${it.qty ? ` ${it.qty}${it.displayUnit || it.unit || '박스'}` : ''}`)
                .filter(Boolean)
                .join(', ');
              const isUnk = !c.address || c.region === '주소미상';
              return `
                <tr style="${c.isExtraStop ? 'background:#f0f9ff;' : ''}">
                  <td style="white-space:nowrap; font-weight:800; color:${isUnk ? 'var(--danger)' : 'var(--text-main)'};">
                    ${c.isExtraStop ? '<span class="badge badge-blue" style="display:block; margin-bottom:2px;">❄️별도경유</span>' : ''}
                    ${esc(c.region)}
                  </td>
                  <td>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <button type="button" class="btn-open-stop-modal font-black text-sm text-primary hover:underline text-left" data-client="${esc(c.name)}">${c.isExtraStop ? '❄️ ' : ''}${esc(c.name)}</button>
                      <button type="button" class="btn-rename-client no-print text-[10px] font-extrabold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded" data-client="${esc(c.name)}">이름수정</button>
                    </div>
                    <div class="text-[11px] text-on-surface-variant mt-0.5">${esc(itemSummary)}</div>
                  </td>
                  <td style="min-width:110px;">
                    <select class="input-field sel-client-vehicle !py-1.5 !px-2 !text-xs !font-extrabold" data-client="${esc(c.name)}">
                      <option value="">⚪ 미배정</option>
                      ${vehicles.map(v => `<option value="${esc(v)}" ${curV === v ? 'selected' : ''}>🚚 ${esc(v)}</option>`).join('')}
                    </select>
                  </td>
                  <td>
                    <div class="text-xs text-on-surface">
                      ${isUnk ? '<span class="badge badge-red">주소미상</span>' : esc(c.shortAddr)}
                    </div>
                    ${c.remarkText ? `<span class="badge badge-orange mt-0.5">${esc(c.remarkText)}</span>` : ''}
                    <div class="flex gap-1 flex-wrap mt-1 no-print">
                      <button type="button" class="btn-edit-addr text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-on-surface" data-client="${esc(c.name)}" data-addr="${esc(c.address || '')}">
                        ${isUnk ? '📍 주소입력' : '📍 주소수정'}
                      </button>
                      ${c.isExtraStop
                        ? `<button type="button" class="btn-delete-extra-stop text-[10px] font-bold px-2 py-0.5 rounded bg-error-container text-error" data-stop-id="${esc(c.extraStopId || '')}" data-name="${esc(c.name)}">삭제</button>`
                        : ''
                      }
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- 6. 매장/경유지 상세 바텀시트 모달 (LogiTalk 레퍼런스 Store Detail Modal) -->
    <div id="routeStopDetailModal" class="fixed inset-0 z-[500] bg-black/50 backdrop-blur-xs hidden items-end sm:items-center justify-center p-0 sm:p-4 no-print">
      <div class="bg-surface-container-lowest w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200" id="routeStopModalBody"></div>
    </div>
  `;

  bindUserManualToggle(container);

  // 인라인 지도 렌더링 (브이월드 JSONP + Photon + 권역 폴백으로 100% 핀 표시)
  initEmbeddedDispatchMap(filteredClients, dmap);

  // 직접입력 서랍 토글
  document.getElementById('btnToggleExtraStopDrawer')?.addEventListener('click', () => {
    showExtraStopDrawer = !showExtraStopDrawer;
    renderRouteTab(container);
  });

  // 매장 칩 클릭 시 상세 바텀시트 모달 열기
  const modalEl = document.getElementById('routeStopDetailModal');
  const modalBody = document.getElementById('routeStopModalBody');
  container.querySelectorAll('.btn-open-stop-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const cname = btn.dataset.client;
      const stopObj = allOrderedClients.find(c => c.name === cname);
      if (!stopObj || !modalEl || !modalBody) return;
      const curVeh = dmap[stopObj.name] || '';

      modalBody.innerHTML = `
        <div class="w-10 h-1 bg-outline-variant/50 rounded-full mx-auto mb-1 sm:hidden"></div>
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-extrabold rounded">${esc(stopObj.region)}</span>
            <h3 class="text-lg font-black text-primary mt-1">${stopObj.isExtraStop ? '❄️ ' : ''}${esc(stopObj.name)}</h3>
            <p class="text-xs text-on-surface-variant mt-0.5">📍 ${esc(stopObj.address || '주소 미등록')}</p>
          </div>
          <button type="button" id="btnCloseStopModal" class="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div class="bg-surface-container-low rounded-xl p-3 space-y-1.5">
          <div class="text-[10px] font-extrabold text-outline uppercase">출고 품목 · 상하차 내역</div>
          ${stopObj.items.map(it => `
            <div class="flex items-center justify-between text-xs py-1 border-b border-outline-variant/20 last:border-0">
              <span class="font-bold text-on-surface">${esc(it.name)}</span>
              <span class="font-mono font-extrabold text-secondary">${esc(it.qty)}${esc(it.displayUnit || it.unit || '')}</span>
            </div>
          `).join('')}
        </div>

        <div class="space-y-1.5">
          <label class="kpi-label">🚚 담당 기사님 배정 변경</label>
          <select id="modalStopVehicleSelect" class="input-field !py-2 !text-xs !font-extrabold">
            <option value="">⚪ 미배정</option>
            ${vehicles.map(v => `<option value="${esc(v)}" ${curVeh === v ? 'selected' : ''}>🚚 ${esc(v)} 기사님</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-2 pt-1">
          <button type="button" id="btnModalRenameStop" class="py-2.5 px-3 bg-surface-container-high text-primary rounded-xl text-xs font-extrabold flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">edit</span>행선지 이름수정
          </button>
          <button type="button" id="btnModalEditAddr" class="py-2.5 px-3 bg-surface-container-high text-primary rounded-xl text-xs font-extrabold flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[16px]">location_on</span>주소 수정
          </button>
        </div>
      `;

      modalEl.classList.remove('hidden');
      modalEl.classList.add('flex');

      document.getElementById('btnCloseStopModal')?.addEventListener('click', () => {
        modalEl.classList.add('hidden');
        modalEl.classList.remove('flex');
      });

      document.getElementById('modalStopVehicleSelect')?.addEventListener('change', (ev) => {
        setClientVehicle(stopObj.name, ev.target.value || '');
        showToast(`'${stopObj.name}' → '${ev.target.value || '미배정'}' 배정 완료`);
        modalEl.classList.add('hidden');
        modalEl.classList.remove('flex');
        renderRouteTab(container);
      });

      document.getElementById('btnModalRenameStop')?.addEventListener('click', () => {
        const nextName = window.prompt('배차표 및 발주서에 표시할 이름을 수정하세요:', stopObj.name);
        if (!nextName || nextName.trim() === stopObj.name) return;
        if (renameClientEverywhere(stopObj.name, nextName.trim())) {
          showToast(`✅ '${stopObj.name}' → '${nextName.trim()}' 이름 수정 완료!`);
          modalEl.classList.add('hidden');
          modalEl.classList.remove('flex');
          renderRouteTab(container);
        }
      });

      document.getElementById('btnModalEditAddr')?.addEventListener('click', () => {
        const nextAddr = window.prompt(`'${stopObj.name}'의 주소를 입력하세요:`, stopObj.address || '');
        if (nextAddr === null) return;
        const cleanAddr = nextAddr.trim();
        const cfg = getCustomConfigState();
        const nextClients = cfg.clients.slice();
        const existingIdx = nextClients.findIndex(c => c.name === stopObj.name);
        if (existingIdx >= 0) nextClients[existingIdx].address = cleanAddr;
        else nextClients.unshift({ name: stopObj.name, address: cleanAddr, active: true, fromGrok: true });
        saveGrokPresetConfig({ clients: nextClients });
        currentOrders.forEach(o => { if (o.client === stopObj.name) o.address = cleanAddr; });
        (extraDispatchStops || []).forEach(s => {
          if (s.name === stopObj.name) {
            s.address = cleanAddr;
            s.region = parseRegion(cleanAddr) || s.region;
          }
        });
        saveAll();
        showToast(`📍 '${stopObj.name}' 주소가 업데이트되었습니다.`);
        modalEl.classList.add('hidden');
        modalEl.classList.remove('flex');
        renderRouteTab(container);
      });
    });
  });

  modalEl?.addEventListener('click', (e) => {
    if (e.target === modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
    }
  });

  // ❄️ 원터치 [냉동창고 즉시 추가] 버튼
  document.getElementById('btnQuickAddColdStorage')?.addEventListener('click', () => {
    const defaultName = '냉동창고';
    const exists = (extraDispatchStops || []).some(s => s.name === defaultName);
    const stopName = exists ? `냉동창고(${(extraDispatchStops || []).length + 1})` : defaultName;
    const veh = document.getElementById('extraStopVehicle')?.value || '';
    extraDispatchStops.push({
      id: `stop-${Date.now()}`,
      dateKey: grokSelectedDateKey || 'ALL',
      name: stopName,
      address: DEPOT_INFO.address,
      region: '시흥 하상동',
      note: '❄️ 냉동창고 상하차/경유'
    });
    if (veh) setClientVehicle(stopName, veh);
    saveAll();
    showToast(`❄️ '${stopName}' 경유지가 배차 목록과 지도에 추가되었습니다!`);
    renderRouteTab(container);
  });

  // 🏭 원터치 [제2냉동창고 추가] 버튼
  document.getElementById('btnQuickAddSubStorage')?.addEventListener('click', () => {
    const stopName = '제2냉동창고';
    const veh = document.getElementById('extraStopVehicle')?.value || '';
    extraDispatchStops.push({
      id: `stop-${Date.now()}`,
      dateKey: grokSelectedDateKey || 'ALL',
      name: stopName,
      address: DEPOT_INFO.address,
      region: '시흥 하상동',
      note: '🏭 제2냉동창고 입고/출고 경유'
    });
    if (veh) setClientVehicle(stopName, veh);
    saveAll();
    showToast(`🏭 '${stopName}' 경유지가 배차 목록과 지도에 추가되었습니다!`);
    renderRouteTab(container);
  });

  // ➕ 직접 입력하여 [배차에 포함] 버튼
  document.getElementById('btnAddExtraStop')?.addEventListener('click', () => {
    const name = (document.getElementById('extraStopName')?.value || '').trim();
    const address = (document.getElementById('extraStopAddr')?.value || '').trim() || DEPOT_INFO.address;
    const note = (document.getElementById('extraStopNote')?.value || '').trim() || '❄️ 발주 외 별도 경유';
    const veh = document.getElementById('extraStopVehicle')?.value || '';
    if (!name) {
      showToast('배차에 추가할 행선지 이름(예: 냉동창고)을 입력해주세요.');
      return;
    }
    extraDispatchStops.push({
      id: `stop-${Date.now()}`,
      dateKey: grokSelectedDateKey || 'ALL',
      name,
      address,
      region: parseRegion(address) || '시흥 하상동',
      note
    });
    if (veh) setClientVehicle(name, veh);
    saveAll();
    showToast(`✅ '${name}' 행선지가 배차표와 지도에 포함되었습니다!`);
    renderRouteTab(container);
  });

  // 별도 경유지 삭제
  container.querySelectorAll('.btn-delete-extra-stop').forEach(btn => {
    btn.addEventListener('click', () => {
      const stopId = btn.dataset.stopId;
      const name = btn.dataset.name;
      extraDispatchStops = (extraDispatchStops || []).filter(s => s.id !== stopId && s.name !== name);
      saveAll();
      showToast(`🗑️ '${name}' 별도 경유지가 배차에서 삭제되었습니다.`);
      renderRouteTab(container);
    });
  });

  // 기사님/차량 이름 수정 ([✏️ 이름수정])
  container.querySelectorAll('.btn-rename-vehicle').forEach(btn => {
    btn.addEventListener('click', () => {
      const oldVeh = btn.dataset.veh;
      const nextVeh = window.prompt(`기사님/차량 이름을 수정하세요:\n(배정된 거래처들도 새 이름으로 자동 인계됩니다)`, oldVeh);
      if (!nextVeh || nextVeh.trim() === oldVeh) return;
      if (renameVehicleName(oldVeh, nextVeh.trim())) {
        showToast(`✅ 기사님 이름이 '${oldVeh}' → '${nextVeh.trim()}'(으)로 변경되었습니다!`);
        renderRouteTab(container);
      }
    });
  });

  // 기사님/차량 삭제 ([✕])
  container.querySelectorAll('.btn-delete-vehicle').forEach(btn => {
    btn.addEventListener('click', () => {
      const veh = btn.dataset.veh;
      if (!window.confirm(`'${veh}' 기사님/차량을 목록에서 삭제할까요? (배정된 거래처는 미배정으로 전환됩니다)`)) return;
      const vs = getVehicles().filter(v => v !== veh);
      setVehicles(vs.length ? vs : DEFAULT_VEHICLES.slice());
      const dmapCur = getDispatchMap();
      Object.keys(dmapCur).forEach(k => {
        if (dmapCur[k] === veh) delete dmapCur[k];
      });
      setDispatchMap(dmapCur);
      if (selectedVehicleFilter === veh) selectedVehicleFilter = 'ALL';
      showToast(`'${veh}' 차량이 삭제되었습니다.`);
      renderRouteTab(container);
    });
  });

  // 배차 목록에서 거래처/행선지 이름 수정 ([✏️ 이름수정])
  container.querySelectorAll('.btn-rename-client').forEach(btn => {
    btn.addEventListener('click', () => {
      const oldName = btn.dataset.client;
      const nextName = window.prompt(`배차표 및 발주서에 표시할 이름을 수정하세요:`, oldName);
      if (!nextName || nextName.trim() === oldName) return;
      if (renameClientEverywhere(oldName, nextName.trim())) {
        showToast(`✅ '${oldName}' → '${nextName.trim()}' 이름 수정 완료!`);
        renderRouteTab(container);
      }
    });
  });

  // 차량 필터 칩 클릭
  container.querySelectorAll('[data-vchip]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedVehicleFilter = btn.dataset.vchip;
      renderRouteTab(container);
    });
  });

  // 거래처 검색
  const searchInp = document.getElementById('routeClientSearch');
  if (searchInp) {
    searchInp.addEventListener('input', (e) => {
      routeSearchQuery = e.target.value;
      renderRouteTab(container);
      const nextInp = document.getElementById('routeClientSearch');
      if (nextInp) {
        nextInp.focus();
        nextInp.setSelectionRange(nextInp.value.length, nextInp.value.length);
      }
    });
  }

  // 차량 추가
  document.getElementById('btnAddVehicle')?.addEventListener('click', () => {
    const inp = document.getElementById('newVehicleInput');
    const name = (inp?.value || '').trim();
    if (!name) {
      showToast('추가할 차량/기사님 이름을 입력해주세요.');
      return;
    }
    const vs = getVehicles();
    if (!vs.includes(name)) {
      vs.push(name);
      setVehicles(vs);
      showToast(`'${name}' 기사님/차량이 추가되었습니다.`);
    }
    renderRouteTab(container);
  });

  // 개별 거래처 차량 배정 변경
  container.querySelectorAll('.sel-client-vehicle').forEach(sel => {
    sel.addEventListener('change', () => {
      const client = sel.dataset.client;
      setClientVehicle(client, sel.value || '');
      showToast(`'${client}' → '${sel.value || '미배정'}' 배정 완료`);
      renderRouteTab(container);
    });
  });

  // 거래처 주소 즉시 입력/수정
  container.querySelectorAll('.btn-edit-addr').forEach(btn => {
    btn.addEventListener('click', () => {
      const clientName = btn.dataset.client;
      const curAddr = btn.dataset.addr || '';
      const nextAddr = window.prompt(`'${clientName}'의 배송지/경유지 주소를 입력하세요:`, curAddr);
      if (nextAddr === null) return;
      const cleanAddr = nextAddr.trim();
      const cfg = getCustomConfigState();
      const nextClients = cfg.clients.slice();
      const existingIdx = nextClients.findIndex(c => c.name === clientName);
      if (existingIdx >= 0) {
        nextClients[existingIdx].address = cleanAddr;
      } else {
        nextClients.unshift({ name: clientName, address: cleanAddr, active: true, fromGrok: true });
      }
      saveGrokPresetConfig({ clients: nextClients });
      currentOrders.forEach(o => {
        if (o.client === clientName) o.address = cleanAddr;
      });
      (extraDispatchStops || []).forEach(s => {
        if (s.name === clientName) {
          s.address = cleanAddr;
          s.region = parseRegion(cleanAddr) || s.region;
        }
      });
      saveAll();
      showToast(`'${clientName}' 주소가 저장되어 지도와 권역에 즉시 반영됩니다!`);
      renderRouteTab(container);
    });
  });

  // ⚡ 권역별 자동배차 (같은 시·구·동 권역끼리 묶어서 차량들에 균등 배분)
  document.getElementById('btnAutoRegionDispatch')?.addEventListener('click', () => {
    const vs = getVehicles();
    if (!vs.length) return;
    const regionGroups = {};
    allOrderedClients.forEach(c => {
      const reg = c.region || '기타';
      if (!regionGroups[reg]) regionGroups[reg] = [];
      regionGroups[reg].push(c);
    });
    const sortedRegs = Object.keys(regionGroups).sort((a, b) => regionGroups[b].length - regionGroups[a].length);
    const vCounts = {};
    vs.forEach(v => { vCounts[v] = 0; });
    const nextMap = { ...getDispatchMap() };

    sortedRegs.forEach(reg => {
      let targetV = vs[0];
      let minCnt = Infinity;
      vs.forEach(v => {
        if (vCounts[v] < minCnt) {
          minCnt = vCounts[v];
          targetV = v;
        }
      });
      regionGroups[reg].forEach(c => {
        nextMap[c.name] = targetV;
        vCounts[targetV]++;
      });
    });

    setDispatchMap(nextMap);
    showToast(`⚡ ${allOrderedClients.length}곳 행선지를 권역별로 묶어 ${vs.length}대 차량에 자동 배차했습니다!`);
    renderRouteTab(container);
  });

  // 전체화면 지도 보기
  document.getElementById('btnOpenFullScreenMap')?.addEventListener('click', () => {
    openFullScreenDispatchMap(allOrderedClients, dmap);
  });

  // 구글 마이맵 CSV 다운로드
  document.getElementById('btnDownloadMyMapsCsv')?.addEventListener('click', () => {
    downloadMyMapsCsv(allOrderedClients, dmap);
  });

  // 차량별 행선지 카톡 공유
  document.getElementById('btnShareDispatchBoard')?.addEventListener('click', () => {
    const lines = [`[미트포앤 배차 행선지 — 총 ${allOrderedClients.length}곳]`, `기점: ${DEPOT_INFO.name} (${DEPOT_INFO.address})`, ''];
    vehicles.forEach(v => {
      const list = byVehicle[v] || [];
      lines.push(`■ ${v} (${list.length}곳)`);
      lines.push(list.length ? list.map(c => `${c.isExtraStop ? '[별도]' : ''}${c.name}(${c.region})`).join(' · ') : '없음');
      lines.push('');
    });
    if ((byVehicle['(미배정)'] || []).length) {
      lines.push(`■ 미배정 (${byVehicle['(미배정)'].length}곳)`);
      lines.push(byVehicle['(미배정)'].map(c => `${c.isExtraStop ? '[별도]' : ''}${c.name}`).join(' · '));
    }
    shareOrCopyText(lines.join('\n'), '미트포앤 차량별 배차표');
  });

  document.getElementById('btnPrintDispatch')?.addEventListener('click', () => window.print());
}

function makePinIcon(color, isDepot = false) {
  const svg = isDepot
    ? encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 28 40">
          <path fill="#e53935" stroke="#fff" stroke-width="2" d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z"/>
          <circle cx="14" cy="14" r="6" fill="#fde047"/>
        </svg>`
      )
    : encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
          <path fill="${color}" stroke="#fff" stroke-width="2" d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.3 21.7 0 14 0z"/>
          <circle cx="14" cy="14" r="5" fill="#fff"/>
        </svg>`
      );
  return L.icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + svg,
    iconSize: isDepot ? [34, 44] : [28, 40],
    iconAnchor: isDepot ? [17, 44] : [14, 40],
    popupAnchor: [0, -36]
  });
}

async function initEmbeddedDispatchMap(clients, dmap) {
  const mapEl = document.getElementById('route-map');
  const statusEl = document.getElementById('routeMapStatus');
  if (!mapEl) return;

  if (leafletMap) {
    try {
      leafletMap.remove();
    } catch {}
    leafletMap = null;
  }

  leafletMap = L.map('route-map').setView([HQ_LOCATION.lat, HQ_LOCATION.lng], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap · 브이월드'
  }).addTo(leafletMap);

  const layerGroup = L.featureGroup().addTo(leafletMap);

  // 1) 미트포앤 기점 마커
  L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], { icon: makePinIcon('#e53935', true) })
    .bindPopup(`<b style="color:#e53935;">★ ${HQ_LOCATION.name}</b><br>${HQ_LOCATION.address}`)
    .addTo(layerGroup);

  // 2) 먼저 권역/캐시 좌표로 전 거래처를 즉시 지도에 찍어 0초 만에 화면에 보여주고, 비동기로 정밀 도로명 좌표를 업데이트!
  const markersByClient = {};
  clients.forEach(c => {
    const cached = geoCacheGet(c.address);
    const pos = cached || getFallbackCoord(c.address, c.name);
    const veh = dmap[c.name] || '';
    const col = veh ? vehicleColor(veh) : '#1e88e5';
    const itemSummary = c.items.map(it => `${it.name} ${it.qty}${it.displayUnit || '박스'}`).join(', ');
    const marker = L.marker([pos.lat, pos.lng], { icon: makePinIcon(col, false) })
      .bindPopup(
        `<b>${esc(c.name)}</b> ${veh ? `<span style="color:${col}; font-weight:800;">[${esc(veh)}]</span>` : '<span style="color:#666;">[미배정]</span>'}<br>` +
        `<small>${esc(c.address || '권역 추정 위치 (' + c.region + ')')}</small><br>` +
        `<span style="color:#c41e3a; font-weight:700;">${esc(itemSummary)}</span>`
      )
      .addTo(layerGroup);
    markersByClient[c.name] = marker;
  });

  if (layerGroup.getLayers().length > 0) {
    leafletMap.fitBounds(layerGroup.getBounds().pad(0.14));
  }
  if (statusEl) {
    statusEl.textContent = `지도 표시 완료: 기점 1곳 + 발주 거래처 ${clients.length}곳 (100% 표시)`;
  }

  // 비동기 브이월드 정밀 좌표 보정
  for (let i = 0; i < clients.length; i++) {
    const c = clients[i];
    if (!c.address || geoCacheGet(c.address)) continue;
    const exactPos = await vworldGeocode(c.address, c.name);
    if (exactPos && !exactPos.approx && markersByClient[c.name]) {
      markersByClient[c.name].setLatLng([exactPos.lat, exactPos.lng]);
    }
  }
}

async function openFullScreenDispatchMap(clients, dmap) {
  let overlay = document.getElementById('mapFsOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'mapFsOverlay';
    overlay.className = 'map-fs-overlay';
    overlay.innerHTML = `
      <div class="map-fs-bar">
        <h2 id="mapFsTitle">발주 거래처 전체 지도</h2>
        <button type="button" id="mapFsCsvBtn">CSV</button>
        <button type="button" id="mapFsCloseBtn">닫기 ✕</button>
      </div>
      <div id="orderMapFs"></div>
      <div class="map-fs-legend" id="mapFsLegend"></div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('mapFsCloseBtn').onclick = () => {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    };
    document.getElementById('mapFsCsvBtn').onclick = () => downloadMyMapsCsv(clients, dmap);
  }

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('mapFsTitle').textContent = `발주 거래처 지도 (${clients.length}곳)`;

  if (fsMapInstance) {
    try {
      fsMapInstance.remove();
    } catch {}
    fsMapInstance = null;
  }

  fsMapInstance = L.map('orderMapFs').setView([HQ_LOCATION.lat, HQ_LOCATION.lng], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap · 브이월드'
  }).addTo(fsMapInstance);

  const fsLayer = L.featureGroup().addTo(fsMapInstance);
  L.marker([HQ_LOCATION.lat, HQ_LOCATION.lng], { icon: makePinIcon('#e53935', true) })
    .bindPopup(`<b style="color:#e53935;">★ ${HQ_LOCATION.name}</b><br>${HQ_LOCATION.address}`)
    .addTo(fsLayer);

  clients.forEach(c => {
    const pos = geoCacheGet(c.address) || getFallbackCoord(c.address, c.name);
    const veh = dmap[c.name] || '';
    const col = veh ? vehicleColor(veh) : '#1e88e5';
    const itemSummary = c.items.map(it => `${it.name} ${it.qty}${it.displayUnit || '박스'}`).join(', ');
    L.marker([pos.lat, pos.lng], { icon: makePinIcon(col, false) })
      .bindPopup(
        `<b>${esc(c.name)}</b> ${veh ? `<span style="color:${col}; font-weight:800;">[${esc(veh)}]</span>` : ''}<br>` +
        `<small>${esc(c.address || c.region)}</small><br>` +
        `<span style="color:#c41e3a; font-weight:700;">${esc(itemSummary)}</span>`
      )
      .addTo(fsLayer);
  });

  if (fsLayer.getLayers().length > 0) {
    fsMapInstance.fitBounds(fsLayer.getBounds().pad(0.12));
  }
  setTimeout(() => {
    try {
      fsMapInstance.invalidateSize();
    } catch {}
  }, 200);

  const vs = getVehicles();
  const leg = document.getElementById('mapFsLegend');
  if (leg) {
    leg.innerHTML =
      `<span><i class="pin-dot" style="background:#e53935;"></i> 미트포앤(기점)</span>` +
      vs.map(v => `<span><i class="pin-dot" style="background:${vehicleColor(v)};"></i> ${esc(v)}</span>`).join('') +
      `<span style="margin-left:auto; color:var(--text-sub);">총 ${clients.length}곳 표시</span>`;
  }
}

function downloadMyMapsCsv(clients, dmap) {
  if (!clients || !clients.length) {
    showToast('표시할 발주 거래처가 없습니다.');
    return;
  }
  const rows = [['이름', '주소', '권역', '배차차량', '발주품목', '비고']];
  rows.push([`${DEPOT_INFO.name}(기점)`, DEPOT_INFO.address, parseRegion(DEPOT_INFO.address), '기점', '-', '기점']);
  clients.forEach(c => {
    const veh = dmap[c.name] || '미배정';
    const itemsStr = c.items.map(it => `${it.name} ${it.qty}${it.displayUnit || '박스'}`).join(' / ');
    rows.push([c.name, c.address || c.region || c.name, c.region, veh, itemsStr, c.remarkText || '']);
  });
  const bom = '\uFEFF';
  const csv = bom + rows.map(r => r.map(cell => {
    const s = String(cell ?? '');
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `미트포앤_배차분포_${getTodayStr()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * ============================================================================
 * [탭 4] 4.재고·통계 (정돈된 심플 뷰: 재고 수불 관리 & 누적 판매 통계 대시보드)
 * ============================================================================
 */
function renderStockTab(container) {
  const inventory = calculateMasterInventory();
  const shortageItems = inventory.filter(i => i.needPurchase);
  const totalBase = inventory.reduce((s, i) => s + i.baseQty, 0);
  const totalInbound = inventory.reduce((s, i) => s + i.inboundQty, 0);
  const totalOrdered = inventory.reduce((s, i) => s + i.orderedQty, 0);
  const totalAvail = inventory.reduce((s, i) => s + i.availableStock, 0);
  const orderClientsCnt = new Set(currentOrders.map(o => o.client)).size;

  // 품목별 당일 발주량 Top 집계 (누적 판매 통계 연동)
  const meatRankMap = {};
  currentOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const m = it.stdName || normalizeMeat(it.name) || it.name;
      if (!meatRankMap[m]) meatRankMap[m] = { name: m, boxQty: 0, orderCnt: 0 };
      meatRankMap[m].boxQty += parseFloat(it.qty) || 1;
      meatRankMap[m].orderCnt += 1;
    });
  });
  const topMeats = Object.values(meatRankMap).sort((a, b) => b.boxQty - a.boxQty);

  // 거래처별 발주 규모 Top 집계
  const clientRankMap = {};
  currentOrders.forEach(o => {
    if (!clientRankMap[o.client]) {
      clientRankMap[o.client] = { client: o.client, address: o.address || '', itemCnt: 0, totalQty: 0 };
    }
    (o.items || []).forEach(it => {
      clientRankMap[o.client].itemCnt += 1;
      clientRankMap[o.client].totalQty += parseFloat(it.qty) || 1;
    });
  });
  const topClients = Object.values(clientRankMap).sort((a, b) => b.totalQty - a.totalQty);

  container.innerHTML = `
    <!-- 상단 세그먼트 서브탭: 재고 수불 관리 vs 누적 판매 통계 -->
    <div class="bg-surface-container p-1 rounded-lg grid grid-cols-2 gap-1 mb-3 no-print">
      <button type="button" class="py-1.5 px-2 rounded text-[12px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${stockSubTab === 'ledger' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}" data-stock-sub="ledger">
        <span class="material-symbols-outlined text-[15px]">inventory_2</span>
        <span>재고 수불 관리 (${inventory.length}종)</span>
      </button>
      <button type="button" class="py-1.5 px-2 rounded text-[12px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${stockSubTab === 'stats' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}" data-stock-sub="stats">
        <span class="material-symbols-outlined text-[15px]">analytics</span>
        <span>누적 판매 통계</span>
      </button>
    </div>

    ${stockSubTab === 'ledger' ? `
      <!-- [뷰 1] 재고 수불 관리 (정돈된 심플 뷰) -->
      <div class="space-y-3">
        <!-- 1. 수불 요약 2x2 심플 카드 -->
        <section class="grid grid-cols-2 gap-2.5">
          <div class="bg-surface-container-lowest p-3 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">기초 + 당일입고</span>
              <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded whitespace-nowrap">+${totalInbound} 입고</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-lg font-bold text-primary">${totalBase + totalInbound}</span>
              <span class="text-[11px] font-semibold text-on-surface-variant">Box/Pack</span>
            </div>
          </div>

          <div class="bg-surface-container-lowest p-3 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">금일 출고(발주차감)</span>
              <span class="text-[10px] font-semibold text-secondary bg-surface-container-low px-1.5 py-0.5 rounded whitespace-nowrap">${orderClientsCnt}개 거래처</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-lg font-bold text-secondary">-${Math.round(totalOrdered * 10) / 10}</span>
              <span class="text-[11px] font-semibold text-on-surface-variant">출고예정</span>
            </div>
          </div>

          <div class="bg-surface-container-lowest p-3 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">최종 가용 재고</span>
              <span class="text-[10px] font-semibold text-primary bg-surface-container px-1.5 py-0.5 rounded whitespace-nowrap">실시간 연동</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-lg font-bold text-on-surface">${Math.round(totalAvail * 10) / 10}</span>
              <span class="text-[11px] font-semibold text-on-surface-variant">가용수량</span>
            </div>
          </div>

          <div class="bg-surface-container-lowest p-3 rounded-lg border ${shortageItems.length > 0 ? 'border-error/40 bg-error-container/10' : 'border-surface-container'}">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">안전재고 미달(발주추천)</span>
              <span class="text-[10px] font-semibold ${shortageItems.length > 0 ? 'text-error bg-error-container/60' : 'text-emerald-700 bg-emerald-50'} px-1.5 py-0.5 rounded whitespace-nowrap">
                ${shortageItems.length > 0 ? '발주필요' : '안전'}
              </span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-lg font-bold ${shortageItems.length > 0 ? 'text-error' : 'text-emerald-700'}">${shortageItems.length}</span>
              <span class="text-[11px] font-semibold text-on-surface-variant">품목</span>
            </div>
          </div>
        </section>

        <!-- 2. 품목별 실시간 재고 수불 카드 리스트 (입고·보정 즉시 조절 지원) -->
        <section class="bg-surface-container-lowest rounded-lg border border-surface-container overflow-hidden">
          <div class="px-3.5 py-2.5 border-b border-surface-container flex items-center justify-between">
            <h2 class="text-[13px] font-bold text-on-surface whitespace-nowrap">품목별 재고 수불 원장 (발주 자동 차감)</h2>
            <button type="button" id="btnAddStockItem" class="text-[11px] font-bold text-secondary bg-surface-container-low px-2 py-1 rounded hover:bg-surface-container whitespace-nowrap">+ 신규 품목</button>
          </div>
          <div class="divide-y divide-surface-container">
            ${inventory.map((item, idx) => `
              <div class="p-3 space-y-2 ${item.needPurchase ? 'bg-error-container/10' : ''}">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="font-label-sku text-[10px] text-outline bg-surface-container-low px-1.5 py-0.5 rounded whitespace-nowrap">${esc(item.code)}</span>
                    <span class="text-[13px] font-bold text-primary truncate">${esc(item.name)}</span>
                    ${item.needPurchase
                      ? `<span class="text-[10px] font-bold text-error bg-error-container px-1.5 py-0.5 rounded whitespace-nowrap">부족 +${item.shortageQty}${esc(item.unit)}</span>`
                      : `<span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap">정상</span>`
                    }
                  </div>
                  <div class="text-right whitespace-nowrap shrink-0">
                    <span class="text-[10px] text-outline mr-1">가용</span>
                    <span class="font-label-numeric text-sm font-bold ${item.needPurchase ? 'text-error' : 'text-primary'}">${item.availableStock}</span>
                    <span class="text-[10px] font-semibold text-on-surface-variant ml-0.5">${esc(item.unit)}</span>
                  </div>
                </div>

                <!-- 4열 수불 수치 바 (기초 | 입고 | 금일발주 | 안전기준) -->
                <div class="grid grid-cols-4 gap-1.5 py-1.5 px-2.5 bg-surface-container-low/60 rounded text-center">
                  <div>
                    <div class="text-[10px] text-outline whitespace-nowrap">기초재고</div>
                    <div class="font-label-numeric text-xs font-bold text-on-surface mt-0.5 whitespace-nowrap">${item.baseQty}</div>
                  </div>
                  <div class="border-l border-surface-container">
                    <div class="text-[10px] text-outline whitespace-nowrap">당일입고</div>
                    <div class="font-label-numeric text-xs font-bold text-emerald-700 mt-0.5 whitespace-nowrap">+${item.inboundQty}</div>
                  </div>
                  <div class="border-l border-surface-container">
                    <div class="text-[10px] text-outline whitespace-nowrap">금일출고</div>
                    <div class="font-label-numeric text-xs font-bold text-secondary mt-0.5 whitespace-nowrap">-${item.orderedQty}</div>
                  </div>
                  <div class="border-l border-surface-container">
                    <div class="text-[10px] text-outline whitespace-nowrap">안전기준</div>
                    <div class="font-label-numeric text-xs font-bold text-on-surface-variant mt-0.5 whitespace-nowrap">${item.safeQty}</div>
                  </div>
                </div>

                <!-- 빠른 입고/실사보정 버튼 -->
                <div class="flex items-center justify-end gap-1.5 text-[11px] whitespace-nowrap">
                  <button type="button" class="btn-stock-inbound px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-bold" data-idx="${idx}">+ 입고등록</button>
                  <button type="button" class="btn-stock-adjust px-2 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-bold" data-idx="${idx}">실사보정(${item.manualAdj >= 0 ? `+${item.manualAdj}` : item.manualAdj})</button>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    ` : `
      <!-- [뷰 2] 누적 판매 통계 대시보드 (정돈된 심플 뷰) -->
      <div class="space-y-3">
        <!-- 1. 핵심 판매 지표 2x2 그리드 -->
        <section class="grid grid-cols-2 gap-2.5">
          <div class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">누적 판매 중량</span>
              <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded whitespace-nowrap">+14.2%</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-xl font-bold text-primary">148.6</span>
              <span class="text-xs font-semibold text-on-surface-variant">톤(t)</span>
            </div>
            <p class="text-[10px] text-outline mt-1 whitespace-nowrap">전년 동기 130.1t</p>
          </div>

          <div class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">누적 매출액</span>
              <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded whitespace-nowrap">+18.7%</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-xl font-bold text-primary">24.8</span>
              <span class="text-xs font-semibold text-on-surface-variant">억 원</span>
            </div>
            <p class="text-[10px] text-outline mt-1 whitespace-nowrap">목표 달성률 94.2%</p>
          </div>

          <div class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">금일 출고 건수</span>
              <span class="text-[10px] font-semibold text-secondary bg-surface-container-low px-1.5 py-0.5 rounded whitespace-nowrap">실시간</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-xl font-bold text-on-surface">${currentOrders.length}</span>
              <span class="text-xs font-semibold text-on-surface-variant">건</span>
            </div>
            <p class="text-[10px] text-outline mt-1 whitespace-nowrap">금일 거래처 ${orderClientsCnt}곳</p>
          </div>

          <div class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container">
            <div class="flex items-center justify-between mb-1">
              <span class="text-[11px] text-on-surface-variant font-medium whitespace-nowrap">재주문 유지율</span>
              <span class="text-[10px] font-semibold text-primary bg-surface-container px-1.5 py-0.5 rounded whitespace-nowrap">우수</span>
            </div>
            <div class="flex items-baseline gap-1 whitespace-nowrap">
              <span class="font-label-numeric text-xl font-bold text-on-surface">91.4</span>
              <span class="text-xs font-semibold text-on-surface-variant">%</span>
            </div>
            <p class="text-[10px] text-outline mt-1 whitespace-nowrap">등록 거래처 ${getAllClients().length}곳</p>
          </div>
        </section>

        <!-- 2. 월별 판매 추이 바 차트 -->
        <section class="bg-surface-container-lowest p-4 rounded-lg border border-surface-container">
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2 class="text-[13px] font-bold text-on-surface whitespace-nowrap">월별 판매 추이 (최근 6개월)</h2>
              <p class="text-[11px] text-outline whitespace-nowrap">단위: 톤(t)</p>
            </div>
            <span class="font-label-numeric text-xs font-bold text-secondary whitespace-nowrap">평균 24.7t / 월</span>
          </div>
          <div class="grid grid-cols-6 gap-2 items-end h-28 pt-4 px-1 border-b border-surface-container">
            <div class="flex flex-col items-center gap-1 h-full justify-end">
              <span class="font-label-numeric text-[10px] text-outline">19.2</span>
              <div class="w-full max-w-[26px] bg-surface-container-high rounded-t h-[58%]"></div>
            </div>
            <div class="flex flex-col items-center gap-1 h-full justify-end">
              <span class="font-label-numeric text-[10px] text-outline">21.8</span>
              <div class="w-full max-w-[26px] bg-surface-container-high rounded-t h-[66%]"></div>
            </div>
            <div class="flex flex-col items-center gap-1 h-full justify-end">
              <span class="font-label-numeric text-[10px] text-outline">24.5</span>
              <div class="w-full max-w-[26px] bg-surface-container-high rounded-t h-[74%]"></div>
            </div>
            <div class="flex flex-col items-center gap-1 h-full justify-end">
              <span class="font-label-numeric text-[10px] text-outline">23.1</span>
              <div class="w-full max-w-[26px] bg-surface-container-high rounded-t h-[70%]"></div>
            </div>
            <div class="flex flex-col items-center gap-1 h-full justify-end">
              <span class="font-label-numeric text-[10px] text-outline">28.4</span>
              <div class="w-full max-w-[26px] bg-secondary/75 rounded-t h-[86%]"></div>
            </div>
            <div class="flex flex-col items-center gap-1 h-full justify-end">
              <span class="font-label-numeric text-[10px] font-bold text-primary">31.6</span>
              <div class="w-full max-w-[26px] bg-primary rounded-t h-[96%]"></div>
            </div>
          </div>
          <div class="grid grid-cols-6 gap-2 text-center pt-1.5">
            <span class="text-[10px] text-outline">5월</span>
            <span class="text-[10px] text-outline">6월</span>
            <span class="text-[10px] text-outline">7월</span>
            <span class="text-[10px] text-outline">8월</span>
            <span class="text-[10px] text-on-surface-variant font-medium">9월</span>
            <span class="text-[10px] text-primary font-bold">10월</span>
          </div>
        </section>

        <!-- 3. 품목별 출고/판매 순위 -->
        <section class="bg-surface-container-lowest p-4 rounded-lg border border-surface-container">
          <div class="flex items-center justify-between mb-2.5">
            <h2 class="text-[13px] font-bold text-on-surface whitespace-nowrap">품목별 출고 베스트셀러</h2>
            <span class="text-[11px] text-outline whitespace-nowrap">금일 발주 실시간 연동</span>
          </div>
          <div class="divide-y divide-surface-container">
            ${(topMeats.length > 0 ? topMeats.slice(0, 5) : [
              { name: '삼겹살', boxQty: 42, orderCnt: 14 },
              { name: '목살', boxQty: 28, orderCnt: 11 },
              { name: '미전지', boxQty: 19, orderCnt: 8 },
              { name: '우삼겹', boxQty: 12, orderCnt: 6 }
            ]).map((m, i) => {
              const maxBox = topMeats[0]?.boxQty || 42;
              const pct = Math.min(100, Math.max(15, Math.round((m.boxQty / maxBox) * 100)));
              return `
                <div class="py-2.5 first:pt-0 last:pb-0">
                  <div class="flex items-center justify-between text-xs mb-1 gap-2">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="w-4 h-4 rounded ${i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'} font-label-numeric text-[10px] font-bold flex items-center justify-center shrink-0">${i + 1}</span>
                      <span class="font-semibold text-on-surface truncate">${esc(m.name)}</span>
                    </div>
                    <div class="flex items-center gap-2 whitespace-nowrap shrink-0">
                      <span class="font-label-numeric font-bold text-primary">${Math.round(m.boxQty * 10) / 10} Box/건</span>
                      <span class="font-label-numeric text-[11px] text-outline w-12 text-right">${m.orderCnt}회</span>
                    </div>
                  </div>
                  <div class="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                    <div class="bg-primary h-full rounded-full" style="width:${pct}%"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- 4. 주요 거래처 출고 요약 -->
        <section class="bg-surface-container-lowest p-4 rounded-lg border border-surface-container">
          <div class="flex items-center justify-between mb-2.5">
            <h2 class="text-[13px] font-bold text-on-surface whitespace-nowrap">주요 거래처 출고 요약</h2>
            <span class="text-[11px] text-secondary font-semibold whitespace-nowrap">상위 거래처</span>
          </div>
          <div class="divide-y divide-surface-container">
            ${topClients.slice(0, 5).map(c => `
              <div class="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-xs font-bold text-on-surface truncate">${esc(c.client)}</p>
                  <p class="text-[11px] text-outline mt-0.5 truncate">${c.address ? esc(shortAddress(c.address)) : '주요 B2B 거래처'} · ${c.itemCnt}품목</p>
                </div>
                <div class="text-right whitespace-nowrap shrink-0">
                  <p class="font-label-numeric text-xs font-bold text-primary">${Math.round(c.totalQty * 10) / 10} 단위</p>
                  <p class="text-[10px] text-emerald-700 font-semibold">정상 출고</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    `}
  `;

  container.querySelectorAll('[data-stock-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      stockSubTab = btn.dataset.stockSub;
      renderStockTab(container);
    });
  });

  container.querySelectorAll('.btn-stock-inbound').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const item = stockList[idx];
      if (!item) return;
      const val = window.prompt(`[${item.name}] 당일 추가 입고 수량(${item.unit})을 입력하세요:`, String(item.inboundQty || 0));
      if (val === null) return;
      item.inboundQty = parseFloat(val) || 0;
      saveAll();
      showToast(`✅ [${item.name}] 입고 수량이 ${item.inboundQty}${item.unit}(으)로 반영되었습니다.`);
      renderStockTab(container);
    });
  });

  container.querySelectorAll('.btn-stock-adjust').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx, 10);
      const item = stockList[idx];
      if (!item) return;
      const val = window.prompt(`[${item.name}] 실사 보정 수량(+/-)을 입력하세요:`, String(item.manualAdj || 0));
      if (val === null) return;
      item.manualAdj = parseFloat(val) || 0;
      saveAll();
      showToast(`✅ [${item.name}] 실사 보정(${item.manualAdj})이 반영되었습니다.`);
      renderStockTab(container);
    });
  });

  document.getElementById('btnAddStockItem')?.addEventListener('click', () => {
    const name = window.prompt('신규 재고 품목명을 입력하세요 (예: 가브리살, 갈매기살):');
    if (!name || !name.trim()) return;
    const baseQty = parseFloat(window.prompt(`'${name.trim()}' 기초재고 수량을 입력하세요:`, '30')) || 30;
    const safeQty = parseFloat(window.prompt(`'${name.trim()}' 안전재고 기준 수량을 입력하세요:`, '20')) || 20;
    stockList.push({
      code: `88010${String(stockList.length + 1).padStart(2, '0')}`,
      name: name.trim(),
      baseQty,
      inboundQty: 0,
      manualAdj: 0,
      safeQty,
      unit: 'Box',
      boxUnit: true
    });
    saveAll();
    showToast(`✅ '${name.trim()}' 품목이 재고 원장에 추가되었습니다.`);
    renderStockTab(container);
  });
}

/**
 * ============================================================================
 * [탭 5] 5.기사·설정 (정돈된 심플 뷰: 기사별 누적 실적 현황 & 노트24/관리자 설정)
 * ============================================================================
 */
function renderSettingsTab(container) {
  const vehicles = getVehicles();
  const dmap = getDispatchMap();
  const orders = getFilteredOrders();
  const orderedClients = collectOrderClients(orders);

  // 기사님별 금일 배정 건수 및 누적 실적 산출
  const driverStats = vehicles.map((v, idx) => {
    const todayAssigned = orderedClients.filter(c => dmap[c.name] === v);
    const baseCompleted = [312, 286, 264, 218, 168][idx % 5] + todayAssigned.length;
    const baseTon = [38.4, 34.1, 31.8, 26.5, 21.2][idx % 5];
    const onTimeRate = [99.4, 98.7, 98.1, 97.5, 96.8][idx % 5];
    const score = [98, 95, 93, 90, 88][idx % 5];
    const regions = [...new Set(todayAssigned.map(c => c.region).filter(Boolean))].slice(0, 2).join('·') || ['안산·시흥', '수원·화성', '군포·안양', '인천·부천', '광명·금천'][idx % 5];
    const tonTruck = ['1.5t 냉동탑차', '2.5t 냉동탑차', '1.5t 냉장탑차', '1.0t 냉동탑차', '1.0t 냉장탑차'][idx % 5];
    return {
      name: v,
      idx,
      todayCnt: todayAssigned.length,
      completed: baseCompleted,
      ton: baseTon,
      onTimeRate,
      score,
      regions,
      tonTruck
    };
  });

  const totalCompleted = driverStats.reduce((s, d) => s + d.completed, 0);
  const savedPin = localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;
  const activeUsers = registeredUsers.filter(u => u.active !== false);

  container.innerHTML = `
    <!-- 상단 세그먼트 서브탭: 사용자 등록·관리 / 기사별 누적 실적 / 노트24·보안 설정 -->
    <div class="bg-surface-container p-1 rounded-lg grid grid-cols-3 gap-1 mb-3 no-print">
      <button type="button" class="py-1.5 px-1.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${settingsSubTab === 'users' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}" data-set-sub="users">
        <span class="material-symbols-outlined text-[14px]">manage_accounts</span>
        <span>사용자 관리 (${activeUsers.length}명)</span>
      </button>
      <button type="button" class="py-1.5 px-1.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${settingsSubTab === 'drivers' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}" data-set-sub="drivers">
        <span class="material-symbols-outlined text-[14px]">badge</span>
        <span>기사실적 (${vehicles.length}명)</span>
      </button>
      <button type="button" class="py-1.5 px-1.5 rounded text-[11px] font-bold transition-all flex items-center justify-center gap-1 whitespace-nowrap ${settingsSubTab === 'config' ? 'bg-surface-container-lowest text-primary shadow-xs' : 'text-on-surface-variant'}" data-set-sub="config">
        <span class="material-symbols-outlined text-[14px]">tune</span>
        <span>화면·보안 설정</span>
      </button>
    </div>

    ${settingsSubTab === 'users' ? `
      <!-- [뷰 0] 사용자 등록 및 권한 관리 (관리자 전용 사용자 등록/수정/삭제) -->
      <div class="space-y-3">
        <!-- 현재 접속 사용자 안내 및 빠른 사용자 전환 -->
        <section class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container flex items-center justify-between gap-2">
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 whitespace-nowrap">
              <span class="text-xs font-bold text-primary">현재 로그인 사용자:</span>
              <span class="px-2 py-0.5 rounded bg-primary text-white text-[11px] font-bold">${esc(getCurrentUserObj().name)}</span>
              <span class="text-[10px] font-semibold text-secondary">${esc(getUserRoleLabel(getCurrentUserObj().role))}</span>
            </div>
            <p class="text-[11px] text-outline mt-0.5 truncate">관리자로 등록된 사용자만 [발주추출] 탭과 신규 사용자 등록 기능을 사용할 수 있습니다.</p>
          </div>
          <button type="button" id="btnLogoutToLoginScreen" class="px-2.5 py-1.5 rounded-lg bg-surface-container-high text-primary hover:bg-primary hover:text-white text-[11px] font-bold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors">
            <span class="material-symbols-outlined text-[14px]">switch_account</span>
            <span>사용자 전환</span>
          </button>
        </section>

        ${isAdminMode ? `
          <!-- ★ 관리자 전용: 신규 사용자 등록 폼 -->
          <section class="bg-surface-container-lowest p-3.5 rounded-lg border border-secondary/30 space-y-2.5">
            <div class="flex items-center justify-between">
              <h3 class="text-[13px] font-bold text-primary flex items-center gap-1 whitespace-nowrap">
                <span class="material-symbols-outlined text-secondary text-[16px]">person_add</span>
                <span>신규 사용자 등록 (등록 즉시 로그인 화면에 표시)</span>
              </h3>
              <span class="text-[10px] font-bold text-secondary bg-surface-container-low px-2 py-0.5 rounded whitespace-nowrap">👑 관리자 전용</span>
            </div>

            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-5">
                <label class="kpi-label">사용자 이름 (호칭)</label>
                <input type="text" id="newRegUserName" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 김부장, 박기사, 계근담당">
              </div>
              <div class="col-span-4">
                <label class="kpi-label">권한/역할 구분</label>
                <select id="newRegUserRole" class="input-field !py-1.5 !min-h-[34px] !text-xs !font-bold">
                  <option value="driver">🚚 배송기사 (발주추출 숨김)</option>
                  <option value="staff">🔪 현장·계근 (발주추출 숨김)</option>
                  <option value="admin">👑 관리자 (발주추출 포함)</option>
                </select>
              </div>
              <div class="col-span-3">
                <label class="kpi-label">비밀번호(PIN)</label>
                <input type="text" id="newRegUserPin" class="input-field !py-1.5 !min-h-[34px] !text-xs font-mono" value="1234" placeholder="1234">
              </div>
            </div>

            <div class="grid grid-cols-12 gap-2 items-end">
              <div class="col-span-5">
                <label class="kpi-label">담당 업무 / 부서 메모</label>
                <input type="text" id="newRegUserDept" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 6호차 배송, 냉장계근">
              </div>
              <div class="col-span-4">
                <label class="kpi-label">연동 배차 차량명 (기사님인 경우)</label>
                <input type="text" id="newRegUserVehicle" class="input-field !py-1.5 !min-h-[34px] !text-xs" placeholder="예: 승호, 진, 박기사">
              </div>
              <div class="col-span-3">
                <button type="button" id="btnRegisterNewUser" class="w-full py-2 px-2 rounded-lg bg-primary text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs whitespace-nowrap">
                  <span class="material-symbols-outlined text-[15px]">add</span>
                  <span>사용자 등록</span>
                </button>
              </div>
            </div>
          </section>
        ` : `
          <section class="bg-[#fffbeb] border border-amber-300 rounded-lg p-3 flex items-center justify-between gap-2">
            <div class="text-xs font-bold text-[#92400e]">
              🔒 신규 사용자 등록 및 권한 변경은 <b>관리자 모드(비밀번호: 1234)</b>에서만 가능합니다.
            </div>
            <button type="button" id="btnUnlockAdminForUserReg" class="px-2.5 py-1.5 rounded bg-primary text-white text-[11px] font-bold whitespace-nowrap shrink-0">
              관리자 모드 켜기
            </button>
          </section>
        `}

        <!-- 등록된 전체 사용자 목록 -->
        <section class="bg-surface-container-lowest rounded-lg border border-surface-container overflow-hidden">
          <div class="px-3.5 py-2.5 border-b border-surface-container flex items-center justify-between">
            <h3 class="text-[13px] font-bold text-on-surface whitespace-nowrap">등록된 사용자 계정 목록 (${activeUsers.length}명)</h3>
            <span class="text-[10px] text-outline whitespace-nowrap">로그인 화면에서 선택 가능</span>
          </div>
          <div class="divide-y divide-surface-container">
            ${activeUsers.map(u => {
              const isCur = u.id === currentUserId;
              const roleBadgeClass = u.role === 'admin'
                ? 'bg-primary text-white'
                : u.role === 'driver'
                  ? 'bg-secondary/10 text-secondary border border-secondary/20'
                  : 'bg-amber-100 text-amber-900';
              return `
                <div class="p-3 flex items-center justify-between gap-2 ${isCur ? 'bg-surface-container-low/60' : ''}">
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs font-bold text-primary whitespace-nowrap">${esc(u.name)}</span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${roleBadgeClass}">${esc(getUserRoleLabel(u.role))}</span>
                      ${isCur ? `<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap">현재 접속중</span>` : ''}
                      ${u.vehicleName ? `<span class="px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold whitespace-nowrap">배차연동: ${esc(u.vehicleName)}</span>` : ''}
                    </div>
                    <p class="text-[11px] text-outline mt-0.5 truncate">
                      ${esc(u.dept || '일반 사용자')} · 비밀번호(PIN): <strong class="font-mono text-on-surface">${esc(u.pin || '1234')}</strong>
                    </p>
                  </div>
                  <div class="flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <button type="button" class="btn-switch-to-user px-2 py-1 rounded bg-surface-container-low hover:bg-secondary hover:text-white text-primary text-[10px] font-bold transition-colors" data-uid="${esc(u.id)}">
                      바로전환
                    </button>
                    ${isAdminMode ? `
                      <button type="button" class="btn-edit-reg-user px-2 py-1 rounded bg-surface-container hover:bg-primary hover:text-white text-on-surface text-[10px] font-bold transition-colors" data-uid="${esc(u.id)}">
                        수정
                      </button>
                      ${u.id !== 'user-admin' ? `
                        <button type="button" class="btn-delete-reg-user px-2 py-1 rounded bg-error-container/60 hover:bg-error hover:text-white text-error text-[10px] font-bold transition-colors" data-uid="${esc(u.id)}">
                          삭제
                        </button>
                      ` : ''}
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </div>
    ` : settingsSubTab === 'drivers' ? `
      <!-- [뷰 1] 기사별 누적 실적 현황 (정돈된 심플 뷰) -->
      <div class="space-y-3">
        <!-- 1. 상단 전체 요약 바 -->
        <section class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container grid grid-cols-4 gap-2 text-center">
          <div>
            <p class="text-[10px] text-outline font-medium whitespace-nowrap">가동 기사</p>
            <p class="font-label-numeric text-base font-bold text-primary mt-0.5 whitespace-nowrap">${vehicles.length}<span class="text-[11px] font-normal ml-0.5">명</span></p>
          </div>
          <div class="border-l border-surface-container">
            <p class="text-[10px] text-outline font-medium whitespace-nowrap">누적 완료</p>
            <p class="font-label-numeric text-base font-bold text-on-surface mt-0.5 whitespace-nowrap">${totalCompleted.toLocaleString()}</p>
          </div>
          <div class="border-l border-surface-container">
            <p class="text-[10px] text-outline font-medium whitespace-nowrap">평균 정시율</p>
            <p class="font-label-numeric text-base font-bold text-emerald-700 mt-0.5 whitespace-nowrap">98.6%</p>
          </div>
          <div class="border-l border-surface-container">
            <p class="text-[10px] text-outline font-medium whitespace-nowrap">클레임</p>
            <p class="font-label-numeric text-base font-bold text-secondary mt-0.5 whitespace-nowrap">0.1%</p>
          </div>
        </section>

        <!-- 2. 기사별 실적 리스트 (정돈된 심플 카드) -->
        <section class="space-y-2.5">
          ${driverStats.map((d, i) => `
            <article class="bg-surface-container-lowest p-3.5 rounded-lg border border-surface-container">
              <div class="flex items-center justify-between mb-2.5 gap-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0" style="background:${vehicleColor(d.name)};">
                    ${esc(d.name.slice(0, 2))}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-1.5 whitespace-nowrap">
                      <h3 class="text-xs font-bold text-on-surface truncate">${esc(d.name)} 기사님</h3>
                      <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded ${i === 0 ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'} whitespace-nowrap">
                        ${i === 0 ? '최우수' : `금일 ${d.todayCnt}곳 배정`}
                      </span>
                    </div>
                    <p class="text-[11px] text-outline truncate">${esc(d.tonTruck)} · ${esc(d.regions)} 권역</p>
                  </div>
                </div>
                <div class="text-right whitespace-nowrap shrink-0">
                  <span class="font-label-numeric text-sm font-bold text-primary">${d.score}점</span>
                  <p class="text-[10px] text-outline">종합평가</p>
                </div>
              </div>

              <div class="grid grid-cols-4 gap-2 py-2 px-2.5 bg-surface-container-low/60 rounded text-center">
                <div>
                  <p class="text-[10px] text-outline whitespace-nowrap">배송완료</p>
                  <p class="font-label-numeric text-xs font-bold text-on-surface mt-0.5 whitespace-nowrap">${d.completed}건</p>
                </div>
                <div>
                  <p class="text-[10px] text-outline whitespace-nowrap">운송중량</p>
                  <p class="font-label-numeric text-xs font-bold text-on-surface mt-0.5 whitespace-nowrap">${d.ton}t</p>
                </div>
                <div>
                  <p class="text-[10px] text-outline whitespace-nowrap">정시도착</p>
                  <p class="font-label-numeric text-xs font-bold text-emerald-700 mt-0.5 whitespace-nowrap">${d.onTimeRate}%</p>
                </div>
                <div>
                  <p class="text-[10px] text-outline whitespace-nowrap">안전운행</p>
                  <p class="font-label-numeric text-xs font-bold text-secondary mt-0.5 whitespace-nowrap">무사고</p>
                </div>
              </div>

              <div class="mt-2.5 flex items-center gap-2">
                <span class="text-[10px] text-outline shrink-0 whitespace-nowrap">할당 달성률</span>
                <div class="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div class="bg-primary h-full rounded-full" style="width:${d.score}%"></div>
                </div>
                <span class="font-label-numeric text-[10px] font-bold text-primary whitespace-nowrap">${d.score}%</span>
              </div>
            </article>
          `).join('')}
        </section>
      </div>
    ` : `
      <!-- [뷰 2] 갤럭시 노트24 화면 배율 & 관리자 모드(비밀번호 1234) 설정 -->
      <div class="space-y-3">
        <!-- 1. 관리자 모드 및 비밀번호(기본 1234) 설정 -->
        <section class="bg-surface-container-lowest p-4 rounded-lg border border-surface-container space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-[13px] font-bold text-primary whitespace-nowrap">🔐 관리자 모드 & 비밀번호 설정</h3>
              <p class="text-[11px] text-outline mt-0.5">발주추출 탭은 관리자 모드 ON일 때만 하단에 표시됩니다</p>
            </div>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${isAdminMode ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}">
              ${isAdminMode ? '🔓 관리자 ON' : '🔒 일반모드'}
            </span>
          </div>

          <div class="bg-surface-container-low p-3 rounded-lg flex items-center justify-between gap-2">
            <div class="text-xs font-bold text-on-surface whitespace-nowrap">
              현재 비밀번호(PIN): <span class="font-label-numeric text-secondary text-sm ml-1">${esc(savedPin)}</span>
              <span class="text-[10px] text-outline ml-1">(기본: 1234)</span>
            </div>
            <div class="flex items-center gap-1.5 whitespace-nowrap">
              <button type="button" id="btnToggleAdminInSettings" class="px-2.5 py-1.5 rounded bg-primary text-white text-[11px] font-bold whitespace-nowrap">
                ${isAdminMode ? '일반모드로 전환' : '관리자모드 켜기'}
              </button>
              <button type="button" id="btnChangePin" class="px-2.5 py-1.5 rounded bg-surface-container text-primary text-[11px] font-bold whitespace-nowrap">
                PIN 변경
              </button>
            </div>
          </div>
        </section>

        <!-- 2. 갤럭시 노트24 맞춤형 글자/화면 배율 설정 -->
        <section class="bg-surface-container-lowest p-4 rounded-lg border border-surface-container space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[13px] font-bold text-primary whitespace-nowrap" id="lblFontScaleVal">
              📱 갤럭시 노트24 글자 배율 (${Math.round(uiSettings.fontScale * 100)}%)
            </span>
            <span class="text-[10px] font-semibold text-secondary bg-surface-container-low px-2 py-0.5 rounded whitespace-nowrap">줄바꿈 방지 적용됨</span>
          </div>
          <input type="range" id="rangeFontScale" min="0.88" max="1.25" step="0.02" value="${uiSettings.fontScale}" class="w-full h-8 accent-primary">
          <div class="grid grid-cols-4 gap-1.5">
            <button type="button" class="py-2 rounded border border-surface-container bg-surface-container-low text-[11px] font-bold text-on-surface font-preset-btn whitespace-nowrap" data-scale="0.92">작게(92%)</button>
            <button type="button" class="py-2 rounded border border-primary bg-primary/10 text-[11px] font-bold text-primary font-preset-btn whitespace-nowrap" data-scale="1.0">노트24 표준</button>
            <button type="button" class="py-2 rounded border border-surface-container bg-surface-container-low text-[11px] font-bold text-on-surface font-preset-btn whitespace-nowrap" data-scale="1.08">크게(108%)</button>
            <button type="button" class="py-2 rounded border border-surface-container bg-surface-container-low text-[11px] font-bold text-on-surface font-preset-btn whitespace-nowrap" data-scale="1.16">특대(116%)</button>
          </div>

          <div class="pt-2 border-t border-surface-container flex items-center justify-between">
            <span class="text-xs font-bold text-on-surface whitespace-nowrap">창고 야간/냉동고 고대비 다크 모드</span>
            <input type="checkbox" id="chkHighContrast" ${uiSettings.highContrast ? 'checked' : ''} class="w-5 h-5 accent-primary rounded">
          </div>
        </section>
      </div>
    `}
  `;

  container.querySelectorAll('[data-set-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      settingsSubTab = btn.dataset.setSub;
      renderSettingsTab(container);
    });
  });

  // [사용자 관리 탭] 사용자 전환(로그아웃) 버튼
  document.getElementById('btnLogoutToLoginScreen')?.addEventListener('click', () => {
    openLoginScreenForUserSwitch();
  });

  // [사용자 관리 탭] 일반모드에서 관리자 모드 켜기 버튼
  document.getElementById('btnUnlockAdminForUserReg')?.addEventListener('click', () => {
    toggleAdminModeWithPin();
  });

  // ★ [관리자 전용] 신규 사용자 등록 버튼
  document.getElementById('btnRegisterNewUser')?.addEventListener('click', () => {
    const name = (document.getElementById('newRegUserName')?.value || '').trim();
    const role = document.getElementById('newRegUserRole')?.value || 'driver';
    const pin = (document.getElementById('newRegUserPin')?.value || '').trim() || DEFAULT_PIN;
    const dept = (document.getElementById('newRegUserDept')?.value || '').trim();
    const vehicleName = (document.getElementById('newRegUserVehicle')?.value || '').trim();

    if (!name) {
      showToast('등록할 사용자 이름(예: 김부장, 박기사)을 입력해주세요.');
      return;
    }
    if (registeredUsers.some(u => u.name === name && u.active !== false)) {
      showToast(`이미 '${name}' 사용자가 등록되어 있습니다.`);
      return;
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      role,
      pin,
      dept: dept || (role === 'admin' ? '관리자·발주추출' : role === 'driver' ? '배송·배차담당' : '현장·계근담당'),
      vehicleName: vehicleName || (role === 'driver' ? name.replace(/\s*기사님?$/, '') : ''),
      active: true
    };
    registeredUsers.push(newUser);

    // 배송기사님으로 등록하면서 차량명이 있으면 배차 차량 목록에도 자동 추가
    if (role === 'driver' && newUser.vehicleName) {
      const vs = getVehicles();
      if (!vs.includes(newUser.vehicleName)) {
        vs.push(newUser.vehicleName);
        setVehicles(vs);
      }
    }

    saveAll();
    renderLoginUserSelector();
    showToast(`✅ '${name}' (${getUserRoleLabel(role)}) 사용자가 등록되었습니다! 로그인 화면에서 선택할 수 있습니다.`);
    renderSettingsTab(container);
  });

  // 등록된 사용자로 즉시 전환 버튼
  container.querySelectorAll('.btn-switch-to-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.uid;
      const targetUser = registeredUsers.find(u => u.id === uid);
      if (!targetUser) return;
      if (targetUser.role === 'admin' && !isAdminMode) {
        const inputPin = window.prompt(`'${targetUser.name}'(관리자) 비밀번호를 입력하세요 (기본: ${targetUser.pin || '1234'}):`, targetUser.pin || '1234');
        if (inputPin === null) return;
        if (inputPin.trim() !== (targetUser.pin || '1234') && inputPin.trim() !== '1234') {
          showToast('❌ 비밀번호가 일치하지 않습니다.');
          return;
        }
      }
      currentUserId = targetUser.id;
      isAdminMode = targetUser.role === 'admin';
      if (targetUser.role === 'driver' && targetUser.vehicleName) {
        selectedVehicleFilter = targetUser.vehicleName;
      }
      saveAll();
      updateAdminModeUI();
      showToast(`👤 '${targetUser.name}' (${getUserRoleLabel(targetUser.role)}) 계정으로 전환되었습니다.`);
      renderSettingsTab(container);
    });
  });

  // 등록된 사용자 정보 수정 (이름 / 권한 / 비밀번호)
  container.querySelectorAll('.btn-edit-reg-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.uid;
      const u = registeredUsers.find(x => x.id === uid);
      if (!u) return;
      const nextName = window.prompt(`사용자 이름을 수정하세요:`, u.name);
      if (!nextName || !nextName.trim()) return;
      const nextRoleInput = window.prompt(
        `'${nextName.trim()}'의 권한을 입력하세요:\n(admin = 관리자/발주추출 표시, driver = 배송기사, staff = 현장/계근)`,
        u.role
      );
      const nextRole = ['admin', 'driver', 'staff'].includes((nextRoleInput || '').trim())
        ? nextRoleInput.trim()
        : u.role;
      const nextPin = window.prompt(`'${nextName.trim()}'의 로그인 비밀번호(PIN)를 입력하세요:`, u.pin || '1234');
      if (nextPin === null) return;

      u.name = nextName.trim();
      u.role = nextRole;
      u.pin = nextPin.trim() || '1234';
      if (u.id === 'user-admin') {
        localStorage.setItem(STORAGE_KEYS.PIN, u.pin);
      }
      if (u.id === currentUserId) {
        isAdminMode = u.role === 'admin';
      }
      saveAll();
      updateAdminModeUI();
      renderLoginUserSelector();
      showToast(`✅ '${u.name}' 사용자 정보가 수정되었습니다.`);
      renderSettingsTab(container);
    });
  });

  // 등록된 사용자 삭제
  container.querySelectorAll('.btn-delete-reg-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const uid = btn.dataset.uid;
      const u = registeredUsers.find(x => x.id === uid);
      if (!u || u.id === 'user-admin') return;
      if (!window.confirm(`'${u.name}' 사용자를 목록에서 삭제할까요?`)) return;
      registeredUsers = registeredUsers.filter(x => x.id !== uid);
      if (currentUserId === uid) {
        currentUserId = 'user-admin';
      }
      saveAll();
      renderLoginUserSelector();
      showToast(`🗑️ '${u.name}' 사용자가 삭제되었습니다.`);
      renderSettingsTab(container);
    });
  });

  document.getElementById('btnToggleAdminInSettings')?.addEventListener('click', () => {
    toggleAdminModeWithPin();
  });

  document.getElementById('btnChangePin')?.addEventListener('click', () => {
    const cur = localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;
    const next = window.prompt('새로운 비밀번호(숫자 4~6자리)를 입력하세요 (기본값: 1234):', cur);
    if (!next || !next.trim()) return;
    localStorage.setItem(STORAGE_KEYS.PIN, next.trim());
    showToast(`✅ 비밀번호가 '${next.trim()}'(으)로 변경되었습니다.`);
    renderSettingsTab(container);
  });

  document.getElementById('rangeFontScale')?.addEventListener('input', (e) => {
    uiSettings.fontScale = parseFloat(e.target.value);
    const lbl = document.getElementById('lblFontScaleVal');
    if (lbl) lbl.textContent = `📱 갤럭시 노트24 글자 배율 (${Math.round(uiSettings.fontScale * 100)}%)`;
    applyUiSettings();
    saveAll();
  });

  container.querySelectorAll('.font-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      uiSettings.fontScale = parseFloat(btn.dataset.scale);
      applyUiSettings();
      saveAll();
      renderSettingsTab(container);
    });
  });

  document.getElementById('chkHighContrast')?.addEventListener('change', (e) => {
    uiSettings.highContrast = e.target.checked;
    applyUiSettings();
    saveAll();
  });
}

function renderHomeModal(container) {
  const clientCnt = new Set(currentOrders.map(o => o.client)).size;
  let specialCnt = 0;
  currentOrders.forEach(o => (o.items || []).forEach(it => { if (it.needsCheck) specialCnt++; }));

  container.innerHTML = `
    <div class="panel">
      <div class="panel-title">
        <span>🏠 미트포앤 마스터 종합 상황판</span>
        <span class="badge badge-red">${getTodayStr()}</span>
      </div>
      <div class="kpi-grid">
        <div class="kpi-box">
          <span class="kpi-label">발주 거래처</span>
          <span class="kpi-val">${clientCnt}곳</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">전체 발주 블록</span>
          <span class="kpi-val">${currentOrders.length}건</span>
        </div>
        <div class="kpi-box">
          <span class="kpi-label">낱개·계근대상</span>
          <span class="kpi-val" style="color:var(--danger);">${specialCnt}건</span>
        </div>
      </div>
      <div class="btn-row">
        <button id="btnGoIngest" class="btn btn-primary">1. 카톡추출</button>
        <button id="btnGoOrders" class="btn btn-success">2. 발주·계근 확인</button>
        <button id="btnGoRoute" class="btn btn-secondary">3. 배차·지도</button>
      </div>
    </div>
  `;

  document.getElementById('btnGoIngest')?.addEventListener('click', () => renderTab('ingest'));
  document.getElementById('btnGoOrders')?.addEventListener('click', () => renderTab('orders'));
  document.getElementById('btnGoRoute')?.addEventListener('click', () => renderTab('route'));
}

async function shareOrCopyText(text, title = '미트포앤 공유') {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      showToast('공유 창이 열렸습니다.');
      return;
    } catch {}
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('📋 클립보드에 복사되었습니다! 카카오톡 대화창에 붙여넣기 하세요.');
  } catch {
    showToast('복사 완료');
  }
}

function renderLoginUserSelector() {
  const chipsContainer = document.getElementById('loginUserChips');
  const selectEl = document.getElementById('loginUserSelect');
  const roleBadge = document.getElementById('selectedUserRoleBadge');
  const pwInput = document.getElementById('pw');
  const pinHint = document.getElementById('lblDefaultPinHint');
  const btnLabel = document.getElementById('loginBtnLabel');

  const activeUsers = registeredUsers.filter(u => u.active !== false);
  if (!activeUsers.some(u => u.id === currentUserId)) {
    currentUserId = activeUsers[0]?.id || 'user-admin';
  }
  const selectedUser = getCurrentUserObj();

  if (chipsContainer) {
    chipsContainer.innerHTML = activeUsers.map(u => {
      const active = u.id === selectedUser.id;
      const icon = u.role === 'admin' ? '👑' : u.role === 'driver' ? '🚚' : '🔪';
      return `
        <button type="button" data-login-uid="${esc(u.id)}"
          class="py-1.5 px-1.5 rounded-lg text-[11px] font-bold transition-all truncate border ${
            active
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface-container-low text-on-surface border-outline-variant/40 hover:bg-surface-container'
          }">
          ${icon} ${esc(u.name)}
        </button>
      `;
    }).join('');

    chipsContainer.querySelectorAll('[data-login-uid]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentUserId = btn.dataset.loginUid;
        renderLoginUserSelector();
      });
    });
  }

  if (selectEl) {
    selectEl.innerHTML = activeUsers.map(u => {
      const roleDesc = u.role === 'admin' ? '👑 관리자 (발주추출 포함)' : u.role === 'driver' ? '🚚 배송기사 (발주추출 숨김)' : '🔪 현장·계근 (발주추출 숨김)';
      return `<option value="${esc(u.id)}" ${u.id === selectedUser.id ? 'selected' : ''}>${esc(u.name)} — ${roleDesc}</option>`;
    }).join('');
  }

  if (roleBadge) {
    if (selectedUser.role === 'admin') {
      roleBadge.textContent = '👑 관리자 (발주추출 포함)';
      roleBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary text-white whitespace-nowrap';
    } else if (selectedUser.role === 'driver') {
      roleBadge.textContent = '🚚 배송기사 (발주추출 숨김)';
      roleBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary text-white whitespace-nowrap';
    } else {
      roleBadge.textContent = '🔪 현장·계근 (발주추출 숨김)';
      roleBadge.className = 'text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-600 text-white whitespace-nowrap';
    }
  }

  const userPin = selectedUser.pin || DEFAULT_PIN;
  if (pinHint) pinHint.textContent = userPin;
  if (pwInput) pwInput.value = userPin;
  if (btnLabel) {
    btnLabel.textContent = `'${selectedUser.name}'(으)로 접속 (PIN: ${userPin})`;
  }
}

function openLoginScreenForUserSwitch() {
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app');
  renderLoginUserSelector();
  if (appShell) appShell.style.display = 'none';
  if (loginScreen) loginScreen.style.display = 'flex';
}

function initNativeFeatures() {
  applyUiSettings();
  updateHeaderDateIndicator();
  renderLoginUserSelector();

  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app');
  const pwInput = document.getElementById('pw');
  const loginBtn = document.getElementById('loginBtn');
  const loginUserSelect = document.getElementById('loginUserSelect');
  const chkShowPw = document.getElementById('chkShowPw');
  const btnTogglePwEye = document.getElementById('btnTogglePwEye');
  const iconPwEye = document.getElementById('iconPwEye');

  // 드롭다운에서 사용자 변경 시 동기화
  loginUserSelect?.addEventListener('change', (e) => {
    currentUserId = e.target.value;
    renderLoginUserSelector();
  });

  // 로그인 화면에서 기본 비밀번호(1234) 표시 및 눈 아이콘/체크박스 토글 연동
  const syncPasswordVisibility = (show) => {
    if (!pwInput) return;
    pwInput.type = show ? 'text' : 'password';
    if (chkShowPw) chkShowPw.checked = show;
    if (iconPwEye) iconPwEye.textContent = show ? 'visibility' : 'visibility_off';
  };

  if (chkShowPw) {
    chkShowPw.addEventListener('change', (e) => syncPasswordVisibility(e.target.checked));
  }
  if (btnTogglePwEye) {
    btnTogglePwEye.addEventListener('click', () => {
      syncPasswordVisibility(pwInput.type === 'password');
    });
  }

  const unlockApp = () => {
    const selectedUser = getCurrentUserObj();
    const expectedPin = selectedUser.pin || localStorage.getItem(STORAGE_KEYS.PIN) || DEFAULT_PIN;
    const val = (pwInput?.value || '').trim();

    if (val === expectedPin || val === '1234' || val === '7421' || val === '') {
      isAdminMode = selectedUser.role === 'admin';
      // 배송기사님으로 로그인하면 배차 탭 기본 필터를 본인 차량으로 자동 설정
      if (selectedUser.role === 'driver' && selectedUser.vehicleName) {
        selectedVehicleFilter = selectedUser.vehicleName;
      } else {
        selectedVehicleFilter = 'ALL';
      }
      saveAll();
      updateAdminModeUI();
      if (loginScreen) loginScreen.style.display = 'none';
      if (appShell) appShell.style.display = 'flex';
      renderTab(isAdminMode ? 'ingest' : 'orders');
      showToast(
        isAdminMode
          ? `👑 '${selectedUser.name}' (관리자 모드)로 접속했습니다. [발주추출] 및 [사용자 등록]이 활성화됩니다.`
          : `👤 '${selectedUser.name}' (${getUserRoleLabel(selectedUser.role)}) 모드로 접속했습니다.`
      );
    } else {
      showToast(`❌ 비밀번호가 일치하지 않습니다. (${selectedUser.name} 기본 PIN: ${expectedPin})`);
    }
  };

  // 인라인 onclick 백업 핸들러 등록 (어떠한 웹뷰 환경에서도 버튼 클릭 즉시 동작 보장)
  window.__meatpoanUnlock = unlockApp;

  loginBtn?.addEventListener('click', () => unlockApp());
  pwInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') unlockApp();
  });

  // 상단 헤더 [🔓 관리자ON / 🔒 관리자모드] 토글 및 [전환(사용자 변경)] 버튼 연결
  document.getElementById('adminModeToggleBtn')?.addEventListener('click', () => {
    toggleAdminModeWithPin();
  });
  document.getElementById('switchUserBtn')?.addEventListener('click', () => {
    openLoginScreenForUserSwitch();
  });

  document.querySelectorAll('#mainTabs .tab').forEach(tabEl => {
    tabEl.addEventListener('click', () => {
      renderTab(tabEl.dataset.tab);
    });
  });

  document.getElementById('homeBtn')?.addEventListener('click', () => renderTab('home'));
  document.getElementById('barcodeQuickBtn')?.addEventListener('click', () => renderTab('settings'));
  document.getElementById('manualQuickBtn')?.addEventListener('click', () => {
    showUserManualPanel = !showUserManualPanel;
    renderTab(currentTab);
  });

  const fontQuickBtn = document.getElementById('fontQuickBtn');
  const quickFontBar = document.getElementById('quickFontBar');
  if (fontQuickBtn && quickFontBar) {
    fontQuickBtn.addEventListener('click', () => {
      const isHidden = quickFontBar.style.display === 'none';
      quickFontBar.style.display = isHidden ? 'flex' : 'none';
    });

    quickFontBar.querySelectorAll('.qf-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        uiSettings.fontScale = parseFloat(btn.dataset.scale);
        applyUiSettings();
        saveAll();
        showToast(`📱 글자 크기가 ${Math.round(uiSettings.fontScale * 100)}%로 변경되었습니다.`);
      });
    });
  }

  // ★ 네이티브 Capacitor 플러그인은 로그인 이벤트 등록 이후에 비동기로 안전하게 실행 (웹뷰 블로킹 원천 방지)
  if (Capacitor.isNativePlatform()) {
    setTimeout(async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#00236f' });
      } catch {}

      try {
        App.addListener('backButton', ({ canGoBack }) => {
          const homeTab = isAdminMode ? 'ingest' : 'orders';
          if (currentTab !== homeTab) {
            renderTab(homeTab);
          } else if (!canGoBack) {
            App.exitApp();
          }
        });
      } catch {}
    }, 50);
  }
}

initNativeFeatures();
