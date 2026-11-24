/* =========================================================================
   9. [페이지 6] 권역·동선 · 냉장창고 4곳 · VWorld 지도 · 6열 기사배차 & 6열 전체배정
   ========================================================================= */
const WAREHOUSE_ORIGIN = { name: "미트포앤 출발거점 (안산 선부·시흥 하상)", lat: 37.3445, lng: 126.8115 };
const VWORLD_API_KEY = "3351CCD7-07E8-40AB-97D0-243A592B74C3";
const VEHICLE_COLORS = ["#be123c", "#b45309", "#047857", "#1d4ed8", "#0369a1", "#6d28d9"];

let geoCache = {};
try { geoCache = JSON.parse(localStorage.getItem('mf_geo_cache') || '{}'); } catch (e) {}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateFallbackCoords(clientName, addr) {
    const s = `${clientName} ${addr}`;
    if (/음성|맹동|충북|진천|청주/.test(s)) return { lat: 36.9380, lng: 127.5350 };
    if (/평택|동삭/.test(s)) return { lat: 37.0150, lng: 127.0950 };
    if (/오산|외삼미|동탄|반송동|병점|진안/.test(s)) return { lat: 37.1850, lng: 127.0750 };
    if (/매송|비봉|태광|유포리|향남/.test(s)) return { lat: 37.2650, lng: 126.9050 };
    if (/의정부|매일정육점/.test(s)) return { lat: 37.7380, lng: 127.0450 };
    if (/구리|프리미엄정육점/.test(s)) return { lat: 37.5940, lng: 127.1300 };
    if (/광진|구의|아차산|정성마트/.test(s)) return { lat: 37.5450, lng: 127.0880 };
    if (/고양|일산|화정|덕양|원신산업|효자축산/.test(s)) return { lat: 37.6580, lng: 126.8320 };
    if (/성남|분당|판교|삼평|대장동|중원|푸른목장|1등축산|아이비유통/.test(s)) return { lat: 37.3940, lng: 127.1110 };
    if (/용인|기흥|공세동|동백|한돈미트|엔마트|주식회사정육점/.test(s)) return { lat: 37.2450, lng: 127.1150 };
    if (/수원|율전|영화동|권선|영통|이의동|차이나|구들장|린이네.*본점/.test(s)) return { lat: 37.2750, lng: 127.0350 };
    if (/의왕|장안중앙|고기바보장안|안양|평촌/.test(s)) return { lat: 37.3450, lng: 126.9680 };
    if (/군포|산본|금정|도마교|부곡동|송정|고기바보부곡|고기바보송정|거시기|돌쇠구이/.test(s)) return { lat: 37.3580, lng: 126.9350 };
    if (/동작|상도|성대/.test(s)) return { lat: 37.5030, lng: 126.9480 };
    if (/관악|봉천|한양봉천|용산|농우축산/.test(s)) return { lat: 37.4820, lng: 126.9520 };
    if (/영등포|양평동|신길동.*래미안|신풍푸줏간|삼대축산/.test(s)) return { lat: 37.5150, lng: 126.9050 };
    if (/금천|가산|시흥동|가리봉|참새방앗간|소문난정육점|대박축산금천|현대축산/.test(s)) return { lat: 37.4650, lng: 126.8950 };
    if (/강서|화곡|하늘소화곡|양천|신정동|대반전/.test(s)) return { lat: 37.5350, lng: 126.8450 };
    if (/광명|철산|소하|하늘소광명|광명꿀|토종축산|안심한우|장군축산|대박마포/.test(s)) return { lat: 37.4780, lng: 126.8660 };
    if (/부천|원미|소사|오정|상동|심곡|역곡|원종|김치왕|하늘소역곡|원대성|맛있는한우/.test(s)) return { lat: 37.4850, lng: 126.8110 };
    if (/부평|십정|일신|산곡|신박축산|막뚱이|형제정육점1호점/.test(s)) return { lat: 37.4950, lng: 126.7150 };
    if (/미추홀|주안|에이스미트주안|인천\s*동구|화평동|횡성.*인천/.test(s)) return { lat: 37.4650, lng: 126.6750 };
    if (/연수|동춘|옥련|오복정육/.test(s)) return { lat: 37.4100, lng: 126.6700 };
    if (/남동|서창|논현|별빛|한우세상|sk축산/i.test(s)) return { lat: 37.4250, lng: 126.7450 };
    if (/대부/.test(s)) return { lat: 37.2450, lng: 126.5850 };
    if (/거모|정왕|배곧|좋은축산|오빠막창|덕이네|까만돼지|전라도|옥이네|찌그러진|장터국밥|두근반|이모네|천하제일/.test(s)) return { lat: 37.3460, lng: 126.7350 };
    if (/신천|은행동|은계|포동|참예소|맛닭꼬치|골목대장|전설은행|도담|한결축산/.test(s)) return { lat: 37.4350, lng: 126.7880 };
    if (/시흥|하상|하중|장곡|능곡|목감|인화|곱창연가|다연|여기식당|청정맛집|오늘은냉삼|국민생고기|얼음막걸리/.test(s)) return { lat: 37.3810, lng: 126.8050 };
    if (/본오|건건|반월|수암|본오농민|삼겹연구소|원산면옥|고기앤장어|으뜸장어|더갈비|상미.*반월|우리축산/.test(s)) return { lat: 37.2980, lng: 126.8620 };
    if (/사동|이동|일동|와동|성포|월피|한마음|오늘은고기다|다온|스타마트|오소돈|한상궁|슈퍼킹|바른|삼사오|예서/.test(s)) return { lat: 37.3180, lng: 126.8350 };
    if (/초지|고잔|새솔|풍년|큐엔씨|농민.*고잔|구워랑/.test(s)) return { lat: 37.3120, lng: 126.8120 };
    if (/선부|신길|삼부자|대패나라|갈비면옥|백봉|횡성본점|사동쌈엔쌈|쌈엔쌈|샛터|신길양평/.test(s)) return { lat: 37.3350, lng: 126.8090 };
    return { lat: 37.3445, lng: 126.8115 };
}

function getCoordsForClient(clientName, addr) {
    const cacheKey = (addr && addr.trim()) ? addr.trim() : clientName;
    if (geoCache[cacheKey]) {
        return { ...geoCache[cacheKey], exact: true };
    }
    const est = estimateFallbackCoords(clientName, addr);
    return { ...est, exact: false };
}

function countOrderBoxesLooseAndItems(orderText) {
    const lines = orderText.split('\n').map(l => l.trim()).filter(Boolean);
    let totalBoxes = 0;
    let totalLoose = 0;
    let itemCount = 0;

    lines.forEach((line, idx) => {
        if (/반품|취소|삭제|빼달|패스/.test(line)) return;
        if (/010-\d{3,4}-\d{4}|안녕하|발주드리려고|부탁드립|부탁해요|보내주세요|보내주세여|이상입니다|감사합니다|주문합니다|주문드립니다|방문예정|들리겠습니다|차차장님|우편함에|넣어주세요|기름 적은거로/.test(line)) {
            if (!MEAT_ANY_REGEX.test(line)) return;
        }
        if (idx === 0 && !/\d+\s*(박스|빡스|박|box|팩|펙|판|봉|덩이|벌|p|k|kg)/i.test(line)) {
            return;
        }

        let s = line;
        s = s.replace(/\(\s*합\s*\d+\s*박스[^\)]*\)/g, ' ');
        s = s.replace(/\([^\)]*(?:일자|판당|사이|정도|만|제외|지우고|포함|재고|행사|할인)[^\)]*\)/g, ' ');
        const parenBoxOverride = s.match(/\(\s*(\d+)\s*박스로?\s*(?:작업)?\s*\)/);
        s = s.replace(/\([^\)]*\)|\[[^\]]*\]/g, ' ');

        s = s.replace(/[+-]?\d{1,3}(?:,\d{3})+(?:원|행사|할인|납)?/g, ' ');
        s = s.replace(/\d+\.\d{3}(?:원)?/g, ' ').replace(/-\d+\s*(?:원|할인|행사)?/g, ' ');
        s = s.replace(/\d+(?:\.\d+)?\s*(?:mm|미리|센치|cm)/gi, ' ');
        s = s.replace(/\d{1,2}\.\d{1,2}일(?:자|자로|재고)?|\d{1,2}월\s*\d{1,2}일(?:자로)?|\d{1,2}\/\d{1,2}|\d{1,2}일(?:자|자로|진|재고|포크|암삼|대산)?/g, ' ');
        s = s.replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*(?:키로|kg)?(?:대|이상)?/gi, ' ');
        s = s.replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ');
        s = s.replace(/(미삼|삼겹|암삼|암미삼|특삼|특미삼)\s*1[5-9]\s*(?:키로|kg)\s+(\d+)/gi, '$1 $2');
        s = s.replace(/\d+호점|1\+\+/g, ' ');

        s = s.replace(/한박스/g, '1박스').replace(/한박/g, '1박').replace(/반박스/g, '0.5박스');
        s = s.replace(/한판/g, '1판').replace(/한덩이/g, '1덩이').replace(/한덩어리/g, '1덩어리');
        s = s.replace(/두마리분/g, '2마리분').replace(/한마리분/g, '1마리분').replace(/한마리반/g, '1마리분');

        if (!MEAT_ANY_REGEX.test(s)) return;
        itemCount++;

        if (parenBoxOverride) {
            totalBoxes += parseInt(parenBoxOverride[1], 10);
            return;
        }

        const boxMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*(?:박스|빡스|박|box|b)(?![a-zA-Z가-힣])/gi)];
        let sRem = s.replace(/\d+(?:\.\d+)?\s*(?:박스|빡스|박|box|b)(?![a-zA-Z가-힣])/gi, ' ');
        const looseMatches = [...sRem.matchAll(/(\d+(?:\.\d+)?)\s*(?:팩|펙|판|봉|봉지|덩이|덩어리|진공|벌|두|마리분|마리|피스|p|개)(?![a-zA-Z가-힣])/gi)];

        if (boxMatches.length > 0 || looseMatches.length > 0) {
            boxMatches.forEach(m => { totalBoxes += parseFloat(m[1]); });
            looseMatches.forEach(m => { totalLoose += parseFloat(m[1]); });
        } else {
            const kgMatches = [...sRem.matchAll(/(\d+(?:\.\d+)?)\s*(?:kg|키로|킬|k)(?![a-zA-Z가-힣])/gi)];
            if (kgMatches.length > 0) {
                totalLoose += kgMatches.length;
            } else {
                const bareNums = [...sRem.matchAll(/(?:^|[^\d.])(\d{1,2})(?!\d)/g)];
                if (bareNums.length > 0) {
                    totalBoxes += parseInt(bareNums[0][1], 10);
                }
            }
        }
    });

    return { boxes: totalBoxes, loose: totalLoose, items: itemCount };
}

function analyzeZoneAndRoute(clientName, addr, orderTextsCombined) {
    const nameAndAddr = `${clientName} ${addr}`;

    if (/포동셀프|셀프정육|착한정육|착한\s*산현/.test(clientName) || /택배|방문\s*예정|찾으러|갖으러\s*온데|가지러\s*오신|들리겠습니다/.test(orderTextsCombined)) {
        return {
            zoneCode: 'PICKUP',
            zoneName: '직접방문/택배',
            subArea: /택배/.test(orderTextsCombined + clientName) ? '택배발송' : '매장방문수령',
            stopOrder: 999,
            color: '#4b5563'
        };
    }

    if (/음성|충북|맹동|진천|청주/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '④ 충북 음성', stopOrder: 140, color: '#be123c' };
    }
    if (/평택|동삭/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '③ 평택 동삭', stopOrder: 130, color: '#be123c' };
    }
    if (/오산|외삼미|동탄|반송동|병점|진안/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '② 병점·동탄·오산', stopOrder: 120, color: '#be123c' };
    }
    if (/매송|비봉|태광|유포리|향남/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '① 화성 매송·비봉', stopOrder: 110, color: '#be123c' };
    }

    if (/동작|상도|성대/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '① 동작 상도(1순위)', stopOrder: 410, color: '#6d28d9' };
    }
    if (/관악|봉천|용산|효창|영등포|양평동|신풍푸줏간/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '② 관악·영등포', stopOrder: 420, color: '#6d28d9' };
    }
    if (/금천|가산|시흥동|시흥대로|가리봉|참새방앗간|소문난정육점|대박축산금천|현대축산/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '③ 금천 가산·시흥동', stopOrder: 430, color: '#6d28d9' };
    }
    if (/광명|철산|소하|하늘소광명|광명꿀|토종축산|안심한우|장군축산|대박마포/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '④ 광명(소하·철산·광명)', stopOrder: 440, color: '#6d28d9' };
    }
    if (/양천|신정동|대반전|강서|화곡|고양|덕양|일산|화정|원신산업|효자축산/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '⑤ 강서·양천·고양', stopOrder: 450, color: '#6d28d9' };
    }

    if (/남동구|서창|논현|별빛|한우세상|sk축산/i.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '① 인천 서창·논현', stopOrder: 310, color: '#0369a1' };
    }
    if (/연수구|동춘|옥련|오복정육|미추홀|주안|에이스미트주안|인천\s*동구|화평동|횡성.*인천/.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '② 연수·주안·동구', stopOrder: 320, color: '#0369a1' };
    }
    if (/부평|십정|일신|산곡|신박축산|막뚱이|형제정육점1호점/.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '③ 인천 부평(일신·산곡)', stopOrder: 330, color: '#0369a1' };
    }
    if (/부천|원미|소사|오정|상동|심곡|역곡|원종|김치왕|하늘소역곡|원대성|맛있는한우/.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '④ 부천(상동·역곡·원종)', stopOrder: 340, color: '#0369a1' };
    }

    if (/군포|산본|금정|도마교|부곡동|송정|고기바보부곡|고기바보송정|거시기|돌쇠구이/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '① 군포(산본·송정·부곡)', stopOrder: 510, color: '#047857' };
    }
    if (/의왕|장안중앙|고기바보장안|안양|평촌/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '② 의왕 장안·안양', stopOrder: 520, color: '#047857' };
    }
    if (/수원|장안구|율전|영화동|권선|영통|이의동|차이나|구들장|린이네.*본점/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '③ 수원(율전·광교·영통)', stopOrder: 530, color: '#047857' };
    }
    if (/용인|기흥|공세동|동백|한돈미트|엔마트|주식회사정육점/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '④ 용인 기흥·동백', stopOrder: 540, color: '#047857' };
    }
    if (/성남|분당|판교|삼평|대장동|중원|푸른목장|1등축산|아이비유통/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '⑤ 성남 판교·분당', stopOrder: 550, color: '#047857' };
    }
    if (/광진|구의|아차산|정성마트|구리|프리미엄정육점|의정부|매일정육점/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '⑥ 광진·구리·의정부', stopOrder: 560, color: '#047857' };
    }

    if (/시흥|하상|하중|장곡|능곡|포동|신천|은행동|은계|거모|정왕|배곧|목감|대부|얼음막걸리/.test(nameAndAddr)) {
        let sub = '② 시흥 신천·은계·포동';
        let seq = 220;
        if (/하상|하중|장곡|능곡|목감|인화|곱창연가|다연|여기식당|청정맛집|오늘은냉삼|국민생고기|얼음막걸리/.test(nameAndAddr)) {
            sub = '① 시흥 하상·하중·장곡'; seq = 210;
        } else if (/거모|정왕|배곧|좋은축산|오빠막창|덕이네|까만돼지|전라도|옥이네|찌그러진|장터국밥|두근반|이모네|천하제일/.test(nameAndAddr)) {
            sub = '③ 시흥 거모·정왕·배곧'; seq = 230;
        } else if (/대부/.test(nameAndAddr)) {
            sub = '④ 안산 대부도'; seq = 240;
        }
        return { zoneCode: 'V1', zoneName: '2권역(시흥·대부)', subArea: sub, stopOrder: seq, color: '#b45309' };
    }

    if (/안산|단원|상록|선부|신길|초지|고잔|와동|성포|월피|사동|이동|일동|본오|건건|반월|수암|새솔|구워랑|대패나라|갈비면옥/.test(nameAndAddr)) {
        let sub = '④ 안산 사동·이동·일동';
        let seq = 640;
        if (/선부|신길|삼부자|대패나라|갈비면옥|백봉|횡성본점|사동쌈엔쌈|쌈엔쌈|샛터|신길양평/.test(nameAndAddr)) {
            sub = '① 안산 선부·신길'; seq = 610;
        } else if (/초지|고잔|새솔|풍년|큐엔씨|농민.*고잔|구워랑/.test(nameAndAddr)) {
            sub = '② 안산 초지·고잔·새솔'; seq = 620;
        } else if (/와동|성포|월피|농민.*와동|스타마트|다온마트/.test(nameAndAddr)) {
            sub = '③ 안산 와동·성포·월피'; seq = 630;
        } else if (/본오|건건|반월|수암|본오농민|삼겹연구소|원산면옥|고기앤장어|으뜸장어|더갈비|상미.*반월|우리축산/.test(nameAndAddr)) {
            sub = '⑤ 안산 본오·건건·수암'; seq = 650;
        }
        return { zoneCode: 'V3', zoneName: '1권역(안산 단원·상록)', subArea: sub, stopOrder: seq, color: '#1d4ed8' };
    }

    return { zoneCode: 'V3', zoneName: '기타/미분류권역', subArea: '주소확인필요', stopOrder: 900, color: '#6b7280' };
}

function renderVehicleConfigInputs() {
    const grid = document.getElementById('vehicleConfigGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const div = document.createElement('div');
        div.className = 'vehicle-config-item';
        div.innerHTML = `
            <span>🚚 ${i + 1}호차 기사/권역</span>
            <input type="text" value="${escapeHtml(vehicleNames[i])}" onchange="updateVehicleName(${i}, this.value)">
        `;
        grid.appendChild(div);
    }
}

function updateVehicleName(idx, newVal) {
    vehicleNames[idx] = newVal.trim() || `${idx + 1}호차`;
    localStorage.setItem('mf_vehicles', JSON.stringify(vehicleNames));
    recordLastUpdatedTime('차량 기사명 변경');
    renderDispatchPage();
}

/* 냉장창고 4곳 설정 렌더링 및 제어 */
function renderColdStorageInputs() {
    const grid = document.getElementById('coldStorageGrid');
    if (!grid) return;
    grid.innerHTML = '';

    coldStorages.forEach((cs, idx) => {
        let opts = `<option value="NONE" ${cs.assigned === 'NONE' ? 'selected' : ''}>경유안함</option>`;
        for (let v = 0; v < 6; v++) {
            const code = `V${v}`;
            opts += `<option value="${code}" ${cs.assigned === code ? 'selected' : ''}>${v + 1}호차</option>`;
        }
        const card = document.createElement('div');
        card.className = 'cs-slot-card';
        card.innerHTML = `
            <div class="cs-slot-top">
                <input type="text" value="${escapeHtml(cs.name)}" placeholder="냉장창고 ${idx + 1}" onchange="updateColdStorage(${idx}, 'name', this.value)" title="냉장창고 이름">
                <select onchange="updateColdStorage(${idx}, 'assigned', this.value)" title="경유할 차량 선택">
                    ${opts}
                </select>
            </div>
            <input type="text" class="cs-slot-addr" value="${escapeHtml(cs.addr)}" placeholder="주소 입력 (지도 표시용)" onchange="updateColdStorage(${idx}, 'addr', this.value)">
        `;
        grid.appendChild(card);
    });
}

function updateColdStorage(idx, field, val) {
    if (!coldStorages[idx]) return;
    coldStorages[idx][field] = val.trim();
    localStorage.setItem('mf_cold_storages', JSON.stringify(coldStorages));
    recordLastUpdatedTime('냉장창고 경유 설정 변경');
    renderDispatchPage();
}

function getAggregatedDeliveryDestinations() {
    const orders = getFilteredOrderList(true);
    const destMap = new Map();

    orders.forEach(ord => {
        const key = ord.clientName;
        if (!destMap.has(key)) {
            destMap.set(key, {
                clientName: key,
                officialName: ord.clientObj ? ord.clientObj.name : key,
                addr: ord.clientObj ? ord.clientObj.addr : '',
                phone: ord.clientObj ? ord.clientObj.phone : '',
                note: ord.clientObj ? ord.clientObj.note : '',
                totalBoxes: 0,
                totalLoose: 0,
                itemCount: 0,
                isUrgent: false,
                rawContents: []
            });
        }
        const entry = destMap.get(key);
        const ordText = ord.displayContent || ord.content;
        const cnt = countOrderBoxesLooseAndItems(ordText);
        entry.totalBoxes += cnt.boxes;
        entry.totalLoose += cnt.loose;
        entry.itemCount += cnt.items;
        entry.rawContents.push(ordText);
        if (/급|일찍|오전|10시|11시/.test(ord.content)) entry.isUrgent = true;
    });

    const destList = Array.from(destMap.values());
    destList.forEach(d => {
        const routeInfo = analyzeZoneAndRoute(d.clientName, d.addr, d.rawContents.join('\n'));
        d.zoneCode = routeInfo.zoneCode;
        d.zoneName = routeInfo.zoneName;
        d.subArea = routeInfo.subArea;
        d.stopOrder = routeInfo.stopOrder;
        d.zoneColor = routeInfo.color;

        const coords = getCoordsForClient(d.clientName, d.addr);
        d.lat = coords.lat;
        d.lng = coords.lng;
        d.isExactCoord = coords.exact;
        d.distKm = haversineKm(WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng, d.lat, d.lng);

        if (!dispatchMap[d.clientName]) {
            dispatchMap[d.clientName] = d.zoneCode;
        }
    });

    return destList;
}

function autoDispatchByZoneAndRoute(showAlert) {
    const destinations = getAggregatedDeliveryDestinations();
    destinations.forEach(d => {
        dispatchMap[d.clientName] = d.zoneCode;
    });
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    recordLastUpdatedTime('권역·동선별 스마트 자동배차');
    renderDispatchPage();
    if (showAlert) {
        alert(`✅ 총 ${destinations.length}개 납품처가 6대 권역 및 최적 이동 동선 순서로 자동 배차되었습니다!`);
    }
}

function resetCurrentDispatch() {
    if (!confirm('현재 지정된 배차 내역을 모두 미배차 상태로 초기화할까요?')) return;
    const destinations = getAggregatedDeliveryDestinations();
    destinations.forEach(d => {
        dispatchMap[d.clientName] = 'UNASSIGNED';
    });
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    renderDispatchPage();
}

function setDispatchSortMode(mode) {
    dispatchSortMode = mode;
    localStorage.setItem('mf_dispatch_sort', mode);
    renderDispatchPage();
}

function toggleAddressDrawer(drawerId, lat, lng, label) {
    const el = document.getElementById(drawerId);
    if (el) {
        el.classList.toggle('open');
    }
    if (vworldMapInstance && lat && lng) {
        vworldMapInstance.setView([lat, lng], 14);
    }
}

function renderDispatchPage() {
    const destinations = getAggregatedDeliveryDestinations();
    const driverGrid = document.getElementById('driverSixColGrid');
    const allDestGrid = document.getElementById('allDestSixGrid');
    const pickupBadge = document.getElementById('pickupSummaryBadge');
    const allCountInfo = document.getElementById('allDestCountInfo');
    if (!driverGrid || !allDestGrid) return;

    driverGrid.innerHTML = '';
    allDestGrid.innerHTML = '';

    // 1. 상단: 기사별 배차 거래처 목록 (6열 바둑판: 거래처 이름만 + 옆에 [📍주소] 버튼)
    const pickupList = destinations.filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === 'PICKUP');
    const unassignedList = destinations.filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === 'UNASSIGNED');
    if (pickupBadge) {
        pickupBadge.innerText = `📦 직접방문/택배: ${pickupList.length}곳 | ⚠️ 미배차: ${unassignedList.length}곳`;
    }

    for (let i = 0; i < 6; i++) {
        const vCode = `V${i}`;
        const vColor = VEHICLE_COLORS[i];

        // 해당 호차에 배정된 일반 거래처 (동선 순서 정렬)
        const vStops = destinations
            .filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === vCode)
            .sort((a, b) => a.stopOrder - b.stopOrder || a.distKm - b.distKm);

        // 해당 호차에 배정된 냉장창고
        const vColdStorages = coldStorages.filter(cs => cs.assigned === vCode && cs.name.trim());

        const totBox = vStops.reduce((acc, x) => acc + x.totalBoxes, 0);
        const totLoose = vStops.reduce((acc, x) => acc + x.totalLoose, 0);

        let rowsHtml = '';
        let seq = 0;

        // 냉장창고 먼저/함께 표기
        vColdStorages.forEach((cs, cIdx) => {
            seq++;
            const csCoords = getCoordsForClient(cs.name, cs.addr);
            const drawerId = `drv_cs_${vCode}_${cIdx}`;
            rowsHtml += `
                <div class="driver-client-row is-cold">
                    <div class="driver-client-main">
                        <span class="driver-client-name">
                            <b style="color:#0e7490;">#${seq}</b> ❄️ ${escapeHtml(cs.name)}
                        </span>
                        <button type="button" class="addr-toggle-btn" onclick="toggleAddressDrawer('${drawerId}', ${csCoords.lat}, ${csCoords.lng}, '${escapeHtml(cs.name)}')">📍주소</button>
                    </div>
                    <div id="${drawerId}" class="addr-drawer">
                        📍 ${escapeHtml(cs.addr || '주소 미입력')}
                    </div>
                </div>
            `;
        });

        // 배차된 거래처 (거래처 이름만 + 옆에 [📍주소] 버튼)
        vStops.forEach((d, sIdx) => {
            seq++;
            const drawerId = `drv_st_${vCode}_${sIdx}`;
            const urgentMark = d.isUrgent ? `<span style="color:#dc2626; font-weight:bold;">⚡</span>` : '';
            rowsHtml += `
                <div class="driver-client-row" style="border-left-color:${vColor};">
                    <div class="driver-client-main">
                        <span class="driver-client-name">
                            <b style="color:${vColor};">#${seq}</b> ${urgentMark}${escapeHtml(d.clientName)}
                        </span>
                        <button type="button" class="addr-toggle-btn" onclick="toggleAddressDrawer('${drawerId}', ${d.lat}, ${d.lng}, '${escapeHtml(d.clientName)}')">📍주소</button>
                    </div>
                    <div id="${drawerId}" class="addr-drawer">
                        <div>📍 ${escapeHtml(d.addr || '주소 미등록 (clients.csv 로드 필요)')}</div>
                        ${d.phone ? `<div>📞 ${escapeHtml(d.phone)}</div>` : ''}
                        ${d.note ? `<div style="color:#b45309; font-weight:bold;">🔑 ${escapeHtml(d.note)}</div>` : ''}
                        <div style="color:#047857; font-weight:bold; margin-top:2px;">📦 ${d.totalBoxes}박 / 낱개 ${d.totalLoose} (${d.distKm.toFixed(1)}km)</div>
                    </div>
                </div>
            `;
        });

        if (seq === 0) {
            rowsHtml = `<div style="text-align:center; padding:14px 4px; color:#9ca3af; font-size:10.5px;">배차 없음</div>`;
        }

        const colCard = document.createElement('div');
        colCard.className = 'driver-col-card';
        colCard.innerHTML = `
            <div class="driver-col-head" style="background:${vColor};">
                <div class="driver-col-title" title="${escapeHtml(vehicleNames[i])}">${escapeHtml(vehicleNames[i])}</div>
                <div class="driver-col-stat">${vStops.length}곳${vColdStorages.length > 0 ? `+냉창${vColdStorages.length}` : ''} · 📦${totBox}박/낱${totLoose}</div>
            </div>
            <div class="driver-col-body">${rowsHtml}</div>
        `;
        driverGrid.appendChild(colCard);
    }

    // 2. 하단: 전체 배송처별 기사 배정 (6열 바둑판 + 3가지 정렬: 가나다순 / 시점부터 먼거리순 / 품목많은 순)
    const btnName = document.getElementById('btnSortName');
    const btnDist = document.getElementById('btnSortDist');
    const btnItems = document.getElementById('btnSortItems');
    if (btnName) btnName.classList.toggle('active', dispatchSortMode === 'name');
    if (btnDist) btnDist.classList.toggle('active', dispatchSortMode === 'distance');
    if (btnItems) btnItems.classList.toggle('active', dispatchSortMode === 'items');

    const sortedAll = [...destinations];
    if (dispatchSortMode === 'name') {
        sortedAll.sort((a, b) => a.clientName.localeCompare(b.clientName, 'ko'));
    } else if (dispatchSortMode === 'distance') {
        sortedAll.sort((a, b) => b.distKm - a.distKm || a.clientName.localeCompare(b.clientName, 'ko'));
    } else if (dispatchSortMode === 'items') {
        sortedAll.sort((a, b) => {
            const scoreA = a.itemCount * 100 + a.totalBoxes * 10 + a.totalLoose;
            const scoreB = b.itemCount * 100 + b.totalBoxes * 10 + b.totalLoose;
            return scoreB - scoreA || a.clientName.localeCompare(b.clientName, 'ko');
        });
    }

    if (allCountInfo) {
        allCountInfo.innerText = `(총 ${sortedAll.length}곳 · 1~6호차 버튼 클릭 즉시 배정)`;
    }

    if (sortedAll.length === 0) {
        allDestGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:#888; background:#fff; border-radius:8px; border:1px solid var(--border);">조건에 해당하는 당일 배송처가 없습니다.</div>`;
    } else {
        sortedAll.forEach((d, idx) => {
            const curVal = dispatchMap[d.clientName] || 'UNASSIGNED';
            const drawerId = `all_dest_addr_${idx}`;
            let topColor = '#64748b';
            if (curVal.startsWith('V')) {
                const vIdx = parseInt(curVal.substring(1), 10);
                topColor = VEHICLE_COLORS[vIdx] || '#1f4e79';
            } else if (curVal === 'PICKUP') {
                topColor = '#374151';
            }

            let quickBtnsHtml = '';
            for (let v = 0; v < 6; v++) {
                const code = `V${v}`;
                const isAct = curVal === code ? 'active' : '';
                quickBtnsHtml += `<button type="button" class="qv-btn ${isAct}" onclick="assignVehicle('${escapeHtml(d.clientName)}', '${code}')" title="${escapeHtml(vehicleNames[v])}">${v + 1}</button>`;
            }
            quickBtnsHtml += `<button type="button" class="qv-btn pickup ${curVal === 'PICKUP' ? 'active' : ''}" onclick="assignVehicle('${escapeHtml(d.clientName)}', 'PICKUP')" title="직접방문/택배">방문</button>`;

            const card = document.createElement('div');
            card.className = 'dest-assign-card';
            card.style.borderTopColor = topColor;
            card.innerHTML = `
                <div class="dest-assign-top">
                    <span class="dest-assign-title">${escapeHtml(d.clientName)}</span>
                    <button type="button" class="addr-toggle-btn" onclick="toggleAddressDrawer('${drawerId}', ${d.lat}, ${d.lng}, '${escapeHtml(d.clientName)}')">📍주소</button>
                </div>
                <div class="dest-assign-meta">
                    <span>📏 <b>${d.distKm.toFixed(1)}km</b></span>
                    <span>📦<b>${d.totalBoxes}박</b>/낱<b>${d.totalLoose}</b> (${d.itemCount}품목)</span>
                </div>
                <div id="${drawerId}" class="addr-drawer">
                    <div>📍 ${escapeHtml(d.addr || '주소 미등록')}</div>
                    ${d.phone ? `<div>📞 ${escapeHtml(d.phone)}</div>` : ''}
                    ${d.note ? `<div style="color:#b45309; font-weight:bold;">🔑 ${escapeHtml(d.note)}</div>` : ''}
                </div>
                <div class="quick-v-btns">${quickBtnsHtml}</div>
            `;
            allDestGrid.appendChild(card);
        });
    }

    refreshVworldMapMarkers(destinations);
}

function assignVehicle(clientName, vCode) {
    dispatchMap[clientName] = vCode;
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    recordLastUpdatedTime(`${clientName} 배차 지정`);
    renderDispatchPage();
}

function downloadDispatchCsv() {
    const destinations = getAggregatedDeliveryDestinations();
    let csv = "\uFEFF차량동선순번,배차차량,구분,납품거래처명,정식상호,거리(km),주소,연락처,출입비번/비고,박스수,낱개수\n";
    for (let i = 0; i < 6; i++) {
        const vCode = `V${i}`;
        const vLabel = vehicleNames[i];
        let seq = 0;
        coldStorages.filter(cs => cs.assigned === vCode && cs.name.trim()).forEach(cs => {
            seq++;
            csv += `"#${seq}","${vLabel}","냉장창고","${cs.name}","${cs.name}","","${cs.addr}","","",0,0\n`;
        });
        destinations
            .filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === vCode)
            .sort((a, b) => a.stopOrder - b.stopOrder || a.distKm - b.distKm)
            .forEach(d => {
                seq++;
                csv += `"#${seq}","${vLabel}","일반거래처","${d.clientName}","${d.officialName}",${d.distKm.toFixed(1)},"${d.addr}","${d.phone}","${d.note}",${d.totalBoxes},${d.totalLoose}\n`;
            });
    }
    destinations.filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === 'PICKUP').forEach((d, idx) => {
        csv += `"#방문${idx + 1}","직접방문/택배","방문/택배","${d.clientName}","${d.officialName}",${d.distKm.toFixed(1)},"${d.addr}","${d.phone}","${d.note}",${d.totalBoxes},${d.totalLoose}\n`;
    });
    downloadBlob(csv, "미트포앤_권역동선별_배차목록.csv");
}

/* =========================================================================
   10. VWorld WMTS 지도 & JSONP Geocoding 엔진
   ========================================================================= */
let vworldMapInstance = null;
let vworldBaseLayer = null;
let vworldSatLayer = null;
let vworldHybridLayer = null;
let osmFallbackLayer = null;
let mapLayerGroup = null;
let isSatelliteMode = false;
let isMapCollapsed = false;

function initVworldMap() {
    const mapEl = document.getElementById('vworldMapCanvas');
    if (!mapEl || typeof L === 'undefined') return;

    if (!vworldMapInstance) {
        vworldMapInstance = L.map('vworldMapCanvas', {
            center: [WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng],
            zoom: 11
        });

        vworldBaseLayer = L.tileLayer(
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
            { maxZoom: 19, attribution: '&copy; VWorld 국토교통부' }
        );
        vworldSatLayer = L.tileLayer(
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
            { maxZoom: 19, attribution: '&copy; VWorld Satellite' }
        );
        vworldHybridLayer = L.tileLayer(
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`,
            { maxZoom: 19 }
        );
        osmFallbackLayer = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { maxZoom: 19, attribution: '&copy; OpenStreetMap' }
        );

        let vworldErrorCount = 0;
        vworldBaseLayer.on('tileerror', () => {
            vworldErrorCount++;
            if (vworldErrorCount >= 4 && !vworldMapInstance.hasLayer(osmFallbackLayer)) {
                vworldMapInstance.addLayer(osmFallbackLayer);
            }
        });

        vworldBaseLayer.addTo(vworldMapInstance);
        mapLayerGroup = L.layerGroup().addTo(vworldMapInstance);
    }

    setTimeout(() => {
        if (vworldMapInstance) {
            vworldMapInstance.invalidateSize();
            refreshVworldMapMarkers();
        }
    }, 150);
}

function toggleVworldSatellite() {
    if (!vworldMapInstance) initVworldMap();
    if (!vworldMapInstance) return;

    isSatelliteMode = !isSatelliteMode;
    const btn = document.getElementById('btnToggleSatMap');
    if (isSatelliteMode) {
        vworldMapInstance.removeLayer(vworldBaseLayer);
        vworldSatLayer.addTo(vworldMapInstance);
        vworldHybridLayer.addTo(vworldMapInstance);
        if (btn) btn.innerText = '🗺️ 일반지도 전환';
    } else {
        vworldMapInstance.removeLayer(vworldSatLayer);
        vworldMapInstance.removeLayer(vworldHybridLayer);
        vworldBaseLayer.addTo(vworldMapInstance);
        if (btn) btn.innerText = '🛰️ 위성지도 전환';
    }
}

function toggleMapCollapse() {
    const mapEl = document.getElementById('vworldMapCanvas');
    const btn = document.getElementById('btnToggleMapCollapse');
    if (!mapEl) return;

    isMapCollapsed = !isMapCollapsed;
    mapEl.classList.toggle('collapsed', isMapCollapsed);
    if (btn) btn.innerText = isMapCollapsed ? '🔼 지도 펼치기' : '🔽 지도 접기';
    if (!isMapCollapsed && vworldMapInstance) {
        setTimeout(() => vworldMapInstance.invalidateSize(), 150);
    }
}

function refreshVworldMapMarkers(precomputedDests) {
    if (!vworldMapInstance || !mapLayerGroup) return;
    mapLayerGroup.clearLayers();

    const destinations = precomputedDests || getAggregatedDeliveryDestinations();
    const filterVal = (document.getElementById('mapVehicleFilter') || {}).value || 'ALL';

    // 출발 거점 마커
    const originIcon = L.divIcon({
        className: '',
        html: `<div style="background:#111827; color:#fde68a; border:2px solid #fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.4);">🏭</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
    L.marker([WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng], { icon: originIcon })
        .bindPopup(`<b>${WAREHOUSE_ORIGIN.name}</b>`)
        .addTo(mapLayerGroup);

    const bounds = [[WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng]];

    for (let i = 0; i < 6; i++) {
        const vCode = `V${i}`;
        if (filterVal !== 'ALL' && filterVal !== vCode) continue;

        const vColor = VEHICLE_COLORS[i];
        const routePts = [[WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng]];
        let seq = 0;

        // 냉장창고 핀
        coldStorages.filter(cs => cs.assigned === vCode && cs.name.trim()).forEach(cs => {
            seq++;
            const cPos = getCoordsForClient(cs.name, cs.addr);
            routePts.push([cPos.lat, cPos.lng]);
            bounds.push([cPos.lat, cPos.lng]);

            const csIcon = L.divIcon({
                className: '',
                html: `<div style="background:#0891b2; color:#fff; border:2px solid #fff; border-radius:6px; padding:1px 5px; font-size:10px; font-weight:bold; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.35);">❄️${i + 1}-${seq} ${escapeHtml(cs.name)}</div>`,
                iconAnchor: [20, 12]
            });
            L.marker([cPos.lat, cPos.lng], { icon: csIcon })
                .bindPopup(`<b>[${i + 1}호차 #${seq} 경유] ❄️ ${escapeHtml(cs.name)}</b><br>${escapeHtml(cs.addr || '')}`)
                .addTo(mapLayerGroup);
        });

        // 일반 거래처 핀
        const vStops = destinations
            .filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === vCode)
            .sort((a, b) => a.stopOrder - b.stopOrder || a.distKm - b.distKm);

        vStops.forEach(d => {
            seq++;
            routePts.push([d.lat, d.lng]);
            bounds.push([d.lat, d.lng]);

            const pinIcon = L.divIcon({
                className: '',
                html: `<div style="background:${vColor}; color:#fff; border:2px solid #fff; border-radius:12px; padding:1px 6px; font-size:10.5px; font-weight:bold; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.35);">${i + 1}-${seq} ${escapeHtml(d.clientName)}</div>`,
                iconAnchor: [22, 12]
            });
            L.marker([d.lat, d.lng], { icon: pinIcon })
                .bindPopup(`<b>[${escapeHtml(vehicleNames[i])} #${seq}] ${escapeHtml(d.clientName)}</b><br>📍 ${escapeHtml(d.addr || '주소 미등록')}<br>📦 ${d.totalBoxes}박 / 낱개 ${d.totalLoose} (${d.distKm.toFixed(1)}km)`)
                .addTo(mapLayerGroup);
        });

        if (routePts.length > 1) {
            L.polyline(routePts, { color: vColor, weight: 3, opacity: 0.75, dashArray: '6, 4' }).addTo(mapLayerGroup);
        }
    }

    if (bounds.length > 1) {
        vworldMapInstance.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    }
}

function geocodeSingleAddressJsonp(address, type) {
    return new Promise((resolve) => {
        const cbName = 'vworld_cb_' + Math.random().toString(36).substring(2, 10);
        const script = document.createElement('script');
        const timer = setTimeout(() => {
            delete window[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(null);
        }, 5000);

        window[cbName] = function(data) {
            clearTimeout(timer);
            delete window[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
            try {
                if (data && data.response && data.response.status === 'OK') {
                    const pt = data.response.result.point;
                    resolve({ lat: parseFloat(pt.y), lng: parseFloat(pt.x) });
                    return;
                }
            } catch (e) {}
            resolve(null);
        };

        const cleanAddr = address.split(',')[0].split('(')[0].trim();
        script.src = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(cleanAddr)}&refine=true&simple=false&format=json&type=${type}&key=${VWORLD_API_KEY}&callback=${cbName}`;
        document.body.appendChild(script);
    });
}

async function geocodeMissingDestinations() {
    const statusEl = document.getElementById('mapGeoStatus');
    const destinations = getAggregatedDeliveryDestinations();
    const targets = destinations.filter(d => d.addr && !geoCache[d.addr.trim()]);

    if (targets.length === 0) {
        if (statusEl) statusEl.innerText = '✅ 모든 등록 주소가 좌표 변환 완료되었습니다!';
        refreshVworldMapMarkers(destinations);
        return;
    }

    let converted = 0;
    for (let i = 0; i < targets.length; i++) {
        const d = targets[i];
        if (statusEl) statusEl.innerText = `⏳ VWorld 좌표 변환 중... (${i + 1}/${targets.length}) ${d.clientName}`;
        let pt = await geocodeSingleAddressJsonp(d.addr, 'ROAD');
        if (!pt) pt = await geocodeSingleAddressJsonp(d.addr, 'PARCEL');
        if (pt) {
            geoCache[d.addr.trim()] = pt;
            converted++;
        }
    }

    localStorage.setItem('mf_geo_cache', JSON.stringify(geoCache));
    if (statusEl) statusEl.innerText = `✅ VWorld 좌표 변환 완료 (${converted}건 신규 반영)`;
    renderDispatchPage();
}


/* 전역 바인딩 (7_dispatch_map.js) */
window.updateVehicleName = updateVehicleName;
window.updateColdStorage = updateColdStorage;
window.autoDispatchByZoneAndRoute = autoDispatchByZoneAndRoute;
window.resetCurrentDispatch = resetCurrentDispatch;
window.setDispatchSortMode = setDispatchSortMode;
window.toggleAddressDrawer = toggleAddressDrawer;
window.assignVehicle = assignVehicle;
window.downloadDispatchCsv = downloadDispatchCsv;
window.initVworldMap = initVworldMap;
window.toggleVworldSatellite = toggleVworldSatellite;
window.toggleMapCollapse = toggleMapCollapse;
window.refreshVworldMapMarkers = refreshVworldMapMarkers;
window.geocodeMissingDestinations = geocodeMissingDestinations;
