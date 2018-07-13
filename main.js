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


// $("#myModal").on('shown.bs.modal', function () {
//     $("#youWon").css("display", "none")
//     $("#guessBtn").css("display", "block")
//     $("#youWon").text("You Won!!!")
// });

$("#myModal").on('hidden.bs.modal', function () {
    $("#youWon").css("display", "none")
    $("#guessBtn").css("display", "block")
    $("#youWon").text("You Won!!!")
});

$("#guessBtn").on('click', function () {
    let clickedCounty = event.target.id
    event.target.disabled = true
    winTest(clickedCounty)
});

$("#zoomIn").on('click', function () {
    zoom("in");
});

$("#zoomOut").on('click', function () {
    zoom("out");
});

function zoom(way) {

    if (way === "in") {
        currentZoom += 1
    }
    else {
        currentZoom += -1
        changeScore(-50)
    }
    map.setZoom(currentZoom)

}



$("#north").on('click', function () {
    travel("north");
});

$("#west").on('click', function () {
    travel("west");
});

$("#east").on('click', function () {
    travel("east");
});

$("#south").on('click', function () {
    travel("south");
});

$("#southeast").on('click', function () {
    travel("southeast");
});

$("#southwest").on('click', function () {
    travel("southwest");
});

$("#northeast").on('click', function () {
    travel("northeast");
});

$("#northwest").on('click', function () {
    travel("northwest");
});

$("#center").on('click', function () {
    travel("home");
});



let startLat, startLon;
let currLat, currLon;
let correctCounty;
let correctTown;

let score = 1000;


// var map = L.map('map').setView([44.050254, -72.575367], 7);

let currentZoom
let gameZoom = 15
let openZoom = 7

var map = L.map("map", {
    center: [44.050254, -72.575367],
    zoom: openZoom,
    fadeAnimation: true,
    zoomAnimation: true
});

map.dragging.disable()

var carmenIcon = L.icon({
    iconUrl: './carmenOldSchool.png',
    iconSize: [60, 105],
    iconAnchor: [30, 105],
    popupAnchor: [0, -105]
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
    $("#score").text("SCORE: " + score);

    getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])
    console.log(startLat)

    getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])
    console.log(startLon)

    pipTest(startLat, startLon);

}

function pipTest(lat, lon) {

    let layer = L.geoJson(border_data);
    let results = leafletPip.pointInLayer([lon, lat], layer);
    console.log(results);

    if (results.length === 0) {
        getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])
        console.log(startLat)

        getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])
        console.log(startLon)

        pipTest(startLat, startLon);
    } else {
        console.log('startLat:', startLat, 'startLon:', startLon);
        fullStateLayer.remove();
        currentZoom = gameZoom
        map.setView([startLat, startLon], currentZoom, {
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
        let marker = L.marker([startLat, startLon], { icon: carmenIcon });
        currLat = startLat
        currLon = startLon
        marker.addTo(map);
        marker.bindPopup("Where am I?").openPopup();
        // L.marker([startLat, startLon]).addTo(map);
        //map = L.map('map').setView([startLat, startLon], 18);

        fetch('https://nominatim.openstreetmap.org/reverse?lat=' + startLat + '&lon=' + startLon + '&format=json')
            .then(function (response) {
                console.log(response);
                return response.json();
            })
            .then(function (jsonResponse) {
                console.log(jsonResponse);
                console.log(jsonResponse.address.county.replace(" County", ""));
                correctCounty = jsonResponse.address.county.replace(" County", "");
                return jsonResponse

            })
            .then(function (jsonAddress) {
                getTown(jsonAddress)

            });
    }
}



function getTown(jsonAddress) {
    console.log(jsonAddress)
    // fetch('https://nominatim.openstreetmap.org/search?format=json&' +jsonAddress.address.hamlet)

    fetch("https://nominatim.openstreetmap.org/search/Vermont/Orange%20County/Beanville/135?format=json&polygon=1&addressdetails=1")
        .then(function (response) {
            console.log(response.json());
            return response.json();
        })
        .then(function (jsonResponse) {
            console.log(jsonResponse);
            console.log(jsonResponse.hamlet);


        })
        .then(function (jsonAddress) {
            getTown(jsonAddress)

        });
}

function getRandomLat(min, max) {
    startLat = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive
}

function getRandomLon(min, max) {
    startLon = Math.random() * (max - min) + min; //The maximum is inclusive and the minimum is inclusive 
}

function travel(direction) {

    let shiftDistance = .0015

    let shiftDisForDiag = Math.sqrt(Math.pow(.0015, 2) / 2)
    console.log(shiftDisForDiag)
    // console.log ("After hitting north, currLat is: " + currLat)
    switch (direction) {
        case "north":
            currLat += shiftDistance
            console.log("After hitting north, currLat is: " + currLat)
            changeScore(-1);
            break;
        case "south":
            currLat += -1 * shiftDistance
            changeScore(-1);
            break;
        case "east":
            currLon += shiftDistance
            changeScore(-1);
            break;
        case "west":
            currLon += -1 * shiftDistance
            changeScore(-1);
            break;
        case "northeast":
            currLon += shiftDisForDiag
            currLat += shiftDisForDiag
            changeScore(-1);
            break;
        case "southeast":
            currLon += shiftDisForDiag
            currLat += -1 * shiftDisForDiag
            changeScore(-1);
            break;
        case "northwest":
            currLon += -1 * shiftDisForDiag
            currLat += shiftDisForDiag
            changeScore(-1);
            break;
        case "southwest":
            currLon += -1 * shiftDisForDiag
            currLat += -1 * shiftDisForDiag
            break;
        case "home":
            currLat = startLat
            currLon = startLon
            break;

    }
    map.setView([currLat, currLon]);
}

function changeScore(pointDifference) {
    score += pointDifference;
    console.log(score);
    $("#score").text("SCORE: " + score);
}

function winTest(clickedCounty) {
    if (clickedCounty === correctCounty) {
        $("#youWon").css("display", "block")
        $("#guessBtn").css("display", "none")

        $("#county").text("County: " + correctCounty)
        $("#town").text("Town: " + correctTown)
        $("#latitude").text("Latitude: " + startLat)
        $("#longitude").text("Longitude: " + startLon)
    }

    else {
        changeScore(-150)
        $("#youWon").css("display", "block")
        $("#guessBtn").css("display", "none")
        $("#youWon").text("Wrong! Lose 150 Points!")
    }
}


