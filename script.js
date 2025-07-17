let map;
let drawnItems = new L.FeatureGroup();
let drawControl;

function initMap() {
    map = L.map('map').setView([55.751244, 37.618423], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.addLayer(drawnItems);

    // Настройка инструментов рисования (только полигоны)
    drawControl = new L.Control.Draw({
        draw: {
            polygon: {
                allowIntersection: false,
                shapeOptions: { color: '#3388ff', fillOpacity: 0.5 }
            },
            rectangle: false,
            circle: false,
            marker: false,
            polyline: false
        },
        edit: { featureGroup: drawnItems }
    });
    map.addControl(drawControl);

    // Обработчик создания полигона
    map.on(L.Draw.Event.CREATED, function (e) {
        drawnItems.addLayer(e.layer);
    });

    // Очистка при двойном клике
    map.on('dblclick', () => {
        drawnItems.clearLayers();
    });
}

// Отправка данных в Telegram
document.getElementById('sendData').addEventListener('click', () => {
    const polygons = [];
    drawnItems.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
            polygons.push(layer.getLatLngs()[0].map(point => [point.lat, point.lng]));
        }
    });

    if (polygons.length === 0) {
        alert("Сначала нарисуйте полигон!");
        return;
    }

    if (window.Telegram?.WebApp) {
        alert("Начинаю отправлять данные");
        Telegram.WebApp.sendData(JSON.stringify(polygons));
        Telegram.WebApp.close();
    } else {
        alert("Откройте в Telegram для отправки!");
    }
});

initMap();
