/* =========================================================================
   6. [페이지 2] 엑셀 재고파악 자동 완성 & 카톡공유용 재고현황 생성 (pds_summary 통합)
   ========================================================================= */
const PDS_DEFAULT_TEMPLATE = [
    // [1열: 삼겹 · 목살류]
    { col: 1, item: "삼겹", supplier: "(대산)", codes: "1564", erpName: "돈삼겹(대산)", suffix: "", type: "standard" },
    { col: 1, item: "삼겹", supplier: "(포크)", codes: "6917", erpName: "돈삼겹f(포크빌리지)", suffix: "", type: "standard" },
    { col: 1, item: "삼겹", supplier: "(정담)", codes: "7046", erpName: "돈삼겹f(정담한돈)", suffix: "", type: "standard" },

    { col: 1, item: "암삼겹", supplier: "(대산)", codes: "1575", erpName: "돈삼겹f(대산)암", suffix: "", type: "standard" },
    { col: 1, item: "암삼겹", supplier: "(포크)", codes: "6918", erpName: "돈삼겹f(포크빌리지)암", suffix: "", type: "standard" },

    { col: 1, item: "특삼겹", supplier: "(대산)", codes: "6627", erpName: "돈삼겹f(특)대산", suffix: "", type: "standard" },
    { col: 1, item: "특삼겹", supplier: "(포크)", codes: "6921", erpName: "돈삼겹f(특)(포크빌리지)", suffix: "", type: "standard" },

    { col: 1, item: "빵삼겹", supplier: "(포크)", codes: "", erpName: "", suffix: "", type: "standard" },

    { col: 1, item: "미삼", supplier: "(대산)", codes: "1572", erpName: "돈미삼(대산)", suffix: "", type: "standard" },
    { col: 1, item: "미삼", supplier: "(포크)", codes: "6919", erpName: "돈미삼(포크)", suffix: "", type: "standard" },
    { col: 1, item: "미삼", supplier: "(정담)", codes: "7047", erpName: "돈미삼(정담한돈)", suffix: "", type: "standard" },

    { col: 1, item: "암미삼", supplier: "(대산)", codes: "1583", erpName: "돈암미삼(대산)", suffix: "", type: "standard" },
    { col: 1, item: "암미삼", supplier: "(포크)", codes: "6920", erpName: "돈암미삼(포크)", suffix: "", type: "standard" },

    { col: 1, item: "특미삼", supplier: "(대산)", codes: "1825", erpName: "돈특미삼(대산)", suffix: "", type: "standard" },
    { col: 1, item: "특미삼", supplier: "(포크)", codes: "6922", erpName: "돈특미삼(포크)", suffix: "", type: "standard" },

    { col: 1, item: "목살", supplier: "(대산)", codes: "1565", erpName: "돈목살(대산)", suffix: "", type: "standard" },
    { col: 1, item: "목살", supplier: "(포크)", codes: "6923", erpName: "돈목살(포크)", suffix: "", type: "standard" },
    { col: 1, item: "목살", supplier: "(정담)", codes: "7048", erpName: "돈목살(정담한돈)", suffix: "", type: "standard" },

    { col: 1, item: "특목살", supplier: "(대산)", codes: "1777", erpName: "돈특목살(대산)", suffix: "", type: "standard" },
    { col: 1, item: "특목살", supplier: "(포크)", codes: "6924", erpName: "돈특목살(포크)", suffix: "", type: "standard" },

    { col: 1, item: "B목살", supplier: "(정담)", codes: "7066", erpName: "돈B목살(정담한돈)", suffix: "", type: "standard" },

    // [2열: 전지 · 갈비 · 등심 · 안심 · 사태 · 앞미사태]
    { col: 2, item: "미전지", supplier: "(대산)", codes: "1573", erpName: "돈미전지(대산)", suffix: "", type: "standard" },
    { col: 2, item: "미전지", supplier: "(포크)", codes: "6925", erpName: "돈미전지(포크)", suffix: "", type: "standard" },
    { col: 2, item: "미전지", supplier: "(정담)", codes: "7050", erpName: "돈미전지(정담한돈)", suffix: "", type: "standard" },

    { col: 2, item: "전지", supplier: "(포크)", codes: "6927", erpName: "돈전지(포크)", suffix: "", type: "standard" },

    { col: 2, item: "지전지", supplier: "(대산)", codes: "", erpName: "", suffix: "", type: "standard" },

    { col: 2, item: "갈비", supplier: "(대산)", codes: "", erpName: "", suffix: "", type: "standard" },
    { col: 2, item: "갈비", supplier: "(포크)", codes: "6928", erpName: "돈갈비(포크)", suffix: "", type: "standard" },

    { col: 2, item: "등갈비", supplier: "(대산)", codes: "", erpName: "", suffix: "", type: "standard" },
    { col: 2, item: "등갈비", supplier: "(포크)", codes: "6929", erpName: "돈등갈비(포크)", suffix: "", type: "standard" },
    { col: 2, item: "등갈비", supplier: "(정담)", codes: "7061", erpName: "돈등갈비(정담한돈)", suffix: "", type: "standard" },

    { col: 2, item: "등심", supplier: "(대산)", codes: "1568", erpName: "돈등심(대산)", suffix: "", type: "standard" },
    { col: 2, item: "등심", supplier: "(포크)", codes: "6931", erpName: "돈등심(포크)", suffix: "", type: "standard" },

    { col: 2, item: "안심", supplier: "(포크)", codes: "6930", erpName: "돈안심(포크)", suffix: "", type: "standard" },

    { col: 2, item: "사태", supplier: "(대산)", codes: "1603", erpName: "돈사태(대산)", suffix: "", type: "standard" },
    { col: 2, item: "사태", supplier: "(포크)", codes: "6932", erpName: "돈사태(포크)", suffix: "", type: "standard" },
    { col: 2, item: "사태", supplier: "(정담)", codes: "7053", erpName: "돈사태(정담한돈)", suffix: "", type: "standard" },

    { col: 2, item: "앞미사태", supplier: "(대산)", codes: "1670", erpName: "돈앞미사태(대산)", suffix: "", type: "standard" },
    { col: 2, item: "앞미사태", supplier: "(포크)", codes: "6933", erpName: "돈앞미사태(포크)", suffix: "", type: "standard" },

    // [3열: 특수부위 · 후지 · 등뼈 · 수입육]
    { col: 3, item: "항정", supplier: "(대산)", codes: "1570", erpName: "돈항정(대산)", suffix: "", type: "standard" },
    { col: 3, item: "항정", supplier: "(포크)", codes: "6934", erpName: "돈항정(포크)", suffix: "", type: "standard" },

    { col: 3, item: "가브리", supplier: "(대산)", codes: "1571", erpName: "돈가브리(대산)", suffix: "", type: "standard" },
    { col: 3, item: "가브리", supplier: "(포크)", codes: "6935", erpName: "돈가브리(포크)", suffix: "", type: "standard" },

    { col: 3, item: "갈매기", supplier: "(대산)", codes: "1569", erpName: "돈갈매기(대산)", suffix: "", type: "standard" },
    { col: 3, item: "갈매기", supplier: "(포크)", codes: "6936", erpName: "돈갈매기(포크)", suffix: "", type: "standard" },
    { col: 3, item: "갈매기", supplier: "(정담)", codes: "7052", erpName: "돈갈매기(정담한돈)", suffix: "", type: "standard" },

    { col: 3, item: "미후지", supplier: "(황금)", codes: "", erpName: "", suffix: "", type: "standard" },
    { col: 3, item: "미후지", supplier: "(정담)", codes: "7059", erpName: "돈미후지(정담한돈)", suffix: "", type: "standard" },

    { col: 3, item: "후지", supplier: "(황금)", codes: "", erpName: "", suffix: "", type: "standard" },
    { col: 3, item: "후지", supplier: "(정담)", codes: "7060", erpName: "돈후지(정담한돈)", suffix: "", type: "standard" },

    { col: 3, item: "등뼈", supplier: "(대산)", codes: "1563", erpName: "돈등뼈(대산)", suffix: "", type: "standard" },
    { col: 3, item: "등뼈", supplier: "(포크)", codes: "6937", erpName: "돈등뼈(포크)", suffix: "", type: "standard" },
    { col: 3, item: "등뼈", supplier: "(정담)", codes: "7054", erpName: "돈등뼈(정담한돈)", suffix: "", type: "standard" },

    { col: 3, item: "토레인 삼겹", supplier: "(토레인)", codes: "1003", erpName: "돈삼겹f(토레인)", suffix: "", type: "standard" },

    { col: 3, item: "냉장 알목심f PR", supplier: "IBP", codes: "4243", erpName: "냉장 알목심f PR", suffix: "", type: "import_block" },
    { col: 3, item: "냉장 살치f PR", supplier: "엑셀", codes: "4775", erpName: "냉장 살치f PR", suffix: "", type: "import_block" },
    { col: 3, item: "냉장 늑간f CH NBP", supplier: "-", codes: "4786", erpName: "냉장 늑간f CH NBP", suffix: "", type: "import_inline" },
    { col: 3, item: "냉장 수입 올리멜 삼겹", supplier: "올리멜", codes: "3086", erpName: "냉장 수입 올리멜 삼겹", suffix: "~12/18", type: "import_inline" },
    { col: 3, item: "냉장 수입 올리멜 목살", supplier: "올리멜", codes: "3124", erpName: "냉장 수입 올리멜 목살", suffix: "~12/18", type: "import_inline" }
];

const PDS_STORAGE_KEY = "vatpda_inventory_mapping_v4";
let pdsTemplateData = pdsLoadMapping();
let pdsLastParsedWorkbook = null;
let pdsInsertAfterIdx = null;
let pdsInitialized = false;

function pdsLoadMapping() {
    try {
        const saved = localStorage.getItem(PDS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return JSON.parse(JSON.stringify(PDS_DEFAULT_TEMPLATE));
}

function pdsSaveMapping() {
    try {
        localStorage.setItem(PDS_STORAGE_KEY, JSON.stringify(pdsTemplateData));
    } catch (e) {}
}

function pdsResetMapping() {
    if (!confirm("상품코드 매핑 설정을 기본값으로 초기화할까요?")) return;
    pdsTemplateData = JSON.parse(JSON.stringify(PDS_DEFAULT_TEMPLATE));
    pdsInsertAfterIdx = null;
    pdsSaveMapping();
    pdsRenderMappingTable();
    pdsReparseCurrent();
    pdsShowToast("기본값으로 초기화되었습니다.");
}

function initPdsExcelPage() {
    if (!pdsInitialized) {
        pdsInitialized = true;
        const dropzone = document.getElementById("pdsDropzone");
        const fileInput = document.getElementById("pdsFileInput");
        if (dropzone && fileInput) {
            dropzone.addEventListener("click", () => fileInput.click());
            dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
            dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
            dropzone.addEventListener("drop", (e) => {
                e.preventDefault();
                dropzone.classList.remove("dragover");
                if (e.dataTransfer.files.length) pdsHandleFile(e.dataTransfer.files[0]);
            });
            fileInput.addEventListener("change", (e) => {
                if (e.target.files.length) pdsHandleFile(e.target.files[0]);
            });
        }
    }
    pdsRenderMappingTable();
    if (pdsLastParsedWorkbook) {
        pdsProcessWorkbook(pdsLastParsedWorkbook);
    } else {
        pdsRenderEmptySummary();
    }
}

function pdsOpenInsertAt(idx) {
    pdsInsertAfterIdx = idx;
    pdsRenderMappingTable();
    setTimeout(() => {
        const el = document.getElementById("pds_new_supplier_input");
        if (el) el.focus();
    }, 20);
}

function pdsCloseInsert() {
    pdsInsertAfterIdx = null;
    pdsRenderMappingTable();
}

function pdsConfirmInsert() {
    const item = document.getElementById("pds_new_item_input").value.trim();
    const supplier = document.getElementById("pds_new_supplier_input").value.trim();
    const codes = document.getElementById("pds_new_codes_input").value.trim();
    const erpName = document.getElementById("pds_new_erp_input").value.trim();
    const suffix = document.getElementById("pds_new_suffix_input").value.trim();
    const col = Number(document.getElementById("pds_new_col_input").value) || 1;
    const type = document.getElementById("pds_new_type_input").value || "standard";

    if (!item) {
        pdsShowToast("품목명을 입력해주세요.");
        document.getElementById("pds_new_item_input").focus();
        return;
    }

    const newEntry = { col, item, supplier, codes, erpName, suffix, type };
    pdsTemplateData.splice(pdsInsertAfterIdx + 1, 0, newEntry);
    pdsInsertAfterIdx = null;
    pdsSaveMapping();
    pdsRenderMappingTable();
    pdsReparseCurrent();
    pdsShowToast(`'${item} ${supplier}' 항목이 추가되었습니다!`);
}

function pdsMoveRow(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= pdsTemplateData.length) return;
    const temp = pdsTemplateData[idx];
    pdsTemplateData[idx] = pdsTemplateData[target];
    pdsTemplateData[target] = temp;
    pdsSaveMapping();
    pdsRenderMappingTable();
    pdsReparseCurrent();
}

function pdsDeleteRow(idx) {
    const row = pdsTemplateData[idx];
    if (!confirm(`'${row.item} ${row.supplier}' 항목을 삭제할까요?`)) return;
    pdsTemplateData.splice(idx, 1);
    if (pdsInsertAfterIdx === idx) pdsInsertAfterIdx = null;
    pdsSaveMapping();
    pdsRenderMappingTable();
    pdsReparseCurrent();
    pdsShowToast("삭제되었습니다.");
}

function pdsCreateInsertEditorRow(afterIdx) {
    const refRow = afterIdx >= 0 && pdsTemplateData[afterIdx]
        ? pdsTemplateData[afterIdx]
        : (pdsTemplateData[0] || { item: "", col: 1, type: "standard" });

    const tr = document.createElement("tr");
    tr.className = "pds-insert-row";
    tr.innerHTML = `
      <td colspan="7">
        <div class="pds-insert-label">➕ 신규 항목 끼워 넣기 (${afterIdx < 0 ? "맨 위" : `'${escapeHtml(refRow.item)} ${escapeHtml(refRow.supplier)}' 바로 아래`})</div>
        <div style="display:grid; grid-template-columns: 1fr 0.9fr 0.95fr 1.2fr 0.75fr 0.65fr 0.85fr auto; gap:4px; align-items:center;">
          <input id="pds_new_item_input" class="pds-tbl-input bold" value="${escapeHtml(refRow.item)}" placeholder="품목 (예: 삼겹)" />
          <input id="pds_new_supplier_input" class="pds-tbl-input" placeholder="메이커 (예: (선진))" />
          <input id="pds_new_codes_input" class="pds-tbl-input" placeholder="상품코드" />
          <input id="pds_new_erp_input" class="pds-tbl-input" placeholder="ERP 상품명 메모" />
          <input id="pds_new_suffix_input" class="pds-tbl-input" placeholder="고정표기" />
          <select id="pds_new_col_input" class="pds-tbl-select">
            <option value="1" ${refRow.col === 1 ? "selected" : ""}>1열</option>
            <option value="2" ${refRow.col === 2 ? "selected" : ""}>2열</option>
            <option value="3" ${refRow.col === 3 ? "selected" : ""}>3열</option>
          </select>
          <select id="pds_new_type_input" class="pds-tbl-select">
            <option value="standard" ${refRow.type === "standard" ? "selected" : ""}>일반형</option>
            <option value="import_block" ${refRow.type === "import_block" ? "selected" : ""}>수입2줄</option>
            <option value="import_inline" ${refRow.type === "import_inline" ? "selected" : ""}>수입1줄</option>
          </select>
          <div style="display:flex; gap:3px;">
            <button type="button" class="btn sm" onclick="pdsConfirmInsert()">추가</button>
            <button type="button" class="btn gray sm" onclick="pdsCloseInsert()">취소</button>
          </div>
        </div>
      </td>
    `;
    tr.querySelectorAll("input").forEach(inp => {
        inp.addEventListener("keydown", (e) => {
            if (e.key === "Enter") pdsConfirmInsert();
            if (e.key === "Escape") pdsCloseInsert();
        });
    });
    return tr;
}

function pdsRenderMappingTable() {
    const tbody = document.getElementById("pdsMappingBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (pdsInsertAfterIdx === -1) {
        tbody.appendChild(pdsCreateInsertEditorRow(-1));
    }

    pdsTemplateData.forEach((row, idx) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><input class="pds-tbl-input bold" value="${escapeHtml(row.item)}" data-idx="${idx}" data-field="item" /></td>
          <td><input class="pds-tbl-input" value="${escapeHtml(row.supplier)}" data-idx="${idx}" data-field="supplier" placeholder="(거래처)" /></td>
          <td><input class="pds-tbl-input" value="${escapeHtml(row.codes)}" data-idx="${idx}" data-field="codes" placeholder="코드" /></td>
          <td><input class="pds-tbl-input" value="${escapeHtml(row.erpName || "")}" data-idx="${idx}" data-field="erpName" placeholder="ERP상품명" /></td>
          <td><input class="pds-tbl-input" value="${escapeHtml(row.suffix)}" data-idx="${idx}" data-field="suffix" placeholder="~12/18" /></td>
          <td>
            <select class="pds-tbl-select" data-idx="${idx}" data-field="col">
              <option value="1" ${row.col === 1 ? "selected" : ""}>1열</option>
              <option value="2" ${row.col === 2 ? "selected" : ""}>2열</option>
              <option value="3" ${row.col === 3 ? "selected" : ""}>3열</option>
            </select>
          </td>
          <td>
            <div class="pds-row-actions">
              <button type="button" class="pds-icon-btn add" title="바로 아래에 추가" onclick="pdsOpenInsertAt(${idx})">+</button>
              <button type="button" class="pds-icon-btn" title="위로" onclick="pdsMoveRow(${idx}, -1)">▲</button>
              <button type="button" class="pds-icon-btn" title="아래로" onclick="pdsMoveRow(${idx}, 1)">▼</button>
              <button type="button" class="pds-icon-btn del" title="삭제" onclick="pdsDeleteRow(${idx})">×</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);

        if (pdsInsertAfterIdx === idx) {
            tbody.appendChild(pdsCreateInsertEditorRow(idx));
        }
    });

    tbody.querySelectorAll("input[data-idx], select[data-idx]").forEach(el => {
        el.addEventListener("change", (e) => {
            const idx = Number(e.target.dataset.idx);
            const field = e.target.dataset.field;
            const val = field === "col" ? Number(e.target.value) : e.target.value.trim();
            pdsTemplateData[idx][field] = val;
            pdsSaveMapping();
            pdsReparseCurrent();
            pdsShowToast("설정이 저장되었습니다.");
        });
    });
}

function pdsHandleFile(file) {
    if (typeof XLSX === "undefined") {
        alert("⚠️ 엑셀 라이브러리(SheetJS)가 로드되지 않았습니다. 인터넷 연결을 확인해주세요.");
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        pdsLastParsedWorkbook = wb;
        pdsProcessWorkbook(wb);
        const badge = document.getElementById("pdsStatusBadge");
        if (badge) badge.textContent = `적용 완료: ${file.name}`;
        recordLastUpdatedTime(`엑셀 재고파악(${file.name})`);
    };
    reader.readAsArrayBuffer(file);
}

function pdsReparseCurrent() {
    if (!pdsLastParsedWorkbook) {
        pdsRenderEmptySummary();
        return;
    }
    pdsProcessWorkbook(pdsLastParsedWorkbook);
}

function pdsExtractDay(row) {
    const trace = String(row.trace || "").trim();
    const mTrace = trace.match(/^L1\d{4}(\d{2})/);
    if (mTrace) return String(parseInt(mTrace[1], 10));

    const mfg = String(row.mfgDate || "").trim();
    const mMfg = mfg.match(/^\d{4}\.\d{2}\.(\d{2})/);
    if (mMfg) return String(parseInt(mMfg[1], 10));

    const buy = String(row.buyDate || "").trim();
    const mBuy = buy.match(/^\d{4}\.\d{2}\.(\d{2})/);
    if (mBuy) return String(parseInt(mBuy[1], 10));

    return "";
}

function pdsAnalyzeRowStock(row) {
    const bBox = Number(row.buyBox) || 0;
    const bKg = Number(row.buyKg) || 0;
    const cBox = Number(row.curBox) || 0;
    const cKg = Number(row.curKg) || 0;

    if (cBox <= 0 && cKg <= 0) return { fullBoxes: 0, hasLoose: false };
    if (cBox === 0 && cKg > 0) return { fullBoxes: 0, hasLoose: true };
    if (bBox > 0 && bKg > 0) {
        const unitBuyKg = bKg / bBox;
        const unitCurKg = cKg / cBox;
        const expectedKg = cBox * unitBuyKg;
        if ((expectedKg - cKg > unitBuyKg * 0.30) && (unitCurKg < unitBuyKg * 0.93)) {
            return { fullBoxes: Math.max(0, cBox - 1), hasLoose: true };
        }
    }
    return { fullBoxes: cBox, hasLoose: false };
}

function pdsMeasureUnits(str) {
    let u = 0;
    for (const ch of str) {
        if (/[가-힣]/.test(ch)) u += 1.0;
        else if (ch === " ") u += 0.35;
        else u += 0.55;
    }
    return u;
}

function pdsMakeIndent(targetUnits, useFullWidth) {
    if (!useFullWidth) return " ".repeat(Math.max(1, Math.round(targetUnits * 2)));
    const full = Math.floor(targetUnits);
    const rem = targetUnits - full;
    const half = Math.round(rem / 0.35);
    return "\u3000".repeat(full) + " ".repeat(half);
}

function pdsFormatItemPrefix(itemName, useFullWidth) {
    const u = pdsMeasureUnits(itemName);
    const targetUnits = 5.7;
    const diff = Math.max(0.35, targetUnits - u);
    return itemName + pdsMakeIndent(diff, useFullWidth);
}

function pdsProcessWorkbook(wb) {
    const sheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    let reportDateTitle = "재고현황";
    for (let i = 0; i < Math.min(10, rows.length); i++) {
        const cellA = String(rows[i][0] || "");
        const mDate = cellA.match(/(\d{1,2})월\s*(\d{1,2})일/);
        if (mDate) {
            reportDateTitle = `${parseInt(mDate[1], 10)}월 ${parseInt(mDate[2], 10)}일 재고현황`;
            break;
        }
    }

    const codeMap = {};
    const allCodesInFile = new Set();

    for (let i = 5; i < rows.length; i++) {
        const r = rows[i];
        if (String(r[0] || "").trim() !== "본점") continue;
        const code = String(r[1] || "").trim();
        if (!code) continue;
        allCodesInFile.add(code);

        const entry = {
            code,
            buyDate: String(r[7] || "").trim(),
            buyBox: Number(r[8]) || 0,
            buyKg: Number(r[9]) || 0,
            curBox: Number(r[10]) || 0,
            curKg: Number(r[11]) || 0,
            trace: String(r[14] || "").trim(),
            mfgDate: String(r[16] || "").trim()
        };
        if (!codeMap[code]) codeMap[code] = [];
        codeMap[code].push(entry);
    }

    const useFullWidth = document.getElementById("pdsKakaoAlignChk")?.checked ?? true;
    const supplierIndent = pdsMakeIndent(5.7, useFullWidth);

    const usedCodes = new Set();
    const lines = [reportDateTitle, ""];
    const summaryRows = [];

    const groupedItems = [];
    pdsTemplateData.forEach(t => {
        const last = groupedItems[groupedItems.length - 1];
        if (last && last.item === t.item && t.type === "standard" && last.type === "standard") {
            last.entries.push(t);
        } else {
            groupedItems.push({ item: t.item, col: t.col, type: t.type, entries: [t] });
        }
    });

    groupedItems.forEach(group => {
        if (group.type === "standard") {
            let firstLineOfItem = true;

            group.entries.forEach((entry, eIdx) => {
                const codes = entry.codes.split(",").map(s => s.trim()).filter(Boolean);
                codes.forEach(c => usedCodes.add(c));

                const rawRows = codes.flatMap(c => codeMap[c] || []);
                const dayItems = pdsGetDaySummaryList(rawRows, entry.suffix);
                const formattedParts = dayItems.map(d => d.text);

                const prefix = firstLineOfItem ? pdsFormatItemPrefix(group.item, useFullWidth) : supplierIndent;
                firstLineOfItem = false;

                const supStr = entry.supplier ? `${entry.supplier} ` : "";
                const subDateIndent = pdsMakeIndent(5.7 + pdsMeasureUnits(supStr), useFullWidth);

                if (formattedParts.length === 0) {
                    lines.push(`${prefix}${supStr}0박${entry.suffix ? " " + entry.suffix : ""}`);
                } else {
                    lines.push(`${prefix}${supStr}${formattedParts[0]}`);
                    for (let k = 1; k < formattedParts.length; k++) {
                        lines.push(`${subDateIndent}${formattedParts[k]}`);
                    }
                }

                summaryRows.push({
                    col: entry.col,
                    item: group.item,
                    rowSpan: eIdx === 0 ? group.entries.length : 0,
                    supplier: entry.supplier,
                    dayItems,
                    rawBox: rawRows.reduce((s, r) => s + r.curBox, 0),
                    rawKg: rawRows.reduce((s, r) => s + r.curKg, 0),
                    suffix: entry.suffix
                });
            });
            lines.push("");
        } else if (group.type === "import_block") {
            const entry = group.entries[0];
            const codes = entry.codes.split(",").map(s => s.trim()).filter(Boolean);
            codes.forEach(c => usedCodes.add(c));
            const rawRows = codes.flatMap(c => codeMap[c] || []);
            const summary = pdsSummarizeImportStock(rawRows);
            const indent = useFullWidth ? "\u3000\u3000" : "    ";
            lines.push(entry.item);
            lines.push(`${indent}${entry.supplier} ${summary.text}${entry.suffix ? " " + entry.suffix : ""}`);
            lines.push("");

            summaryRows.push({
                col: entry.col,
                item: entry.item,
                rowSpan: 1,
                supplier: entry.supplier,
                dayItems: summary.hasStock ? [{ text: `${summary.text}${entry.suffix ? " " + entry.suffix : ""}`, hasLoose: summary.anyLoose }] : [],
                rawBox: rawRows.reduce((s, r) => s + r.curBox, 0),
                rawKg: rawRows.reduce((s, r) => s + r.curKg, 0),
                suffix: entry.suffix
            });
        } else {
            const entry = group.entries[0];
            const codes = entry.codes.split(",").map(s => s.trim()).filter(Boolean);
            codes.forEach(c => usedCodes.add(c));
            const rawRows = codes.flatMap(c => codeMap[c] || []);
            const summary = pdsSummarizeImportStock(rawRows);
            lines.push(`${entry.item} ${summary.text}${entry.suffix ? " " + entry.suffix : ""}`);
            lines.push("");

            summaryRows.push({
                col: entry.col,
                item: entry.item,
                rowSpan: 1,
                supplier: entry.supplier,
                dayItems: summary.hasStock ? [{ text: `${summary.text}${entry.suffix ? " " + entry.suffix : ""}`, hasLoose: summary.anyLoose }] : [],
                rawBox: rawRows.reduce((s, r) => s + r.curBox, 0),
                rawKg: rawRows.reduce((s, r) => s + r.curKg, 0),
                suffix: entry.suffix
            });
        }
    });

    const outEl = document.getElementById("pdsOutput");
    if (outEl) outEl.value = lines.join("\n").trim();
    pdsRenderOnePageTable(summaryRows, `${reportDateTitle} 전체 요약표`);

    const unmapped = [...allCodesInFile].filter(c => !usedCodes.has(c));
    const infoBox = document.getElementById("pdsUnmappedInfo");
    if (infoBox) {
        if (unmapped.length > 0) {
            const chips = unmapped.slice(0, 24).map(c => `<span class="pds-unmapped-chip" onclick="pdsCopyCode('${escapeHtml(c)}')">${escapeHtml(c)}</span>`).join("");
            const extra = unmapped.length > 24 ? ` 외 ${unmapped.length - 24}개` : "";
            infoBox.style.display = "block";
            infoBox.innerHTML = `<b>미매핑 상품코드 (${unmapped.length}개 · 클릭 시 복사):</b><br/>${chips}${extra}`;
        } else {
            infoBox.style.display = "none";
        }
    }
}

function pdsCopyCode(code) {
    navigator.clipboard.writeText(code).then(() => pdsShowToast(`상품코드 '${code}' 복사됨!`));
}

function pdsGetDaySummaryList(rawRows, suffix) {
    if (!rawRows || rawRows.length === 0) return [];
    const byDay = new Map();
    rawRows.forEach(r => {
        const day = pdsExtractDay(r) || "미상";
        const { fullBoxes, hasLoose } = pdsAnalyzeRowStock(r);
        if (!byDay.has(day)) {
            byDay.set(day, { day, fullBoxes: 0, hasLoose: false });
        }
        const acc = byDay.get(day);
        acc.fullBoxes += fullBoxes;
        if (hasLoose) acc.hasLoose = true;
    });

    const results = [];
    byDay.forEach(item => {
        const looseStr = item.hasLoose ? " 낱" : "";
        const dayStr = item.day !== "미상" ? ` ${item.day}` : "";
        const sufStr = suffix ? ` ${suffix}` : "";
        results.push({
            text: `${item.fullBoxes}박${looseStr}${dayStr}${sufStr}`,
            hasLoose: item.hasLoose
        });
    });
    return results;
}

function pdsSummarizeImportStock(rawRows) {
    if (!rawRows || rawRows.length === 0) return { text: "0박", hasStock: false, anyLoose: false };
    let totalFull = 0, anyLoose = false, totalKg = 0;
    rawRows.forEach(r => {
        const { fullBoxes, hasLoose } = pdsAnalyzeRowStock(r);
        totalFull += fullBoxes;
        totalKg += r.curKg;
        if (hasLoose) anyLoose = true;
    });
    return {
        text: `${totalFull}박${anyLoose ? " 낱" : ""}`,
        hasStock: totalFull > 0 || anyLoose || totalKg > 0,
        anyLoose
    };
}

function pdsRenderOnePageTable(summaryRows, titleText) {
    const titleEl = document.getElementById("pdsSheetTitle");
    const grid = document.getElementById("pdsOnepageGrid");
    if (!grid) return;
    if (titleEl) titleEl.textContent = titleText;
    grid.innerHTML = "";

    let activeCount = 0, totalBox = 0, totalKg = 0;
    summaryRows.forEach(r => {
        if (r.dayItems.length > 0 || r.rawBox > 0 || r.rawKg > 0) activeCount++;
        totalBox += r.rawBox;
        totalKg += r.rawKg;
    });

    const elAct = document.getElementById("pdsStatActiveCount");
    const elTot = document.getElementById("pdsStatTotalCount");
    const elBox = document.getElementById("pdsStatTotalBox");
    const elKg = document.getElementById("pdsStatTotalKg");
    if (elAct) elAct.textContent = activeCount;
    if (elTot) elTot.textContent = summaryRows.length;
    if (elBox) elBox.textContent = totalBox.toLocaleString();
    if (elKg) elKg.textContent = totalKg.toFixed(1);

    [1, 2, 3].forEach(colNum => {
        const colRows = summaryRows.filter(r => r.col === colNum);
        const table = document.createElement("table");
        table.className = "pds-summary-tbl";
        table.innerHTML = `
          <thead>
            <tr>
              <th style="width:23%">품목</th>
              <th style="width:17%">거래처</th>
              <th style="width:40%">재고 현황 (박스 / 일자)</th>
              <th style="width:20%">실중량</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");

        colRows.forEach((r, idx) => {
            const tr = document.createElement("tr");
            const hasStock = r.dayItems.length > 0 || r.rawBox > 0 || r.rawKg > 0;
            if (!hasStock) tr.className = "row-zero";

            let span = 0;
            const isPrevSame = idx > 0 && colRows[idx - 1].item === r.item && r.rowSpan !== 1;
            if (!isPrevSame) {
                span = 1;
                if (r.rowSpan !== 1) {
                    while (idx + span < colRows.length && colRows[idx + span].item === r.item && colRows[idx + span].rowSpan !== 1) {
                        span++;
                    }
                }
            }

            const itemTd = span > 0 ? `<td class="col-item" rowspan="${span}">${escapeHtml(r.item)}</td>` : "";
            const stockHtml = r.dayItems.length > 0
                ? r.dayItems.map(d => `<span class="pds-stock-chip ${d.hasLoose ? "loose" : ""}">${escapeHtml(d.text)}</span>`).join("")
                : `<span class="pds-stock-zero">0박${r.suffix ? " " + escapeHtml(r.suffix) : ""}</span>`;
            const kgHtml = hasStock ? `${r.rawBox}박 / ${r.rawKg.toFixed(1)}kg` : "-";

            tr.innerHTML = `
              ${itemTd}
              <td class="col-sup">${escapeHtml(r.supplier || "-")}</td>
              <td class="col-stock">${stockHtml}</td>
              <td class="col-kg">${kgHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        grid.appendChild(table);
    });
}

function pdsRenderEmptySummary() {
    const rows = pdsTemplateData.map(t => ({
        col: t.col,
        item: t.item,
        rowSpan: t.type === "standard" ? 2 : 1,
        supplier: t.supplier,
        dayItems: [],
        rawBox: 0,
        rawKg: 0,
        suffix: t.suffix
    }));
    pdsRenderOnePageTable(rows, "전체 재고 현황 요약표 (한장 보기)");
}

function pdsToggleFullscreen() {
    const sec = document.getElementById("pdsOnePageSection");
    const btn = document.getElementById("pdsFullscreenBtn");
    if (!sec) return;
    const isFull = sec.classList.toggle("fullscreen-mode");
    if (btn) btn.textContent = isFull ? "✖ 전체화면 닫기 (ESC)" : "🖥️ 한장 전체화면 보기";
}

function pdsCopyOutput() {
    const textarea = document.getElementById("pdsOutput");
    if (!textarea || !textarea.value.trim()) {
        pdsShowToast("복사할 내용이 없습니다.");
        return;
    }
    textarea.select();
    navigator.clipboard.writeText(textarea.value).then(() => {
        pdsShowToast("카톡 공유용 재고현황이 복사되었습니다!");
    });
}

function pdsApplyToErpStock() {
    const textarea = document.getElementById("pdsOutput");
    if (!textarea || !textarea.value.trim()) {
        alert("먼저 엑셀 재고 파일을 업로드하여 재고현황 텍스트를 생성해주세요.");
        return;
    }
    const mainStockBox = document.getElementById("stockTextarea");
    if (mainStockBox) {
        mainStockBox.value = textarea.value;
        parseAndApplyStock(false);
        renderStockOrganizationPage();
        renderDiffTable();
        pdsShowToast("✅ 사내 전산재고(재고정리·잔여재고)에 즉시 반영되었습니다!");
    }
}

function pdsShowToast(msg) {
    const t = document.getElementById("pdsToast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
}

/* 전역 바인딩 (6_excel_stock_page.js) */
window.initPdsExcelPage = initPdsExcelPage;
window.pdsOpenInsertAt = pdsOpenInsertAt;
window.pdsCloseInsert = pdsCloseInsert;
window.pdsConfirmInsert = pdsConfirmInsert;
window.pdsMoveRow = pdsMoveRow;
window.pdsDeleteRow = pdsDeleteRow;
window.pdsResetMapping = pdsResetMapping;
window.pdsReparseCurrent = pdsReparseCurrent;
window.pdsCopyCode = pdsCopyCode;
window.pdsToggleFullscreen = pdsToggleFullscreen;
window.pdsCopyOutput = pdsCopyOutput;
window.pdsApplyToErpStock = pdsApplyToErpStock;
