document.addEventListener('DOMContentLoaded', function() {
    //CRS for germany
    const CRS = 'EPSG:25832';
    
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

    // #################layer controller##################
    document.getElementById('potential').addEventListener('change', (e) => {
        e.target.checked ? potential_layer.addTo(map) : potential_layer.remove();
    });
    
    document.getElementById('existing').addEventListener('change', (e) => {
        existing_polygons[e.target.checked ? 'addTo' : 'remove'](map);
        existing_points[e.target.checked ? 'addTo' : 'remove'](map);
    });

});