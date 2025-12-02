let vexData = [];

async function loadVEXData() {
    console.log("데이터 로드를 시작합니다...");
    try {
        const response = await fetch('vex_reference.json');
        
        // 1. 응답 상태 확인
        if (!response.ok) {
            console.error(`Fetch Error! Status: ${response.status} - 파일 이름을 다시 확인하세요.`);
            return; // 파일 로드 실패 시 함수 종료
        }
        
        // 2. JSON 파싱 시도 (response.ok가 true일 때만 실행됨)
        vexData = await response.json(); // <-- 이 부분이 if 블록 밖에 있어야 합니다.
        
        console.log(`✅ VEX 데이터 로드 및 파싱 완료: ${vexData.length} 개 항목`);

        const vexInput = document.getElementById('vexInput');
        if (vexInput) {
            vexInput.disabled = false;
            vexInput.placeholder = "VEX 수식을 입력하세요...";
        }

    } catch (error) {
        // ...
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
    
 // ... (analyzeVEX 함수의 시작 부분)

// 1. 단어 추출 (토큰화): 사용자가 입력한 단어(Cd)만 토큰으로 사용
const input_token = input.trim(); // "Cd"

if (!input_token) {
    outputDiv.innerHTML = '<p>VEX 수식을 입력해주세요.</p>';
    return;
}

// 2. 검색 및 결과 취합 (부분 일치 검색으로 변경)
let foundResults = [];

// vexData 전체를 순회하면서 이름에 input_token이 포함된 항목을 찾습니다.
vexData.forEach(item => {
    // 검색어와 관련된 항목이 이름(name)에 포함되어 있는지 확인합니다.
    // 대소문자를 무시하고 검색하려면, 모두 소문자로 변환하여 비교합니다.
    const itemNameLower = item.name.toLowerCase();
    const inputTokenLower = input_token.toLowerCase();

    // name에 'Cd'가 포함되거나, '@Cd'가 포함되는 모든 항목을 찾습니다.
    if (itemNameLower.includes(inputTokenLower)) {
        foundResults.push(item);
    }
    
    // 추가 로직: 'Cd'를 입력했을 때 '@Cd'도 찾으려면, 
    // JSON 데이터에 '@Cd' 또는 'Cd'가 있어야 합니다.
});

// 3. 결과 표시
// ... (이후 결과 표시 코드는 동일)

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
