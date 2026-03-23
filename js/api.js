const API_FOOTBALL = {
    BASE_URL: 'https://v3.football.api-sports.io/',
    HEADERS: {
        'x-apisports-key': '811321e8c57f96498955c095a3c86d74',
        'x-rapidapi-host': 'v3.football.api-sports.io'  // Si req
    },
    ENDPOINTS: {
        LIVE: 'fixtures?live=all',
        LALIGA: 'leagues?id=140',
        PLAYERS: 'players',
        ODDS: 'odds'
    }
};

async function fetchLive() {
    try {
        const cache = localStorage.getItem('liveMatches');
        if (cache) return JSON.parse(cache);
        const res = await fetch(API_FOOTBALL.BASE_URL + API_FOOTBALL.ENDPOINTS.LIVE, {
            headers: API_FOOTBALL.HEADERS
        });
        const data = await res.json();
        localStorage.setItem('liveMatches', JSON.stringify(data));
        setTimeout(() => localStorage.removeItem('liveMatches'), 15 * 60 * 1000);  // Refresh 15min
        return data;
    } catch (e) {
        console.log('API fallback → mocks');
        return {
            response: 200,
            results: [
                { fixture: { id: 1, status: { elapsed: 76 } }, teams: { home: { name: "Real Madrid" }, away: { name: "Atlético" } }, goals: { home: 1, away: 0 } },
                { fixture: { id: 2, status: { elapsed: 45 } }, teams: { home: { name: "Barcelona" }, away: { name: "Sevilla" } }, goals: { home: 2, away: 1 } },
                { fixture: { id: 3, status: { elapsed: 12 } }, teams: { home: { name: "Girona" }, away: { name: "Betis" } }, goals: { home: 0, away: 0 } }
            ]
        };
    }
}

// Helper fetchers
async function fetchPlayers() {
    // Basic mock/fetch stub
    return [];
}

async function fetchOdds() {
    return [];
}

