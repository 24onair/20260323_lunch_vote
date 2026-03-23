const ALL_MENUS = [
    { name: '제육볶음', emoji: '🥓', votes: 0 },
    { name: '김치찌개', emoji: '🍲', votes: 0 },
    { name: '된장찌개', emoji: '🥘', votes: 0 },
    { name: '돈까스', emoji: '🥩', votes: 0 },
    { name: '짜장면', emoji: '🍜', votes: 0 },
    { name: '짬뽕', emoji: '🥣', votes: 0 },
    { name: '비빔밥', emoji: '🥗', votes: 0 },
    { name: '순대국', emoji: '🥘', votes: 0 },
    { name: '볶음밥', emoji: '🍳', votes: 0 },
    { name: '마라탕', emoji: '🍲', votes: 0 }
];

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1fAh1--mnsSO3mz33HovHGoXJCAyYkFofZin1ml0W82w/export?format=csv';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwLk0neHYG7gGQWX5jHCZKwHtH9BTPlS5uqYbPFWG4Q5P-LPK-IvJsMA_voklmbzYW_iQ/exec';

let currentCandidates = [];
let selectedIndex = -1;

const menuGrid = document.getElementById('menuGrid');
const voteBtn = document.getElementById('voteBtn');
const votingSection = document.getElementById('votingSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const resetBtn = document.getElementById('resetBtn');
const shareBtn = document.getElementById('shareBtn');
const voterNameInput = document.getElementById('voterName');

// 구글 시트 투표 데이터 가져오기
async function fetchVotes() {
    try {
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (e) {
        console.error("데이터를 불러오는데 실패했습니다.", e);
        return [];
    }
}

// 간단한 CSV 파서
function parseCSV(csv) {
    const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
    if(lines.length <= 1) return []; // 헤더만 있거나 빈 파일인 경우
    const dataRow = lines.slice(1); // 첫 줄(헤더) 제외
    
    return dataRow.map(row => {
        // 쉼표로 분리 (데이터 내에 쉼표가 없다는 가정)
       const cols = row.split(',');
        return {
            timestamp: cols[0] ? cols[0] : '',
            menu: cols[1] ? cols[1].replace(/['"]/g, '').trim() : '',
            voter: cols[2] ? cols[2].replace(/['"]/g, '').trim() : ''
        };
    });
}

// 10개 목록에서 무작위로 4개 선택 (로컬 투표 데이터는 분리)
function selectRandomMenus() {
    // 깊은 복사 후 무작위 섞기
    const shuffled = ALL_MENUS.map(item => ({...item, votes: 0})).sort(() => 0.5 - Math.random());
    currentCandidates = shuffled.slice(0, 4);
}

// 메뉴 카드 렌더링
function renderMenuCards() {
    menuGrid.innerHTML = '';
    selectedIndex = -1;
    voteBtn.disabled = true;

    currentCandidates.forEach((menu, index) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <span class="menu-emoji">${menu.emoji}</span>
            <div class="menu-name">${menu.name}</div>
        `;
        
        card.addEventListener('click', () => {
            // 기존 선택 해제
            document.querySelectorAll('.menu-card').forEach(c => c.classList.remove('selected'));
            
            // 시각적 및 내부 상태 변경
            card.classList.add('selected');
            selectedIndex = index;
            voteBtn.disabled = false;
        });

        menuGrid.appendChild(card);
    });
}

// 구글시트 연동 및 결과 렌더링
async function renderResults() {
    resultsContainer.innerHTML = '<div style="text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>구글 시트에서 투표 데이터를 반영중입니다...</div>';
    
    // 시트에서 데이터 가져오기
    const sheetData = await fetchVotes();
    
    let allMenusWithVotes = ALL_MENUS.map(m => ({...m, votes: 0}));
    let sheetTotalVotes = 0;

    // 시트 투표 집계
    sheetData.forEach(row => {
        if(row.menu) {
            const menuObj = allMenusWithVotes.find(m => m.name === row.menu);
            if(menuObj) {
                menuObj.votes++;
            } else {
                // 시트에 우리가 모르는 메뉴가 있으면 추가
                allMenusWithVotes.push({ name: row.menu, emoji: '🍽', votes: 1 });
            }
            sheetTotalVotes++;
        }
    });

    // 방금 사용자 본인이 선택한 투표 1표 추가 (화면상 즉시 반영을 위함)
    if (selectedIndex !== -1) {
        const votedMenuName = currentCandidates[selectedIndex].name;
        const votedMenuObj = allMenusWithVotes.find(m => m.name === votedMenuName);
        if(votedMenuObj) {
            votedMenuObj.votes++;
            sheetTotalVotes++;
        }
    }

    resultsContainer.innerHTML = '';
    
    // 득표수 기준 내림차순 정렬
    allMenusWithVotes.sort((a, b) => b.votes - a.votes);
    
    // 득표수가 동일한 경우가 있는지 확인
    const maxVotes = allMenusWithVotes[0].votes;
    const isTie = allMenusWithVotes[1] && allMenusWithVotes[1].votes === maxVotes;

    allMenusWithVotes.forEach((menu, index) => {
        const percentage = sheetTotalVotes === 0 ? 0 : Math.round((menu.votes / sheetTotalVotes) * 100);
        
        const item = document.createElement('div');
        item.className = 'result-item';
        
        // 1등 표시 (득표가 0표보다 클 때)
        const isWinner = index === 0 && !isTie && menu.votes > 0;
        const icon = isWinner ? '<i class="fa-solid fa-crown winner-badge"></i> ' : '';
        
        // 1등에게는 초록색 포인트 컬러 부여
        const fillGradient = isWinner 
            ? 'linear-gradient(90deg, #10b981, #34d399)'
            : 'linear-gradient(90deg, var(--accent-2), var(--accent-3))';

        item.innerHTML = `
            <div class="result-info">
                <span>${icon}${menu.emoji} ${menu.name}</span>
                <span>${menu.votes}표 (${percentage}%)</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: 0%; background: ${fillGradient}"></div>
            </div>
        `;
        
        resultsContainer.appendChild(item);
        
        // 부드러운 게이지 차오름 효과
        setTimeout(() => {
            item.querySelector('.progress-bar-fill').style.width = `${percentage}%`;
        }, 100);
    });
}

voteBtn.addEventListener('click', async () => {
    if (selectedIndex === -1) return;
    
    // 필수 입력 체크
    const voterName = voterNameInput.value.trim();
    if (!voterName) {
        alert("투표자 이름을 입력해주세요!");
        voterNameInput.focus();
        return;
    }
    
    // 화면 전환
    votingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    const votedMenuName = currentCandidates[selectedIndex].name;
    
    // 백그라운드에서 구글 시트에 폼 전송 (POST 요청)
    const formData = new URLSearchParams();
    formData.append('menu', votedMenuName);
    formData.append('voter', voterName);
    
    // no-cors 설정으로 CORS 제약을 우회해서 백그라운드로 안전하게 값을 전송합니다.
    fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    }).catch(console.error);
    
    // 비동기 시트 결과 가져오기 및 그려주기 호출
    await renderResults();
});

resetBtn.addEventListener('click', () => {
    // 초기 뷰로 돌아가며 메뉴 재선택 적용
    voterNameInput.value = ''; // 이름란 초기화
    selectRandomMenus();
    renderMenuCards();
    
    resultsSection.classList.add('hidden');
    votingSection.classList.remove('hidden');
});

shareBtn.addEventListener('click', () => {
    shareBtn.innerHTML = '복사 완료! <i class="fa-solid fa-check"></i>';
    setTimeout(() => {
        shareBtn.innerHTML = '친구들에게 공유하기 <i class="fa-solid fa-share-nodes"></i>';
    }, 2000);
});

// 시작시 구동
selectRandomMenus();
renderMenuCards();
