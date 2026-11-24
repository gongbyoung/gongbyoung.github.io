/* =========================================================================
   12. 사내 보안 로그인 · 관리자/사용자 구분 · 사용자별 메뉴 활성화 권한 관리
   ========================================================================= */
const DEFAULT_USER_ACCOUNTS = [
    { id: "최규진", pin: "0000", role: "admin", menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true } },
    { id: "한재호", pin: "1111", role: "admin", menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true } },
    { id: "영민",   pin: "2222", role: "admin", menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true } },
    { id: "이명석", pin: "1234", role: "user",  menus: { page1: false, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: false } },
    { id: "양승준", pin: "1234", role: "user",  menus: { page1: false, pageExcelStock: false, page2: true, pageLoose: true, pageStockOrg: false, page5: false, page6: true } },
    { id: "김석민", pin: "1234", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "한승희", pin: "1234", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "엄태원", pin: "1234", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "최청호", pin: "1234", role: "user",  menus: { page1: false, pageExcelStock: false, page2: false, pageLoose: false, pageStockOrg: false, page5: false, page6: true } },
    { id: "표혜영", pin: "1234", role: "user",  menus: { page1: true, pageExcelStock: true, page2: true, pageLoose: false, pageStockOrg: true, page5: true, page6: false } }
];

let userAccountsDB = [];
try {
    const savedUsers = JSON.parse(localStorage.getItem('mf_user_accounts') || 'null');
    if (Array.isArray(savedUsers) && savedUsers.length > 0) {
        userAccountsDB = savedUsers;
    } else {
        userAccountsDB = DEFAULT_USER_ACCOUNTS.map(u => ({ ...u, menus: { ...u.menus } }));
    }
} catch (e) {
    userAccountsDB = DEFAULT_USER_ACCOUNTS.map(u => ({ ...u, menus: { ...u.menus } }));
}

let currentSessionUser = null;

function saveUserAccountsDB() {
    try {
        localStorage.setItem('mf_user_accounts', JSON.stringify(userAccountsDB));
    } catch (e) {}
}

function populateLoginUserSelect() {
    const sel = document.getElementById('loginUserSelect');
    if (!sel) return;
    sel.innerHTML = `<option value="">-- 사원 선택 --</option>`;
    userAccountsDB.forEach(u => {
        const roleLabel = u.role === 'admin' ? '👑 관리자' : '👤 사용자';
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.textContent = `${u.id} (${roleLabel})`;
        sel.appendChild(opt);
    });
}

function onLoginUserSelectChange() {
    const sel = document.getElementById('loginUserSelect');
    const idInp = document.getElementById('loginUserIdInput');
    const pinInp = document.getElementById('loginPasswordInput');
    if (sel && idInp && sel.value) {
        idInp.value = sel.value;
        if (pinInp) pinInp.focus();
    }
}

function initAuthSystem() {
    populateLoginUserSelect();
    try {
        const savedSessionId = sessionStorage.getItem('mf_logged_in_user_id');
        if (savedSessionId) {
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
}

function handleSystemLogin() {
    const idVal = (document.getElementById('loginUserIdInput')?.value || '').trim();
    const pinVal = (document.getElementById('loginPasswordInput')?.value || '').trim();
    const errEl = document.getElementById('loginErrorMsg');

    if (!idVal || !pinVal) {
        if (errEl) {
            errEl.style.display = 'block';
            errEl.innerText = '⚠️ 사원 성명(ID)과 비밀번호(PIN)를 모두 입력해주세요.';
        }
        return;
    }

    const matchedUser = userAccountsDB.find(u => u.id === idVal && u.pin === pinVal);
    if (!matchedUser) {
        if (errEl) {
            errEl.style.display = 'block';
            errEl.innerText = '❌ 사원 정보 또는 비밀번호(PIN)가 일치하지 않습니다.';
        }
        return;
    }

    if (errEl) errEl.style.display = 'none';
    document.getElementById('loginPasswordInput').value = '';
    completeUserLogin(matchedUser, false);
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

    if (!isRestore) {
        recordLastUpdatedTime(`${userObj.id} 로그인`);
    }
}

function handleSystemLogout() {
    closeAllBottomPopups();
    try {
        sessionStorage.removeItem('mf_logged_in_user_id');
    } catch (e) {}
    populateLoginUserSelect();
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
            ? `📑 사내 메뉴 (${userObj.id} · 관리자 전체활성)`
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
        if (firstAllowedPage) {
            switchTab(firstAllowedPage);
        }
    }
}

function openAdminPermModal() {
    if (!currentSessionUser || currentSessionUser.role !== 'admin') {
        alert('관리자 계정만 접근할 수 있습니다.');
        return;
    }
    closeAllBottomPopups();
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
            <td><input type="text" value="${escapeHtml(u.pin)}" style="width:68px; padding:3px 5px; font-family:monospace;" onchange="changeUserPin(${idx}, this.value)"></td>
            <td>
                <select style="padding:3px 5px; font-size:11px; font-weight:bold;" onchange="changeUserRole(${idx}, this.value)">
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>👑 관리자</option>
                    <option value="user" ${u.role === 'user' ? 'selected' : ''}>👤 사용자</option>
                </select>
            </td>
            ${menuColsHtml}
            <td style="text-align:center;">
                ${isSelf ? '-' : `<button type="button" class="btn red sm" style="padding:2px 6px;" onclick="deleteStaffAccount(${idx})">삭제</button>`}
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
    recordLastUpdatedTime(`${u.id} 메뉴권한 변경`);
}

function changeUserRole(userIdx, newRole) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    u.role = newRole;
    if (newRole === 'admin') {
        ALL_MENU_KEYS.forEach(k => { u.menus[k] = true; });
    }
    saveUserAccountsDB();
    populateLoginUserSelect();
    renderAdminUserPermTable();
    if (currentSessionUser && currentSessionUser.id === u.id) {
        completeUserLogin(u, true);
    }
    recordLastUpdatedTime(`${u.id} 등급변경(${newRole})`);
}

function changeUserPin(userIdx, newPin) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    const cleanPin = String(newPin || '').trim();
    if (!cleanPin) {
        alert('비밀번호(PIN)는 비워둘 수 없습니다.');
        renderAdminUserPermTable();
        return;
    }
    u.pin = cleanPin;
    saveUserAccountsDB();
    recordLastUpdatedTime(`${u.id} 비밀번호 변경`);
}

function addNewStaffAccount() {
    const name = (document.getElementById('newStaffName')?.value || '').trim();
    const pin = (document.getElementById('newStaffPin')?.value || '').trim() || '1234';
    const role = (document.getElementById('newStaffRole')?.value || 'user');

    if (!name) {
        alert('신규 사원 성명(ID)을 입력해주세요.');
        return;
    }
    if (userAccountsDB.some(u => u.id === name)) {
        alert('이미 등록된 사원 이름입니다.');
        return;
    }

    const defaultMenus = role === 'admin'
        ? { page1: true, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: true, page6: true }
        : { page1: false, pageExcelStock: true, page2: true, pageLoose: true, pageStockOrg: true, page5: false, page6: false };

    userAccountsDB.push({ id: name, pin, role, menus: defaultMenus });
    saveUserAccountsDB();
    populateLoginUserSelect();
    document.getElementById('newStaffName').value = '';
    document.getElementById('newStaffPin').value = '';
    renderAdminUserPermTable();
    recordLastUpdatedTime(`신규 사원(${name}) 등록`);
}

function deleteStaffAccount(userIdx) {
    const u = userAccountsDB[userIdx];
    if (!u) return;
    if (!confirm(`'${u.id}' 계정을 삭제할까요?`)) return;
    userAccountsDB.splice(userIdx, 1);
    saveUserAccountsDB();
    populateLoginUserSelect();
    renderAdminUserPermTable();
    recordLastUpdatedTime(`사원(${u.id}) 삭제`);
}


/* 전역 바인딩 (2_auth_admin.js) */
window.onLoginUserSelectChange = onLoginUserSelectChange;
window.handleSystemLogin = handleSystemLogin;
window.handleSystemLogout = handleSystemLogout;
window.openAdminPermModal = openAdminPermModal;
window.toggleUserMenuPerm = toggleUserMenuPerm;
window.changeUserRole = changeUserRole;
window.changeUserPin = changeUserPin;
window.addNewStaffAccount = addNewStaffAccount;
window.deleteStaffAccount = deleteStaffAccount;
