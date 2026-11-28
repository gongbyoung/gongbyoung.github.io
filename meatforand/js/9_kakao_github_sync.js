/* =========================================================================
   9. GitHub Private 저장소 카톡 자동 불러오기 플러그인
      - 대상 저장소: my-github-id/kakao-alarm-log (data/kakao-logs.json)
      - 기존 meatforand(1~8번 스크립트) 코드를 수정하지 않고 1단계 화면에 자동 연결됩니다.
      - 토큰은 코드에 저장되지 않으며, 본인 기기 브라우저(localStorage)에만 보관됩니다.
   ========================================================================= */

(function () {
  const GH_CONFIG = {
    owner: "my-github-id",
    repo: "kakao-alarm-log",
    branch: "main",
    dataPath: "data/kakao-logs.json"
  };

  const TOKEN_KEY = "meatforand_gh_private_token_v1";

  function toKstKakaoLine(entry) {
    const d = new Date(entry.receivedAt);
    if (isNaN(d.getTime())) return null;
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const y = kst.getUTCFullYear();
    const m = kst.getUTCMonth() + 1;
    const day = kst.getUTCDate();
    const h24 = kst.getUTCHours();
    const min = String(kst.getUTCMinutes()).padStart(2, "0");
    const ampm = h24 >= 12 ? "오후" : "오전";
    let h12 = h24 % 12;
    if (h12 === 0) h12 = 12;

    const safeSender = String(entry.sender || entry.room || "발신자")
      .replace(/[:\r\n]/g, " ")
      .trim();
    const safeMsg = String(entry.message || "").replace(/\r\n/g, "\n").trim();
    if (!safeMsg) return null;

    return {
      ts: d.getTime(),
      text: y + "년 " + m + "월 " + day + "일 " + ampm + " " + h12 + ":" + min + ", " + safeSender + " : " + safeMsg
    };
  }

  function injectPrivateSyncPanel() {
    if (document.getElementById("ghPrivateSyncBox")) return;
    const fileInput = document.getElementById("kakaoFileInput");
    if (!fileInput) return;
    const uploadZone = fileInput.closest(".upload-zone");
    if (!uploadZone || !uploadZone.parentNode) return;

    const savedToken = (() => {
      try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
    })();

    const box = document.createElement("div");
    box.id = "ghPrivateSyncBox";
    box.style.cssText =
      "margin-top:10px; padding:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;";

    box.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:8px;">' +
        '<b style="color:#1f4e79; font-size:13px;">🔄 GitHub Private 카톡 자동 불러오기 (' + GH_CONFIG.owner + '/' + GH_CONFIG.repo + ')</b>' +
        '<span id="ghSyncStatus" style="font-size:11.5px; color:#64748b;">' + (savedToken ? '토큰 저장됨' : '최초 1회 토큰 입력 필요') + '</span>' +
      '</div>' +
      '<div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">' +
        '<input id="ghPrivateTokenInput" type="password" placeholder="GitHub 토큰 (github_pat_...)" value="' + savedToken.replace(/"/g, "&quot;") + '" style="flex:1; min-width:180px; padding:7px 9px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px;" />' +
        '<select id="ghSyncDaysSelect" style="padding:7px 8px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; background:#fff;">' +
          '<option value="2" selected>최근 2일 (추천)</option>' +
          '<option value="1">오늘(24시간)</option>' +
          '<option value="7">최근 7일</option>' +
          '<option value="0">전체 누적</option>' +
        '</select>' +
        '<button type="button" id="btnGhPrivateSync" class="btn green sm" style="white-space:nowrap;">📥 Private 카톡 바로 불러오기</button>' +
        '<button type="button" id="btnGhTokenClear" class="btn gray sm" style="white-space:nowrap;">토큰 삭제</button>' +
      '</div>' +
      '<label style="display:inline-flex; align-items:center; gap:5px; margin-top:7px; font-size:11.5px; color:#475569; cursor:pointer;">' +
        '<input type="checkbox" id="ghRememberToken" ' + (savedToken ? 'checked' : '') + ' /> 이 기기 브라우저에 토큰 기억하기' +
      '</label>';

    uploadZone.parentNode.insertBefore(box, uploadZone.nextSibling);

    document.getElementById("btnGhTokenClear").addEventListener("click", function () {
      try { localStorage.removeItem(TOKEN_KEY); } catch {}
      document.getElementById("ghPrivateTokenInput").value = "";
      document.getElementById("ghRememberToken").checked = false;
      document.getElementById("ghSyncStatus").innerText = "저장된 토큰을 삭제했습니다.";
    });

    document.getElementById("btnGhPrivateSync").addEventListener("click", loadKakaoFromPrivateGithub);
  }

  async function loadKakaoFromPrivateGithub() {
    const tokenEl = document.getElementById("ghPrivateTokenInput");
    const statusEl = document.getElementById("ghSyncStatus");
    const btn = document.getElementById("btnGhPrivateSync");
    const rememberEl = document.getElementById("ghRememberToken");
    const daysVal = Number(document.getElementById("ghSyncDaysSelect").value || "2");

    const token = (tokenEl ? tokenEl.value : "").trim();
    if (!token) {
      alert("GitHub 토큰(github_pat_...)을 먼저 입력해주세요.");
      if (tokenEl) tokenEl.focus();
      return;
    }

    if (rememberEl && rememberEl.checked) {
      try { localStorage.setItem(TOKEN_KEY, token); } catch {}
    } else {
      try { localStorage.removeItem(TOKEN_KEY); } catch {}
    }

    if (btn) { btn.disabled = true; btn.innerText = "⏳ 불러오는 중..."; }
    if (statusEl) statusEl.innerText = "GitHub Private 저장소 연결 중...";

    try {
      const apiUrl =
        "https://api.github.com/repos/" +
        encodeURIComponent(GH_CONFIG.owner) + "/" +
        encodeURIComponent(GH_CONFIG.repo) +
        "/contents/" + GH_CONFIG.dataPath +
        "?ref=" + encodeURIComponent(GH_CONFIG.branch) +
        "&t=" + Date.now();

      const res = await fetch(apiUrl, {
        headers: {
          Authorization: "Bearer " + token,
          Accept: "application/vnd.github.raw+json"
        }
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error("토큰 인증 실패 (Private 저장소 Contents 읽기 권한을 확인하세요)");
      }
      if (res.status === 404) {
        throw new Error("data/kakao-logs.json 파일을 찾을 수 없습니다.");
      }
      if (!res.ok) {
        throw new Error("GitHub 응답 오류 (HTTP " + res.status + ")");
      }

      const rawList = await res.json();
      const list = Array.isArray(rawList) ? rawList : [];

      const cutoff = daysVal > 0 ? Date.now() - daysVal * 86400000 : 0;
      const filtered = list.filter(function (item) {
        if (!item || !item.message) return false;
        if (cutoff > 0) {
          const t = Date.parse(item.receivedAt);
          if (!isNaN(t) && t < cutoff) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        if (statusEl) statusEl.innerText = "선택한 기간에 누적된 카톡이 없습니다 (전체 " + list.length + "건).";
        return;
      }

      const lines = filtered
        .map(toKstKakaoLine)
        .filter(Boolean)
        .sort(function (a, b) { return a.ts - b.ts; })
        .map(function (x) { return x.text; });

      const combinedText = lines.join("\n");

      // 기존 meatforand 파서(3_kakao_parser.js) 그대로 실행
      allChatItems = [];
      parseSingleKakaoText(combinedText);

      allChatItems.sort(function (a, b) {
        if (a.dateFull !== b.dateFull) return a.dateFull.localeCompare(b.dateFull);
        return a.timeMins - b.timeMins;
      });
      allChatItems.forEach(function (item, idx) { item.idx = idx; });

      if (typeof inferDeliveryDatesForAllItems === "function") {
        inferDeliveryDatesForAllItems();
      }
      if (allChatItems.length > 0) {
        const lastDate = allChatItems[allChatItems.length - 1].dateFull;
        const targetDateEl = document.getElementById("orderTargetDate");
        if (targetDateEl) targetDateEl.value = lastDate;
      }

      const orderCnt = allChatItems.filter(function (x) { return x.type === "발주"; }).length;
      const weightCnt = allChatItems.filter(function (x) { return x.type === "계근"; }).length;

      const msgEl = document.getElementById("kakaoLoadMsg");
      if (msgEl) {
        msgEl.innerText =
          "✅ GitHub Private 카톡 " + filtered.length + "건 수신 → 총 " + allChatItems.length +
          "건 분석 완료! (순수발주 " + orderCnt + "건 / 계근 " + weightCnt + "건)";
      }
      if (statusEl) {
        statusEl.innerText = "동기화 완료 (" + filtered.length + "건 반영)";
      }

      if (typeof saveStateToBrowser === "function") {
        saveStateToBrowser("GitHub Private 카톡 동기화");
      }
      if (typeof onFilterCriteriaChange === "function") {
        onFilterCriteriaChange(true);
      }
    } catch (err) {
      if (statusEl) statusEl.innerText = "❌ " + (err.message || "불러오기 실패");
      alert("GitHub Private 카톡 불러오기 오류:\n" + (err.message || err));
    } finally {
      if (btn) { btn.disabled = false; btn.innerText = "📥 Private 카톡 바로 불러오기"; }
    }
  }

  window.loadKakaoFromPrivateGithub = loadKakaoFromPrivateGithub;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectPrivateSyncPanel);
  } else {
    injectPrivateSyncPanel();
  }
})();
