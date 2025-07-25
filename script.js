let map;
let drawnItems = new L.FeatureGroup();
let drawControl;

function initMap() {
    map = L.map('map', {attributionControl: false}).setView([50.443158, 30.465269], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ''
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
            circlemarker: false,
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
            // Проверяем, что полигон имеет минимум 3 точки
            const latLngs = layer.getLatLngs()[0];
            if (latLngs.length >= 3) {
                polygons.push(latLngs.map(point => [
                    parseFloat(point.lat.toFixed(6)), 
                    parseFloat(point.lng.toFixed(6))
                ]));
            }
        }
    });

    if (polygons.length === 0) {
        alert("Нет полигонов для отправки!");
        return;
    }

    let tg = window.Telegram.WebApp;
    
    if (tg) {
        try {
            // Проверка данных перед отправкой
            console.log("Отправляемые данные:", JSON.stringify(polygons));
            tg.sendData(JSON.stringify(polygons));
            tg.close();
        } catch (e) {
            console.error("Ошибка отправки данных:", e);
            alert("Ошибка отправки: " + e.message);
        }
    } else {
        console.log("Данные для отправки:", polygons);
        alert("Открыто вне Telegram!");
    }
});
initMap();
