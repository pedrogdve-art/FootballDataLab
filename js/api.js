const API_FOOTBALL = {
    BASE_URL: 'https://v3.football.api-sports.io/',
    HEADERS: {
        'x-apisports-key': '811321e8c57f96498955c095a3c86d74'
    },
    ENDPOINTS: {
        LIVE: 'fixtures?live=all',
        LALIGA: 'leagues?id=140',
        PLAYERS: 'players',
        ODDS: 'odds'
    },
    CACHE_DURATION: 15 * 60 * 1000 // 15 minutes
};

const fallbackLiveData = [
    { fixture: { id: 1, status: { elapsed: 76 } }, teams: { home: { name: "Real Madrid" }, away: { name: "Atlético" } }, goals: { home: 1, away: 0 } },
    { fixture: { id: 2, status: { elapsed: 45 } }, teams: { home: { name: "Barcelona" }, away: { name: "Sevilla" } }, goals: { home: 2, away: 1 } },
    { fixture: { id: 3, status: { elapsed: 12 } }, teams: { home: { name: "Girona" }, away: { name: "Betis" } }, goals: { home: 0, away: 0 } }
];

async function fetchLiveMatches() {
    try {
        const cache = localStorage.getItem('liveMatches');
        if (cache) return JSON.parse(cache);

        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = encodeURIComponent(API_FOOTBALL.BASE_URL + API_FOOTBALL.ENDPOINTS.LIVE);

        const response = await fetch(proxyUrl + targetUrl, {
            headers: API_FOOTBALL.HEADERS
        });

        const data = await response.json();

        // API-Football returns the actual array of objects inside `data.response`
        if (data && data.response && Array.isArray(data.response) && data.response.length > 0) {
            localStorage.setItem('liveMatches', JSON.stringify(data.response));
            setTimeout(() => localStorage.removeItem('liveMatches'), API_FOOTBALL.CACHE_DURATION);
            return data.response;
        } else {
            console.warn('API returned empty or invalid data, using fallback.');
            return fallbackLiveData;
        }
    } catch (error) {
        console.error('Live API fail:', error);
        return fallbackLiveData;
    }
}
