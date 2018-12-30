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
const TRANSITION_DURATION = 1000;                   // All animations
const LOADING_DURATION = 2500;                      // Initial loading gif duration
const PHENOMENA = [9, 27, 40, 43, 53, 58, 65, 81];  // Keep track of phenomena image indices
const SPATIAL_MERGING = 6;                          // Keep track of Spatial Merging image index
const COUNTER_PLANES = [3, 33, 41, 44]              // Planes that need counters
const CHAOS_PLANES = [54, 66]                       // Planes that have chaos abilities that need to be handled
const COIN_PLANES = [39]                            // Planes that need coin flips
const REVEALED_PLANES = []                          // Keep track of currently revealed planes


var deck = [];        
var grid = [            // Current plane will be index 4 of the grid, always recenter
    [-1, -1, -1],
    [-1, -1, -1],
    [-1, -1, -1]
];
var currFocus;          // Current zoomed in card
var emptyCells = [];    // Cells in grid that need to be filled


/*
 * Highlight element
 */
function on_mouseover(elem) {
    // Remove other animations
    elem.classList.remove("animate-fadeIn");
    elem.classList.remove("animate-fadeOut");
    elem.style.opacity = 0.5;
}


/*
 * Dehighlight element
 */
function on_mouseout(elem) {
    elem.style.opacity = 1.0;
}


/*
 * Change opacity on click
 */
function on_mousedown(elem) {
    elem.style.opacity = 1.0;
}


/*
 * Change opacity on click
 */
function on_mouseup(elem) {
    elem.style.opacity = 0.5;
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

    if (row == 1 && col == 1) {
        // Plane needs to display counter
        if (COUNTER_PLANES.includes(card)) {

            var counterContainer = document.querySelector(".counter-container");
            counterContainer.style.display = "flex";
    
            var counterImg = document.querySelector(".counter-img").getElementsByTagName("img")[0];
            // Aretopolis --> scroll counters
            if (card == 3) {
                counterImg = "assets/game/scroll-counter.svg";
            }
            // Kilnspire District --> charge counter
            else if (card == 33) {
                counterImg.src = "assets/game/charge-counter.svg"; 
            }
            // Mount Keralia --> pressure counter
            else if (card == 41) {
                counterImg.src = "assets/game/pressure-counter.svg"; 
            }
            // Naar Isle --> flame counter
            else if (card == 44) {
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
    removeFocusPlane();
    fadeOutCards();
    document.querySelector(".startBackground").style.display = "inline";

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

        grid = temp;
        emptyCells = [];

        // Get new cards from deck
        if (temp[1][1] == -1) {
            emptyCells.push([1, 1]);
        }
        if (temp[0][1] == -1){
            emptyCells.push([0, 1]);
        }
        if (temp[1][0] == -1){
            emptyCells.push([1, 0]);
        }
        if (temp[1][2] == -1){
            emptyCells.push([1, 2]);
        }
        if (temp[2][1] == -1){
            emptyCells.push([2, 1]);
        }

        drawCard(false);
  
    }, TRANSITION_DURATION);
}


/*
 * Draws the board according to the grid
 * @Params: 
 * wait -- true if rendering should wait for images to load longer (initial game setup)
 */
function renderBoard() {
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

    // Wait for images to load, then fade them in and remove loading gif and background
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

        // Automatically show close-up of card
        setTimeout(function() {
            focusPlane([1, 1]);
        }, TRANSITION_DURATION);
        
    }, 50);
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
        dealCards();

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
 * Sets up the game with the 5 starting planes in a cross 
 */
function dealCards() {
    var loadingGif = document.querySelector(".loading-gif");
    loadingGif.style.display = "inline";
    loadingGif.classList.add("animate-fadeIn");

    var startBackground = document.querySelector(".startBackground");
    startBackground.style.display = "inline";
    startBackground.classList.add("animate-fadeIn"); 

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
        emptyCells = [
            [0, 1], 
            [1, 0], 
            [1, 1], 
            [1, 2], 
            [2, 1]
        ];

        drawCard(false);
    }

    // Allow loading animation to give illusion of shuffling deck
    setTimeout(function() {
        deck = shuffle(deck);
        playInitialCards(deck); 
    }, LOADING_DURATION);
}

/*
 * Simulates drawing a card from the planar deck
 * Handles encountering phenomena
 */
function drawCard(removePhenomena) {
    if (removePhenomena) {
        var fullBackground = document.querySelector(".full-background");
        var focusPlane = document.querySelector(".focusPlane");
        var okButton = document.querySelector(".okButton");
        
        focusPlane.classList.remove("animate-fadeIn");
        focusPlane.classList.add("animate-fadeOut");

        fullBackground.classList.remove("animate-fadeIn");
        fullBackground.classList.add("animate-fadeOut");
    
        okButton.classList.remove("animate-fadeIn");
        okButton.classList.add("animate-fadeOut");

        setTimeout(function() {
            focusPlane.style.display = "none";
            fullBackground.style.display = "none";
            okButton.style.display = "none";
        }, TRANSITION_DURATION)
    }

    // Render board when no more cards to draw
    if (emptyCells.length == 0) {

        renderBoard();
        return;
    }

    // Draw a card to populate empty cell
    var card = deck.shift();

    // If phenomena, handle that 
    if (PHENOMENA.includes(card)) {
        if (showPhenomenon) {
            setTimeout(function() {
                showPhenomenon(card);
            }, TRANSITION_DURATION)
        } else {
            showPhenomenon(card);
        }

    // Regular plane, fill grid slot and recurse if needed
    } else {
        var indices = emptyCells.shift();
        grid[indices[0]][indices[1]] = card;
        
        // Recurse
        drawCard(removePhenomena);
    }
}


/*
 * Displays the phenomenon card in the center of the display
 * Only allows for the user to click out by clicking OK button
 */ 
function showPhenomenon(card) {

    // var background = document.querySelector(".focusPlaneBackground");
    var focusPlane = document.querySelector(".focusPlane");
    var okButton = document.querySelector(".okButton");
    var loadingGif = document.querySelector(".loading-gif");
    var fullBackground = document.querySelector(".full-background");

    // background.style.display = "inline";
    fullBackground.style.display = "inline";
    focusPlane.style.display = "flex"; 
    okButton.style.display = "flex";

    // Set image for focus
    var imageName = "assets/planes/" + card + ".png";
    focusPlane.getElementsByTagName("img")[0].src = imageName; 

    // Animate fadeIns of clickable background, phenomenon image, and OK button
    fullBackground.classList.remove("animate-fadeOut");
    fullBackground.classList.add("animate-fadeIn");

    focusPlane.classList.remove("animate-fadeOut");
    focusPlane.classList.add("animate-fadeIn");

    okButton.classList.remove("animate-fadeOut");
    okButton.classList.add("animate-fadeIn");

    loadingGif.classList.remove("animate-fadeIn");
    loadingGif.classList.add("animate-fadeOut");

    setTimeout(function() {
        loadingGif.style.display = "none";
    }, TRANSITION_DURATION)
}


/*
 * Animates the fadeOut of all cards
 * Usage: Whenever changing the cards that are in play (restart game, planeswalk, etc)
 */
function fadeOutCards() {
    var cells = document.querySelectorAll(".cell");

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

    // Animate change
    lifeDiv.style.opacity = 0;
    setTimeout(function() {
        lifeDiv.innerHTML = life;
        lifeDiv.style.opacity = 1;
    })
}

/*
 * Updates the counter display within focus plane to add a counter 
 */
function addCounter() {
    var counterDiv = document.getElementById("curr-plane-counter");
    var currCounters = parseInt(counterDiv.innerHTML, 10);
    currCounters += 1;

    // Animate change
    counterDiv.style.opacity = 0;
    setTimeout(function() {
        counterDiv.innerHTML = currCounters;
        counterDiv.style.opacity = 1;
    }, 100);
}


/*
 * Simulates rolling the planar die and updates header display
 */
function rollDie() {
    var rand = Math.floor(Math.random() * 6) + 1;     // generate random die roll between 1 and 6
    var dieDiv = document.getElementById("planardie");
    
    // Animate change
    dieDiv.style.opacity = 0;
    setTimeout(function() {
        if (rand == 1) {
            dieDiv.src = "assets/header/chaos.svg";
        }
        else if (rand >= 2 && rand <= 5) {
            dieDiv.src = "assets/header/blank.svg";
        }
        else if (rand == 6) {
            dieDiv.src = "assets/header/planeswalk.svg";
        }
        dieDiv.style.opacity = 1; 
    }, 100);
}


/*
 * Simulates a coin flip and updates focus div to display the result
 */
function flipCoin() {
    var rand = Math.floor(Math.random() * 2) + 1;     // generate random die roll between 1 and 2
    var coinDiv = document.getElementById("coinflip-result").getElementsByTagName("img")[0];
    
    // Animate change
    coinDiv.style.opacity = 0;
    setTimeout(function() {
        if (rand == 1) {
            coinDiv.src = "assets/game/coin-heads.svg";
        }
        if (rand == 2) {
            coinDiv.src = "assets/game/coin-tails.svg";
        }
        coinDiv.style.opacity = 1; 
    }, 100);
}


/*
 * Handles when chaos is rolled on certain unique planes (Pools of Becoming, Stairs to Infinity)
 */
function chaosRolled() {
    chaosContainer = document.querySelector(".chaos-container");
    chaosContainer.onmouseover = null;
    chaosContainer.onmouseout = null;
    on_mouseout(chaosContainer);
    chaosContainer.setAttribute('onmouseover', "on_mouseover(this)");
    chaosContainer.setAttribute('onmouseout', "on_mouseout(this)");
    var card = grid[1][1];

    // Pools of Becoming
    if (card == 62) {
        REVEALED_PLANES.push(deck.shift());
        REVEALED_PLANES.push(deck.shift());
        REVEALED_PLANES.push(deck.shift());

        displayPoolsOfBecoming();
    }

    // Stairs to Infinity
    else if (card == 80) {
        displayStairsToInfinity();
    }
}


/*
 * Allows user to click through the top 3 cards of the planar deck and trigger chaos abilities of those
 */
function displayPoolsOfBecoming() {

    var background = document.querySelector(".uniqueFocusPlaneBackground");
    var focusPlane = document.querySelector(".uniqueFocusPlane");
    var okButton = document.querySelector(".poolsOfBecomingOKButton");

    // Fade in first plane
    if (REVEALED_PLANES.length == 3) {

        // Set image for focus
        var imageName;
        var card = REVEALED_PLANES.shift();
        deck.push(card);    // Put back on bottom

        // Display top card of deck
        imageName = "assets/planes/" + card + ".png";
        document.querySelector(".uniqueFocusPlaneImage").src = imageName; 

        // Animate fadeIns of plane image and top/bottom options
        background.style.display = "flex";
        background.classList.remove("animate-fadeOut");
        background.classList.add("animate-fadeIn");
        focusPlane.style.display = "flex";
        focusPlane.classList.remove("animate-fadeOut");
        focusPlane.classList.add("animate-fadeIn");
        okButton.style.display = "flex";
        okButton.classList.remove("animate-fadeOut");
        okButton.classList.add("animate-fadeIn");
    }

    // Have to fade out past plane before fading in current plane (2nd and 3rd planes)
    else if (REVEALED_PLANES.length > 0) {

        // Fade them out
        focusPlane.classList.remove("animate-fadeIn");
        focusPlane.classList.add("animate-fadeOut");
        okButton.classList.remove("animate-fadeIn");
        okButton.classList.add("animate-fadeOut"); 

        // Fade in new plane
        setTimeout(function() {
            // Set image for focus
            var imageName;
            var card = REVEALED_PLANES.shift();
            deck.push(card);    // Put back on bottom

            // Display top card of deck
            imageName = "assets/planes/" + card + ".png";
            document.querySelector(".uniqueFocusPlaneImage").src = imageName; 
        
            // Animate fadeIns of plane image and ok button
            focusPlane.classList.remove("animate-fadeOut");
            focusPlane.classList.add("animate-fadeIn");
            okButton.classList.remove("animate-fadeOut");
            okButton.classList.add("animate-fadeIn");
        }, TRANSITION_DURATION);

    // Fade out final plane
    } else {
        
        background.classList.remove("animate-fadeIn");
        background.classList.add("animate-fadeOut");
        focusPlane.classList.remove("animate-fadeIn");
        focusPlane.classList.add("animate-fadeOut");
        okButton.classList.remove("animate-fadeIn");
        okButton.classList.add("animate-fadeOut");  

        setTimeout(function() {
            background.style.display = "none";
            focusPlane.style.display = "none";
            okButton.style.display = "none";

        }, TRANSITION_DURATION);
    }
}


/*
 * Displays the Stairs to Infinity options
 */
function displayStairsToInfinity() {

    var background = document.querySelector(".uniqueFocusPlaneBackground");
    var focusPlane = document.querySelector(".uniqueFocusPlane");
    var topbottomContainer = document.querySelector(".top-bottom-container");

    // Set image for focus
    var imageName;
    var card = deck.shift();
    REVEALED_PLANES.push(card);

    // Display top card of deck
    imageName = "assets/planes/" + card + ".png";
    document.querySelector(".uniqueFocusPlaneImage").src = imageName; 

    // Animate fadeIns of plane image and top/bottom options
    background.style.display = "flex";
    background.classList.remove("animate-fadeOut");
    background.classList.add("animate-fadeIn");
    focusPlane.style.display = "flex";
    focusPlane.classList.remove("animate-fadeOut");
    focusPlane.classList.add("animate-fadeIn");
    topbottomContainer.style.display = "flex";
    topbottomContainer.classList.remove("animate-fadeOut");
    topbottomContainer.classList.add("animate-fadeIn");
}


/* 
 * Removes the Stairs to Infinity options and puts the plane on the top/bottom of the deck
 */
function removeStairsToInfinity(top) {
    var background = document.querySelector(".uniqueFocusPlaneBackground");
    var focusPlane = document.querySelector(".uniqueFocusPlane");
    var topbottomContainer = document.querySelector(".top-bottom-container"); 
  
    // Fade out plane image and top/bottom options
    background.classList.remove("animate-fadeIn");
    background.classList.add("animate-fadeOut");
    focusPlane.classList.remove("animate-fadeIn");
    focusPlane.classList.add("animate-fadeOut");
    topbottomContainer.classList.remove("animate-fadeIn");
    topbottomContainer.classList.add("animate-fadeOut");

    // Remove from display
    setTimeout(function() {
        background.style.display = "none";
        focusPlane.style.display = "none"; 
        topbottomContainer.style.display = "none";
    }, TRANSITION_DURATION);

    // Re-adds the plane to the deck at the top/bottom
    if (top) {
        deck.unshift(REVEALED_PLANES.shift());
    } else {
        deck.push(REVEALED_PLANES.shift());
    }
}


/*
 * Opens the menu to allow user to quit game
 */
function openMenu(action) {

    var prompt = document.querySelector(".mainmenu-prompt");
    var yes = document.querySelector(".mainmenu-option.yes");

    if (action == "restart") {
        prompt.innerHTML = "Are you sure you want to restart?";
        yes.setAttribute("onclick", "quitGame(false)");

    } else if (action == "quit") {
        prompt.innerHTML = "Are you sure you want to quit?"; 
        yes.setAttribute("onclick", "quitGame(true)");
    }

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

    // Quit game
    if (quit) {

        // Fade out entire page
        document.querySelector("body").classList.add("animate-fadeOut");

        setTimeout(function() {
            window.location = "index.html"; 
        }, TRANSITION_DURATION);

    // Restart game
    } else {

        removeFocusPlane();
        fadeOutCards();
        removeMainMenu();

        // Reset life totals
        var lifeTotals = document.querySelectorAll(".life");
        lifeTotals.forEach(function(d) {
            d.innerHTML = 20;
        })

        // Reset grid
        grid = [
            [-1, -1, -1],
            [-1, -1, -1],
            [-1, -1, -1]
        ];
    
        setTimeout(function() {
            dealCards();
        }, TRANSITION_DURATION)
    }
}


/*
 * Removes main menu from the display
 */
function removeMainMenu() {
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