let vexData = [];

// 1. JSON 데이터 로드 함수
async function loadVEXData() {
    try {
        const response = await fetch('vex_reference.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        vexData = await response.json();
        console.log("VEX 데이터 로드 완료:", vexData.length, "개 항목");
    } catch (error) {
        console.error("VEX 데이터를 불러오는 데 실패했습니다:", error);
    }
}

// 스크립트 실행 시 바로 데이터 로드를 시작
loadVEXData();

// 2. VEX 분석 및 검색 함수
function analyzeVEX() {
    const input = document.getElementById('vexInput').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    // 데이터 로드 확인 (아직 로드되지 않았다면 경고)
    if (vexData.length === 0) {
        outputDiv.innerHTML = '<p>⚠️ VEX 데이터베이스를 로드 중입니다. 잠시 후 다시 시도하거나, `vex_reference.json` 파일의 존재 여부 및 경로를 확인해주세요.</p>';
        return;
    }
    
    if (!input.trim()) {
        outputDiv.innerHTML = '<p>VEX 수식을 입력해주세요.</p>';
        return;
    }

    // 1. 단어 추출 (토큰화)
    const regex = /[A-Za-z_][A-Za-z0-9_]*|v@[A-Za-z_][A-Za-z0-9_]*/g;
    const tokensMatch = input.match(regex);
    const tokens = tokensMatch ? new Set(tokensMatch) : new Set(); // 추출된 단어가 없을 경우 대비

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
