document.addEventListener('DOMContentLoaded', function() {
    //CRS for germany
    const CRS = 'EPSG:25832';
    // new L.Proj.CRS(
        // 'EPSG:25832',
        // '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs',
        // {
            // resolutions: [ 8192 ,4096 ,2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1  ],
            // origin: [395446.0225, 5768430.5],
            // bounds: L.bounds([395446.0225, 5744473], [415350, 5768430.5])
        // }
    // );

    //main map
    const map = L.map('map', {center: [51.960665, 7.626135], zoom: 13});

    //#################################THEME SWITCHER################################

    //theme image preview by default:
    const lightimg = 'static/satellite-preview.png';
    const darkimg = 'static/default-preview.png';
    
    //theme layers
    const lightLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    });    
    const darkLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; CartoDB'
    });

    /// dark and light theme
    function setMapTheme(theme) {
        if (theme === 'light') {
            darkLayer.remove();
            lightLayer.addTo(map);
        } else {
            lightLayer.remove();
            darkLayer.addTo(map);
        }
    }

    // main theme will be light
    let currentTheme = 'light';
    setMapTheme(currentTheme);
    document.getElementById('theme-toggle').style.backgroundImage = `url(${lightimg})`;

    // Theme toggleing
    document.getElementById('theme-toggle').addEventListener('click', function() {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.style.backgroundImage = `url(${currentTheme === 'light' ? lightimg : darkimg})`;
        setMapTheme(currentTheme);
    });
    //##################################WMS Layer########################################
    //Geoserver::
    const geoserver_link = 'http://localhost:8080/geoserver/solar_data/wms';

    // const buildings_layer = L.tileLayer.wms(geoserver_link, {
    //     layers: 'buildings',
    //     format: 'image/png',
    //     transparent: true,
    //     crs: L.CRS.EPSG25832,
    //     opacity: 0.8
    // });

    const potential_layer = L.tileLayer.wms(geoserver_link, {
        layers: 'solar_data:solar_potential',
        format: 'image/png',
        transparent: true,
        opacity: 0.8,
        srs: CRS
    });

    const existing_polygons = L.tileLayer.wms(geoserver_link, {
        layers: 'solar_data:solar_existing_polygons',
        format: 'image/png',
        transparent: true,
        srs: CRS,
        opacity: 0.8
    });
    const existing_points = L.tileLayer.wms(geoserver_link, {
        layers: 'solar_data:solar_existing_points',
        format: 'image/png',
        transparent: true,
        srs: CRS,
        opacity: 0.8
    });

    //Adding them:
    // buildings_layer.addTo(map);
    potential_layer.addTo(map);
    existing_polygons.addTo(map);
    existing_points.addTo(map);

    //################Click control####################:
    map.on('click', async function(e){
        const url = `${geoserver_link}?` + L.Util.getParamString({
            service: 'WMS',
            version: '1.1.1',
            request: 'GetFeatureInfo',
            layers: 'solar_data:solar_potential,solar_data:solar_existing_polygons,solar_data:solar_existing_points',
            query_layers: 'solar_data:solar_potential,solar_data:solar_existing_polygons,solar_data:solar_existing_points',
            feature_count: 10,
            info_format: 'application/json',
            srs: 'EPSG:25832',
            bbox: map.getBounds().toBBoxString(),
            width: map.getSize().x,
            height: map.getSize().y,
            x: Math.floor(e.containerPoint.x),
            y: Math.floor(e.containerPoint.y)
        });
        console.log('Clicked at (UTM32N):', e.latlng);
        console.log('Map Bounds:', map.getBounds().toBBoxString());
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features.length > 0) {
                const feature = data.features[0];
                const content = `
                    <h3>${feature.properties.name || 'Feature'}</h3>
                    ${feature.properties.solar_potential ? `<p>Potential: ${feature.properties.solar_potential} kWh/m²</p>` : ''}
                    ${feature.properties.installation_date ? `<p>Installed: ${feature.properties.installation_date}</p>` : ''}
                    <p>Type: ${feature.properties.type || 'N/A'}</p>
                `;
                
                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(content)
                    .openOn(map);
            }
        } catch (error) {
            console.error('Feature info error:', error);
        }
    });

    // #################layer controller##################
    document.getElementById('potential').addEventListener('change', (e) => {
        e.target.checked ? potential_layer.addTo(map) : potential_layer.remove();
    });
    
    document.getElementById('existing').addEventListener('change', (e) => {
        existing_polygons[e.target.checked ? 'addTo' : 'remove'](map);
        existing_points[e.target.checked ? 'addTo' : 'remove'](map);
    });

});