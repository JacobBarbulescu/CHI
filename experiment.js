const COLS = 4;
const ROWS = 2;

const HEIGHT = 90/ROWS;
const WIDTH = 90/COLS;

var longWait = [20, 30];
var shortWait = [3, 6];

//The potential amount of time (in seconds) between instructions
const WAIT = longWait;

//Sets the number of clicks the trial will last
const NUMCLICKS = 5;
var clicksLeft = NUMCLICKS;

//The result of each click
class Result {
    constructor (timeElapsed, clickSuccess) {
        this.timeElapsed = timeElapsed;
        this.clickSuccess = clickSuccess;
    }
}

var justClicked = false;

//An array that holds the results of each click
var results = [];

//The main menu container
var menu = document.getElementById("menu");

//The task text
var taskText = document.getElementById("task");

//A grid of colors to correspond to the menu tiles
var colors = [
    ["#680d0d", "#19216f", "#125219", "#6d5c10"],
    ["#976a04", "#000000", "#472160", "#676767"]
];

//The color of the non unique colored tiles
const TILECOLOR = "#2E4E72"
//A grid of noncolors to correspond to the menu tiles
var nonColors = [
    [TILECOLOR, TILECOLOR, TILECOLOR, TILECOLOR],
    [TILECOLOR, TILECOLOR, TILECOLOR, TILECOLOR]
];

//The actual grid of colors to be used
var currentColors = colors;

//A grid of icons to correspond to the menu tiles (also acts as the words for each spoken instruction)
var icons = [
    ["phone", "gps", "music", "heat"],
    ["fan", "light", "headlight", "settings"]
];

//The target tile to be clicked's id
var targetID;

//Swaps the color palette of the menu tiles
function swapColor () {
    if (currentColors[0] === colors[0]) {
        currentColors = nonColors;
    }
    else {
        currentColors = colors;
    }

    for (var y = 0; y < ROWS; y++) {
        for (var x = 0; x < COLS; x++) {
            var tile = document.getElementById(x.toString() + "." + y.toString());

            tile.style.backgroundColor = currentColors[y][x];
        }
    }

    //This is to fix IOS speech synth issue
    var speechSynth = window.speechSynthesis;
    var newUtter = new SpeechSynthesisUtterance("Swapped color");

    speechSynth.speak(newUtter);
}

//Takes a csv string, makes a file out of it, then downloads it
//Code taken from GeeksForGeeks (https://www.geeksforgeeks.org/how-to-create-and-download-csv-file-in-javascript/)
function downloadCSV (csvString) {
    // Create a Blob with the CSV data and type
    const blob = new Blob([csvString], { type: 'text/csv' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create an anchor tag for downloading
    const a = document.createElement('a');
    
    // Set the URL and download attribute of the anchor tag
    a.href = url;

    //Gets the current time to set as the name of the csv file
    var time = new Date();
    var timeBlocks = [time.getHours().toString(), time.getMinutes().toString(), time.getSeconds().toString()];
    a.download = `${timeBlocks[0]}-${timeBlocks[1]}-${timeBlocks[2]}.csv`;
    
    // Trigger the download by clicking the anchor tag
    a.click();
}

//Processes all of the result data into a csv string
function processResults () {
    var timeSum = 0;
    var errorSum = 0;

    results.forEach((result) => {
        timeSum += result.timeElapsed;
        if (!(result.clickSuccess)) {
            errorSum++;
        }
    });
    var timeAverage = timeSum/results.length;
    var errorPercent = ((1 - (errorSum/results.length))).toFixed(2);

    //console.log("Average time between clicks: " + timeAverage.toString() + "ms");
    //console.log("Error rate: " + errorPercent.toString() + "%");

    downloadCSV("# Trials,Average Click Time (ms),Accuracy Rate\n" + NUMCLICKS.toString() + "," + timeAverage.toString() + "," + errorPercent.toString());
}

//Has the website say a phrase out loud
function instruct (text) {
    var speechSynth = window.speechSynthesis;
    var newUtter = new SpeechSynthesisUtterance(text);

    speechSynth.speak(newUtter);
}

//Selects a random tile to become the new target to be clicked
function chooseNewTarget () {
    //When all clicks performed, process results and let user know
    if (clicksLeft <= 0) {
        //taskText.innerHTML = "Trial finished!";
        //taskText.style.color = "black";

        return;
    }
    //Otherwise, choose a new target
    var y = Math.floor(Math.random() * ROWS).toString();
    var x = Math.floor(Math.random() * COLS).toString();

    targetID = x + "." + y;

    //taskText.innerHTML = "Click " + currentColors[y][x];
    //taskText.style.color = currentColors[y][x];

    clickStartTime = clickTime;

    instruct(icons[y][x]);
}

//When a tile is clicked, record information such as time passed, accuracy, etc
function tileClick (tile) {
    //If all clicks performed, stop registering new clicks
    if (clicksLeft == 0) {
        instruct("Trial over");

        processResults();

        clicksLeft--;

        return;
    }
    else if (clicksLeft < 0) {
        return;
    }

    var clickTime = Date.now();
    var timeElapsed = clickTime - clickStartTime;

    var clickSuccess = false;
    if (tile.id == targetID) {
        clickSuccess = true;
    }

    results.push(new Result(timeElapsed, clickSuccess));
    console.log(NUMCLICKS-clicksLeft+1, tile.id, timeElapsed+"ms", clickSuccess);

    clicksLeft--;

    //After a tile is clicked, wait a random amount of time before moving on to the next instruction
    setTimeout(() => {
        chooseNewTarget();
    }, (Math.random() * (WAIT[1] - WAIT[0]) + WAIT[0]) * 1000);
}

//Generates the menu tiles in the menu div
function generateTiles () {
    for (var y = 0; y < ROWS; y++) {
        var menuRow = document.createElement("div");
        menuRow.className = "menuRow";
        menuRow.style.height = (HEIGHT).toString()+"%";

        menu.appendChild(menuRow);
        for (var x = 0; x < COLS; x++) {
            var menuTile = document.createElement("div");

            menuTile.className = "menuTile";
            menuTile.id = x.toString() + "." + y.toString();

            menuTile.style.width = (WIDTH).toString()+"%";
            menuTile.style.backgroundColor = currentColors[y][x];

            menuTile.onclick = function(e) {tileClick(e.target)};

            menuRow.appendChild(menuTile);

            //Adds the icon to the menu tile
            var menuIcon = document.createElement("img");

            menuIcon.className = "icon";
            menuIcon.src = "Images/" + icons[y][x] + ".png";

            menuTile.appendChild(menuIcon);
        }
    }
}



var clickStartTime = Date.now();

generateTiles();

setTimeout(() => {
    chooseNewTarget();
}, (Math.random() * (WAIT[1] - WAIT[0]) + WAIT[0]) * 1000);
