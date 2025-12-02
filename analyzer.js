let vexData = [];

async function loadVEXData() {
    console.log("데이터 로드를 시작합니다...");
    try {
        const response = await fetch('vex_reference.json');
        
        if (!response.ok) {
            console.error(`Fetch Error! Status: ${response.status} - 파일 이름을 다시 확인하세요.`);
            return; 
        }
        
        vexData = await response.json();
        console.log(`✅ VEX 데이터 로드 및 파싱 완료: ${vexData.length} 개 항목`);

        // 로드 성공 시 입력 필드 활성화
        const vexInput = document.getElementById('vexInput');
        if (vexInput) {
            vexInput.disabled = false;
            vexInput.placeholder = "VEX 수식을 입력하세요...";
        }

    } catch (error) {
        console.error("❌ VEX 데이터를 불러오거나 파싱하는 중 오류가 발생했습니다:", error);
    }
}

loadVEXData();

function analyzeVEX() {
    const input = document.getElementById('vexInput').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    if (vexData.length === 0) {
        outputDiv.innerHTML = '<p style="color:red;">⚠️ **VEX 데이터 로드 실패.** 콘솔 오류를 확인하거나, 잠시 후 다시 시도하세요.</p>';
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

    foundResults.forEach(item => {
        const itemHtml = `
            <div class="result-item">
                <p><span class="type"><strong>${item.type}</strong></span>: <span class="name">${item.name}</span></p>
                <p><strong>설명:</strong> ${item.description}</p>
                <p><strong>사용방식:</strong> <code>${item.usage}</code></p>
                <p><strong>사용예:</strong> <span class="example-code">${item.example}</span></p>
            </div>
        `;
        outputDiv.innerHTML += itemHtml;
    });
}
