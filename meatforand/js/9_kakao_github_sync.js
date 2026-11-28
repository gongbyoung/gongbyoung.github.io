/* =========================================================================
   9. GitHub Private 카톡 즉시 자동 동기화 + 모바일 초대형 UI(최대 220%) 확장
      - 페이지 로딩·로그인 시 버튼 없이 즉시 카톡 데이터를 불러와 실행합니다.
      - 60초 주기 및 화면 복귀 시 자동 갱신됩니다.
   ========================================================================= */

(function () {
  const GH_CONFIG = {
    owner: "gongbyoung",
    repo: "Private",
    branch: "main",
    dataPath: "data/kakao-logs.json"
  };

  let syncIntervalId = null;
  let isSyncingNow = false;
  let lastPayloadSignature = "";

  // 1) 기존 setUiZoom(최대 150% 제한)을 최대 220%까지 확장
  function setUiZoomExpanded(zoomPct, skipSave) {
    let val = parseInt(zoomPct, 10);
    if (isNaN(val)) val = window.innerWidth <= 900 ? 150 : 130;
    val = Math.max(100, Math.min(220, val));
    if (typeof currentUiZoom !== "undefined") {
      currentUiZoom = val;
    }
    document.documentElement.style.setProperty("--ui-zoom", (val / 100).toFixed(2));

    const sTop = document.getElementById("uiZoomSlider");
    const vTop = document.getElementById("uiZoomValue");
    const sP1 = document.getElementById("uiZoomSliderPage1");
    const vP1 = document.getElementById("uiZoomValuePage1");

    if (sTop) { sTop.max = "220"; sTop.value = String(val); }
    if (vTop) vTop.innerText = val + "%";
    if (sP1) { sP1.max = "220"; sP1.value = String(val); }
    if (vP1) vP1.innerText = val + "%";

    if (!skipSave) {
      try { localStorage.setItem("mf_ui_zoom", String(val)); } catch (e) {}
    }
  }
  window.setUiZoom = setUiZoomExpanded;

  function applyMobileFriendlyDefaults() {
    const isPhone = window.innerWidth <= 900;
    const savedZoom = (() => {
      try { return parseInt(localStorage.getItem("mf_ui_zoom") || "", 10); } catch (e) { return NaN; }
    })();
    if (isPhone) {
      if (typeof window.setUiMode === "function") {
        window.setUiMode("mobile", true);
      }
      setUiZoomExpanded(!isNaN(savedZoom) && savedZoom >= 130 ? savedZoom : 150, true);
    } else {
      setUiZoomExpanded(!isNaN(savedZoom) ? savedZoom : 130, true);
    }
  }

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

  async function loadKakaoFromPrivateGithub(isSilentAuto) {
    if (isSyncingNow) return;
    const token = typeof window.getActivePrivateToken === "function"
      ? window.getActivePrivateToken()
      : (sessionStorage.getItem("mf_session_gh_token") || "");

    if (!token) return;

    const statusEl = document.getElementById("ghSyncStatus");
    const daysEl = document.getElementById("ghSyncDaysSelect");
    const daysVal = Number(daysEl ? daysEl.value : "2");

    isSyncingNow = true;
    if (statusEl) statusEl.textContent = "⏳ 최신 카톡 자동 동기화 중...";

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
        throw new Error("보안 키 권한 오류");
      }
      if (res.status === 404) {
        throw new Error("data/kakao-logs.json 없음");
      }
      if (!res.ok) {
        throw new Error("GitHub 오류 (HTTP " + res.status + ")");
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

      const nowStr = new Date().toTimeString().slice(0, 8);
      if (filtered.length === 0) {
        if (statusEl) statusEl.textContent = "자동 연동 중 · " + nowStr + " (해당 기간 0건)";
        return;
      }

      const sig = daysVal + "|" + filtered.length + "|" + (filtered[0].id || "") + "|" + (filtered[filtered.length - 1].id || "");
      if (isSilentAuto && sig === lastPayloadSignature && allChatItems.length > 0) {
        if (statusEl) statusEl.textContent = "✅ 최신 유지 중 · " + nowStr + " (" + filtered.length + "건)";
        return;
      }
      lastPayloadSignature = sig;

      const lines = filtered
        .map(toKstKakaoLine)
        .filter(Boolean)
        .sort(function (a, b) { return a.ts - b.ts; })
        .map(function (x) { return x.text; });

      const combinedText = lines.join("\n");

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
          "✅ 자동 로딩 완료 (" + filtered.length + "건 수신 → 순수발주 " + orderCnt + "건 / 계근 " + weightCnt + "건)";
      }
      if (statusEl) {
        statusEl.textContent = "✅ 자동 동기화 완료 · " + nowStr;
      }

      if (typeof saveStateToBrowser === "function") {
        saveStateToBrowser("GitHub Private 카톡 자동 동기화");
      }
      if (typeof onFilterCriteriaChange === "function") {
        onFilterCriteriaChange(true);
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "⚠️ " + (err.message || "자동 동기화 실패");
    } finally {
      isSyncingNow = false;
    }
  }

  function startAutoKakaoSync() {
    loadKakaoFromPrivateGithub(true);
    if (syncIntervalId) clearInterval(syncIntervalId);
    syncIntervalId = setInterval(function () {
      if (document.visibilityState === "visible") {
        loadKakaoFromPrivateGithub(true);
      }
    }, 60000);
  }

  function stopAutoKakaoSync() {
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
    lastPayloadSignature = "";
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && sessionStorage.getItem("mf_session_gh_token")) {
      loadKakaoFromPrivateGithub(true);
    }
  });

  window.loadKakaoFromPrivateGithub = loadKakaoFromPrivateGithub;
  window.startAutoKakaoSync = startAutoKakaoSync;
  window.stopAutoKakaoSync = stopAutoKakaoSync;

  function bootSyncAndUi() {
    if (typeof toggleOnlyOrder === "function") window.toggleOnlyOrder = toggleOnlyOrder;
    if (typeof toggleKnownClient === "function") window.toggleKnownClient = toggleKnownClient;
    applyMobileFriendlyDefaults();
    // 이미 로그인 세션이 살아있다면 페이지 로딩 즉시 실행
    if (sessionStorage.getItem("mf_session_gh_token") && sessionStorage.getItem("mf_logged_in_user_id")) {
      startAutoKakaoSync();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSyncAndUi);
  } else {
    bootSyncAndUi();
  }
})();
