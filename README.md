# Football Data Lab 📈

Aplicación premium de *Scouting & Analytics* para las 5 grandes ligas (Big 5) 25/26. Integra métricas avanzadas (xG, xAG, PrgP) y el uso en directo de la API de Football (`api-sports.io`) con estrategias evasivas de CORS y optimización para caché.

## 🚀 Despliegue en GitHub Pages (v3.0)

Este repositorio ha sido configurado para operar de forma estática en la raíz:
- **Site URL**: [https://pedrogdve-art.github.io/FootballDataLab/](https://pedrogdve-art.github.io/FootballDataLab/)
- **Live Matches Fetching**: Servido mediante un proxy intermedio `api.allorigins.win/get` con parsing customizado a `.contents` para evadir bloqueos severos de navegadores y Rate Limits.
- **Progressive Web App (PWA)**: Incluye `manifest.json` y `sw.js` funcionales para instalación nativa.

## 🛠️ Stack Tecnológico
- **UI/UX**: HTML5 Semántico + Vanilla CSS con *Glassmorphism* (Backdrop-filter) y Paleta Oscura "Neon" (Tailwind no requerido).
- **Core Engine**: Vanilla JS, ES6 Modules.
- **Gráficos y Visualización**: `Chart.js` (Radar, Bar, Line).
- **Tratamiento Masivo de Tablas**: `DataTables.net` (jQuery) optimizado y unificado para llaves de Kaggle en diferentes dialectos (Spanglish variables).

## 🏆 Uso de API Key (Live Data)
Por defecto, e internamente en `js/api.js`, la key para extraer datos en vivo es: **811321e8c57f96498955c095a3c86d74**. Esta key se pasa implícitamente, pero si tienes problemas de *quota diaria*, puedes habilitarla en las `HEADERS` directamente:

1. Regístrate en [API-Sports](https://api-sports.io/).
2. Reemplaza la cabecera en `api.js`:
    ```javascript
    HEADERS: {
      'x-apisports-key': 'TU_NUEVA_KEY',
      'x-rapidapi-host': 'v3.football.api-sports.io'
    }
    ```
*(Por motivos de seguridad y GitHub Pages, se ha implementado un fallback en Duro local si la red está saturada).*

## 📌 Guía de Despliegue para Actualizaciones
```bash
git add .
git commit -m "Update"
git push origin main
```
Luego espera 1 minuto a que GitHub Actions (`pages build and deployment`) consolide los ficheros en la URL pública.
