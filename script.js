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

let currentCandidates = [];
let selectedIndex = -1;
let totalVotes = 0;

const menuGrid = document.getElementById('menuGrid');
const voteBtn = document.getElementById('voteBtn');
const votingSection = document.getElementById('votingSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const resetBtn = document.getElementById('resetBtn');
const shareBtn = document.getElementById('shareBtn');

// Select 4 random menus from the top 10 list
function selectRandomMenus() {
    totalVotes = 0;
    
    // Deep copy and shuffle array
    const shuffled = ALL_MENUS.map(item => ({...item})).sort(() => 0.5 - Math.random());
    currentCandidates = shuffled.slice(0, 4);
    
    // Base random votes strictly to simulate a "live" dynamic feeling
    currentCandidates.forEach(candidate => {
        candidate.votes = Math.floor(Math.random() * 50); // Random votes up to 49
        totalVotes += candidate.votes;
    });
}

// Render menu selection cards
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
            // Remove previous selections
            document.querySelectorAll('.menu-card').forEach(c => c.classList.remove('selected'));
            
            // Add selection visually and internally
            card.classList.add('selected');
            selectedIndex = index;
            voteBtn.disabled = false;
        });

        menuGrid.appendChild(card);
    });
}

// Ensure smooth animations for progress bars
function renderResults() {
    resultsContainer.innerHTML = '';
    
    // Sort array by highest vote count
    const sortedCandidates = [...currentCandidates].sort((a, b) => b.votes - a.votes);
    
    // Check if there is a distinct winner
    const maxVotes = sortedCandidates[0].votes;
    const isTie = sortedCandidates[1] && sortedCandidates[1].votes === maxVotes;

    sortedCandidates.forEach((menu, index) => {
        const percentage = totalVotes === 0 ? 0 : Math.round((menu.votes / totalVotes) * 100);
        
        const item = document.createElement('div');
        item.className = 'result-item';
        
        const isWinner = index === 0 && !isTie;
        const icon = isWinner ? '<i class="fa-solid fa-crown winner-badge"></i> ' : '';
        
        // Winner gets special accent color
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
        
        // Trigger CSS transition
        setTimeout(() => {
            item.querySelector('.progress-bar-fill').style.width = `${percentage}%`;
        }, 100);
    });
}

voteBtn.addEventListener('click', () => {
    if (selectedIndex === -1) return;
    
    // Add user vote
    currentCandidates[selectedIndex].votes++;
    totalVotes++;
    
    // Switch Views
    votingSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Render and animate results
    renderResults();
});

resetBtn.addEventListener('click', () => {
    // Return to initial view and select 4 new random ones
    selectRandomMenus();
    renderMenuCards();
    
    resultsSection.classList.add('hidden');
    votingSection.classList.remove('hidden');
});

shareBtn.addEventListener('click', () => {
    // Optional: dummy share button response
    shareBtn.innerHTML = '복사 완료! <i class="fa-solid fa-check"></i>';
    setTimeout(() => {
        shareBtn.innerHTML = '친구들에게 공유하기 <i class="fa-solid fa-share-nodes"></i>';
    }, 2000);
});

// Initialize logic
selectRandomMenus();
renderMenuCards();
