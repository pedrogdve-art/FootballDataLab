/**
 * MAIN.JS - FootballDataLab 
 * Handles DOM integration, Theme toggling, and Widget populations.
 */

document.addEventListener("DOMContentLoaded", () => {

    // --- Theme Toggle ---
    const themeBtn = document.getElementById('themeToggle');
    const htmlTag = document.documentElement;
    // Check system preference mapping to UX standard
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (prefersLight && !localStorage.getItem('theme')) {
        htmlTag.setAttribute('data-theme', 'light');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = htmlTag.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlTag.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeBtn.innerHTML = newTheme === 'dark' ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    });

    // Reset Icon on load
    if (htmlTag.getAttribute('data-theme') === 'light') {
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }


    // --- Particles JS Background Effect (Performance Optimised) ---
    // Only load full particles on Desktop to save battery/perf on mobile
    if (window.innerWidth > 768 && typeof particlesJS !== "undefined") {
        particlesJS("particles-js", {
            "particles": {
                "number": { "value": 40, "density": { "enable": true, "value_area": 800 } },
                "color": { "value": ["#ef4444", "#2563eb", "#ffffff"] },
                "shape": { "type": "circle" },
                "opacity": { "value": 0.3, "random": false },
                "size": { "value": 3, "random": true },
                "line_linked": { "enable": true, "distance": 150, "color": "#ffffff", "opacity": 0.1, "width": 1 },
                "move": { "enable": true, "speed": 1.5, "direction": "none", "random": true, "out_mode": "out" }
            },
            "interactivity": {
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": false }
                },
                "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 0.3 } } }
            },
            "retina_detect": true
        });
    }

    // --- POPULATE FASE 1 WIDGETS ---

    /** Widget 1: Live API Data */
    async function loadLiveMatches() {
        const container = document.getElementById('live-matches-container');
        try {
            const matches = await fetchLiveMatches();
            container.innerHTML = ''; // Clear skeleton

            if (!matches || matches.length === 0) {
                container.innerHTML = '<p class="stat-row text-muted">No hay lives ahora. Actualiza en 15s.</p>';
                return;
            }

            // Take top 3
            matches.slice(0, 3).forEach(m => {
                const home = m.teams?.home?.name || 'Local';
                const away = m.teams?.away?.name || 'Visitante';
                const homeG = m.goals?.home ?? 0;
                const awayG = m.goals?.away ?? 0;
                const time = m.fixture?.status?.elapsed ? `${m.fixture.status.elapsed}'` : 'ON';

                container.innerHTML += `
                    <div class="match-row">
                        <span>${home} ${homeG} - ${awayG} ${away}</span>
                        <span class="match-live">[${time}]</span>
                    </div>
                `;
            });
            container.innerHTML += `<div class="match-row" style="color:var(--text-muted); font-size:0.8rem; margin-top:10px;">LIVE: ${matches.length} matches tracked</div>`;
        } catch (e) {
            container.innerHTML = '<p class="stat-row text-red">Error loading live data.</p>';
        }
    }

    /** Widget 2: Kaggle Stats Mock (Phase 2 Prep) */
    function loadKaggleMock() {
        const container = document.getElementById('kaggle-stats-container');
        // Simulated local rapid stats
        setTimeout(() => {
            container.innerHTML = `
                <div class="stat-row">
                    <strong>Top Goleador:</strong> <span>Mbappé (23g)</span>
                </div>
                <div class="stat-row">
                    <strong>Eficacia:</strong> <span class="text-green">1.39/90 min</span>
                </div>
                <div class="stat-row">
                    <strong>Top Duelos:</strong> <span>Araujo (68%)</span>
                </div>
            `;
        }, 500); // UI visual delay
    }

    /** Widget 3: Historical Mock */
    function loadHistoricalMock() {
        const container = document.getElementById('historical-container');
        setTimeout(() => {
            container.innerHTML = `
                <div class="stat-row">
                    <strong>Pichichi '24:</strong> <span>Dovbyk (24g)</span>
                </div>
                <div class="stat-row">
                    <strong>Bota Oro '25:</strong> <span class="text-gold">Mbappé (31g)</span>
                </div>
            `;
        }, 600);
    }

    // Execute Widget Loading Pipeline
    loadLiveMatches();
    loadKaggleMock();
    loadHistoricalMock();

    // Setup Live Auto-Update Interval (15s)
    setInterval(() => {
        // Subtle visual refresh cue
        const liveContainer = document.getElementById('live-matches-container');
        liveContainer.style.opacity = 0.5;
        loadLiveMatches().then(() => liveContainer.style.opacity = 1);
    }, API_FOOTBALL.CACHE_DURATION);

    // Call Explorer Phase 2 Init
    explorerApp.init();

    // Call Modal Phase 3 Init
    if (typeof playerModalApp !== 'undefined') {
        playerModalApp.init();
    }

    // Call Market Phase 4 Init
    marketApp.init();
});

// ====== FASE 2: BIG 5 EXPLORER ENGINE ====== //
const explorerApp = {
    allPlayers: [],
    dataTable: null,

    async init() {
        this.cacheDOM();
        this.bindEvents();
        await this.loadData();
    },

    cacheDOM() {
        this.tableHeaders = document.getElementById('tableHeaders');
        this.fLiga = document.getElementById('filterLiga');
        this.fPos = document.getElementById('filterPos');

        // Hide manual UI elements replaced by DataTables
        const searchBox = document.querySelector('.search-box');
        const sortBox = document.getElementById('sortData');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        const playerCount = document.getElementById('playerCount');
        if (searchBox) searchBox.style.display = 'none';
        if (sortBox) sortBox.parentElement.style.display = 'none';
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (playerCount) playerCount.style.display = 'none';
    },

    bindEvents() {
        if (!this.fLiga) return;
        ['change'].forEach(evt => {
            this.fLiga.addEventListener(evt, () => this.applyFilters());
            this.fPos.addEventListener(evt, () => {
                this.updateTableHeaders();
                this.applyFilters();
            });
        });
    },

    updateTableHeaders() {
        const pos = this.fPos.value;
        let html = `<th>Jugador</th><th>Equipo</th><th>Liga</th>`;

        if (pos === 'FW' || pos === 'MF' || pos === 'all') {
            html += `<th>Goles/90</th><th>xG</th><th>xAG</th><th>PrgP</th>`;
        } else if (pos === 'DF') {
            html += `<th>Duelos%</th><th>Tackles</th><th>Aerials%</th><th>PrgP</th>`;
        } else if (pos === 'GK') {
            html += `<th>PI%</th><th>Saves/90</th><th>Rating</th><th>PSxG+/-</th>`;
        }
        html += `<th>MV(€)</th>`;
        this.tableHeaders.innerHTML = html;
    },

    async loadData() {
        try {
            const res = await fetch('data/big5_kaggle.json');
            this.allPlayers = await res.json();
            // Add ID if missing
            this.allPlayers.forEach((p, index) => { if (!p.id) p.id = index; });
            this.updateTableHeaders();
            this.applyFilters();
        } catch (e) {
            console.error('[Kaggle Data] Could not load Big 5 JSON', e);
        }
    },

    applyFilters() {
        if ($.fn.DataTable.isDataTable('#explorerTable')) {
            $('#explorerTable').DataTable().destroy();
        }

        const liga = this.fLiga.value;
        const pos = this.fPos.value;
        const tbody = document.getElementById('explorerBody');

        let filteredPlayers = this.allPlayers.filter(p => {
            const mLiga = liga === 'all' || p.liga === liga;
            const mPos = pos === 'all' || p.pos === pos;
            return mLiga && mPos;
        });

        let rows = '';
        filteredPlayers.forEach(p => {
            let contextCells = '';
            const mapPos = pos.toUpperCase();
            if (mapPos === 'FW' || mapPos === 'MF' || mapPos === 'ALL') {
                contextCells = `
                    <td class="metric-high">${p.goles90 || p['goles/90'] || p.goles_90 || 0.00}</td>
                    <td>${p.xg || p.xG || 0.0}</td>
                    <td>${p.xag || p.xAG || 0.0}</td>
                    <td>${p.prgp || p.PrgP || p['PrgP/90'] || 0.0}</td>
                `;
            } else if (mapPos === 'DF') {
                contextCells = `
                    <td class="metric-high">${p.duelos || p.duels || p['duels won'] || p['duelos%'] || 0}%</td>
                    <td>${p.tackles || p['tackles90'] || p.tackles90 || 0}</td>
                    <td>${p.aerials || p['aerial won'] || p['aerials won'] || p['aerials%'] || 0}%</td>
                    <td>${p.prgp || p.PrgP || p['PrgP/90'] || 0.0}</td>
                `;
            } else if (mapPos === 'GK') {
                contextCells = `
                    <td class="metric-high">${p.pi || p['playing time pi'] || p['PI'] || p['pi%'] || 0}%</td>
                    <td>${p.saves90 || p.saves || p['saves/90'] || p['saves_90'] || 0}</td>
                    <td>${p.rating || p.Rating || 0}</td>
                    <td>${p.psxg || p.psxG || p['ps-xG'] || p['psxg+/-'] || 0}</td>
                `;
            }

            rows += `
                <tr style="cursor:pointer;" onclick="window.location.hash='#modal-container'; document.dispatchEvent(new CustomEvent('openPlayerModal', {detail: '${p.jugador}'}));">
                    <td class="col-player">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <div class="img-thumb" style="width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;font-size:12px;"><i class="fa-solid fa-user"></i></div>
                            <div>
                                ${p.jugador} <span class="badge ${p.pos === 'FW' ? 'badge-red' : (p.pos === 'GK' ? 'badge-green' : 'badge-blue')}" style="font-size:0.6rem;padding:2px 4px;margin-left:4px;">${p.pos}</span>
                            </div>
                        </div>
                    </td>
                    <td class="col-team">${p.equipo}</td>
                    <td>${p.liga}</td>
                    ${contextCells}
                    <td class="tag-mv">€${p.mv || '0'}m</td>
                </tr>
            `;
        });

        tbody.innerHTML = rows;

        this.dataTable = $('#explorerTable').DataTable({
            responsive: true,
            language: { url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json' },
            pageLength: 10,
            order: [[3, 'desc']],
            dom: '<"top"f>rt<"bottom"p><"clear">',
            initComplete: function () {
                $('.dataTables_filter input').addClass('form-control');
                $('.dataTables_filter input').css({ 'background': 'rgba(0,0,0,0.2)', 'border': '1px solid #2563eb', 'color': 'white', 'padding': '5px', 'border-radius': '5px' });
                $('.dataTables_wrapper .top').css({ 'margin-bottom': '15px' });
            }
        });
    }
};

// ====== FASE 4: MARKET VALUE ENGINE ====== //
const marketApp = {
    init() {
        // Wait briefly for explorerApp to load Kaggle data in the background
        setTimeout(() => this.renderMarketTable(), 800);
    },

    renderMarketTable() {
        const tbody = document.getElementById('marketTableBody');
        if (!tbody || explorerApp.allPlayers.length === 0) return;

        // Calculate custom "ValueScore" based on simple efficiency vs MV
        const playersWithScore = explorerApp.allPlayers.map(p => {
            let eff = (p.goles90 || 0) + (p.xg || 0) + (p.xag || 0);
            if (p.posicion === 'DF') eff = (p.duelos || 0) / 10 + (p.prgp || 0);
            if (p.posicion === 'GK') eff = (p.save || 0) / 10 + (p.psxg || 0);

            // Artificial Score: Efficiency / Market Value * Factor (Clamped to 100)
            let rawScore = p.mv ? (eff / p.mv) * 450 : 0;
            if (p.mv < 40) rawScore += 20; // Bonus hidden gems
            let finalScore = Math.min(Math.round(rawScore), 99);

            return { ...p, valueScore: finalScore, odds: (Math.random() * 2 + 1.2).toFixed(2) };
        });

        // Sort by highest ValueScore
        playersWithScore.sort((a, b) => b.valueScore - a.valueScore);

        // Render top 5
        let html = '';
        playersWithScore.slice(0, 5).forEach(p => {
            const isHigh = p.valueScore >= 80 ? 'high' : '';
            html += `
                <tr onclick="window.location.hash='#modal-container'; document.dispatchEvent(new CustomEvent('openPlayerModal', {detail: '${p.id}'}));">
                    <td class="col-player">
                        <div class="img-thumb"></div> 
                        ${p.jugador} <span class="badge ${p.posicion === 'FW' ? 'badge-red' : 'badge-blue'}">${p.posicion}</span>
                    </td>
                    <td class="tag-mv">€${p.mv || 0}m</td>
                    <td class="text-muted">@${p.odds}</td>
                    <td><span class="badge-score ${isHigh}">${p.valueScore}</span></td>
                </tr>
            `;
        });

        tbody.innerHTML = html;

        // Heatmap Mock logic
        const heatmap = document.querySelector('.heatmap-placeholder');
        if (heatmap) heatmap.innerHTML = `<i class="fa-solid fa-chart-scatter text-green fa-4x opacity-50"></i><br/>Visualización D3.js/Chart.js Lista para conectar`;
    }
};

// ====== FASE 6: CONTACT FORM VALIDATION ====== //
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Basic Custom Validation
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        let valid = true;

        if (name.value.trim() === '') {
            name.nextElementSibling.style.display = 'block';
            valid = false;
        } else {
            name.nextElementSibling.style.display = 'none';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            email.nextElementSibling.style.display = 'block';
            valid = false;
        } else {
            email.nextElementSibling.style.display = 'none';
        }

        if (valid) {
            // Mock Action depending on Radio choice
            const option = document.querySelector('input[name="platform"]:checked').value;
            console.log(`[Form] Request simulated securely via: ${option}`);

            const btn = form.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...';
            btn.style.opacity = '0.7';

            setTimeout(() => {
                document.getElementById('formSuccess').classList.remove('hidden');
                btn.innerHTML = 'Enviado <i class="fa-solid fa-check"></i>';
                btn.style.background = 'var(--color-green)';
                btn.classList.remove('btn-glow');
            }, 1000);
        }
    });
});

