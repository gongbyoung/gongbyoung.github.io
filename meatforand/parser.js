/* 카톡 발주 정리 - 핵심 로직 (브라우저/노드 공용) */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.OrderParser = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────── 설정 기본값 ───────── */
  // 숫자 뒤에 붙으면 "메이커 지정"으로 분리되는 단어들 (앱 설정에서 추가/삭제 가능)
  const DEFAULT_MAKERS = [
    '스미스필드', '알레한듀록', '알레한', '올리멜', '테니쉬', '토레인',
    '두메코', '고원돈', '돈울림', '대산', '정담', '포크', '농협',
  ];

  // 회사 발주체크 순서 (정렬용)
  const PRODUCT_ORDER = [
    '삼겹', '특삼겹', '암삼겹', '미삼', '암미삼', '특미삼', '목살', '특목살', 'B목살',
    '미전지', '전지', '지전지', '목전지', '갈비', '등갈비', '등심', '안심', '사태', '앞미사태',
    '항정', '가브리', '갈매기', '미후지', '냉장3mm후지', '등뼈', '잡육',
  ];

  const BOX_UNITS = ['박스', '빡스', '박', '빡', 'box'];
  const PIECE_UNIT_MAP = {
    팩: '팩', 봉지: '봉', 봉: '봉', 판: '판', 키로: 'kg', 킬로: 'kg', kg: 'kg',
    덩이: '덩이', 벌: '벌', 마리: '마리', 개: '개', 장: '장',
  };
  const UNIT_RE = '박스|빡스|박|빡|[Bb][Oo][Xx]|팩|봉지|봉|판|키로|킬로|kg|KG|Kg|덩이|벌|마리|개|장';
  const SUSP_UNIT_RE = '박스|빡스|박|빡|[Bb][Oo][Xx]|팩|봉지|봉|판|덩이|벌|마리';

  const PRODUCT_VOCAB = /삼겹|미삼|목살|전지|항정|갈비|등심|안심|사태|가브리|갈매기|후지|등뼈|돈피|잡육|지방|홍두깨|설도|차돌|족|모돈|우삼|살치|앞다리|뒷다리/;
  const POLITE = /주세요|주십시|부탁|감사|이상입니다|보내주|입고|안녕|드립니다|합니다|해요|하세요|바랍니다|확인|네$/;

  /* ───────── 유틸 ───────── */
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDate = (d) => `${d.getMonth() + 1}/${d.getDate()}(${'일월화수목금토'[d.getDay()]})`;
  const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  /* ───────── 1. 카톡 내보내기(안드로이드 txt) 파싱 ───────── */
  const MSG_HEAD = /^(\d{4})년 (\d{1,2})월 (\d{1,2})일 (오전|오후) (\d{1,2}):(\d{2}), (.*?) : (.*)$/;
  const SEP_LINE = /^\d{4}년 \d{1,2}월 \d{1,2}일 (오전|오후) \d{1,2}:\d{2}(,.*)?$/;

  function parseChat(text) {
    text = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const messages = [];
    let cur = null;
    for (const line of text.split('\n')) {
      const m = MSG_HEAD.exec(line);
      if (m) {
        let h = parseInt(m[5], 10) % 12;
        if (m[4] === '오후') h += 12;
        cur = {
          ts: new Date(+m[1], +m[2] - 1, +m[3], h, +m[6]),
          sender: m[7].trim(),
          lines: [m[8]],
        };
        messages.push(cur);
      } else if (SEP_LINE.test(line)) {
        cur = null; // 날짜 구분선 / 입장·초대 같은 시스템 줄
      } else if (cur) {
        cur.lines.push(line);
      }
    }
    return messages;
  }

  /* ───────── 2. 집계 기간 ───────── */
  // 전날 12:00 ~ 해당일 16:00, 월요일은 금요일 12:00부터
  function defaultWindow(target) {
    const day = startOfDay(target);
    const start = new Date(day);
    start.setDate(start.getDate() - (day.getDay() === 1 ? 3 : 1));
    start.setHours(12, 0, 0, 0);
    const end = new Date(day);
    end.setHours(16, 0, 0, 0);
    return { start, end };
  }

  // 파일 마지막 메시지를 보고 "이번 발주일" 추정 (평일 16시 이후/주말이면 다음 평일)
  function guessTargetDate(messages) {
    if (!messages.length) return startOfDay(new Date());
    const last = messages[messages.length - 1].ts;
    let d = startOfDay(last);
    const advance = () => d.setDate(d.getDate() + 1);
    if (last.getHours() >= 16) advance();
    while (d.getDay() === 0 || d.getDay() === 6) advance();
    return d;
  }

  /* ───────── 3. 거래처 CSV / 매칭 ───────── */
  function parseCSV(text) {
    text = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    const rows = [];
    let row = [], f = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows;
  }

  function parseCustomers(csvText) {
    const rows = parseCSV(csvText);
    const hi = rows.findIndex((r) => r.some((c) => c.trim() === '거래처명'));
    if (hi < 0) return [];
    const head = rows[hi].map((c) => c.trim());
    const iName = head.indexOf('거래처명');
    const iAddr = head.indexOf('주소');
    const iAlias = head.indexOf('별명');
    const out = [];
    for (const r of rows.slice(hi + 1)) {
      const name = (r[iName] || '').trim();
      if (!name) continue;
      out.push({
        name,
        address: iAddr >= 0 ? (r[iAddr] || '').trim() : '',
        aliases: iAlias >= 0 ? (r[iAlias] || '').split(/[\/;,·]/).map((s) => s.trim()).filter(Boolean) : [],
      });
    }
    return out;
  }

  function normName(s) {
    return s
      .replace(/[gG]/g, '지')
      .replace(/\(주\)|주식회사|농업회사법인|농업법인|농법|\(유\)/g, '')
      .replace(/앤/g, '엔')
      .replace(/[\s\-_.·,]/g, '')
      .replace(/마트정육코너|정육코너/g, '')
      .toLowerCase();
  }
  function splitParen(name) {
    const clean = name.replace(/\(주\)|\(유\)/g, '');
    const m = clean.match(/\(([^)]*)\)?/);
    const paren = m ? m[1] : '';
    const core = clean.replace(/\([^)]*\)?/g, '');
    return { core: normName(core), paren: normName(paren), parts: core.split(/[-=>]+/).map(normName).filter((x) => x.length >= 3) };
  }
  function isSubseq(q, f) {
    let i = 0;
    for (const ch of f) if (ch === q[i] && ++i === q.length) return true;
    return q.length === 0;
  }
  function bigrams(s) {
    const a = [];
    for (let i = 0; i < s.length - 1; i++) a.push(s.slice(i, i + 2));
    return a;
  }
  function dice(a, b) {
    if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
    const A = bigrams(a), B = bigrams(b);
    const used = new Array(B.length).fill(false);
    let hit = 0;
    for (const x of A) {
      const j = B.findIndex((y, k) => !used[k] && y === x);
      if (j >= 0) { used[j] = true; hit++; }
    }
    return (2 * hit) / (A.length + B.length);
  }

  function buildMatcher(customers, userAliases) {
    userAliases = userAliases || {};
    const cands = customers.map((c) => {
      const { core, paren, parts } = splitParen(c.name);
      const forms = [core, core + paren, paren + core, normName(c.name), ...parts];
      for (const a of c.aliases || []) forms.push(normName(a));
      return { c, forms: forms.filter(Boolean), core };
    });
    const byName = new Map(customers.map((c) => [c.name, c]));

    function score(q, cand) {
      let best = 0;
      for (const f of cand.forms) {
        let s;
        if (f === q) s = 1;
        else if (q.length >= 2 && f.includes(q)) s = 0.9 - Math.min(0.2, (f.length - q.length) * 0.015);
        else if (f.length >= 3 && q.includes(f)) s = 0.85 - Math.min(0.2, (q.length - f.length) * 0.015);
        else if (q.length >= 4 && isSubseq(q, f)) s = 0.75 + 0.2 * (q.length / f.length);
        else if (f.length >= 4 && isSubseq(f, q)) s = 0.75 + 0.2 * (f.length / q.length);
        else s = dice(q, f) * 0.8;
        if (s > best) best = s;
      }
      return best;
    }

    return function match(raw) {
      const key = raw.trim();
      if (userAliases[key] !== undefined) {
        const c = byName.get(userAliases[key]);
        return { raw, official: c ? c.name : userAliases[key], address: c ? c.address : '', status: c ? 'alias' : 'raw' };
      }
      const q = normName(key);
      if (q.length < 2 || !cands.length) return { raw, official: raw, address: '', status: 'none' };
      const ranked = cands.map((cd) => ({ cd, s: score(q, cd) })).sort((a, b) => b.s - a.s);
      const top = ranked[0];
      if (top.s < 0.55) return { raw, official: raw, address: '', status: 'none' };
      const second = ranked.find((r) => r.cd.core !== top.cd.core && r.s > 0);
      const ambiguous = second && top.s - second.s < 0.04;
      const status = top.s >= 0.85 && !ambiguous ? 'ok' : 'maybe';
      return { raw, official: top.cd.c.name, address: top.cd.c.address, status };
    };
  }

  /* ───────── 4. 한 줄(품목) 파싱 ───────── */
  const DAY_WORDS = '월화수목금토일';

  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function makerRegex(makers) {
    const list = makers.slice().sort((a, b) => b.length - a.length).map(escapeRe);
    return list.length ? new RegExp(list.join('|'), 'g') : null;
  }

  const NOTE_WORDS = /재고|작업|꼭|큰거로?|큰걸로|작은거|좋은거|포함|제외|추가요?|급|할인/g;

  function normProduct(name) {
    return name
      .replace(/\s+/g, ' ')
      .replace(/^[#\s]+/, '')
      .replace(/^(오늘|내일|모레)\s+/, '')
      .replace(/^돼지(?=안심|등뼈|등심|갈비|등갈비)/, '')
      .replace(/(삼겹|항정|가브리|갈매기|오겹)살/g, '$1')
      .replace(/찌게/g, '찌개')
      .replace(/[ㅡ—–~]+\s*$/g, '')
      .replace(/^[\s,./·\-]+|[\s,./·\-]+$/g, '')
      .trim();
  }

  const POLITE_TAIL = /(주세요|주십시오|부탁드립니다|부탁해요|부탁드려요|보내주세요|해주세요|요)$/;

  /**
   * 한 줄을 해석한다.
   * 반환: {kind:'item', rows:[{cat,name,maker,qty,unit,note}]} | {kind:'memo'} | {kind:'weight'} |
   *       {kind:'suspicious', reason} | {kind:'noqty', name} | {kind:'section', value}
   */
  function parseItemLine(raw, ctx) {
    const mk = ctx.makerRe;
    let s = raw.replace(/\s+/g, ' ').trim();
    if (!s) return { kind: 'blank' };
    if (/^(냉동|냉장)$/.test(s)) return { kind: 'section', value: s };

    const notes = [];

    // 할인/가격 토큰 제거
    s = s.replace(/[-−]\s*\d[\d,]*\s*원?\s*할인/g, () => { notes.push('할인'); return ' '; });
    s = s.replace(/\d[\d,]*\s*원/g, () => ' ');

    // 두께(3mm, 3미리) 보호
    s = s.replace(/(\d+(?:\.\d+)?)\s*(mm|㎜|미리|밀리|센치|cm)로?/gi, (m, n, u) => ` ${n}${/센치|cm/i.test(u) ? 'cm' : 'mm'} `);

    // 중량 범위/규격 (17~18키로 / 18키로 이상 3)
    const specs = [];
    s = s.replace(/(\d+)\s*[~\-]\s*(\d+)\s*(키로|킬로|kg)\s*(정도|이상|이하)?/gi, (m) => { specs.push(m.trim()); return ' '; });
    if (/\d+\s*(키로|킬로|kg)\s*(이상|이하)/i.test(s) && /\d+\s*(키로|킬로|kg)\s*(이상|이하).*\d/i.test(s)) {
      s = s.replace(/(\d+)\s*(키로|킬로|kg)\s*(이상|이하)/gi, (m) => { specs.push(m.trim()); return ' '; });
    }
    if (specs.length) notes.push(specs.join(' '));

    // 괄호 안 메이커 분배: 삼겹 15박스(포크10 정담5)
    let makerSplit = null;
    if (mk) {
      s = s.replace(/\(([^)]*)\)/g, (m, inner) => {
        const parts = [...inner.matchAll(new RegExp('(' + mk.source + ')\\s*(\\d+)', 'g'))];
        if (parts.length) {
          makerSplit = parts.map((p) => ({ maker: p[1], qty: +p[2] }));
          return ' ';
        }
        return m;
      });
    }

    // 메이커가 없는 괄호 설명은 메모로 (짧은 변형 "(고)"는 이름에 유지)
    s = s.replace(/\(([^)]*)(\)|$)/g, (m, inner) => {
      const t = inner.trim();
      if (!t) return ' ';
      if (t.length <= 2 && !/\d/.test(t)) return m;
      if (mk && new RegExp(mk.source).test(t)) return m;
      notes.push(t);
      return ' ';
    });
    // "17~19사이" 같은 범위는 규격 메모
    s = s.replace(/\d+\s*~\s*\d+\s*(사이)?/g, (m) => { notes.push(m.trim()); return ' '; });

    // 소수점/큰 숫자 = 계근·단가 줄
    const hasExplicitQty = new RegExp('\\d\\s*(' + SUSP_UNIT_RE + ')').test(s) || /(한|두|세|네)\s*(박스|빡스|박|팩|봉|판|덩이)/.test(s);
    // 단가(7,000 / 12500 같은 큰 숫자)는 수량 단위가 분명한 줄에서만 떼어 버림
    if (hasExplicitQty) {
      s = s.replace(/\d{1,3}(?:,\d{3})+/g, ' ').replace(/(?<![\d.])\d{4,}(?![\d.])/g, ' ');
    }
    if (/\d\.\d/.test(s.replace(/\d+(?:\.\d+)?(?:mm|cm)/g, ''))) {
      return hasExplicitQty ? { kind: 'suspicious', reason: '소수점(단가/계근) 숫자가 함께 있어요' } : { kind: 'weight' };
    }
    if (/(?<![\d])\d{4,}/.test(s) || /\d{1,3},\d{3}/.test(s)) return { kind: 'weight' };

    // 수량 토큰 찾기
    const KNUM = { 한: 1, 두: 2, 세: 3, 네: 4 };
    const qtyRe = new RegExp('(?:(\\d+)(?!\\d|mm|cm)|(반|한|두|세|네)(?=\\s*(?:' + UNIT_RE + ')))\\s*(' + UNIT_RE + ')?', 'g');
    const qtys = [];
    let m;
    while ((m = qtyRe.exec(s))) {
      const num = m[1] ? parseInt(m[1], 10) : m[2] === '반' ? 0.5 : KNUM[m[2]];
      qtys.push({ num, unit: m[3] || '', index: m.index, end: qtyRe.lastIndex });
    }

    if (!qtys.length) {
      // 숫자 없음: 품목처럼 보이면 수량 미기재, 아니면 메모
      const plain = s.replace(/[()]/g, ' ').trim();
      if (plain.length <= 14 && PRODUCT_VOCAB.test(plain) && !POLITE.test(plain) && !POLITE_TAIL.test(plain)) {
        return { kind: 'noqty', name: normProduct(plain) };
      }
      return { kind: 'memo', text: raw.trim() };
    }

    const bare = qtys.filter((q) => !q.unit);
    if (bare.length >= 2) return { kind: 'suspicious', reason: '숫자가 여러 개라 수량을 판단하기 어려워요' };

    const first = qtys[0];
    let namePart = s.slice(0, first.index);
    let restPart = s.slice(first.end);
    // 첫 수량 뒤의 추가 수량 토큰은 rest에서 제외하고 따로 처리
    for (const q of qtys.slice(1)) restPart = restPart.replace(s.slice(q.index, q.end), ' ');

    // 이름 없이 수량으로 시작하는 줄("1팩 찌개")은 바로 앞 품목을 이어받음
    let inherited = false;
    if (!/[가-힣A-Za-z]/.test(namePart)) {
      if (first.index === 0 && ctx.lastBase) { namePart = ctx.lastBase; inherited = true; }
      else return { kind: 'memo', text: raw.trim() };
    }
    if (first.num > 500) return { kind: 'weight' };

    // 메이커 추출 (이름/뒷부분 모두)
    const makers = [];
    const takeMakers = (str) => (mk ? str.replace(mk, (w) => { if (!makers.includes(w)) makers.push(w); return ' '; }) : str);
    const namePartOrig = namePart;
    namePart = takeMakers(namePart);
    const nameHadMaker = makers.length > 0;
    const restBefore = restPart;
    restPart = takeMakers(restPart);

    // 이름 안의 괄호: 짧은 변형(고)은 이름에 유지, 나머지는 메모로
    namePart = namePart.replace(/\(([^)]*)\)?/g, (w, inner) => {
      const t = inner.replace(/[\s,]+/g, ' ').trim();
      if (!t) return ' ';
      if (t.length <= 2) return w;
      notes.push(t);
      return ' ';
    });
    // 이름 속 노트 단어 (예: 포크재고 → 재고)
    namePart = namePart.replace(NOTE_WORDS, (w) => { notes.push(w.replace(/요$/, '')); return ' '; });

    // 뒷부분 정리
    let restClean = restPart.replace(/\(([^)]*)\)/g, (w, inner) => { notes.push(inner.trim()); return ' '; });
    const DROP = /^(주세요|주십시오|부탁드립니다|부탁드려요|부탁해요|보내주세요|해주세요|요|로|으로|이요|입니다|만|분|꺼|정도|이상)$/;
    const toks = restClean.replace(/[^\p{L}\p{N} ]/gu, ' ').split(' ').filter(Boolean)
      .filter((t) => !DROP.test(t))
      .map((t) => (t.length > 1 ? t.replace(/(이요|해요|요)$/, '') : t))
      .filter((t) => t && !DROP.test(t));

    let name = normProduct(namePart.replace(/\s+/g, ' '));
    // 이름에 품목 단어가 없고 메이커뿐이면 메이커를 이름에 되돌림 (예: 수입 두메코 8mm)
    let makerList = makers.slice();
    if (nameHadMaker && !PRODUCT_VOCAB.test(name)) {
      name = normProduct(namePartOrig.replace(/\s+/g, ' '));
      makerList = [];
    }
    // 용도 한 단어(제육/찌개 등)만 뒤에 붙으면 이름에 합침
    const USAGE = /^(제육|찌개|구이|보쌈|불고기|수육|국거리|장조림|다짐|슬라이스|샤브|주물럭|제육용|찌개용|구이용)$/;
    const baseName = name;
    if (toks.length === 1 && USAGE.test(toks[0])) { name = name + ' ' + toks[0]; toks.length = 0; }
    if (toks.length) notes.push(toks.join(' '));

    if (ctx.section === '냉동' && !/^냉동/.test(name)) name = '냉동 ' + name;
    name = name.replace(/(냉장|냉동)?\s*(\d+mm)\s*(냉장|냉동)?\s*후지/, (m, a, mm, b) => `${a || b || ''}${mm}후지`);
    name = name.replace(/\s+/g, ' ').replace(/(.{2,})(은|는)$/, '$1').trim();
    if (!name || name.length > 24 || /(특별시|광역시|[가-힣]+(?:시|군|구) [가-힣0-9]*(?:로|길|동)\b)/.test(name)) return { kind: 'memo', text: raw.trim() };
    if (POLITE.test(name) && !PRODUCT_VOCAB.test(name)) return { kind: 'memo', text: raw.trim() };

    // 메이커가 둘 이상이면 마지막 것이 최종(예: "대산꺼없어서 포크로"), 원문을 메모로 남김
    let makerLabel = makerList.length ? makerList[makerList.length - 1] : '';
    if (makerList.length > 1) { const k = notes.indexOf(toks.join(' ')); if (k >= 0) notes.splice(k, 1); notes.push(restBefore.trim().replace(/\s+/g, ' ')); }

    const noteText = [...new Set(notes.map((n) => n.trim()).filter(Boolean))].join(' · ');
    const rows = [];
    const pushRow = (qty, unitRaw, maker) => {
      const isBox = !unitRaw || BOX_UNITS.includes(unitRaw.toLowerCase());
      const unit = isBox ? '박스' : PIECE_UNIT_MAP[unitRaw] || PIECE_UNIT_MAP[unitRaw.toLowerCase()] || unitRaw;
      let cat = 'box';
      if (!isBox) cat = 'piece';
      else if (maker) cat = 'maker';
      rows.push({ cat, name, maker: maker || '', qty, unit, note: noteText });
    };

    if (makerSplit) {
      for (const p of makerSplit) pushRow(p.qty, '박스', p.maker);
    } else {
      for (const q of qtys) pushRow(q.num, q.unit, makerLabel);
    }
    if (!inherited) ctx.lastBase = baseName;
    return { kind: 'item', rows };
  }

  /* ───────── 5. 메시지 → 주문 ───────── */
  const BOILER_MSGS = /^(사진|동영상|이모티콘|파일[: ].*|메시지가 삭제되었습니다\.?)$/;

  function resolveDayRef(text, postedAt) {
    let ref = null;
    const base = startOfDay(postedAt);
    const add = (n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
    if (/모레/.test(text)) ref = add(2);
    else if (/내일/.test(text)) ref = add(1);
    else if (/(^|\s)오늘/.test(text)) ref = add(0);
    else {
      const w = text.match(new RegExp('([' + DAY_WORDS + '])요일'));
      if (w) {
        const idx = '일월화수목금토'.indexOf(w[1]);
        const diff = (idx - base.getDay() + 7) % 7;
        ref = add(diff);
      } else {
        const dm = text.match(/(\d{1,2})\/(\d{1,2})\s*\([월화수목금토일]\)/);
        if (dm) ref = new Date(base.getFullYear(), +dm[1] - 1, +dm[2]);
      }
    }
    return ref;
  }

  const TAG_TOKENS = /오늘|내일|모레|[월화수목금토일]요일|\d{1,2}\/\d{1,2}\s*\([월화수목금토일]\)|예약|오후에?|오전에?|대표님|일찍|조금|급배송|■\s*급+|●\s*(?:또\s*)?추가|즉납|부탁드립니다|부탁드려요|부탁해요|보내주세요|주세요|이상입니다|발주건입니다|발주건|발주|\s|[.,!~ㅎㅋ]/g;

  function parseOrderMessage(msg, ctx) {
    const lines = msg.lines.map((l) => l.trim()).filter((l) => l !== '');
    if (!lines.length) return null;
    if (lines.length === 1 && BOILER_MSGS.test(lines[0])) return null;

    const flags = new Set();
    const memos = [];
    let dayRef = null;
    let headerRaw = null;
    let bodyStart = 0;

    // 헤더(거래처) 찾기: 태그 줄(오늘/내일 등)은 건너뜀
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (BOILER_MSGS.test(l)) continue;
      const leftover = l.replace(TAG_TOKENS, '');
      if (!leftover) { // 순수 태그 줄
        const d = resolveDayRef(l, msg.ts); if (d) dayRef = d;
        if (/오후/.test(l)) flags.add('오후');
        if (/급/.test(l)) flags.add('급');
        continue;
      }
      headerRaw = l;
      bodyStart = i + 1;
      break;
    }
    if (!headerRaw) return null;
    if (/^발주\s*체크/.test(headerRaw)) return null; // 집계 요약 메시지

    // 헤더 정리
    if (/추가/.test(headerRaw)) flags.add('추가');
    if (/■\s*급|급배송|급\s*배송/.test(headerRaw)) flags.add('급');
    if (/오후/.test(headerRaw)) flags.add('오후');
    {
      const d = resolveDayRef(headerRaw, msg.ts); if (d) dayRef = dayRef || d;
    }
    let header = headerRaw
      .replace(/●\s*(또\s*)?추가/g, ' ')
      .replace(/■\s*급+/g, ' ')
      .replace(/\d{1,2}\/\d{1,2}\s*\([월화수목금토일]\)/g, ' ')
      .replace(/발주건입니다|발주건|발주드립니다|발주/g, ' ')
      .replace(/(오늘|내일|모레|[월화수목금토일]요일|예약|오후에|오전에|대표님|급배송)/g, ' ')
      .replace(/[.,!~:]+\s*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!header || header.length > 30 || /[?？]/.test(header)) return null;
    // 헤더가 "품목 + 수량" 형태면 헤더가 아님 (계근/잡담 줄)
    if (/\d\.\d/.test(header) || /(?<!\d)\d{3,}/.test(header)) return null;

    const items = [];
    const rejected = [];
    const noqty = [];
    let sawWeightOnly = false;
    const subCtx = { makerRe: ctx.makerRe, section: '', lastBase: '' };

    for (let i = bodyStart; i < lines.length; i++) {
      const l = lines[i];
      if (BOILER_MSGS.test(l)) continue;
      const leftover = l.replace(TAG_TOKENS, '');
      if (!leftover) {
        const d = resolveDayRef(l, msg.ts); if (d) dayRef = dayRef || d;
        if (/오후/.test(l)) flags.add('오후');
        if (/급/.test(l)) flags.add('급');
        continue;
      }
      const r = parseItemLine(l, subCtx);
      if (r.kind === 'section') { subCtx.section = r.value === '냉동' ? '냉동' : ''; continue; }
      if (r.kind === 'item') {
        for (const row of r.rows) items.push({ ...row, raw: l });
      } else if (r.kind === 'noqty') {
        noqty.push({ name: r.name, raw: l });
      } else if (r.kind === 'suspicious') {
        rejected.push({ line: l, reason: r.reason });
      } else if (r.kind === 'weight') {
        sawWeightOnly = true;
      } else if (r.kind === 'memo') {
        const t = r.text;
        if (t.length <= 60 && !/^(이렇게 )?(부탁|감사|안녕|발주드리려고)|입고 ?부탁|^이상입니다|보내주세요$/.test(t)) memos.push(t);
        const d = resolveDayRef(t, msg.ts); if (d && !dayRef) dayRef = d;
        if (/오후/.test(t)) flags.add('오후');
      }
    }

    if (!items.length && !rejected.length && !noqty.length) return null;
    return {
      ts: msg.ts, sender: msg.sender, header, flags: [...flags], memos, dayRef,
      items, rejected, noqty, sawWeightOnly,
    };
  }

  /* ───────── 6. 전체 실행 ───────── */
  function run(opts) {
    const {
      messages, window: win, target, matcher,
      makers = DEFAULT_MAKERS, excludeSenders = [],
      includeOtherDays = false, includeDuplicates = false,
    } = opts;
    const makerRe = makerRegex(makers);
    const ctx = { makerRe };

    const inWin = messages.filter((m) => m.ts >= win.start && m.ts <= win.end);
    const orders = [];
    const suspiciousOnly = [];
    const senderStats = {};
    for (const m of inWin) {
      const o = parseOrderMessage(m, ctx);
      if (!o) continue;
      if (!o.items.length && !o.noqty.length) {
        for (const r of o.rejected) suspiciousOnly.push({ customer: o.header, ...r, ts: o.ts, sender: o.sender });
        continue;
      }
      senderStats[o.sender] = (senderStats[o.sender] || 0) + 1;
      orders.push(o);
    }

    // 작성자 제외 / 중복 / 다른 날짜
    const seen = new Set();
    const used = [];
    const skipped = { dup: [], otherDay: [], sender: [] };
    for (const o of orders) {
      if (excludeSenders.includes(o.sender)) { skipped.sender.push(o); continue; }
      const sig = o.header.replace(/\s/g, '') + '|' + o.items.map((i) => `${i.name}:${i.maker}:${i.qty}${i.unit}`).sort().join(',');
      if (o.items.length && seen.has(sig)) {
        o.duplicate = true;
        skipped.dup.push(o);
        if (!includeDuplicates) continue;
      }
      seen.add(sig);
      if (o.dayRef && startOfDay(o.dayRef) > startOfDay(target)) {
        o.otherDay = true;
        skipped.otherDay.push(o);
        if (!includeOtherDays) continue;
      }
      used.push(o);
    }

    // 거래처별 묶기
    const byCust = new Map();
    const review = { suspicious: suspiciousOnly.slice(), noqty: [], unmatched: new Map() };
    for (const o of used) {
      const mt = matcher(o.header);
      const key = mt.official;
      if (!byCust.has(key)) byCust.set(key, { key, name: mt.official, raws: new Set(), address: mt.address, status: mt.status, flags: new Set(), memos: [], items: [], noqty: [] });
      const c = byCust.get(key);
      c.raws.add(o.header);
      if (mt.status === 'maybe' || mt.status === 'none') c.status = c.status === 'none' ? 'none' : mt.status;
      o.flags.forEach((f) => c.flags.add(f));
      for (const t of o.memos) if (!c.memos.includes(t)) c.memos.push(t);
      for (const it of o.items) {
        c.items.push({
          ...it, time: o.ts, sender: o.sender,
          added: o.flags.includes('추가'),
          urgent: o.flags.includes('급'),
          dayLabel: o.dayRef && !sameDay(o.dayRef, target) ? fmtDate(o.dayRef) : '',
        });
      }
      for (const n of o.noqty) { c.noqty.push(n); review.noqty.push({ customer: mt.official, ...n }); }
      for (const r of o.rejected) review.suspicious.push({ customer: mt.official, ...r, ts: o.ts, sender: o.sender });
      if (mt.status === 'none' || mt.status === 'maybe') review.unmatched.set(o.header, mt);
    }

    const customers = [...byCust.values()]
      .map((c) => ({ ...c, raws: [...c.raws], flags: [...c.flags] }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

    return {
      window: win, target, scanned: inWin.length, orderCount: used.length,
      customers, review: { ...review, unmatched: [...review.unmatched.values()] },
      skipped, senderStats,
    };
  }

  /* ───────── 7. 분류별 집계 ───────── */
  function productRank(name) {
    const base = name.replace(/^(냉동|냉장|수입)\s*/, '');
    let i = PRODUCT_ORDER.indexOf(base);
    if (i >= 0) return i;
    i = PRODUCT_ORDER.findIndex((p) => base.includes(p));
    return i >= 0 ? PRODUCT_ORDER.length + i : 999;
  }

  // cat: 'box' | 'piece' | 'maker'
  function aggregate(result, cat) {
    const map = new Map();
    for (const c of result.customers) {
      for (const it of c.items) {
        if (it.cat !== cat) continue;
        const key = cat === 'piece' ? `${it.name}|${it.unit}|${it.maker}` : cat === 'maker' ? `${it.name}|${it.maker}` : it.name;
        if (!map.has(key)) map.set(key, { key, name: it.name, maker: it.maker, unit: it.unit, total: 0, rows: [] });
        const p = map.get(key);
        p.total += it.qty;
        const ex = p.rows.find((r) => r.customer === c.name && r.note === it.note);
        if (ex) { ex.qty += it.qty; ex.added = ex.added || it.added; }
        else p.rows.push({ customer: c.name, qty: it.qty, note: it.note, added: it.added, urgent: it.urgent, dayLabel: it.dayLabel });
      }
    }
    return [...map.values()].sort((a, b) => productRank(a.name) - productRank(b.name) || a.name.localeCompare(b.name, 'ko') || a.maker.localeCompare(b.maker, 'ko'));
  }

  function itemsByCustomer(result, cat) {
    const out = [];
    for (const c of result.customers) {
      const its = c.items.filter((i) => cat === 'all' || i.cat === cat);
      if (!its.length && !(cat === 'all' && c.noqty.length)) continue;
      const merged = new Map();
      for (const it of its) {
        const k = `${it.cat}|${it.name}|${it.maker}|${it.unit}|${it.note}`;
        if (merged.has(k)) { const m = merged.get(k); m.qty += it.qty; m.added = m.added || it.added; }
        else merged.set(k, { ...it });
      }
      const list = [...merged.values()].sort((a, b) => productRank(a.name) - productRank(b.name) || a.name.localeCompare(b.name, 'ko'));
      out.push({ customer: c, items: list });
    }
    return out;
  }

  const fmtQty = (n) => (Number.isInteger(n) ? String(n) : String(n));

  return {
    DEFAULT_MAKERS, parseChat, defaultWindow, guessTargetDate, parseCustomers, buildMatcher,
    parseItemLine, parseOrderMessage, run, aggregate, itemsByCustomer, makerRegex,
    fmtDate, fmtTime, fmtQty, sameDay, startOfDay,
  };
});
