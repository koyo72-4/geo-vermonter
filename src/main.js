let startLat, startLon;
let currLat, currLon;

let correctCounty;
let correctTown;
let selectedTown;

let map
let ethanIcon
let breadIcon
let currentZoom
let gameZoom
let openZoom
let marker
let markerBread


let gameState
let countyWin
let townSelected = false
let scorePosted = false
let score

const VTboundingBox = {
    maxLon: -73.3654,
    minLon: -71.5489,
    maxLat: 45.0065,
    minLat: 42.7395
};

const countyNumbers = {
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

let elements;

function initize() {

    score = 1000;

    initizeMap();

    elements = {
        startButton: document.getElementById("start"),
        map: document.getElementById('map')
    };

    elements.startButton.addEventListener('click', startGame);

    elements.map.style.cursor = 'default';
    document.getElementById('guessTown').style.display = 'none';
    $("#scoreContainer").css("display", "none")

    addEventHandlers();
    activateCountyBtnListeners()
    initiateDirectionButtons()
    initiateNavButtons()
}

function addEventHandlers() {
    $("#myModal").on('hidden.bs.modal', function () {
        $("#youWon").css("display", "none");
        $("#scoreContainer").css("display", "none");
        $("#aboutContainer").css("display", "none")
        document.getElementById('guessTown').style.display = 'none';
        $("#guessDiv").css("display", "block");
        $("#modalTitle").html("Where in Vermont is Ethan Allen?");
    });
    $("#quit").on('click', function () {
        $("#countyVal").text(correctCounty);
        $("#townVal").html(correctTown);
        $("#latVal").text(startLat.toFixed(4));
        $("#longVal").text(startLon.toFixed(4));
        elements.startButton.disabled = false;
        $("#quit").prop("disabled", true)
        $("#guess").prop("disabled", true)
    });

    $("#guess").on('click', function () {

        if (gameState === "over") {
            $("#youWon").css("display", "none");
            $("#scoreContainer").css("display", "none");
            $("#aboutContainer").css("display", "none")
            $("#guessTown").css("display", "none")
            $("#guessDiv").css("display", "block")
        }
        if (countyWin === true) {
            $("#youWon").css("display", "block");
            $("#scoreContainer").css("display", "none");
            $("#aboutContainer").css("display", "none")
            $("#guessTown").css("display", "block")
            $("#guessDiv").css("display", "none")
        }
        if (gamstate = "playing" && countyWin != true) {
            $("#youWon").css("display", "none");
            $("#scoreContainer").css("display", "none");
            $("#aboutContainer").css("display", "none")
            $("#guessTown").css("display", "none")
            $("#guessDiv").css("display", "block")
        }

    });
    $("#zoomIn").on('click', function () {
        zoom("in");
    });
    $("#zoomOut").on('click', function () {
        zoom("out");
    });
    $("#addScore").on('click', function () {
        addNewScore(document.getElementById("userName").value);
    });
}

function initizeMap() {
    gameZoom = 15;
    openZoom = 7;
    map = L.map("map", {
        center: [44.050254, -72.575367],
        zoom: openZoom,
        fadeAnimation: true,
        zoomAnimation: true
    });
    let Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        // attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });
    Esri_WorldImagery.addTo(map);
    ethanIcon = L.icon({
        iconUrl: './images/ethanAllen.png',
        iconSize: [56, 46.51],
        iconAnchor: [14, 46.51],
        popupAnchor: [0, -46.51]
    });
    breadIcon = L.icon({
        iconUrl: './images/breadCrmb.png',
        iconSize: [50, 41.52],
        iconAnchor: [25, 41.52]
    });
    let fullStateLayer = L.geoJson(border_data);
    map.dragging.disable();
    fullStateLayer.addTo(map);
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    if (map.tap)
        map.tap.disable();
}

function activateCountyBtnListeners() {
    $("#guessDiv").on('click', function () {

        if (event.target.tagName === "BUTTON") {
            let clickedCounty = event.target.id
            event.target.disabled = true
            winTest(clickedCounty)
        }

    });
}

function initiateDirectionButtons() {
    $("#direction-buttons").on('click', function () {
        if (event.target.tagName === "BUTTON") {
            travel(event.target.id);
        }
        if (event.target.tagName === "I" || event.target.tagName === "IMG") {
            travel($(event.target).parent()[0].id);
        }
    });
}

function initiateNavButtons() {
    $("#highScores").on('click', function () {
        loadHighScoreBoard()
    });

    $("#aboutBtn").on('click', function () {
        loadAbout()
    });
}

function startGame() {

    if (marker != undefined) {
        marker.remove();
    }
    elements.startButton.disabled = true;
    $("#quit").prop("disabled", false)
    $("#guess").prop("disabled", false)

    latVal.textContent = "?"
    longVal.textContent = "?"
    countyVal.textContent = "?"
    townVal.textContent = "?"
    score = 1000

    $("#scoreVal").text(score);
    getRandomLat(VTboundingBox["minLat"], VTboundingBox["maxLat"])
    getRandomLon(VTboundingBox["minLon"], VTboundingBox["maxLon"])

    console.log(startLat, startLon)
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
        setStartPoint(map)
    }
}

function setStartPoint(map) {
    currentZoom = gameZoom
    marker = L.marker([startLat, startLon], { icon: ethanIcon });
    currLat = startLat
    currLon = startLon
    marker.addTo(map);
    marker.bindPopup("Where am I?").openPopup();

    gameState = "playing"
    townSelected = false
    scorePosted = false
    countyWin = false

    map.setView([startLat, startLon], currentZoom, {
        pan: {
            animate: true,
            duration: 1
        },
        zoom: {
            animate: true
        }
    });

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

function zoom(way) {

    if (way === "in") {
        currentZoom += 1
    }
    else {
        currentZoom += -1
        changeScore(-150)
    }
    map.setZoom(currentZoom)

}

function enableZoomDirCountyButtons() {

    $("#direction-buttons button").each(function (index) {
        $(this).prop('disabled', false)
    })

    $("#zoom-buttons button").each(function (index) {
        $(this).prop('disabled', false)
    })

    $("#guessDiv button").each(function (index) {
        $(this).prop('disabled', false)
    })
}

function disableCountyButtons() {

    $("#guessDiv button").each(function (index) {
        $(this).prop('disabled', true)
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
        disableCountyButtons()
        countyWin = true
        $("#guessDiv").css("display", "none")
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
            townSelected = true
        });

        $('#townSubmit').one('click', function () {
            if (selectedTown === correctTown) {
                $('#townAnswer').html('<span>Well done!!!! You got the county <em>and</em> the town!</span>');
                changeScore(500);
                console.log('score:', score);
                $("#townVal").html(correctTown);
            } else {
                $('#townAnswer').text('Sorry. The town was ' + correctTown + '. But great job getting the county!');
                $("#townVal").html(correctTown);
                $("#townVal").html(correctTown);
            }
            elements.startButton.disabled = false;
        });
    }

    else {
        changeScore(-150)
        $("#youWon").css("display", "block")
        $("#guessDiv").css("display", "none")
        $("#youWon").text("Wrong! Lose 150 Points!")
    }
}

function addNewScore(name) {
    if (!localStorage.getItem('scoreJSON')) {
        localStorage.setItem('scoreJSON', '[]')
    }

    let scoreList = JSON.parse(localStorage.getItem('scoreJSON'));
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    var today = mm + '/' + dd + '/' + yyyy;
    scoreList.push({ "Name": "'" + name + "'", "Score": score, "Date": today })

    localStorage.setItem('scoreJSON', JSON.stringify(scoreList));
    scorePosted = true

    loadHighScoreBoard()
    endGame();
}

function loadHighScoreBoard() {
    $("#scoreTable").empty()
    $("#modalTitle").html("High Score Board...")
    let scoreList = JSON.parse(localStorage.getItem('scoreJSON'));
    console.log(scoreList)
    if (scoreList != null) {
        scoreList.sort((first, second) => {
            if (first.Score > second.Score) {
                return -1;
            } else if (first.Score < second.Score) {
                return 1;
            } else {
                return 0;
            }
        });
    

    localStorage.setItem('scoreJSON', JSON.stringify(scoreList))

    for (i = 0; i < scoreList.length; i++) {
        $("#scoreTable").append("<tr>")
        $("#scoreTable").append("<td>" + scoreList[i].Name + "</td>");
        $("#scoreTable").append("<td>" + scoreList[i].Score + "</td>");
        $("#scoreTable").append("<td>" + scoreList[i].Date + "</td>");
        $("#scoreTable").append("</tr>")
    }
    }
    $("#youWon").css("display", "none")
    $("#guessTown").css("display", "none")
    $("#guessDiv").css("display", "none")
    $("#aboutContainer").css("display", "none")
    $("#scoreContainer").css("display", "block")

}

function loadAbout() {
    $("#youWon").css("display", "none")
    $("#guessTown").css("display", "none")
    $("#guessDiv").css("display", "none")
    $("#scoreContainer").css("display", "none")
    $("#aboutContainer").css("display", "block")
}

function endGame() {
    gameState = "over";
    $("#quit").prop("disabled", true)
    $("#guess").prop("disabled", true)
    elements.startButton.disabled = false;
}

dragElement(document.getElementById("direction-buttons"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}