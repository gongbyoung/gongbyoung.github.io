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
   7-B. [페이지 3] 당일 낱개·소분·작업 목록 추출 및 6열 바둑판 관리
   ========================================================================= */
let looseTypeFilter = localStorage.getItem('mf_loose_type') || 'ALL';     // 'ALL' | 'WORK' | 'SIMPLE'
let looseGroupMode = localStorage.getItem('mf_loose_group') || 'client';  // 'client' | 'item' | 'vehicle'
let looseDoneMap = {};
try { looseDoneMap = JSON.parse(localStorage.getItem('mf_loose_done') || '{}'); } catch (e) {}

const LOOSE_UNIT_REGEX = /(?:0\.5박스|\d+(?:\.\d+)?\s*(?:팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개|키로|kg|킬|k)(?![a-zA-Z가-힣]))/i;
const WORK_KEYWORD_REGEX = /작업|슬라이스|세절|절단|제육|찌개|찌게|대패|수육|구이용|구이반|깍뚝|반반|소분|다짐|민찌|미리작업|썰어|등분|갈라|쪼개/i;

function detectLooseCategoryName(lineText, fallbackName) {
    const matched = matchLineItemsClean(lineText);
    if (matched.length > 0) return matched[0].key;
    if (/우삼겹|차돌/.test(lineText)) return '우삼겹·차돌';
    if (/갈비살|늑간|살치|부채|홍두깨|설도|사골|우족|잡뼈|아롱|척갈비/.test(lineText)) return '소고기·기타';
    if (/목전지|볼라/.test(lineText)) return '목전지·전각';
    if (/장족|미니족|족발/.test(lineText)) return '장족·미니족';
    if (/돈피|껍데기|오돌뼈|덜미|덧살|민찌|모돈|왕구이/.test(lineText)) return '부산물·특수부위';
    if (/테니쉬|데니쉬|두메코|올리멜|토레인|바텔|고원돈|셀렉타|수입/.test(lineText)) return '수입돈육';
    return fallbackName || '기타품목';
}

function getFilteredLooseEntries() {
    const orders = getFilteredOrderList(true);
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

                entries.push({
                    entryKey,
                    clientName: ord.clientName,
                    sender: formatSenderShortName(ord.sender),
                    timeStr: ord.timeStr,
                    delivShort: ord.delivShort,
                    category: catName,
                    lineText: line,
                    isWork: hasWork,
                    vCode,
                    vLabel,
                    isDone: Boolean(looseDoneMap[entryKey])
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
    const doneCnt = allEntries.filter(e => e.isDone).length;

    const btnAll = document.getElementById('btnLooseTypeAll');
    const btnWork = document.getElementById('btnLooseTypeWork');
    const btnSimple = document.getElementById('btnLooseTypeSimple');
    if (btnAll) { btnAll.classList.toggle('active', looseTypeFilter === 'ALL'); btnAll.innerText = `전체 (${allEntries.length})`; }
    if (btnWork) { btnWork.classList.toggle('active', looseTypeFilter === 'WORK'); btnWork.innerText = `🔪 작업·세절만 (${workCnt})`; }
    if (btnSimple) { btnSimple.classList.toggle('active', looseTypeFilter === 'SIMPLE'); btnSimple.innerText = `⚖️ 단순 낱개만 (${simpleCnt})`; }

    const btnGC = document.getElementById('btnLooseGroupClient');
    const btnGI = document.getElementById('btnLooseGroupItem');
    const btnGV = document.getElementById('btnLooseGroupVehicle');
    if (btnGC) btnGC.classList.toggle('active', looseGroupMode === 'client');
    if (btnGI) btnGI.classList.toggle('active', looseGroupMode === 'item');
    if (btnGV) btnGV.classList.toggle('active', looseGroupMode === 'vehicle');

    const filtered = allEntries.filter(e => {
        if (looseTypeFilter === 'WORK') return e.isWork;
        if (looseTypeFilter === 'SIMPLE') return !e.isWork;
        return true;
    });

    if (statsEl) {
        statsEl.innerText = `🔪 당일 낱개·작업 목록: 총 ${filtered.length}건 (완료 ${doneCnt}/${allEntries.length}건)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:#6b7280; background:#fff; border-radius:8px; border:1px solid var(--border);">선택하신 기준일에 해당하는 낱개·작업 주문이 없습니다.</div>`;
        return;
    }

    // Group entries by client / item / vehicle
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
        let rowsHtml = '';
        grp.items.forEach(it => {
            const tagHtml = it.isWork
                ? `<span class="loose-tag-work">작업</span>`
                : `<span class="loose-tag-simple">낱개</span>`;
            const prefixLabel = (looseGroupMode !== 'client')
                ? `<b style="color:var(--primary);">[${escapeHtml(it.clientName)}]</b> `
                : '';
            const rowCls = `loose-row ${it.isWork ? 'is-work' : ''} ${it.isDone ? 'is-done' : ''}`;
            rowsHtml += `
                <label class="${rowCls}">
                    <input type="checkbox" ${it.isDone ? 'checked' : ''} onchange="toggleLooseEntryDone('${escapeHtml(it.entryKey)}')">
                    <span>${tagHtml} ${prefixLabel}${escapeHtml(it.lineText)}</span>
                </label>
            `;
        });

        const card = document.createElement('div');
        card.className = 'order-tile-card';
        card.style.borderTopColor = grp.color;
        card.innerHTML = `
            <div class="order-tile-head">
                <div class="order-tile-meta">
                    <span style="font-weight:bold; color:${grp.color};">${escapeHtml(grp.sub)}</span>
                    <span>${doneInGrp}/${grp.items.length} 완료</span>
                </div>
                <div class="order-tile-client">${escapeHtml(grp.title)}</div>
            </div>
            <div class="loose-item-list">${rowsHtml}</div>
        `;
        grid.appendChild(card);
    });
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
        byClient.get(e.clientName).push(`${e.isWork ? '[작업]' : ''}${e.lineText}`);
    });

    const lines = [`[낱개·작업 목록 ${toShortDate(tDate)}]`];
    byClient.forEach((items, cName) => {
        lines.push(`\n${cName}`);
        items.forEach(it => lines.push(`- ${it}`));
    });

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        alert(`카톡용 낱개·작업 목록(${entries.length}건)이 클립보드에 복사되었습니다!`);
    });
}

function downloadLooseCsv() {
    const entries = getFilteredLooseEntries();
    let csv = "\uFEFF납품일,배차차량,거래처명,품목분류,구분,낱개주문내용,완료여부\n";
    entries.forEach(e => {
        const clean = e.lineText.replace(/"/g, '""');
        csv += `"${e.delivShort}","${e.vLabel}","${e.clientName}","${e.category}","${e.isWork ? '작업·세절' : '단순낱개'}","${clean}","${e.isDone ? '완료' : '대기'}"\n`;
    });
    downloadBlob(csv, "미트포앤_당일낱개목록.csv");
}


/* 전역 바인딩 (4_orders_loose.js) */
window.setLooseTypeFilter = setLooseTypeFilter;
window.setLooseGroupMode = setLooseGroupMode;
window.toggleLooseEntryDone = toggleLooseEntryDone;
window.clearLooseChecks = clearLooseChecks;
window.copyKakaoLooseListText = copyKakaoLooseListText;
window.downloadLooseCsv = downloadLooseCsv;
