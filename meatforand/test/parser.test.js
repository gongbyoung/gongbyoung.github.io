// 실행: node test/parser.test.js   (가상의 데이터만 사용 — 실제 거래처/대화 데이터는 넣지 마세요)
const assert = require('assert');
const P = require('../parser.js');

const line = (s) => P.parseItemLine(s, { makerRe: P.makerRegex(P.DEFAULT_MAKERS), section: '', lastBase: '' });
const rows = (s) => { const r = line(s); assert.strictEqual(r.kind, 'item', `${s} → ${r.kind}`); return r.rows; };

// 박스 / 숫자만
assert.deepStrictEqual(rows('삼겹 5박스').map((r) => [r.cat, r.qty, r.unit]), [['box', 5, '박스']]);
assert.deepStrictEqual(rows('등심2').map((r) => [r.cat, r.qty, r.unit]), [['box', 2, '박스']]);
assert.strictEqual(rows('등뼈 3빡스')[0].cat, 'box');
// 낱개
assert.deepStrictEqual(rows('항정 3팩').map((r) => [r.cat, r.unit]), [['piece', '팩']]);
assert.deepStrictEqual(rows('항정 5키로').map((r) => [r.cat, r.unit]), [['piece', 'kg']]);
assert.deepStrictEqual(rows('냉동왕구이 2박스 2팩').map((r) => r.cat), ['box', 'piece']);
// 메이커
assert.deepStrictEqual(rows('삼겹3 포크').map((r) => [r.cat, r.maker]), [['maker', '포크']]);
assert.deepStrictEqual(rows('토레인 삼겹2박스').map((r) => [r.cat, r.maker, r.name]), [['maker', '토레인', '삼겹']]);
assert.deepStrictEqual(rows('삼겹 15박스(포크10 정담5)').map((r) => [r.maker, r.qty]), [['포크', 10], ['정담', 5]]);
assert.strictEqual(rows('항정 5키로 포크')[0].cat, 'piece'); // 낱개가 우선
// 규격/두께/할인은 수량이 아님
assert.strictEqual(rows('암삼 5  17~18키로 포크')[0].qty, 5);
assert.strictEqual(rows('냉장3mm후지 7박스 추가')[0].qty, 7);
assert.strictEqual(rows('등뼈 10박스 -100할인')[0].qty, 10);
assert.strictEqual(rows('항정 한박스')[0].qty, 1);
// 계근/단가 줄은 발주가 아님
assert.strictEqual(line('특삼 20포 19.9 20.2').kind, 'weight');
assert.strictEqual(line('테니쉬 1516 1456 1448').kind, 'weight');

// 기간
const w = P.defaultWindow(new Date(2026, 9, 26)); // 월요일
assert.strictEqual(P.fmtDate(w.start), '10/23(금)');
assert.strictEqual(w.start.getHours(), 12); assert.strictEqual(w.end.getHours(), 16);
const w2 = P.defaultWindow(new Date(2026, 9, 27)); // 화요일
assert.strictEqual(P.fmtDate(w2.start), '10/26(월)');

// 대화 파싱 + 전체 실행 (가상 데이터)
const chat = [
  '2026년 10월 23일 오후 6:30, 담당자 : 가나정육',
  '삼겹 2박스',
  '미삼 3 포크',
  '항정 1팩',
  '2026년 10월 24일 오후 1:00, 다른사람 : 한줄 잡담',
  '2026년 10월 26일 오전 9:00, 담당자 : 가나정육 ●추가',
  '삼겹 1',
  '2026년 10월 26일 오전 9:05, 계근 : 가나',
  '삼겹 22포 5.80',
].join('\n');
const msgs = P.parseChat(chat);
assert.strictEqual(msgs.length, 4);
const res = P.run({ messages: msgs, window: w, target: new Date(2026, 9, 26), matcher: P.buildMatcher([], {}) });
assert.strictEqual(res.customers.length, 1);
const agg = P.aggregate(res, 'box');
assert.strictEqual(agg[0].name, '삼겹'); assert.strictEqual(agg[0].total, 3);
assert.strictEqual(P.aggregate(res, 'maker')[0].maker, '포크');
assert.strictEqual(P.aggregate(res, 'piece')[0].total, 1);
console.log('모든 테스트 통과');
