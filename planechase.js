/*
 * planechase.js
 *************************
 * Handles logic and animations for Planechase
 * 
 */


const MAX_PLAYERS = 5;
const NUM_PLANES = 85;
const NUM_ROWS = 3;
const NUM_COLS = 3;
const TRANSITION_DURATION = 1000;               // All animations
const LOADING_DURATION = 2500;                  // Initial loading gif duration
const PHENOMENA = [2, 5, 6, 7, 8, 9, 17];       // Keep track of phenomena image indices
const SPATIAL_MERGING = 6;                      // Keep track of Spatial Merging image index

var deck = [];
var grid = [            // Current plane will be index 4 of the grid, always recenter
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1]
];
var currFocus;          // Current zoomed in card



/*
 * Highlight cell
 */
function on_mouseover(cell) {
    // Remove other animations
    cell.classList.remove("animate-fadeIn");
    cell.classList.remove("animate-fadeOut");
    cell.style.opacity = 0.5;
}


/*
 * Dehighlight cell
 */
function on_mouseout(cell) {
    cell.style.opacity = 1.0;
}


/*
 * Shows close-up view of the given plane
 */
function focusPlane(indices) {
    var row = indices[0];
    var col = indices[1];
    currFocus = indices;

    var background = document.querySelector(".focusPlaneBackground");
    var focusPlane = document.querySelector(".focusPlane");
    var planeswalkButton = document.querySelector(".planeswalkButton");

    background.style.display = "inline";
    focusPlane.style.display = "flex"; 

    // Don't give planeswalk option if looking at current plane, or if diagonal plane and face-up
    if (!(row == 1 && col == 1) && !(grid[row][col] != -1 && isDiagonal(indices))) {
        planeswalkButton.style.display = "flex";
    }


    // Set image for focus
    var imageName;
    // Plane is face-up 
    if (grid[row][col] != -1) {
        imageName = "assets/planes/" + grid[row][col] + ".png";
    // Plane is face-down
    } else {
        imageName = "assets/planes/back.png";
    }
    focusPlane.getElementsByTagName("img")[0].src = imageName; 

    // Animate fadeIns of clickable background, plane image, and planeswalk button
    background.classList.remove("animate-fadeOut");
    background.classList.add("animate-fadeIn");

    focusPlane.classList.remove("animate-fadeOut");
    focusPlane.classList.add("animate-fadeIn");

    // Don't give planeswalk option if looking at current plane
    if(!(row == 1 && col == 1) && !(grid[row][col] != -1 && isDiagonal(indices))) {
        planeswalkButton.classList.remove("animate-fadeOut");
        planeswalkButton.classList.add("animate-fadeIn"); 
    }
}


/*
 * Goes back to the view of the board
 */
function removeFocusPlane() {
    var background = document.querySelector(".focusPlaneBackground");
    var focusPlane = document.querySelector(".focusPlane");
    var planeswalkButton = document.querySelector(".planeswalkButton");

    // Animates fadeOuts of clickable background, plane image, and planeswalk button
    background.classList.remove("animate-fadeIn");
    background.classList.add("animate-fadeOut");

    focusPlane.classList.remove("animate-fadeIn");
    focusPlane.classList.add("animate-fadeOut");

    planeswalkButton.classList.remove("animate-fadeIn");
    planeswalkButton.classList.add("animate-fadeOut"); 

    setTimeout(function() {
        background.style.display = "none";
        focusPlane.style.display = "none";
        planeswalkButton.style.display = "none";
    }, TRANSITION_DURATION);
}


/*
 * Gets new cards from the deck and shifts the grid to keep centered
 */
function moveToPlane() {
    var row = currFocus[0];
    var col = currFocus[1];

    // Can't walk to the current plane
    if (row == 1 && col == 1) return;

    // Can't walk diagonally to a face-up plane
    if((row == 0 && col == 0) || (row == 0 && col == 2) || (row == 2 && col == 0) || (row == 2 && col == 2)) {
        if (grid[row][col] != -1) return;
    }

    removeFocusPlane();
    fadeOutCards();

    // Wait till removeFocusPlane() is done
    setTimeout(function() {

        var rowShift = 1 - currFocus[0];
        var colShift = 1 - currFocus[1];

        // Keep track of new grid
        var temp = [
            [-1, -1, -1],
            [-1, -1, -1],
            [-1, -1, -1]
        ]; 

        // Iterate through grid, shifting the planes
        for (var i = 0; i < NUM_ROWS; i++) {
            for (var j = 0; j < NUM_COLS; j++) {

                // Only shift if in bounds
                if (i - rowShift >= 0 && i - rowShift < NUM_ROWS &&
                    j - colShift >= 0 && j - colShift < NUM_COLS) {

                    temp[i][j] = grid[i - rowShift][j - colShift];
                }
            }
        }

        // Get new cards from deck
        if (temp[0][1] == -1){
            temp[0][1] = drawCard();
        }
        if (temp[1][0] == -1){
            temp[1][0] = drawCard();
        }
        if (temp[1][1] == -1){
            temp[1][1] = drawCard(); 
        }
        if (temp[1][2] == -1){
            temp[1][2] = drawCard(); 
        }
        if (temp[2][1] == -1){
            temp[2][1] = drawCard(); 
        }
        
        // redraw board    
        grid = temp;
        renderBoard(false, true);
    }, TRANSITION_DURATION);
}


/*
 * Draws the board according to the grid
 * @Params: 
 * wait -- true if rendering should wait for images to load longer (initial game setup)
 */
function renderBoard(wait, focus) {
    var duration = wait ? LOADING_DURATION : 50;
    var startBackground = document.querySelector(".startBackground");
    startBackground.style.display = "inline"; 

    // Iterate through all grid cells, draw card face-up/face-down depending on value
    for (var i = 0; i < NUM_ROWS; i++) {
        for (var j = 0; j < NUM_COLS; j++) {

            // Draw plane
            if (grid[i][j] != -1) {
                var cell = document.getElementById("cell" + i + j).getElementsByTagName("img")[0]; 
                var imageName = "assets/planes/" + grid[i][j] + ".png";
                cell.src = imageName;

            // No plane in this cell, draw placeholder
            } else {
                var cell = document.getElementById("cell" + i + j).getElementsByTagName("img")[0]; 
                cell.src = "assets/planes/back.png";
            }
        }
    }

    var cells = document.querySelectorAll(".cell");
    var loadingGif = document.querySelector(".loading-gif");

    // Wait for images to load, then fade them in and remove loading gif
    setTimeout(function() {
        loadingGif.classList.remove("animate-fadeIn");
        loadingGif.classList.add("animate-fadeOut");

        cells.forEach(function(d) {
            d.classList.remove("animate-fadeOut");
            d.classList.add("animate-fadeIn");
        }) 

        loadingGif.classList.remove("animate-fadeOut");
        loadingGif.style.display = "none";

        startBackground.style.display = "none";

        if (focus) {
            setTimeout(function() {
                focusPlane([1, 1]);
            }, TRANSITION_DURATION);
        }
    }, duration);
}


/*
 * Animates fadeOut of the start button and then starts the game
 */
function setUpGame() {
    var startButton = document.querySelector(".startButton");
    var startContainer = document.querySelector(".startContainer");
    var gameHeader = document.querySelectorAll(".header .game");
    var menuTitle = document.querySelector(".title.menu-title");

    // Get rid of hover animations
    startButton.onmouseout = null;
    startButton.onmouseover = null;

    // fadeOut start menu stuff
    startButton.classList.add("animate-fadeOut");
    startContainer.classList.add("animate-fadeOut");
    menuTitle.classList.add("animate-fadeOut");

    setupLifeTotals();

    // fadeIn game header
    gameHeader.forEach(function(d) {
        d.style.display = "flex";
        d.classList.add("animate-fadeIn")
    })


    // Wait for buttons to disappear before prompting for player names
    setTimeout(function() {
        startButton.style.display = "none";
        startContainer.style.display = "none";
        menuTitle.style.display = "none";

        // Get player names before rendering the board
        dealCards()

    }, TRANSITION_DURATION);
}


/*
 * Updates the header to display the entered names of the players and the starting life total
 */
function setupLifeTotals() {
    
    for (var i = 1; i < MAX_PLAYERS+1; i++) {
        // get name from input field
        var nameID = "player" + i + "field";
        var name = document.getElementById(nameID).value.toUpperCase(); 

        // display names of players in header
        var lifeID = "player" + i + "Life";
        var lifeLabel = document.getElementById(lifeID);
        if (name != "") {
            name += ":&nbsp;"
            lifeLabel.getElementsByClassName("playerName")[0].getElementsByClassName("name")[0].innerHTML = name;
        } else {
            lifeLabel.style.display = "none";   
        }
    } 
}


/*
 * Animates the fadeOut of all the cards and then restarts the game
 */
function restartGame() {
    removeFocusPlane();
    fadeOutCards();

    setTimeout(function() {
        dealCards();
    }, TRANSITION_DURATION)
}


/*
 * Sets up the game with the 5 starting planes in a cross 
 */
function dealCards() {
    var loadingGif = document.querySelector(".loading-gif");
    loadingGif.style.display = "inline";
    loadingGif.classList.add("animate-fadeIn");

    for (var i = 0; i < NUM_PLANES; i++) {
        deck[i] = i;
    }

    // Shuffles the deck
    function shuffle(array) {
      var tmp, current, top = array.length;
      if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
      }
      return array;
    }

    // Gets first 5 cards from the deck and draws them
    function playInitialCards(deck) {
        grid[0][1] = drawCard();
        grid[1][0] = drawCard();
        grid[1][1] = drawCard();
        grid[1][2] = drawCard();
        grid[2][1] = drawCard();

        renderBoard(true, false); 
    }

    deck = shuffle(deck);
    playInitialCards(deck);
}


/*
 * Simulates drawing a card from the planar deck
 * Handles encountering phenomena
 */
function drawCard() {

    var card = deck.shift();
    console.log(card);
    if (PHENOMENA.includes(card)) {
        console.log("HERE");



    }

    return card;
}


/*
 * Animates the fadeOut of all cards
 * Usage: Whenever changing the cards that are in play (restart game, planeswalk, etc)
 */
function fadeOutCards() {
    var cells = document.querySelectorAll(".cell");
    var startBackground = document.querySelector(".startBackground");
    startBackground.style.display = "inline";

    cells.forEach(function(d) {
        d.classList.remove("animate-fadeIn");
        d.classList.add("animate-fadeOut");
    });
}


/*
 * Updates the header display to add or subtract life from a given player's life total
 */
function updateLifeTotal(playerID, amount) {
    var lifeDiv = document.getElementById(playerID).getElementsByClassName("playerName")[0].getElementsByClassName("life")[0];
    var life = parseInt(lifeDiv.innerHTML, 10);
    life += amount;
    lifeDiv.innerHTML = life;
}


/*
 * Simulates rolling the planar die and updates header display
 */
function rollDie() {
    var rand = Math.floor(Math.random() * 6) + 1;     // generate random die roll between 1 and 6
    var dieDiv = document.getElementById("planardie");

    if (rand == 1) {
        dieDiv.src = "assets/header/chaos.svg";
    }
    if (rand >= 2 && rand <= 5) {
        dieDiv.src = "assets/header/blank.svg";
    }
    if (rand == 6) {
        dieDiv.src = "assets/header/planeswalk.svg";
    }
}


/*
 * Returns true if on corner of the grid
 */
function isDiagonal(indices) {
    var row = indices[0],
        col = indices[1];
    return (row == 0 && col == 0) || (row == 0 && col == 2) || (row == 2 && col == 0) || (row == 2 && col == 2); 
}