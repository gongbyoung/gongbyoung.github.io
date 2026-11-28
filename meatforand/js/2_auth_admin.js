/* =========================================================================
   12. 사내 보안 로그인 (GitHub Private 실시간 검증) · 자동 즉시 로딩 연계
       - 외부인이 소스를 보더라도 Private 보안 키 없이는 절대 접속할 수 없습니다.
       - 로그인 및 새로고침 시 버튼 없이 Private 카톡 데이터를 즉시 자동 로딩합니다.
   ========================================================================= */

const GH_PRIVATE_AUTH_REPO = {
    owner: "my-github-id",
    repo: "kakao-alarm-log"
};

const PRIVATE_KEY_LOCAL_STORAGE = 'mf_private_access_key_v2';
const PRIVATE_KEY_SESSION_STORAGE = 'mf_session_gh_token';

const ALL_MENU_KEYS = ['page1', 'pageExcelStock', 'page2', 'pageLoose', 'pageStockOrg', 'page5', 'page6'];

const DEFAULT_USER_ACCOUNTS = [
    { id: "최규진", pinHash: "defdd5677a09a9cc183af55eff5c11b215058f62440229f7dadbeec48bc9cc2d", role: "admin", menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true } },
    { id: "한재호", pinHash: "78c9585b2e43168cfbbc49d15d8e23d7aff59ecce548ed25f917cece3f82af30", role: "admin", menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true } },
    { id: "영민",   pinHash: "6ada7b47ac622856d6dc2067d97770bf4a0c703d7a0539cf9dde8bf67ec77446", role: "admin", menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true } },
    { id: "이명석", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: false, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: false } },
    { id: "양승준", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: false, pageExcelStock: false, page2: true, pageLoose: true, pageStockOrg: false, page5: false, page6: true } },
    { id: "김석민", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "한승희", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "엄태원", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "최청호", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "표혜영", pinHash: "ef33156878e4e849863d3dda8a544f204625017556ad88b56cf0b41f10fc35f9", role: "user",  menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: false, pageStockOrg: true, page5: true, page6: false } }
];

let userAccountsDB = [];
try {
    const savedUsers = JSON.parse(localStorage.getItem('mf_user_accounts_v2') || 'null');
    if (Array.isArray(savedUsers) && savedUsers.length > 0) {
        userAccountsDB = savedUsers;
    } else {
        userAccountsDB = DEFAULT_USER_ACCOUNTS.map(u => ({ ...u, menus: { ...u.menus } }));
    }
} catch (e) {
    userAccountsDB = DEFAULT_USER_ACCOUNTS.map(u => ({ ...u, menus: { ...u.menus } }));
}

let currentSessionUser = null;

async function sha256Pin(rawPin) {
    const data = new TextEncoder().encode('mf_v2:' + String(rawPin || '').trim());
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function saveUserAccountsDB() {
    try {
        localStorage.setItem('mf_user_accounts_v2', JSON.stringify(userAccountsDB));
    } catch (e) {}
}

function getActivePrivateToken() {
    try {
        return sessionStorage.getItem(PRIVATE_KEY_SESSION_STORAGE) || localStorage.getItem(PRIVATE_KEY_LOCAL_STORAGE) || '';
    } catch (e) {
        return '';
    }
}

function clearSavedPrivateAccessKey() {
    try {
        localStorage.removeItem(PRIVATE_KEY_LOCAL_STORAGE);
        sessionStorage.removeItem(PRIVATE_KEY_SESSION_STORAGE);
    } catch (e) {}
    const inp = document.getElementById('loginGithubTokenInput');
    const chk = document.getElementById('loginRememberTokenCheck');
    if (inp) inp.value = '';
    if (chk) chk.checked = false;
    const errEl = document.getElementById('loginErrorMsg');
    if (errEl) {
        errEl.style.display = 'block';
        errEl.textContent = '이 기기에 저장된 보안 키를 삭제했습니다.';
    }
}

function populateLoginUserSelect() {
    const savedKey = (() => {
        try { return localStorage.getItem(PRIVATE_KEY_LOCAL_STORAGE) || ''; } catch (e) { return ''; }
    })();
    const tokenInp = document.getElementById('loginGithubTokenInput');
    const rememberChk = document.getElementById('loginRememberTokenCheck');
    if (tokenInp && savedKey && !tokenInp.value) {
        tokenInp.value = savedKey;
    }
    if (rememberChk && savedKey) {
        rememberChk.checked = true;
    }
}

function onLoginUserSelectChange() {}

function initAuthSystem() {
    populateLoginUserSelect();
    try {
        const savedSessionId = sessionStorage.getItem('mf_logged_in_user_id');
        const savedSessionToken = sessionStorage.getItem(PRIVATE_KEY_SESSION_STORAGE);
        if (savedSessionId && savedSessionToken) {
            const found = userAccountsDB.find(u => u.id === savedSessionId);
            if (found) {
                completeUserLogin(found, true);
                return;
            }
        }
    } catch (e) {}
    lockSystemScreen();
}

function lockSystemScreen() {
    currentSessionUser = null;
    const gate = document.getElementById('loginGateScreen');
    if (gate) gate.classList.remove('hidden');
    document.querySelectorAll('.protected-shell').forEach(el => el.classList.add('locked'));
    populateLoginUserSelect();
}

async function verifyGithubPrivateAccess(token) {
    const url = 'https://api.github.com/repos/' +
        encodeURIComponent(GH_PRIVATE_AUTH_REPO.owner) + '/' +
        encodeURIComponent(GH_PRIVATE_AUTH_REPO.repo);
    const res = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + token,
            Accept: 'application/vnd.github+json'
        }
    });
    if (!res.ok) return false;
    const meta = await res.json();
    return Boolean(meta && meta.id);
}

async function handleSystemLogin() {
    const idVal = (document.getElementById('loginUserIdInput')?.value || '').trim();
    const pinVal = (document.getElementById('loginPasswordInput')?.value || '').trim();
    const tokenVal = (document.getElementById('loginGithubTokenInput')?.value || '').trim();
    const rememberToken = Boolean(document.getElementById('loginRememberTokenCheck')?.checked);
    const errEl = document.getElementById('loginErrorMsg');
    const submitBtn = document.getElementById('btnSystemLoginSubmit');

    const showErr = (msg) => {
        if (errEl) {
            errEl.style.display = 'block';
            errEl.textContent = msg;
        }
    };

    if (!idVal || !pinVal || !tokenVal) {
        showErr('사원 성명, 비밀번호(PIN), 사내 비공개 보안 키를 모두 입력해주세요.');
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '🔐 보안 인증 및 카톡 로딩 준비 중...';
    }
    if (errEl) errEl.style.display = 'none';

    try {
        const enteredHash = await sha256Pin(pinVal);
        const matchedUser = userAccountsDB.find(u => {
            if (u.id !== idVal) return false;
            if (u.pinHash) return u.pinHash === enteredHash;
            if (u.pin) return u.pin === pinVal;
            return false;
        });

        if (!matchedUser) {
            showErr('등록되지 않은 사원이거나 비밀번호가 일치하지 않습니다.');
            return;
        }

        const isPrivateVerified = await verifyGithubPrivateAccess(tokenVal);
        if (!isPrivateVerified) {
            showErr('사내 비공개 보안 키 인증에 실패했습니다. 인가된 토큰인지 확인해주세요.');
            return;
        }

        try {
            sessionStorage.setItem(PRIVATE_KEY_SESSION_STORAGE, tokenVal);
            if (rememberToken) {
                localStorage.setItem(PRIVATE_KEY_LOCAL_STORAGE, tokenVal);
            } else {
                localStorage.removeItem(PRIVATE_KEY_LOCAL_STORAGE);
            }
        } catch (e) {}

        const pinInput = document.getElementById('loginPasswordInput');
        if (pinInput) pinInput.value = '';
        completeUserLogin(matchedUser, false);
    } catch (e) {
        showErr('보안 인증 서버(GitHub) 연결에 실패했습니다. 네트워크 상태를 확인해주세요.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '🔓 본인 인증 후 바로 시작';
        }
    }
}

function completeUserLogin(userObj, isRestore) {
    currentSessionUser = userObj;
    try {
        sessionStorage.setItem('mf_logged_in_user_id', userObj.id);
    } catch (e) {}

    const gate = document.getElementById('loginGateScreen');
    if (gate) gate.classList.add('hidden');
    document.querySelectorAll('.protected-shell').forEach(el => el.classList.remove('locked'));

    const pillUser = document.getElementById('pillCurrentUser');
    if (pillUser) {
        pillUser.innerText = userObj.role === 'admin'
            ? `👑 ${userObj.id}(관리자)`
            : `👤 ${userObj.id}(사용자)`;
    }

    const isAdmin = userObj.role === 'admin';
    const btnHdrAdmin = document.getElementById('btnOpenAdminPerm');
    const btnP1Admin = document.getElementById('btnPage1AdminPerm');
    if (btnHdrAdmin) btnHdrAdmin.style.display = isAdmin ? 'inline-flex' : 'none';
    if (btnP1Admin) btnP1Admin.style.display = isAdmin ? 'inline-flex' : 'none';

    applyMenuPermissionsForUser(userObj);

    if (!isRestore && typeof recordLastUpdatedTime === 'function') {
        recordLastUpdatedTime(`${userObj.id} 보안 로그인`);
    }

    // 신규 로그인 & 페이지 새로고침(세션 복원) 모두 즉시 자동 카톡 로딩 실행!
    if (typeof window.startAutoKakaoSync === 'function') {
        window.startAutoKakaoSync();
    } else if (typeof window.loadKakaoFromPrivateGithub === 'function') {
        window.loadKakaoFromPrivateGithub(true);
    }
}

function handleSystemLogout() {
    if (typeof closeAllBottomPopups === 'function') closeAllBottomPopups();
    if (typeof window.stopAutoKakaoSync === 'function') window.stopAutoKakaoSync();
    try {
        sessionStorage.removeItem('mf_logged_in_user_id');
        sessionStorage.removeItem(PRIVATE_KEY_SESSION_STORAGE);
    } catch (e) {}
    lockSystemScreen();
}

function isPageAllowedForCurrentUser(pageId) {
    if (!currentSessionUser) return false;
    if (currentSessionUser.role === 'admin') return true;
    return Boolean(currentSessionUser.menus && currentSessionUser.menus[pageId]);
}

function applyMenuPermissionsForUser(userObj) {
    const isAdmin = userObj.role === 'admin';
    const roleHeader = document.getElementById('bottomMenuRoleHeader');
    if (roleHeader) {
        roleHeader.innerText = isAdmin
            ? `📑 사내 메뉴 (${userObj.id} · 관리자)`
            : `📑 사내 메뉴 (${userObj.id} · 허용메뉴)`;
    }
    let firstAllowedPage = null;
    document.querySelectorAll('.bottom-tab-item').forEach(btn => {
        const pId = btn.getAttribute('data-page');
        const allowed = isAdmin || Boolean(userObj.menus && userObj.menus[pId]);
        btn.classList.toggle('disabled-perm', !allowed);
        if (allowed && !firstAllowedPage) {
            firstAllowedPage = pId;
        }
    });
    const activePageEl = document.querySelector('.tab-page.active');
    const currentActiveId = activePageEl ? activePageEl.id : '';
    if (!currentActiveId || (!isAdmin && !(userObj.menus && userObj.menus[currentActiveId]))) {
        if (firstAllowedPage && typeof switchTab === 'function') {
            switchTab(firstAllowedPage);
        }
    }
}

function openAdminPermModal() {
    if (!currentSessionUser || currentSessionUser.role !== 'admin') {
        alert('관리자 계정만 접근할 수 있습니다.');
        return;
    }
    if (typeof closeAllBottomPopups === 'function') closeAllBottomPopups();
    const modal = document.getElementById('adminPermModal');
    const backdrop = document.getElementById('bottomPopupBackdrop');
    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    renderAdminUserPermTable();
}

function renderAdminUserPermTable() {
    const tbody = document.getElementById('adminUserPermTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    userAccountsDB.forEach((u, idx) => {
        const isSelf = currentSessionUser && currentSessionUser.id === u.id;
        let menuColsHtml = '';
        ALL_MENU_KEYS.forEach(mKey => {
            const checked = (u.role === 'admin' || (u.menus && u.menus[mKey])) ? 'checked' : '';
            const disabled = u.role === 'admin' ? 'disabled title="관리자는 전체 메뉴 자동 활성"' : '';
            menuColsHtml += `<td style="text-align:center;">
                <input type="checkbox" ${checked} ${disabled} onchange="toggleUserMenuPerm(${idx}, '${mKey}', this.checked)">
            </td>`;
        });
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${escapeHtml(u.id)}</b>${isSelf ? ' <span class="badge b-order">나</span>' : ''}</td>
            <td><input type="password" placeholder="새 PIN" style="width:92px; padding:6px; font-family:monospace;" onchange="changeUserPin(${idx}, this.value); this.value='';"></td>
            <td>
                <select style="padding:6px; font-size:14px; font-weight:bold;" onchange="changeUserRole(${idx}, this.value)">
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 관리자</option>
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>👤 사용자</option>
                </select>
            </td>
            ${menuColsHtml}
            <td style="text-align:center;">
                ${isSelf ? '-' : `<button type="button" class="btn red sm" onclick="deleteStaffAccount(${idx})">삭제</button>`}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleUserMenuPerm(userIdx, menuKey, isChecked) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    if (!u.menus) u.menus = {};
    u.menus[menuKey] = Boolean(isChecked);
    saveUserAccountsDB();
    if (currentSessionUser && currentSessionUser.id === u.id) {
        currentSessionUser = u;
        applyMenuPermissionsForUser(u);
    }
    if (typeof recordLastUpdatedTime === 'function') recordLastUpdatedTime(`${u.id} 메뉴권한 변경`);
}

function changeUserRole(userIdx, newRole) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    u.role = newRole;
    if (newRole === 'admin') {
        ALL_MENU_KEYS.forEach(k => { u.menus[k] = true; });
    }
    saveUserAccountsDB();
    renderAdminUserPermTable();
    if (currentSessionUser && currentSessionUser.id === u.id) {
        completeUserLogin(u, true);
    }
    if (typeof recordLastUpdatedTime === 'function') recordLastUpdatedTime(`${u.id} 등급변경(${newRole})`);
}

async function changeUserPin(userIdx, newPin) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    const cleanPin = String(newPin || '').trim();
    if (!cleanPin) return;
    u.pinHash = await sha256Pin(cleanPin);
    delete u.pin;
    saveUserAccountsDB();
    alert(`'${u.id}' 사원의 PIN을 안전하게 변경했습니다.`);
    if (typeof recordLastUpdatedTime === 'function') recordLastUpdatedTime(`${u.id} 비밀번호 변경`);
}

async function addNewStaffAccount() {
    const name = (document.getElementById('newStaffName')?.value || '').trim();
    const pin = (document.getElementById('newStaffPin')?.value || '').trim();
    const role = (document.getElementById('newStaffRole')?.value || 'user');
    if (!name || !pin) {
        alert('신규 사원 성명과 비밀번호(PIN)를 모두 입력해주세요.');
        return;
    }
    if (userAccountsDB.some(u => u.id === name)) {
        alert('이미 등록된 사원 이름입니다.');
        return;
    }
    const defaultMenus = role === 'admin'
        ? { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true }
        : { page1: false, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: false, page6: false };
    const pinHash = await sha256Pin(pin);
    userAccountsDB.push({ id: name, pinHash, role, menus: defaultMenus });
    saveUserAccountsDB();
    document.getElementById('newStaffName').value = '';
    document.getElementById('newStaffPin').value = '';
    renderAdminUserPermTable();
    if (typeof recordLastUpdatedTime === 'function') recordLastUpdatedTime(`신규 사원(${name}) 등록`);
}

function deleteStaffAccount(userIdx) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    if (!confirm(`'${u.id}' 계정을 삭제할까요?`)) return;
    userAccountsDB.splice(userIdx, 1);
    saveUserAccountsDB();
    renderAdminUserPermTable();
    if (typeof recordLastUpdatedTime === 'function') recordLastUpdatedTime(`사원(${u.id}) 삭제`);
}

window.getActivePrivateToken = getActivePrivateToken;
window.clearSavedPrivateAccessKey = clearSavedPrivateAccessKey;
window.onLoginUserSelectChange = onLoginUserSelectChange;
window.handleSystemLogin = handleSystemLogin;
window.handleSystemLogout = handleSystemLogout;
window.openAdminPermModal = openAdminPermModal;
window.toggleUserMenuPerm = toggleUserMenuPerm;
window.changeUserRole = changeUserRole;
window.changeUserPin = changeUserPin;
window.addNewStaffAccount = addNewStaffAccount;
window.deleteStaffAccount = deleteStaffAccount;
