import {
  ClientRecord,
  DeliveryStop,
  DeliveryStopState,
  OrderSummaryMap,
  ParsedChatItem,
  StockItem,
  TimeFilterMode,
} from '../types/logistics';

export function addDaysToDateStr(dateFullStr: string, days: number): string {
  const dt = new Date(`${dateFullStr}T00:00:00`);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function toShortDate(dateFullStr: string): string {
  if (!dateFullStr || dateFullStr.length < 10) return dateFullStr;
  return `${dateFullStr.substring(5, 7)}/${dateFullStr.substring(8, 10)}`;
}

/**
 * 주말(토·일) 휴무 기준 다음 영업 납품일 계산
 * - 금요일(5) -> 월요일(+3일)
 * - 토요일(6) -> 월요일(+2일)
 * - 일요일(0) -> 월요일(+1일)
 * - 월~목(1~4) -> 익일(+1일)
 */
export function getNextDeliveryDateStr(dateFullStr: string): string {
  const wd = new Date(`${dateFullStr}T00:00:00`).getDay();
  if (wd === 5) return addDaysToDateStr(dateFullStr, 3);
  if (wd === 6) return addDaysToDateStr(dateFullStr, 2);
  return addDaysToDateStr(dateFullStr, 1);
}

/**
 * 시간대 필터(전영업일 10시/22시~당일 16시) 시작 기준일 계산
 * - 월요일(1) 납품 -> 금요일(-3일)부터 집계 시작
 */
export function getPrevDeliveryStartDateStr(targetDateStr: string): string {
  const wd = new Date(`${targetDateStr}T00:00:00`).getDay();
  if (wd === 1) return addDaysToDateStr(targetDateStr, -3);
  if (wd === 0) return addDaysToDateStr(targetDateStr, -2);
  return addDaysToDateStr(targetDateStr, -1);
}

export function getWeekdayKo(dateFullStr: string): string {
  if (!dateFullStr || dateFullStr.length < 10) return '';
  const names = ['일', '월', '화', '수', '목', '금', '토'];
  return names[new Date(`${dateFullStr}T00:00:00`).getDay()] ?? '';
}

export function getRecommendedTargetDate(items: ParsedChatItem[]): string {
  const orderItems = items.filter((x) => x.type === '발주');
  if (orderItems.length > 0) {
    return orderItems.reduce(
      (max, it) => (it.targetDeliveryDate > max ? it.targetDeliveryDate : max),
      orderItems[0].targetDeliveryDate
    );
  }
  if (items.length > 0) {
    return items[items.length - 1].dateFull;
  }
  return '2026-11-16';
}

/* =========================================================================
   거래처 CSV 파싱 (정리본 6열 / 회계 원본 2줄 양식 자동 인식)
   ========================================================================= */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

export function parseClientCsvText(csvText: string): {
  clients: ClientRecord[];
  cleanedRows: string[][];
} {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { clients: [], cleanedRows: [] };

  const headerCols = parseCsvLine(lines[0]);
  const clients: ClientRecord[] = [];
  const cleanedRows: string[][] = [];

  if (
    headerCols[0]?.includes('거래처') &&
    headerCols.some((h) => h.includes('별명'))
  ) {
    for (let i = 1; i < lines.length; i++) {
      const c = parseCsvLine(lines[i]);
      if (!c[0]) continue;
      const aliases = c[4]
        ? c[4]
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)
        : [c[0]];
      const rec: ClientRecord = {
        name: c[0],
        ceo: c[1] || '',
        phone: c[2] || '',
        addr: c[3] || '',
        alias: aliases,
        note: c[5] || '',
      };
      clients.push(rec);
      cleanedRows.push([
        rec.name,
        rec.ceo,
        rec.phone,
        rec.addr,
        aliases.join('|'),
        rec.note,
      ]);
    }
  } else {
    for (let i = 2; i < lines.length; i += 2) {
      const row1 = parseCsvLine(lines[i]);
      const row2 = i + 1 < lines.length ? parseCsvLine(lines[i + 1]) : [];
      const rawName = (row1[0] || '').trim();
      if (
        !rawName ||
        rawName.includes('폐업') ||
        rawName.includes('거래종료') ||
        rawName.startsWith('X') ||
        rawName.startsWith('x')
      ) {
        continue;
      }

      const ceo = (row1[1] || '').trim();
      const phone = (row1[3] || '').trim();
      const addr = (row1[4] || '').trim();
      const note = (row2[4] || '').trim();

      const cleanAlias = rawName
        .replace(/\(주\)|주식회사|출고안됨/g, '')
        .replace(/\(.*?\)/g, '')
        .trim();
      const aliases = [rawName];
      if (cleanAlias && cleanAlias !== rawName) aliases.push(cleanAlias);

      const rec: ClientRecord = {
        name: rawName,
        ceo,
        phone,
        addr,
        alias: aliases,
        note,
      };
      clients.push(rec);
      cleanedRows.push([
        rawName,
        ceo,
        phone,
        addr,
        aliases.join('|'),
        note,
      ]);
    }
  }

  return { clients, cleanedRows };
}

export function decodeCsvBuffer(buf: ArrayBuffer): string {
  let text = new TextDecoder('utf-8').decode(buf);
  if (text.includes('\ufffd')) {
    text = new TextDecoder('euc-kr').decode(buf);
  }
  return text;
}

/* =========================================================================
   거래처 매칭 엔진
   ========================================================================= */
export function matchClientFromText(
  text: string,
  clientDB: ClientRecord[]
): {
  matched: boolean;
  clientName: string;
  officialName: string;
  clientObj: ClientRecord | null;
} {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return {
      matched: false,
      clientName: '미확인',
      officialName: '',
      clientObj: null,
    };
  }

  const candidateLines = [lines[0]];
  if (lines.length > 1) candidateLines.push(lines[1]);

  for (const rawLine of candidateLines) {
    const cleanLine = rawLine
      .replace(
        /^(전달:\s*|■+|●+|\*+|내일\s+|오늘\s+|월요일\s+|화요일예약\s+|수요일예약\s+)/g,
        ''
      )
      .trim();
    const lineNoSpace = cleanLine.replace(/\s+/g, '').toLowerCase();

    for (const c of clientDB) {
      for (const al of c.alias) {
        const alNoSpace = al.replace(/\s+/g, '').toLowerCase();
        if (
          alNoSpace.length >= 2 &&
          (lineNoSpace.startsWith(alNoSpace) || cleanLine.includes(al))
        ) {
          return {
            matched: true,
            clientName: al,
            officialName: c.name,
            clientObj: c,
          };
        }
      }
    }
  }

  const firstLine = lines[0].replace(/[●■]/g, ' ').trim();
  const firstToken = firstLine.split(/[\s.,~]/)[0];
  if (
    /정육|마트|축산|푸드|식당|갈비|감자탕|해장국|면옥|한우|삼겹|소매|택배|주물럭|쌈밥|막창|장어|꼬치|국밥/.test(
      firstLine
    )
  ) {
    return {
      matched: true,
      clientName: firstToken,
      officialName: firstToken,
      clientObj: null,
    };
  }

  return {
    matched: false,
    clientName: firstToken || '미확인',
    officialName: '',
    clientObj: null,
  };
}

/* =========================================================================
   카카오톡 대화 파일 파싱 및 발주/계근/기타 분류
   ========================================================================= */
function convertAmPmTime(ampm: string, hmStr: string): { mins: number; str: string } {
  const parts = hmStr.split(':');
  let h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (ampm === '오후' && h < 12) h += 12;
  if (ampm === '오전' && h === 12) h = 0;
  return {
    mins: h * 60 + m,
    str: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
  };
}

export function classifyChatItem(
  item: ParsedChatItem,
  clientDB: ClientRecord[]
): ParsedChatItem {
  const txt = item.content.trim();
  const clientMatch = matchClientFromText(txt, clientDB);
  item.clientName = clientMatch.clientName;
  item.officialName = clientMatch.officialName;
  item.isKnownClient = clientMatch.matched;
  item.clientObj = clientMatch.clientObj;
  item.itemKey = `${item.dateFull}_${item.timeStr}_${item.clientName}_${txt
    .substring(0, 18)
    .replace(/\s+/g, '')}`;

  const ignoreKw = [
    '사진',
    '삭제되었습니다',
    '재고현황',
    '발주체크',
    '분류전',
    '입금',
    '반품장',
    '여기까지',
    '팩스 보냈습니다',
    '코드 잡았습니다',
    '단가표',
    '원가내역',
    '자동차검사',
    '타이어',
    '어떤거 주문하신걸까요',
    '어떤걸로 할까요',
    '기존 재고 늑간',
    '정정 해두었습니다',
    '복사해서 했었는데',
    '그냥 박스로주시죠',
    '인사요',
  ];

  if (ignoreKw.some((k) => txt.includes(k))) {
    item.type = '기타';
    return item;
  }
  if (/\(대산\)\s*\d+박|\(포크\)\s*\d+박|나눌꺼요/.test(txt)) {
    item.type = '기타';
    return item;
  }

  const cleanForWeight = txt
    .replace(/010-\d{3,4}-\d{4}|\d{10,11}/g, '')
    .replace(/\d{1,3},\d{3}\s*원?/g, '')
    .replace(/\d+\.\d{3}\s*원?/g, '')
    .replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?/g, '')
    .replace(/\d+\.\d+\s*(?:센치|cm|mm|미리|톤|키로|kg|k|작업)/gi, '')
    .replace(/작업\s*\d+\.\d+/g, '')
    .replace(/\d+\s*(?:동|호|번지|층|시|구|읍|면|로|길)/g, '')
    .replace(/202\d년?/g, '')
    .replace(/(?:비번|비밀번호)\s*\d+/g, '')
    .replace(/\d{4}[*#]|8846별표|18079/g, '');

  if (/\d+\.\d+|\d+,\d{2}(?!\d)/.test(cleanForWeight)) {
    if (!/발주할게요|주문합니다|반품잡아서/.test(txt)) {
      item.type = '계근';
      return item;
    }
  }
  if (/(?:^|[^\d])[1-3]\d{3}(?:$|[^\d])/.test(cleanForWeight)) {
    item.type = '계근';
    return item;
  }
  if (
    /\d{1,2}(?:대|포|정담|황금|도누|도누리)(?![가-힣])|\d{3}(?:개|각)(?![가-힣])/.test(
      cleanForWeight
    )
  ) {
    item.type = '계근';
    return item;
  }
  if (/냉동\s*미후지\s*전환|일반목으로\s*전환/.test(txt)) {
    item.type = '계근';
    return item;
  }

  const txtNoFax = txt.replace(/팩스/g, '');
  const meatRegex =
    /삼겹|목살|미전지|전지|미삼|등갈비|등뼈|갈비|등심|안심|사태|앞사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|LA|엘에이|살치|부채|토시|안창|장족|미니족|껍데기|돈피|잡육|왕구이|목뼈|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|박스|팩|판|키로|kg|덩이|봉/i;

  if (meatRegex.test(txtNoFax)) {
    if (
      /납품$|반품$|교환인가요|삭제해야해요|단가표요|전체단가표|패스래요|패스요|바꿔달래요|보내야죠|갖고감요|뿐이 안됨|더찍어주세요|두메코입니다|인가요\?$/.test(
        txt
      )
    ) {
      item.type = '기타';
      return item;
    }
    if (txt.length <= 10 && !/\d/.test(txt)) {
      item.type = '기타';
      return item;
    }
    item.type = '발주';
    return item;
  }

  item.type = '기타';
  return item;
}

export function parseSingleKakaoText(
  text: string,
  clientDB: ClientRecord[]
): ParsedChatItem[] {
  const lines = text.split(/\r?\n/);
  let currentDateFull = '2026-11-14';
  let currentDisplayDate = '11/14';

  const pcRegex =
    /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s+(오전|오후)\s*(\d{1,2}:\d{2}),\s*(.*?)\s*:\s*(.*)$/;
  const mobRegex = /^\[(.*?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*(.*)$/;
  const dateLineRegex = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;

  const parsed: ParsedChatItem[] = [];
  let curItem: ParsedChatItem | null = null;

  const makeBlankItem = (
    dateFull: string,
    dateShort: string,
    timeStr: string,
    timeMins: number,
    sender: string,
    content: string
  ): ParsedChatItem => ({
    idx: 0,
    dateFull,
    dateShort,
    timeStr,
    timeMins,
    sender,
    content,
    clientName: '',
    officialName: '',
    isKnownClient: false,
    clientObj: null,
    itemKey: '',
    type: '기타',
    targetDeliveryDate: dateFull,
    delivShort: dateShort,
    delivReason: '-',
    isManualDeliv: false,
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('---') && line.includes('년')) {
      const dm = line.match(dateLineRegex);
      if (dm) {
        currentDateFull = `${dm[1]}-${String(dm[2]).padStart(2, '0')}-${String(
          dm[3]
        ).padStart(2, '0')}`;
        currentDisplayDate = `${String(dm[2]).padStart(2, '0')}/${String(
          dm[3]
        ).padStart(2, '0')}`;
      }
      continue;
    }

    if (
      /^\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s+(오전|오후)\s*\d{1,2}:\d{2}$/.test(
        line
      ) ||
      line.includes('초대했습니다')
    ) {
      continue;
    }

    const mPc = line.match(pcRegex);
    if (mPc) {
      if (curItem) parsed.push(classifyChatItem(curItem, clientDB));
      const y = mPc[1];
      const m = String(mPc[2]).padStart(2, '0');
      const d = String(mPc[3]).padStart(2, '0');
      currentDateFull = `${y}-${m}-${d}`;
      currentDisplayDate = `${m}/${d}`;
      const timeInfo = convertAmPmTime(mPc[4], mPc[5]);
      curItem = makeBlankItem(
        currentDateFull,
        currentDisplayDate,
        timeInfo.str,
        timeInfo.mins,
        mPc[6].trim(),
        mPc[7]
      );
      continue;
    }

    const mMob = line.match(mobRegex);
    if (mMob) {
      if (curItem) parsed.push(classifyChatItem(curItem, clientDB));
      const timeInfo = convertAmPmTime(mMob[2], mMob[3]);
      curItem = makeBlankItem(
        currentDateFull,
        currentDisplayDate,
        timeInfo.str,
        timeInfo.mins,
        mMob[1].trim(),
        mMob[4]
      );
      continue;
    }

    if (
      curItem &&
      !line.includes('카카오톡 대화') &&
      !line.includes('저장한 날짜') &&
      !line.includes('삭제되었습니다')
    ) {
      curItem.content += `\n${line}`;
    }
  }

  if (curItem) parsed.push(classifyChatItem(curItem, clientDB));
  return parsed;
}

/* =========================================================================
   5단계 스마트 납품일 자동 추론 엔진
   ========================================================================= */
const JS_WEEKDAY_MAP: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6,
};

export function inferDeliveryDatesForAllItems(
  items: ParsedChatItem[],
  manualDelivMap: Record<string, string>
): ParsedChatItem[] {
  const result = items.map((it) => ({ ...it }));

  for (let i = 0; i < result.length; i++) {
    const item = result[i];
    item.idx = i;

    if (item.type !== '발주') {
      item.targetDeliveryDate = item.dateFull;
      item.delivShort = item.dateShort;
      item.delivReason = '-';
      item.isManualDeliv = false;
      continue;
    }

    if (manualDelivMap[item.itemKey]) {
      item.targetDeliveryDate = manualDelivMap[item.itemKey];
      item.delivShort = toShortDate(item.targetDeliveryDate);
      item.delivReason = '수동지정';
      item.isManualDeliv = true;
      continue;
    }
    item.isManualDeliv = false;

    const txt = item.content;
    const mins = item.timeMins;
    const msgDt = new Date(`${item.dateFull}T00:00:00`);
    const msgWd = msgDt.getDay();

    const mDate = txt.match(
      /(\d{1,2})\/(\d{1,2})\s*\([월화수목금토일]\)|(\d{1,2})월\s*(\d{1,2})일\s*(?:자로|이월)/
    );
    if (mDate) {
      const mo = String(mDate[1] || mDate[3]).padStart(2, '0');
      const da = String(mDate[2] || mDate[4]).padStart(2, '0');
      item.targetDeliveryDate = `${msgDt.getFullYear()}-${mo}-${da}`;
      item.delivShort = `${mo}/${da}`;
      item.delivReason = `명시날짜(${mo}/${da})`;
      continue;
    }

    const mWd = txt.match(
      /(?:^|[^내금당명월화수목토일])(월|화|수|목|금|토|일)(?:요일|욜|주문=)|^\s*(월|화|수|목|금|토|일)\s*$/m
    );
    if (mWd) {
      const wdChar = mWd[1] || mWd[2];
      const targetWd = JS_WEEKDAY_MAP[wdChar];
      let daysAhead = (targetWd - msgWd + 7) % 7;
      if (daysAhead === 0 && mins >= 12 * 60) daysAhead = 7;
      item.targetDeliveryDate = addDaysToDateStr(item.dateFull, daysAhead);
      item.delivShort = toShortDate(item.targetDeliveryDate);
      item.delivReason = `요일지정(${wdChar}요일)`;
      continue;
    }

    // 1단계-C: 주말(토·일) 발주 → 월요일로 이월
    if (msgWd === 6) {
      item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 2);
      item.delivShort = toShortDate(item.targetDeliveryDate);
      item.delivReason = '토요일→월요일';
      continue;
    }
    if (msgWd === 0) {
      item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
      item.delivShort = toShortDate(item.targetDeliveryDate);
      item.delivReason = '일요일→월요일';
      continue;
    }

    // 2단계-A: 명시적·암묵적 익일 키워드 ("내일", "낼", "아침에", "오전 급 배송" 등)
    // 금요일(5)에 익일 요청 시 토/일 건너뛰고 월요일로 배정
    if (
      /내일|낼주문|(?:^|[^가-힣])낼(?:$|[^가-힣])|아침에\s*(?:들리|갖을러|가지러)|오전\s*급\s*배송|10시\s*전에/.test(
        txt
      )
    ) {
      item.targetDeliveryDate = getNextDeliveryDateStr(item.dateFull);
      item.delivShort = toShortDate(item.targetDeliveryDate);
      item.delivReason = msgWd === 5 ? '금익일→월요일' : '익일키워드(내일)';
      continue;
    }

    if (
      /오늘|당일|금일|지금\s*(?:가|갖|가지러)|조금\s*있다|퇴근\s*(?:길|때|하면서)|오후에|방문\s*예정|\d{1,2}시\s*(?:반\s*)?쯤?\s*(?:온데|방문|찾으러|들린데|갖으러)|즉납|전표\s*하나\s*바로|제\s*코스에서|엄과장님\s*편에/.test(
        txt
      )
    ) {
      item.targetDeliveryDate = item.dateFull;
      item.delivShort = item.dateShort;
      item.delivReason = '당일키워드(오늘/방문)';
      continue;
    }

    if (/●\s*추가|●\s*더추가|●\s*또추가|추가요|추가할께요/.test(txt)) {
      if (mins < 15 * 60) {
        item.targetDeliveryDate = item.dateFull;
        item.delivShort = item.dateShort;
        item.delivReason = '오전추가→당일';
      } else {
        item.targetDeliveryDate = getNextDeliveryDateStr(item.dateFull);
        item.delivShort = toShortDate(item.targetDeliveryDate);
        item.delivReason = msgWd === 5 ? '금저녁추가→월요일' : '저녁추가→익일';
      }
      continue;
    }

    const token = item.clientName.replace(/\s+/g, '').substring(0, 3);
    let weighedSameDay = false;
    if (token.length >= 2) {
      for (let j = i + 1; j < result.length; j++) {
        const nxt = result[j];
        if (nxt.dateFull !== item.dateFull) break;
        if (nxt.type === '계근' && nxt.content.includes(token)) {
          weighedSameDay = true;
          break;
        }
      }
    }
    if (weighedSameDay) {
      item.targetDeliveryDate = item.dateFull;
      item.delivShort = item.dateShort;
      item.delivReason = '당일계근확인';
      continue;
    }

    if (mins < 13 * 60 + 50) {
      item.targetDeliveryDate = item.dateFull;
      item.delivShort = item.dateShort;
      item.delivReason = '13:50이전→당일';
    } else {
      item.targetDeliveryDate = getNextDeliveryDateStr(item.dateFull);
      item.delivShort = toShortDate(item.targetDeliveryDate);
      item.delivReason = msgWd === 5 ? '금오후→월요일' : '14시예약/오후→익일';
    }
  }

  return result;
}

export function getFilteredOrderList(
  allChatItems: ParsedChatItem[],
  opts: {
    targetDate: string;
    timeMode: TimeFilterMode;
    showOnlyOrder: boolean;
    showOnlyKnownClient: boolean;
    forceOnlyOrder?: boolean;
  }
): ParsedChatItem[] {
  const {
    targetDate,
    timeMode,
    showOnlyOrder,
    showOnlyKnownClient,
    forceOnlyOrder = false,
  } = opts;

  return allChatItems.filter((item) => {
    if ((showOnlyOrder || forceOnlyOrder) && item.type !== '발주') return false;
    if (showOnlyKnownClient && !item.isKnownClient) return false;
    if (timeMode === 'all' || !targetDate) return true;

    if (timeMode === 'smart') {
      if (item.type === '발주') {
        return item.targetDeliveryDate === targetDate;
      }
      return item.dateFull === targetDate;
    }

    if (timeMode === 'fullday') {
      return item.dateFull === targetDate;
    }

    const startDateStr = getPrevDeliveryStartDateStr(targetDate);

    if (timeMode === 'prev10_to_16') {
      const isStart =
        item.dateFull === startDateStr && item.timeMins >= 10 * 60;
      const isMid = item.dateFull > startDateStr && item.dateFull < targetDate;
      const isEnd =
        item.dateFull === targetDate && item.timeMins <= 16 * 60;
      return isStart || isMid || isEnd;
    }

    if (timeMode === 'prev22_to_16') {
      const isStart =
        item.dateFull === startDateStr && item.timeMins >= 22 * 60;
      const isMid = item.dateFull > startDateStr && item.dateFull < targetDate;
      const isEnd =
        item.dateFull === targetDate && item.timeMins <= 16 * 60;
      return isStart || isMid || isEnd;
    }

    return true;
  });
}

/* =========================================================================
   일일 재고현황 텍스트 파서
   ========================================================================= */
function getOrCreateStockItem(list: StockItem[], name: string): StockItem {
  const norm = name.replace(/\s+/g, ' ').trim();
  let found = list.find((x) => x.name === norm);
  if (!found) {
    found = {
      name: norm,
      curBrand: '기타',
      brands: {
        대산: { boxes: 0, details: [] },
        포크: { boxes: 0, details: [] },
        기타: { boxes: 0, details: [] },
      },
    };
    list.push(found);
  }
  return found;
}

function parseQtyTokens(itemObj: StockItem, brandName: string, qtyStr: string) {
  const targetKey: '대산' | '포크' | '기타' =
    brandName === '대산' || brandName === '포크' ? brandName : '기타';
  const boxMatch = qtyStr.match(/(\d+)\s*(?:박|박스|팩|판)/);
  const boxes = boxMatch ? parseInt(boxMatch[1], 10) : 0;
  itemObj.brands[targetKey].boxes += boxes;

  const prefix =
    targetKey === '기타' && brandName !== '기타' ? `[${brandName}] ` : '';
  itemObj.brands[targetKey].details.push(prefix + qtyStr);
}

function parseBrandAndQtyLine(itemObj: StockItem, lineStr: string) {
  let rest = lineStr;
  const brandMatch = rest.match(/^\((.*?)\)\s*(.*)$/);
  if (brandMatch) {
    const bRaw = brandMatch[1].trim();
    if (bRaw.includes('대산')) itemObj.curBrand = '대산';
    else if (bRaw.includes('포크')) itemObj.curBrand = '포크';
    else itemObj.curBrand = bRaw;
    rest = brandMatch[2].trim();
  }
  if (rest) {
    parseQtyTokens(itemObj, itemObj.curBrand, rest);
  }
}

export function parseStockText(raw: string): {
  title: string;
  items: StockItem[];
} {
  const lines = raw.split(/\r?\n/);
  const items: StockItem[] = [];
  let curItem: StockItem | null = null;
  let title = '일일 재고 현황표';

  for (const rawLine of lines) {
    const line = rawLine.replace(/\u00A0/g, ' ').trim();
    if (!line) continue;

    if (line.includes('재고현황')) {
      title = line;
      continue;
    }

    const startsWithParen = line.startsWith('(');
    const startsWithNumber = /^\d/.test(line);
    const startsWithSubVendor = /^(IBP|엑셀|초이스|프라임)/i.test(line);

    if (!startsWithParen && !startsWithNumber && !startsWithSubVendor) {
      const parenIdx = line.indexOf('(');
      if (parenIdx > 0) {
        const itemName = line.substring(0, parenIdx).trim();
        curItem = getOrCreateStockItem(items, itemName);
        const rest = line.substring(parenIdx).trim();
        parseBrandAndQtyLine(curItem, rest);
      } else {
        const mDirect = line.match(/^([가-힣a-zA-Z\s]+?)\s+(\d+박.*)$/);
        if (mDirect) {
          curItem = getOrCreateStockItem(items, mDirect[1].trim());
          curItem.curBrand = '기타';
          parseQtyTokens(curItem, '기타', mDirect[2]);
        } else {
          curItem = getOrCreateStockItem(items, line);
          curItem.curBrand = '기타';
        }
      }
    } else if (curItem) {
      parseBrandAndQtyLine(curItem, line);
    }
  }

  return { title, items };
}

/* =========================================================================
   품목별 발주 집계 & 재고 차감
   ========================================================================= */
const ITEM_MATCH_RULES: { key: string; regex: RegExp }[] = [
  { key: '특미삼', regex: /특미삼/ },
  { key: '암미삼', regex: /암미삼/ },
  { key: '미삼', regex: /(?<!특|암)미삼|미박삼겹/ },
  { key: '특삼겹', regex: /특삼겹|특원삼/ },
  {
    key: '암삼겹',
    regex: /암삼겹|암원삼|암삼(?!겹)|암퇘지\s*삼겹|A삼겹|A삼(?!겹)/,
  },
  { key: '빵삼겹', regex: /빵삼겹|빵삼/ },
  { key: '토레인 삼겹', regex: /토레인\s*삼겹|삼겹\s*\d*\s*토레인/ },
  {
    key: '냉장 수입 올리멜 삼겹',
    regex: /수입\s*냉장\s*삼겹|냉장\s*수입\s*삼겹|올리멜\s*삼겹/,
  },
  {
    key: '삼겹',
    regex:
      /(?<!특|암|빵|토레인\s*|수입\s*|냉동\s*|모돈\s*|대패\s*|두메코\s*|테니쉬\s*)삼겹/,
  },
  { key: '특목살', regex: /특목살|특목심|특목/ },
  { key: 'B목살', regex: /B목살|비목살|B목/i },
  {
    key: '냉장 수입 올리멜 목살',
    regex: /수입\s*냉장\s*목살|냉장\s*수입\s*목살|올리멜\s*목살/,
  },
  {
    key: '목살',
    regex: /(?<!특|B|비|수입|냉장수입|올리멜|고원돈)목살|목심/,
  },
  { key: '미전지', regex: /(?<!냉동\s*)미전지/ },
  { key: '지전지', regex: /지전지|지방전지|스켄전지|스키너전지/ },
  {
    key: '전지',
    regex: /(?<!미|지|지방|스켄|스키너|목|냉동|에이)전지|일반전지|A전지/,
  },
  { key: '등갈비', regex: /(?<!바텔|냉동)등갈비/ },
  {
    key: '갈비',
    regex: /(?<!등|LA|엘에이|소|수입|냉동)갈비(?!살)|돈갈비|돼지갈비|생갈비/,
  },
  { key: '등심', regex: /(?<!냉동|꽃)등심/ },
  { key: '안심', regex: /(?<!냉동)안심/ },
  { key: '앞미사태', regex: /앞미사태|미앞사태|앞사태|앞다리사태/ },
  { key: '사태', regex: /(?<!앞|미|소|우|아롱)사태|속사태|생사태/ },
  { key: '항정', regex: /(?<!냉동)항정/ },
  { key: '가브리', regex: /가브리/ },
  { key: '갈매기', regex: /갈매기/ },
  { key: '미후지', regex: /(?<!냉동\s*|3mm\s*)미후지/ },
  {
    key: '후지',
    regex: /냉장\s*3(?:mm|미리)\s*후지|3(?:mm|미리)\s*냉장\s*후지|생후지/,
  },
  { key: '등뼈', regex: /(?<!냉동|목)등뼈|돈등뼈|돼지등뼈|한돈등뼈/ },
  { key: '냉장잡육', regex: /잡육/ },
  {
    key: '냉장 알목심f PR',
    regex: /냉장\s*프라임\s*알목|프라임\s*냉장\s*알목|수입\s*냉장\s*알목/,
  },
  { key: '냉장 살치f PR', regex: /살치/ },
  { key: '냉장 늑간f CH NBP', regex: /늑간/ },
];

export function computeOrderAggregation(
  orders: ParsedChatItem[],
  stockItems: StockItem[]
): OrderSummaryMap {
  const summaryMap: OrderSummaryMap = {};

  stockItems.forEach((s) => {
    summaryMap[s.name] = {
      대산: {
        stock: s.brands.대산.boxes,
        orderBox: 0,
        orderPack: 0,
        clients: [],
      },
      포크: {
        stock: s.brands.포크.boxes,
        orderBox: 0,
        orderPack: 0,
        clients: [],
      },
      기타: {
        stock: s.brands.기타.boxes,
        orderBox: 0,
        orderPack: 0,
        clients: [],
      },
    };
  });

  orders.forEach((ord) => {
    const lines = ord.content
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    let msgDefaultBrand: '미지정' | '대산' | '포크' = '미지정';
    if (/대산꺼로|대산으로/.test(ord.content)) msgDefaultBrand = '대산';
    else if (/포크로|농협/.test(ord.content)) msgDefaultBrand = '포크';

    lines.forEach((line) => {
      if (
        /안녕|부탁|감사|발주|주문|이상입니다|대표님/.test(line) &&
        !/\d/.test(line)
      ) {
        return;
      }

      for (const rule of ITEM_MATCH_RULES) {
        if (rule.regex.test(line)) {
          const targetItem = summaryMap[rule.key];
          if (!targetItem) break;

          let br: '대산' | '포크' | '기타' = '기타';
          if (/대산/.test(line)) br = '대산';
          else if (/포크|농협/.test(line)) br = '포크';
          else if (/정담|황금|토레인|올리멜|엑셀|IBP|NBP/i.test(line))
            br = '기타';
          else if (msgDefaultBrand !== '미지정') br = msgDefaultBrand;
          else {
            if (
              targetItem.포크.stock >= targetItem.대산.stock &&
              targetItem.포크.stock > 0
            ) {
              br = '포크';
            } else if (targetItem.대산.stock > 0) {
              br = '대산';
            } else {
              br = '기타';
            }
          }

          const packMatch = line.match(
            /(\d+(?:\.\d+)?)\s*(팩|펙|판|봉|봉지|덩이|덩어리|키로|kg|k|두|마리)/i
          );
          const boxMatch = line.match(
            /(\d+)\s*(?:박스|빡스|박|box|b)(?![a-z])/i
          );
          const bareNumMatch = line.match(
            /(?:^|[^\d.])(\d{1,2})(?:$|[\s.포대정])/
          );

          if (boxMatch) {
            const q = parseInt(boxMatch[1], 10);
            targetItem[br].orderBox += q;
            targetItem[br].clients.push(`${ord.clientName}(${q}박)`);
          } else if (packMatch) {
            const pQty = parseFloat(packMatch[1]) || 1;
            const pUnit = packMatch[2];
            targetItem[br].orderPack +=
              pUnit.includes('키로') || pUnit.toLowerCase().includes('k')
                ? 1
                : pQty;
            targetItem[br].clients.push(`${ord.clientName}(${packMatch[0]})`);
          } else if (bareNumMatch) {
            const q = parseInt(bareNumMatch[1], 10);
            targetItem[br].orderBox += q;
            targetItem[br].clients.push(`${ord.clientName}(${q}박)`);
          }
          break;
        }
      }
    });
  });

  return summaryMap;
}

/* =========================================================================
   박스/낱개 수량 집계 & 배송처(DeliveryStop) 생성
   ========================================================================= */
export function countOrderBoxesAndLoose(orderText: string): {
  boxes: number;
  loose: number;
} {
  const lines = orderText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  let totalBoxes = 0;
  let totalLoose = 0;

  lines.forEach((line, idx) => {
    if (
      /010-\d{3,4}-\d{4}|안녕하|발주드리려고|부탁드립|부탁해요|보내주세요|보내주세여|이상입니다|감사합니다|주문합니다|주문드립니다|방문예정|들리겠습니다|차차장님|우편함에|넣어주세요|기름 적은거로/.test(
        line
      )
    ) {
      if (
        !/(삼겹|목살|미전지|전지|미삼|등갈비|등뼈|갈비|등심|안심|사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|살치|부채|장족|미니족|돈피|잡육|왕구이|목뼈|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|주물럭|제육)/.test(
          line
        )
      ) {
        return;
      }
    }
    if (
      idx === 0 &&
      !/\d+\s*(박스|빡스|박|box|팩|펙|판|봉|덩이|벌)/i.test(line)
    ) {
      return;
    }

    let s = line;
    s = s.replace(/\((\d+)\s*박스(?:로[^)]*)?\)/g, ' $1박스 ');
    s = s.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
    s = s.replace(/[+-]?\d{1,3}(?:,\d{3})+(?:원|행사|할인|납)?/g, ' ');
    s = s.replace(/\d+\.\d{3}(?:원)?/g, ' ').replace(/-\d+할인/g, ' ');
    s = s.replace(/\d+(?:\.\d+)?\s*(?:mm|미리|센치|cm)/gi, ' ');
    s = s.replace(
      /\d{1,2}월\s*\d{1,2}일(?:자로)?|\d{1,2}\/\d{1,2}|\d{1,2}일(?:자|자로|재고|진|포크|암삼|대산)?/g,
      ' '
    );
    s = s.replace(/\d+\s*~\s*\d+\s*(?:키로|kg)?(?:대)?/gi, ' ');
    s = s.replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ');
    s = s.replace(/(?:미삼|삼겹|암삼|암미삼)\s*1[6789]키로/g, '미삼 ');
    s = s.replace(/\d+호점|1\+\+/g, ' ');
    s = s
      .replace(/한박스/g, '1박스')
      .replace(/한판/g, '1판')
      .replace(/한덩이/g, '1덩이')
      .replace(/한덩어리/g, '1덩어리');
    s = s
      .replace(/두마리분/g, '2마리분')
      .replace(/한마리분/g, '1마리분')
      .replace(/한마리반/g, '1마리분');

    if (
      !/(삼겹|목살|목심|미전지|전지|미삼|등갈비|등뼈|목뼈|갈비|등심|안심|사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|우겹살|차돌|스지|살치|부채|장족|미니족|돈피|껍데기|잡육|등잡|왕구이|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|주물럭|제육|불고기|미추리|잡뼈|우족|덧살|덜미|민찌|수삼|모돈|엘에이|LA|백립|빽립|프렌치렉|숄더렉|삼각살)/i.test(
        s
      )
    ) {
      return;
    }

    const boxMatches = [
      ...s.matchAll(/(\d+)\s*(?:박스|빡스|박|box|b)(?![a-zA-Z])/gi),
    ];
    const halfBox = s.includes('반박스') ? 1 : 0;

    const sRem = s
      .replace(/\d+\s*(?:박스|빡스|박|box|b)(?![a-zA-Z])/gi, ' ')
      .replace(/반박스/g, ' ');
    const looseMatches = [
      ...sRem.matchAll(
        /(\d+)\s*(?:팩|펙|판|봉|봉지|덩이|덩어리|진공|벌|두|마리분|마리|피스|p|개)(?![a-zA-Z])/gi
      ),
    ];

    if (boxMatches.length > 0 || halfBox > 0 || looseMatches.length > 0) {
      boxMatches.forEach((m) => {
        totalBoxes += parseInt(m[1], 10);
      });
      totalBoxes += halfBox;
      looseMatches.forEach((m) => {
        totalLoose += parseInt(m[1], 10);
      });
    } else {
      const kgMatches = [
        ...sRem.matchAll(/(\d+(?:\.\d+)?)\s*(?:kg|키로|킬|k)(?![a-zA-Z])/gi),
      ];
      if (kgMatches.length > 0) {
        totalLoose += kgMatches.length;
      } else {
        const bareNums = [...sRem.matchAll(/(?:^|[^\d])(\d{1,2})(?!\d)/g)];
        if (bareNums.length > 0) {
          totalBoxes += parseInt(bareNums[0][1], 10);
        }
      }
    }
  });

  return { boxes: totalBoxes, loose: totalLoose };
}

export function buildDeliveryStopsFromOrders(
  filteredOrders: ParsedChatItem[],
  dispatchMap: Record<string, string>,
  deliveryStateMap: Record<string, DeliveryStopState>,
  targetDate: string
): DeliveryStop[] {
  const destMap = new Map<
    string,
    {
      clientName: string;
      officialName: string;
      ceo: string;
      addr: string;
      phone: string;
      note: string;
      totalBoxes: number;
      totalLoose: number;
      isUrgent: boolean;
      isKnownClient: boolean;
      orderLines: string[];
      firstTime: string;
    }
  >();

  filteredOrders.forEach((ord) => {
    const key = ord.clientName;
    if (!destMap.has(key)) {
      destMap.set(key, {
        clientName: key,
        officialName: ord.clientObj ? ord.clientObj.name : key,
        ceo: ord.clientObj ? ord.clientObj.ceo : '',
        addr: ord.clientObj ? ord.clientObj.addr : '',
        phone: ord.clientObj ? ord.clientObj.phone : '',
        note: ord.clientObj ? ord.clientObj.note : '',
        totalBoxes: 0,
        totalLoose: 0,
        isUrgent: false,
        isKnownClient: ord.isKnownClient,
        orderLines: [],
        firstTime: ord.timeStr,
      });
    }
    const entry = destMap.get(key)!;
    const cnt = countOrderBoxesAndLoose(ord.content);
    entry.totalBoxes += cnt.boxes;
    entry.totalLoose += cnt.loose;
    entry.orderLines.push(ord.content.trim());
    if (/급|일찍|오전/.test(ord.content)) entry.isUrgent = true;
  });

  const dateCompact = (targetDate || '2026-11-14').replace(/-/g, '').slice(2);

  return Array.from(destMap.values()).map((d, idx) => {
    const state = deliveryStateMap[d.clientName];
    return {
      id: `stop-${d.clientName}`,
      stopOrder: idx + 1,
      waybillNo: `AWB-${dateCompact}-${String(idx + 1).padStart(2, '0')}`,
      clientName: d.clientName,
      officialName: d.officialName,
      ceo: d.ceo,
      phone: d.phone,
      address: d.addr || '주소 미등록 (거래처 CSV 확인)',
      doorNote: d.note,
      boxCount: d.totalBoxes,
      looseCount: d.totalLoose,
      isUrgent: d.isUrgent,
      isKnownClient: d.isKnownClient,
      orderLines: d.orderLines,
      vehicleCode: dispatchMap[d.clientName] || 'UNASSIGNED',
      status: state?.status ?? 'pending',
      completedTime: state?.completedTime,
      dropOffMethod: state?.dropOffMethod,
      issueReason: state?.issueReason,
      scheduledTime: d.firstTime,
    };
  });
}

/* =========================================================================
   CSV & 카톡 발주체크 텍스트 내보내기 유틸리티
   ========================================================================= */
export function downloadCsvBlob(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildKakaoOrderCheckText(summaryMap: OrderSummaryMap): string {
  const lines = ['발주체크'];
  Object.keys(summaryMap).forEach((itemName) => {
    const g = summaryMap[itemName];
    const totBox = g.대산.orderBox + g.포크.orderBox + g.기타.orderBox;
    const totPack = g.대산.orderPack + g.포크.orderPack + g.기타.orderPack;
    const bStr = totBox > 0 ? `${totBox}박스` : '박스';
    const pStr = totPack > 0 ? `${totPack}팩` : '팩';
    lines.push(`${itemName} ${bStr} ${pStr}`);
  });
  return lines.join('\n');
}
