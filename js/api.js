const API_FOOTBALL = {
    BASE_URL: 'https://v3.football.api-sports.io/',
    // HEADERS: { 'x-apisports-key': 'TU_NUEVA_KEY_AQUI' }, // Regístrate: https://api-sports.io/
    ENDPOINTS: { LIVE: 'fixtures?live=all' },
    CACHE_DURATION: 15 * 60 * 1000 // 15 minutes
};

const BIG5_LEAGUES = { 'Premier League': 39, 'La Liga': 140, 'Serie A': 135, 'Bundesliga': 78, 'Ligue 1': 61 };

const fallbackLiveData = [
    { fixture: { id: 1, status: { elapsed: 76 } }, teams: { home: { name: "Real Madrid" }, away: { name: "Atlético" } }, goals: { home: 1, away: 0 } },
    { fixture: { id: 2, status: { elapsed: 45 } }, teams: { home: { name: "Barcelona" }, away: { name: "Sevilla" } }, goals: { home: 2, away: 1 } },
    { fixture: { id: 3, status: { elapsed: 12 } }, teams: { home: { name: "Girona" }, away: { name: "Betis" } }, goals: { home: 0, away: 0 } }
];

async function fetchLiveMatches() {
    try {
        const cache = localStorage.getItem('liveMatches');
        if (cache) return JSON.parse(cache);

        const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(API_FOOTBALL.BASE_URL + API_FOOTBALL.ENDPOINTS.LIVE);
        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);

        if (data.response?.length > 0) {
            localStorage.setItem('liveMatches', JSON.stringify(data.response));
            setTimeout(() => localStorage.removeItem('liveMatches'), API_FOOTBALL.CACHE_DURATION);
            return data.response.slice(0, 5);
        }
        return fallbackLiveData;
    } catch (error) {
        console.error('Live API fail:', error);
        return fallbackLiveData;
    }
}

async function fetchBig5Live(leagueName) {
    try {
        const id = BIG5_LEAGUES[leagueName] || 140;
        const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(`${API_FOOTBALL.BASE_URL}fixtures?live=all&league=${id}`);

        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);

        return data?.response || [];
    } catch (e) {
        console.error(`Error fetching Big5 Live for ${leagueName}:`, e);
        return [];
    }
}

async function fetchBig5Players(leagueName) {
    try {
        const id = BIG5_LEAGUES[leagueName] || 140;
        const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(`${API_FOOTBALL.BASE_URL}players?league=${id}&season=2026`);

        const response = await fetch(proxyUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents);

        return data?.response || [];
    } catch (e) {
        console.error(`Error fetching Big5 Players for ${leagueName}:`, e);
        return [];
    }
}
