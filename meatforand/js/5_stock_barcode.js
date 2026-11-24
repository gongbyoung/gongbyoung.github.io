/* =========================================================================
   5. [페이지 3] 일일 재고 현황 텍스트 파서 및 2열(한 페이지) 표 생성
   ========================================================================= */
function parseAndApplyStock(goTab, skipSave) {
    const raw = document.getElementById('stockTextarea').value;
    if (!raw.trim()) { alert('재고 텍스트를 입력해주세요.'); return; }

    const lines = raw.split(/\r?\n/);
    stockItems = [];
    let curItem = null;
    let stockTitle = "일일 재고 현황표";

    for (let rawLine of lines) {
        let line = rawLine.replace(/\u00A0/g, ' ').trim();
        if (!line) continue;

        if (line.includes('재고현황')) {
            stockTitle = line;
            continue;
        }

        const startsWithParen = line.startsWith('(');
        const startsWithNumber = /^\d/.test(line);
        const startsWithSubVendor = /^(IBP|엑셀|초이스|프라임)/i.test(line);

        if (!startsWithParen && !startsWithNumber && !startsWithSubVendor) {
            const parenIdx = line.indexOf('(');
            if (parenIdx > 0) {
                const itemName = line.substring(0, parenIdx).trim();
                curItem = getOrCreateStockItem(itemName);
                const rest = line.substring(parenIdx).trim();
                parseBrandAndQtyLine(curItem, rest);
            } else {
                const mDirect = line.match(/^([가-힣a-zA-Z\s]+?)\s+(\d+박.*)$/);
                if (mDirect) {
                    curItem = getOrCreateStockItem(mDirect[1].trim());
                    curItem.curBrand = '기타';
                    parseQtyTokens(curItem, '기타', mDirect[2]);
                } else {
                    curItem = getOrCreateStockItem(line);
                    curItem.curBrand = '기타';
                }
            }
        } else if (curItem) {
            parseBrandAndQtyLine(curItem, line);
        }
    }

    const stockTitleEl = document.getElementById('stockTitleInfo'); if (stockTitleEl) stockTitleEl.innerText = `📦 ${stockTitle}`;

    renderStockTable();
    if (!skipSave) {
        saveStateToBrowser('일일 재고현황 적용');
    }
    if (goTab) {
        switchTab('page5');
    }
}

function getOrCreateStockItem(name) {
    let norm = name.replace(/\s+/g, ' ').trim();
    let found = stockItems.find(x => x.name === norm);
    if (!found) {
        found = {
            name: norm,
            curBrand: '기타',
            brands: {
                '대산': { boxes: 0, details: [] },
                '포크': { boxes: 0, details: [] },
                '기타': { boxes: 0, details: [] }
            }
        };
        stockItems.push(found);
    }
    return found;
}

function parseBrandAndQtyLine(itemObj, lineStr) {
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

function parseQtyTokens(itemObj, brandName, qtyStr) {
    const targetKey = (brandName === '대산' || brandName === '포크') ? brandName : '기타';
    const boxMatch = qtyStr.match(/(\d+)\s*(?:박|박스|팩|판)/);
    const boxes = boxMatch ? parseInt(boxMatch[1], 10) : 0;
    itemObj.brands[targetKey].boxes += boxes;

    const prefix = (targetKey === '기타' && brandName !== '기타') ? `[${brandName}] ` : '';
    itemObj.brands[targetKey].details.push(prefix + qtyStr);
}

function renderStockTable() {
    const tbodyLeft = document.getElementById('stockTableBodyLeft');
    const tbodyRight = document.getElementById('stockTableBodyRight');
    if (!tbodyLeft || !tbodyRight) return;
    tbodyLeft.innerHTML = '';
    tbodyRight.innerHTML = '';

    const mid = Math.ceil(stockItems.length / 2);

    stockItems.forEach((item, idx) => {
        const d = item.brands['대산'];
        const p = item.brands['포크'];
        const o = item.brands['기타'];
        const total = d.boxes + p.boxes + o.boxes;

        const formatCell = (bObj) => {
            if (bObj.details.length === 0) return `<span class="num-zero">-</span>`;
            return `<b>${bObj.boxes}박</b> <small style="color:#555;">(${bObj.details.map(escapeHtml).join(', ')})</small>`;
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style="color:var(--primary);">${escapeHtml(item.name)}</b></td>
            <td>${formatCell(d)}</td>
            <td>${formatCell(p)}</td>
            <td>${formatCell(o)}</td>
            <td><b>총 ${total}박</b></td>
        `;
        if (idx < mid) tbodyLeft.appendChild(tr);
        else tbodyRight.appendChild(tr);
    });
}

/* =========================================================================
   6. 품목별 발주 집계 엔진 (4페이지 일일 발주 현황표 & 5페이지 차감 계산 공용)
   ========================================================================= */
const DEFAULT_STANDARD_ITEM_NAMES = [
    "삼겹", "특삼겹", "암삼겹", "빵삼겹",
    "미삼", "암미삼", "특미삼",
    "목살", "특목살", "B목살",
    "미전지", "전지", "지전지",
    "갈비", "등갈비",
    "등심", "안심",
    "사태", "앞미사태",
    "항정", "가브리", "갈매기",
    "미후지", "후지",
    "등뼈", "냉장잡육",
    "토레인 삼겹", "냉장 알목심f PR", "냉장 살치f PR", "냉장 늑간f CH NBP",
    "냉장 수입 올리멜 삼겹", "냉장 수입 올리멜 목살"
];

const DOMESTIC_FRESH_KEYS = new Set([
    "삼겹", "특삼겹", "암삼겹", "빵삼겹",
    "미삼", "암미삼", "특미삼",
    "목살", "특목살", "B목살",
    "미전지", "전지", "지전지",
    "갈비", "등갈비",
    "등심", "안심",
    "사태", "앞미사태",
    "항정", "가브리", "갈매기",
    "미후지", "후지",
    "등뼈", "냉장잡육"
]);

const FROZEN_OR_IMPORT_REGEX = /냉동|수입|테니쉬|데니쉬|두메코|올리멜|토레인|셀렉타|바텔|고원돈|티스|프레칸|프례칸|알레한|모돈|대패|스미스|엑셀|IBP|NBP|AMH|호주|미국|스페인|독일|칠레|브라질|캐나다|와규|카라라|킬코이|내셔널|네셔널|얼리이언스|토마스/i;

const ITEM_MATCH_RULES = [
    { key: "특미삼", regex: /특미삼/ },
    { key: "암미삼", regex: /암미삼/ },
    { key: "미삼", regex: /미삼|미박삼겹/ },
    { key: "특삼겹", regex: /특삼겹|특원삼|특삼/ },
    { key: "암삼겹", regex: /암삼겹|암원삼|암삼|암퇘지\s*삼겹|A삼겹|A삼(?![a-zA-Z])/ },
    { key: "빵삼겹", regex: /빵삼겹|빵삼/ },
    { key: "토레인 삼겹", regex: /토레인\s*삼겹|삼겹\s*\d*\s*토레인/ },
    { key: "냉장 수입 올리멜 삼겹", regex: /(?:수입\s*냉장|냉장\s*수입|올리멜)\s*삼겹/ },
    { key: "삼겹", regex: /삼겹|(?<!\S)냉삼/ },
    { key: "특목살", regex: /특목살|특목심|특목/ },
    { key: "B목살", regex: /B목살|비목살|B목(?![a-zA-Z])/i },
    { key: "냉장 수입 올리멜 목살", regex: /(?:수입\s*냉장|냉장\s*수입|올리멜)\s*목살/ },
    { key: "목살", regex: /목살|목심/ },
    { key: "미전지", regex: /미전지|미\s*앞다리/ },
    { key: "지전지", regex: /지전지|지방전지|스켄전지|스키너전지/ },
    { key: "전지", regex: /전지|일반전지|A전지/ },
    { key: "등갈비", regex: /등갈비/ },
    { key: "갈비", regex: /(?<!LA|엘에이|소|척)갈비(?!살)|돈갈비|돼지갈비|생갈비/ },
    { key: "등심", regex: /(?<!꽃)등심/ },
    { key: "안심", regex: /안심/ },
    { key: "앞미사태", regex: /앞미사태|미앞사태|앞사태|앞다리사태|미사태/ },
    { key: "사태", regex: /(?<!소|우|아롱)사태|속사태|생사태|뒷사태/ },
    { key: "항정", regex: /항정/ },
    { key: "가브리", regex: /가브리/ },
    { key: "갈매기", regex: /갈매기/ },
    { key: "미후지", regex: /미후지/ },
    { key: "후지", regex: /3(?:mm|미리)\s*(?:냉장\s*)?후지|냉장\s*3(?:mm|미리)\s*후지|생후지/ },
    { key: "등뼈", regex: /(?<!목)등뼈|돈등뼈|돼지등뼈|한돈등뼈/ },
    { key: "냉장잡육", regex: /(?<!한우\s)잡육/ },
    { key: "냉장 알목심f PR", regex: /(?:냉장\s*프라임|프라임\s*냉장|수입\s*냉장|프라임)\s*알목/ },
    { key: "냉장 살치f PR", regex: /살치/ },
    { key: "냉장 늑간f CH NBP", regex: /늑간/ }
];

function matchLineItemsClean(line) {
    const isFrozenOrImp = FROZEN_OR_IMPORT_REGEX.test(line);
    const matched = [];
    for (const rule of ITEM_MATCH_RULES) {
        if (rule.regex.test(line)) {
            if (isFrozenOrImp && DOMESTIC_FRESH_KEYS.has(rule.key)) {
                continue;
            }
            matched.push(rule);
        }
    }
    return matched;
}

function parseOrderLineQuantities(line) {
    if (/반품|취소|삭제|빼달|패스/.test(line)) return [];
    if (/안녕|부탁|감사|발주|주문|이상입니다|대표님|보내주|입고|배송|스펙|선입선출|기름|지방\s*어느정도|끝까지\s*잘라|우편함|냉장고/.test(line) && !/\d/.test(line)) {
        return [];
    }

    const matchedRules = matchLineItemsClean(line);
    if (matchedRules.length === 0) return [];

    let s = line;
    s = s.replace(/\(\s*합\s*\d+\s*박스[^\)]*\)/g, ' ');
    s = s.replace(/\([^\)]*(?:일자|판당|사이|정도|만|제외|지우고|포함|재고|행사|할인)[^\)]*\)/g, ' ');
    const parenBoxOverride = s.match(/\(\s*(\d+)\s*박스로?\s*(?:작업)?\s*\)/);
    s = s.replace(/\([^\)]*\)|\[[^\]]*\]/g, ' ');

    s = s.replace(/[+-]?\d{1,3}(?:,\d{3})+(?:원|행사|할인|납)?/g, ' ');
    s = s.replace(/\d+\.\d{3}(?:원)?/g, ' ');
    s = s.replace(/-\d+\s*(?:원|할인|행사)?/g, ' ');
    s = s.replace(/\d+(?:\.\d+)?\s*(?:mm|미리|센치|cm)/gi, ' ');
    s = s.replace(/\d{1,2}\.\d{1,2}일(?:자|자로|재고)?|\d{1,2}월\s*\d{1,2}일(?:자로)?|\d{1,2}\/\d{1,2}|\d{1,2}일(?:자|자로|진|재고|포크|암삼|대산)?/g, ' ');
    s = s.replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*(?:키로|kg)?(?:대|이상)?/gi, ' ');
    s = s.replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ');
    s = s.replace(/(미삼|삼겹|암삼|암미삼|특삼|특미삼)\s*1[5-9]\s*(?:키로|kg)\s+(\d+)/gi, '$1 $2');
    s = s.replace(/\d+호점|1\+\+/g, ' ');

    s = s.replace(/한박스/g, '1박스').replace(/한박/g, '1박').replace(/반박스/g, '0.5박스');
    s = s.replace(/한판/g, '1판').replace(/한덩이/g, '1덩이').replace(/한덩어리/g, '1덩어리');
    s = s.replace(/두마리분/g, '2마리분').replace(/한마리분/g, '1마리분').replace(/한마리반/g, '1마리분');

    const targetRules = (/각\s|각각/.test(s)) ? matchedRules : [matchedRules[0]];
    const results = [];

    for (const rule of targetRules) {
        if (parenBoxOverride) {
            const q = parseInt(parenBoxOverride[1], 10);
            results.push({ key: rule.key, boxes: q, packs: 0, label: `${q}박` });
            continue;
        }
        if (s.includes('0.5박스')) {
            results.push({ key: rule.key, boxes: 0.5, packs: 0, label: '반박' });
            continue;
        }
        const bm = s.match(/(\d+)\s*(?:박스|빡스|박|box|b)(?![a-zA-Z가-힣])/i);
        if (bm) {
            const q = parseInt(bm[1], 10);
            results.push({ key: rule.key, boxes: q, packs: 0, label: `${q}박` });
            continue;
        }
        const pm = s.match(/(\d+(?:\.\d+)?)\s*(팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개)(?![a-zA-Z가-힣])/i);
        if (pm) {
            const pq = parseFloat(pm[1]) || 1;
            results.push({ key: rule.key, boxes: 0, packs: pq, label: `${pq}${pm[2]}` });
            continue;
        }
        const km = s.match(/(\d+(?:\.\d+)?)\s*(?:키로|kg|킬|k)(?![a-zA-Z가-힣])/i);
        if (km) {
            results.push({ key: rule.key, boxes: 0, packs: 1, label: km[0].trim() });
            continue;
        }
        const bare = s.match(/(?:^|[^\d.])(\d{1,2})(?:$|[\s.포대정])/);
        if (bare) {
            const q = parseInt(bare[1], 10);
            results.push({ key: rule.key, boxes: q, packs: 0, label: `${q}박` });
        }
    }
    return results;
}

function computeOrderAggregation() {
    const orders = getFilteredOrderList(true);
    const summaryMap = {};

    const itemList = stockItems.length > 0
        ? stockItems
        : DEFAULT_STANDARD_ITEM_NAMES.map(nm => ({
            name: nm,
            brands: { '대산': { boxes: 0 }, '포크': { boxes: 0 }, '기타': { boxes: 0 } }
        }));

    itemList.forEach(s => {
        summaryMap[s.name] = {
            '대산': { stock: s.brands['대산'].boxes, orderBox: 0, orderPack: 0, clients: [] },
            '포크': { stock: s.brands['포크'].boxes, orderBox: 0, orderPack: 0, clients: [] },
            '기타': { stock: s.brands['기타'].boxes, orderBox: 0, orderPack: 0, clients: [] }
        };
    });

    const seenSignatures = new Set();

    orders.forEach(ord => {
        const txt = ord.displayContent || ord.content;

        if (/취소|삭제|빼달|패스/.test(txt) && !/반품/.test(txt)) {
            txt.split('\n').forEach(line => {
                if (/취소|삭제|빼달|패스/.test(line)) {
                    const rules = matchLineItemsClean(line);
                    if (rules.length > 0 && summaryMap[rules[0].key]) {
                        const targetItem = summaryMap[rules[0].key];
                        const bm = line.match(/(\d+)\s*(?:박스|박)?/);
                        const q = bm ? parseInt(bm[1], 10) : 1;
                        let br = '기타';
                        if (/대산/.test(line)) br = '대산';
                        else if (/포크|농협/.test(line)) br = '포크';
                        else if (targetItem['포크'].orderBox >= q) br = '포크';
                        else if (targetItem['대산'].orderBox >= q) br = '대산';
                        targetItem[br].orderBox = Math.max(0, targetItem[br].orderBox - q);
                        targetItem[br].clients.push(`${ord.clientName}(-${q}취소)`);
                    }
                }
            });
            return;
        }

        const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
        let msgDefaultBrand = '미지정';
        if (/대산꺼로|대산으로/.test(txt)) msgDefaultBrand = '대산';
        else if (/포크로|농협/.test(txt)) msgDefaultBrand = '포크';

        const lineResults = [];
        lines.forEach(line => {
            const parsed = parseOrderLineQuantities(line);
            parsed.forEach(p => lineResults.push({ line, ...p }));
        });
        if (lineResults.length > 0) {
            const sig = `${ord.officialName}|${lineResults.map(r => `${r.key}:${r.boxes}:${r.packs}`).join(',')}`;
            if (seenSignatures.has(sig)) return;
            seenSignatures.add(sig);
        }

        lineResults.forEach(res => {
            const targetItem = summaryMap[res.key];
            if (!targetItem) return;

            let br = '기타';
            if (/대산/.test(res.line)) br = '대산';
            else if (/포크|농협/.test(res.line)) br = '포크';
            else if (/정담|황금|토레인|올리멜|엑셀|IBP|NBP/i.test(res.line)) br = '기타';
            else if (msgDefaultBrand !== '미지정') br = msgDefaultBrand;
            else {
                if (targetItem['포크'].stock >= targetItem['대산'].stock && targetItem['포크'].stock > 0) br = '포크';
                else if (targetItem['대산'].stock > 0) br = '대산';
                else br = '기타';
            }

            if (res.boxes > 0) {
                targetItem[br].orderBox += res.boxes;
                targetItem[br].clients.push(`${ord.clientName}(${res.label})`);
            } else if (res.packs > 0) {
                targetItem[br].orderPack += res.packs;
                targetItem[br].clients.push(`${ord.clientName}(${res.label})`);
            }
        });
    });

    return summaryMap;
}

/* =========================================================================
   7. [페이지 4] 일일 발주 현황표 렌더링 (재고목록과 동일하게 2열 한페이지 보기)
   ========================================================================= */
function renderOrderSummaryTable() {
    const tbodyLeft = document.getElementById('orderSummaryTableBodyLeft');
    const tbodyRight = document.getElementById('orderSummaryTableBodyRight');
    if (!tbodyLeft || !tbodyRight) return;
    tbodyLeft.innerHTML = '';
    tbodyRight.innerHTML = '';

    const tDate = document.getElementById('orderTargetDate').value || '전체';
    document.getElementById('orderSummaryDateInfo').innerText = `[납품 기준일: ${tDate}]`;

    const summaryMap = computeOrderAggregation();
    const keys = Object.keys(summaryMap);
    const mid = Math.ceil(keys.length / 2);

    keys.forEach((itemName, idx) => {
        const g = summaryMap[itemName];
        const d = g['대산'], p = g['포크'], o = g['기타'];
        const totBox = d.orderBox + p.orderBox + o.orderBox;
        const totPack = d.orderPack + p.orderPack + o.orderPack;

        const formatOrderCell = (bObj) => {
            if (bObj.orderBox === 0 && bObj.orderPack === 0) return `<span class="num-zero">0박</span>`;
            let head = `<b style="color:var(--accent);">${bObj.orderBox}박</b>`;
            if (bObj.orderPack > 0) head += ` <b style="color:var(--warn);">+${bObj.orderPack}팩</b>`;
            return `${head}<br><small style="color:#4b5563;">${bObj.clients.map(escapeHtml).join(', ')}</small>`;
        };

        let totStr = `<b>총 ${totBox}박</b>`;
        if (totPack > 0) totStr += `<br><small style="color:var(--warn); font-weight:bold;">+${totPack}팩</small>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style="color:var(--primary);">${escapeHtml(itemName)}</b></td>
            <td>${formatOrderCell(d)}</td>
            <td>${formatOrderCell(p)}</td>
            <td>${formatOrderCell(o)}</td>
            <td>${totStr}</td>
        `;
        if (idx < mid) tbodyLeft.appendChild(tr);
        else tbodyRight.appendChild(tr);
    });
}

function copyKakaoOrderCheckText() {
    const summaryMap = computeOrderAggregation();
    let lines = ["발주체크"];
    Object.keys(summaryMap).forEach(itemName => {
        const g = summaryMap[itemName];
        const totBox = g['대산'].orderBox + g['포크'].orderBox + g['기타'].orderBox;
        const totPack = g['대산'].orderPack + g['포크'].orderPack + g['기타'].orderPack;
        const bStr = totBox > 0 ? `${totBox}박스` : `박스`;
        const pStr = totPack > 0 ? `${totPack}팩` : `팩`;
        lines.push(`${itemName} ${bStr} ${pStr}`);
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        alert("카톡용 '발주체크' 요약 텍스트가 클립보드에 복사되었습니다!");
    });
}

function downloadOrderSummaryCsv() {
    const summaryMap = computeOrderAggregation();
    let csv = "\uFEFF품목명,대산(발주박스),대산(상세),포크(발주박스),포크(상세),기타(발주박스),기타(상세),총발주(박스),총발주(팩/소분)\n";
    Object.keys(summaryMap).forEach(itemName => {
        const g = summaryMap[itemName];
        const d = g['대산'], p = g['포크'], o = g['기타'];
        const totBox = d.orderBox + p.orderBox + o.orderBox;
        const totPack = d.orderPack + p.orderPack + o.orderPack;
        csv += `"${itemName}",${d.orderBox},"${d.clients.join(' / ')}",${p.orderBox},"${p.clients.join(' / ')}",${o.orderBox},"${o.clients.join(' / ')}",${totBox},${totPack}\n`;
    });
    downloadBlob(csv, "미트포앤_일일발주현황표.csv");
}



/* =========================================================================
   8. [페이지 5] 발주차감 잔여재고 렌더링
   ========================================================================= */
function renderDiffTable() {
    const tbody = document.getElementById('diffTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const summaryMap = computeOrderAggregation();

    Object.keys(summaryMap).forEach(itemName => {
        const bGroup = summaryMap[itemName];
        ['대산', '포크', '기타'].forEach(br => {
            const data = bGroup[br];
            if (data.stock === 0 && data.orderBox === 0 && data.orderPack === 0) return;

            const remain = data.stock - data.orderBox;
            const remainClass = remain < 0 ? 'num-neg' : (remain > 0 ? 'num-pos' : 'num-zero');
            const remainText = remain < 0 ? `${remain}박 (부족!)` : `${remain}박`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${escapeHtml(itemName)}</b></td>
                <td>${escapeHtml(br)}</td>
                <td><b>${data.stock}박</b></td>
                <td><b>${data.orderBox}박</b></td>
                <td>${data.orderPack > 0 ? data.orderPack + '팩(건)' : '-'}</td>
                <td class="${remainClass}">${remainText}</td>
                <td style="font-size:11px; color:#4b5563;">${data.clients.map(escapeHtml).join(', ') || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function downloadDiffCsv() {
    const summaryMap = computeOrderAggregation();
    let csv = "\uFEFF품목명,브랜드,현재재고(박스),금일발주(박스),소분/팩발주,차감후잔여재고(박스),발주거래처내역\n";
    Object.keys(summaryMap).forEach(itemName => {
        const bGroup = summaryMap[itemName];
        ['대산', '포크', '기타'].forEach(br => {
            const d = bGroup[br];
            if (d.stock === 0 && d.orderBox === 0 && d.orderPack === 0) return;
            const rem = d.stock - d.orderBox;
            csv += `"${itemName}","${br}",${d.stock},${d.orderBox},${d.orderPack},${rem},"${d.clients.join(', ')}"\n`;
        });
    });
    downloadBlob(csv, "미트포앤_발주차감_잔여재고표.csv");
}


/* =========================================================================
   13. [4페이지] 재고정리·창고 3단 랙(L/C/R) & 바코드 인식·라벨 출력 시스템
   ========================================================================= */
const WAREHOUSE_ZONES = [
    { code: 'L', title: '좌측 랙 (Zone L)', cols: ['A', 'B', 'C'] },
    { code: 'C', title: '중앙 스탠드 랙 (Zone C)', cols: ['A', 'B', 'C'] },
    { code: 'R', title: '우측 선반 랙 (Zone R)', cols: ['A', 'B', 'C'] }
];
const TIER_LABELS = { 1: '1단(상)', 2: '2단(중)', 3: '3단(하)' };

let warehouseRackMap = {};
try { warehouseRackMap = JSON.parse(localStorage.getItem('mf_warehouse_racks') || '{}'); } catch (e) {}

let physicalStockMap = {};
try { physicalStockMap = JSON.parse(localStorage.getItem('mf_physical_stock') || '{}'); } catch (e) {}

let stockLotRackMap = {};
try { stockLotRackMap = JSON.parse(localStorage.getItem('mf_stock_lot_racks') || '{}'); } catch (e) {}

let stockOrgCheckedMap = {};
try { stockOrgCheckedMap = JSON.parse(localStorage.getItem('mf_stock_org_checked') || '{}'); } catch (e) {}

const DEFAULT_BARCODE_DB = [
    { code: "8801001001015", itemName: "삼겹",   brand: "포크", rack: "L-A1", memo: "농협포크 삼겹 완박스" },
    { code: "8801001001022", itemName: "삼겹",   brand: "대산", rack: "L-A2", memo: "대산 삼겹 완박스" },
    { code: "8801001001039", itemName: "암삼겹", brand: "포크", rack: "L-B1", memo: "포크 암삼겹 완박스" },
    { code: "8801001001046", itemName: "암삼겹", brand: "대산", rack: "L-B2", memo: "대산 암삼겹 완박스" },
    { code: "8801001001053", itemName: "목살",   brand: "포크", rack: "L-C1", memo: "포크 목살 완박스" },
    { code: "8801001001060", itemName: "목살",   brand: "대산", rack: "L-C2", memo: "대산 목살 완박스" },
    { code: "8801001001077", itemName: "미전지", brand: "대산", rack: "C-A1", memo: "대산 미전지 완박스" },
    { code: "8801001001084", itemName: "미전지", brand: "포크", rack: "C-A2", memo: "포크 미전지 완박스" },
    { code: "8801001001091", itemName: "미삼",   brand: "포크", rack: "C-B1", memo: "포크 미삼겹 완박스" },
    { code: "8801001001107", itemName: "등갈비", brand: "포크", rack: "R-A1", memo: "포크 등갈비 완박스" },
    { code: "8801001001114", itemName: "등뼈",   brand: "포크", rack: "R-B1", memo: "포크 등뼈 완박스" },
    { code: "8801001001121", itemName: "항정",   brand: "포크", rack: "R-C1", memo: "포크 항정살" }
];

let barcodeDB = [];
try {
    const savedBc = JSON.parse(localStorage.getItem('mf_barcode_db') || 'null');
    barcodeDB = (Array.isArray(savedBc) && savedBc.length > 0) ? savedBc : DEFAULT_BARCODE_DB.map(x => ({ ...x }));
} catch (e) {
    barcodeDB = DEFAULT_BARCODE_DB.map(x => ({ ...x }));
}

let barcodeScanHistory = [];
try { barcodeScanHistory = JSON.parse(localStorage.getItem('mf_barcode_history') || '[]'); } catch (e) {}

function getAllRackCodesList() {
    const list = [];
    WAREHOUSE_ZONES.forEach(z => {
        z.cols.forEach(col => {
            [1, 2, 3].forEach(tier => {
                list.push(`${z.code}-${col}${tier}`);
            });
        });
    });
    return list;
}

function initWarehouseAndBarcodeData() {
    const rackSel = document.getElementById('newBcRack');
    if (rackSel) {
        rackSel.innerHTML = `<option value="">-- 창고 랙 위치 --</option>`;
        getAllRackCodesList().forEach(rc => {
            const opt = document.createElement('option');
            opt.value = rc;
            opt.textContent = rc;
            rackSel.appendChild(opt);
        });
    }
    renderWarehouseRackMap();
    renderBarcodeMasterTable();
    renderBarcodeScanHistory();
}

function renderStockOrganizationPage() {
    renderWarehouseRackMap();
    renderStockOrgTable();
    renderBarcodeMasterTable();
}

/* 창고 3구역(L/C/R) 3단 랙 배치도 렌더링 */
function renderWarehouseRackMap() {
    const grid = document.getElementById('warehouseThreeZoneGrid');
    if (!grid) return;
    grid.innerHTML = '';

    WAREHOUSE_ZONES.forEach(zone => {
        const colCard = document.createElement('div');
        colCard.className = 'zone-column-card';

        let slotsHtml = '';
        zone.cols.forEach(col => {
            [1, 2, 3].forEach(tier => {
                const rackCode = `${zone.code}-${col}${tier}`;
                const slot = warehouseRackMap[rackCode] || null;
                const isOccupied = slot && slot.itemName;
                const isOldLot = isOccupied && slot.lotDate && parseInt(slot.lotDate, 10) <= 6;
                const cardCls = `rack-slot-card ${isOccupied ? 'occupied' : ''} ${isOldLot ? 'fifo-warn' : ''}`;

                let infoHtml = `<span style="color:#9ca3af; font-size:11px;">비어있음 (${TIER_LABELS[tier]})</span>`;
                if (isOccupied) {
                    const fifoBadge = isOldLot ? `<span class="badge" style="background:#dc2626; font-size:9px; margin-left:3px;">선입선출</span>` : '';
                    infoHtml = `
                        <div>
                            <b style="color:#111827; font-size:12px;">${escapeHtml(slot.itemName)}</b>
                            <span class="badge" style="background:#047857; font-size:9.5px;">${escapeHtml(slot.brand || '기타')}</span>
                            <b style="color:#1f4e79; font-size:12px; margin-left:3px;">${slot.boxes || 0}박</b>
                            ${slot.lotDate ? `<small style="color:#4b5563;">(${escapeHtml(slot.lotDate)}일)</small>` : ''}${fifoBadge}
                        </div>
                    `;
                }

                slotsHtml += `
                    <div class="${cardCls}">
                        <div style="display:flex; align-items:center; min-width:0; flex:1;">
                            <span class="rack-code-badge">${rackCode}</span>
                            ${infoHtml}
                        </div>
                        <div style="display:flex; gap:3px; flex-shrink:0;">
                            ${isOccupied ? `<button type="button" class="btn red sm" style="padding:1px 5px;" onclick="adjustRackBoxCount('${rackCode}', -1)">-1</button>
                            <button type="button" class="btn green sm" style="padding:1px 5px;" onclick="adjustRackBoxCount('${rackCode}', 1)">+1</button>` : ''}
                            <button type="button" class="btn gray sm" style="padding:1px 6px;" onclick="promptEditRackSlot('${rackCode}')">✏️</button>
                        </div>
                    </div>
                `;
            });
        });

        colCard.innerHTML = `
            <div class="zone-column-head">
                <span>${escapeHtml(zone.title)}</span>
                <span style="font-size:10.5px; color:#cbd5e1;">1단(상)·2단(중)·3단(하)</span>
            </div>
            <div class="rack-tier-list">${slotsHtml}</div>
        `;
        grid.appendChild(colCard);
    });
}

function adjustRackBoxCount(rackCode, delta) {
    const slot = warehouseRackMap[rackCode];
    if (!slot) return;
    slot.boxes = Math.max(0, (parseInt(slot.boxes, 10) || 0) + delta);
    if (slot.boxes === 0) {
        delete warehouseRackMap[rackCode];
    }
    localStorage.setItem('mf_warehouse_racks', JSON.stringify(warehouseRackMap));
    recordLastUpdatedTime(`랙 ${rackCode} 수량조정(${delta > 0 ? '+1' : '-1'})`);
    renderWarehouseRackMap();
}

function promptEditRackSlot(rackCode) {
    const cur = warehouseRackMap[rackCode] || { itemName: '', brand: '포크', boxes: 0, lotDate: '' };
    const newItem = prompt(`[${rackCode}] 보관할 품목명을 입력하세요 (비우면 랙 비우기):`, cur.itemName);
    if (newItem === null) return;
    if (!newItem.trim()) {
        delete warehouseRackMap[rackCode];
        localStorage.setItem('mf_warehouse_racks', JSON.stringify(warehouseRackMap));
        renderWarehouseRackMap();
        return;
    }
    const newBrand = prompt(`[${rackCode} - ${newItem.trim()}] 브랜드를 입력하세요 (대산 / 포크 / 정담 / 황금 / 기타):`, cur.brand || '포크') || '기타';
    const newBoxesStr = prompt(`[${rackCode} - ${newItem.trim()}] 현재 박스 수량을 입력하세요:`, String(cur.boxes || 1));
    const newLot = prompt(`[${rackCode} - ${newItem.trim()}] 작업일/날짜 숫자만 입력 (예: 6 또는 10, 생략 가능):`, cur.lotDate || '') || '';

    warehouseRackMap[rackCode] = {
        itemName: newItem.trim(),
        brand: newBrand.trim(),
        boxes: Math.max(0, parseInt(newBoxesStr, 10) || 0),
        lotDate: newLot.trim()
    };
    localStorage.setItem('mf_warehouse_racks', JSON.stringify(warehouseRackMap));
    recordLastUpdatedTime(`랙 ${rackCode} 배치 수정`);
    renderWarehouseRackMap();
}

function autoPopulateRacksFromStock() {
    const lots = extractStockLotsForOrganization();
    const rackCodes = getAllRackCodesList();
    let rIdx = 0;

    // First match registered barcode default racks
    lots.forEach(lot => {
        if (lot.sysBoxes <= 0) return;
        const bcMatch = barcodeDB.find(b => b.itemName === lot.itemName && b.brand === lot.brand && b.rack);
        if (bcMatch && !warehouseRackMap[bcMatch.rack]) {
            warehouseRackMap[bcMatch.rack] = {
                itemName: lot.itemName,
                brand: lot.brand,
                boxes: lot.sysBoxes,
                lotDate: lot.lotDate
            };
            stockLotRackMap[lot.lotKey] = bcMatch.rack;
        }
    });

    // Assign remaining active lots into empty rack slots
    lots.forEach(lot => {
        if (lot.sysBoxes <= 0) return;
        if (stockLotRackMap[lot.lotKey] && warehouseRackMap[stockLotRackMap[lot.lotKey]]) return;
        while (rIdx < rackCodes.length && warehouseRackMap[rackCodes[rIdx]]) {
            rIdx++;
        }
        if (rIdx < rackCodes.length) {
            const rc = rackCodes[rIdx];
            warehouseRackMap[rc] = {
                itemName: lot.itemName,
                brand: lot.brand,
                boxes: lot.sysBoxes,
                lotDate: lot.lotDate
            };
            stockLotRackMap[lot.lotKey] = rc;
            rIdx++;
        }
    });

    localStorage.setItem('mf_warehouse_racks', JSON.stringify(warehouseRackMap));
    localStorage.setItem('mf_stock_lot_racks', JSON.stringify(stockLotRackMap));
    recordLastUpdatedTime('전산재고 → 창고랙 자동배치');
    renderStockOrganizationPage();
    alert('✅ 현재 보유 재고 품목들이 창고 3단 랙(Zone L·C·R)에 자동 배치되었습니다!');
}

function clearAllRackSlots() {
    if (!confirm('창고 3단 랙(Zone L·C·R)의 현재 배치 내역을 모두 비울까요?')) return;
    warehouseRackMap = {};
    localStorage.removeItem('mf_warehouse_racks');
    renderWarehouseRackMap();
}

/* 일자별·브랜드별 선입선출(FIFO) 실사 재고정리표 추출 및 렌더링 */
function extractStockLotsForOrganization() {
    const lots = [];
    stockItems.forEach((item, sIdx) => {
        ['대산', '포크', '기타'].forEach(br => {
            const bObj = item.brands[br];
            if (!bObj || bObj.details.length === 0) return;
            bObj.details.forEach((det, dIdx) => {
                const boxM = det.match(/(\d+)\s*(?:박|박스|팩|판)/);
                const boxes = boxM ? parseInt(boxM[1], 10) : 0;
                // Extract trailing date number like "4박 5" -> 5, "26박 6" -> 6, "25박 10" -> 10
                const dateM = det.match(/(?:박|박스|낱)\s*(\d{1,2})(?!\d)/);
                const lotDate = dateM ? dateM[1] : '';
                const lotKey = `${item.name}_${br}_${dIdx}_${det.replace(/\s+/g, '')}`;
                lots.push({
                    lotKey,
                    itemName: item.name,
                    brand: br,
                    detailText: det,
                    sysBoxes: boxes,
                    lotDate,
                    isFifoPriority: lotDate !== '' && parseInt(lotDate, 10) <= 6
                });
            });
        });
    });
    return lots;
}

function renderStockOrgTable() {
    const tbody = document.getElementById('stockOrgTableBody');
    const statsEl = document.getElementById('stockOrgSummaryStats');
    if (!tbody) return;
    tbody.innerHTML = '';

    const lots = extractStockLotsForOrganization();
    const rackCodes = getAllRackCodesList();
    let totalSys = 0;
    let totalPhys = 0;
    let checkedCnt = 0;

    lots.forEach(lot => {
        const physVal = (physicalStockMap[lot.lotKey] !== undefined) ? physicalStockMap[lot.lotKey] : lot.sysBoxes;
        const diff = physVal - lot.sysBoxes;
        const isChecked = Boolean(stockOrgCheckedMap[lot.lotKey]);
        const curRack = stockLotRackMap[lot.lotKey] || '';

        totalSys += lot.sysBoxes;
        totalPhys += physVal;
        if (isChecked) checkedCnt++;

        let rackOpts = `<option value="">-- 랙선택 --</option>`;
        rackCodes.forEach(rc => {
            rackOpts += `<option value="${rc}" ${curRack === rc ? 'selected' : ''}>${rc}</option>`;
        });

        const fifoHtml = lot.isFifoPriority
            ? `<span class="badge" style="background:#dc2626; font-size:9.5px; margin-left:4px;">⚠️ 선입선출 우선</span>`
            : '';

        const diffHtml = diff === 0
            ? `<span class="num-zero">일치 (0)</span>`
            : (diff > 0 ? `<span class="num-pos">+${diff}박 초과</span>` : `<span class="num-neg">${diff}박 부족</span>`);

        const tr = document.createElement('tr');
        if (isChecked) tr.style.background = '#ecfdf5';
        tr.innerHTML = `
            <td style="text-align:center;">
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleStockOrgLotCheck('${escapeHtml(lot.lotKey)}')">
            </td>
            <td><b style="color:var(--primary);">${escapeHtml(lot.itemName)}</b></td>
            <td>${escapeHtml(lot.brand)}</td>
            <td><b>${escapeHtml(lot.detailText)}</b>${fifoHtml}</td>
            <td>
                <select style="padding:3px 5px; font-size:11px; font-weight:bold; border-radius:4px;" onchange="assignLotToRack('${escapeHtml(lot.lotKey)}', '${escapeHtml(lot.itemName)}', '${escapeHtml(lot.brand)}', ${physVal}, '${escapeHtml(lot.lotDate)}', this.value)">
                    ${rackOpts}
                </select>
            </td>
            <td><b>${lot.sysBoxes}박</b></td>
            <td>
                <div style="display:inline-flex; align-items:center; gap:3px;">
                    <button type="button" class="btn gray sm" style="padding:2px 6px;" onclick="stepPhysicalStock('${escapeHtml(lot.lotKey)}', ${lot.sysBoxes}, -1)">-</button>
                    <input type="number" value="${physVal}" style="width:54px; text-align:center; padding:3px; font-weight:bold;" onchange="setPhysicalStockDirect('${escapeHtml(lot.lotKey)}', this.value)">
                    <button type="button" class="btn green sm" style="padding:2px 6px;" onclick="stepPhysicalStock('${escapeHtml(lot.lotKey)}', ${lot.sysBoxes}, 1)">+</button>
                </div>
            </td>
            <td>${diffHtml}</td>
        `;
        tbody.appendChild(tr);
    });

    if (statsEl) {
        statsEl.innerText = `(전산합계 ${totalSys}박 vs 실사합계 ${totalPhys}박 · 점검완료 ${checkedCnt}/${lots.length}건)`;
    }
}

function toggleStockOrgLotCheck(lotKey) {
    stockOrgCheckedMap[lotKey] = !stockOrgCheckedMap[lotKey];
    if (!stockOrgCheckedMap[lotKey]) delete stockOrgCheckedMap[lotKey];
    localStorage.setItem('mf_stock_org_checked', JSON.stringify(stockOrgCheckedMap));
    renderStockOrgTable();
}

function stepPhysicalStock(lotKey, defaultSys, delta) {
    const cur = (physicalStockMap[lotKey] !== undefined) ? physicalStockMap[lotKey] : defaultSys;
    physicalStockMap[lotKey] = Math.max(0, cur + delta);
    localStorage.setItem('mf_physical_stock', JSON.stringify(physicalStockMap));
    renderStockOrgTable();
}

function setPhysicalStockDirect(lotKey, val) {
    physicalStockMap[lotKey] = Math.max(0, parseInt(val, 10) || 0);
    localStorage.setItem('mf_physical_stock', JSON.stringify(physicalStockMap));
    renderStockOrgTable();
}

function assignLotToRack(lotKey, itemName, brand, boxes, lotDate, rackCode) {
    stockLotRackMap[lotKey] = rackCode;
    localStorage.setItem('mf_stock_lot_racks', JSON.stringify(stockLotRackMap));
    if (rackCode) {
        warehouseRackMap[rackCode] = { itemName, brand, boxes, lotDate };
        localStorage.setItem('mf_warehouse_racks', JSON.stringify(warehouseRackMap));
    }
    recordLastUpdatedTime(`재고 로트 → 랙(${rackCode || '해제'}) 지정`);
    renderWarehouseRackMap();
}

function applyPhysicalStockToMain() {
    const lots = extractStockLotsForOrganization();
    if (lots.length === 0) return;

    // Rebuild stockItems brand box counts using physicalStockMap
    stockItems.forEach(item => {
        ['대산', '포크', '기타'].forEach(br => {
            const bObj = item.brands[br];
            if (!bObj) return;
            let newBrandBoxes = 0;
            bObj.details = bObj.details.map((det, dIdx) => {
                const lotKey = `${item.name}_${br}_${dIdx}_${det.replace(/\s+/g, '')}`;
                const boxM = det.match(/(\d+)\s*(?:박|박스|팩|판)/);
                const oldBoxes = boxM ? parseInt(boxM[1], 10) : 0;
                const physBoxes = (physicalStockMap[lotKey] !== undefined) ? physicalStockMap[lotKey] : oldBoxes;
                newBrandBoxes += physBoxes;
                if (boxM) {
                    return det.replace(/(\d+)(\s*(?:박|박스|팩|판))/, `${physBoxes}$2`);
                }
                return det;
            });
            bObj.boxes = newBrandBoxes;
        });
    });

    renderStockOrgTable();
    renderDiffTable();
    recordLastUpdatedTime('실사재고 → 전산재고 반영');
    alert('✅ 창고 실사 수량이 전산 재고 및 [5. 발주차감 잔여재고] 표에 반영되었습니다!');
}

function copyKakaoStockOrgReport() {
    const lots = extractStockLotsForOrganization();
    const lines = [`[창고 실사·재고정리 보고 ${getNowTimeFormatted()}]`];
    lots.forEach(lot => {
        const phys = (physicalStockMap[lot.lotKey] !== undefined) ? physicalStockMap[lot.lotKey] : lot.sysBoxes;
        const diff = phys - lot.sysBoxes;
        const rack = stockLotRackMap[lot.lotKey] ? `[${stockLotRackMap[lot.lotKey]}] ` : '';
        if (diff !== 0 || stockLotRackMap[lot.lotKey]) {
            const diffStr = diff === 0 ? '정상' : (diff > 0 ? `+${diff}박 초과` : `${diff}박 부족`);
            lines.push(`• ${rack}${lot.itemName}(${lot.brand}) ${lot.detailText} → 실사 ${phys}박 (${diffStr})`);
        }
    });
    if (lines.length === 1) {
        lines.push('• 특이 과부족 없음 (전산 재고 일치)');
    }
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        alert('카톡 보고용 재고정리 내역이 클립보드에 복사되었습니다!');
    });
}

function downloadStockOrgCsv() {
    const lots = extractStockLotsForOrganization();
    let csv = "\uFEFF품목명,브랜드,작업일/상세,창고랙위치,전산재고(박스),실사재고(박스),차이,확인여부\n";
    lots.forEach(lot => {
        const phys = (physicalStockMap[lot.lotKey] !== undefined) ? physicalStockMap[lot.lotKey] : lot.sysBoxes;
        const diff = phys - lot.sysBoxes;
        const rack = stockLotRackMap[lot.lotKey] || '';
        const chk = stockOrgCheckedMap[lot.lotKey] ? '완료' : '대기';
        csv += `"${lot.itemName}","${lot.brand}","${lot.detailText}","${rack}",${lot.sysBoxes},${phys},${diff},"${chk}"\n`;
    });
    downloadBlob(csv, "미트포앤_창고재고정리표.csv");
}

/* =========================================================================
   바코드 등록 · USB 스캐너 · 카메라 스캔 · Code128 라벨 인쇄 엔진
   ========================================================================= */
function saveBarcodeDB() {
    try {
        localStorage.setItem('mf_barcode_db', JSON.stringify(barcodeDB));
    } catch (e) {}
}

function playBeepSound(isSuccess) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = isSuccess ? 880 : 320;
        gain.gain.value = 0.12;
        osc.start();
        setTimeout(() => {
            osc.stop();
            ctx.close();
        }, isSuccess ? 110 : 240);
    } catch (e) {}
}

function lookupBarcodeRecord(rawInput) {
    const code = String(rawInput || '').trim().replace(/\s+/g, '');
    if (!code) return null;

    // 1. Exact match
    const exact = barcodeDB.find(b => b.code === code);
    if (exact) {
        return { matched: true, matchType: '정확일치', code, record: exact, extractedWeight: null };
    }

    // 2. Prefix match (e.g., GS1-128 / weighing barcode where first 6~10 digits identify item and trailing 4 digits = weight)
    const sortedByLen = [...barcodeDB].sort((a, b) => b.code.length - a.code.length);
    for (const rec of sortedByLen) {
        if (rec.code.length >= 5 && code.startsWith(rec.code)) {
            const tail = code.slice(rec.code.length);
            let weightKg = null;
            if (/^\d{4}$/.test(tail)) {
                weightKg = (parseInt(tail, 10) / 100).toFixed(2);
            }
            return { matched: true, matchType: '접두사(중량바코드)일치', code, record: rec, extractedWeight: weightKg };
        }
    }

    return { matched: false, code, record: null, extractedWeight: null };
}

function handleBarcodeScanSubmit(rawCode, targetResultBoxId) {
    const code = String(rawCode || '').trim();
    if (!code) return;

    const resultBox = document.getElementById(targetResultBoxId);
    const res = lookupBarcodeRecord(code);

    if (res && res.matched) {
        playBeepSound(true);
        const rec = res.record;
        const stockMatch = stockItems.find(s => s.name === rec.itemName);
        const curStockBoxes = stockMatch && stockMatch.brands[rec.brand] ? stockMatch.brands[rec.brand].boxes : 0;
        const aggMap = computeOrderAggregation();
        const curOrderBoxes = (aggMap[rec.itemName] && aggMap[rec.itemName][rec.brand])
            ? aggMap[rec.itemName][rec.brand].orderBox
            : 0;

        const weightTag = res.extractedWeight ? ` · ⚖️ 계근중량: <b>${res.extractedWeight}kg</b>` : '';

        if (resultBox) {
            resultBox.classList.add('visible');
            resultBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                    <div>
                        <span class="badge b-order">✅ 바코드 인식 (${res.matchType})</span>
                        <b style="font-size:15px; color:#1f4e79; margin-left:5px;">${escapeHtml(rec.itemName)} (${escapeHtml(rec.brand)})</b>
                        <span style="font-family:monospace; color:#4b5563; margin-left:4px;">[${escapeHtml(code)}]</span>
                    </div>
                    <div style="font-size:12px;">
                        📍 랙위치: <b style="color:#0e7490;">${escapeHtml(rec.rack || '미지정')}</b> ·
                        현재재고: <b style="color:#047857;">${curStockBoxes}박</b> ·
                        금일발주: <b style="color:#d97706;">${curOrderBoxes}박</b>${weightTag}
                    </div>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                    <button type="button" class="btn green sm" onclick="barcodeStockAdjust('${escapeHtml(rec.itemName)}', '${escapeHtml(rec.brand)}', '${escapeHtml(rec.rack || '')}', 1, '${escapeHtml(code)}')">➕ 입고 (+1박스)</button>
                    <button type="button" class="btn red sm" onclick="barcodeStockAdjust('${escapeHtml(rec.itemName)}', '${escapeHtml(rec.brand)}', '${escapeHtml(rec.rack || '')}', -1, '${escapeHtml(code)}')">➖ 출고 (-1박스)</button>
                    <button type="button" class="btn orange sm" onclick="quickAssignBarcodeRack('${escapeHtml(rec.code)}')">📍 랙 위치 변경</button>
                </div>
            `;
        }
        addBarcodeScanLog(`✅ [${code}] ${rec.itemName}(${rec.brand}) 조회됨 (재고 ${curStockBoxes}박)`);
    } else {
        playBeepSound(false);
        if (resultBox) {
            resultBox.classList.add('visible');
            let rackOpts = `<option value="">랙위치 선택</option>`;
            getAllRackCodesList().forEach(rc => { rackOpts += `<option value="${rc}">${rc}</option>`; });

            resultBox.innerHTML = `
                <div style="color:#dc2626; font-weight:bold; margin-bottom:6px;">
                    ⚠️ 미등록 바코드입니다: <span style="font-family:monospace; background:#fee2e2; padding:2px 6px; border-radius:4px;">${escapeHtml(code)}</span> — 아래에서 바로 사내 바코드로 등록할 수 있습니다.
                </div>
                <div style="display:flex; gap:5px; flex-wrap:wrap; align-items:center;">
                    <input type="text" id="inlineRegItem_${targetResultBoxId}" placeholder="품목명 (예: 삼겹, 미전지)" style="width:135px;">
                    <select id="inlineRegBrand_${targetResultBoxId}" style="padding:5px; border:1px solid #cbd5e1; border-radius:5px; font-size:12px;">
                        <option value="포크">포크</option>
                        <option value="대산">대산</option>
                        <option value="정담">정담</option>
                        <option value="황금">황금</option>
                        <option value="기타">기타</option>
                    </select>
                    <select id="inlineRegRack_${targetResultBoxId}" style="padding:5px; border:1px solid #cbd5e1; border-radius:5px; font-size:12px;">
                        ${rackOpts}
                    </select>
                    <input type="text" id="inlineRegMemo_${targetResultBoxId}" placeholder="규격 메모 (선택)" style="width:130px;">
                    <button type="button" class="btn green sm" onclick="quickRegisterScannedBarcode('${escapeHtml(code)}', '${targetResultBoxId}')">💾 즉시 바코드 등록</button>
                </div>
            `;
        }
        addBarcodeScanLog(`⚠️ [${code}] 미등록 바코드 스캔`);
    }

    const inp1 = document.getElementById('stockOrgBarcodeInput');
    const inp2 = document.getElementById('quickBarcodeInput');
    if (inp1 && targetResultBoxId === 'stockOrgBarcodeResult') inp1.value = '';
    if (inp2 && targetResultBoxId === 'quickBarcodeResultBox') inp2.value = '';
}

function quickRegisterScannedBarcode(code, targetResultBoxId) {
    const itemName = (document.getElementById(`inlineRegItem_${targetResultBoxId}`)?.value || '').trim();
    const brand = (document.getElementById(`inlineRegBrand_${targetResultBoxId}`)?.value || '포크').trim();
    const rack = (document.getElementById(`inlineRegRack_${targetResultBoxId}`)?.value || '').trim();
    const memo = (document.getElementById(`inlineRegMemo_${targetResultBoxId}`)?.value || '').trim();

    if (!itemName) {
        alert('품목명을 입력해주세요.');
        return;
    }

    barcodeDB.unshift({ code, itemName, brand, rack, memo });
    saveBarcodeDB();
    renderBarcodeMasterTable();
    recordLastUpdatedTime(`바코드 신규등록(${code} → ${itemName})`);
    handleBarcodeScanSubmit(code, targetResultBoxId);
}

function registerNewBarcodeFromForm() {
    const code = (document.getElementById('newBcCode')?.value || '').trim().replace(/\s+/g, '');
    const itemName = (document.getElementById('newBcItem')?.value || '').trim();
    const brand = (document.getElementById('newBcBrand')?.value || '포크').trim();
    const rack = (document.getElementById('newBcRack')?.value || '').trim();
    const memo = (document.getElementById('newBcMemo')?.value || '').trim();

    if (!code || !itemName) {
        alert('바코드 번호와 품목명을 모두 입력해주세요.');
        return;
    }

    const existIdx = barcodeDB.findIndex(b => b.code === code);
    if (existIdx >= 0) {
        barcodeDB[existIdx] = { code, itemName, brand, rack, memo };
    } else {
        barcodeDB.unshift({ code, itemName, brand, rack, memo });
    }
    saveBarcodeDB();
    document.getElementById('newBcCode').value = '';
    document.getElementById('newBcItem').value = '';
    document.getElementById('newBcMemo').value = '';
    renderBarcodeMasterTable();
    recordLastUpdatedTime(`바코드 등록(${code})`);
    alert(`✅ 바코드 [${code}] (${itemName} · ${brand}) 등록이 완료되었습니다.`);
}

function barcodeStockAdjust(itemName, brand, rackCode, delta, code) {
    let targetItem = stockItems.find(s => s.name === itemName);
    if (!targetItem) {
        targetItem = getOrCreateStockItem(itemName);
    }
    const brKey = (brand === '대산' || brand === '포크') ? brand : '기타';
    targetItem.brands[brKey].boxes = Math.max(0, targetItem.brands[brKey].boxes + delta);
    if (targetItem.brands[brKey].details.length === 0) {
        targetItem.brands[brKey].details.push(`${targetItem.brands[brKey].boxes}박`);
    } else {
        targetItem.brands[brKey].details[0] = targetItem.brands[brKey].details[0].replace(/^\d+\s*(?:박|박스)/, `${targetItem.brands[brKey].boxes}박`);
    }

    if (rackCode && warehouseRackMap[rackCode]) {
        warehouseRackMap[rackCode].boxes = Math.max(0, (warehouseRackMap[rackCode].boxes || 0) + delta);
        localStorage.setItem('mf_warehouse_racks', JSON.stringify(warehouseRackMap));
    }

    const actionText = delta > 0 ? '입고(+1박스)' : '출고(-1박스)';
    addBarcodeScanLog(`📦 [${code}] ${itemName}(${brand}) ${actionText} → 현재 ${targetItem.brands[brKey].boxes}박`);
    recordLastUpdatedTime(`바코드 ${actionText}: ${itemName}`);
    renderStockOrganizationPage();
    renderDiffTable();
    handleBarcodeScanSubmit(code, document.getElementById('quickBarcodeModal')?.classList.contains('open') ? 'quickBarcodeResultBox' : 'stockOrgBarcodeResult');
}

function quickAssignBarcodeRack(code) {
    const rec = barcodeDB.find(b => b.code === code);
    if (!rec) return;
    const newRack = prompt(`[${rec.itemName}(${rec.brand})] 기본 창고 랙 위치를 입력하세요 (예: L-A1, C-B2, R-C3):`, rec.rack || 'L-A1');
    if (newRack === null) return;
    rec.rack = newRack.trim().toUpperCase();
    saveBarcodeDB();
    renderBarcodeMasterTable();
    handleBarcodeScanSubmit(code, document.getElementById('quickBarcodeModal')?.classList.contains('open') ? 'quickBarcodeResultBox' : 'stockOrgBarcodeResult');
}

function deleteBarcodeRecord(idx) {
    const rec = barcodeDB[idx];
    if (!rec) return;
    if (!confirm(`바코드 [${rec.code}] (${rec.itemName}) 항목을 삭제할까요?`)) return;
    barcodeDB.splice(idx, 1);
    saveBarcodeDB();
    renderBarcodeMasterTable();
}

function addBarcodeScanLog(msg) {
    const stamp = getNowTimeFormatted();
    barcodeScanHistory.unshift(`[${stamp}] ${msg}`);
    if (barcodeScanHistory.length > 30) barcodeScanHistory.length = 30;
    try {
        localStorage.setItem('mf_barcode_history', JSON.stringify(barcodeScanHistory));
    } catch (e) {}
    renderBarcodeScanHistory();
}

function renderBarcodeScanHistory() {
    const el = document.getElementById('barcodeScanHistoryList');
    if (!el) return;
    if (barcodeScanHistory.length === 0) {
        el.innerHTML = `<div style="color:#9ca3af;">아직 스캔 이력이 없습니다.</div>`;
        return;
    }
    el.innerHTML = barcodeScanHistory.map(line => `<div style="padding:2px 0; border-bottom:1px dashed #e2e8f0;">${escapeHtml(line)}</div>`).join('');
}

function renderBarcodeMasterTable() {
    const tbody = document.getElementById('barcodeMasterTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    barcodeDB.forEach((rec, idx) => {
        const svgId = `bc_svg_${idx}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-family:monospace; font-weight:bold;">${escapeHtml(rec.code)}</td>
            <td><b style="color:var(--primary);">${escapeHtml(rec.itemName)}</b></td>
            <td>${escapeHtml(rec.brand)}</td>
            <td><span class="rack-code-badge">${escapeHtml(rec.rack || '-')}</span></td>
            <td style="font-size:11px; color:#4b5563;">${escapeHtml(rec.memo || '')}</td>
            <td><svg id="${svgId}" style="max-height:36px;"></svg></td>
            <td>
                <button type="button" class="btn red sm" style="padding:2px 6px;" onclick="deleteBarcodeRecord(${idx})">삭제</button>
            </td>
        `;
        tbody.appendChild(tr);

        if (typeof JsBarcode === 'function') {
            try {
                JsBarcode(`#${svgId}`, rec.code, {
                    format: "CODE128",
                    width: 1.3,
                    height: 28,
                    displayValue: false,
                    margin: 2
                });
            } catch (e) {}
        }
    });
}

function printAllBarcodeLabels() {
    const sheet = document.getElementById('barcodePrintSheet');
    if (!sheet) return;
    if (barcodeDB.length === 0) {
        alert('인쇄할 등록 바코드가 없습니다.');
        return;
    }

    let cardsHtml = `<h2 style="margin:0 0 12px 0;">(주)미트포앤 냉장·냉동 창고 바코드 라벨 시트</h2>
    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">`;

    barcodeDB.forEach((rec, idx) => {
        cardsHtml += `
            <div style="border:1.5px solid #111827; border-radius:6px; padding:8px; text-align:center;">
                <div style="font-size:14px; font-weight:bold;">${escapeHtml(rec.itemName)} (${escapeHtml(rec.brand)})</div>
                <div style="font-size:11px; color:#374151; margin-bottom:4px;">랙위치: <b>${escapeHtml(rec.rack || '미지정')}</b> · ${escapeHtml(rec.memo || '')}</div>
                <svg id="print_bc_${idx}"></svg>
            </div>
        `;
    });
    cardsHtml += `</div>`;
    sheet.innerHTML = cardsHtml;
    sheet.style.display = 'block';

    if (typeof JsBarcode === 'function') {
        barcodeDB.forEach((rec, idx) => {
            try {
                JsBarcode(`#print_bc_${idx}`, rec.code, {
                    format: "CODE128",
                    width: 1.6,
                    height: 44,
                    fontSize: 12,
                    margin: 4
                });
            } catch (e) {}
        });
    }

    setTimeout(() => {
        window.print();
        sheet.style.display = 'none';
    }, 200);
}

function exportBarcodeCsv() {
    let csv = "\uFEFF바코드번호,품목명,브랜드,기본랙위치,규격메모\n";
    barcodeDB.forEach(b => {
        csv += `"${b.code}","${b.itemName}","${b.brand}","${b.rack || ''}","${b.memo || ''}"\n`;
    });
    downloadBlob(csv, "미트포앤_바코드마스터DB.csv");
}

function importBarcodeCsv(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
        let added = 0;
        for (let i = 1; i < lines.length; i++) {
            const cols = parseCsvLine(lines[i]);
            if (!cols[0] || !cols[1]) continue;
            const rec = {
                code: cols[0].trim(),
                itemName: cols[1].trim(),
                brand: (cols[2] || '포크').trim(),
                rack: (cols[3] || '').trim(),
                memo: (cols[4] || '').trim()
            };
            const idx = barcodeDB.findIndex(x => x.code === rec.code);
            if (idx >= 0) barcodeDB[idx] = rec;
            else barcodeDB.push(rec);
            added++;
        }
        saveBarcodeDB();
        renderBarcodeMasterTable();
        alert(`✅ 바코드 ${added}건이 등록/병합되었습니다.`);
    };
    reader.readAsText(file, 'utf-8');
}

/* 빠른 바코드 스캔 모달 & 스마트폰 카메라 실시간 스캐너 */
let cameraStream = null;
let cameraScanTimer = null;

function openQuickBarcodeModal() {
    closeAllBottomPopups();
    const modal = document.getElementById('quickBarcodeModal');
    const backdrop = document.getElementById('bottomPopupBackdrop');
    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    renderBarcodeScanHistory();
    const inp = document.getElementById('quickBarcodeInput');
    if (inp) setTimeout(() => inp.focus(), 100);
}

async function toggleCameraBarcodeScanner() {
    const viewport = document.getElementById('cameraScannerViewport');
    if (!viewport) return;
    if (viewport.style.display === 'block') {
        stopCameraBarcodeScanner();
        return;
    }

    viewport.style.display = 'block';
    const btn = document.getElementById('btnToggleCameraScan');
    if (btn) btn.innerText = '⏹ 카메라 끄기';

    const videoEl = document.getElementById('cameraBarcodeVideo');
    const hintEl = document.getElementById('cameraScanHint');

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
            audio: false
        });
        if (videoEl) {
            videoEl.srcObject = cameraStream;
            await videoEl.play();
        }

        if ('BarcodeDetector' in window) {
            const detector = new BarcodeDetector({
                formats: ['code_128', 'ean_13', 'ean_8', 'itf', 'qr_code', 'code_39']
            });
            cameraScanTimer = setInterval(async () => {
                if (!videoEl || videoEl.readyState < 2) return;
                try {
                    const barcodes = await detector.detect(videoEl);
                    if (barcodes && barcodes.length > 0) {
                        const detectedCode = barcodes[0].rawValue;
                        if (detectedCode) {
                            stopCameraBarcodeScanner();
                            handleBarcodeScanSubmit(detectedCode, 'quickBarcodeResultBox');
                        }
                    }
                } catch (e) {}
            }, 350);
        } else {
            if (hintEl) {
                hintEl.innerText = '⚠️ 현재 브라우저는 내장 카메라 바코드 인식을 지원하지 않습니다. Chrome 앱을 사용하거나 바코드 번호를 직접 입력하세요.';
            }
        }
    } catch (err) {
        if (hintEl) {
            hintEl.innerText = '❌ 카메라 권한이 거부되었거나 카메라를 사용할 수 없습니다 (HTTPS 환경 필요).';
        }
    }
}

function stopCameraBarcodeScanner() {
    if (cameraScanTimer) {
        clearInterval(cameraScanTimer);
        cameraScanTimer = null;
    }
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    const viewport = document.getElementById('cameraScannerViewport');
    const btn = document.getElementById('btnToggleCameraScan');
    if (viewport) viewport.style.display = 'none';
    if (btn) btn.innerText = '📸 카메라 켜기';
}


/* 전역 바인딩 (5_stock_barcode.js) */
window.parseAndApplyStock = parseAndApplyStock;
window.copyKakaoOrderCheckText = copyKakaoOrderCheckText;
window.downloadOrderSummaryCsv = downloadOrderSummaryCsv;
window.downloadDiffCsv = downloadDiffCsv;
window.openQuickBarcodeModal = openQuickBarcodeModal;
window.toggleCameraBarcodeScanner = toggleCameraBarcodeScanner;
window.handleBarcodeScanSubmit = handleBarcodeScanSubmit;
window.quickRegisterScannedBarcode = quickRegisterScannedBarcode;
window.registerNewBarcodeFromForm = registerNewBarcodeFromForm;
window.barcodeStockAdjust = barcodeStockAdjust;
window.quickAssignBarcodeRack = quickAssignBarcodeRack;
window.deleteBarcodeRecord = deleteBarcodeRecord;
window.printAllBarcodeLabels = printAllBarcodeLabels;
window.exportBarcodeCsv = exportBarcodeCsv;
window.importBarcodeCsv = importBarcodeCsv;
window.adjustRackBoxCount = adjustRackBoxCount;
window.promptEditRackSlot = promptEditRackSlot;
window.autoPopulateRacksFromStock = autoPopulateRacksFromStock;
window.clearAllRackSlots = clearAllRackSlots;
window.toggleStockOrgLotCheck = toggleStockOrgLotCheck;
window.stepPhysicalStock = stepPhysicalStock;
window.setPhysicalStockDirect = setPhysicalStockDirect;
window.assignLotToRack = assignLotToRack;
window.applyPhysicalStockToMain = applyPhysicalStockToMain;
window.copyKakaoStockOrgReport = copyKakaoStockOrgReport;
window.downloadStockOrgCsv = downloadStockOrgCsv;
