/* =========================================================================
   2. 거래처 CSV 파싱 및 병합 매칭 로직
   ========================================================================= */
function loadClientCsvFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        if (text.includes('\ufffd')) {
            const r2 = new FileReader();
            r2.onload = ev => processClientCsvText(ev.target.result, false);
            r2.readAsText(file, 'euc-kr');
        } else {
            processClientCsvText(text, false);
        }
    };
    reader.readAsText(file, 'utf-8');
}

async function loadCsvFromGithub() {
    const url = document.getElementById('githubCsvUrl').value.trim();
    if (!url) { alert('GitHub Raw CSV URL을 입력해주세요.'); return; }
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('네트워크 오류');
        const buf = await res.arrayBuffer();
        let text = new TextDecoder('utf-8').decode(buf);
        if (text.includes('\ufffd')) text = new TextDecoder('euc-kr').decode(buf);
        processClientCsvText(text, false);
    } catch (err) {
        alert('GitHub CSV를 불러오지 못했습니다. Raw URL인지 확인해주세요.');
    }
}

function parseCsvLine(line) {
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
        else cur += ch;
    }
    result.push(cur.trim());
    return result;
}

function upsertClientRecord(rec) {
    const idx = clientDB.findIndex(c => c.name === rec.name);
    if (idx >= 0) {
        const mergedAliases = [...new Set([...(clientDB[idx].alias || []), ...(rec.alias || [])])];
        clientDB[idx] = {
            name: rec.name,
            ceo: rec.ceo || clientDB[idx].ceo || '',
            phone: rec.phone || clientDB[idx].phone || '',
            addr: rec.addr || clientDB[idx].addr || '',
            alias: mergedAliases,
            note: rec.note || clientDB[idx].note || ''
        };
    } else {
        clientDB.push(rec);
    }
}

function processClientCsvText(csvText, isSilentAutoLoad) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return;

    const headerCols = parseCsvLine(lines[0]);
    cleanedCsvRowsForExport = [];
    let addedCount = 0;

    if (headerCols[0].includes('거래처') && headerCols.some(h => h.includes('별명'))) {
        for (let i = 1; i < lines.length; i++) {
            const c = parseCsvLine(lines[i]);
            if (!c[0]) continue;
            const aliases = c[4] ? c[4].split('|').map(s => s.trim()).filter(Boolean) : [c[0]];
            upsertClientRecord({ name: c[0], ceo: c[1]||'', phone: c[2]||'', addr: c[3]||'', alias: aliases, note: c[5]||'' });
            cleanedCsvRowsForExport.push([c[0], c[1]||'', c[2]||'', c[3]||'', aliases.join('|'), c[5]||'']);
            addedCount++;
        }
    } else {
        for (let i = 2; i < lines.length; i += 2) {
            const row1 = parseCsvLine(lines[i]);
            const row2 = (i + 1 < lines.length) ? parseCsvLine(lines[i + 1]) : [];
            const rawName = (row1[0] || '').trim();
            if (!rawName || rawName.includes('폐업') || rawName.includes('거래종료') || rawName.startsWith('X') || rawName.startsWith('x')) continue;

            const ceo = (row1[1] || '').trim();
            const phone = (row1[3] || '').trim();
            const addr = (row1[4] || '').trim();
            const note = (row2[4] || '').trim();

            const cleanAlias = rawName.replace(/\(주\)|주식회사|출고안됨/g, '').replace(/\(.*?\)/g, '').trim();
            const aliases = [rawName];
            if (cleanAlias && cleanAlias !== rawName) aliases.push(cleanAlias);

            upsertClientRecord({ name: rawName, ceo, phone, addr, alias: aliases, note });
            cleanedCsvRowsForExport.push([rawName, ceo, phone, addr, aliases.join('|'), note]);
            addedCount++;
        }
    }

    document.getElementById('clientLoadMsg').innerText = `✅ 거래처 ${addedCount}건 병합 완료! (총 ${clientDB.length}개 활성 거래처)`;
    document.getElementById('btnExportCleanCsv').style.display = 'inline-block';
    if (allChatItems.length > 0) {
        allChatItems.forEach((item, idx) => {
            item.idx = idx;
            classifyChatItem(item);
        });
        inferDeliveryDatesForAllItems();
        onFilterCriteriaChange(isSilentAutoLoad);
    }
}

function exportCleanedClientsCsv() {
    let csv = "\uFEFF거래처,대표자,전화번호,주소,별명,비고\n";
    cleanedCsvRowsForExport.forEach(r => {
        csv += r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + "\n";
    });
    downloadBlob(csv, "clients.csv");
}

function getSortedAliasPairs() {
    const pairs = [];
    for (const c of clientDB) {
        for (const al of (c.alias || [c.name])) {
            if (al && al.replace(/\s+/g, '').length >= 2) {
                pairs.push({ alias: al, official: c.name, clientObj: c });
            }
        }
    }
    pairs.sort((a, b) => b.alias.length - a.alias.length);
    return pairs;
}

function matchClientFromText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { matched: false, clientName: "미확인", officialName: "미확인", clientObj: null };

    const candidateLines = lines.slice(0, 2);
    const sortedPairs = getSortedAliasPairs();

    for (const rawLine of candidateLines) {
        const cleanLine = rawLine.replace(/^(전달:\s*|■+|●+|\*+|내일\s+|오늘\s+|월요일\s+|화요일예약\s+|수요일예약\s+|목요일\s+|금요일\s+)/g, '').trim();
        const lineNoSpace = cleanLine.replace(/\s+/g, '').toLowerCase();

        for (const p of sortedPairs) {
            const alNoSpace = p.alias.replace(/\s+/g, '').toLowerCase();
            if (lineNoSpace.startsWith(alNoSpace) || cleanLine.includes(p.alias)) {
                const pos = lineNoSpace.indexOf(alNoSpace);
                if (pos === 0) {
                    const rem = lineNoSpace.slice(alNoSpace.length);
                    if (/^(보다|쪽|에서|한테|꺼|가는|방면)/.test(rem)) continue;
                }
                return { matched: true, clientName: p.alias, officialName: p.official, clientObj: p.clientObj };
            }
        }
    }

    const firstLine = lines[0].replace(/[●■]/g, ' ').trim();
    const firstToken = firstLine.split(/[\s\.\,\~]/)[0];
    if (/정육|마트|축산|푸드|식당|갈비|감자탕|해장국|면옥|한우|삼겹|소매|택배|주물럭|쌈밥|막창|장어|꼬치|국밥/.test(firstLine)) {
        return { matched: true, clientName: firstToken, officialName: firstToken, clientObj: null };
    }
    return { matched: false, clientName: firstToken || "미확인", officialName: firstToken || "미확인", clientObj: null };
}

/* =========================================================================
   3. 계근 판별기 + 다중 거래처 합본 분할 + 카카오톡 파싱 + 스마트 납품일 판별
   ========================================================================= */
const MEAT_START_REGEX = /^(?:국내산|수입|냉장|냉동|한돈|한우|암퇘지|스페인|독일|미국산|호주산|칠레산|브라질|캐나다|테니쉬|데니쉬|두메코|올리멜|토레인|셀렉타|바텔|고원돈|티스|프레칸|프례칸|씨와이푸드|삼겹|목살|목심|미전지|전지|미삼|암삼|특삼|빵삼|등갈비|등뼈|목뼈|갈비|등심|안심|사태|앞사태|앞미사태|뒷사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|살치|부채|장족|앞장족|미니족|돈피|껍데기|잡육|등잡|왕구이|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|알목심|미추리|잡뼈|우족|덧살|덜미|민찌|수삼|모돈|엘에이|LA|백립|빽립|프렌치렉|숄더렉|삼각살|척갈비|아롱사태|스켄전지|스키너전지|지방전지|목전지|A지방|B지방|돼지)/i;
const MEAT_ANY_REGEX = /삼겹|목살|목심|미전지|전지|미삼|암삼|특삼|빵삼|특목|냉삼|대패|등갈비|등뼈|목뼈|갈비|등심|안심|사태|앞사태|앞미사태|뒷사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|LA|엘에이|살치|부채|토시|안창|장족|미니족|껍데기|돈피|잡육|등잡|왕구이|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|토레인|바텔|고원돈|티스|프레칸|목전지|덧살|덜미|민찌|수삼|모돈|백립|빽립|프렌치렉|숄더렉|삼각살|척갈비|아롱사태/i;

function isWeighinMessage(txt) {
    if (/발주할게요|주문합니다|반품잡아서/.test(txt)) return false;

    const cleanW = txt
        .replace(/010-\d{3,4}-\d{4}|\d{10,11}/g, '')
        .replace(/\d{1,3},\d{3}\s*원?/g, '')
        .replace(/\d+\.\d{3}\s*원?/g, '')
        .replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?/g, '')
        .replace(/\d+\.\d+\s*(?:센치|cm|mm|미리|톤|키로|kg|k|작업|일자|일)/gi, '')
        .replace(/작업\s*\d+\.\d+/g, '')
        .replace(/\d{1,2}\.\d{1,2}일(?:자|자로|재고)?/g, '')
        .replace(/[a-zA-Z]+\d+|\d+[a-zA-Z]+/g, '')
        .replace(/\d+\s*(?:동|호|번지|층|시|구|읍|면|로|길)/g, '')
        .replace(/202\d년?/g, '')
        .replace(/(?:비번|비밀번호)\s*\d+/g, '')
        .replace(/\d{4}[*#]|8846별표|18079/g, '');

    const decMatches = cleanW.match(/\d+\.\d+/g) || [];
    if (decMatches.length >= 2) return true;
    if (decMatches.length >= 1 && /(?<!\d)\d{1,2}(?:대|포|개|각|도누|도누리)|(?<!\d)\d{2}(?:정담|황금)/.test(cleanW)) {
        return true;
    }

    const fourDigits = cleanW.match(/(?:^|[^\d])[1-3]\d{3}(?:$|[^\d])/g) || [];
    if (fourDigits.length >= 2) return true;
    if (/(?:^|[^\d])\d{3}\s+[1-3]\d{3}(?:$|[^\d])/.test(cleanW)) return true;

    return false;
}

function detectClientHeaderInLine(rawLine, sortedPairs) {
    const clean = rawLine.replace(/^(전달:\s*|■+|●+|\*+|내일\s+|오늘\s+|월요일\s+|화요일예약\s+|수요일예약\s+|목요일\s+|금요일\s+)/g, '').trim();
    if (!clean) return null;

    if (/^(삼호점|심곡동|주소|연락처|받는분|보내는|키는|비번|비밀번호|계근지|반품|패스|삭제)/.test(clean)) {
        return null;
    }
    if (MEAT_START_REGEX.test(clean)) {
        return null;
    }
    if (/부탁|감사|수고|죄송|이상입니다|보내주|입고|배송|전표|팀장님|사장님|과장님|부장님|대표님|기사님|꺼로|만요/.test(clean)) {
        if (!(MEAT_ANY_REGEX.test(clean) && /\d/.test(clean))) {
            return null;
        }
    }

    const noSpace = clean.replace(/\s+/g, '').toLowerCase();
    for (const p of sortedPairs) {
        const alNs = p.alias.replace(/\s+/g, '').toLowerCase();
        if (noSpace.startsWith(alNs)) {
            const rem = noSpace.slice(alNs.length);
            if (/^(보다|쪽|에서|한테|꺼|가는|방면|은|는|이|가|을|를|에|와|과|하고|이랑|도|점|시|구|동|로|길|정육팀장)/.test(rem)) {
                continue;
            }
            const isCorrection = /이거로\s*정정/.test(clean);
            return { alias: p.alias, official: p.official, isCorrection };
        }
    }
    return null;
}

function splitMultiOrderMessage(content) {
    const txt = String(content || '').trim();
    if (!txt) return [txt];

    if (['재고현황', '발주체크', '단가표', '분류전', '나눌꺼요', '정정해두었습니다'].some(k => txt.includes(k))) {
        return [txt];
    }
    if (/\(대산\)\s*\d+박|\(포크\)\s*\d+박/.test(txt)) {
        return [txt];
    }
    if (isWeighinMessage(txt)) {
        return [txt];
    }

    const sortedPairs = getSortedAliasPairs();
    const lines = txt.split('\n');
    const headers = [];
    let hasMeatSincePrev = false;

    lines.forEach((line, idx) => {
        const s = line.trim();
        if (!s) return;
        const hit = detectClientHeaderInLine(s, sortedPairs);
        if (hit) {
            if (headers.length === 0 || hasMeatSincePrev) {
                headers.push({ idx, alias: hit.alias, official: hit.official, isCorrection: hit.isCorrection });
                hasMeatSincePrev = Boolean(MEAT_ANY_REGEX.test(s) && /\d/.test(s));
                return;
            }
        }
        if (MEAT_ANY_REGEX.test(s)) {
            hasMeatSincePrev = true;
        }
    });

    const distinctOfficials = [...new Set(headers.map(h => h.official))];
    if (distinctOfficials.length < 2) {
        return [txt];
    }

    const leadingLines = lines.slice(0, headers[0].idx).map(l => l.trim()).filter(Boolean);
    let leadingPrefix = '';
    if (leadingLines.length > 0 && leadingLines.some(l => /내일|낼|[월화수목금토일]요일|\d{1,2}\/\d{1,2}|\d{1,2}월\s*\d{1,2}일/.test(l))) {
        leadingPrefix = leadingLines.join('\n') + '\n';
    }

    const chunks = [];
    for (let i = 0; i < headers.length; i++) {
        const startIdx = headers[i].idx;
        const endIdx = (i + 1 < headers.length) ? headers[i + 1].idx : lines.length;
        const chunkLines = lines.slice(startIdx, endIdx)
            .map(l => l.trim())
            .filter(l => l && !/^[-─=]{3,}$/.test(l));
        let chunkText = chunkLines.join('\n').trim();
        if (i > 0 && !(MEAT_ANY_REGEX.test(chunkText) && /\d/.test(chunkText))) {
            chunks[chunks.length - 1] += '\n' + chunkText;
            continue;
        }
        if (leadingPrefix) {
            chunkText = leadingPrefix + chunkText;
        }
        if (i + 1 < headers.length && headers[i + 1].isCorrection) {
            chunkText += '\n(정정취소됨)';
        }
        chunks.push(chunkText);
    }
    return chunks.length > 1 ? chunks : [txt];
}

function pushParsedMessageWithSplit(baseItem) {
    if (!baseItem) return;
    const chunks = splitMultiOrderMessage(baseItem.content);
    chunks.forEach((chunkTxt, cIdx) => {
        const subItem = {
            dateFull: baseItem.dateFull,
            dateShort: baseItem.dateShort,
            timeStr: baseItem.timeStr,
            timeMins: baseItem.timeMins,
            sender: baseItem.sender,
            content: chunkTxt,
            splitIndex: chunks.length > 1 ? (cIdx + 1) : 0,
            splitTotal: chunks.length > 1 ? chunks.length : 0
        };
        classifyChatItem(subItem);
        allChatItems.push(subItem);
    });
}

async function loadKakaoFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    allChatItems = [];
    for (let i = 0; i < files.length; i++) {
        const text = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = e => res(e.target.result);
            r.onerror = rej;
            r.readAsText(files[i], 'utf-8');
        });
        parseSingleKakaoText(text);
    }

    allChatItems.sort((a, b) => {
        if (a.dateFull !== b.dateFull) return a.dateFull.localeCompare(b.dateFull);
        return a.timeMins - b.timeMins;
    });

    allChatItems.forEach((item, idx) => { item.idx = idx; });
    inferDeliveryDatesForAllItems();

    if (allChatItems.length > 0) {
        const lastDate = allChatItems[allChatItems.length - 1].dateFull;
        document.getElementById('orderTargetDate').value = lastDate;
    }

    const orderCnt = allChatItems.filter(x => x.type === '발주').length;
    const weightCnt = allChatItems.filter(x => x.type === '계근').length;
    document.getElementById('kakaoLoadMsg').innerText = `✅ 총 ${allChatItems.length}건 분석 및 납품일 자동판별 완료! (순수발주 ${orderCnt}건 / 계근 ${weightCnt}건 분리됨)`;

    saveStateToBrowser('카톡 대화 파일 업로드');
    onFilterCriteriaChange(true);
}

function parseSingleKakaoText(text) {
    const normalized = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    let currentDateFull = "2026-10-13";
    let currentDisplayDate = "10/13";

    const pcRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s+(오전|오후)\s*(\d{1,2}:\d{2}),\s*(.*?)\s*:\s*(.*)$/;
    const mobRegex = /^\[(.*?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*(.*)$/;
    const dateLineRegex = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;

    let curItem = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('---') && line.includes('년')) {
            const dm = line.match(dateLineRegex);
            if (dm) {
                currentDateFull = `${dm[1]}-${String(dm[2]).padStart(2,'0')}-${String(dm[3]).padStart(2,'0')}`;
                currentDisplayDate = `${String(dm[2]).padStart(2,'0')}/${String(dm[3]).padStart(2,'0')}`;
            }
            continue;
        }

        if (/^\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s+(오전|오후)\s*\d{1,2}:\d{2}$/.test(line) || line.includes('초대했습니다')) {
            continue;
        }

        const mPc = line.match(pcRegex);
        if (mPc) {
            if (curItem) { pushParsedMessageWithSplit(curItem); }
            const y = mPc[1], m = String(mPc[2]).padStart(2,'0'), d = String(mPc[3]).padStart(2,'0');
            currentDateFull = `${y}-${m}-${d}`;
            currentDisplayDate = `${m}/${d}`;
            const timeInfo = convertAmPmTime(mPc[4], mPc[5]);
            curItem = {
                dateFull: currentDateFull,
                dateShort: currentDisplayDate,
                timeStr: timeInfo.str,
                timeMins: timeInfo.mins,
                sender: mPc[6].trim(),
                content: mPc[7]
            };
            continue;
        }

        const mMob = line.match(mobRegex);
        if (mMob) {
            if (curItem) { pushParsedMessageWithSplit(curItem); }
            const timeInfo = convertAmPmTime(mMob[2], mMob[3]);
            curItem = {
                dateFull: currentDateFull,
                dateShort: currentDisplayDate,
                timeStr: timeInfo.str,
                timeMins: timeInfo.mins,
                sender: mMob[1].trim(),
                content: mMob[4]
            };
            continue;
        }

        if (curItem && !line.includes('카카오톡 대화') && !line.includes('저장한 날짜') && !line.includes('삭제되었습니다')) {
            curItem.content += "\n" + line;
        }
    }
    if (curItem) { pushParsedMessageWithSplit(curItem); }
}

function convertAmPmTime(ampm, hmStr) {
    const parts = hmStr.split(':');
    let h = parseInt(parts[0], 10) || 0;
    let m = parseInt(parts[1], 10) || 0;
    if (ampm === '오후' && h < 12) h += 12;
    if (ampm === '오전' && h === 12) h = 0;
    return {
        mins: h * 60 + m,
        str: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    };
}

function classifyChatItem(item) {
    const txt = item.content.trim();
    const clientMatch = matchClientFromText(txt);
    item.clientName = clientMatch.clientName;
    item.officialName = clientMatch.officialName || clientMatch.clientName;
    item.isKnownClient = clientMatch.matched;
    item.clientObj = clientMatch.clientObj;
    item.itemKey = `${item.dateFull}_${item.timeStr}_${item.clientName}_${txt.substring(0, 18).replace(/\s+/g, '')}`;
    item.displayContent = txt;
    item.mergedAddCount = 0;

    const ignoreKw = [
        '사진', '삭제되었습니다', '재고현황', '발주체크', '분류전', '입금', '반품장',
        '여기까지', '팩스 보냈습니다', '코드 잡았습니다', '원가내역',
        '자동차검사', '타이어', '어떤거 주문하신걸까요', '어떤걸로 할까요', '기존 재고 늑간',
        '정정 해두었습니다', '정정취소됨', '복사해서 했었는데', '그냥 박스로주시죠', '인사요',
        '참고바랍니다', '출고하면 없으니', '상호 바뀐거 수정', '상호변경'
    ];
    if (ignoreKw.some(k => txt.includes(k))) {
        item.type = '기타';
        item.baseType = '기타';
        return;
    }
    if (/\(대산\)\s*\d+박|\(포크\)\s*\d+박|나눌꺼요/.test(txt)) {
        item.type = '기타';
        item.baseType = '기타';
        return;
    }
    if (isWeighinMessage(txt)) {
        item.type = '계근';
        item.baseType = '계근';
        return;
    }

    const validLines = txt.split('\n').filter(l => !/전체단가표요|단가표요/.test(l));
    const txtClean = validLines.join('\n').replace(/팩스/g, '').trim();

    if (MEAT_ANY_REGEX.test(txtClean) || /박스|팩|판|키로|kg|덩이|봉/i.test(txtClean)) {
        if (/납품$|반품$|교환인가요|패스래요|패스요|바꿔달래요|보내야죠|갖고감요|뿐이 안됨|두메코입니다|인가요\?$/.test(txtClean)) {
            if (!(/(?:삭제|취소|빼달)/.test(txtClean) && MEAT_ANY_REGEX.test(txtClean))) {
                item.type = '기타';
                item.baseType = '기타';
                return;
            }
        }
        if (txtClean.length <= 15 && !/\d/.test(txtClean)) {
            item.type = '기타';
            item.baseType = '기타';
            return;
        }
        item.type = '발주';
        item.baseType = '발주';
        return;
    }

    item.type = '기타';
    item.baseType = '기타';
}

function addDaysToDateStr(dateFullStr, days) {
    const dt = new Date(dateFullStr + "T00:00:00");
    dt.setDate(dt.getDate() + days);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function toShortDate(dateFullStr) {
    if (!dateFullStr || dateFullStr.length < 10) return dateFullStr;
    return `${dateFullStr.substring(5, 7)}/${dateFullStr.substring(8, 10)}`;
}

function buildOrderDuplicateSignature(item) {
    const lines = item.content.split('\n').map(l => l.trim()).filter(Boolean);
    // 첫 줄이 거래처명만 있는 경우 제외하고 품목/메모 본문만 정규화
    let bodyLines = lines;
    if (lines.length > 1 && !MEAT_ANY_REGEX.test(lines[0]) && !/\d/.test(lines[0])) {
        bodyLines = lines.slice(1);
    }
    const normBody = bodyLines.join('')
        .replace(/^(?:월|화|수|목|금|토|일)요일\s*발주\.?/g, '')
        .replace(/[\s\.\,\-\ㅡ●■\*]/g, '')
        .toLowerCase();
    return `${item.officialName}|${item.targetDeliveryDate}|${normBody}`;
}

function extractAdditionBody(content, clientName) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';

    const first = lines[0];
    let remFirst = first
        .replace(/[●■\*]+\s*(?:더|또)?\s*추가(?:발주|주문|요|할께요)?/g, '')
        .replace(/^(?:추가발주|추가주문|추가요|추가)\s*/g, '')
        .trim();

    const outLines = [];
    if (MEAT_ANY_REGEX.test(remFirst) || /\d/.test(remFirst)) {
        const cleanClient = (clientName || '').replace(/\s+/g, '');
        if (cleanClient && remFirst.replace(/\s+/g, '').toLowerCase().startsWith(cleanClient.toLowerCase())) {
            remFirst = remFirst.replace(new RegExp('^' + clientName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*') + '\\s*', 'i'), '').trim();
        }
        if (remFirst) outLines.push(remFirst);
    }
    outLines.push(...lines.slice(1));
    return outLines.join('\n').trim();
}

/* =========================================================================
   스마트 납품일(targetDeliveryDate) 자동 추론 + 중복발주 제거 + ●추가 자동병합 엔진
   ========================================================================= */
const JS_WEEKDAY_MAP = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

function inferDeliveryDatesForAllItems() {
    // 0. 재계산 시 기존 분류/병합 상태 초기화
    for (let i = 0; i < allChatItems.length; i++) {
        const it = allChatItems[i];
        if (it.baseType) it.type = it.baseType;
        it.displayContent = it.content;
        it.mergedAddCount = 0;
    }

    for (let i = 0; i < allChatItems.length; i++) {
        const item = allChatItems[i];
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
        const msgDt = new Date(item.dateFull + "T00:00:00");
        const msgWd = msgDt.getDay();

        const mDate = txt.match(/(\d{1,2})\/(\d{1,2})\s*\([월화수목금토일]\)|(\d{1,2})월\s*(\d{1,2})일\s*(?:자로|이월)/);
        if (mDate) {
            const mo = String(mDate[1] || mDate[3]).padStart(2, '0');
            const da = String(mDate[2] || mDate[4]).padStart(2, '0');
            item.targetDeliveryDate = `${msgDt.getFullYear()}-${mo}-${da}`;
            item.delivShort = `${mo}/${da}`;
            item.delivReason = `명시날짜(${mo}/${da})`;
            continue;
        }

        const mWd = txt.match(/(?:^|[^내금당명월화수목토일])(월|화|수|목|금|토|일)(?:요일|욜|주문=|발주분)|^\s*(월|화|수|목|금|토|일)\s*$/m);
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

        if (/내일|낼주문|(?:^|[^가-힣])낼(?:$|[^가-힣])|아침에\s*(?:들리|갖을러|가지러)|오전\s*급\s*배송|10시\s*전에/.test(txt)) {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '익일키워드(내일)';
            continue;
        }

        if (/오늘|당일|금일|지금\s*(?:가|갖|가지러)|조금\s*있다|퇴근\s*(?:길|때|하면서|시)|오후에|방문\s*예정|\d{1,2}시\s*(?:반\s*)?쯤?\s*(?:온데|방문|찾으러|들린데|갖으러)|즉납|전표\s*하나\s*바로|제\s*코스에서|엄과장님\s*편에/.test(txt)) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '당일키워드(오늘/방문)';
            continue;
        }

        const token = item.clientName.replace(/\s+/g, '').substring(0, 3);
        let weighedSameDay = false;
        if (token.length >= 2) {
            for (let j = i + 1; j < allChatItems.length; j++) {
                const nxt = allChatItems[j];
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

        if (msgWd === 0) {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '일요일→월요일';
            continue;
        }

        if (mins < 12 * 60) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '정오전→당일';
        } else {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '정오후→익일';
        }
    }

    // 1단계 후처리: '●이거로 정정요'가 있으면 같은 거래처·같은 납품일의 직전 주문을 대체(기타) 처리
    for (let i = 0; i < allChatItems.length; i++) {
        const cur = allChatItems[i];
        if (cur.type === '발주' && /이거로\s*정정/.test(cur.content)) {
            for (let p = 0; p < i; p++) {
                const prev = allChatItems[p];
                if (prev.type === '발주' && prev.officialName === cur.officialName && prev.targetDeliveryDate === cur.targetDeliveryDate) {
                    prev.type = '기타';
                    prev.delivReason = '정정대체됨';
                }
            }
        }
    }

    // 2단계 후처리: 동일 거래처·동일 납품일·동일 본문 중복 재발송 자동 제거 (예: 전날 예약발주 + 다음날 14시 동일문자)
    const seenOrderSigs = new Set();
    for (let i = 0; i < allChatItems.length; i++) {
        const cur = allChatItems[i];
        if (cur.type !== '발주') continue;
        const isAddMsg = /(?:●\s*(?:더|또)?\s*추가|추가발주|추가주문|추가요|추가할께요)/.test(cur.content);
        if (isAddMsg) continue;

        const sig = buildOrderDuplicateSignature(cur);
        if (seenOrderSigs.has(sig)) {
            cur.type = '기타';
            cur.delivReason = '중복발주제외';
        } else {
            seenOrderSigs.add(sig);
        }
    }

    // 3단계 후처리: '●추가' 발주는 같은 거래처·같은 납품일의 기존 발주 카드에 품목만 병합
    for (let i = 0; i < allChatItems.length; i++) {
        const cur = allChatItems[i];
        if (cur.type !== '발주') continue;
        const isAddMsg = /(?:●\s*(?:더|또)?\s*추가|추가발주|추가주문|추가요|추가할께요)/.test(cur.content);
        if (!isAddMsg) continue;

        // 같은 거래처 + 같은 납품일의 기존 발주 찾기
        let baseOrder = null;
        for (let p = 0; p < i; p++) {
            const prev = allChatItems[p];
            if (prev.type === '발주' && prev.officialName === cur.officialName && prev.targetDeliveryDate === cur.targetDeliveryDate) {
                baseOrder = prev;
                break;
            }
        }

        if (baseOrder) {
            const addedBody = extractAdditionBody(cur.content, cur.clientName);
            if (addedBody) {
                baseOrder.displayContent = `${baseOrder.displayContent}\n[+${cur.timeStr} 추가] ${addedBody}`;
                baseOrder.mergedAddCount = (baseOrder.mergedAddCount || 0) + 1;
            }
            cur.type = '기타';
            cur.delivReason = '기존발주에 병합됨';
        }
    }
}

function toggleItemDeliveryDate(itemIdx) {
    const item = allChatItems[itemIdx];
    if (!item || item.type !== '발주') return;

    const sameDay = item.dateFull;
    const nextDay = addDaysToDateStr(item.dateFull, 1);

    const newTarget = (item.targetDeliveryDate === sameDay) ? nextDay : sameDay;
    manualDelivMap[item.itemKey] = newTarget;
    localStorage.setItem('mf_manual_deliv_dates', JSON.stringify(manualDelivMap));

    inferDeliveryDatesForAllItems();
    recordLastUpdatedTime(`${item.clientName} 납품일 수동변경(${toShortDate(newTarget)})`);
    onFilterCriteriaChange(true);
}


/* 전역 바인딩 (3_kakao_parser.js) */
window.loadClientCsvFile = loadClientCsvFile;
window.loadCsvFromGithub = loadCsvFromGithub;
window.exportCleanedClientsCsv = exportCleanedClientsCsv;
window.loadKakaoFiles = loadKakaoFiles;
window.toggleItemDeliveryDate = toggleItemDeliveryDate;
