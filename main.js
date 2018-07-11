let VTboundingBox = {
    maxLon: -73.3654,
    minLon: -71.5489,
    maxLat: 45.0065,
    minLat: 42.7395
};



let startButton = document.getElementById("start");
startButton.addEventListener('click', startGame);

let latitude = document.getElementById("latitude");
let longitude = document.getElementById("longitude");
let county = document.getElementById("county");
let town = document.getElementById("town");

let startLat, startLon;


// var map = L.map('map').setView([44.050254, -72.575367], 7);

var map = L.map("map", {
    center: [44.050254, -72.575367],
    zoom: 7,
    fadeAnimation: true,
    zoomAnimation: true
});


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

    latitude.textContent += " ?";
    longitude.textContent += " ?";
    county.textContent += " ?";
    town.textContent += " ?";

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
        console.log('startLat:', startLat, 'startLon:', startLon);
        fullStateLayer.remove();
        map.setView([startLat, startLon], 15, {
            pan: {
                animate: true,
                duration: 20
            },
            zoom: {
                animate: true
            }
        });
        // map.panTo([startLat, startLon]);
        //map.zoomIn(3);
        let marker = L.marker([startLat, startLon]);
        marker.addTo(map);
        marker.bindPopup("Where is this?").openPopup();

        // L.marker([startLat, startLon]).addTo(map);
        //map = L.map('map').setView([startLat, startLon], 18);
    }
}

function getRandomLat(min, max) {
    startLat = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomLon(min, max) {
    startLon = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive 
}


