let VTboundingBox = {
    maxLon: -73.3654,
    minLon: -71.5489,
    maxLat: 45.0065,
    minLat: 42.7395
};



let startButton = document.getElementById("start");
startButton.addEventListener('click', startGame);

let startLat, startLon;


var map = L.map('map').setView([44.050254, -72.575367], 7);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    // attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

Esri_WorldImagery.addTo(map)

// L.marker([44.260254, -72.575367]).addTo(map)
//     .bindPopup('Monteplier, VT.')
//     .openPopup();

let fullStateLayer = L.geoJson(border_data);

fullStateLayer.addTo(map)



function startGame() {
    startButton.disabled = true;
    quit.disabled = false;
    guess.disabled = false;

    getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])
    console.log(startLat)

    getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])
    console.log(startLon)

    pipTest(startLat, startLon);

}

// let tries = 0;
function pipTest(lat, lon) {

    let layer = L.geoJson(border_data);
    let results = leafletPip.pointInLayer([lon, lat], layer);
    console.log(results);

    if (/*tries < 10 && */results.length === 0) {
        getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])
        console.log(startLat)

        getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])
        console.log(startLon)
        // tries += 1;
        pipTest(startLat, startLon);
    } else { 
        fullStateLayer.remove();
        map.panTo([startLat, startLon]).zoomIn(8);
        L.marker([startLat, startLon]).addTo(map);
        //map = L.map('map').setView([startLat, startLon], 18);
    }
}

function getRandomLat(min, max) {
    startLat = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomLon(min, max) {
    startLon = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive 
}


