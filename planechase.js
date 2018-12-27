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
const COUNTER_PLANES = [15, 22, 35, 71]         // Planes that need counters
const CHAOS_PLANES = [62, 80]                   // Planes that have chaos abilities that need to be handled
const COIN_PLANES = [82]                        // Planes that need coin flips


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
 * Returns true if on corner of the grid
 */
function isDiagonal(indices) {
    var row = indices[0],
        col = indices[1];
    return (row == 0 && col == 0) || (row == 0 && col == 2) || (row == 2 && col == 0) || (row == 2 && col == 2); 
}


/*
 * Displays the focus plane with the extra display below it (counters)
 */
function displayUniquePlanes(indices) {

    var row = indices[0],
        col = indices[1];
    var card = grid[row][col];

    // For testing the chaos stuff
//     var chaosContainer = document.querySelector(".chaos-container");
//     chaosContainer.style.display = "flex";
//     chaosContainer.classList.remove("animate-fadeOut");
//     chaosContainer.classList.add("animate-fadeIn"); 
//     return;

    if (row == 1 && col == 1) {
        // Plane needs to display counter
        if (COUNTER_PLANES.includes(card)) {

            var counterContainer = document.querySelector(".counter-container");
            counterContainer.style.display = "flex";
    
            var counterImg = document.querySelector(".counter-img").getElementsByTagName("img")[0];
            // Aretopolis --> scroll counters
            if (card == 15) {
                counterImg = "assets/game/scroll-counter.svg";
            }
            // Kilnspire District --> charge counter
            else if (card == 22) {
                counterImg.src = "assets/game/charge-counter.svg"; 
            }
            // Mount Keralia --> pressure counter
            else if (card == 35) {
                counterImg.src = "assets/game/pressure-counter.svg"; 
            }
            // Naar Isle --> flame counter
            else if (card == 71) {
                counterImg.src = "assets/game/flame-counter.svg"; 
            }

            counterContainer.classList.remove("animate-fadeOut");
            counterContainer.classList.add("animate-fadeIn");
        }

        // Plane has unique chaos trigger
        else if (CHAOS_PLANES.includes(card)) {
            var chaosContainer = document.querySelector(".chaos-container");
            chaosContainer.style.display = "flex";
            chaosContainer.classList.remove("animate-fadeOut");
            chaosContainer.classList.add("animate-fadeIn"); 
        }

        // Plane has coin flip 
        else if (COIN_PLANES.includes(card)) {
            var coinflipContainer = document.querySelector(".coinflip-container");
            coinflipContainer.style.display = "flex";
            coinflipContainer.classList.remove("animate-fadeOut");
            coinflipContainer.classList.add("animate-fadeIn"); 
        }
    }
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

    // Handle displays for unique planes (counters, etc)
    displayUniquePlanes(indices);

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
    var uniquePlanes = document.querySelectorAll(".uniqueplane");
    

    // Animates fadeOuts of clickable background, plane image, and planeswalk button
    background.classList.remove("animate-fadeIn");
    background.classList.add("animate-fadeOut");

    focusPlane.classList.remove("animate-fadeIn");
    focusPlane.classList.add("animate-fadeOut");

    planeswalkButton.classList.remove("animate-fadeIn");
    planeswalkButton.classList.add("animate-fadeOut"); 

    uniquePlanes.forEach(function(d) {
        d.classList.remove("animate-fadeIn");
        d.classList.add("animate-fadeOut"); 
    })

    setTimeout(function() {
        background.style.display = "none";
        focusPlane.style.display = "none";
        planeswalkButton.style.display = "none";
        uniquePlanes.forEach(function(d) {
            d.style.display = "none";
        })
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

    // Reset counters and coin flips (unique planes)
    var counterDiv = document.getElementById("curr-plane-counter");
    counterDiv.innerHTML = 0; 
    var coinDiv = document.getElementById("coinflip-result").getElementsByTagName("img")[0];
    coinDiv.src = "assets/game/coin-blank.svg";

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
 * Updates the counter display within focus plane to add a counter 
 */
function addCounter() {
    var counterDiv = document.getElementById("curr-plane-counter");
    var currCounters = parseInt(counterDiv.innerHTML, 10);
    currCounters += 1;
    counterDiv.innerHTML = currCounters;
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
    else if (rand >= 2 && rand <= 5) {
        dieDiv.src = "assets/header/blank.svg";
    }
    else if (rand == 6) {
        dieDiv.src = "assets/header/planeswalk.svg";
    }
}


/*
 * Simulates a coin flip and updates focus div to display the result
 */
function flipCoin() {
    var rand = Math.floor(Math.random() * 2) + 1;     // generate random die roll between 1 and 2
    var coinDiv = document.getElementById("coinflip-result").getElementsByTagName("img")[0];

    if (rand == 1) {
        coinDiv.src = "assets/game/coin-heads.svg";
    }
    if (rand == 2) {
        coinDiv.src = "assets/game/coin-tails.svg";
    }
}


/*
 *
 */
function chaosRolled() {
    var card = grid[1][1];

    // Pools of Becoming
    if (card == 62) {
        console.log("pools of becoming chaos")
    }

    // Stairs to Infinity
    else if (card == 80) {
        console.log("stairs to infinity chaos")
    }
}


/*
 * Opens the menu to allow user to quit game
 */
function openMenu() {

    var background = document.querySelector(".mainmenu-background");
    background.style.display = "inline";
    background.classList.remove("animate-fadeOut");
    background.classList.add("animate-fadeIn"); 


    var menuContainer = document.querySelector(".mainmenu-container");
    menuContainer.style.display = "flex";
    menuContainer.classList.remove("animate-fadeOut");
    menuContainer.classList.add("animate-fadeIn"); 
}


/*
 * Goes back to the main menu if quit == true
 * Otherwise, returns to the game
 */
function quitGame(quit) {

    if (quit) {

        // Fade out entire page
        document.querySelector("body").classList.add("animate-fadeOut");

        setTimeout(function() {
            window.location = "index.html"; 
        }, TRANSITION_DURATION);

    } else {

        var background = document.querySelector(".mainmenu-background");
        background.classList.remove("animate-fadeOut");
        background.classList.add("animate-fadeIn"); 
        
        var menuContainer = document.querySelector(".mainmenu-container");
        menuContainer.classList.remove("animate-fadeIn");
        menuContainer.classList.add("animate-fadeOut"); 

        var yesButton = document.querySelector(".mainmenu-option.yes");
        var noButton = document.querySelector(".mainmenu-option.no");

        // Get rid of hover animations
        yesButton.onmouseout = null;
        yesButton.onmouseover = null;
        noButton.onmouseout = null;
        noButton.onmouseover = null;

        // Remove display
        setTimeout(function() {
            menuContainer.style.display = "none";
            background.style.display = "none";
        }, TRANSITION_DURATION);
    }
}