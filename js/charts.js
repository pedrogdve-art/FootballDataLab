/**
 * CHARTS.JS - FootballDataLab 
 * Modal logic and Chart.js instantiation for Phase 3.
 */

const playerModalApp = {
    radarInstance: null,
    barInstance: null,

    init() {
        this.cacheDOM();
        this.bindEvents();
    },

    cacheDOM() {
        this.modal = document.getElementById('playerModal');
        this.closeBtn = document.getElementById('closeModal');
        // Bio DOM
        this.nameEl = document.getElementById('modalPlayerName');
        this.teamEl = document.getElementById('modalPlayerTeam');
        this.posEl = document.getElementById('modalPos');
        this.mvEl = document.getElementById('modalMV');
        this.minEl = document.getElementById('modalMin');
        // Chart CANVASES
        this.radarCanvas = document.getElementById('radarChart');
        this.barCanvas = document.getElementById('barChart');
        // AI Prompt
        this.promptText = document.getElementById('aiPrompt');
    },

    bindEvents() {
        // Document listener dispatched by main.js Explorer table rows
        document.addEventListener('openPlayerModal', (e) => {
            const playerId = e.detail;
            this.openModal(playerId);
        });

        // Close logic
        this.closeBtn.addEventListener('click', () => this.closeDialog());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeDialog();
        });
    },

    closeDialog() {
        this.modal.classList.add('fade-out');
        setTimeout(() => {
            this.modal.close();
            this.modal.classList.remove('fade-out');
        }, 300); // Wait for transition
    },

    openModal(playerId) {
        // Find player from Explorer global array
        const p = explorerApp.allPlayers.find(x => x.id === playerId);
        if (!p) return;

        // Populate Left Panel (Bio & Mocked match)
        this.nameEl.innerText = p.jugador;
        this.teamEl.innerText = `${p.equipo} • ${p.liga}`;
        this.posEl.innerText = p.posicion;
        this.mvEl.innerText = p.mv ? `€${p.mv}m` : 'N/A';
        this.minEl.innerText = p.minutos;

        // Generate AI Prompt Strategy
        this.promptText.innerText = this.generatePromptContext(p);

        // Determine Theme Colors
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#94a3b8' : '#64748b';

        Chart.defaults.color = textColor;
        Chart.defaults.font.family = 'Inter';

        // Initialize Charts (Simulating % percentiles by mapping pure stats loosely)
        this.renderRadar(p, gridColor);
        this.renderBar(p, gridColor);

        // Open Dialog natively
        this.modal.showModal();
        this.modal.classList.add('fade-in-modal');
    },

    generatePromptContext(p) {
        return `Evalúa a ${p.jugador} (${p.equipo}) perfil completo: MV €${p.mv}m. 
Destaca: Posición ${p.posicion}, Goles90: ${p.goles90 || 0} vs xG: ${p.xg || 0}, 
Progresión(PrgP): ${p.prgp || 0}. Análisis táctico, valor de mercado sostenible 
vs percentil Big 5 europeo. Hazlo estructurado (estilo scout profesional), máximo 350 palabras.`;
    },

    renderRadar(p, gridCol) {
        if (this.radarInstance) this.radarInstance.destroy();

        // Very loose mock of percentiles based on pure stats array mapping
        // FW/MF focus: Goles, xG, xAG, Tiros, PrgP
        // DF focus: Duelos, Tackles, Int, Clr, Aerials
        const isDef = p.posicion === 'DF';
        const isGK = p.posicion === 'GK';

        const labels = isDef ?
            ['Duelos', 'Tackles', 'Int', 'Clear', 'Aerials', 'PrgP', 'Pases', 'Faltas'] :
            isGK ?
                ['PI%', 'GA90', 'Save%', 'PSxG', 'Cross', 'Throws', 'Pass', 'Launch'] :
                ['Goles/90', 'xG', 'xAG', 'Tiros', 'PrgP', 'Duelos', 'Asist', 'Regates'];

        const data1 = isDef ?
            [p.duelos || 50, (p.tackles * 20) || 40, (p.int * 30) || 40, (p.clr * 15) || 50, p.aerials || 50, (p.prgp * 8) || 40, 60, 45] :
            isGK ?
                [p.pi || 50, 100 - (p.ga90 * 40), p.save || 50, 50 + (p.psxg * 5) || 50, p.crossstop * 3 || 50, 60, 55, 70] :
                [(p.goles90 * 60) || 30, (p.xg * 4) || 30, (p.xag * 6) || 30, (p.tiros90 * 15) || 30, (p.prgp * 8) || 30, p.duelos || 40, 50, 65];

        const ctx = this.radarCanvas.getContext('2d');
        this.radarInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: p.jugador,
                    data: data1,
                    backgroundColor: 'rgba(37, 99, 235, 0.2)', // Atleti Blue transparent
                    borderColor: 'rgba(37, 99, 235, 1)',
                    pointBackgroundColor: 'rgba(239, 68, 68, 1)', // Atleti Red dots
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: gridCol },
                        grid: { color: gridCol },
                        pointLabels: { font: { size: 10 } },
                        ticks: { display: false, min: 0, max: 100 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    },

    renderBar(p, gridCol) {
        if (this.barInstance) this.barInstance.destroy();

        let labels = ['Real', 'Expected'];
        let series1 = []; let series2 = [];

        if (p.posicion === 'GK') {
            labels = ['GA90', 'Save%', 'PI%'];
            series1 = [p.ga90 || 0, p.save || 0, p.pi || 0];
        } else if (p.posicion === 'DF') {
            labels = ['Duelos', 'Aéreos'];
            series1 = [p.duelos || 0, p.aerials || 0];
        } else {
            labels = ['Goles', 'xG', 'xAG'];
            series1 = [p.goles || 0, p.xg || 0, p.xag || 0];
        }

        const ctx = this.barCanvas.getContext('2d');
        this.barInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Métricas Reales/Expected',
                    data: series1,
                    backgroundColor: ['rgba(37, 99, 235, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: gridCol } },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

