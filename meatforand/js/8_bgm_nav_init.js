/* 화면 하단 팝업 탭메뉴 제어 & 탭 전환 함수 */
const PAGE_LABELS = {
    'page1': '1. 데이터 입력',
    'pageExcelStock': '2. 엑셀 재고파악',
    'page2': '3. 발주 추출 목록',
    'pageLoose': '4. 낱개 목록',
    'pageStockOrg': '5. 재고정리·창고랙',
    'page5': '6. 발주차감 잔여재고',
    'page6': '7. 배송처 목록·배차'
};
const ALL_MENU_KEYS = ['page1', 'pageExcelStock', 'page2', 'pageLoose', 'pageStockOrg', 'page5', 'page6'];

function toggleBottomTabPopup() {
    const tabPop = document.getElementById('bottomTabPopup');
    const bgmPop = document.getElementById('bottomBgmPopup');
    const backdrop = document.getElementById('bottomPopupBackdrop');
    if (!tabPop) return;

    const willOpen = !tabPop.classList.contains('open');
    if (bgmPop && bgmPop.classList.contains('open')) {
        closeBottomBgmPopup(true);
    }
    tabPop.classList.toggle('open', willOpen);
    if (backdrop) backdrop.classList.toggle('open', willOpen);
}

function toggleBottomBgmPopup() {
    const tabPop = document.getElementById('bottomTabPopup');
    const bgmPop = document.getElementById('bottomBgmPopup');
    const backdrop = document.getElementById('bottomPopupBackdrop');
    if (!bgmPop) return;

    const willOpen = !bgmPop.classList.contains('open');
    if (tabPop) tabPop.classList.remove('open');

    if (willOpen) {
        bgmPop.classList.add('open');
        if (backdrop) backdrop.classList.add('open');
        syncBgmStagePosition(true);
        renderBgmQueueList();
    } else {
        closeBottomBgmPopup(false);
    }
}

function closeBottomBgmPopup(keepBackdrop) {
    const bgmPop = document.getElementById('bottomBgmPopup');
    const backdrop = document.getElementById('bottomPopupBackdrop');
    if (bgmPop) bgmPop.classList.remove('open');
    if (!keepBackdrop && backdrop) backdrop.classList.remove('open');
    syncBgmStagePosition(false);
}

function closeAllBottomPopups() {
    const tabPop = document.getElementById('bottomTabPopup');
    const bcModal = document.getElementById('quickBarcodeModal');
    const adminModal = document.getElementById('adminPermModal');
    const backdrop = document.getElementById('bottomPopupBackdrop');
    if (tabPop) tabPop.classList.remove('open');
    if (bcModal) bcModal.classList.remove('open');
    if (adminModal) adminModal.classList.remove('open');
    stopCameraBarcodeScanner();
    closeBottomBgmPopup(false);
    if (backdrop) backdrop.classList.remove('open');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllBottomPopups();
});

function switchTab(pageId, btnEl) {
    if (currentSessionUser && !isPageAllowedForCurrentUser(pageId)) {
        alert('⚠️ 현재 로그인하신 계정에는 해당 메뉴 접근 권한이 없습니다.\n관리자에게 메뉴 활성화를 요청하세요.');
        return;
    }

    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.bottom-tab-item').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-page') === pageId);
    });
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    if (btnEl && btnEl.classList) btnEl.classList.add('active');

    const triggerBtn = document.getElementById('btnBottomMenuTrigger');
    if (triggerBtn) {
        const label = PAGE_LABELS[pageId] || '화면 선택';
        triggerBtn.innerText = `📑 메뉴 · ${label} ▲`;
    }

    closeAllBottomPopups();

    if (pageId === 'pageExcelStock') initPdsExcelPage();
    if (pageId === 'page2') renderOrdersTable();
    if (pageId === 'pageLoose') renderLooseItemsPage();
    if (pageId === 'pageStockOrg') renderStockOrganizationPage();
    if (pageId === 'page5') renderDiffTable();
    if (pageId === 'page6') {
        renderDispatchPage();
        initVworldMap();
    }
}

function onFilterCriteriaChange(skipSave) {
    renderOrdersTable();
    renderLooseItemsPage();
    renderStockOrganizationPage();
    renderDiffTable();
    renderDispatchPage();
    if (!skipSave) {
        saveStateToBrowser('날짜/필터 변경');
    }
}


/* =========================================================================
   11. 백그라운드 뮤직 (유튜브 재생목록 · 유튜브 영상 · 틱톡 · 로컬 MP3)
   ========================================================================= */
let bgmQueue = [];
try {
    const savedBgm = JSON.parse(localStorage.getItem('mf_bgm_queue') || 'null');
    if (Array.isArray(savedBgm)) bgmQueue = savedBgm;
} catch (e) {}

let bgmCurrentIndex = -1;
let bgmIsPlaying = false;
let bgmVolume = parseInt(localStorage.getItem('mf_bgm_volume') || '60', 10);
if (isNaN(bgmVolume) || bgmVolume < 0 || bgmVolume > 100) bgmVolume = 60;

let ytPlayer = null;
let ytApiReady = false;
let ytPendingAction = null;

function initBgmPlayerState() {
    const volSlider = document.getElementById('bgmVolumeSlider');
    if (volSlider) volSlider.value = bgmVolume;

    const localAudio = document.getElementById('localAudioPlayer');
    if (localAudio) {
        localAudio.volume = bgmVolume / 100;
        localAudio.onended = () => bgmNextTrack();
        localAudio.onplay = () => { bgmIsPlaying = true; updateBgmDockUI(); };
        localAudio.onpause = () => { bgmIsPlaying = false; updateBgmDockUI(); };
    }
    renderBgmQueueList();
    updateBgmDockUI();
}

function saveBgmQueue() {
    // Only persist URL-based items (local blob URLs expire on page reload)
    const persistable = bgmQueue.filter(item => item.kind !== 'local');
    try {
        localStorage.setItem('mf_bgm_queue', JSON.stringify(persistable));
    } catch (e) {}
}

function parseMediaUrl(rawUrl) {
    const url = String(rawUrl || '').trim();
    if (!url) return null;

    // 1. YouTube Playlist (list=...)
    const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    const vidMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/);

    if (listMatch && (url.includes('youtube.com') || url.includes('youtu.be'))) {
        return {
            kind: 'yt_playlist',
            listId: listMatch[1],
            videoId: vidMatch ? vidMatch[1] : '',
            title: `유튜브 재생목록 (${listMatch[1].substring(0, 12)}...)`,
            url
        };
    }

    if (vidMatch) {
        return {
            kind: 'yt_video',
            videoId: vidMatch[1],
            title: `유튜브 영상 (${vidMatch[1]})`,
            url
        };
    }

    // 2. TikTok video link
    const ttMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (ttMatch) {
        return {
            kind: 'tiktok',
            videoId: ttMatch[1],
            title: `틱톡 영상 (${ttMatch[1].slice(-6)})`,
            url
        };
    }
    if (/tiktok\.com/.test(url)) {
        return {
            kind: 'tiktok_link',
            title: '틱톡 링크 (새창 열기)',
            url
        };
    }

    return null;
}

function addBgmUrlFromInput(playNow) {
    const input = document.getElementById('bgmUrlInput');
    if (!input) return;
    const raw = input.value.trim();
    if (!raw) {
        alert('유튜브 재생목록 URL, 유튜브 영상 URL, 또는 틱톡 영상 URL을 붙여넣어 주세요.');
        return;
    }

    const parsed = parseMediaUrl(raw);
    if (!parsed) {
        alert('인식할 수 없는 링크입니다.\n유튜브(youtube.com / youtu.be) 또는 틱톡(tiktok.com) 주소를 입력해 주세요.');
        return;
    }

    bgmQueue.push(parsed);
    saveBgmQueue();
    input.value = '';
    renderBgmQueueList();

    if (playNow || bgmCurrentIndex === -1) {
        playBgmAtIndex(bgmQueue.length - 1);
    }
}

function loadLocalAudioFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const startIdx = bgmQueue.length;
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const blobUrl = URL.createObjectURL(f);
        bgmQueue.push({
            kind: 'local',
            title: f.name.replace(/\.[^/.]+$/, ''),
            url: blobUrl
        });
    }
    renderBgmQueueList();
    playBgmAtIndex(startIdx);
}

function ensureYouTubeApiLoaded(callback) {
    if (ytApiReady && window.YT && window.YT.Player) {
        callback();
        return;
    }
    ytPendingAction = callback;
    if (!document.getElementById('ytIframeApiScript')) {
        const tag = document.createElement('script');
        tag.id = 'ytIframeApiScript';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    }
}

window.onYouTubeIframeAPIReady = function() {
    ytApiReady = true;
    if (typeof ytPendingAction === 'function') {
        const fn = ytPendingAction;
        ytPendingAction = null;
        fn();
    }
};

function playBgmAtIndex(idx) {
    if (idx < 0 || idx >= bgmQueue.length) return;
    bgmCurrentIndex = idx;
    const item = bgmQueue[idx];

    const ytMount = document.getElementById('ytPlayerMount');
    const ttFrame = document.getElementById('tiktokEmbedFrame');
    const localAudio = document.getElementById('localAudioPlayer');

    // Stop other active players first
    if (localAudio) {
        localAudio.pause();
        localAudio.style.display = 'none';
    }
    if (ttFrame) {
        ttFrame.style.display = 'none';
        ttFrame.src = 'about:blank';
    }

    if (item.kind === 'local') {
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try { ytPlayer.stopVideo(); } catch (e) {}
        }
        if (ytMount) ytMount.style.display = 'none';
        if (localAudio) {
            localAudio.src = item.url;
            localAudio.volume = bgmVolume / 100;
            localAudio.play().catch(() => {});
        }
        bgmIsPlaying = true;
        syncBgmStagePosition(document.getElementById('bottomBgmPopup')?.classList.contains('open'));
        renderBgmQueueList();
        updateBgmDockUI();
        return;
    }

    if (item.kind === 'tiktok') {
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try { ytPlayer.stopVideo(); } catch (e) {}
        }
        if (ytMount) ytMount.style.display = 'none';
        if (ttFrame) {
            ttFrame.style.display = 'block';
            ttFrame.src = `https://www.tiktok.com/embed/v2/${item.videoId}`;
        }
        bgmIsPlaying = true;
        syncBgmStagePosition(document.getElementById('bottomBgmPopup')?.classList.contains('open'));
        renderBgmQueueList();
        updateBgmDockUI();
        return;
    }

    if (item.kind === 'tiktok_link') {
        window.open(item.url, '_blank');
        return;
    }

    // YouTube Playlist or Video
    if (ytMount) ytMount.style.display = 'block';
    bgmIsPlaying = true;
    syncBgmStagePosition(document.getElementById('bottomBgmPopup')?.classList.contains('open'));
    renderBgmQueueList();
    updateBgmDockUI();

    ensureYouTubeApiLoaded(() => {
        if (!ytPlayer) {
            ytPlayer = new YT.Player('ytPlayerMount', {
                height: '100%',
                width: '100%',
                playerVars: {
                    autoplay: 1,
                    rel: 0,
                    playsinline: 1
                },
                events: {
                    onReady: (ev) => {
                        ev.target.setVolume(bgmVolume);
                        loadItemIntoYtPlayer(item);
                    },
                    onStateChange: (ev) => {
                        if (ev.data === YT.PlayerState.PLAYING) {
                            bgmIsPlaying = true;
                            try {
                                const vData = ytPlayer.getVideoData();
                                if (vData && vData.title && bgmQueue[bgmCurrentIndex]) {
                                    bgmQueue[bgmCurrentIndex].liveTitle = vData.title;
                                }
                            } catch (e) {}
                            updateBgmDockUI();
                            renderBgmQueueList();
                        } else if (ev.data === YT.PlayerState.PAUSED) {
                            bgmIsPlaying = false;
                            updateBgmDockUI();
                        } else if (ev.data === YT.PlayerState.ENDED) {
                            // If single video or end of playlist, advance to next item in queue
                            if (bgmQueue.length > 1) {
                                bgmNextTrack();
                            } else if (item.kind === 'yt_video') {
                                ytPlayer.playVideo(); // Loop single track
                            }
                        }
                    }
                }
            });
        } else {
            loadItemIntoYtPlayer(item);
        }
    });
}

function loadItemIntoYtPlayer(item) {
    if (!ytPlayer) return;
    ytPlayer.setVolume(bgmVolume);
    if (item.kind === 'yt_playlist') {
        ytPlayer.loadPlaylist({
            list: item.listId,
            listType: 'playlist',
            index: 0
        });
    } else if (item.kind === 'yt_video') {
        ytPlayer.loadVideoById(item.videoId);
    }
}

function bgmTogglePlayPause() {
    if (bgmQueue.length === 0) {
        toggleBottomBgmPopup();
        return;
    }
    if (bgmCurrentIndex === -1) {
        playBgmAtIndex(0);
        return;
    }
    const item = bgmQueue[bgmCurrentIndex];
    if (item.kind === 'local') {
        const localAudio = document.getElementById('localAudioPlayer');
        if (localAudio) {
            if (localAudio.paused) localAudio.play();
            else localAudio.pause();
        }
        return;
    }
    if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
        const st = ytPlayer.getPlayerState();
        if (st === YT.PlayerState.PLAYING) {
            ytPlayer.pauseVideo();
        } else {
            ytPlayer.playVideo();
        }
    }
}

function bgmPrevTrack() {
    if (bgmQueue.length === 0) return;
    const item = bgmQueue[bgmCurrentIndex];
    if (item && item.kind === 'yt_playlist' && ytPlayer && typeof ytPlayer.previousVideo === 'function') {
        ytPlayer.previousVideo();
        return;
    }
    const prevIdx = (bgmCurrentIndex - 1 + bgmQueue.length) % bgmQueue.length;
    playBgmAtIndex(prevIdx);
}

function bgmNextTrack() {
    if (bgmQueue.length === 0) return;
    const item = bgmQueue[bgmCurrentIndex];
    if (item && item.kind === 'yt_playlist' && ytPlayer && typeof ytPlayer.nextVideo === 'function') {
        // Check if there are more videos in the YouTube playlist; otherwise move to next queue entry
        const pl = ytPlayer.getPlaylist ? ytPlayer.getPlaylist() : null;
        const plIdx = ytPlayer.getPlaylistIndex ? ytPlayer.getPlaylistIndex() : -1;
        if (pl && plIdx >= 0 && plIdx < pl.length - 1) {
            ytPlayer.nextVideo();
            return;
        }
    }
    const nextIdx = (bgmCurrentIndex + 1) % bgmQueue.length;
    playBgmAtIndex(nextIdx);
}

function bgmStopAll() {
    bgmIsPlaying = false;
    bgmCurrentIndex = -1;
    const localAudio = document.getElementById('localAudioPlayer');
    if (localAudio) {
        localAudio.pause();
        localAudio.currentTime = 0;
    }
    const ttFrame = document.getElementById('tiktokEmbedFrame');
    if (ttFrame) {
        ttFrame.style.display = 'none';
        ttFrame.src = 'about:blank';
    }
    if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
        try { ytPlayer.stopVideo(); } catch (e) {}
    }
    syncBgmStagePosition(document.getElementById('bottomBgmPopup')?.classList.contains('open'));
    renderBgmQueueList();
    updateBgmDockUI();
}

function setBgmVolume(val) {
    bgmVolume = Math.max(0, Math.min(100, parseInt(val, 10) || 60));
    localStorage.setItem('mf_bgm_volume', String(bgmVolume));
    const localAudio = document.getElementById('localAudioPlayer');
    if (localAudio) localAudio.volume = bgmVolume / 100;
    if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
        try { ytPlayer.setVolume(bgmVolume); } catch (e) {}
    }
}

function removeBgmItem(idx, ev) {
    if (ev) ev.stopPropagation();
    bgmQueue.splice(idx, 1);
    saveBgmQueue();
    if (bgmQueue.length === 0) {
        bgmStopAll();
        return;
    }
    if (idx === bgmCurrentIndex) {
        playBgmAtIndex(Math.min(idx, bgmQueue.length - 1));
    } else if (idx < bgmCurrentIndex) {
        bgmCurrentIndex--;
    }
    renderBgmQueueList();
}

function clearBgmQueue() {
    if (!confirm('등록된 BGM 재생목록을 모두 비울까요?')) return;
    bgmQueue = [];
    saveBgmQueue();
    bgmStopAll();
}

function syncBgmStagePosition(isPopupOpen) {
    const stage = document.getElementById('bgmMediaStage');
    const popupSlot = document.getElementById('bgmPopupStageSlot');
    if (!stage || !popupSlot) return;

    const currentItem = (bgmCurrentIndex >= 0 && bgmQueue[bgmCurrentIndex]) ? bgmQueue[bgmCurrentIndex] : null;
    const hasVisualMedia = currentItem && (currentItem.kind === 'yt_playlist' || currentItem.kind === 'yt_video' || currentItem.kind === 'tiktok');

    if (isPopupOpen) {
        if (stage.parentElement !== popupSlot) {
            popupSlot.appendChild(stage);
        }
        stage.classList.remove('active-mini');
        if (hasVisualMedia) {
            stage.classList.add('in-popup');
            stage.style.display = 'block';
        } else {
            stage.classList.remove('in-popup');
            stage.style.display = 'none';
        }
    } else {
        if (stage.parentElement !== document.body) {
            document.body.appendChild(stage);
        }
        stage.classList.remove('in-popup');
        if (hasVisualMedia && bgmIsPlaying) {
            stage.classList.add('active-mini');
            stage.style.display = 'block';
        } else {
            stage.classList.remove('active-mini');
            stage.style.display = 'none';
        }
    }
}

function renderBgmQueueList() {
    const listEl = document.getElementById('bgmQueueList');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (bgmQueue.length === 0) {
        listEl.innerHTML = `<div style="padding:12px; text-align:center; color:#6b7280; font-size:11px;">등록된 곡/재생목록이 없습니다. 위 칸에 유튜브 재생목록 URL을 붙여넣으세요.</div>`;
        return;
    }

    bgmQueue.forEach((item, idx) => {
        const isCur = idx === bgmCurrentIndex;
        const badgeIcon = item.kind === 'yt_playlist' ? '📑유튜브목록'
            : item.kind === 'yt_video' ? '▶️유튜브'
            : item.kind.startsWith('tiktok') ? '🎬틱톡'
            : '🎧MP3';
        const displayTitle = item.liveTitle || item.title;

        const row = document.createElement('div');
        row.className = 'bgm-queue-row' + (isCur ? ' current' : '');
        row.onclick = () => playBgmAtIndex(idx);
        row.innerHTML = `
            <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">
                ${isCur ? '🔊 ' : ''}<span class="badge" style="background:#334155; font-size:9.5px;">${badgeIcon}</span> ${escapeHtml(displayTitle)}
            </span>
            <button type="button" class="btn red sm" style="padding:1px 6px; font-size:10px;" onclick="removeBgmItem(${idx}, event)">✕</button>
        `;
        listEl.appendChild(row);
    });
}

function updateBgmDockUI() {
    const btnBgm = document.getElementById('btnBottomBgmTrigger');
    const btnPrev = document.getElementById('btnDockBgmPrev');
    const btnToggle = document.getElementById('btnDockBgmToggle');
    const btnNext = document.getElementById('btnDockBgmNext');

    const hasQueue = bgmQueue.length > 0;
    if (btnPrev) btnPrev.style.display = hasQueue ? 'inline-flex' : 'none';
    if (btnToggle) btnToggle.style.display = hasQueue ? 'inline-flex' : 'none';
    if (btnNext) btnNext.style.display = hasQueue ? 'inline-flex' : 'none';

    if (btnBgm) {
        if (bgmIsPlaying && bgmCurrentIndex >= 0 && bgmQueue[bgmCurrentIndex]) {
            const cur = bgmQueue[bgmCurrentIndex];
            const shortTitle = (cur.liveTitle || cur.title).substring(0, 12);
            btnBgm.classList.add('playing');
            btnBgm.innerText = `🎵 ${shortTitle}`;
        } else {
            btnBgm.classList.remove('playing');
            btnBgm.innerText = hasQueue ? `🎵 BGM (${bgmQueue.length})` : '🎵 BGM';
        }
    }
}




/* =========================================================================
   애플리케이션 최초 진입점 (DOMContentLoaded)
   ========================================================================= */
window.addEventListener('DOMContentLoaded', () => {
    initDeviceAndZoomUI();
    renderVehicleConfigInputs();
    renderColdStorageInputs();
    restoreStateFromBrowser();
    initBgmPlayerState();
    initWarehouseAndBarcodeData();
    initPdsExcelPage();
    initAuthSystem();

    if (window.location.protocol.startsWith('http') && !window.location.hostname.endsWith('github.io')) {
        fetch('./clients.csv')
            .then(res => {
                if (!res.ok) throw new Error('No local clients.csv');
                return res.arrayBuffer();
            })
            .then(buf => {
                let text = new TextDecoder('utf-8').decode(buf);
                if (text.includes('\ufffd')) text = new TextDecoder('euc-kr').decode(buf);
                processClientCsvText(text, true);
            })
            .catch(() => {});
    }
});

/* 전역 바인딩 (8_bgm_nav_init.js) */
window.switchTab = switchTab;
window.onFilterCriteriaChange = onFilterCriteriaChange;
window.toggleBottomTabPopup = toggleBottomTabPopup;
window.toggleBottomBgmPopup = toggleBottomBgmPopup;
window.closeAllBottomPopups = closeAllBottomPopups;
window.addBgmUrlFromInput = addBgmUrlFromInput;
window.loadLocalAudioFiles = loadLocalAudioFiles;
window.playBgmAtIndex = playBgmAtIndex;
window.bgmTogglePlayPause = bgmTogglePlayPause;
window.bgmPrevTrack = bgmPrevTrack;
window.bgmNextTrack = bgmNextTrack;
window.bgmStopAll = bgmStopAll;
window.setBgmVolume = setBgmVolume;
window.removeBgmItem = removeBgmItem;
window.clearBgmQueue = clearBgmQueue;
