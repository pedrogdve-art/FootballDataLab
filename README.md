# Football Data Lab 📈

## 🏆 Proyecto de Análisis Avanzado Big 5
Plataforma de Scouting interactiva (PWA Ready) para visualizar datos estadísticos procedentes de Kaggle fusionados con resultados en directo de la **API-Sports**.

### 🔧 ChangeLog (v3.0.0)
- **UTF-8 Fix**: Todos los caracteres, tildes (Mbappé) y símbolos de UI renderizan correctamente.
- **Posiciones Robustas**: El motor de `DataTables` renderiza el 100% de las celdas (DF, MF, GK, FW) mapeando inteligentemente diversas nomenclaturas del dataset JSON nativo (`duels won`, `playing time pi`, `xG`...).
- **CORS API Proxy Seguro**: El fetcher en vivo ahora usa `api.allorigins.win/get` con JSON parser para evadir bloqueos de infraestructura en GitHub Pages y ocultar el volcado de la clave cruda si no hay *headers* de Request.
- **Multi-Liga Big 5**: Funciones implementadas (`fetchBig5Live`, `fetchBig5Players`) para atacar las 5 grandes ligas mediante Selectors.
- **UI Premium Cases**: Inyectado UI mock interactivo para Análisis de Duelos de xG, Defensas Serie A jóvenes y Simulación de táctica del Atleti.

### 🔑 API Key Setup (Instrucciones)
Actualmente, si la clave se satura (límite de peticiones de capa gratuita), saltará un fallback. Para habilitar un flujo 100% permanente:
1. Regístrate gratuitamente en [API-Sports](https://api-sports.io/register).
2. Obtén tu nueva `x-apisports-key`.
3. Edita el archivo `js/api.js` y descomenta las HEADERS dentro de `API_FOOTBALL`:
```javascript
HEADERS: {
    'x-apisports-key': 'TU_NUEVA_CLAVE_AQUÍ'
}
```

### 🚀 Despliegue en GitHub Pages
Para desplegar futuras versiones en producción, simplemente ejecuta los comandos desde la RAÍZ del proyecto (`FootballDataLab`):
```bash
git add .
git commit -m "UI Updates"
git push origin main
```
Espera 1 minuto a que GitHub Actions termine, y podrás ver la web live sin errores 404.

### 💻 Test Local
Carga `index.html` con Live Server (VS Code Extension). Los *Service Workers* (PWA) cachearán la carga automáticamente para operar offline.
