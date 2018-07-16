let VTboundingBox = {
    maxLon: -73.3654,
    minLon: -71.5489,
    maxLat: 45.0065,
    minLat: 42.7395
};

let countyNumbers = {
    Franklin: 11,
    'Grand Isle': 13,
    Orleans: 19,
    Essex: 9,
    Lamoille: 15,
    Caledonia: 5,
    Chittenden: 7,
    Windsor: 27,
    Rutland: 21,
    Orange: 17,
    Washington: 23,
    Windham: 25,
    Addison: 1,
    Bennington: 3
}

let marker
let markerBread

let gameState

let startButton = document.getElementById("start");
startButton.addEventListener('click', startGame);

let latitude = document.getElementById("latitude");
let latVal = document.getElementById("latVal");
let longitude = document.getElementById("longitude");

document.getElementById('guessTown').style.display = 'none';


$("#myModal").on('hidden.bs.modal', function () {
    $("#youWon").css("display", "none")
    document.getElementById('guessTown').style.display = 'none';
    $("#guessBtn").css("display", "block")
});

$("#guessBtn").on('click', function () {

    if (event.target.tagName === "BUTTON") {
        let clickedCounty = event.target.id
        event.target.disabled = true
        winTest(clickedCounty)
    }

});

$("#quit").on('click', function () {


    $("#countyVal").text(correctCounty)
    $("#townVal").html(correctTown)
    $("#latVal").text(startLat.toFixed(4))
    $("#longVal").text(startLon.toFixed(4))

    startButton.disabled = false;
    quit.disabled = true;
    guess.disabled = true;
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
let selectedTown;

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
    iconUrl: './images/ethanAllen.png',
    iconSize: [56, 46.51],
    iconAnchor: [14, 46.51],
    popupAnchor: [0, -46.51]
});

var breadIcon = L.icon({
    iconUrl: './images/breadCrmb.png',
    iconSize: [50, 41.52],
    iconAnchor: [25, 41.52]
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
map.dragging.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();
if (map.tap) map.tap.disable();
document.getElementById('map').style.cursor = 'default';


function startGame() {

    if (marker != undefined) {
        marker.remove();
    }


    startButton.disabled = true;
    quit.disabled = false;
    guess.disabled = false;

    latVal.textContent = "?"

    longVal.textContent = "?"

    countyVal.textContent = "?"

    townVal.textContent = "?"

    score = 1000
    $("#scoreVal").text(score);

    getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])

    getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])

    pipTest(startLat, startLon);
    correctTown = getTown(startLat, startLon);
}

function getTown(lat, lon) {
    let layer = L.geoJson(town_data);
    let results = leafletPip.pointInLayer([lon, lat], layer);
    results = results[0]
    results = results.feature.properties["TOWNNAMEMC"]
    console.log(results)
    return results
}

function pipTest(lat, lon) {

    let layer = L.geoJson(border_data);
    let results = leafletPip.pointInLayer([lon, lat], layer);

    if (results.length === 0) {
        getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])

        getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])

        pipTest(startLat, startLon);
    } else {
        setStartPoint()
    }
}

function setStartPoint() {

    fullStateLayer.remove();
    currentZoom = gameZoom

    map.setView([startLat, startLon], currentZoom, {
        pan: {
            animate: true,
            duration: 1
        },
        zoom: {
            animate: true
        }
    });




    marker = L.marker([startLat, startLon], { icon: carmenIcon });
    currLat = startLat
    currLon = startLon
    marker.addTo(map);
    marker.bindPopup("Where am I?").openPopup();

    gameState = "playing"


    fetch('https://nominatim.openstreetmap.org/reverse?lat=' + startLat + '&lon=' + startLon + '&format=json')
        .then(function (response) {
            return response.json();
        })
        .then(function (jsonResponse) {
            correctCounty = jsonResponse.address.county.replace(" County", "");
            console.log(correctCounty + " is the County")
            return jsonResponse
        })



    enableZoomDirCountyButtons()


}

function enableZoomDirCountyButtons() {

    $("#direction-buttons button").each(function (index) {
        $(this).prop('disabled', false)
    })

    $("#zoom-buttons button").each(function (index) {
        $(this).prop('disabled', false)
    })

    $("#guessBtn button").each(function (index) {
        $(this).prop('disabled', false)
    })
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
    switch (direction) {
        case "north":
            currLat += shiftDistance
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

    if ((currLat != startLat || currLon != startLon) && gameState === "playing") {
        markerBread = L.marker([currLat, currLon], { icon: breadIcon });
        markerBread.addTo(map);
    }
}

function changeScore(pointDifference) {
    if (gameState === "playing") {
        score += pointDifference;
        $("#scoreVal").text(score);
    }
}

function winTest(clickedCounty) {
    if (clickedCounty === correctCounty) {
        $("#guessBtn").css("display", "none")

        $("#youWon").text("YOU WON!!!")
        $("#youWon").css("display", "block")
        document.getElementById('guessTown').style.display = 'block';
        $('#townsList').html('');
        $('#townAnswer').html('');

        let countyTowns = town_data.features.reduce(function (total, feature) {
            if (feature.properties.CNTY === countyNumbers[correctCounty]) {
                total.push(feature.properties.TOWNNAMEMC);
            }
            return total;
        }, []);

        countyTowns.sort();

        console.log(countyTowns);
        console.log('correctTown: ' + '"' + correctTown + '"');

        let defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.selected = true;
        defaultOption.textContent = 'Select a town';
        $('#townsList').append(defaultOption);

        let townOptions = countyTowns.map(function (town) {
            let option = document.createElement('option');
            option.value = town;
            option.textContent = town;
            return option;
        });

        for (let option of townOptions) {
            $("#townsList").append(option);
        }

        $("#countyVal").text(correctCounty)
        $("#latVal").text(startLat.toFixed(4))
        $("#longVal").text(startLon.toFixed(4))

        $('#townsList').on('change', function (event) {
            selectedTown = event.target.value;
            console.log('selectedTown: ' + '"' + selectedTown + '"');
        });

        $('#townSubmit').one('click', function () {
            if (selectedTown === correctTown) {
                $('#townAnswer').html('<span>Well done!!!! You got the county <em>and</em> the town!</span>');
                changeScore(500);
                console.log('score:', score);
                $("#townVal").html(correctTown);
                endGame();
            } else {
                $('#townAnswer').text('Sorry. The town was ' + correctTown + '. But great job getting the county!');
                $("#townVal").html(correctTown);
                $("#townVal").html(correctTown);
                endGame();
            }
        });
    }

    else {
        changeScore(-150)
        $("#youWon").css("display", "block")
        $("#guessBtn").css("display", "none")
        $("#youWon").text("Wrong! Lose 150 Points!")
    }
}

function endGame() {
    gameState = "over";

    var highscore = localStorage.getItem("highscore");

    if (highscore !== null) {
        if (score > highscore) {
            alert("You beat the high score which was " + highscore)
            localStorage.setItem("highscore", score);
        }
    }
    else {
        localStorage.setItem("highscore", score);
    }

    startButton.disabled = false;
    quit.disabled = true;
    guess.disabled = true;
}


