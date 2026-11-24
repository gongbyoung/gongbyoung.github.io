/* =========================================================================
   4. [페이지 2] 발주 목록 필터링 및 6열 바둑판 렌더링 (1줄 압축 헤더)
   ========================================================================= */
function formatSenderShortName(sender) {
    if (!sender) return '';
    return String(sender)
        .replace(/\(주\)\s*미트포앤|주식회사\s*미트포앤|미트포앤/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/\s*(대표님|대표|이사님|이사|부장님|부장|차장님|차장|과장님|과장|대리님|대리|님)$/g, '')
        .trim() || sender;
}

function getFilteredOrderList(forceOnlyOrder = false) {
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const mode = document.getElementById('orderTimeMode').value;

    return allChatItems.filter(item => {
        if ((showOnlyOrder || forceOnlyOrder) && item.type !== '발주') return false;
        if (showOnlyKnownClient && !item.isKnownClient) return false;
        if (mode === 'all' || !targetDateStr) return true;

        if (mode === 'smart') {
            if (item.type === '발주') {
                return item.targetDeliveryDate === targetDateStr;
            } else {
                return item.dateFull === targetDateStr;
            }
        }

        if (mode === 'fullday') {
            return item.dateFull === targetDateStr;
        }

        const prevDateStr = addDaysToDateStr(targetDateStr, -1);

        if (mode === 'prev10_to_16') {
            const isPrevFrom10 = (item.dateFull === prevDateStr && item.timeMins >= 10 * 60);
            const isCurrTo16 = (item.dateFull === targetDateStr && item.timeMins <= 16 * 60);
            return isPrevFrom10 || isCurrTo16;
        }
        if (mode === 'prev22_to_16') {
            const isPrevFrom22 = (item.dateFull === prevDateStr && item.timeMins >= 22 * 60);
            const isCurrTo16 = (item.dateFull === targetDateStr && item.timeMins <= 16 * 60);
            return isPrevFrom22 || isCurrTo16;
        }
        return true;
    });
}

function renderOrdersTable() {
    const grid = document.getElementById('orderTileGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = getFilteredOrderList(false);
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const mode = document.getElementById('orderTimeMode').value;
    const modeLabel = mode === 'smart' ? `스마트 납품일(${toShortDate(targetDateStr)}) 기준` : '선택 시간범위 기준';
    document.getElementById('orderStats').innerText = `📋 조회된 내역: 총 ${list.length}건 (${modeLabel})`;

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:#dc2626; background:#fff; border-radius:8px; border:1px solid var(--border);">선택하신 납품 기준일(${escapeHtml(targetDateStr)})에 해당하는 발주 내역이 없습니다.</div>`;
        return;
    }

    list.forEach(item => {
        let cardTypeClass = 'is-other';
        let nonOrderTag = '';
        if (item.type === '발주') {
            cardTypeClass = '';
        } else if (item.type === '계근') {
            cardTypeClass = 'is-weight';
            nonOrderTag = `<span class="badge b-weight" style="font-size:9px; margin-left:2px;">계근</span>`;
        } else {
            nonOrderTag = `<span class="badge b-other" style="font-size:9px; margin-left:2px;">${escapeHtml(item.delivReason !== '-' ? item.delivReason : '기타')}</span>`;
        }

        const shortSender = formatSenderShortName(item.sender);
        const splitTag = item.splitTotal > 1
            ? `<span class="badge" style="background:#7c3aed; font-size:9px; margin-left:2px;">${item.splitIndex}/${item.splitTotal}</span>`
            : '';
        const mergedTag = item.mergedAddCount > 0
            ? `<span class="order-merged-tag">+추가${item.mergedAddCount}</span>`
            : '';

        let delivIconHtml = '';
        if (item.type === '발주') {
            const isNextDay = item.targetDeliveryDate !== item.dateFull;
            const extraCls = item.isManualDeliv ? 'manual' : (isNextDay ? 'next-day' : '');
            const iconText = isNextDay ? '⏭익' : '🚚당';
            const tipText = `납품일: ${item.delivShort} (${item.delivReason}) — 클릭하면 당일(${item.dateShort}) ↔ 익일 전환`;
            delivIconHtml = `<button type="button" class="deliv-icon-btn ${extraCls}" onclick="toggleItemDeliveryDate(${item.idx})" title="${escapeHtml(tipText)}">${iconText}</button>`;
        }

        const bodyText = item.displayContent || item.content;

        const card = document.createElement('div');
        card.className = `order-tile-card ${cardTypeClass}`;
        card.innerHTML = `
            <div class="order-tile-head">
                <span class="order-tile-dt">${escapeHtml(item.dateShort)} ${escapeHtml(item.timeStr)}</span>
                <span class="order-tile-client" title="${escapeHtml(item.clientName)}">${escapeHtml(item.clientName)}${splitTag}${mergedTag}${nonOrderTag}</span>
                ${delivIconHtml}
                <span class="order-tile-sender">${escapeHtml(shortSender)}</span>
            </div>
            <div class="order-tile-body">${escapeHtml(bodyText)}</div>
        `;
        grid.appendChild(card);
    });
}

function updateHeaderToggleButtonsUI() {
    const btnOrder = document.getElementById('btnOnlyOrder');
    if (btnOrder) {
        btnOrder.innerText = showOnlyOrder ? "🔍 발주만: ON" : "🔍 발주만: OFF";
        btnOrder.title = showOnlyOrder ? "발주만 보기: ON (비발주 숨김)" : "발주만 보기: OFF (전체 표시)";
        btnOrder.className = showOnlyOrder ? "hdr-icon-btn active" : "hdr-icon-btn warn";
    }
    const btnClient = document.getElementById('btnOnlyKnownClient');
    if (btnClient) {
        btnClient.innerText = showOnlyKnownClient ? "🏢 거래처: ON" : "🏢 거래처: OFF";
        btnClient.title = showOnlyKnownClient ? "등록 거래처만 보기: ON" : "등록 거래처만 보기: OFF";
        btnClient.className = showOnlyKnownClient ? "hdr-icon-btn active" : "hdr-icon-btn";
    }
}

function toggleOnlyOrder() {
    showOnlyOrder = !showOnlyOrder;
    updateHeaderToggleButtonsUI();
    onFilterCriteriaChange(false);
}

function toggleKnownClient() {
    showOnlyKnownClient = !showOnlyKnownClient;
    updateHeaderToggleButtonsUI();
    onFilterCriteriaChange(false);
}


/* =========================================================================
   7-B. [페이지 4] 당일 낱개·소분·작업 목록 + 계근(문자 & 사진 OCR) 자동대조 검토
   ========================================================================= */
let looseTypeFilter = localStorage.getItem('mf_loose_type') || 'ALL';     // 'ALL' | 'WORK' | 'SIMPLE' | 'UNWEIGHED'
let looseGroupMode = localStorage.getItem('mf_loose_group') || 'client';  // 'client' | 'item' | 'vehicle'
let looseDoneMap = {};
try { looseDoneMap = JSON.parse(localStorage.getItem('mf_loose_done') || '{}'); } catch (e) {}

// 사진 OCR이나 수동 보완으로 추가된 계근 기록 저장소
let manualWeighinLogs = [];
try {
    const savedLogs = JSON.parse(localStorage.getItem('mf_manual_weighin_logs') || 'null');
    if (Array.isArray(savedLogs)) manualWeighinLogs = savedLogs;
} catch (e) {}

const LOOSE_UNIT_REGEX = /(?:0\.5박스|\d+(?:\.\d+)?\s*(?:팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개|키로|kg|킬|k)(?![a-zA-Z가-힣]))/i;
const WORK_KEYWORD_REGEX = /작업|슬라이스|세절|절단|제육|찌개|찌게|대패|수육|구이용|구이반|깍뚝|반반|소분|다짐|민찌|미리작업|썰어|등분|갈라|쪼개/i;

function detectLooseCategoryName(lineText, fallbackName) {
    const matched = matchLineItemsClean(lineText);
    if (matched.length > 0) return matched[0].key;
    if (/특미/.test(lineText)) return '특미삼';
    if (/특목/.test(lineText)) return '특목살';
    if (/알목/.test(lineText)) return '알목심';
    if (/우삼겹|우삼|차돌/.test(lineText)) return '우삼겹·차돌';
    if (/우사태|갈비살|늑간|살치|부채|홍두깨|설도|사골|우족|잡뼈|아롱|척갈비/.test(lineText)) return '소고기·기타';
    if (/목전지|볼라/.test(lineText)) return '목전지·전각';
    if (/장족|미니족|족발/.test(lineText)) return '장족·미니족';
    if (/돈피|껍데기|오돌뼈|덜미|덧살|민찌|모돈|왕구이/.test(lineText)) return '부산물·특수부위';
    if (/테니쉬|데니쉬|두메코|올리멜|토레인|바텔|고원돈|셀렉타|수입/.test(lineText)) return '수입돈육';
    return fallbackName || '기타품목';
}

function parseWeightsFromWeighinLine(line) {
    let s = String(line || '');
    s = s.replace(/\d{1,2}월\s*\d{1,2}일?/g, ' ');
    s = s.replace(/\d+\s*(?:포|대|개|각|도누|도누리)/g, ' ');
    s = s.replace(/(?:황금|정담)\d+/g, ' ');
    const matches = s.match(/\b\d{1,2}\.\d{1,2}\b/g) || [];
    return matches.map(v => parseFloat(v)).filter(v => !isNaN(v) && v > 0);
}

function collectWeighinRecordsForDate(targetDateStr) {
    const records = [];
    const prevDateStr = targetDateStr ? addDaysToDateStr(targetDateStr, -1) : '';

    // 1) 카톡에서 분리된 '계근' 메시지 수집 (전날 오후 14시 이후 ~ 당일 전체 포함)
    allChatItems.forEach(item => {
        if (item.type !== '계근') return;
        if (targetDateStr) {
            const isSameDay = item.dateFull === targetDateStr;
            const isPrevAfternoon = (item.dateFull === prevDateStr && item.timeMins >= 14 * 60);
            if (!isSameDay && !isPrevAfternoon) return;
        }

        const lines = item.content.split('\n').map(l => l.trim()).filter(Boolean);
        let lastCat = '';
        lines.forEach(line => {
            const weights = parseWeightsFromWeighinLine(line);
            const hasCat = MEAT_ANY_REGEX.test(line) || /특미|특목|알목|우삼|우사태|목전지/.test(line);
            const cat = detectLooseCategoryName(line, lastCat);
            if (hasCat) lastCat = cat;

            if (weights.length > 0) {
                records.push({
                    source: '카톡문자',
                    dateFull: item.dateFull,
                    timeStr: item.timeStr,
                    sender: formatSenderShortName(item.sender),
                    clientName: item.clientName,
                    officialName: item.officialName,
                    category: cat || '기타품목',
                    rawLine: line,
                    weights,
                    totalKg: weights.reduce((a, b) => a + b, 0)
                });
            }
        });
    });

    // 2) 사진 OCR / 수동 추가된 계근 기록 수집
    manualWeighinLogs.forEach(log => {
        if (targetDateStr && log.targetDate && log.targetDate !== targetDateStr) return;
        const lines = String(log.text || '').split('\n').map(l => l.trim()).filter(Boolean);
        let curClient = log.clientName || '미확인';
        let curOfficial = log.officialName || curClient;
        let lastCat = '';

        lines.forEach(line => {
            const hit = detectClientHeaderInLine(line, getSortedAliasPairs());
            if (hit && parseWeightsFromWeighinLine(line).length === 0) {
                curClient = hit.alias;
                curOfficial = hit.official;
                lastCat = '';
                return;
            }
            const weights = parseWeightsFromWeighinLine(line);
            const hasCat = MEAT_ANY_REGEX.test(line) || /특미|특목|알목|우삼|우사태|목전지/.test(line);
            const cat = detectLooseCategoryName(line, lastCat);
            if (hasCat) lastCat = cat;

            if (weights.length > 0) {
                records.push({
                    source: log.source || '사진OCR',
                    dateFull: log.targetDate || targetDateStr || '',
                    timeStr: log.timeStr || '',
                    sender: log.sender || 'OCR',
                    clientName: curClient,
                    officialName: curOfficial,
                    category: cat || '기타품목',
                    rawLine: line,
                    weights,
                    totalKg: weights.reduce((a, b) => a + b, 0)
                });
            }
        });
    });

    return records;
}

function isSameClientEntity(aName, aOfficial, bName, bOfficial) {
    if (aOfficial && bOfficial && aOfficial === bOfficial) return true;
    const na = String(aName || '').replace(/\s+/g, '').toLowerCase();
    const nb = String(bName || '').replace(/\s+/g, '').toLowerCase();
    if (!na || !nb) return false;
    return na === nb || (na.length >= 2 && nb.startsWith(na)) || (nb.length >= 2 && na.startsWith(nb));
}

function getFilteredLooseEntries() {
    const orders = getFilteredOrderList(true);
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const weighinRecords = collectWeighinRecordsForDate(targetDateStr);
    const entries = [];

    orders.forEach(ord => {
        const txt = ord.displayContent || ord.content || '';
        if (/취소|삭제|빼달|패스/.test(txt) && !/반품/.test(txt)) return;

        const rawLines = txt.split('\n');
        let lastCategoryName = '';

        rawLines.forEach((rawLine, lineIdx) => {
            const line = rawLine.trim();
            if (!line) return;
            if (/반품|취소|삭제|빼달|패스/.test(line)) return;

            const hasMeat = MEAT_ANY_REGEX.test(line);
            const startsWithQtyOnly = /^\d+(?:\.\d+)?\s*(?:팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개|키로|kg|킬|k)/i.test(line);

            if (!hasMeat && !(startsWithQtyOnly && lastCategoryName)) return;

            const norm = line
                .replace(/한박스/g, '1박스')
                .replace(/한박/g, '1박')
                .replace(/반박스/g, '0.5박스')
                .replace(/한판/g, '1판')
                .replace(/한덩이/g, '1덩이')
                .replace(/한덩어리/g, '1덩어리')
                .replace(/두마리분/g, '2마리분')
                .replace(/한마리분/g, '1마리분')
                .replace(/한마리반/g, '1마리분');

            const noSpec = norm
                .replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*(?:키로|kg)?(?:대|이상)?/gi, ' ')
                .replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ')
                .replace(/(미삼|삼겹|암삼|암미삼|특삼|특미삼)\s*1[5-9]\s*(?:키로|kg)\s+(\d+)/gi, '$1 $2')
                .replace(/\(\s*대략[^)]*\)/g, ' ');

            if (!/\d/.test(noSpec) && !noSpec.includes('돈피')) return;

            const catName = detectLooseCategoryName(line, lastCategoryName);
            if (hasMeat) lastCategoryName = catName;

            const hasLoose = LOOSE_UNIT_REGEX.test(noSpec);
            const hasWork = WORK_KEYWORD_REGEX.test(noSpec);

            if (hasLoose || hasWork) {
                const entryKey = `${ord.itemKey}_L${lineIdx}_${line.substring(0, 14).replace(/\s+/g, '')}`;
                const vCode = dispatchMap[ord.clientName] || 'UNASSIGNED';
                let vLabel = '미배차';
                if (vCode.startsWith('V')) {
                    const vIdx = parseInt(vCode.substring(1), 10);
                    vLabel = `${vIdx + 1}호차`;
                } else if (vCode === 'PICKUP') {
                    vLabel = '방문/택배';
                }

                // 주문 요구 수량(팩/판/덩이/kg 등) 추출
                let reqQty = 1;
                let reqUnit = '';
                const qm = noSpec.match(/(\d+(?:\.\d+)?)\s*(팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개|키로|kg|킬|k)/i);
                if (qm) {
                    reqQty = parseFloat(qm[1]) || 1;
                    reqUnit = qm[2];
                }

                // 동일 거래처 + 동일 품목의 카톡 계근 기록 자동 매칭
                const matchedWeighins = weighinRecords.filter(w =>
                    isSameClientEntity(ord.clientName, ord.officialName, w.clientName, w.officialName) &&
                    (w.category === catName || w.rawLine.includes(catName))
                );

                // 동일 거래처에 계근 기록은 있으나 품목명 축약 등으로 정확 매칭이 안 된 보조 후보
                const clientOtherWeighins = matchedWeighins.length === 0
                    ? weighinRecords.filter(w => isSameClientEntity(ord.clientName, ord.officialName, w.clientName, w.officialName))
                    : [];

                const weighedPieceCount = matchedWeighins.reduce((acc, w) => acc + w.weights.length, 0);
                const weighedTotalKg = matchedWeighins.reduce((acc, w) => acc + w.totalKg, 0);

                // 계근 검토 상태 판정:
                // 'MATCHED' (계근완료), 'DIFF' (수량차이/확인필요), 'PARTIAL_CLIENT' (거래처 타품목 계근만 존재), 'UNWEIGHED' (미계근)
                let weighStatus = 'UNWEIGHED';
                if (matchedWeighins.length > 0) {
                    if (/키로|kg|킬|k/i.test(reqUnit)) {
                        weighStatus = 'MATCHED';
                    } else if (weighedPieceCount === reqQty || matchedWeighins.length >= 1) {
                        weighStatus = (weighedPieceCount === reqQty) ? 'MATCHED' : 'DIFF';
                    }
                } else if (clientOtherWeighins.length > 0) {
                    weighStatus = 'PARTIAL_CLIENT';
                }

                entries.push({
                    entryKey,
                    clientName: ord.clientName,
                    officialName: ord.officialName,
                    sender: formatSenderShortName(ord.sender),
                    timeStr: ord.timeStr,
                    delivShort: ord.delivShort,
                    category: catName,
                    lineText: line,
                    isWork: hasWork,
                    reqQty,
                    reqUnit,
                    vCode,
                    vLabel,
                    isDone: Boolean(looseDoneMap[entryKey]),
                    weighStatus,
                    matchedWeighins,
                    clientOtherWeighins,
                    weighedPieceCount,
                    weighedTotalKg
                });
            }
        });
    });

    return entries;
}

function setLooseTypeFilter(mode) {
    looseTypeFilter = mode;
    localStorage.setItem('mf_loose_type', mode);
    renderLooseItemsPage();
}

function setLooseGroupMode(mode) {
    looseGroupMode = mode;
    localStorage.setItem('mf_loose_group', mode);
    renderLooseItemsPage();
}

function toggleLooseEntryDone(entryKey) {
    looseDoneMap[entryKey] = !looseDoneMap[entryKey];
    if (!looseDoneMap[entryKey]) delete looseDoneMap[entryKey];
    localStorage.setItem('mf_loose_done', JSON.stringify(looseDoneMap));
    recordLastUpdatedTime('낱개 작업 체크');
    renderLooseItemsPage();
}

function clearLooseChecks() {
    if (!confirm('현재 체크된 낱개 완료 표시를 모두 해제할까요?')) return;
    looseDoneMap = {};
    localStorage.removeItem('mf_loose_done');
    renderLooseItemsPage();
}

function renderLooseItemsPage() {
    const grid = document.getElementById('looseTileGrid');
    const statsEl = document.getElementById('looseStats');
    if (!grid) return;
    grid.innerHTML = '';

    const allEntries = getFilteredLooseEntries();
    const workCnt = allEntries.filter(e => e.isWork).length;
    const simpleCnt = allEntries.filter(e => !e.isWork).length;
    const unweighedCnt = allEntries.filter(e => e.weighStatus === 'UNWEIGHED' || e.weighStatus === 'PARTIAL_CLIENT').length;
    const weighedOkCnt = allEntries.filter(e => e.weighStatus === 'MATCHED' || e.weighStatus === 'DIFF').length;
    const doneCnt = allEntries.filter(e => e.isDone).length;

    const btnAll = document.getElementById('btnLooseTypeAll');
    const btnWork = document.getElementById('btnLooseTypeWork');
    const btnSimple = document.getElementById('btnLooseTypeSimple');
    const btnUnweighed = document.getElementById('btnLooseTypeUnweighed');
    if (btnAll) { btnAll.classList.toggle('active', looseTypeFilter === 'ALL'); btnAll.innerText = `전체 (${allEntries.length})`; }
    if (btnWork) { btnWork.classList.toggle('active', looseTypeFilter === 'WORK'); btnWork.innerText = `🔪 작업·세절 (${workCnt})`; }
    if (btnSimple) { btnSimple.classList.toggle('active', looseTypeFilter === 'SIMPLE'); btnSimple.innerText = `⚖️ 단순낱개 (${simpleCnt})`; }
    if (btnUnweighed) { btnUnweighed.classList.toggle('active', looseTypeFilter === 'UNWEIGHED'); btnUnweighed.innerText = `🚨 미계근만 (${unweighedCnt})`; }

    const btnGC = document.getElementById('btnLooseGroupClient');
    const btnGI = document.getElementById('btnLooseGroupItem');
    const btnGV = document.getElementById('btnLooseGroupVehicle');
    if (btnGC) btnGC.classList.toggle('active', looseGroupMode === 'client');
    if (btnGI) btnGI.classList.toggle('active', looseGroupMode === 'item');
    if (btnGV) btnGV.classList.toggle('active', looseGroupMode === 'vehicle');

    const filtered = allEntries.filter(e => {
        if (looseTypeFilter === 'WORK') return e.isWork;
        if (looseTypeFilter === 'SIMPLE') return !e.isWork;
        if (looseTypeFilter === 'UNWEIGHED') return e.weighStatus === 'UNWEIGHED' || e.weighStatus === 'PARTIAL_CLIENT';
        return true;
    });

    if (statsEl) {
        statsEl.innerText = `🔪 낱개·계근 검토: 총 ${allEntries.length}건 (⚖️계근확인 ${weighedOkCnt}건 / 🚨미계근 ${unweighedCnt}건 / ✅체크 ${doneCnt}건)`;
    }

    // 상단 카톡 계근 사진(1~2장) OCR 보완 패널 상태 업데이트
    renderPhotoWeighinLogsList();

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:#6b7280; background:#fff; border-radius:8px; border:1px solid var(--border);">선택하신 조건에 해당하는 낱개·작업 주문이 없습니다.</div>`;
        return;
    }

    const groupMap = new Map();
    filtered.forEach(e => {
        let gKey = e.clientName;
        let gSub = e.vLabel;
        let topColor = '#1f4e79';

        if (looseGroupMode === 'item') {
            gKey = e.category;
            gSub = '품목별 묶음';
            topColor = '#047857';
        } else if (looseGroupMode === 'vehicle') {
            gKey = e.vCode;
            gSub = '배차 호차별';
            if (e.vCode.startsWith('V')) {
                const idx = parseInt(e.vCode.substring(1), 10);
                topColor = VEHICLE_COLORS[idx] || '#1f4e79';
            } else {
                topColor = '#4b5563';
            }
        } else {
            if (e.vCode.startsWith('V')) {
                const idx = parseInt(e.vCode.substring(1), 10);
                topColor = VEHICLE_COLORS[idx] || '#1f4e79';
            }
        }

        if (!groupMap.has(gKey)) {
            let titleText = gKey;
            if (looseGroupMode === 'vehicle') {
                if (gKey.startsWith('V')) {
                    titleText = vehicleNames[parseInt(gKey.substring(1), 10)] || gKey;
                } else if (gKey === 'PICKUP') {
                    titleText = '📦 직접방문 / 택배';
                } else {
                    titleText = '⚠️ 미배차';
                }
            }
            groupMap.set(gKey, { title: titleText, sub: gSub, color: topColor, items: [] });
        }
        groupMap.get(gKey).items.push(e);
    });

    const groups = Array.from(groupMap.values());
    if (looseGroupMode === 'client') {
        groups.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }

    groups.forEach(grp => {
        const doneInGrp = grp.items.filter(x => x.isDone).length;
        const unweighedInGrp = grp.items.filter(x => x.weighStatus === 'UNWEIGHED' || x.weighStatus === 'PARTIAL_CLIENT').length;
        let rowsHtml = '';

        grp.items.forEach(it => {
            const tagHtml = it.isWork
                ? `<span class="loose-tag-work">작업</span>`
                : `<span class="loose-tag-simple">낱개</span>`;
            const prefixLabel = (looseGroupMode !== 'client')
                ? `<b style="color:var(--primary);">[${escapeHtml(it.clientName)}]</b> `
                : '';

            // 계근 대조 배지 & 상세 중량 표시
            let weighVerifyHtml = '';
            if (it.weighStatus === 'MATCHED') {
                const wDetail = it.matchedWeighins.map(w => `${w.rawLine} (${w.totalKg.toFixed(2)}kg)`).join(' / ');
                weighVerifyHtml = `
                    <div class="weigh-verify-box ok">
                        <span>✅ <b>계근일치</b> (${it.weighedPieceCount}건 · 총 <b>${it.weighedTotalKg.toFixed(2)}kg</b>)</span>
                        <div style="font-size:10px; color:#065f46; margin-top:1px;">└ ${escapeHtml(wDetail)}</div>
                    </div>`;
            } else if (it.weighStatus === 'DIFF') {
                const wDetail = it.matchedWeighins.map(w => w.rawLine).join(' / ');
                weighVerifyHtml = `
                    <div class="weigh-verify-box warn">
                        <span>⚠️ <b>수량확인</b> (주문 ${it.reqQty}${escapeHtml(it.reqUnit)} vs 계근 ${it.weighedPieceCount}건 · ${it.weighedTotalKg.toFixed(2)}kg)</span>
                        <div style="font-size:10px; color:#92400e; margin-top:1px;">└ ${escapeHtml(wDetail)}</div>
                    </div>`;
            } else if (it.weighStatus === 'PARTIAL_CLIENT') {
                const otherDetail = it.clientOtherWeighins.map(w => w.rawLine).join(' / ');
                weighVerifyHtml = `
                    <div class="weigh-verify-box warn">
                        <span>🔎 <b>타품목 계근만 있음</b> (해당품목 미확인)</span>
                        <div style="font-size:10px; color:#92400e; margin-top:1px;">└ 참고: ${escapeHtml(otherDetail)}</div>
                    </div>`;
            } else {
                weighVerifyHtml = `
                    <div class="weigh-verify-box missing">
                        <span>🚨 <b>미계근</b> (카톡 계근문자 없음)</span>
                    </div>`;
            }

            const rowCls = `loose-row ${it.isWork ? 'is-work' : ''} ${it.isDone ? 'is-done' : ''}`;
            rowsHtml += `
                <div class="${rowCls}" style="flex-direction:column; gap:3px;">
                    <label style="display:flex; align-items:flex-start; gap:5px; cursor:pointer; width:100%;">
                        <input type="checkbox" ${it.isDone ? 'checked' : ''} onchange="toggleLooseEntryDone('${escapeHtml(it.entryKey)}')">
                        <span>${tagHtml} ${prefixLabel}${escapeHtml(it.lineText)}</span>
                    </label>
                    ${weighVerifyHtml}
                </div>
            `;
        });

        const statusHeaderBadge = unweighedInGrp > 0
            ? `<span style="background:#dc2626; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:4px; font-weight:bold;">미계근 ${unweighedInGrp}</span>`
            : `<span style="background:#059669; color:#fff; font-size:9.5px; padding:1px 5px; border-radius:4px; font-weight:bold;">계근완료</span>`;

        const card = document.createElement('div');
        card.className = 'order-tile-card';
        card.style.borderTopColor = unweighedInGrp > 0 ? '#dc2626' : grp.color;
        card.innerHTML = `
            <div class="order-tile-head">
                <span class="order-tile-dt">${escapeHtml(grp.sub)}</span>
                <span class="order-tile-client" title="${escapeHtml(grp.title)}">${escapeHtml(grp.title)}</span>
                ${statusHeaderBadge}
                <span class="order-tile-sender">${doneInGrp}/${grp.items.length}</span>
            </div>
            <div class="loose-item-list">${rowsHtml}</div>
        `;
        grid.appendChild(card);
    });
}

/* =========================================================================
   카톡 계근 사진(1~2장) 브라우저 로컬 OCR (Tesseract.js) 및 계근 대조 보완
   ========================================================================= */
function togglePhotoWeighinPanel() {
    const panel = document.getElementById('photoWeighinOcrPanel');
    if (!panel) return;
    const willShow = panel.style.display === 'none';
    panel.style.display = willShow ? 'block' : 'none';
    if (willShow) renderPhotoWeighinLogsList();
}

async function runPhotoWeighinOcr(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const statusEl = document.getElementById('photoOcrStatus');
    const outBox = document.getElementById('photoOcrTextArea');

    if (typeof Tesseract === 'undefined') {
        if (statusEl) statusEl.innerText = '⚠️ OCR 라이브러리(Tesseract.js)가 로드되지 않았습니다. 아래 입력칸에 계근 내용을 직접 입력하세요.';
        return;
    }

    let combinedText = outBox && outBox.value.trim() ? outBox.value.trim() + '\n' : '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (statusEl) statusEl.innerText = `⏳ 사진 OCR 글자 인식 중... (${i + 1}/${files.length}) ${file.name}`;
        try {
            const result = await Tesseract.recognize(file, 'kor+eng', {
                logger: m => {
                    if (m.status === 'recognizing text' && statusEl) {
                        const pct = Math.round((m.progress || 0) * 100);
                        statusEl.innerText = `⏳ [${file.name}] 글자 추출 중... ${pct}%`;
                    }
                }
            });
            const extracted = (result && result.data && result.data.text) ? result.data.text.trim() : '';
            if (extracted) {
                combinedText += (combinedText ? '\n' : '') + extracted;
            }
        } catch (err) {
            console.error('OCR 오류:', err);
        }
    }

    if (outBox) outBox.value = combinedText.trim();
    if (statusEl) statusEl.innerText = `✅ 사진 ${files.length}장 글자 추출 완료! 아래 내용을 확인·수정 후 [계근 대조에 반영]을 누르세요.`;
}

function applyPhotoWeighinTextToLoose() {
    const outBox = document.getElementById('photoOcrTextArea');
    const clientInp = document.getElementById('photoOcrClientInput');
    if (!outBox || !outBox.value.trim()) {
        alert('반영할 계근 텍스트가 없습니다. 사진을 선택하거나 계근 내역을 입력해주세요.');
        return;
    }

    const targetDateStr = document.getElementById('orderTargetDate').value || '';
    const clientRaw = (clientInp?.value || '').trim();
    const matched = clientRaw ? matchClientFromText(clientRaw) : { clientName: '', officialName: '' };

    manualWeighinLogs.unshift({
        id: 'MW_' + Date.now(),
        targetDate: targetDateStr,
        timeStr: getNowTimeFormatted().slice(-8, -3),
        clientName: matched.clientName || clientRaw,
        officialName: matched.officialName || matched.clientName || clientRaw,
        text: outBox.value.trim(),
        source: '사진OCR'
    });

    localStorage.setItem('mf_manual_weighin_logs', JSON.stringify(manualWeighinLogs));
    outBox.value = '';
    if (clientInp) clientInp.value = '';
    recordLastUpdatedTime('사진 OCR 계근 내역 반영');
    renderLooseItemsPage();
    alert('✅ 사진 계근 내역이 낱개 목록의 계근 대조 검토에 즉시 반영되었습니다!');
}

function deleteManualWeighinLog(idx) {
    manualWeighinLogs.splice(idx, 1);
    localStorage.setItem('mf_manual_weighin_logs', JSON.stringify(manualWeighinLogs));
    renderLooseItemsPage();
}

function renderPhotoWeighinLogsList() {
    const listEl = document.getElementById('photoWeighinLogsList');
    if (!listEl) return;
    if (manualWeighinLogs.length === 0) {
        listEl.innerHTML = `<span style="color:#6b7280; font-size:11px;">추가된 사진 OCR 계근 내역이 없습니다.</span>`;
        return;
    }
    listEl.innerHTML = manualWeighinLogs.map((log, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; padding:4px 6px; background:#fff; border:1px solid #cbd5e1; border-radius:5px; margin-bottom:4px; font-size:11px;">
            <span><b>[${escapeHtml(log.source)}]</b> ${log.clientName ? `<b style="color:var(--primary);">${escapeHtml(log.clientName)}</b> · ` : ''}${escapeHtml(log.text.replace(/\n/g, ' / '))}</span>
            <button type="button" class="btn red sm" style="padding:1px 6px;" onclick="deleteManualWeighinLog(${idx})">삭제</button>
        </div>
    `).join('');
}

function copyKakaoLooseListText() {
    const entries = getFilteredLooseEntries();
    if (entries.length === 0) {
        alert('복사할 당일 낱개 목록이 없습니다.');
        return;
    }
    const tDate = document.getElementById('orderTargetDate').value || '';
    const byClient = new Map();
    entries.forEach(e => {
        if (!byClient.has(e.clientName)) byClient.set(e.clientName, []);
        const statusTag = e.weighStatus === 'MATCHED' ? ` [계근완료:${e.weighedTotalKg.toFixed(2)}kg]`
            : e.weighStatus === 'DIFF' ? ` [수량확인:${e.weighedTotalKg.toFixed(2)}kg]`
            : ' [미계근]';
        byClient.get(e.clientName).push(`${e.isWork ? '[작업]' : ''}${e.lineText}${statusTag}`);
    });

    const lines = [`[낱개·계근 검토 목록 ${toShortDate(tDate)}]`];
    byClient.forEach((items, cName) => {
        lines.push(`\n${cName}`);
        items.forEach(it => lines.push(`- ${it}`));
    });

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        alert(`카톡용 낱개·계근 검토 목록(${entries.length}건)이 클립보드에 복사되었습니다!`);
    });
}

function downloadLooseCsv() {
    const entries = getFilteredLooseEntries();
    let csv = "\uFEFF납품일,배차차량,거래처명,품목분류,구분,낱개주문내용,계근검토상태,계근건수,계근총중량(kg),계근원문,완료여부\n";
    entries.forEach(e => {
        const clean = e.lineText.replace(/"/g, '""');
        const stLabel = e.weighStatus === 'MATCHED' ? '계근일치'
            : e.weighStatus === 'DIFF' ? '수량확인필요'
            : e.weighStatus === 'PARTIAL_CLIENT' ? '타품목계근만있음'
            : '미계근';
        const rawW = e.matchedWeighins.map(w => w.rawLine).join(' / ').replace(/"/g, '""');
        csv += `"${e.delivShort}","${e.vLabel}","${e.clientName}","${e.category}","${e.isWork ? '작업·세절' : '단순낱개'}","${clean}","${stLabel}",${e.weighedPieceCount},${e.weighedTotalKg.toFixed(2)},"${rawW}","${e.isDone ? '완료' : '대기'}"\n`;
    });
    downloadBlob(csv, "미트포앤_낱개_계근검토목록.csv");
}

/* 전역 바인딩 (4_orders_loose.js) */
window.setLooseTypeFilter = setLooseTypeFilter;
window.setLooseGroupMode = setLooseGroupMode;
window.toggleLooseEntryDone = toggleLooseEntryDone;
window.clearLooseChecks = clearLooseChecks;
window.togglePhotoWeighinPanel = togglePhotoWeighinPanel;
window.runPhotoWeighinOcr = runPhotoWeighinOcr;
window.applyPhotoWeighinTextToLoose = applyPhotoWeighinTextToLoose;
window.deleteManualWeighinLog = deleteManualWeighinLog;
window.copyKakaoLooseListText = copyKakaoLooseListText;
window.downloadLooseCsv = downloadLooseCsv;
