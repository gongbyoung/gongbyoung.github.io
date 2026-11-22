import {
  DEPOT_INFO,
  DEFAULT_BRANDS,
  DEFAULT_LOOSE,
  DEFAULT_MEATS,
  PRESET_ALIASES,
  PRESET_CLIENTS
} from './presetData.js';

/**
 * ============================================================================
 * 미트포앤 카카오톡 추출 프리셋 엔진 (Grok 알고리즘 + PC/모바일 전 포맷 호환 - src/kakaoGrokParser.js)
 * ----------------------------------------------------------------------------
 * [핵심 업그레이드 내역]
 * 1) PC/모바일(안드로이드·아이폰) 카카오톡 내보내기 전 포맷 완벽 지원
 *    - 보이지 않는 유니코드 제어문자(\u200b, \u200e 등), 전각 숫자(０~９), 특수 공백 자동 정규화
 *    - 날짜 구분선(--- 2026년 11월 4일 ---, 2026. 11. 4. 수요일, 2026-11-04 등) 전 형식 인식
 *    - 메시지 헤더([이름] [오전 9:10], [이름] [09:10], 2026년 11월 4일 오전 9:10, 이름 :,
 *      2026. 11. 4. 오전 9:10, 이름 :, 2026. 11. 4. 09:10, 이름 : 등) 전 형식 통합 인식
 * 2) 빈 줄(\n\n) 없이 줄바꿈만 한 다중 거래처 블록 및 '거래처명 품목 수량' 한 줄 발주까지 100% 분리
 * 3) 미트포앤 현장 맞춤형 [발주/계근 별도 확인 대상(classifyOrderItem)] 정밀 판별:
 *    - 단위가 없으면 무조건 '박스(Box)'
 *    - 별도 챙김/계근 확인 대상 (PDA 미인식 품목):
 *      ① '특'이 들어가는 냉장 품목 (특삼겹, 특미삼, 특목살, 특삼, 특목 등)
 *      ② 수입육 중 숫자 3~4자리 개체번호가 들어가는 품목 및 '~~~개' 단위 품목
 *      ③ 팩, 봉지, 키로(kg), 덩이, 판, 벌, 마리, 개 등 박스를 제외한 모든 단위
 * ============================================================================
 */

const CFG_KEY = 'meatpoan_admin_cfg_v1';

let customClients = [];
let customAliases = {};
let customBrands = [];
let customMeats = [];
let customLoose = [];

export function loadGrokPresetConfig() {
  try {
    const raw = localStorage.getItem(CFG_KEY);
    if (!raw) {
      customBrands = DEFAULT_BRANDS.slice();
      customLoose = DEFAULT_LOOSE.slice();
      customMeats = DEFAULT_MEATS.map(x => x.slice());
      customAliases = {};
      customClients = [];
      return;
    }
    const cfg = JSON.parse(raw);
    customBrands = Array.isArray(cfg.brands) && cfg.brands.length ? cfg.brands : DEFAULT_BRANDS.slice();
    customLoose = Array.isArray(cfg.loose) && cfg.loose.length ? cfg.loose : DEFAULT_LOOSE.slice();
    customMeats = Array.isArray(cfg.meats) && cfg.meats.length ? cfg.meats : DEFAULT_MEATS.map(x => x.slice());
    customAliases = cfg.aliases && typeof cfg.aliases === 'object' ? cfg.aliases : {};
    customClients = Array.isArray(cfg.clients) ? cfg.clients : [];
  } catch {
    customBrands = DEFAULT_BRANDS.slice();
    customLoose = DEFAULT_LOOSE.slice();
    customMeats = DEFAULT_MEATS.map(x => x.slice());
    customAliases = {};
    customClients = [];
  }
}

export function saveGrokPresetConfig(partial = {}) {
  if (partial.brands) customBrands = partial.brands;
  if (partial.loose) customLoose = partial.loose;
  if (partial.meats) customMeats = partial.meats;
  if (partial.aliases) customAliases = partial.aliases;
  if (partial.clients) customClients = partial.clients;
  const cfg = {
    brands: customBrands,
    loose: customLoose,
    meats: customMeats,
    aliases: customAliases,
    clients: customClients
  };
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
}

loadGrokPresetConfig();

export function getAllClients() {
  return PRESET_CLIENTS.concat(customClients);
}

export function getAllAliases() {
  return Object.assign({}, PRESET_ALIASES, customAliases);
}

export function getCustomConfigState() {
  return {
    brands: customBrands,
    loose: customLoose,
    meats: customMeats,
    aliases: customAliases,
    clients: customClients
  };
}

export function getBrandPattern() {
  const list = customBrands && customBrands.length ? customBrands : DEFAULT_BRANDS;
  return list.map(b => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
}

export function getLooseUnits() {
  return customLoose && customLoose.length ? customLoose : DEFAULT_LOOSE;
}

// ---------- 0. PC/모바일 카톡 텍스트 및 숫자 정규화 ----------
const CIRCLED_NUM_MAP = {
  '①': '1', '②': '2', '③': '3', '④': '4', '⑤': '5',
  '⑥': '6', '⑦': '7', '⑧': '8', '⑨': '9', '⑩': '10',
  '⑪': '11', '⑫': '12', '⑬': '13', '⑭': '14', '⑮': '15',
  '⑯': '16', '⑰': '17', '⑱': '18', '⑲': '19', '⑳': '20'
};

export function cleanKakaoText(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/^\uFEFF/, '')
    // 모바일(안드로이드/iOS) 카톡 내보내기 시 숫자·날짜 앞뒤에 붙는 방향 제어문자 및 특수 공백 제거
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
    // 전각 숫자(０~９) -> 반각 아스키 숫자(0~9)
    .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    // 원문자 숫자(①~⑳) -> 일반 숫자
    .replace(/[①-⑳]/g, ch => CIRCLED_NUM_MAP[ch] || ch)
    // 전각 괄호/구두점 정규화
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/：/g, ':')
    .replace(/．/g, '.')
    .replace(/，/g, ',')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

function normalizeYear(yNum) {
  const y = Number(yNum);
  if (y >= 100) return y;
  return 2000 + y;
}

// ---------- 1. 인코딩 자동 감지 (모바일/PC 카톡 TXT 깨짐 방지) ----------
function decodeBuffer(buf, enc) {
  try {
    return new TextDecoder(enc, { fatal: false }).decode(buf);
  } catch {
    return '';
  }
}

function scoreDecodedText(t) {
  if (!t) return -1;
  const cleaned = cleanKakaoText(t);
  let score = 0;
  const hangul = cleaned.match(/[가-힣]/g);
  score += hangul ? hangul.length * 2 : 0;
  const datesKor = cleaned.match(/20\d{2}\s*년\s*\d{1,2}\s*월\s*\d{1,2}\s*일/g);
  score += datesKor ? datesKor.length * 200 : 0;
  const datesDot = cleaned.match(/20\d{2}\s*[.\-/]\s*\d{1,2}\s*[.\-/]\s*\d{1,2}/g);
  score += datesDot ? datesDot.length * 150 : 0;
  if (/\[오전|\[오후|\[\d{1,2}:\d{2}\]/.test(cleaned)) score += 80;
  if (/(?:오전|오후)?\s*\d{1,2}:\d{2}\s*,/.test(cleaned)) score += 100;
  if (/한재호|미트포앤|매출방/.test(cleaned)) score += 120;
  if (/---------------/.test(cleaned) || /-{5,}/.test(cleaned)) score += 60;
  const bad = cleaned.match(/\uFFFD/g);
  score -= bad ? bad.length * 5 : 0;
  const hanja = cleaned.match(/[\u4e00-\u9fff]/g);
  if (hanja && hangul) {
    if (hanja.length > hangul.length) score -= 100;
  } else if (hanja && !hangul) {
    score -= 50;
  }
  return score;
}

export function pickBestDecode(buf) {
  const u8 = new Uint8Array(buf);
  if (u8.length >= 2 && u8[0] === 0xff && u8[1] === 0xfe) {
    return { text: cleanKakaoText(decodeBuffer(buf, 'utf-16le')), enc: 'utf-16le(BOM)' };
  }
  if (u8.length >= 2 && u8[0] === 0xfe && u8[1] === 0xff) {
    return { text: cleanKakaoText(decodeBuffer(buf, 'utf-16be')), enc: 'utf-16be(BOM)' };
  }
  if (u8.length >= 3 && u8[0] === 0xef && u8[1] === 0xbb && u8[2] === 0xbf) {
    return { text: cleanKakaoText(decodeBuffer(buf, 'utf-8')), enc: 'utf-8(BOM)' };
  }
  let nullOdd = 0;
  const sampleLen = Math.min(u8.length, 400);
  for (let i = 0; i < sampleLen; i++) {
    if (u8[i] === 0 && i % 2 === 1) nullOdd++;
  }
  const candidates = [];
  const tryEnc = ['utf-8', 'euc-kr', 'utf-16le', 'utf-16be'];
  if (nullOdd > sampleLen / 8) {
    tryEnc.unshift('utf-16le');
  }
  for (const enc of tryEnc) {
    const raw = decodeBuffer(buf, enc);
    const text = cleanKakaoText(raw);
    const score = scoreDecodedText(text);
    candidates.push({ text, enc, score });
  }
  candidates.sort((a, b) => b.score - a.score);
  for (const c of candidates) {
    if (extractDates(c.text).length > 0) return c;
  }
  return candidates[0] || { text: '', enc: 'utf-8', score: -1 };
}

// ---------- 2. 날짜 추출 및 배송일 시간창 계산 (PC·모바일 모든 날짜 형식 지원) ----------
export function parseKoreanDate(str) {
  const s = cleanKakaoText(str);
  // 1) 2026년 11월 4일 (수요일) / 26년 11월 4일
  let m = s.match(/(20\d{2}|\b\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일(?:\s*\(?([월화수목금토일])(?:요일)?\)?)?/);
  if (m) {
    const y = normalizeYear(m[1]);
    const mo = +m[2];
    const d = +m[3];
    if (y >= 2020 && y <= 2099 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return { y, mo, d, dow: m[4] ? `${m[4]}요일` : '' };
    }
  }
  // 2) 2026. 11. 4. / 26. 11. 4. / 2026-11-04 / 2026/11/04 (모바일/PC 점·하이픈·슬래시 날짜)
  m = s.match(/(20\d{2}|\b\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\.?(?:\s*\(?([월화수목금토일])(?:요일)?\)?)?/);
  if (m) {
    const y = normalizeYear(m[1]);
    const mo = +m[2];
    const d = +m[3];
    if (y >= 2020 && y <= 2099 && mo >= 1 && mo <= 12 && d >= 1 && d <= 31) {
      return { y, mo, d, dow: m[4] ? `${m[4]}요일` : '' };
    }
  }
  return null;
}

export function toDateObj(y, mo, d) {
  return new Date(y, mo - 1, d);
}

export function formatKey(dt) {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${dt.getFullYear()}년 ${dt.getMonth() + 1}월 ${dt.getDate()}일 ${days[dt.getDay()]}`;
}

export function extractDates(rawText) {
  const text = cleanKakaoText(rawText);
  const dates = [];
  const seen = new Set();

  function addParsed(yRaw, mo, d, isSynthetic = false, suffix = '') {
    const y = normalizeYear(yRaw);
    if (!y || y < 2020 || y > 2099 || mo < 1 || mo > 12 || d < 1 || d > 31) return;
    const dt = toDateObj(y, mo, d);
    if (isNaN(dt.getTime())) return;
    const key = formatKey(dt);
    if (seen.has(key)) return;
    seen.add(key);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    dates.push({
      key,
      label: key.replace(/^(20\d{2})년\s*/, '') + (suffix ? ` ${suffix}` : ''),
      y,
      mo,
      d,
      dow: days[dt.getDay()],
      isSynthetic
    });
  }

  function addRaw(raw) {
    const parsed = parseKoreanDate(raw);
    if (parsed) addParsed(parsed.y, parsed.mo, parsed.d, false, '');
  }

  let m;
  // 1) PC/모바일 구분선 날짜: --------------- 2026년 11월 4일 수요일 --------------- 또는 --- 2026. 11. 4. ---
  const re1 = /-{2,}\s*([^\n-]+?(?:20\d{2}|\d{2}\s*년|\d{2}\.\s*\d{1,2})[^\n-]+?)\s*-{2,}/g;
  while ((m = re1.exec(text)) !== null) addRaw(m[1]);

  // 2) 단독 줄 날짜 헤더: 2026년 11월 4일 수요일 / 2026. 11. 4. 수요일 / 2026-11-04
  const re2 = /(?:^|\n)\s*((?:20\d{2}|\d{2})\s*(?:년|[.\-/])\s*\d{1,2}\s*(?:월|[.\-/])\s*\d{1,2}\s*(?:일|\.)?(?:\s*\(?[월화수목금토일](?:요일)?\)?)?)\s*(?:\n|$)/g;
  while ((m = re2.exec(text)) !== null) addRaw(m[1]);

  // 3) 인라인 메시지 날짜 (한국어 '년 월 일'): 2026년 11월 4일 오전 9:10
  const re3 = /(20\d{2}|\b\d{2})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/g;
  while ((m = re3.exec(text)) !== null) {
    addParsed(+m[1], +m[2], +m[3]);
  }

  // 4) 인라인 메시지 날짜 (모바일/PC 점·하이픈·슬래시·CSV): 2026. 11. 4. 오전 9:10 또는 2026-11-04 09:10:25
  const re4 = /(?:^|\n)\s*"?(20\d{2}|\d{2})\s*[.\-/]\s*(\d{1,2})\s*[.\-/]\s*(\d{1,2})\.?\s*(?:\(?[월화수목금토일](?:요일)?\)?\s*)?(?:오전|오후|AM|PM|\d{1,2}:\d{2})/gi;
  while ((m = re4.exec(text)) !== null) {
    addParsed(+m[1], +m[2], +m[3]);
  }

  const realDates = dates.slice();

  // 금·토·일 대화가 있으면 다음 월요일 배송일 후보 자동 추가
  realDates.forEach(d => {
    const dt = toDateObj(d.y, d.mo, d.d);
    const day = dt.getDay();
    if (day === 5 || day === 6 || day === 0) {
      const mon = new Date(dt);
      if (day === 5) mon.setDate(mon.getDate() + 3);
      else if (day === 6) mon.setDate(mon.getDate() + 2);
      else mon.setDate(mon.getDate() + 1);
      addParsed(mon.getFullYear(), mon.getMonth() + 1, mon.getDate(), true, '(금토일 발주)');
    }
  });

  // 파일 마지막 실제 날짜의 다음날 후보 추가 (단, isSynthetic=true 표시하여 기본 자동선택에서 오늘 발주를 가리지 않게 함!)
  if (realDates.length) {
    const last = realDates.slice().sort((a, b) => toDateObj(a.y, a.mo, a.d) - toDateObj(b.y, b.mo, b.d)).pop();
    if (last && last.y) {
      const nxt = toDateObj(last.y, last.mo, last.d);
      nxt.setDate(nxt.getDate() + 1);
      addParsed(nxt.getFullYear(), nxt.getMonth() + 1, nxt.getDate(), true, '(다음날)');
    }
  }

  dates.sort((a, b) => toDateObj(a.y || 0, a.mo || 0, a.d || 0) - toDateObj(b.y || 0, b.mo || 0, b.d || 0));
  return dates;
}

export function parseMsgTime(timeStr) {
  const s = cleanKakaoText(timeStr).trim();
  if (!s) return { h: 9, mi: 0, label: '오전 09:00' };

  // 1) 오전/오후 9:10(:25) 또는 AM/PM 9:10
  let m = s.match(/(오전|오후|AM|PM|am|pm)\s*(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?/);
  if (m) {
    const apRaw = m[1].toUpperCase();
    const isPm = apRaw === '오후' || apRaw === 'PM';
    const isAm = apRaw === '오전' || apRaw === 'AM';
    let h = parseInt(m[2], 10);
    const mi = parseInt(m[3], 10);
    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;
    const apKor = h >= 12 ? '오후' : '오전';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { h, mi, label: `${apKor} ${h12}:${String(mi).padStart(2, '0')}` };
  }

  // 2) 9:10 AM / 9:10 PM
  m = s.match(/(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?\s*(AM|PM|am|pm|오전|오후)/);
  if (m) {
    const apRaw = m[3].toUpperCase();
    const isPm = apRaw === '오후' || apRaw === 'PM';
    const isAm = apRaw === '오전' || apRaw === 'AM';
    let h = parseInt(m[1], 10);
    const mi = parseInt(m[2], 10);
    if (isPm && h < 12) h += 12;
    if (isAm && h === 12) h = 0;
    const apKor = h >= 12 ? '오후' : '오전';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { h, mi, label: `${apKor} ${h12}:${String(mi).padStart(2, '0')}` };
  }

  // 3) 24시간제: 09:10, 14:25, 14:25:30
  m = s.match(/(\d{1,2})\s*:\s*(\d{2})(?::\d{2})?/);
  if (m) {
    const h = parseInt(m[1], 10);
    const mi = parseInt(m[2], 10);
    const apKor = h >= 12 ? '오후' : '오전';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return { h, mi, label: `${apKor} ${h12}:${String(mi).padStart(2, '0')}` };
  }

  return { h: 9, mi: 0, label: s || '오전 09:00' };
}

export function getWindowRange(deliveryKey) {
  if (!deliveryKey || deliveryKey === 'ALL') return null;
  const p = parseKoreanDate(deliveryKey);
  if (!p) return null;
  const delivery = toDateObj(p.y, p.mo, p.d);
  const dow = delivery.getDay();
  let start, end;
  // 당일 오후/저녁 발주도 누락되지 않도록 당일 23:59:59까지 포함
  if (dow === 1) {
    start = new Date(delivery);
    start.setDate(start.getDate() - 3);
    start.setHours(12, 0, 0, 0);
    end = new Date(delivery);
    end.setHours(23, 59, 59, 999);
  } else if (dow === 0 || dow === 6) {
    const mon = new Date(delivery);
    if (dow === 6) mon.setDate(mon.getDate() + 2);
    else mon.setDate(mon.getDate() + 1);
    start = new Date(mon);
    start.setDate(start.getDate() - 3);
    start.setHours(12, 0, 0, 0);
    end = new Date(mon);
    end.setHours(23, 59, 59, 999);
    return { start, end, delivery: mon, isMonday: true, mappedFromWeekend: true };
  } else {
    start = new Date(delivery);
    start.setDate(start.getDate() - 1);
    start.setHours(12, 0, 0, 0);
    end = new Date(delivery);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end, delivery, isMonday: dow === 1 };
}

export function formatWindowLabel(range) {
  if (!range) return '전체 날짜 구간 (시간 제한 없음)';
  const f = dt => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${dt.getMonth() + 1}/${dt.getDate()}(${days[dt.getDay()]}) ${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  };
  return `수집구간: ${f(range.start)} ~ ${f(range.end)}`;
}

// ---------- 3. 카톡 메시지 통합 추출기 (PC / 안드로이드 / 아이폰 / CSV / 복붙 완벽 호환) ----------
export function getAllDatedMessages(rawText, rangeStart, rangeEnd) {
  const text = cleanKakaoText(rawText);
  if (!text.trim()) return [];

  const lines = text.split('\n');
  const msgs = [];
  const now = new Date();
  let curDay = {
    y: now.getFullYear(),
    mo: now.getMonth() + 1,
    d: now.getDate(),
    dayKey: formatKey(now),
    hasExplicitDate: false
  };
  let curMsg = null;

  let curMsgSender = '';
  let curMsgTime = '';
  let curMsgDt = now;
  let curMsgDayKey = curDay.dayKey;
  let curMsgHasDate = false;

  function startNewMsg(sender, timeLabel, dt, dayKey, firstBodyLine, hasDate) {
    if (curMsg) {
      const body = curMsg.lines.join('\n').trim();
      if (
        body &&
        !(
          /을 초대했습니다|나갔습니다|들어왔습니다|삭제된 메시지|채팅방 관리자가|메시지를 가렸습니다/.test(body) &&
          body.length < 90 &&
          !/\d+\s*(박스|박|팩|키로|kg|봉지|개|덩이)/i.test(body)
        )
      ) {
        if (!rangeStart || !rangeEnd || !curMsgHasDate || (curMsgDt >= rangeStart && curMsgDt <= rangeEnd)) {
          msgs.push({
            sender: curMsgSender,
            time: curMsgTime,
            text: body,
            dt: curMsgDt,
            dayKey: curMsgDayKey
          });
        }
      }
    }
    curMsgSender = (sender || '현장대화방').trim();
    curMsgTime = timeLabel || '오전 09:00';
    curMsgDt = dt;
    curMsgDayKey = dayKey;
    curMsgHasDate = Boolean(hasDate);
    curMsg = {
      lines: firstBodyLine !== undefined && firstBodyLine !== '' ? [firstBodyLine] : []
    };
  }

  // 정규식 패턴들
  // 1) 날짜 구분선: --------------- 2026년 11월 4일 수요일 --------------- 또는 단독 날짜 줄
  const dateHeaderDashRe = /^-{2,}\s*(.+?)\s*-{2,}$/;
  const dateHeaderPureRe = /^((?:20\d{2}|\d{2})\s*(?:년|[.\-/])\s*\d{1,2}\s*(?:월|[.\-/])\s*\d{1,2}\s*(?:일|\.)?(?:\s*\(?[월화수목금토일](?:요일)?\)?)?)$/;

  // 2) PC 카톡 대괄호 헤더: [보낸이] [오전 9:10] 내용 (보낸이 이름 안에 대괄호 [[미트포앤] 한재호]가 있어도 완벽 매칭!)
  const pcBracketRe = /^\[(.+?)\]\s*\[((?:오전|오후|AM|PM|am|pm)?\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|am|pm))?)\]\s*(.*)$/;
  // 역순 대괄호: [오전 9:10] [보낸이] 내용
  const pcBracketRevRe = /^\[((?:오전|오후|AM|PM|am|pm)?\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|am|pm))?)\]\s*\[(.+?)\]\s*(.*)$/;
  // 보낸이 대괄호 없이 시간만 대괄호인 복붙 형식: 한재호 [오전 9:10] 내용
  const nameBracketTimeRe = /^([^[\]:\n]{1,30}?)\s+\[((?:오전|오후|AM|PM|am|pm)?\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|am|pm))?)\]\s*(.*)$/;

  // 3) 모바일/PC 인라인 날짜+시간+보낸이:
  // 예: 2026년 11월 4일 오전 9:10, 한재호(주)미트포앤 : 내용
  // 예: 2026. 11. 4. (수) 오전 9:10, 한재호 : 내용
  // 예: 26. 11. 4. 09:10, 한재호 : 내용
  // 예: 2026-11-04 09:10:25, 한재호 : 내용
  const mobileInlineRe = /^(20\d{2}|\d{2})\s*(?:년|[.\-/])\s*(\d{1,2})\s*(?:월|[.\-/])\s*(\d{1,2})\s*(?:일|\.)?\s*(?:\(?[월화수목금토일](?:요일)?\)?\s*)?(?:,\s*)?((?:오전|오후|AM|PM|am|pm)?\s*\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM|am|pm))?)\s*[,，]\s*([^:\n]+?)\s*:\s*(.*)$/;

  // 3-B) 카톡 맥/CSV 내보내기 형식: 2026-11-04 09:10:25,"한재호","내용" 또는 2026-11-04 09:10:25,한재호,내용
  const csvInlineRe = /^"?(20\d{2}|\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})\s+(\d{1,2}:\d{2}(?::\d{2})?)"?\s*,\s*"?([^",\n]+?)"?\s*,\s*"?(.*)$/;

  // 4) 모바일 시스템 메시지 줄 (보낸이 콜론 없음: 2026년 11월 4일 오전 9:10, OOO님이 초대했습니다)
  const mobileSysRe = /^(20\d{2}|\d{2})\s*(?:년|[.\-/])\s*(\d{1,2})\s*(?:월|[.\-/])\s*(\d{1,2})\s*(?:일|\.)?\s*(?:\(?[월화수목금토일](?:요일)?\)?\s*)?((?:오전|오후|AM|PM|am|pm)?\s*\d{1,2}:\d{2}(?::\d{2})?)\s*,\s*(.+)$/;

  // 5) 날짜 헤더 아래 시간+보낸이만 있는 인라인: 오전 9:10, 한재호 : 내용
  const timeOnlyInlineRe = /^((?:오전|오후|AM|PM|am|pm)\s*\d{1,2}:\d{2}(?::\d{2})?|\d{1,2}:\d{2}(?::\d{2})?)\s*,\s*([^:\n]+?)\s*:\s*(.*)$/;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // A. 구분선 날짜 헤더 확인
    const dm1 = trimmed.match(dateHeaderDashRe);
    if (dm1) {
      const p = parseKoreanDate(dm1[1]);
      if (p) {
        startNewMsg('', '', curMsgDt, curDay.dayKey, '', curDay.hasExplicitDate);
        curMsg = null;
        curDay = {
          y: p.y,
          mo: p.mo,
          d: p.d,
          dayKey: formatKey(toDateObj(p.y, p.mo, p.d)),
          hasExplicitDate: true
        };
        continue;
      }
    }

    // B. 단독 날짜 줄 확인
    const dm2 = trimmed.match(dateHeaderPureRe);
    if (dm2) {
      const p = parseKoreanDate(dm2[1]);
      if (p) {
        startNewMsg('', '', curMsgDt, curDay.dayKey, '', curDay.hasExplicitDate);
        curMsg = null;
        curDay = {
          y: p.y,
          mo: p.mo,
          d: p.d,
          dayKey: formatKey(toDateObj(p.y, p.mo, p.d)),
          hasExplicitDate: true
        };
        continue;
      }
    }

    // C. 모바일/PC 인라인 날짜+시간+보낸이 확인
    const im = trimmed.match(mobileInlineRe);
    if (im) {
      const y = normalizeYear(im[1]);
      const mo = +im[2];
      const d = +im[3];
      const tInfo = parseMsgTime(im[4]);
      const sender = im[5].trim();
      const firstBody = im[6];
      const dt = new Date(y, mo - 1, d, tInfo.h, tInfo.mi, 0);
      const dayKey = formatKey(new Date(y, mo - 1, d));
      curDay = { y, mo, d, dayKey, hasExplicitDate: true };
      startNewMsg(sender, tInfo.label, dt, dayKey, firstBody, true);
      continue;
    }

    // C-2. CSV 내보내기 줄 확인
    const cm = trimmed.match(csvInlineRe);
    if (cm) {
      const y = normalizeYear(cm[1]);
      const mo = +cm[2];
      const d = +cm[3];
      const tInfo = parseMsgTime(cm[4]);
      const sender = cm[5].trim();
      const firstBody = cm[6].replace(/"$/, '');
      const dt = new Date(y, mo - 1, d, tInfo.h, tInfo.mi, 0);
      const dayKey = formatKey(new Date(y, mo - 1, d));
      curDay = { y, mo, d, dayKey, hasExplicitDate: true };
      startNewMsg(sender, tInfo.label, dt, dayKey, firstBody, true);
      continue;
    }

    // D. 모바일 시스템 메시지 줄 확인 (이전 메시지 flush 후 스킵)
    const sm = trimmed.match(mobileSysRe);
    if (sm && /초대했습니다|나갔습니다|들어왔습니다|가렸습니다|삭제된 메시지|저장한 날짜|운영정책/.test(sm[5])) {
      startNewMsg('', '', curMsgDt, curDay.dayKey, '', curDay.hasExplicitDate);
      curMsg = null;
      continue;
    }

    // E. PC 대괄호 메시지 확인: [보낸이] [시간] 내용
    const pm = trimmed.match(pcBracketRe);
    if (pm) {
      const sender = pm[1].trim();
      const tInfo = parseMsgTime(pm[2]);
      const firstBody = pm[3];
      const dt = new Date(curDay.y, curDay.mo - 1, curDay.d, tInfo.h, tInfo.mi, 0);
      startNewMsg(sender, tInfo.label, dt, curDay.dayKey, firstBody, curDay.hasExplicitDate);
      continue;
    }

    const pmRev = trimmed.match(pcBracketRevRe);
    if (pmRev) {
      const tInfo = parseMsgTime(pmRev[1]);
      const sender = pmRev[2].trim();
      const firstBody = pmRev[3];
      const dt = new Date(curDay.y, curDay.mo - 1, curDay.d, tInfo.h, tInfo.mi, 0);
      startNewMsg(sender, tInfo.label, dt, curDay.dayKey, firstBody, curDay.hasExplicitDate);
      continue;
    }

    const nbt = trimmed.match(nameBracketTimeRe);
    if (nbt && !looksLikeItemLine(trimmed, true)) {
      const sender = nbt[1].trim();
      const tInfo = parseMsgTime(nbt[2]);
      const firstBody = nbt[3];
      const dt = new Date(curDay.y, curDay.mo - 1, curDay.d, tInfo.h, tInfo.mi, 0);
      startNewMsg(sender, tInfo.label, dt, curDay.dayKey, firstBody, curDay.hasExplicitDate);
      continue;
    }

    // F. 시간+보낸이 인라인 메시지 확인: 오전 9:10, 이름 : 내용
    const tm = trimmed.match(timeOnlyInlineRe);
    if (tm) {
      const tInfo = parseMsgTime(tm[1]);
      const sender = tm[2].trim();
      const firstBody = tm[3];
      const dt = new Date(curDay.y, curDay.mo - 1, curDay.d, tInfo.h, tInfo.mi, 0);
      startNewMsg(sender, tInfo.label, dt, curDay.dayKey, firstBody, curDay.hasExplicitDate);
      continue;
    }

    // G. 카톡 상단 메타 안내줄 스킵 ("OOO 님과 카카오톡 대화", "저장한 날짜 : ...", CSV 헤더)
    if (i < 5 && (/님과 카카오톡 대화|카카오톡 대화 내용|저장한 날짜\s*:|^Date,User,Message$/i.test(trimmed))) {
      continue;
    }

    // H. 일반 본문 줄 (현재 메시지에 이어붙임, 아직 메시지가 없으면 직접 붙여넣기 메시지로 시작)
    if (!curMsg) {
      if (!trimmed) continue;
      const dt = new Date(curDay.y, curDay.mo - 1, curDay.d, 9, 0, 0);
      startNewMsg('미트포앤(직접입력)', '오전 09:00', dt, curDay.dayKey, rawLine.replace(/"$/, ''), false);
    } else {
      curMsg.lines.push(rawLine.replace(/"$/, ''));
    }
  }

  // 마지막 메시지 flush
  if (curMsg) {
    startNewMsg('', '', curMsgDt, curDay.dayKey, '', curDay.hasExplicitDate);
    curMsg = null;
  }

  return msgs;
}

// ---------- 4. 거래처 매칭, 품목/단위/계근 판별 (Grok 핵심 알고리즘 + 현장 특화 개선) ----------
const POLITE_RE = /부탁|주세요|보내주|보내세|이상입니다|감사|수고|안녕하|문자드립|이렇게|네요|해요|합니다|드립니다|입니다|오후에|아침에|수정\s*했|홀에|놔주|되세|만이요|보내주세|드리겠습니다/;

const GREETING_ONLY_WORDS_RE = /^(사장님|대표님|과장님|부장님|차장님|실장님|팀장님|소장님|점장님|기사님|선생님|여사님|사모님|선배님|형님|누님|언니|오빠\s*발주|안녕하세요|수고하십니다|수고하세요|감사합니다|고맙습니다|부탁드립니다|발주서?|주문서?|추가발주|정정발주|내일발주|오늘발주|금일발주|명일발주|발주입니다|발주드립니다|발주합니다|주문입니다|주문드립니다|주문합니다|내일|오늘|모레|금일|명일|추가|정정|급급|최종)$/;

const MEAT_KEYWORD_RE = /(삼겹|특삼|암삼|미삼|암미|특미|오겹|목살|특목|B목|목심|전지|미전지|목전지|앞다리|뒷다리|갈비|등갈비|LA갈비|갈비살|진갈비|꽃갈비|본갈비|우대갈비|등심|꽃등심|채끝|안심|사태|앞미|아롱|항정|가브리|갈매기|등뼈|목뼈|왕뼈|사골|잡뼈|꼬리|도가니|스지|우족|후지|미후지|3mm|돈피|왕구이|차돌|우삼겹|우삼|양지|업진|볼라|홍두깨|설도|보섭|도가니살|삼각살|꾸리|부채|살치|늑간|토시|안창|치마|제비|업진안살|차돌박이|민찌|다짐육|지방|기름|냉삼|대패|수삼|모돈|미니족|장족|족발|프렌치|프렌치렉|숄더렉|보쌈|수육|국거리|불고기|돈까스|육회|곱창|막창|대창|특양|염통|내장|머릿고기|편육|순대|닭|오리|훈제)/i;

// 정식 상호명에 고기 단어가 포함되어 있어도 품목이 아니라 거래처인 곳 판별용
const STORE_SUFFIX_RE = /(축산|정육|마트|푸드|유통|반점|식당|회관|식육|갈비|보쌈|삼겹살|막창|곱창|부대|찌개|국밥|설렁탕|곰탕|순대|감자탕|족발|회센타|가든|본점|지점|호점|점|집|촌|관|방앗간|스토어|마켓|상회|상사|엔쌈|명가|연구소|팩토리)$/;

export function isMeatpoanStaff(sender) {
  const s = String(sender || '').trim();
  if (!s) return false;
  return /미트포앤|한재호|김석민|표혜영|김태호|조남식|신동현|양주용|이명수|김성은|오민환|엔젤|김영복|윤상호|영민|이명석|최규진|승호|진우|현장대화방/.test(s);
}

/**
 * 거래처 헤더 줄에서 앞뒤에 붙은 '내일/오늘', '발주입니다/발주드립니다/추가발주' 등의 수식어를 깔끔히 걷어내고
 * 순수 거래처명만 남기는 함수 (단순 인사말/호칭만 있는 줄이면 '' 반환)
 */
export function cleanClientHeaderLine(rawLine) {
  let s = String(rawLine || '')
    .replace(/[●■☆★♥❤️⭐️*~]/g, '')
    .trim();
  if (!s) return '';

  // [거래처명] 발주입니다 -> 거래처명
  const bracketPrefix = s.match(/^\[([^\]]+)\]\s*(?:(?:내일|오늘|모레|금일|명일|추가|정정|급급|최종)?\s*(?:발주서?|주문서?|발주|주문)?\s*(?:입니다|드립니다|합니다|드려요|부탁드립니다|요)?[.!~]*)?$/);
  if (bracketPrefix) {
    s = bracketPrefix[1].trim();
  }

  // 앞머리 호칭/인사말 제거: "사장님 태광 발주입니다" -> "태광 발주입니다"
  s = s.replace(/^(?:안녕하세요|사장님|대표님|실장님|과장님|팀장님|선생님|수고하십니다)[,!~\s]+/, '').trim();

  // 앞머리 날짜/상태 수식어 제거: "내일 추가 태광" -> "태광"
  s = s.replace(/^(?:(?:내일|오늘|모레|금일|명일|월요일|화요일|수요일|목요일|금요일|토요일|일요일|오전중?|오후에?|추가|정정|급급|최종|긴급|예약분?)\s+)+/g, '').trim();

  // 뒷머리 발주/인사 접미어 제거: "태광 내일 발주입니다" -> "태광", "사동쌈엔쌈 발주" -> "사동쌈엔쌈"
  s = s.replace(/\s+(?:내일|오늘|모레|금일|명일|추가|정정|급급|최종|오전중?|오후에?)?\s*(?:발주서?|주문서?|발주분?|주문분?|납품분?|출고분?|꺼)?\s*(?:입니다|드립니다|합니다|드려요|올립니다|요청합니다|부탁드립니다|부탁해요|보냅니다|요)[.!~]*$/g, '').trim();
  s = s.replace(/\s+(?:발주서?|주문서?|발주|주문|추가발주|정정발주|내일발주|오늘발주|내일꺼|오늘꺼|추가분?|정정분?|예약분?)[.!~]*$/g, '').trim();
  s = s.replace(/(?:추가|정정|급급|최종|예약분?)$/g, '').trim();
  s = s.replace(/^\[([^\]]+)\]$/, '$1').trim();

  if (!s || GREETING_ONLY_WORDS_RE.test(s.replace(/\s+/g, ''))) return '';
  return s;
}

export function isPoliteOnly(text) {
  const t = (text || '').trim();
  if (!t) return true;
  if (GREETING_ONLY_WORDS_RE.test(t.replace(/\s+/g, ''))) return true;
  if (!/\d/.test(t) && POLITE_RE.test(t)) return true;
  if (POLITE_RE.test(t) && t.length < 24 && !/\d+\s*(박스|상자|박|팩|키로|kg|봉지|봉|개|각|덩이|통|포대|망)/i.test(t)) return true;
  if (/^(입니다|합니다|세요|습니다|해요|예요|이에요)[.!?]?$/.test(t)) return true;
  return false;
}

export function isJunkClientName(text) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (!t || t.length < 2) return true;
  if (GREETING_ONLY_WORDS_RE.test(t.replace(/\s+/g, ''))) return true;
  if (isPoliteOnly(t)) return true;
  if (/^(내일|오늘|모레|다음주|이번주|냉장|냉동|국내산|수입|수입육|한돈|한우)$/.test(t)) return true;
  if (/^(발주가|발주|입고|입니다|합니다|세요|습니다)[.!?]?$/.test(t)) return true;
  if (/부탁|주세요|보내주|보내세|드리겠습니다|드립니다|이상입니다/.test(t) && t.length < 20) return true;
  if (/(습니다|세요|해요|입니다|드립니다)[.!?]?$/.test(t) && t.length < 16 && !STORE_SUFFIX_RE.test(t)) return true;
  if (/^[\d\s.]+$/.test(t)) return true;
  return false;
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) if (longer.includes(shorter[i])) matches++;
  return matches / longer.length;
}

/**
 * 입력 텍스트가 내장된 거래처 별명(Alias) 또는 정식 거래처명과 직접 매칭되는지 확인
 */
export function isKnownClientOrAlias(rawText) {
  let text = String(rawText || '').replace(/[●■☆★[\]]/g, '').replace(/추가|정정|급급|최종|예약분?/g, '').trim();
  text = text.replace(/^(내일|오늘|모레|냉장|냉동)\s+/, '').trim();
  if (!text || text.length < 2 || isJunkClientName(text)) return false;

  const aliasMap = getAllAliases();
  for (const alias of Object.keys(aliasMap)) {
    if (text === alias || (alias.length >= 2 && text.startsWith(alias) && !/\s+\d/.test(text))) return true;
  }
  const clients = getAllClients();
  for (const c of clients) {
    const clean = c.name.replace(/^\(주\)|^주식회사\s*/, '').trim();
    if (clean.length >= 2 && (text === c.name || text === clean)) return true;
  }
  return false;
}

/**
 * 거래처 별명/연번(예: 김치1, 김치2, 김치3, 오빠 등) 구조 분석 헬퍼
 * 주의: "사골 3", "앞다리 5" 처럼 띄어쓰기 후 숫자가 오는 것은 [품목 + 수량]이지 거래처 연번 별명이 아님!
 */
export function analyzeClientAliasToken(rawText) {
  let clean = String(rawText || '')
    .replace(/[●■☆★[\]]/g, '')
    .replace(/추가|정정|급급|최종|예약분?/g, '')
    .replace(/^(내일|오늘|모레|냉장|냉동)\s+/, '')
    .trim();
  if (!clean) return { raw: '', baseName: '', seqNum: '', isNumberedAlias: false, isNumbered: false, isShortAlias: false };

  const clients = getAllClients();
  const isExactOfficial = clients.some(
    c => c.active !== false && (c.name === clean || c.name.replace(/^\(주\)|^주식회사\s*/, '').trim() === clean)
  );

  // 1) 붙여 쓴 연번 별명: "김치1", "김치2", "김치3", "태광1", "오빠2" (단어와 1자리 숫자 사이 공백 없음!)
  // 2) 또는 명시적 호/호점/차가 붙은 경우: "김치 1호", "김치 2호점", "태광 2차"
  const mTight = clean.match(/^([가-힣A-Za-z()]{1,10})([1-9])(?:호|호점|차)?$/);
  const mExplicitHo = clean.match(/^([가-힣A-Za-z()]{1,10})\s+([1-9]\d?)(?:호|호점|차)$/);
  const m = mTight || mExplicitHo;
  if (m) {
    const baseName = m[1].trim();
    const seqNum = m[2];
    if (!isExactOfficial && !MEAT_KEYWORD_RE.test(baseName) && !/^(3mm|LA)$/i.test(baseName)) {
      return { raw: clean, baseName, seqNum, isNumberedAlias: true, isNumbered: true, isShortAlias: true };
    }
  }
  const isShortAlias = !isExactOfficial && !/\d/.test(clean) && clean.length >= 2 && clean.length <= 3;
  return { raw: clean, baseName: clean, seqNum: '', isNumberedAlias: false, isNumbered: false, isShortAlias };
}

/**
 * 짧은 별명(예: 김치, 오빠)으로 내장된 1,908곳 거래처 중 후보 목록을 찾는 헬퍼
 */
export function findCandidateClientsForAlias(aliasBase) {
  const q = String(aliasBase || '').trim();
  if (!q || q.length < 2) return [];
  const clients = getAllClients().filter(c => c.active !== false);
  const exactOrPrefix = [];
  const contains = [];
  for (const c of clients) {
    const clean = c.name.replace(/^\(주\)|^주식회사\s*/, '').trim();
    if (clean === q || clean.startsWith(q)) {
      exactOrPrefix.push(c);
    } else if (clean.includes(q) || (c.note && c.note.includes(q))) {
      contains.push(c);
    }
  }
  return exactOrPrefix.concat(contains).slice(0, 8);
}

export function matchClient(rawText) {
  let text = String(rawText || '').replace(/[●■☆★[\]]/g, '').replace(/추가|정정|급급/g, '').trim();
  text = text.replace(/^(내일|오늘|모레)\s+/, '').trim();
  if (/^(내일|오늘|모레)$/.test(text)) return { name: '', address: '', phone: '', note: '' };

  const aliasMap = getAllAliases();
  const clients = getAllClients();
  const aliasInfo = analyzeClientAliasToken(text);

  // 1) 별명(Alias) 사전에서 전체 문자열(예: "김치1" 또는 "오빠") 정확 일치 우선 확인
  if (aliasMap[text]) {
    const real = aliasMap[text];
    const c = clients.find(x => x.name === real);
    return c
      ? { name: c.name, address: c.address || '', phone: c.phone || '', note: c.note || '', matched: true, rawAlias: text, baseAlias: aliasInfo.baseName, seqNum: aliasInfo.seqNum }
      : { name: real, address: '', phone: '', note: '', matched: true, rawAlias: text, baseAlias: aliasInfo.baseName, seqNum: aliasInfo.seqNum };
  }

  // 2) 만약 "김치1", "김치2", "김치3" 같은 연번 별명인 경우:
  //    무조건 하나로 뭉개지 않고 rawAlias("김치1")와 baseAlias("김치"), seqNum("1") 정보를 함께 보존하여
  //    알고리즘 및 사용자가 [합치기 / 따로 구분]을 정확히 제어할 수 있게 함!
  if (aliasInfo.isNumberedAlias) {
    const baseReal = aliasMap[aliasInfo.baseName];
    const baseClient = baseReal
      ? clients.find(x => x.name === baseReal)
      : clients.find(c => c.active !== false && c.name.replace(/^\(주\)|^주식회사\s*/, '').trim() === aliasInfo.baseName);

    return {
      name: text, // 기본은 김치1, 김치2로 유지하되 baseAlias로 언제든 병합 가능
      address: baseClient?.address || '',
      phone: baseClient?.phone || '',
      note: baseClient?.note || '',
      matched: Boolean(baseClient),
      isNumberedAlias: true,
      rawAlias: text,
      baseAlias: aliasInfo.baseName,
      seqNum: aliasInfo.seqNum,
      baseOfficialName: baseClient?.name || baseReal || ''
    };
  }

  // 3) 일반 별명(Alias) 사전 매칭 (3글자 이상이거나 시작 일치)
  const sortedAliases = Object.entries(aliasMap).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, real] of sortedAliases) {
    if (text === alias || (alias.length >= 2 && text.startsWith(alias) && !/\d$/.test(text))) {
      if (!real) return { name: alias, address: '', phone: '', note: '', matched: true, rawAlias: text };
      const c = clients.find(x => x.name === real);
      return c
        ? { name: c.name, address: c.address || '', phone: c.phone || '', note: c.note || '', matched: true, rawAlias: text }
        : { name: real, address: '', phone: '', note: '', matched: true, rawAlias: text };
    }
  }

  // 4) 정식 거래처명 정확 일치 (영업중인 거래처 우선)
  const exact = clients.find(
    c => c.active !== false && (c.name === text || c.name.replace(/^\(주\)|^주식회사\s*/, '').trim() === text)
  );
  if (exact) {
    return { name: exact.name, address: exact.address || '', phone: exact.phone || '', note: exact.note || '', matched: true, rawAlias: text };
  }

  // 5) 시작 일치 (단, 2글자 이상이고 해당 접두어로 시작하는 영업중 거래처가 유일할 때만 자동 매칭, 여러 개면 별명 유지!)
  if (text.length >= 2) {
    const prefixMatches = clients.filter(c => {
      if (c.active === false) return false;
      const cleanName = c.name.replace(/^\(주\)|^주식회사\s*/, '').trim();
      return cleanName.length >= 2 && (cleanName.startsWith(text) || text.startsWith(cleanName));
    });
    if (prefixMatches.length === 1) {
      const only = prefixMatches[0];
      return { name: only.name, address: only.address || '', phone: only.phone || '', note: only.note || '', matched: true, rawAlias: text };
    }
  }

  // 6) 높은 유사도 매칭 (오빠, 김치 같은 짧은 2~3글자 별명이 엉뚱한 거래처로 오매칭되지 않도록 3글자 이상 & 유사도 0.70 이상만 허용)
  if (text.length >= 3) {
    const t = text.slice(0, 20);
    let bestDir = null;
    let bestDirScore = 0;
    for (const c of clients) {
      if (c.active === false) continue;
      const cleanName = c.name.replace(/^\(주\)|^주식회사\s*/, '').trim();
      const score = similarity(t, cleanName.slice(0, 20));
      if (score > bestDirScore && score >= 0.70) {
        bestDirScore = score;
        bestDir = c;
      }
    }
    if (bestDir) {
      return { name: bestDir.name, address: bestDir.address || '', phone: bestDir.phone || '', note: bestDir.note || '', matched: true, rawAlias: text };
    }
  }

  return {
    name: text.split(/[\s●]/)[0] || text,
    address: '',
    phone: '',
    note: '',
    matched: false,
    isShortAlias: text.length <= 4,
    rawAlias: text,
    baseAlias: aliasInfo.baseName
  };
}

// ★ 범용(타사/전 업종) 단위 및 업무지시 정규식
export const UNIVERSAL_UNIT_WORDS = '박스|상자|케이스|박|팩|키로|킬로|kg|Kg|KG|g|봉지|봉|포대|묶음|다스|갑|벌|판|마리|덩어리|덩이|개|각|EA|ea|짝|망|자루|통|병|캔|페트|롤|줄|단|세트|파렛트|파레트|트레이|건|리터|L|ml|Pack|pack|Box|box';

export function detectWorkInstruction(rawText, sender = '', relatedClient = '', time = '', dayKey = '', customInstructionKeywords = '') {
  const t = cleanKakaoText(rawText || '').trim();
  if (!t || t.length < 3) return null;
  if (/^(사진|이모티콘|동영상|삭제된 메시지)/.test(t)) return null;
  if (/^(네|예|넵|네에|알겠습니다|감사합니다|수고하세요|고생하셨습니다)[.!~ㅎ\s]*$/.test(t)) return null;

  const customList = String(customInstructionKeywords || '')
    .split(/[,|\n]/)
    .map(s => s.trim())
    .filter(Boolean);
  const customMatched = customList.some(kw => kw && t.includes(kw));

  const isUrgent = /긴급|급급|급합니다|필수|꼭\s|당장|즉시|엄수|주의|비상|클레임|사고|누락/.test(t);
  const isDeliveryInst = /배송|배차|상차|하차|도착|출발|경유|납품|픽업|수거|회수|빈박스|공박스|시간\s*엄수|오전\s*중|오후\s*중|\d{1,2}시\s*전|\d{1,2}시까지|직송|퀵|용차|화물/.test(t);
  const isWorkInst = /작업|세절|슬라이스|포장|진공|손질|두께|\d+mm|해동|냉동보관|냉장보관|라벨|스티커|소분|계근해|발골|정형|실사|재고\s*조사|점검|준비해/.test(t);
  const isAdminInst = /수금|미수|미수금|입금|계좌|세금계산서|계산서|영수증|명세서|거래명세표|단가|견적|정산|청구|마감|발주서\s*전송|원장/.test(t);
  const isClaimInst = /반품|교환|클레임|불량|변질|파손|오배송|누락|재발송|환불/.test(t);
  const isGeneralInst = /지시|요청|부탁|확인\s*바|확인해|체크해|전달|공지|필독|처리해|진행해|챙겨|메모|참고|주의사항|특이사항/.test(t);

  if (!customMatched && !isUrgent && !isDeliveryInst && !isWorkInst && !isAdminInst && !isClaimInst && !isGeneralInst) {
    return null;
  }

  let category = '📌 일반업무지시';
  if (isClaimInst) category = '🚨 클레임/반품지시';
  else if (isDeliveryInst) category = '🚚 배송/물류지시';
  else if (isWorkInst) category = '🔪 작업/현장지시';
  else if (isAdminInst) category = '💰 수금/행정지시';

  // 대괄호 [거래처/부서] 또는 첫머리 대상 추출
  let targetClient = relatedClient || '';
  const bracketM = t.match(/^\[([^\]]+)\]\s*(.+)$/);
  let content = t;
  if (bracketM) {
    if (!targetClient) targetClient = bracketM[1].trim();
    content = bracketM[2].trim();
  }

  return {
    category,
    priority: isUrgent || isClaimInst ? '긴급' : '보통',
    sender: sender || '담당자',
    client: targetClient || sender || '공통지시',
    time: time || '',
    dayKey: dayKey || '',
    content,
    raw: t
  };
}

export function isLikelyOrderSender(sender, text, universalMode = false) {
  if (universalMode) return true;
  const s = sender || '';
  if (isMeatpoanStaff(s)) return true;
  if (looksLikeOrderText(text, true)) return true;
  return false;
}

export function looksLikeOrderText(text, universalMode = false) {
  const t = text || '';
  if (t.length < 2) return false;
  const unitRegex = new RegExp(`(${UNIVERSAL_UNIT_WORDS}|미전지|삼겹|목살|등뼈|항정|가브리|갈비|전지|후지|사태|차돌|우삼|발주|주문|납품|출고)`, 'i');
  if (unitRegex.test(t) && /\d/.test(t)) return true;
  if (universalMode && /\d/.test(t)) return true;
  return false;
}

export function looksLikeItemLine(line, universalMode = false) {
  const t = (line || '').trim();
  if (!t) return false;
  // ★ 품목 줄은 반드시 앞에 숫자가 아닌 '품목명(한글/영문 등)'이 있어야 함 ("5박스"처럼 수량+단위만 있는 조각은 품목 줄이 아님!)
  if (/^\d/.test(t) && !/^3mm/i.test(t)) return false;

  // 업무지시/클레임/안내 서술형 문장(예: "어제 나간 식용유 1통 파손 건 오늘 방문 시 반품 회수 및 정상품 교환 처리 바랍니다")은 품목 줄이 아님!
  if (/반품\s*회수|교환\s*처리|파손\s*건|오배송|변질|환불|미수금|온도\s*점검|세금계산서|거래명세표|비밀번호|비번\s*\d/i.test(t)) {
    return false;
  }
  if (t.length > 32 && /바랍니다|요망|부탁드립니다|주시기|처리해|진행해|확인해/.test(t)) {
    return false;
  }

  // 만약 "김치1", "김치2", "태광1" 같은 거래처 연번 별명이면 품목 줄이 아님!
  if (analyzeClientAliasToken(t).isNumberedAlias) return false;
  // 만약 줄 전체가 알려진 거래처명(예: 24시옛날집, 마루벌삼겹살)이고 뒤에 수량이 없으면 품목 줄이 아님!
  if (isKnownClientOrAlias(t) && !new RegExp(`\\s+\\d+\\s*(${UNIVERSAL_UNIT_WORDS})?$`, 'i').test(t)) {
    return false;
  }
  if (new RegExp(`[가-힣A-Za-z].*\\d+\\s*(${UNIVERSAL_UNIT_WORDS}|p|P|b|B)(?![가-힣A-Za-z])`, 'i').test(t)) return true;
  if (new RegExp(`[가-힣A-Za-z].*(${UNIVERSAL_UNIT_WORDS})\\s*\\d+`, 'i').test(t)) return true;
  if (/[가-힣A-Za-z].*\d+\s*(포크|대산|정담|황금|신짜|죽향|한냉|부경|도드람|선진|체리|농협|목우촌)/i.test(t)) return true;
  if (MEAT_KEYWORD_RE.test(t) && !STORE_SUFFIX_RE.test(t) && /\d/.test(t)) return true;
  if (universalMode && /^[가-힣A-Za-z][가-힣A-Za-z0-9()[\]\s_\-·]{0,25}\s+\d{1,3}(?:\.\d+)?$/.test(t)) return true;
  return false;
}

/**
 * 한 줄에 '거래처명 + 품목 + 수량'이 같이 적힌 경우(예: "참새방앗간 미전지2덩어리", "태광 삼겹 5박스", "[청담갈비] 차돌 4박스", "[서울식자재] 진라면 5박스")
 * 거래처와 품목 본문을 분리해 주는 헬퍼
 * 주의: "빵삼겹 5박스", "미박삼겹 3", "식용유 18L 3통", "쌀 20kg 6포대" 같은 일반 품목 줄을 거래처로 쪼개면 절대 안 됨!
 */
export function splitInlineClientAndItems(line, universalMode = false) {
  const t = (line || '').replace(/[●■☆★]/g, '').trim();
  if (!t) return null;

  // 1) [거래처명] 품목 수량 (대괄호로 거래처가 명시된 경우는 100% 인라인 발주)
  const bracketM = t.match(/^\[([^\]]+)\]\s*(.+)$/);
  if (bracketM && looksLikeItemLine(bracketM[2], universalMode)) {
    const mc = matchClient(bracketM[1]);
    return { clientInfo: mc.name ? mc : { name: bracketM[1].trim(), address: '', phone: '' }, itemText: bracketM[2].trim() };
  }

  // 2) 첫 어절(또는 콜론 앞)이 '확실한 거래처명'이고, 나머지가 '품목명(한글/영문 시작) + 수량' 줄인 경우만 분리!
  const tokenM = t.match(/^([^\s:]+?)(?:\s*:\s*|\s+)(.+)$/);
  if (tokenM) {
    const hasExplicitColon = /^[^\s:]+?\s*:\s*.+$/.test(t);
    const firstWord = tokenM[1].replace(/^(내일|오늘|모레)\s*/, '').trim();
    const restText = tokenM[2].trim();
    if (!firstWord || firstWord.length < 2 || isJunkClientName(firstWord)) return null;

    // ★ restText가 숫자로 시작하면(예: "빵삼겹 5박스" -> restText="5박스", "식용유 18L 3통" -> restText="18L 3통")
    // 첫 어절(firstWord)은 거래처가 아니라 품목명 그 자체이므로 절대 분리하지 않음!
    if (/^\d/.test(restText) && !/^3mm/i.test(restText)) return null;

    const isModifierOrCategory = /^(냉장|냉동|국내산|수입|수입산|수입육|한돈|한우|육우|암돼지|모돈|거세|선동|세절|슬라이스|구이용|보쌈용|수육용|찌개용|불고기용|국거리|다짐육|간것|반절|통|급|급급|추가|정정|내일|오늘|오전|오후|빵|미박|피박|박피|특|암|생|신선|양념|훈제|숙성)$/i.test(firstWord);
    const brandRe = new RegExp('^(' + getBrandPattern() + ')$', 'i');
    const isBrandWord = brandRe.test(firstWord);
    if (isModifierOrCategory || isBrandWord) return null;

    // firstWord가 고기 품목 키워드를 포함하면서 상호 접미사(갈비, 보쌈, 삼겹살, 식당, 마트 등)로 끝나지 않고 알려진 거래처도 아니면 품목어임!
    const isKnownClient = isKnownClientOrAlias(firstWord) || analyzeClientAliasToken(firstWord).isNumberedAlias;
    const hasStoreSuffix = STORE_SUFFIX_RE.test(firstWord);
    if (MEAT_KEYWORD_RE.test(firstWord) && !isKnownClient && !hasStoreSuffix) {
      return null;
    }

    // 콜론(:)이 없는데 알려진 거래처도 아니고 상호 접미사도 없으면(예: "진라면 매운맛 5박스", "코카콜라 제로 3박스") 분리하지 않음!
    if (!hasExplicitColon && !isKnownClient && !hasStoreSuffix) {
      return null;
    }

    if (looksLikeItemLine(restText, universalMode)) {
      const mc = matchClient(firstWord);
      if (mc && mc.name && !isJunkClientName(mc.name)) {
        return { clientInfo: mc, itemText: restText };
      }
    }
  }
  return null;
}

export function isOrderSummaryBlock(lines) {
  if (!lines || lines.length < 6) return false;
  const first = (lines[0] || '').trim();
  if (/발주체크/.test(first)) return true;
  let itemish = 0;
  for (const l of lines) {
    if (/^(삼겹|특삼|암삼|미삼|암미|특미|목살|특목|B목|미전지|전지|갈비|등갈비|등심|안심|사태|앞미|항정|가브리|갈매기|미후지|3mm|등뼈|잡육)/.test(l.replace(/\s/g, ''))) {
      itemish++;
    }
  }
  if (itemish >= 8 && /박스|팩|키로/.test(lines[0])) return true;
  if (itemish >= 10 && looksLikeItemLine(lines[0])) return true;
  return false;
}

/**
 * ★ 개별 라인이 [발주]가 아니라 [계근(실측중량 / 이력번호 나열)] 줄인지 정밀 판별하는 함수
 */
export function isLineWeightOrLotOnly(rawLine) {
  const t = cleanKakaoText(rawLine).trim();
  if (!t || !/\d/.test(t)) return false;

  // 서술형 업무지시 문장(비밀번호 1234, 전화번호, 시간 안내 등)은 계근 줄이 아님!
  if (/비밀번호|비번|누르고|넣어주|챙겨주|전화|연락|계좌|입금|만원|원\b|시까지|시\s*전|바랍니다|요망|부탁|주세요|출발|도착/.test(t)) {
    return false;
  }

  // 1) 숫자/소수점/슬래시만 나열된 줄 (예: "451 452", "18.3 / 19.2")
  if (/^[\d.\s/,+-]+$/.test(t)) return true;

  // 2) '포' 또는 '대' + 숫자가 포함된 계근 줄 (예: "특삼 8포 19.3", "8포 19.3", "4대") — 단 '포대'는 발주 단위이므로 제외!
  if (/\d+\s*(포(?!대)|대)(?![가-힣A-Za-z])/.test(t) && !/\d+\s*(박스|상자|박|팩|봉지|봉|포대|덩이|덩어리|판|벌)(?![가-힣A-Za-z])/i.test(t)) {
    return true;
  }

  // 3) 명시적 발주 단위가 있는지 검사
  const hasExplicitKgOrderUnit = /\d+(?:\.\d+)?\s*(키로|킬로|kg|Kg|KG)(?![가-힣A-Za-z])/i.test(t);
  const hasExplicitOtherOrderUnit = new RegExp(`\\d+(?:\\.\\d+)?\\s*(${UNIVERSAL_UNIT_WORDS})(?![가-힣A-Za-z])`, 'i').test(t);
  // "수입차돌 451 2" 처럼 3~4자리 이력번호 뒤에 1~2자리 수량이 따라오는 경우도 발주임!
  const hasLotPlusSmallQty = /\b\d{3,4}\s+\d{1,2}(?:\s|$)/.test(t);

  // 4) 소수점 숫자(예: 15.3, 19.8)가 들어있는 경우:
  const decimalMatches = t.match(/\d+\.\d+/g) || [];
  if (decimalMatches.length > 0) {
    const decimalWithOrderUnit = new RegExp(`\\d+\\.\\d+\\s*(${UNIVERSAL_UNIT_WORDS})(?![가-힣A-Za-z])`, 'i').test(t);
    if (!decimalWithOrderUnit) {
      return true;
    }
  }

  // 5) 100 이상의 숫자(3~4자리 이력번호 또는 150 등 큰 숫자)가 있는 경우:
  const strippedMeat3mm = t.replace(/3mm/gi, '');
  const bigNums = strippedMeat3mm.match(/\b(\d{3,4})\b/g) || [];
  if (bigNums.length > 0) {
    if (!hasExplicitKgOrderUnit && !hasExplicitOtherOrderUnit && !hasLotPlusSmallQty) {
      return true;
    }
  }

  return false;
}

export function isWeightLogOnly(lines) {
  if (!lines || !lines.length) return false;
  const joined = lines.join(' ');
  if (/개체/.test(joined) && !/박스|박|팩|봉지|개|각|kg|키로/i.test(joined)) return true;

  let weightOrLotLineCnt = 0;
  let orderLineCnt = 0;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;

    // 첫 줄이 거래처명 단독 줄인 경우 스킵
    if (i === 0 && !/\d/.test(t) && t.length < 25) continue;

    if (isLineWeightOrLotOnly(t)) {
      weightOrLotLineCnt++;
    } else if (
      new RegExp(`\\d+\\s*(${UNIVERSAL_UNIT_WORDS})(?![가-힣A-Za-z])`, 'i').test(t) ||
      (MEAT_KEYWORD_RE.test(t) && /\s+\d{1,2}(?:\s|$)/.test(t))
    ) {
      orderLineCnt++;
    }
  }

  if (weightOrLotLineCnt >= 1 && orderLineCnt === 0) return true;
  if (weightOrLotLineCnt >= 2 && orderLineCnt <= 1 && /\d+\.\d+/.test(joined)) return true;
  return false;
}

export function isValidOrderItem(it) {
  if (!it || !it.name) return false;
  const n = String(it.name).trim();
  if (!n || isPoliteOnly(n) || isJunkClientName(n)) return false;
  if (/^(내일|오늘|모레|냉장|냉동)$/.test(n)) return false;
  if (analyzeClientAliasToken(n).isNumberedAlias) return false;

  const q = String(it.qty || '').trim();
  if (!q || !/^\d+(\.\d+)?$/.test(q)) return false;
  const numQ = parseFloat(q);

  const u = String(it.unit || '');
  if (/^(대|포)$/.test(u)) return false;

  // 100 이상 수량(예: 150, 451)은 단위가 정확히 Kg('kg', '키로')가 아니면 발주가 아니라 이력번호/계근임!
  if (numQ >= 100 && u !== 'Kg') return false;

  // 소수점 수량(예: 15.3)은 단위가 Kg, Box, Pack 등이 아니면 계근 중량임!
  if (/\d+\.\d+/.test(q) && !u) return false;

  return true;
}

export function normalizeUnit(u) {
  if (!u) return '';
  const s = String(u).trim().toLowerCase();
  if (s === '팩' || s === 'pack' || s === 'p') return 'Pack';
  if (s === '키로' || s === 'kg' || s === '킬로') return 'Kg';
  if (s === '봉지' || s === '봉') return '봉지';
  if (s === '포대') return '포대';
  if (s === '박스' || s === '박' || s === '상자' || s === 'box' || s === 'b') return 'Box';
  if (s === '판' || s === '트레이') return 'Pan';
  if (s === '덩이' || s === '덩어리') return 'Chunk';
  if (s === '벌' || s === '마리' || s === '세트') return 'Set';
  if (s === '개' || s === 'ea' || s === '건') return 'Pcs';
  if (s === '각') return 'Gak';
  return u;
}

/**
 * ★ 품목 한 줄 파싱 (고객님 도메인 규칙 + 타사/범용 모드 + 규격포함 품목명 100% 반영)
 */
export function parseItemLine(rawLine, universalMode = false) {
  let line = cleanKakaoText(rawLine).replace(/^[-•·*]\s*/, '').trim();
  if (!line || isPoliteOnly(line)) return null;
  if (/^(냉장|냉동|국내산|수입|수입육)$/.test(line.replace(/\s/g, ''))) return null;

  // "김치1", "김치2", "오빠1" 등 연번 거래처 별명은 절대 품목으로 파싱하지 않음
  if (analyzeClientAliasToken(line).isNumberedAlias) return null;

  // 계근/이력번호 전용 줄이면 발주 품목에서 즉시 제외
  if (isLineWeightOrLotOnly(line)) return null;

  const BRANDS = getBrandPattern();
  let name = '', qty = '', unit = '', note = '', extra = '';
  let lot = '', weight = '';

  // ★ 규격(예: "식용유 18L 3통", "쌀 20kg 6포대", "김치 10kg 3박스", "삼겹 10mm 3박스", "냉장 3mm 후지 5")이 품목명에 포함된 경우 우선 매칭!
  const specInNameM = line.match(
    new RegExp(`^([^\\d]+?\\s*\\d+(?:\\.\\d+)?\\s*(?:mm|cm|kg|g|L|ml|호|구|입|인분))\\s+(\\d+(?:\\.\\d+)?\\s*(?:${UNIVERSAL_UNIT_WORDS})?.*)$`, 'i')
  );
  const specialMeatM = line.match(/^((?:냉장|냉동)?\s*3mm\s*(?:냉장|냉동)?\s*(?:후지|삼겹)?)\s+(.+)$/i);
  let headName = '';
  let tailText = '';

  if (specInNameM) {
    headName = specInNameM[1].replace(/\s+/g, ' ').trim();
    tailText = specInNameM[2].trim();
  } else if (specialMeatM) {
    headName = specialMeatM[1].trim();
    tailText = specialMeatM[2].trim();
  } else {
    const firstNumMatch = line.match(/^([^\d]+?)\s*(\d.*)$/);
    if (firstNumMatch) {
      headName = firstNumMatch[1].replace(/[ㅡ\-–:]/g, ' ').replace(/\s+/g, ' ').trim();
      tailText = firstNumMatch[2].trim();
    }
  }

  if (headName && tailText) {
    name = headName;
    let rest = tailText.replace(/부탁\S*|보내\S*|주세요|감사합니다?/g, '').trim();

    // [Step A] "숫자 3~4자리 + (각|개)" 패턴 먼저 추출 (예: "451각", "451개", "1234각")
    const lotWithGakPcsRe = /\b(\d{3,4}|0\d{2,3})\s*(각|개)(?![가-힣A-Za-z])/g;
    let lotUnitType = '';
    let lotGakCount = 0;
    rest = rest.replace(lotWithGakPcsRe, (_, lotDigits, uChar) => {
      lot = lot ? `${lot},${lotDigits}` : lotDigits;
      lotUnitType = uChar; // '각' 또는 '개'
      lotGakCount++;
      return ' ';
    }).replace(/\s+/g, ' ').trim();

    // [Step B] 남은 문자열에서 명시적 발주 수량+단위 추출 (전 업종 범용 단위 포함)
    const unitRe = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(${UNIVERSAL_UNIT_WORDS})(?![가-힣A-Za-z])`, 'i');
    const um = rest.match(unitRe);
    if (um) {
      const candidateQty = parseFloat(um[1]);
      const candidateUnitRaw = um[2];
      const isKgUnit = /^(키로|킬로|kg)$/i.test(candidateUnitRaw);

      if (isKgUnit || candidateQty < 100) {
        qty = um[1];
        unit = candidateUnitRaw;
        rest = (rest.slice(0, um.index) + ' ' + rest.slice(um.index + um[0].length)).replace(/\s+/g, ' ').trim();
      }
    }

    // [Step C] 남은 숫자들에서 3~4자리 이력번호(lot) 및 1~2자리 단위 없는 수량(qty) 분리
    const nums = rest.match(/\d+(?:\.\d+)?/g) || [];
    const restNoNum = rest.replace(/\d+(?:\.\d+)?/g, ' ').replace(/[(),]/g, ' ').replace(/\s+/g, ' ').trim();

    nums.forEach(n => {
      if (/\d+\.\d+/.test(n)) {
        if (!weight) weight = n;
        else extra = (extra + ' ' + n).trim();
      } else if (/^\d{3,4}$/.test(n) || /^0\d{2,3}$/.test(n)) {
        // 3~4자리 숫자는 이력번호(개체번호)
        lot = lot ? `${lot},${n}` : n;
      } else if (!qty && n.length <= 2) {
        qty = n;
      } else {
        extra = (extra + ' ' + n).trim();
      }
    });

    // 만약 "차돌 451각" 또는 "차돌 451개"처럼 3~4자리 이력번호+각/개만 적혔던 경우 -> 수량은 해당 개체 수(기본 1), 단위는 각/개!
    if (!qty && lot && lotUnitType) {
      qty = String(lotGakCount || 1);
      unit = lotUnitType;
    }

    // 만약 "차돌 451 2"처럼 3~4자리 이력번호 뒤에 1~2자리 수량(2)만 적힌 경우 -> 개체 품목이므로 단위는 '개'
    if (lot && qty && !unit) {
      unit = lotUnitType || '개';
    }

    // 만약 명시적 단위 없이 "이름 + 숫자"만 있는 줄인데, 이름이 고기 품목어가 아니고 universalMode도 아니면(예: "김치 2") 품목이 아님!
    if (!unit && !lot && !universalMode && !MEAT_KEYWORD_RE.test(name)) {
      return null;
    }

    // 메이커(브랜드) 및 비고 추출
    if (restNoNum) {
      const brandRe = new RegExp('(' + BRANDS + ')', 'i');
      const bm = restNoNum.match(brandRe);
      if (bm) {
        note = bm[1];
        const left = restNoNum.replace(bm[0], '').replace(/^[,\s]+/, '').trim();
        if (left) extra = (extra + ' ' + left).trim();
      } else {
        note = (note ? note + ' ' : '') + restNoNum;
      }
    }
  } else {
    return null;
  }

  name = name.replace(/부탁\S*|주세요|보내세\S*|보내주\S*|감사합니다?|수정\S*|홀에\S*|놔주\S*/g, '').trim();
  if (!name || isPoliteOnly(name)) return null;
  if (/^(냉장|냉동)$/.test(name)) return null;
  if (/요$|세요$|습니다$|해요$/.test(name) && name.length > 6) return null;

  unit = normalizeUnit(unit);
  if (!unit && /박스/.test(note)) {
    unit = 'Box';
    note = note.replace(/박스/g, '').trim();
  }
  if (!unit && /\b각\b/.test(note)) {
    unit = 'Gak';
    note = note.replace(/\b각\b/g, '').trim();
  }
  if (!unit && /\b개\b/.test(note)) {
    unit = 'Pcs';
    note = note.replace(/\b개\b/g, '').trim();
  }

  // 단위가 없고 1~99 사이 수량이면 기본 단위는 'Box(박스)'!
  if (qty && !unit && parseFloat(qty) < 100) {
    unit = 'Box';
  }

  if (lot && !note.includes(`이력:${lot}`) && !note.includes(`개체:${lot}`)) {
    note = (note ? note + ' ' : '') + '이력:' + lot;
  }
  if (weight && !note.includes(`${weight}kg`)) {
    note = (note ? note + ' ' : '') + weight + 'kg';
  }

  name = name.replace(/\s+/g, ' ').trim();
  if (!name || !qty) return null;

  return { name, qty, unit, note: note.trim(), extra: extra.trim(), lot, weight };
}

/**
 * 한 줄에 슬래시(/)나 쉼표(,)로 여러 품목이 나열된 경우(예: "삼겹 5박스 / 목살 3박스", "종이컵 3박스 / 냅킨 5묶음 / 락스 2통")
 * 각각의 품목을 모두 분리하여 추출하는 헬퍼 (단, "수입차돌 451, 452 2개"처럼 숫자가 나열된 경우는 분리하지 않음)
 */
export function parseMultiItemLine(rawLine, universalMode = false) {
  const line = cleanKakaoText(rawLine).trim();
  if (!line) return [];
  if (/[/,]/.test(line)) {
    const parts = line.split(/[/,]/).map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2 && parts.every(p => looksLikeItemLine(p, universalMode))) {
      const parsedList = parts.map(p => parseItemLine(p, universalMode)).filter(Boolean);
      if (parsedList.length >= 2) return parsedList;
    }
  }
  const single = parseItemLine(line, universalMode);
  return single ? [single] : [];
}

/**
 * ★ 미트포앤 발주/낱개 핵심 분류기 (고객님 지정 비즈니스 규칙 100% 반영)
 * ----------------------------------------------------------------------------
 * [규칙]
 * 1) 단위가 없으면 무조건 '박스(Box)'
 * 2) 낱개 확인 대상(needsCheck = true):
 *    - 박스 단위가 아닌 것들 (팩, 봉지, kg, 덩이, 판, 벌, 마리, 개, 각 등 PDA 미인식 단위)
 *    - '특'이 들어가는 냉장 품목 (특삼겹, 특미삼, 특목살, 특삼, 특목 등)
 *    - 숫자 3~4자리 이력번호(개체번호)가 들어가는 것들 및 '~~~개 / ~~~각' 품목
 */
export function classifyOrderItem(it, blockCategory = '') {
  const rawName = String(it?.name || '').trim();
  const stdName = normalizeMeat(rawName) || rawName;
  const rawUnit = String(it?.unit || '').trim();
  const noteAndExtra = [it?.note, it?.extra, blockCategory].filter(Boolean).join(' ');
  const combined = `${rawName} ${stdName} ${rawUnit} ${noteAndExtra}`;

  // 1) 단위 표준화 (단위 없으면 무조건 Box)
  const normU = normalizeUnit(rawUnit) || 'Box';

  // 2) '특'이 들어가는 냉장 품목 여부 (특삼겹, 특미삼, 특목살, 특삼, 특목 등)
  const isSpecialCold =
    (/특/.test(rawName) || /특/.test(stdName) || (/특/.test(noteAndExtra) && /냉장/.test(combined))) &&
    !/냉동/.test(combined);

  // 3) 숫자 3~4자리 이력번호(개체번호)가 들어가는 품목 또는 '개/각' 단위 품목
  const lotMatch =
    String(it?.lot || '').match(/\d{3,4}/) ||
    noteAndExtra.match(/(?:lot:|개체:?|이력:?)\s*(\d{3,4})/i) ||
    combined.replace(/3mm/gi, '').match(/\b(\d{3,4})\b/);
  const entityId = it?.lot || (lotMatch ? lotMatch[1] : '');
  const isPcsUnit = normU === 'Pcs' || normU === 'Gak' || rawUnit === '개' || rawUnit === '각';
  const hasEntityId = Boolean(entityId) || isPcsUnit;

  // 4) 박스를 제외한 단위 여부 (팩, 봉지, kg, 덩이, 판, 벌, 마리, 개, 각 등)
  const isNonBoxUnit = normU !== 'Box' || isLoose(it);

  // 5) 최종: 낱개 확인 대상 여부 (PDA 미인식 또는 수동 확인 필수)
  const needsCheck = isSpecialCold || hasEntityId || isNonBoxUnit || Boolean(it?.weight);

  const unitLabelMap = {
    Box: '박스',
    Pack: '팩',
    Kg: 'kg',
    봉지: '봉지',
    Pan: '판',
    Chunk: '덩이',
    Set: '벌',
    Pcs: '개',
    Gak: '각'
  };
  const displayUnit = unitLabelMap[normU] || rawUnit || '박스';

  const checkReasons = [];
  if (isSpecialCold) checkReasons.push('특(냉장)');
  if (hasEntityId) checkReasons.push(entityId ? `이력#${entityId}` : `낱개(${displayUnit})`);
  if (isNonBoxUnit && !isPcsUnit) checkReasons.push(`낱개(${displayUnit})`);
  if (it?.weight) checkReasons.push(`계근(${it.weight}kg)`);

  return {
    stdName,
    displayUnit,
    normUnit: normU,
    isBoxUnit: !isNonBoxUnit && !isPcsUnit,
    isSpecialCold,
    hasEntityId,
    entityId,
    isNonBoxUnit,
    needsCheck,
    checkReasons,
    checkBadgeText: checkReasons.length ? checkReasons.join(' · ') : '📦 박스'
  };
}

export function parseWeightLogBlock(lines, msg, fallbackClient = '') {
  if (!lines || !lines.length) return null;
  let client = fallbackClient || '';
  let start = 0;
  const first = lines[0];
  if (!isLineWeightOrLotOnly(first) && !/\d{3,4}/.test(first) && !/\d+\.\d+/.test(first) && first.length < 25) {
    const matched = matchClient(first);
    client = matched.name || first.replace(/[●■☆★]/g, '').trim();
    start = 1;
  }
  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const l = cleanKakaoText(lines[i]).trim();
    if (!l) continue;
    // 고기명 + 3~4자리 이력번호(+각/개 허용) + 선택적 소수점 무게
    let m = l.match(/^(.+?)\s+((?:\d{3,4}(?:각|개)?\s*)+)(?:\s+(\d+(?:\.\d+)?))?\s*$/);
    if (m) {
      rows.push({
        meat: m[1].trim(),
        lot: m[2].replace(/각|개/g, '').replace(/\s+/g, ' ').trim(),
        weight: m[3] || '',
        raw: l
      });
      continue;
    }
    // 고기명 + N포/대 + 무게
    m = l.match(/^(.+?)\s+(\d+)\s*(포|대)\s+(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?\s*$/);
    if (m) {
      rows.push({
        meat: m[1].trim(),
        lot: '',
        weight: m[4] + (m[5] ? ' / ' + m[5] : ''),
        pack: m[2] + m[3],
        raw: l
      });
      continue;
    }
    // 고기명 + 소수점 무게만 (예: "특삼겹 19.3")
    m = l.match(/^([^\d]+?)\s+(\d+\.\d+(?:\s+\d+\.\d+)*)\s*$/);
    if (m) {
      rows.push({
        meat: m[1].trim(),
        lot: '',
        weight: m[2].replace(/\s+/g, ' / '),
        raw: l
      });
      continue;
    }
    m = l.match(/^(\d+)\s*(포|대)\s+(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?\s*$/);
    if (m) {
      rows.push({
        meat: '',
        lot: '',
        weight: m[3] + (m[4] ? ' / ' + m[4] : ''),
        pack: m[1] + m[2],
        raw: l
      });
      continue;
    }
    if (/^[\d.\s/,]+$/.test(l)) {
      rows.push({ meat: '', lot: l.trim(), weight: '', raw: l });
      continue;
    }
    rows.push({ meat: l, lot: '', weight: '', raw: l });
  }
  if (!rows.length && !client) return null;
  return {
    client: client || '(미상)',
    sender: msg.sender || '',
    time: msg.time || '',
    dayKey: msg.dayKey || '',
    rows,
    raw: lines.join('\n')
  };
}

function detectShipSide(rawText, msgDt, deliveryDt) {
  const t = rawText || '';
  if (/다음날|명일/.test(t)) return { ship: 'next', explicit: true };
  if (/내일/.test(t)) {
    if (!msgDt || !deliveryDt) return { ship: 'today', explicit: true };
    const msgDay = new Date(msgDt.getFullYear(), msgDt.getMonth(), msgDt.getDate());
    const delDay = new Date(deliveryDt.getFullYear(), deliveryDt.getMonth(), deliveryDt.getDate());
    if (msgDay.getTime() >= delDay.getTime()) return { ship: 'next', explicit: true };
    return { ship: 'today', explicit: true };
  }
  if (/오늘|금일/.test(t)) return { ship: 'today', explicit: true };
  return { ship: 'today', explicit: false };
}

/**
 * Grok 카카오톡 발주·계근·업무지시·일반사항 통합 파서 (미트포앤 전용 + 타사/범용 모드 통합 지원)
 * @param {string} text 카카오톡 대화 원문
 * @param {string} deliveryKey 선택된 배송/작업일 키 (또는 'ALL' 전체 구간)
 * @param {Function} onProgress 진행률 콜백
 * @param {Object} options 파서 옵션 ({ universalMode, clientSource, customInstructionKeywords })
 */
export function parseOrdersForDeliveryDate(text, deliveryKey = 'ALL', onProgress, options = {}) {
  const universalMode = Boolean(options?.universalMode);
  const customInstructionKeywords = options?.customInstructionKeywords || '';
  const cleanedText = cleanKakaoText(text);
  const range = getWindowRange(deliveryKey);
  if (onProgress) onProgress(5);
  const allMsgs = Array.isArray(options?.preparsedMsgs)
    ? options.preparsedMsgs
    : getAllDatedMessages(cleanedText, range ? range.start : null, range ? range.end : null);
  if (onProgress) onProgress(25);
  const msgs = range
    ? allMsgs.filter(m => !m.hasExplicitDate || (m.dt >= range.start && m.dt <= range.end))
    : allMsgs;
  if (onProgress) onProgress(35);

  const orders = [];
  const weightLogs = [];
  const generalLogs = [];
  const workInstructions = [];
  const seenInstKeys = new Set();

  function pushInstructionIfDetected(rawText, sender, relatedClient, time, dayKey) {
    const inst = detectWorkInstruction(rawText, sender, relatedClient, time, dayKey, customInstructionKeywords);
    if (!inst) return false;
    const dedupKey = `${dayKey}|${time}|${sender}|${inst.content.slice(0, 60)}`;
    if (!seenInstKeys.has(dedupKey)) {
      seenInstKeys.add(dedupKey);
      workInstructions.push(inst);
    }
    return true;
  }

  let cur = null;
  const total = Math.max(msgs.length, 1);
  let processed = 0;

  function flush() {
    if (cur && (cur.items.length || cur.rawLines.length)) {
      if (/^(내일|오늘|모레)$/.test((cur.client || '').trim())) {
        cur = null;
        return;
      }
      const raw = cur.rawLines.join('\n');
      const det = detectShipSide(raw, cur.msgDt || (range && range.start), range && range.delivery);
      let ship = det.ship;
      let shipExplicit = det.explicit;
      if (cur.forceShip === 'next') {
        ship = 'next';
        shipExplicit = true;
      }
      cur.items = (cur.items || []).filter(isValidOrderItem).map(it => {
        if (it.qty && !it.unit) it.unit = 'Box';
        const meta = classifyOrderItem(it, cur.category || '');
        return {
          ...it,
          unit: meta.normUnit,
          displayUnit: meta.displayUnit,
          stdName: meta.stdName,
          isBoxUnit: meta.isBoxUnit,
          isSpecialCold: meta.isSpecialCold,
          hasEntityId: meta.hasEntityId,
          entityId: meta.entityId,
          isNonBoxUnit: meta.isNonBoxUnit,
          needsCheck: meta.needsCheck,
          checkReasons: meta.checkReasons,
          checkBadgeText: meta.checkBadgeText,
          checkedOff: Boolean(it.checkedOff)
        };
      });
      if (isJunkClientName(cur.client)) {
        pushInstructionIfDetected(raw, cur.sender, '', cur.time, cur.dayKey);
        cur = null;
        return;
      }
      if (!cur.items.length) {
        if (raw.trim().length > 2) {
          const isInst = pushInstructionIfDetected(raw, cur.sender, cur.client, cur.time, cur.dayKey);
          generalLogs.push({
            client: cur.client || cur.sender || '일반',
            sender: cur.sender || '',
            time: cur.time || '',
            dayKey: cur.dayKey || '',
            reason: isInst ? '📋 업무지시사항 감지됨' : '수량 미포함 메모/안내',
            raw
          });
        }
        cur = null;
        return;
      }
      // 발주 블록 내부에도 특별 업무지시사항(예: "비밀번호 1234 냉장고에 넣어주세요", "명세표 꼭 챙겨주세요", "오전 10시 전 급배송")이 포함되어 있으면 업무지시 목록에도 함께 기록!
      const nonItemNoteLines = cur.rawLines.filter(l => !looksLikeItemLine(l, universalMode) && l.trim() !== cur.rawClient);
      if (nonItemNoteLines.length > 0) {
        pushInstructionIfDetected(nonItemNoteLines.join('\n'), cur.sender, cur.client, cur.time, cur.dayKey);
      }

      orders.push({
        client: cur.client,
        rawClient: cur.rawClient || cur.client,
        aliasInfo: cur.aliasInfo || analyzeClientAliasToken(cur.rawClient || cur.client),
        address: cur.address,
        phone: cur.phone || '',
        items: cur.items,
        raw,
        time: cur.time,
        sender: cur.sender || '',
        dayKey: cur.dayKey || '',
        ship,
        shipExplicit,
        msgDt: cur.msgDt,
        category: cur.category || ''
      });
    }
    cur = null;
  }

  for (const msg of msgs) {
    processed++;
    if (onProgress && processed % 20 === 0) onProgress(35 + (processed / total) * 55);
    if (!msg.text || msg.text.includes('메시지가 삭제되었습니다')) continue;
    if (/^사진|^이모티콘|^동영상/.test(msg.text.trim())) continue;

    if (!isLikelyOrderSender(msg.sender, msg.text, universalMode)) {
      const isInst = pushInstructionIfDetected(msg.text.trim(), msg.sender, '', msg.time, msg.dayKey);
      generalLogs.push({
        client: msg.sender || '일반대화',
        sender: msg.sender || '',
        time: msg.time || '',
        dayKey: msg.dayKey || '',
        reason: isInst ? '📋 업무지시사항' : '일반 대화/안내 메시지',
        raw: msg.text.trim()
      });
      continue;
    }

    const body = msg.text.replace(/\r/g, '');
    const blocks = body.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l && !l.includes('메시지가 삭제'));
      if (!lines.length) continue;

      const head = lines[0].replace(/\s+/g, '');
      if (/발주체크/.test(lines[0]) || /^발주체크/.test(head)) {
        flush();
        generalLogs.push({
          client: '발주체크(출고요약)',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '발주체크 요약본 (중복 합산 제외)',
          raw: block
        });
        continue;
      }
      if (/^(여기까지|작성|최종수정)/.test(lines[0]) && lines.length <= 2) {
        flush();
        generalLogs.push({
          client: '마감/구분선',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '작업 구분 메모',
          raw: block
        });
        continue;
      }
      if (isOrderSummaryBlock(lines)) {
        flush();
        generalLogs.push({
          client: '품목합계요약',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '전체 품목 요약본 (개별 발주 중복 제외)',
          raw: block
        });
        continue;
      }
      if (/Web발신|경매가격|도축|등급별|탕박|전국\d/.test(block)) {
        generalLogs.push({
          client: '시세/공지문자',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '경매/도축 시세 안내',
          raw: block
        });
        continue;
      }

      // 계근/로트 전용 블록 → 발주 제외, 계근 목록에 수집
      if (isWeightLogOnly(lines)) {
        flush();
        const w = parseWeightLogBlock(lines, msg);
        if (w) weightLogs.push(w);
        continue;
      }

      if (/^(남는건|다주게|처리하였|정정해|잘못 눌렀)/.test(lines[0]) && lines.length <= 3) {
        pushInstructionIfDetected(block, msg.sender, cur?.client || '', msg.time, msg.dayKey);
        generalLogs.push({
          client: msg.sender || '내부지시',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '내부 업무 지시/전달사항',
          raw: block
        });
        continue;
      }

      // 블록 전체가 품목 줄이 하나도 없고 업무지시문인 경우 → 업무지시사항으로 즉시 수집!
      const hasAnyItemLine = lines.some(l => looksLikeItemLine(l, universalMode) || splitInlineClientAndItems(l, universalMode));
      if (!hasAnyItemLine && detectWorkInstruction(block, msg.sender, cur?.client || '', msg.time, msg.dayKey, customInstructionKeywords)) {
        flush();
        pushInstructionIfDetected(block, msg.sender, '', msg.time, msg.dayKey);
        generalLogs.push({
          client: msg.sender || '업무지시',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '📋 업무지시사항',
          raw: block
        });
        continue;
      }

      // ★ 블록 첫 줄이 단순 인사말/발주안내("사장님 발주입니다", "안녕하세요 내일 발주드립니다", "추가발주")이고 아래에 거래처+품목이 이어지는 경우,
      //    앞의 인사말 줄만 제거하여 아래 실제 발주 블록이 통째로 날아가지 않도록 보호!
      while (lines.length > 1) {
        const cleanedTop = cleanClientHeaderLine(lines[0]);
        if (
          (!cleanedTop || isJunkClientName(cleanedTop)) &&
          !looksLikeItemLine(lines[0], universalMode) &&
          !splitInlineClientAndItems(lines[0], universalMode)
        ) {
          pushInstructionIfDetected(lines[0], msg.sender, cur?.client || '', msg.time, msg.dayKey);
          lines.shift();
        } else {
          break;
        }
      }
      if (!lines.length) continue;

      const first = lines[0].replace(/[●■☆★♥❤️⭐️*~]/g, '').trim();

      // ★ [특수 케이스 1] 첫 줄이 '거래처명 + 품목 + 수량' 한 줄 발주인 경우 (예: "참새방앗간 미전지2덩어리", "[청담] 차돌 4박스", "[서울식당] 진라면 5박스")
      const inlineFirst = splitInlineClientAndItems(first, universalMode);
      if (inlineFirst) {
        flush();
        cur = {
          client: inlineFirst.clientInfo.name,
          rawClient: inlineFirst.clientInfo.name,
          aliasInfo: analyzeClientAliasToken(inlineFirst.clientInfo.name),
          address: inlineFirst.clientInfo.address || '',
          phone: inlineFirst.clientInfo.phone || '',
          items: [],
          rawLines: [lines[0]],
          time: msg.time,
          sender: msg.sender || '',
          dayKey: msg.dayKey || '',
          msgDt: msg.dt,
          forceShip: /내일|명일/.test(lines[0]) ? 'next' : null,
          category: ''
        };
        const subParts = inlineFirst.itemText.split(/[/,]/).map(s => s.trim()).filter(Boolean);
        subParts.forEach(sp => {
          const pItem = parseItemLine(sp, universalMode);
          if (pItem && isValidOrderItem(pItem)) cur.items.push(pItem);
        });
        // 만약 아래 줄들이 더 있으면 계속 처리
        for (let i = 1; i < lines.length; i++) {
          const lineI = lines[i].replace(/[●■☆★♥❤️⭐️*~]/g, '').trim();
          const inlineSub = splitInlineClientAndItems(lineI, universalMode);
          if (inlineSub) {
            flush();
            cur = {
              client: inlineSub.clientInfo.name,
              rawClient: inlineSub.clientInfo.name,
              aliasInfo: analyzeClientAliasToken(inlineSub.clientInfo.name),
              address: inlineSub.clientInfo.address || '',
              phone: inlineSub.clientInfo.phone || '',
              items: [],
              rawLines: [lines[i]],
              time: msg.time,
              sender: msg.sender || '',
              dayKey: msg.dayKey || '',
              msgDt: msg.dt,
              forceShip: /내일|명일/.test(lines[i]) ? 'next' : null,
              category: ''
            };
            inlineSub.itemText.split(/[/,]/).map(s => s.trim()).filter(Boolean).forEach(sp => {
              const pItem = parseItemLine(sp, universalMode);
              if (pItem && isValidOrderItem(pItem)) cur.items.push(pItem);
            });
            continue;
          }
            cur.rawLines.push(lines[i]);
            const parsedList = parseMultiItemLine(lines[i], universalMode);
            parsedList.forEach(parsed => {
              if (parsed && isValidOrderItem(parsed)) cur.items.push(parsed);
            });
          }
          continue;
        }

        // ★ [특수 케이스 2] 첫 줄이 순수 품목 줄인 경우 -> 이전 거래처에 이어붙이거나, 이전 거래처가 없으면 발신자명(또는 미지정거래처)으로 자동 생성하여 절대 누락 방지!
        const firstIsItem = looksLikeItemLine(first, universalMode);
        if (firstIsItem && cur) {
          for (const line of lines) {
            if (/여기까지|발주체크/.test(line)) continue;
            cur.rawLines.push(line);
            const parsedList = parseMultiItemLine(line, universalMode);
            parsedList.forEach(parsed => {
              if (parsed && isValidOrderItem(parsed)) cur.items.push(parsed);
            });
          }
          continue;
        }
        if (firstIsItem && !cur) {
          const senderClean = (msg.sender || '').trim();
          const isInternalMeatpoan = isMeatpoanStaff(senderClean) && !universalMode;
          const matchedSender = (!isInternalMeatpoan && senderClean) ? matchClient(senderClean) : { name: '', address: '', phone: '' };
          const fallbackClientName = (!isInternalMeatpoan && (matchedSender.name || senderClean))
            ? (matchedSender.name || senderClean)
            : '미지정거래처';
          cur = {
            client: fallbackClientName,
            rawClient: senderClean || fallbackClientName,
            aliasInfo: analyzeClientAliasToken(fallbackClientName),
            address: matchedSender.address || '',
            phone: matchedSender.phone || '',
            items: [],
            rawLines: [],
            time: msg.time,
            sender: msg.sender || '',
            dayKey: msg.dayKey || '',
            msgDt: msg.dt,
            forceShip: /내일|명일/.test(block) ? 'next' : null,
            category: ''
          };
          for (const line of lines) {
            if (/여기까지|발주체크/.test(line)) continue;
            cur.rawLines.push(line);
            const parsedList = parseMultiItemLine(line, universalMode);
            parsedList.forEach(parsed => {
              if (parsed && isValidOrderItem(parsed)) cur.items.push(parsed);
            });
          }
          continue;
        }

      // 날짜 표시어(내일/오늘 등) 단독 줄 처리
      const DAY_MARK_RE = /^(내일|오늘|모레|월요일|화요일|수요일|목요일|금요일|토요일|일요일)(\s|발주|입니다|꺼|$)/;
      if (DAY_MARK_RE.test(first) || /^(내일|오늘|모레)$/.test(first.replace(/\s/g, ''))) {
        if (cur && /^내일/.test(first)) {
          cur.forceShip = 'next';
          cur.rawLines.push(first);
          for (let i = 1; i < lines.length; i++) {
            if (/여기까지|발주체크/.test(lines[i])) continue;
            if (/^(내일|오늘|모레)$/.test(lines[i].replace(/\s/g, ''))) {
              if (/^내일/.test(lines[i])) cur.forceShip = 'next';
              continue;
            }
            cur.rawLines.push(lines[i]);
            const parsed = parseItemLine(lines[i], universalMode);
            if (parsed) cur.items.push(parsed);
            else if (lines[i].length > 1 && !isPoliteOnly(lines[i])) {
              cur.items.push({ name: lines[i], qty: '', unit: '', note: '', extra: '' });
            }
          }
        }
        continue;
      }

      // 새 거래처 블록 시작
      flush();
      let clientLine = cleanClientHeaderLine(first);

      if (!clientLine || clientLine.length > 60) continue;
      if (/^(네|예|아니요|알겠|수고|감사|사진|이모티콘)/.test(clientLine)) {
        generalLogs.push({
          client: msg.sender || '인사/답변',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: '단순 인사/응답',
          raw: block
        });
        continue;
      }
      if (/발주체크|여기까지/.test(clientLine)) continue;
      if (/^(내일|오늘|모레)$/.test(clientLine)) continue;
      if (isJunkClientName(clientLine)) {
        const isInst = pushInstructionIfDetected(block, msg.sender, '', msg.time, msg.dayKey);
        generalLogs.push({
          client: msg.sender || '일반메모',
          sender: msg.sender || '',
          time: msg.time || '',
          dayKey: msg.dayKey || '',
          reason: isInst ? '📋 업무지시사항' : '일반 안내 문구',
          raw: block
        });
        continue;
      }
      if (/^(냉장|냉동|국내산|수입)(산|육)?$/.test(clientLine.replace(/\s/g, ''))) {
        if (cur) {
          cur.category = clientLine.replace(/\s/g, '');
          cur.rawLines.push(first);
        }
        continue;
      }

      let categoryPrefix = '';
      const catM = clientLine.match(/^(냉장|냉동)\s+(.+)$/);
      if (catM) {
        categoryPrefix = catM[1];
        clientLine = catM[2].trim();
      }

      const matched = matchClient(clientLine);
      if (/^(내일|오늘|모레|냉장|냉동)$/.test((matched.name || '').trim())) continue;
      if (!matched.name || isJunkClientName(matched.name)) continue;

      let forceShip = null;
      if (/내일/.test(first) || lines.some(l => /^내일\b/.test(l.trim()))) forceShip = 'next';

      cur = {
        client: matched.name,
        rawClient: clientLine,
        aliasInfo: analyzeClientAliasToken(clientLine),
        address: matched.address || '',
        phone: matched.phone || '',
        items: [],
        rawLines: [lines[0]],
        time: msg.time,
        sender: msg.sender || '',
        dayKey: msg.dayKey || '',
        msgDt: msg.dt,
        forceShip,
        category: categoryPrefix || ''
      };

      for (let i = 1; i < lines.length; i++) {
        const lineI = lines[i];
        if (/여기까지|발주체크/.test(lineI)) continue;
        if (/^(내일|오늘|모레)(\s*발주.*)?$/.test(lineI.trim())) {
          if (/^내일/.test(lineI.trim())) cur.forceShip = 'next';
          cur.rawLines.push(lineI);
          continue;
        }
        if (/^(냉장|냉동|국내산|수입)(산|육)?$/.test(lineI.replace(/\s/g, ''))) {
          cur.category = lineI.replace(/\s/g, '');
          cur.rawLines.push(lineI);
          continue;
        }

        // ★ 빈 줄 없이 다음 거래처(또는 김치1, 김치2 같은 연번 별명)가 바로 이어진 경우 자동 감지하여 새 거래처로 분리!
        const cleanCandRaw = lineI.replace(/[●■☆★]/g, '').trim();
        const inlineSub = splitInlineClientAndItems(cleanCandRaw, universalMode);
        if (inlineSub) {
          flush();
          cur = {
            client: inlineSub.clientInfo.name,
            rawClient: inlineSub.clientInfo.name,
            aliasInfo: analyzeClientAliasToken(inlineSub.clientInfo.name),
            address: inlineSub.clientInfo.address || '',
            phone: inlineSub.clientInfo.phone || '',
            items: [],
            rawLines: [lineI],
            time: msg.time,
            sender: msg.sender || '',
            dayKey: msg.dayKey || '',
            msgDt: msg.dt,
            forceShip: /내일|명일/.test(lineI) ? 'next' : null,
            category: ''
          };
          inlineSub.itemText.split(/[/,]/).map(s => s.trim()).filter(Boolean).forEach(sp => {
            if (isLineWeightOrLotOnly(sp)) {
              const wSingle = parseWeightLogBlock([sp], msg, cur.client);
              if (wSingle) weightLogs.push(wSingle);
              return;
            }
            const pItem = parseItemLine(sp, universalMode);
            if (pItem && isValidOrderItem(pItem)) cur.items.push(pItem);
          });
          continue;
        }

        const cleanCand = cleanClientHeaderLine(cleanCandRaw);
        const candAliasInfo = analyzeClientAliasToken(cleanCand);
        const brandOnlyRe = new RegExp('^(' + getBrandPattern() + ')$', 'i');
        const isKnownOrStoreCand = Boolean(cleanCand) && (isKnownClientOrAlias(cleanCand) || STORE_SUFFIX_RE.test(cleanCand));
        const isNewClientHeader =
          Boolean(cleanCand) &&
          (cur.items.length > 0 || candAliasInfo.isNumberedAlias) &&
          !looksLikeItemLine(cleanCandRaw, universalMode) &&
          !isLineWeightOrLotOnly(cleanCandRaw) &&
          (!MEAT_KEYWORD_RE.test(cleanCand) || isKnownOrStoreCand) &&
          !brandOnlyRe.test(cleanCand) &&
          !isPoliteOnly(cleanCand) &&
          !isJunkClientName(cleanCand) &&
          (
            isKnownOrStoreCand ||
            candAliasInfo.isNumberedAlias ||
            (!/\d/.test(cleanCand) && cleanCand.length >= 2 && cleanCand.length <= 18)
          );

        if (isNewClientHeader) {
          flush();
          const nextMatch = matchClient(cleanCand);
          cur = {
            client: nextMatch.name || cleanCand,
            rawClient: cleanCand,
            aliasInfo: candAliasInfo,
            address: nextMatch.address || '',
            phone: nextMatch.phone || '',
            items: [],
            rawLines: [lineI],
            time: msg.time,
            sender: msg.sender || '',
            dayKey: msg.dayKey || '',
            msgDt: msg.dt,
            forceShip: /내일/.test(lineI) ? 'next' : null,
            category: ''
          };
          continue;
        }

        // ★ 블록 내부에 섞여 있는 계근/이력번호 줄(뒤에 kg/발주단위 없는 3~4자리 숫자, 소수점 무게, 포/대)은 계근 기록으로 분리!
        if (isLineWeightOrLotOnly(lineI)) {
          const wMixed = parseWeightLogBlock([lineI], msg, cur.client);
          if (wMixed) weightLogs.push(wMixed);
          continue;
        }

        cur.rawLines.push(lineI);
        const parsedList = parseMultiItemLine(lineI, universalMode);
        if (parsedList.length > 0) {
          parsedList.forEach(parsed => {
            if (/^(내일|오늘|모레)$/.test((parsed.name || '').trim())) return;
            cur.items.push(parsed);
          });
        } else if (lineI.length > 1 && !isPoliteOnly(lineI)) {
          if (/^(내일|오늘|모레)$/.test(lineI.trim())) continue;
          // 품목이 아닌 줄이 업무지시사항인지 체크
          pushInstructionIfDetected(lineI, msg.sender, cur.client, msg.time, msg.dayKey);
          cur.items.push({ name: lineI, qty: '', unit: '', note: '', extra: '' });
        }
      }
    }
  }
  flush();
  return { orders, weightLogs, generalLogs, workInstructions, range };
}

/**
 * 각 날짜 후보별로 실제 발주 건수와 거래처 수, 업무지시 건수를 계산하고, 가장 적합한 기본 배송일을 추천하는 함수
 */
export function inspectDatesWithCounts(rawText, options = {}) {
  const text = cleanKakaoText(rawText);
  const rawDates = extractDates(text);
  // 대용량 파일에서도 빠르게 동작하도록 전체 메시지를 딱 1번만 파싱하여 재사용
  const allMsgsOnce = getAllDatedMessages(text, null, null);
  const enriched = rawDates.map(d => {
    const parsed = parseOrdersForDeliveryDate(text, d.key, null, { ...options, preparsedMsgs: allMsgsOnce });
    const orderCnt = (parsed.orders || []).length;
    const clientCnt = new Set((parsed.orders || []).map(o => o.client)).size;
    const weightCnt = (parsed.weightLogs || []).length;
    const instCnt = (parsed.workInstructions || []).length;
    return {
      ...d,
      orderCnt,
      clientCnt,
      weightCnt,
      instCnt,
      displayLabel: `${d.label} — 발주 ${orderCnt}건 (${clientCnt}곳)${weightCnt ? ` · 계근 ${weightCnt}건` : ''}${instCnt ? ` · 지시 ${instCnt}건` : ''}`
    };
  });

  // 최적 기본 날짜 선택:
  // 1) 실제 날짜(isSynthetic === false) 중 가장 마지막 날짜에 발주가 있으면 그 날짜 선택
  // 2) 만약 마지막 실제 날짜보다 발주가 더 많은 최신 날짜가 있으면(예: 금토일->월요일) 그 날짜 선택
  // 3) 날짜별 구간에 걸리는 발주가 없으면 'ALL'(전체 날짜) 선택
  let recommendedKey = 'ALL';
  const withOrders = enriched.filter(d => d.orderCnt > 0);
  if (withOrders.length > 0) {
    const realWithOrders = withOrders.filter(d => !d.isSynthetic);
    const lastReal = realWithOrders.length ? realWithOrders[realWithOrders.length - 1] : null;
    const lastAny = withOrders[withOrders.length - 1];

    if (lastReal && lastAny && lastAny.isSynthetic) {
      // (다음날)이 합성된 경우: 실제 마지막 날짜의 발주가 더 많거나 5건 이상이면 실제 마지막 날짜 우선!
      recommendedKey = lastReal.orderCnt >= lastAny.orderCnt || lastReal.orderCnt >= 5
        ? lastReal.key
        : lastAny.key;
    } else if (lastReal) {
      recommendedKey = lastReal.key;
    } else {
      recommendedKey = lastAny.key;
    }
  }

  return { dates: enriched, recommendedKey };
}

// ---------- 5. 고기명 정규화 / 낱개·박스 구분 / 권역·주소·배차 유틸 ----------
export function isLoose(it) {
  const u = (it?.unit || '').toLowerCase();
  const combined = ((it?.name || '') + ' ' + (it?.unit || '') + ' ' + (it?.note || '')).toLowerCase();
  if (/^(box|박스|박)$/.test(u) || /박스/.test(u)) return false;
  const looseList = getLooseUnits().map(x => String(x).toLowerCase());
  if (looseList.includes(u)) return true;
  for (const lu of looseList) {
    if (!lu) continue;
    if (u === lu || u.includes(lu)) {
      if (/(box|박스|박)/.test(u)) return false;
      return true;
    }
  }
  if (/^(pack|kg|팩|키로|봉지|봉|pcs|개|chunk|덩이|덩어리|pan|판|set|벌|마리)$/.test(u)) return true;
  if (/\d+\s*(pack|kg|팩|키로|봉지|개|덩이|덩어리)/i.test(combined) && !/(box|박스)/.test(combined)) return true;
  return false;
}

export function normalizeMeat(name) {
  if (!name || isPoliteOnly(name)) return null;
  const raw = String(name).trim();
  if (
    /부탁|주세요|보내|내일|오늘|오후|아침|발주|문자|안녕|급급|정정|수정|홀에|놔주|되세|만이요|대표님|비번|월요일|화요일|수요일|목요일|금요일|동탄점|성대g|마트|g마트|점\s*$/i.test(raw) &&
    !MEAT_KEYWORD_RE.test(raw)
  ) {
    return null;
  }
  if (raw.length > 18 && !/\d/.test(raw) && /요|세요|습니다|해요/.test(raw)) return null;

  const n = raw.replace(/\s+/g, '');
  if (/냉장?3mm|3mm냉장|3mm후지|냉장3mm후지|3mm냉장후지/i.test(n)) return '냉장3mm후지';
  if (/냉동3mm|3mm냉동/i.test(n)) return '냉동3mm후지';

  const map = customMeats && customMeats.length ? customMeats : DEFAULT_MEATS;
  const sorted = map.slice().sort((a, b) => String(b[0]).length - String(a[0]).length);
  for (const [k, v] of sorted) {
    if (n.includes(k) || raw.includes(k)) return v;
  }

  if (!MEAT_KEYWORD_RE.test(n) && !MEAT_KEYWORD_RE.test(raw)) return null;

  const cleaned = raw.replace(/부탁\S*|주세요|보내\S*|수정\S*/g, '').trim();
  if (!cleaned || cleaned.length > 14 || isPoliteOnly(cleaned)) return null;
  return cleaned;
}

export function extractBrand(it) {
  const brands = customBrands && customBrands.length ? customBrands : DEFAULT_BRANDS;
  const blob = [it.note, it.extra, it.name].filter(Boolean).join(' ');
  for (const b of brands) {
    if (b && blob.includes(b)) return b;
  }
  return '';
}

export function meatColumnKey(it) {
  const meat = normalizeMeat(it.name) || it.stdName || it.name;
  if (!meat) return null;
  const brand = extractBrand(it);
  return brand ? `${meat}·${brand}` : meat;
}

export function parseRegion(address) {
  if (!address) return '주소미상';
  const a = address.replace(/\s+/g, ' ').trim();
  let m = a.match(/^(서울|부산|대구|인천|광주|대전|울산|세종)(?:특별시|광역시)?\s*([가-힣]+[구군])?/);
  if (m) {
    const gu = m[2] || '';
    if (gu) return m[1] + ' ' + gu;
    return m[1];
  }
  m = a.match(/^(경기|강원|충북|충남|전북|전남|경북|경남|제주)(?:도)?\s*([가-힣]+[시군])/);
  if (m) {
    const si = m[2];
    const m2 = a.match(/[시군]\s*([가-힣]+[구읍면동])/);
    if (m2) return si + ' ' + m2[1];
    return si;
  }
  const parts = a.split(' ');
  if (parts.length >= 2) return parts[0].replace(/(특별시|광역시|도)$/, '') + ' ' + parts[1];
  return parts[0] || '주소미상';
}

export function shortAddress(address) {
  if (!address) return '-';
  const a = address.replace(/\s+/g, ' ').trim();
  let m = a.match(/((?:서울|부산|대구|인천|광주|대전|울산|세종)[^\s]*\s*[가-힣]+[구군](?:\s*[가-힣0-9]+[동로가])?)/);
  if (m) return m[1].trim();
  m = a.match(/([가-힣]+시\s*[가-힣]+[구군읍면](?:\s*[가-힣0-9]+[동리가])?)/);
  if (m) return m[1].trim();
  m = a.match(/([가-힣]+[시군]\s*[가-힣]+[읍면동])/);
  if (m) return m[1].trim();
  const parts = a.split(' ').filter(Boolean);
  const filtered = parts.filter((p, i) => !(i === 0 && /도$|특별시$|광역시$/.test(p)));
  return filtered.slice(0, 3).join(' ') || a;
}

export function extractClientRemark(rawText) {
  const t = rawText || '';
  const notes = [];
  if (/급급|완전급|■+급|급\s*배송|급배/.test(t)) notes.push('급급');
  else if (/■?\s*급\b|급해요|급합니다|급히/.test(t)) notes.push('급');
  if (/점심/.test(t)) notes.push('점심');
  if (/오후에|오후\s*배송|오후중/.test(t)) notes.push('오후');
  if (/아침에|아침\s*배송|오전중|오전에/.test(t)) notes.push('아침');
  if (/내일/.test(t)) notes.push('내일');
  if (/키\s*[는은]|비번|비밀번호|냉장고|문\s*열|우편함/.test(t)) notes.push('위치/키');
  return notes;
}

/**
 * 발주 목록(orders)에서 거래처 전체를 중복 없이 수집하여 주소·권역·특이사항·발주품목 요약을 반환
 */
export function collectOrderClients(orders) {
  const map = {};
  (orders || []).forEach(o => {
    const clientName = (o.client || '').trim();
    if (!clientName) return;
    if (!map[clientName]) {
      map[clientName] = {
        name: clientName,
        address: o.address || '',
        phone: o.phone || '',
        remarks: new Set(),
        items: [],
        ships: new Set()
      };
    } else {
      if (!map[clientName].address && o.address) map[clientName].address = o.address;
      if (!map[clientName].phone && o.phone) map[clientName].phone = o.phone;
    }
    map[clientName].ships.add(o.ship === 'next' ? '다음날' : '당일');
    extractClientRemark(o.raw || '').forEach(r => map[clientName].remarks.add(r));
    (o.items || []).forEach(it => {
      map[clientName].items.push(it);
      const n = ((it.note || '') + ' ' + (it.extra || '')).trim();
      if (/급급/.test(n)) map[clientName].remarks.add('급급');
      else if (/\b급\b|급/.test(n)) map[clientName].remarks.add('급');
      if (/점심/.test(n)) map[clientName].remarks.add('점심');
    });
  });

  const allClients = getAllClients();
  Object.keys(map).forEach(name => {
    if (!map[name].address) {
      const matched = matchClient(name);
      if (matched && matched.address) {
        map[name].address = matched.address;
        if (!map[name].phone && matched.phone) map[name].phone = matched.phone;
      } else {
        const c = allClients.find(x => x.name === name);
        if (c && c.address) {
          map[name].address = c.address;
          if (!map[name].phone && c.phone) map[name].phone = c.phone;
        }
      }
    }
    map[name].region = parseRegion(map[name].address);
    map[name].shortAddr = shortAddress(map[name].address);
    map[name].remarkText = [...map[name].remarks].join(', ');
  });

  return Object.values(map);
}

export function buildGrokSummaryText(orders, dateLabel = '전체') {
  const boxMap = {};
  const looseMap = {};

  (orders || []).forEach(o => {
    (o.items || []).forEach(it => {
      const meta = classifyOrderItem(it, o.category || '');
      const meat = meta.stdName || (it.name || '').trim();
      if (!meat || isPoliteOnly(meat)) return;
      const q = parseFloat(it.qty);
      if (!q && q !== 0) return;
      const target = meta.isBoxUnit ? boxMap : looseMap;
      const key = meta.isBoxUnit ? meat : `${meat}(${meta.displayUnit})`;
      if (!target[key]) target[key] = { meat, qty: 0, unit: meta.displayUnit, notes: new Set() };
      target[key].qty += q;
      if (it.note) target[key].notes.add(it.note);
      if (it.extra) target[key].notes.add(it.extra);
    });
  });

  const orderPref = [
    '특삼겹', '삼겹', '암삼겹', '특미삼', '미삼', '암미삼', '특목살', '목살', 'B목살',
    '미전지', '목전지', '전지', '갈비', '등갈비', '등심', '안심', '사태', '앞미사태',
    '항정', '가브리', '갈매기', '등뼈', '미후지', '냉장3mm후지', '냉동3mm후지', '돈피', 'B지방', '잡육', '설도', '살치'
  ];
  function sortKeys(map) {
    return Object.keys(map).sort((a, b) => {
      const ma = map[a].meat;
      const mb = map[b].meat;
      const ia = orderPref.indexOf(ma);
      const ib = orderPref.indexOf(mb);
      if (ia === -1 && ib === -1) return a.localeCompare(b, 'ko');
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  const lines = [`[${dateLabel}] 전체 발주 합계`, ''];
  const boxKeys = sortKeys(boxMap);
  if (boxKeys.length) {
    lines.push('■ 박스 (일반 박스 및 특 냉장 박스)');
    boxKeys.forEach(k => {
      const x = boxMap[k];
      const note = [...x.notes].filter(Boolean).join(' ');
      lines.push(`${x.meat} ${Math.round(x.qty * 10) / 10}박스${note ? ' ' + note : ''}`);
    });
  }
  const looseKeys = sortKeys(looseMap);
  if (looseKeys.length) {
    lines.push('', '■ 낱개 (박스 제외 · 특 · 이력번호 · 기타 단위)');
    looseKeys.forEach(k => {
      const x = looseMap[k];
      const note = [...x.notes].filter(Boolean).join(' ');
      lines.push(`${x.meat} ${Math.round(x.qty * 10) / 10}${x.unit}${note ? ' ' + note : ''}`);
    });
  }
  return lines.join('\n');
}

// ---------- 6. 브이월드(vWorld JSONP) + Photon + 권역 좌표 폴백 지오코딩 엔진 ----------
const VWORLD_KEY = '3351CCD7-07E8-40AB-97D0-243A592B74C3';

// 주요 권역별 중심 위경도 사전 (외부 API 지연/실패 또는 약식 주소일 때도 100% 지도에 표시 보장)
const REGION_COORD_MAP = {
  '안산 단원구': { lat: 37.3189, lng: 126.8105 },
  '안산 상록구': { lat: 37.3010, lng: 126.8465 },
  '안산시 단원구': { lat: 37.3189, lng: 126.8105 },
  '안산시 상록구': { lat: 37.3010, lng: 126.8465 },
  '시흥시 정왕동': { lat: 37.3516, lng: 126.7427 },
  '시흥시 능곡동': { lat: 37.3702, lng: 126.8087 },
  '시흥시 장곡동': { lat: 37.3788, lng: 126.7885 },
  '시흥시 하상동': { lat: 37.3812, lng: 126.8009 },
  '시흥시 대야동': { lat: 37.4435, lng: 126.7881 },
  '시흥시 신천동': { lat: 37.4392, lng: 126.7798 },
  '시흥시 은행동': { lat: 37.4342, lng: 126.7945 },
  '시흥시 목감동': { lat: 37.3815, lng: 126.8602 },
  '시흥시 배곧동': { lat: 37.3679, lng: 126.7279 },
  '시흥시': { lat: 37.3800, lng: 126.8029 },
  '군포시 산본동': { lat: 37.3596, lng: 126.9325 },
  '군포시 금정동': { lat: 37.3712, lng: 126.9435 },
  '군포시 당동': { lat: 37.3495, lng: 126.9428 },
  '군포시': { lat: 37.3617, lng: 126.9352 },
  '수원시 팔달구': { lat: 37.2775, lng: 127.0185 },
  '수원시 권선구': { lat: 37.2576, lng: 126.9719 },
  '수원시 장안구': { lat: 37.3039, lng: 127.0104 },
  '수원시 영통구': { lat: 37.2596, lng: 127.0465 },
  '수원시': { lat: 37.2636, lng: 127.0286 },
  '화성시 매송면': { lat: 37.2654, lng: 126.8912 },
  '화성시 남양읍': { lat: 37.2085, lng: 126.8165 },
  '화성시 향남읍': { lat: 37.1322, lng: 126.9205 },
  '화성시 봉담읍': { lat: 37.2158, lng: 126.9522 },
  '화성시 비봉면': { lat: 37.2355, lng: 126.8725 },
  '화성시': { lat: 37.1995, lng: 126.8313 },
  '안양시 만안구': { lat: 37.3867, lng: 126.9325 },
  '안양시 동안구': { lat: 37.3925, lng: 126.9568 },
  '안양시': { lat: 37.3943, lng: 126.9568 },
  '광명시': { lat: 37.4785, lng: 126.8646 },
  '부천시': { lat: 37.5034, lng: 126.7660 },
  '의왕시': { lat: 37.3448, lng: 126.9683 },
  '과천시': { lat: 37.4292, lng: 126.9876 },
  '용인시': { lat: 37.2411, lng: 127.1776 },
  '평택시': { lat: 36.9921, lng: 127.1129 },
  '오산시': { lat: 37.1499, lng: 127.0772 },
  '성남시': { lat: 37.4200, lng: 127.1267 },
  '고양시': { lat: 37.6584, lng: 126.8320 },
  '김포시': { lat: 37.6152, lng: 126.7156 },
  '파주시': { lat: 37.7599, lng: 126.7802 },
  '연천시': { lat: 38.0966, lng: 127.0750 },
  '아산시': { lat: 36.7898, lng: 127.0018 },
  '천안시': { lat: 36.8151, lng: 127.1139 },
  '인천 남동구': { lat: 37.4472, lng: 126.7314 },
  '인천 부평구': { lat: 37.5070, lng: 126.7219 },
  '인천 미추홀구': { lat: 37.4636, lng: 126.6505 },
  '인천 서구': { lat: 37.5454, lng: 126.6760 },
  '인천 연수구': { lat: 37.4102, lng: 126.6788 },
  '인천 계양구': { lat: 37.5374, lng: 126.7377 },
  '인천 중구': { lat: 37.4737, lng: 126.6217 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '서울 금천구': { lat: 37.4569, lng: 126.8955 },
  '서울 구로구': { lat: 37.4954, lng: 126.8874 },
  '서울 영등포구': { lat: 37.5264, lng: 126.8962 },
  '서울 관악구': { lat: 37.4784, lng: 126.9516 },
  '서울 강서구': { lat: 37.5510, lng: 126.8495 },
  '서울 양천구': { lat: 37.5170, lng: 126.8665 },
  '서울 동작구': { lat: 37.5124, lng: 126.9393 },
  '서울 서초구': { lat: 37.4837, lng: 127.0324 },
  '서울 강남구': { lat: 37.5172, lng: 127.0473 },
  '서울 송파구': { lat: 37.5145, lng: 127.1059 },
  '서울 강동구': { lat: 37.5301, lng: 127.1238 },
  '서울 마포구': { lat: 37.5663, lng: 126.9019 },
  '서울 용산구': { lat: 37.5326, lng: 126.9900 },
  '서울 중구': { lat: 37.5641, lng: 126.9979 },
  '서울 종로구': { lat: 37.5730, lng: 126.9794 },
  '서울 성동구': { lat: 37.5633, lng: 127.0371 },
  '서울 광진구': { lat: 37.5385, lng: 127.0823 },
  '서울 동대문구': { lat: 37.5744, lng: 127.0396 },
  '서울 중랑구': { lat: 37.6066, lng: 127.0927 },
  '서울 성북구': { lat: 37.5894, lng: 127.0167 },
  '서울 강북구': { lat: 37.6396, lng: 127.0257 },
  '서울 도봉구': { lat: 37.6688, lng: 127.0471 },
  '서울 노원구': { lat: 37.6542, lng: 127.0568 },
  '서울 은평구': { lat: 37.6027, lng: 126.9291 },
  '서울 서대문구': { lat: 37.5791, lng: 126.9368 },
  '서울': { lat: 37.5665, lng: 126.9780 }
};

function hashOffset(str) {
  let h = 0;
  const s = String(str || 'client');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  const latOff = (((h & 0xff) / 255) - 0.5) * 0.018;
  const lngOff = ((((h >> 8) & 0xff) / 255) - 0.5) * 0.022;
  return { latOff, lngOff };
}

export function getFallbackCoord(address, clientName = '') {
  const reg = parseRegion(address);
  const off = hashOffset(clientName + '|' + (address || ''));
  if (REGION_COORD_MAP[reg]) {
    return {
      lat: Number((REGION_COORD_MAP[reg].lat + off.latOff).toFixed(5)),
      lng: Number((REGION_COORD_MAP[reg].lng + off.lngOff).toFixed(5)),
      approx: true
    };
  }
  const addrStr = String(address || '');
  for (const [k, pos] of Object.entries(REGION_COORD_MAP)) {
    const token = k.split(' ').pop();
    if (token && token.length >= 2 && (addrStr.includes(token) || reg.includes(token))) {
      return {
        lat: Number((pos.lat + off.latOff).toFixed(5)),
        lng: Number((pos.lng + off.lngOff).toFixed(5)),
        approx: true
      };
    }
  }
  return {
    lat: Number((DEPOT_INFO.lat + off.latOff * 1.5).toFixed(5)),
    lng: Number((DEPOT_INFO.lng + off.lngOff * 1.5).toFixed(5)),
    approx: true
  };
}

export function geoCacheGet(addr) {
  if (!addr) return null;
  try {
    const p = JSON.parse(localStorage.getItem('vgeo:' + addr) || 'null');
    if (p && p.lat != null && p.lng != null) return p;
  } catch {}
  return null;
}

export function geoCacheSet(addr, pos) {
  if (!addr || !pos) return;
  try {
    localStorage.setItem('vgeo:' + addr, JSON.stringify(pos));
  } catch {}
}

function jsonpRequest(url, timeoutMs = 4500) {
  return new Promise((resolve, reject) => {
    const cb = 'vw_cb_' + Date.now() + '_' + Math.floor(Math.random() * 1e6);
    let settled = false;
    const script = document.createElement('script');
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('timeout'));
    }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      try {
        delete window[cb];
      } catch {
        window[cb] = undefined;
      }
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }
    window[cb] = function (data) {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data);
    };
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cb;
    script.onerror = function () {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('script error'));
    };
    document.head.appendChild(script);
  });
}

function parseVworldPoint(data) {
  if (!data || !data.response) return null;
  const r = data.response;
  if (r.status === 'OK' && r.result && r.result.point) {
    const lat = parseFloat(r.result.point.y);
    const lng = parseFloat(r.result.point.x);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  const items = r.result && r.result.items;
  if (items && items[0] && items[0].point) {
    const lat = parseFloat(items[0].point.y);
    const lng = parseFloat(items[0].point.x);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

async function photonGeocode(addr) {
  try {
    const url = 'https://photon.komoot.io/api/?' + new URLSearchParams({
      q: addr,
      limit: '1',
      lang: 'ko'
    }).toString();
    const res = await fetch(url);
    const data = await res.json();
    const f = data && data.features && data.features[0];
    if (f && f.geometry && f.geometry.coordinates) {
      return { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] };
    }
  } catch {}
  return null;
}

export async function vworldGeocode(addr, clientName = '') {
  if (!addr) return getFallbackCoord('', clientName);
  const cached = geoCacheGet(addr);
  if (cached) return cached;

  // 괄호 안 상세 호수 제거한 정제 주소 준비
  const cleanAddr = addr.replace(/\([^)]*\)/g, ' ').replace(/,.*$/, '').replace(/\s+/g, ' ').trim();

  const tryTypes = ['road', 'parcel'];
  for (const typ of tryTypes) {
    const params = new URLSearchParams({
      service: 'address',
      request: 'getCoord',
      version: '2.0',
      crs: 'epsg:4326',
      address: cleanAddr || addr,
      refine: 'true',
      simple: 'false',
      format: 'json',
      type: typ,
      key: VWORLD_KEY
    });
    try {
      const data = await jsonpRequest('https://api.vworld.kr/req/address?' + params.toString(), 3000);
      const pos = parseVworldPoint(data);
      if (pos) {
        geoCacheSet(addr, pos);
        return pos;
      }
    } catch {}
  }

  try {
    const params2 = new URLSearchParams({
      service: 'search',
      request: 'search',
      version: '2.0',
      crs: 'EPSG:4326',
      size: '1',
      page: '1',
      query: cleanAddr || addr,
      type: 'address',
      category: 'road',
      format: 'json',
      errorformat: 'json',
      key: VWORLD_KEY
    });
    const data2 = await jsonpRequest('https://api.vworld.kr/req/search?' + params2.toString(), 3000);
    const pos2 = parseVworldPoint(data2);
    if (pos2) {
      geoCacheSet(addr, pos2);
      return pos2;
    }
  } catch {}

  const ph = await photonGeocode((cleanAddr || addr) + ' 대한민국');
  if (ph) {
    geoCacheSet(addr, ph);
    return ph;
  }

  // 최종 폴백: 권역 중심 좌표 + 고유 오프셋으로 누락 없이 100% 표시
  return getFallbackCoord(addr, clientName);
}

export { DEPOT_INFO, DEFAULT_BRANDS, DEFAULT_LOOSE, DEFAULT_MEATS };
