const CACHE_NAME = 'football-lab-v1';
const ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/main.js',
    './js/api.js',
    './js/charts.js',
    './data/big5_kaggle.json',
    './data/historical.json',
    './manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});

