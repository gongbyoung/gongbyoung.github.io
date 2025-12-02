// 1. 전역 변수 선언
let vexData = [];

// 2. JSON 파일 로드 함수 (오류 처리 강화)
async function loadVEXData() {
    console.log("데이터 로드를 시작합니다...");
    try {
        // 경로 확인: 파일 이름이 정확히 'vex_reference.json' 인지 다시 확인
        const response = await fetch('vex_reference.json');
        
        // HTTP 응답이 200 OK가 아니면 (404, 500 등) 오류 처리
        if (!response.ok) {
            console.error(`Fetch Error! Status: ${response.status} - 파일 이름을 다시 확인하세요.`);
            // vexData를 빈 상태로 두고 함수를 종료합니다.
            return; 
        }
        
        // JSON 파싱 시도
        vexData = await response.json();
        console.log("✅ VEX 데이터 로드 및 파싱 완료:", vexData.length, "개 항목");

        // (선택 사항) 로드 성공 후 입력 필드를 활성화할 수 있습니다.
        document.getElementById('vexInput').disabled = false;
        document.getElementById('vexInput').placeholder = "VEX 수식을 입력하세요...";

    } catch (error) {
        // 네트워크 또는 JSON 파싱 오류 처리
        console.error("❌ VEX 데이터를 불러오거나 파싱하는 중 심각한 오류가 발생했습니다:", error);
    }
}

// 스크립트 로드 시 즉시 데이터 로드를 시작합니다.
loadVEXData();

// 3. VEX 분석 및 검색 함수 (데이터 로드 상태 확인 로직 보강)
function analyzeVEX() {
    const input = document.getElementById('vexInput').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    // 데이터 로드 상태 확인 로직
    if (vexData.length === 0) {
        outputDiv.innerHTML = '<p style="color:red;">⚠️ **VEX 데이터 로드 실패.** 콘솔 오류를 확인하거나, 잠시 후 다시 시도하세요. (파일 이름 또는 JSON 형식 문제일 수 있습니다.)</p>';
        return;
    }
    
    if (!input.trim()) {
        outputDiv.innerHTML = '<p>VEX 수식을 입력해주세요.</p>';
        return;
    }

    // 1. 단어 추출 (토큰화)
    const regex = /[A-Za-z_][A-Za-z0-9_]*|v@[A-Za-z_][A-Za-z0-9_]*/g;
    const tokensMatch = input.match(regex);
    const tokens = tokensMatch ? new Set(tokensMatch) : new Set(); 

    if (tokens.size === 0) {
        outputDiv.innerHTML = '<p>유효한 VEX 식별자나 단어를 찾을 수 없습니다.</p>';
        return;
    }

    // 2. 검색 및 결과 취합
    let foundResults = [];
    tokens.forEach(token => {
        const match = vexData.find(item => item.name === token);
        if (match) {
            foundResults.push(match);
        }
    });

    // 3. 결과 표시
    if (foundResults.length === 0) {
        outputDiv.innerHTML = `<p>입력된 수식에서 관련된 VEX 항목을 찾을 수 없습니다. (검색된 단어: ${Array.from(tokens).join(', ')})</p>`;
        return;
    }

    // ... (결과를 HTML로 표시하는 부분은 이전과 동일)
    foundResults.forEach(item => {
        const itemHtml = `
            <div class="result-item">
                <p><span class="type">**${item.type}**</span>: <span class="name">${item.name}</span></p>
                <p><strong>설명:</strong> ${item.description}</p>
                <p><strong>사용방식:</strong> <code>${item.usage}</code></p>
                <p><strong>사용예:</strong> <span class="example-code">${item.example}</span></p>
            </div>
        `;
        outputDiv.innerHTML += itemHtml;
    });
}
