document.addEventListener('DOMContentLoaded', function() {
    //main map
    const map = L.map('map').setView([51.960665, 7.626135], 13);

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
    //################################################################################
});